import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

function findBuildDir() {
  const searchPaths = [
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'build'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'dist'),
  ];
  return searchPaths.find(p => existsSync(path.join(p, 'index.html')));
}

const BUILD_DIR = findBuildDir();

// ── DATA NORMALIZATION (Crucial for frontend) ────────────────────────────────
function normalizeProduct(p) {
  if (!p) return null;
  const regularPrice = parseFloat(p.regular_price || p.price || '0');
  const salePrice = p.sale_price ? parseFloat(p.sale_price) : undefined;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || '',
    shortDescription: p.short_description || '',
    price: salePrice ?? regularPrice,
    regularPrice,
    salePrice,
    images: (p.images || []).map(img => ({ id: img.id, src: img.src, alt: img.alt || '' })),
    category: p.categories?.[0]?.name || 'Uncategorized',
    stockStatus: p.stock_status || 'instock',
    rating: parseFloat(p.average_rating || 0),
    reviewCount: p.rating_count || 0,
    attributes: p.attributes?.map(attr => ({
      name: attr.name,
      options: Array.isArray(attr.options) ? attr.options : [],
    })),
  };
}

app.use(cors());
app.use(express.json());

// ── DEBUG ───────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  let assets = [];
  try { assets = readdirSync(path.join(BUILD_DIR, 'assets')); } catch (e) {}
  
  let indexContent = '';
  try { indexContent = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8').substring(0, 1000); } catch (e) {}

  res.json({
    ok: true,
    build: BUILD_DIR,
    assets: assets.filter(a => !a.startsWith('.')),
    indexHasFixedJS: indexContent.includes('index.js'),
    indexHasFixedCSS: indexContent.includes('index.css'),
    env: {
      WOO_URL: process.env.VITE_WOOCOMMERCE_URL,
      WOO_KEY_SET: !!process.env.VITE_WOOCOMMERCE_KEY,
      NODE_ENV: process.env.NODE_ENV
    }
  });
});

// ── API ─────────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const wooUrl = process.env.VITE_WOOCOMMERCE_URL;
    const wooKey = process.env.VITE_WOOCOMMERCE_KEY;
    const wooSec = process.env.VITE_WOOCOMMERCE_SECRET;
    const auth = 'Basic ' + Buffer.from(`${wooKey}:${wooSec}`).toString('base64');
    
    const params = new URLSearchParams(req.query);
    const r = await fetch(`${wooUrl}/wp-json/wc/v3/products?${params}`, {
      headers: { 'Authorization': auth }
    });
    
    if (!r.ok) throw new Error(`Woo Status: ${r.status}`);
    const items = await r.json();
    res.json({ success: true, data: items.map(normalizeProduct) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── SERVING ──────────────────────────────────────────────────────────────────
if (BUILD_DIR) {
  // Static assets with immutable caching
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), {
    maxAge: '1y',
    immutable: true,
    fallthrough: false // Don't fall through to index.html if asset missing!
  }));

  app.use(express.static(BUILD_DIR, { maxAge: '1h' }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
    
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => res.status(503).send('Build not found. Check /debug'));
}

app.listen(port, () => console.log(`Server started on ${port}`));