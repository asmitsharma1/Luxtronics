import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// ── Environment Setup ────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with priority: .env.production > .env.local > .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local'), override: true });
dotenv.config({ path: path.join(__dirname, '.env.production'), override: true });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// ── WooCommerce Config ───────────────────────────────────────────────────────
const wooUrl    = () => process.env.VITE_WOOCOMMERCE_URL    || '';
const wooKey    = () => process.env.VITE_WOOCOMMERCE_KEY    || '';
const wooSecret = () => process.env.VITE_WOOCOMMERCE_SECRET || '';

function wooAuth() {
  const k = wooKey(), s = wooSecret();
  if (!k || !s) return '';
  return 'Basic ' + Buffer.from(`${k}:${s}`).toString('base64');
}

// ── Express Middleware ───────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({ 
  origin: corsOrigins.includes('*') ? true : corsOrigins, 
  credentials: true 
}));

// ── API Routes (WooCommerce Proxy) ───────────────────────────────────────────

// Helper for fetching from WooCommerce
async function fetchWoo(endpoint, options = {}) {
  const url = `${wooUrl()}/wp-json/wc/v3/${endpoint}`;
  const auth = wooAuth();
  if (!auth) throw new Error('WooCommerce credentials missing');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': auth,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WooCommerce Error (${response.status}): ${text}`);
  }
  
  return { 
    data: await response.json(), 
    headers: response.headers 
  };
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const { page = '1', per_page = '50', category, search, slug } = req.query;
    const params = new URLSearchParams({ page, per_page, status: 'publish' });
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (slug) params.append('slug', slug);

    const { data, headers } = await fetchWoo(`products?${params}`);
    
    // Add pagination info to response
    res.json({
      success: true,
      data,
      pagination: {
        total: parseInt(headers.get('X-WP-Total') || '0'),
        totalPages: parseInt(headers.get('X-WP-TotalPages') || '0')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const { page = '1', per_page = '100' } = req.query;
    const params = new URLSearchParams({ page, per_page, hide_empty: 'false' });
    const { data } = await fetchWoo(`products/categories?${params}`);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order API
app.post('/api/orders', async (req, res) => {
  try {
    const { data } = await fetchWoo('orders', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Static File Serving (Frontend) ───────────────────────────────────────────

// Priority list for finding the build folder
const buildPath = [
  path.join(__dirname, 'build'),
  path.join(__dirname, 'dist'),
].find(p => existsSync(path.join(p, 'index.html')));

if (buildPath) {
  console.log(`✅ Serving production build from: ${buildPath}`);
  
  // 1. Assets (JS, CSS, Images) - Long cache is safe due to Vite's predictable names
  // (We use immutable for assets folder specifically)
  app.use('/assets', express.static(path.join(buildPath, 'assets'), {
    maxAge: '1y',
    immutable: true,
    index: false
  }));

  // 2. Other static files (favicon, etc) - 1 hour cache
  app.use(express.static(buildPath, {
    maxAge: '1h',
    index: false
  }));

  // 3. SPA Fallback (index.html) - NO CACHE to ensure users always get fresh asset links
  app.get('*', (req, res) => {
    // Skip API and non-GET requests
    if (req.path.startsWith('/api') || req.path === '/health' || req.method !== 'GET') {
      return res.status(404).json({ error: 'Not Found' });
    }
    
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('⚠️  No production build found. Start in dev mode or run npm run build.');
  app.get('*', (req, res) => {
    res.status(404).send('Backend is running, but frontend build was not found.');
  });
}

// ── Error Handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Luxtronics Server ready on port ${port}`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
});

process.on('uncaughtException', (err) => console.error('🔥 Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('🔥 Unhandled Rejection:', reason));