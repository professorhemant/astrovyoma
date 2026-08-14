#!/usr/bin/env node
//
// Draws the blog article banners.
//
//   node tools/blog-art.js
//
// Writes one SVG per article into frontend/public/blog/. The shop got a picture
// per product; the articles were still sharing five emoji between eight pieces,
// so the blog listing read as a wall of text and two of the cards carried the
// same little house.
//
// Drawn rather than photographed, for the same reason the products are: a stock
// photograph of a temple or a "mystic" hand over a crystal ball says nothing
// true about an article on the twelve houses, and it is somebody else's picture.
// A diagram of the thing the article is actually about does say something, and
// it can be replaced from the admin with one Upload when there is a better one.
//
// Each banner is a 12:5 landscape so it sits above the card text and again at
// the top of the article. The motif stays inside the middle two-thirds so a
// narrow phone card can crop the sides without losing it.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'frontend', 'public', 'blog');
const W = 1200, H = 500, CX = W / 2, CY = H / 2;

// The site's own palette, so a banner sits on the card rather than on top of it.
const INK    = '#12093A';   // cosmic-950
const DEEP   = '#0A0630';
const GOLD   = '#C9A84C';   // gold-500
const GOLD_L = '#E8C547';   // gold-400
const GOLD_P = '#F5D98D';   // gold-300

// ─── geometry ────────────────────────────────────────────────────────────────

const rad = (deg) => (deg - 90) * Math.PI / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
const n = (v) => Math.round(v * 100) / 100;
const poly = (points) => points.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');

// ─── shared paint ────────────────────────────────────────────────────────────

// Every banner starts on the same ground, so eight different drawings still
// read as one set on the listing page.
function ground(tint = '#1E1468') {
  return `<defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="72%">
        <stop offset="0" stop-color="${tint}"/>
        <stop offset="0.62" stop-color="${INK}"/>
        <stop offset="1" stop-color="${DEEP}"/>
      </radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${GOLD_P}"/>
        <stop offset="0.5" stop-color="${GOLD_L}"/>
        <stop offset="1" stop-color="${GOLD}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>`;
}

// A scatter of stars, seeded off the slug so a given article's sky never moves
// between runs but no two articles share one.
function stars(seed, count = 46) {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = n(rnd() * W), y = n(rnd() * H);
    const r = n(0.7 + rnd() * 1.6), o = n(0.18 + rnd() * 0.45);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${o}"/>`;
  }
  return out;
}

// A pool of light behind the motif, so it is lit rather than pasted on.
function halo(colour, r = 210, opacity = 0.5) {
  return `<defs><radialGradient id="halo">
      <stop offset="0" stop-color="${colour}" stop-opacity="0.55"/>
      <stop offset="0.55" stop-color="${colour}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${colour}" stop-opacity="0"/>
    </radialGradient></defs>
    <ellipse cx="${CX}" cy="${CY}" rx="${r * 1.35}" ry="${r}" fill="url(#halo)" opacity="${opacity}"/>`;
}

// The North Indian chart, which is a diamond inside a square with the corners
// joined — the shape the site already draws in NorthIndianChart.jsx. `mark` is
// the house number to fill, 1 being the top diamond.
function northChart(cx, cy, size, mark = null) {
  const h = size / 2;
  const L = cx - h, R = cx + h, T = cy - h, B = cy + h;
  const box = `<rect x="${n(L)}" y="${n(T)}" width="${n(size)}" height="${n(size)}"
      fill="none" stroke="url(#gold)" stroke-width="3" opacity="0.9"/>`;
  const diamond = `<polygon points="${poly([[cx, T], [R, cy], [cx, B], [L, cy]])}"
      fill="none" stroke="url(#gold)" stroke-width="2.5" opacity="0.75"/>`;
  const crossA = `<line x1="${n(L)}" y1="${n(T)}" x2="${n(R)}" y2="${n(B)}" stroke="${GOLD}" stroke-width="2" opacity="0.5"/>`;
  const crossB = `<line x1="${n(R)}" y1="${n(T)}" x2="${n(L)}" y2="${n(B)}" stroke="${GOLD}" stroke-width="2" opacity="0.5"/>`;

  // House 1 is the top diamond and the rest run anticlockwise, which is what
  // the chart component does; only the four diamonds are filled here because
  // they are the ones big enough to read at card size.
  const q = size / 4;
  const cells = {
    1:  [[cx, T], [cx + q, cy - q], [cx, cy], [cx - q, cy - q]],
    4:  [[L, cy], [cx - q, cy - q], [cx, cy], [cx - q, cy + q]],
    7:  [[cx, B], [cx - q, cy + q], [cx, cy], [cx + q, cy + q]],
    10: [[R, cy], [cx + q, cy + q], [cx, cy], [cx + q, cy - q]],
  };
  const filled = mark && cells[mark]
    ? `<polygon points="${poly(cells[mark])}" fill="${GOLD_L}" opacity="0.28"/>`
    : '';
  return filled + box + diamond + crossA + crossB;
}

const glyph = (ch, x, y, size, opacity = 0.95, fill = 'url(#gold)') =>
  `<text x="${n(x)}" y="${n(y)}" font-family="Georgia, 'Times New Roman', serif"
     font-size="${size}" fill="${fill}" opacity="${opacity}"
     text-anchor="middle" dominant-baseline="central">${ch}</text>`;

const orb = (x, y, r, colour, light) =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${colour}"/>
   <ellipse cx="${n(x - r * 0.3)}" cy="${n(y - r * 0.35)}" rx="${n(r * 0.45)}" ry="${n(r * 0.32)}"
     fill="${light}" opacity="0.45"/>`;

// ─── the eight drawings ──────────────────────────────────────────────────────

const ART = {
  // The ascendant is the degree climbing over the eastern horizon at birth.
  // So: a horizon, and the Sun crossing it.
  'understanding-your-lagna': () => `
    ${ground('#2A1A5E')}${stars('lagna')}${halo(GOLD_L, 200, 0.55)}
    <circle cx="${CX}" cy="330" r="86" fill="url(#gold)" opacity="0.95"/>
    ${[...Array(16)].map((_, i) => {
      const [x1, y1] = pt(CX, 330, 100, i * 22.5);
      const [x2, y2] = pt(CX, 330, 128 + (i % 2) * 16, i * 22.5);
      return y1 <= 328 ? `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"
        stroke="${GOLD_L}" stroke-width="3" opacity="0.55" stroke-linecap="round"/>` : '';
    }).join('')}
    ${glyph('↑', CX, 296, 74, 0.85, INK)}
    <!-- The ground goes on last but for the horizon line, so the Sun is cut by
         the horizon rather than sitting in front of it. -->
    <rect x="0" y="331" width="${W}" height="${H - 331}" fill="${DEEP}" opacity="0.92"/>
    ${[...Array(9)].map((_, i) => {
      const x = 200 + i * 100;
      return `<line x1="${x}" y1="331" x2="${x}" y2="${n(348 + (i % 2) * 12)}" stroke="${GOLD}" stroke-width="2" opacity="0.4"/>`;
    }).join('')}
    <line x1="110" y1="331" x2="1090" y2="331" stroke="url(#gold)" stroke-width="3.5" opacity="0.95"/>
    ${glyph('the eastern horizon', CX, 412, 32, 0.42)}`,

  // Retrograde is apparent, not real: the loop a planet seems to trace when we
  // overtake it. Drawing the loop says that in one picture.
  'mercury-retrograde-2025': () => `
    ${ground('#123A52')}${stars('mercury')}${halo('#7FD3E8', 190, 0.5)}
    <path d="M 170 250 C 340 250 400 150 520 150 C 660 150 690 330 560 330
             C 470 330 470 180 600 180 C 760 180 780 250 1030 250"
          fill="none" stroke="url(#gold)" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
    <path d="M 170 250 C 340 250 400 150 520 150 C 660 150 690 330 560 330
             C 470 330 470 180 600 180 C 760 180 780 250 1030 250"
          fill="none" stroke="${GOLD_P}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    ${orb(560, 330, 34, '#8FD6EA', '#E6F8FF')}
    ${glyph('☿', 560, 331, 34, 0.9, INK)}
    ${orb(170, 250, 13, GOLD, GOLD_P)}
    ${orb(1030, 250, 13, GOLD, GOLD_P)}
    ${glyph('R', 660, 392, 44, 0.75)}
    <path d="M 690 372 l 26 20 -26 20" fill="none" stroke="${GOLD}" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`,

  // Twelve houses: the chart itself, with all twelve compartments visible.
  '12-houses-vedic-astrology': () => `
    ${ground('#241A66')}${stars('houses')}${halo(GOLD, 200, 0.45)}
    ${northChart(CX, CY, 300)}
    ${[[CX, CY - 112, '1'], [CX - 112, CY, '4'], [CX, CY + 112, '7'], [CX + 112, CY, '10']]
      .map(([x, y, t]) => glyph(t, x, y, 40, 0.9)).join('')}
    ${[[CX - 112, CY - 112], [CX + 112, CY - 112], [CX - 112, CY + 112], [CX + 112, CY + 112]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${GOLD}" opacity="0.55"/>`).join('')}
    ${glyph('12 भाव', CX, 92, 44, 0.55)}`,

  // Sade Sati is Saturn crossing the three signs around the natal Moon — a
  // seven-and-a-half year passage, which is three arcs over one Moon.
  'sade-sati-saturn-explained': () => `
    ${ground('#1A1552')}${stars('sadesati')}${halo('#9B8CC4', 210, 0.5)}
    <!-- Three arcs for the three signs Saturn crosses, stepped outward and
         clearly gapped. Drawn as one continuous band they read as a single
         passage, which is the one thing the article is correcting. -->
    ${[0, 1, 2].map(i => {
      const r = 150 + i * 34;
      const from = 196 + i * 46, to = from + 34;
      const [x1, y1] = pt(CX, CY + 40, r, from);
      const [x2, y2] = pt(CX, CY + 40, r, to);
      return `<path d="M ${n(x1)} ${n(y1)} A ${r} ${r} 0 0 1 ${n(x2)} ${n(y2)}"
        fill="none" stroke="url(#gold)" stroke-width="15" stroke-linecap="round" opacity="${0.42 + i * 0.2}"/>`;
    }).join('')}
    ${orb(CX, CY + 40, 62, '#D8D3EE', '#FFFFFF')}
    ${glyph('☾', CX, CY + 40, 62, 0.85, INK)}
    ${orb(CX + 232, CY - 92, 46, '#6B5FA8', '#A99BE0')}
    <ellipse cx="${CX + 232}" cy="${CY - 92}" rx="82" ry="22" fill="none"
             stroke="url(#gold)" stroke-width="7" opacity="0.9" transform="rotate(-18 ${CX + 232} ${CY - 92})"/>
    <ellipse cx="${CX + 232}" cy="${CY - 92}" rx="96" ry="27" fill="none"
             stroke="${GOLD}" stroke-width="2.5" opacity="0.5" transform="rotate(-18 ${CX + 232} ${CY - 92})"/>
    ${glyph('7½', CX - 250, CY - 78, 62, 0.7)}`,

  // Mangal Dosha is Mars in particular houses. Mars, and the houses it is
  // counted from.
  'mangal-dosha-facts-remedies': () => `
    ${ground('#4A1230')}${stars('mangal')}${halo('#FF7A6B', 200, 0.55)}
    ${northChart(CX, CY, 268)}
    ${orb(CX, CY, 66, '#D9503F', '#FF9A86')}
    ${glyph('♂', CX, CY, 68, 0.95, '#3A0A18')}
    ${[[CX, CY - 100], [CX - 100, CY], [CX, CY + 100], [CX + 100, CY]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#FF8C7A" opacity="0.8"/>`).join('')}
    ${glyph('मंगल', CX, 96, 42, 0.5)}`,

  // The tenth house is the top of the chart — karma sthana, the visible peak of
  // a working life. A chart with the 10th lit, and a climb toward it.
  'career-astrology-10th-house': () => `
    ${ground('#123A34')}${stars('career')}${halo('#6BD4B0', 195, 0.45)}
    ${[0, 1, 2, 3].map(i => {
      const h = 70 + i * 52, x = 214 + i * 68;
      return `<rect x="${x}" y="${n(CY + 140 - h)}" width="42" height="${h}" rx="8"
        fill="url(#gold)" opacity="${0.32 + i * 0.16}"/>`;
    }).join('')}
    ${northChart(CX + 172, CY, 250, 10)}
    ${glyph('10', CX + 172 + 93, CY, 44, 0.95)}`,

  // Nine grahas: nine bodies in a ring, the Sun in the middle, Rahu and Ketu
  // facing each other as the two halves of one axis.
  'navagraha-nine-planets': () => {
    const marks = ['☾', '♂', '☿', '♃', '♀', '♄', '☊', '☋'];
    const cols  = ['#D8D3EE', '#D9503F', '#7FD3E8', '#E8C547', '#F0A8C4', '#8E86B8', '#9B8CC4', '#7A6FA0'];
    const ring = marks.map((m, i) => {
      const [x, y] = pt(CX, CY, 168, i * 45);
      return `${orb(x, y, 40, cols[i], '#FFFFFF')}${glyph(m, x, y, 40, 0.9, INK)}`;
    }).join('');
    const spokes = marks.map((_, i) => {
      const [x1, y1] = pt(CX, CY, 74, i * 45);
      const [x2, y2] = pt(CX, CY, 128, i * 45);
      return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"
        stroke="${GOLD}" stroke-width="2" opacity="0.35"/>`;
    }).join('');
    return `${ground('#241A66')}${stars('navagraha')}${halo(GOLD_L, 215, 0.5)}
      <circle cx="${CX}" cy="${CY}" r="168" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.3"/>
      ${spokes}${ring}
      ${orb(CX, CY, 62, GOLD_L, GOLD_P)}${glyph('☉', CX, CY, 60, 0.95, INK)}`;
  },

  // Vastu is the nine-square grid laid over a plan, oriented to the compass.
  'vastu-shastra-home-guide': () => {
    const g = 88, x0 = CX - g * 1.5, y0 = CY - g * 1.5 + 26;
    let cells = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const mid = r === 1 && c === 1;
        // The centre square is the brahmasthana, which is left open — so it is
        // the one cell that is lit rather than outlined.
        cells += `<rect x="${n(x0 + c * g)}" y="${n(y0 + r * g)}" width="${g}" height="${g}"
          fill="${mid ? GOLD_L : DEEP}" fill-opacity="${mid ? 0.22 : 0.45}"
          stroke="${mid ? GOLD_P : GOLD}" stroke-width="${mid ? 3.5 : 2}" stroke-opacity="${mid ? 0.95 : 0.7}"/>`;
      }
    }
    const roof = `<polygon points="${poly([[x0 - 34, y0], [CX, y0 - 76], [x0 + g * 3 + 34, y0]])}"
      fill="none" stroke="url(#gold)" stroke-width="3.5" opacity="0.85"/>`;
    // North sits above the roof, so it has to clear the apex or it is cropped
    // off the top of the banner.
    const dirs = [['N', CX, y0 - 112], ['S', CX, y0 + g * 3 + 44],
                  ['E', x0 + g * 3 + 74, CY + 26], ['W', x0 - 74, CY + 26]]
      .map(([t, x, y]) => glyph(t, x, y, 36, 0.7)).join('');
    return `${ground('#3A2A16')}${stars('vastu')}${halo(GOLD, 205, 0.4)}
      ${roof}${cells}${glyph('✦', CX, CY + 26, 44, 0.85)}${dirs}`;
  },
};

// ─── write them out ──────────────────────────────────────────────────────────

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${body}</svg>\n`;

const { ARTICLES } = require('../backend/src/data/blogArticles');

fs.mkdirSync(OUT, { recursive: true });
let made = 0;
const missing = [];
for (const a of ARTICLES) {
  const draw = ART[a.slug];
  if (!draw) { missing.push(a.slug); continue; }
  fs.writeFileSync(path.join(OUT, `${a.slug}.svg`), svg(draw()));
  made++;
}
console.log(`drew ${made} of ${ARTICLES.length} into frontend/public/blog/`);

// An article added without a drawing must fail the run rather than quietly ship
// a card with a broken image on it.
if (missing.length) {
  console.error(`no artwork defined for: ${missing.join(', ')}`);
  process.exitCode = 1;
}
