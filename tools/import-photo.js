#!/usr/bin/env node
//
// Turns a supplied product photograph into a card image.
//
//   node tools/import-photo.js "~/Desktop/Sapt Mukhi.png" 7-mukhi-rudraksha
//
// Product photos arrive shot on a white sweep. Dropped straight onto a card
// that would be a white rectangle sitting on a coloured gradient, so the
// background is cut away first and the result written as a transparent PNG,
// matching how the drawn artwork behaves.
//
// The cut is a flood fill inward from the border rather than "delete every pale
// pixel", because a rudraksha has bright highlights on it and a plain threshold
// eats holes straight through the bead.

const fs = require('fs');
const path = require('path');
const sharp = require(path.join(__dirname, '..', 'backend', 'node_modules', 'sharp'));

const OUT = path.join(__dirname, '..', 'frontend', 'public', 'products');
const CANVAS = 512;      // generous, since these get displayed large on the product page
const PAD = 0.06;        // breathing room so nothing touches the edge

// How far from the corner colour still counts as background.
const TOLERANCE = 26;
// Some photos are shot with a soft grey drop shadow, which is too far from
// white for the tolerance above and survives as a halo. The shadow is grey —
// its channels are near-equal — while the bead is strongly orange, so anything
// pale AND colourless is background too, and the object is never at risk.
const NEUTRAL = 22;      // max channel spread that still counts as colourless
const LIGHT = 178;       // and how pale it has to be
// Pixels this close to the background colour, on the boundary, are faded rather
// than cut — it is what stops a hard white fringe round the object.
const FEATHER = 58;
// Between the sweep and the object sits a band of pale, washed-out pixels: too
// far from white for the flood fill, too colourless to be part of a brown bead.
// Left alone it prints as a white outline. These passes nibble it away from the
// outside in. A real rudraksha highlight is warm, so it has colour in it and
// survives the spread test.
const ERODE_PASSES = 5;
const PALE_MIN = 148;    // how light a pixel must be to be eligible
const PALE_SPREAD = 40;  // and how little colour it may carry

function expand(p) {
  return p.startsWith('~') ? path.join(process.env.HOME, p.slice(1)) : path.resolve(p);
}

async function run(src, code) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: CH } = info;
  const at = (x, y) => (y * W + x) * CH;

  // The background colour is whatever the four corners agree on.
  const corner = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].map(([x, y]) => {
    const i = at(x, y); return [data[i], data[i + 1], data[i + 2]];
  });
  const bg = [0, 1, 2].map(c => Math.round(corner.reduce((s, p) => s + p[c], 0) / corner.length));
  const dist = (i) => Math.max(
    Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));
  const isBg = (i) => {
    if (dist(i) <= TOLERANCE) return true;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) <= NEUTRAL && Math.min(r, g, b) >= LIGHT;
  };

  // Flood fill from every border pixel that looks like background.
  const out = Buffer.from(data);
  const seen = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const k = y * W + x;
    if (seen[k]) return;
    seen[k] = 1;
    if (isBg(at(x, y))) stack.push(k);
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  let cut = 0;
  while (stack.length) {
    const k = stack.pop();
    const x = k % W, y = (k / W) | 0;
    out[at(x, y) + 3] = 0;
    cut++;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  const isPale = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return Math.min(r, g, b) >= PALE_MIN && Math.max(r, g, b) - Math.min(r, g, b) <= PALE_SPREAD;
  };
  const touchesHole = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    return nx >= 0 && ny >= 0 && nx < W && ny < H && out[at(nx, ny) + 3] === 0;
  });

  for (let pass = 0; pass < ERODE_PASSES; pass++) {
    const doomed = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = at(x, y);
        if (out[i + 3] === 0 || !isPale(i)) continue;
        if (touchesHole(x, y)) doomed.push(i);
      }
    }
    if (!doomed.length) break;
    for (const i of doomed) out[i + 3] = 0;
  }

  // Soften what is left: anything still close to the background colour, and
  // touching a hole we just made, becomes partly transparent.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (out[i + 3] === 0) continue;
      if (!touchesHole(x, y)) continue;
      const d = dist(i);
      if (d < FEATHER) out[i + 3] = Math.round(255 * (d / FEATHER));
    }
  }

  const cutout = await sharp(out, { raw: { width: W, height: H, channels: CH } }).png().toBuffer();

  // Trim the empty margin, then sit the object in a square canvas so every
  // product card is composed the same way whatever shape the object is.
  const trimmed = sharp(cutout).trim({ threshold: 1 });
  const box = Math.round(CANVAS * (1 - PAD * 2));
  const final = await trimmed
    .resize(box, box, { fit: 'inside', kernel: 'lanczos3', withoutEnlargement: false })
    .extend({
      top: 0, bottom: 0, left: 0, right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const meta = await sharp(final).metadata();
  const dest = path.join(OUT, `${code}.png`);
  await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{
      input: final,
      top: Math.round((CANVAS - meta.height) / 2),
      left: Math.round((CANVAS - meta.width) / 2),
    }])
    .png({ compressionLevel: 9 })
    .toFile(dest);

  const size = fs.statSync(dest).size;
  console.log(`${code}: ${W}×${H} → ${CANVAS}×${CANVAS}, background ${bg.join(',')}, ` +
              `${cut} px cut away, ${(size / 1024).toFixed(0)} KB`);
  return { code, srcW: W, srcH: H };
}

const [src, code] = process.argv.slice(2);
if (!src || !code) {
  console.error('usage: node tools/import-photo.js <image> <product-code>');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
run(expand(src), code).catch(e => { console.error(e.message); process.exit(1); });
