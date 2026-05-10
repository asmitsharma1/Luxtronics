import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync, readdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// ── ERROR LOGGING ────────────────────────────────────────────────────────────
function logCrash(err) {
  const msg = `${new Date().toISOString()} - CRASH: ${err.stack || err}\n`;
  try { writeFileSync('crash.log', msg, { flag: 'a' }); } catch (e) {}
  console.error(msg);
}

process.on('uncaughtException', logCrash);
process.on('unhandledRejection', logCrash);

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  dotenv.config({ path: path.join(__dirname, '.env') });

  const app = express();
  // Ensure port is a valid number
  const portInput = process.env.PORT || '3001';
  const port = /^\d+$/.test(portInput) ? parseInt(portInput, 10) : 3001;

  app.use(cors());
  app.use(express.json());

  // Dynamic Build Resolver
  function findBuildDir() {
    const searchPaths = [
      path.join(__dirname, 'build'),
      path.join(process.cwd(), 'build'),
      path.join(__dirname, 'dist'),
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, 'hostinger-deploy'),
    ];
    return searchPaths.find(p => existsSync(path.join(p, 'index.html')));
  }

  const BUILD_DIR = findBuildDir();

  // DEBUG ROUTE
  app.get('/debug', (req, res) => {
    let files = [];
    try { files = readdirSync(__dirname); } catch (e) {}
    res.json({
      ok: true,
      cwd: process.cwd(),
      dirname: __dirname,
      build: BUILD_DIR,
      files,
      env: Object.keys(process.env).filter(k => k.startsWith('VITE_') || k === 'PORT')
    });
  });

  // HEALTH
  app.get('/health', (req, res) => res.send('OK'));

  // PROXY
  app.get('/api/products', async (req, res) => {
    try {
      const wooUrl = process.env.VITE_WOOCOMMERCE_URL;
      const wooKey = process.env.VITE_WOOCOMMERCE_KEY;
      const wooSec = process.env.VITE_WOOCOMMERCE_SECRET;
      const auth = 'Basic ' + Buffer.from(`${wooKey}:${wooSec}`).toString('base64');
      const r = await fetch(`${wooUrl}/wp-json/wc/v3/products`, { headers: { 'Authorization': auth } });
      res.json(await r.json());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // SERVING
  if (BUILD_DIR) {
    app.use('/assets', express.static(path.join(BUILD_DIR, 'assets'), { maxAge: '1y' }));
    app.use(express.static(BUILD_DIR));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api') || req.path === '/debug') return res.status(404).end();
      res.sendFile(path.join(BUILD_DIR, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => res.status(503).send('Build not found. Check /debug'));
  }

  app.listen(port, () => console.log(`Server started on ${port}`));

} catch (err) {
  logCrash(err);
  // Keep process alive so we can maybe see the log
  setTimeout(() => {}, 1000000);
}