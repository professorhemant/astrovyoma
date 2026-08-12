#!/usr/bin/env node
'use strict';
/**
 * Converts every PNG in frontend/public to WebP, resizing the oversized ones on
 * the way, and deletes the PNG it replaced.
 *
 *   node tools/to-webp.js          # convert
 *   node tools/to-webp.js --dry    # show what it would do
 *
 * Why this exists: the homepage shipped 16.7 MB, and 89% of that was two PNGs
 * exported at print resolution — a 3168px hero displayed at 1440, a 2048px
 * mandala displayed as decoration. WebP at these caps is visually identical and
 * roughly 30x smaller.
 *
 * MAX_WIDTH caps the longest edge. A file not listed keeps its dimensions and is
 * only re-encoded, which is right for anything already small.
 *
 * NOT covered, deliberately: backend/assets/*.png. Those are embedded into the
 * generated PDFs and PDFKit reads PNG and JPEG only — a WebP there produces a
 * corrupt report, not an error.
 *
 * Anything referenced from the database (the pandit photo, the photographed
 * products) needs its stored path updated in the same change, or the image
 * 404s on a site that still looks fine locally.
 */
const fs   = require('fs');
const path = require('path');
const sharp = require(path.join(__dirname, '../backend/node_modules/sharp'));

const PUBLIC = path.join(__dirname, '../frontend/public');
const DRY    = process.argv.includes('--dry');

// Longest-edge caps. Chosen as ~1.5x the largest size each is actually displayed
// at, so they still hold up on a retina screen.
const MAX_WIDTH = {
  'hero-banner.png':        2200,  // full-bleed, ~1440 displayed
  'horoscope-hero.png':     1800,
  'kundali-hero.png':       1800,
  'kundali-page-hero.png':  1800,
  'numerology-hero.png':    1800,
  'tarot-hero.png':         1800,
  // Spins in the hero at 288px by default (mandalaSize, admin-adjustable), so
  // 800 is generous headroom on retina even if that setting is raised.
  'zodiac-mandala.png':      800,
  'vedic-clock-bg.png':     1200,
  'vedic-clock-gemini.png': 1200,
};

const QUALITY = 82;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.png$/i.test(name)) out.push(p);
  }
  return out;
}

(async () => {
  const files = walk(PUBLIC).sort();
  let before = 0, after = 0;

  for (const src of files) {
    const rel  = path.relative(PUBLIC, src);
    const dest = src.replace(/\.png$/i, '.webp');
    const cap  = MAX_WIDTH[path.basename(src)];

    const inBytes = fs.statSync(src).size;
    const meta    = await sharp(src).metadata();

    let pipeline = sharp(src);
    if (cap && meta.width > cap) pipeline = pipeline.resize({ width: cap, withoutEnlargement: true });
    const buf = await pipeline.webp({ quality: QUALITY, effort: 6 }).toBuffer();

    before += inBytes;
    after  += buf.length;

    const dims = cap && meta.width > cap ? `${meta.width}→${cap}px` : `${meta.width}px`;
    const pct  = Math.round((1 - buf.length / inBytes) * 100);
    console.log(
      `${DRY ? 'would write' : 'wrote'} ${rel.replace(/\.png$/, '.webp').padEnd(34)} ` +
      `${String(Math.round(inBytes / 1024)).padStart(6)}KB → ${String(Math.round(buf.length / 1024)).padStart(5)}KB ` +
      `(-${String(pct).padStart(2)}%)  ${dims}`
    );

    if (!DRY) {
      fs.writeFileSync(dest, buf);
      fs.unlinkSync(src);
    }
  }

  console.log('─'.repeat(78));
  console.log(
    `${files.length} images  ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB  ` +
    `(-${Math.round((1 - after / before) * 100)}%)${DRY ? '   [dry run, nothing written]' : ''}`
  );
})().catch(err => { console.error(err); process.exit(1); });
