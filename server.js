import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Dynamic Build Resolver
function getBuildDir() {
  const candidates = [
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'build'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'dist'),
  ];
  return candidates.find(c => existsSync(path.join(c, 'index.html')));
}

const BUILD_DIR = getBuildDir();

// WooCommerce Config
const wooUrl    = () => process.env.VITE_WOOCOMMERCE_URL || '';
const wooAuth    = () => {
  const k = process.env.VITE_WOOCOMMERCE_KEY;
  const s = process.env.VITE_WOOCOMMERCE_SECRET;
  if (!k || !s) return '';
  return 'Basic ' + Buffer.from(`${k}:${s}`).toString('base64');
};

// Data Normalizer
function normalizeProduct(p) {
  const price = parseFloat(p.price || '0');
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || '',
    shortDescription: p.short_description || '',
    price: price,
    regularPrice: parseFloat(p.regular_price || p.price || '0'),
    salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
    images: (p.images || []).map(img => ({ id: img.id, src: img.src, alt: img.alt || '' })),
    category: p.categories?.[0]?.name || 'Uncategorized',
    stockStatus: p.stock_status || 'instock',
  };
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', buildDir: BUILD_DIR, cwd: process.cwd(), files: readdirSync(__dirname).filter(f => !f.startsWith('.')) });
});

app.get('/api/products', async (req, res) => {
  try {
    const url = `${wooUrl()}/wp-json/wc/v3/products?${new URLSearchParams(req.query)}`;
    const response = await fetch(url, { headers: { 'Authorization': wooAuth() } });
    if (!response.ok) throw new Error(`Woo Error: ${response.status}`);
    const items = await response.json();
    res.json({ success: true, data: items.map(normalizeProduct) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serving
if (BUILD_DIR) {
  app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(BUILD_DIR, { maxAge: '1h' }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).end();
    res.set('Cache-Control', 'no-store');
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    const debug = { cwd: process.cwd(), dirname: __dirname, files: readdirSync(__dirname) };
    res.status(503).send(`<h1>Build Not Found</h1><pre>${JSON.stringify(debug, null, 2)}</pre>`);
  });
}

app.listen(port, () => console.log(`Server on ${port}`));