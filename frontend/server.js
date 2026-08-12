'use strict';
/**
 * Serves the built site in production.
 *
 * This replaces `npx serve -s dist`, which sent no Content-Encoding and no
 * Cache-Control at all: the 1.4 MB JS bundle went out uncompressed, and a
 * returning visitor re-downloaded every byte of the page. Two headers fix both.
 *
 *   compression()  — gzip on the way out. The bundle is ~1.4 MB raw, ~390 KB
 *                    gzipped. Images are already compressed; skipping them
 *                    avoids spending CPU to make them very slightly larger.
 *
 *   Cache-Control  — Vite fingerprints everything in /assets (index-a1b2c3.js),
 *                    so those filenames can never mean different bytes and are
 *                    safe to cache for a year as immutable. Everything else —
 *                    and index.html above all — must not be cached, or a deploy
 *                    lands and nobody sees it until their cache expires.
 */
const path        = require('path');
const express     = require('express');
const compression = require('compression');

const app  = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

const YEAR = 365 * 24 * 60 * 60;

app.disable('x-powered-by');
app.use(compression());

// Fingerprinted build output — safe to keep forever.
app.use('/assets', express.static(path.join(DIST, 'assets'), {
  maxAge: YEAR * 1000,
  immutable: true,
  index: false,
}));

// Everything else in public/ (images, video, favicon). These keep their names
// across deploys, so a day is the compromise: fast repeat visits, and a
// replaced image is picked up the next day without a rename.
app.use(express.static(DIST, {
  maxAge: 24 * 60 * 60 * 1000,
  index: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

// A request that looks like a file but reached this far is a genuine 404. Say
// so. `serve -s` answered 200 with the HTML shell for every missing asset,
// which meant a mistyped or stale bundle URL looked like a hit — you cannot
// tell a deployed build from a missing one when both return 200, and a broken
// <img> silently renders a page of HTML as image bytes.
const LOOKS_LIKE_A_FILE = /\.(js|mjs|css|map|png|jpe?g|webp|gif|svg|ico|mp4|webm|woff2?|ttf|eot|json|txt|xml|pdf)$/i;

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/assets/') || LOOKS_LIKE_A_FILE.test(req.path)) return next();

  // Anything else is a client-side route, so hand back the shell. no-cache
  // means the browser revalidates every time, which is what makes a deploy
  // visible immediately rather than whenever caches happen to expire.
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(DIST, 'index.html'));
});

app.use((req, res) => res.status(404).type('text/plain').send('Not found'));

app.listen(PORT, () => console.log(`AstroVyoma frontend on :${PORT}`));
