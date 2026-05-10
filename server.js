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

const BUILD_DIR = path.join(__dirname, 'prod-build-final');

app.use(cors());
app.use(express.json());

// ─── DEBUG ───────────────────────────────────────────────────────────────────
app.get('/debug', (req, res) => {
  let indexHtml = 'NOT FOUND';
  let assets = [];

  try {
    indexHtml = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
  } catch (e) {
    indexHtml = `Error reading index.html: ${e.message}`;
  }

  try {
    assets = readdirSync(path.join(BUILD_DIR, 'assets'));
  } catch (e) {
    assets = [`Error reading assets dir: ${e.message}`];
  }

  res.send(`
    <html>
      <body style="font-family:monospace; background:#111; color:#eee; padding:20px;">
        <h1>🛠 Debug Info</h1>
        <p><strong>Build Dir:</strong> ${BUILD_DIR}</p>
        <p><strong>index.html exists:</strong> ${existsSync(path.join(BUILD_DIR, 'index.html'))}</p>
        <p><strong>Assets found (${assets.length}):</strong></p>
        <ul>${assets.map(a => `<li>${a}</li>`).join('')}</ul>
        <hr/>
        <h2>📄 index.html Content:</h2>
        <pre style="background:#000; padding:10px; border:1px solid #444; white-space:pre-wrap;">${indexHtml.replace(/</g, '&lt;')}</pre>
      </body>
    </html>
  `);
});

// ─── API ROUTES (add your API routes here) ───────────────────────────────────
// app.use('/api/...', yourRouter);

// ─── STATIC ASSETS ───────────────────────────────────────────────────────────
// Serve hashed assets with long-term cache (safe because filenames change on rebuild)
app.use(
  '/assets',
  express.static(path.join(BUILD_DIR, 'assets'), {
    maxAge: '1y',
    immutable: true,
    fallthrough: false, // return 404 immediately if asset not found
  })
);

// Serve other static files (favicon, robots.txt, etc.)
app.use(
  express.static(BUILD_DIR, {
    index: false,       // don't auto-serve index.html here, we handle it below
    maxAge: '1d',
    fallthrough: true,
  })
);

// ─── SPA FALLBACK ─────────────────────────────────────────────────────────────
if (existsSync(path.join(BUILD_DIR, 'index.html'))) {
  app.get('*', (req, res) => {
    // Let API and debug routes fall through to their own handlers
    if (req.path.startsWith('/api') || req.path === '/debug') {
      return res.status(404).json({ error: 'Not found' });
    }

    // Any unmatched asset request = 404 (don't serve index.html for missing JS/CSS)
    if (req.path.startsWith('/assets/')) {
      return res.status(404).end();
    }

    try {
      const html = readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');

      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        // Never cache the HTML shell — assets are cache-busted by Vite's hashed filenames
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });

      res.send(html);
    } catch (e) {
      console.error('Failed to read index.html:', e);
      res.status(500).send('Internal server error: could not read index.html');
    }
  });
} else {
  // Build directory or index.html is missing
  app.get('*', (req, res) => {
    res.status(503).send(`
      <html>
        <body style="font-family:monospace; background:#111; color:#f66; padding:20px;">
          <h1>⚠️ Build not found</h1>
          <p><strong>Expected:</strong> ${BUILD_DIR}/index.html</p>
          <p>Upload your Vite build output to <code>prod-build-final/</code> and restart.</p>
          <p><a href="/debug" style="color:#6af;">→ Open /debug for details</a></p>
        </body>
      </html>
    `);
  });
}

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📁 Serving from: ${BUILD_DIR}`);
  console.log(`🔍 Debug info:   http://localhost:${port}/debug`);
  console.log(`   Build exists: ${existsSync(path.join(BUILD_DIR, 'index.html'))}`);
});