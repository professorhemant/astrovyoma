#!/usr/bin/env node
//
// Draws the Astro Mall product artwork.
//
//   node tools/product-art.js
//
// Writes one SVG per product into frontend/public/products/. Every shop product
// gets a picture instead of the category emoji it used to share with eleven
// others.
//
// Why drawn and not photographed: a stock photograph of a sapphire is a
// photograph of somebody else's sapphire. Shown on a product card it implies we
// are selling that stone, which we are not. Artwork reads as what it is — a
// picture of the kind of thing — and it can be replaced from the admin, one
// Upload click at a time, as real stock gets photographed.
//
// The art sits on a transparent background so the card's own category gradient
// shows through, and stays inside a 150px radius of centre so nothing is clipped
// when a square image is cropped to a square card.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'frontend', 'public', 'products');
const SIZE = 400, C = 200;

// ─── geometry helpers ────────────────────────────────────────────────────────

const rad = (deg) => (deg - 90) * Math.PI / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
const n = (v) => Math.round(v * 100) / 100;
const poly = (points) => points.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');

// Points evenly spaced round a circle, starting at `from` degrees.
function ring(cx, cy, r, count, from = 0) {
  return Array.from({ length: count }, (_, i) => pt(cx, cy, r, from + i * 360 / count));
}

// ─── shared paint ────────────────────────────────────────────────────────────

// A soft pool of light under the object, so it sits on the card rather than
// floating in front of it.
function glow(colour, r = 165, opacity = 0.5) {
  return `<ellipse cx="${C}" cy="${C}" rx="${r}" ry="${r}" fill="url(#glow)" opacity="${opacity}"/>
    <defs><radialGradient id="glow"><stop offset="0" stop-color="${colour}" stop-opacity="0.75"/>
    <stop offset="0.55" stop-color="${colour}" stop-opacity="0.18"/>
    <stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient></defs>`;
}

// Metals get a banded gradient — the give-away that something is metal rather
// than plastic is a bright band across the middle, not an even tint.
const METALS = {
  gold:   { a: '#F6E27A', b: '#C9A227', c: '#6E5210', glow: '#E8C547' },
  silver: { a: '#F2F5F8', b: '#B9C3CC', c: '#5C666F', glow: '#CBD5DD' },
  copper: { a: '#F0B08A', b: '#B87333', c: '#5E3616', glow: '#D98B54' },
  brass:  { a: '#F3DFA0', b: '#C6A44E', c: '#6B5320', glow: '#DCC067' },
};

function metalDef(id, m) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="${m.a}"/><stop offset="0.42" stop-color="${m.b}"/>
    <stop offset="0.62" stop-color="${m.a}"/><stop offset="1" stop-color="${m.c}"/></linearGradient>`;
}

// ─── primitives ──────────────────────────────────────────────────────────────

// A step-cut stone seen from above: octagonal girdle, octagonal table, and the
// crown facets between them picked out in alternating light and shade.
function gem({ light, mid, dark, edge }) {
  const R = 148, T = 74;
  const outer = ring(C, C, R, 8, 22.5);
  const inner = ring(C, C, T, 8, 22.5);
  let facets = '';
  for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8;
    const shade = i % 2 ? mid : light;
    facets += `<polygon points="${poly([outer[i], outer[j], inner[j], inner[i]])}" fill="${shade}" opacity="0.95"/>`;
    // the corner facet, cut from girdle point to table point
    facets += `<polygon points="${poly([outer[i], inner[i], inner[(i + 7) % 8]])}" fill="${dark}" opacity="0.55"/>`;
  }
  return `
    ${glow(edge)}
    <polygon points="${poly(outer)}" fill="${dark}"/>
    ${facets}
    <polygon points="${poly(inner)}" fill="url(#table)"/>
    <polygon points="${poly(inner)}" fill="none" stroke="${light}" stroke-width="1.5" opacity="0.7"/>
    <polygon points="${poly(outer)}" fill="none" stroke="${light}" stroke-width="2.5" opacity="0.85"/>
    <path d="M ${n(C - 40)} ${n(C - 34)} q 22 -16 46 -6 q -26 4 -46 6 z" fill="#fff" opacity="0.7"/>
    <defs><radialGradient id="table" cx="0.36" cy="0.3">
      <stop offset="0" stop-color="${light}"/><stop offset="0.6" stop-color="${mid}"/>
      <stop offset="1" stop-color="${dark}"/></radialGradient></defs>`;
}

// A smooth polished dome — coral, quartz, anything not faceted.
function cabochon({ light, mid, dark, edge }, rx = 140, ry = 112) {
  return `
    ${glow(edge)}
    <ellipse cx="${C}" cy="${C}" rx="${rx}" ry="${ry}" fill="${dark}"/>
    <ellipse cx="${C}" cy="${C}" rx="${rx - 6}" ry="${ry - 6}" fill="url(#dome)"/>
    <ellipse cx="${C - rx * 0.3}" cy="${C - ry * 0.36}" rx="${rx * 0.3}" ry="${ry * 0.2}" fill="#fff" opacity="0.42"/>
    <ellipse cx="${C + rx * 0.28}" cy="${C + ry * 0.34}" rx="${rx * 0.34}" ry="${ry * 0.2}" fill="${light}" opacity="0.22"/>
    <defs><radialGradient id="dome" cx="0.34" cy="0.28">
      <stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${mid}"/>
      <stop offset="1" stop-color="${dark}"/></radialGradient></defs>`;
}

// One rudraksha bead: a brown sphere segmented by its mukhi lines.
//
// The lines are meridians running pole to pole, spread across the face of the
// sphere. Drawing them as full diameters instead makes every line cross the
// middle and the bead comes out as a starburst.
function rudrakshaBead(cx, cy, r, faces = 5, id = 'rd') {
  let lines = '';
  const visible = Math.max(3, Math.min(faces, 6));   // you only ever see the front half
  for (let i = 0; i < visible; i++) {
    const f = visible === 1 ? 0.5 : i / (visible - 1);
    const off = (f - 0.5) * 2 * r * 0.86;
    // Meridians near the edge are foreshortened, so fade and thin them.
    const edge = 1 - Math.abs(f - 0.5) * 1.5;
    lines += `<path d="M ${n(cx)} ${n(cy - r * 0.97)} Q ${n(cx + off * 1.45)} ${n(cy)} ${n(cx)} ${n(cy + r * 0.97)}"
      fill="none" stroke="#3A210E" stroke-width="${n(r * 0.06 * (0.5 + edge))}"
      opacity="${n(0.35 + 0.5 * edge)}" stroke-linecap="round"/>`;
  }
  let bumps = '';
  for (let i = 0; i < 14; i++) {
    const a = i * 77 + 12, rr = r * (0.2 + ((i * 37) % 100) / 100 * 0.62);
    const [bx, by] = pt(cx, cy, rr, a);
    bumps += `<circle cx="${n(bx)}" cy="${n(by)}" r="${n(r * 0.05)}" fill="#5B3418" opacity="0.42"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
    ${bumps}${lines}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#33200E" stroke-width="${n(r * 0.07)}" opacity="0.8"/>
    <ellipse cx="${n(cx - r * 0.34)}" cy="${n(cy - r * 0.38)}" rx="${n(r * 0.24)}" ry="${n(r * 0.15)}" fill="#fff" opacity="0.3"/>`;
}

const RUDRAKSHA_DEF = `<defs><radialGradient id="rd" cx="0.34" cy="0.3">
  <stop offset="0" stop-color="#B4703C"/><stop offset="0.55" stop-color="#7E4620"/>
  <stop offset="1" stop-color="#42230E"/></radialGradient></defs>`;

// A strung loop of beads with a tassel — a mala or a bracelet, depending on how
// many beads and how big.
function beadLoop({ count, beadR, loopR, colours, tassel, guru }) {
  const pts = ring(C, C, loopR, count, 0);
  const beads = pts.map(([x, y], i) => {
    const col = colours[i % colours.length];
    return `<circle cx="${n(x)}" cy="${n(y)}" r="${beadR}" fill="${col.mid}"/>
      <circle cx="${n(x)}" cy="${n(y)}" r="${beadR}" fill="url(#sheen)"/>
      <circle cx="${n(x - beadR * 0.3)}" cy="${n(y - beadR * 0.32)}" r="${n(beadR * 0.3)}" fill="#fff" opacity="0.45"/>`;
  }).join('');
  const guruBead = guru
    ? `<circle cx="${C}" cy="${n(C + loopR)}" r="${n(beadR * 1.5)}" fill="${guru}"/>
       <circle cx="${C}" cy="${n(C + loopR)}" r="${n(beadR * 1.5)}" fill="url(#sheen)"/>`
    : '';
  const tail = tassel
    ? `<g stroke="${tassel}" stroke-width="4" stroke-linecap="round" opacity="0.9">
        ${[-14, -7, 0, 7, 14].map(dx =>
          `<path d="M ${C} ${n(C + loopR + 14)} q ${dx * 0.6} 26 ${dx} 52"/>`).join('')}
       </g>`
    : '';
  return `${glow(colours[0].glow || colours[0].mid)}
    <circle cx="${C}" cy="${C}" r="${loopR}" fill="none" stroke="#2A1B4E" stroke-width="3" opacity="0.55"/>
    ${beads}${guruBead}${tail}
    <defs><radialGradient id="sheen" cx="0.33" cy="0.3">
      <stop offset="0" stop-color="#fff" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.3"/></radialGradient></defs>`;
}

// ─── yantras ─────────────────────────────────────────────────────────────────

// The frame every yantra sits in: the bhupura, a square with a gate on each side.
function bhupura(m, r = 150) {
  const a = C - r, b = C + r, g = 34, t = 16;
  const side = (x1, y1, x2, y2, dx, dy) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<path d="M ${x1} ${y1} L ${n(mx - (dy ? g : 0))} ${n(my - (dx ? g : 0))}
      L ${n(mx - (dy ? g : 0) + dx * t)} ${n(my - (dx ? g : 0) + dy * t)}
      L ${n(mx + (dy ? g : 0) + dx * t)} ${n(my + (dx ? g : 0) + dy * t)}
      L ${n(mx + (dy ? g : 0))} ${n(my + (dx ? g : 0))} L ${x2} ${y2}"
      fill="none" stroke="url(#m)" stroke-width="7" stroke-linejoin="round"/>`;
  };
  return `<rect x="${a}" y="${a}" width="${2 * r}" height="${2 * r}" rx="4"
      fill="none" stroke="url(#m)" stroke-width="4" opacity="0.55"/>
    ${side(a, a, b, a, 0, -1)}${side(b, a, b, b, 1, 0)}
    ${side(b, b, a, b, 0, 1)}${side(a, b, a, a, -1, 0)}`;
}

// A ring of lotus petals.
function petals(r, count, len, m) {
  return ring(C, C, r, count, 0).map(([x, y], i) => {
    const a = i * 360 / count;
    const [tx, ty] = pt(C, C, r + len, a);
    const [lx, ly] = pt(C, C, r + len * 0.42, a - 360 / count / 2.1);
    const [rx2, ry2] = pt(C, C, r + len * 0.42, a + 360 / count / 2.1);
    return `<path d="M ${n(x)} ${n(y)} Q ${n(lx)} ${n(ly)} ${n(tx)} ${n(ty)} Q ${n(rx2)} ${n(ry2)} ${n(x)} ${n(y)} z"
      fill="url(#m)" opacity="${i % 2 ? 0.5 : 0.72}" stroke="url(#m)" stroke-width="1.5"/>`;
  }).join('');
}

function shreeYantra(m) {
  // Nine interlocking triangles. These are a legible rendering rather than a
  // ritually exact construction — the proportions that matter to the eye are the
  // alternating up/down stack narrowing towards the bindu.
  const up = [[112, 34], [88, 6], [60, -18], [34, -40]];
  const dn = [[122, -46], [96, -18], [70, 8], [44, 30], [22, 50]];
  const tri = (w, off, down) => {
    const y0 = C + off;
    const p = down
      ? [[C, y0 + w * 0.95], [C - w, y0 - w * 0.5], [C + w, y0 - w * 0.5]]
      : [[C, y0 - w * 0.95], [C - w, y0 + w * 0.5], [C + w, y0 + w * 0.5]];
    return `<polygon points="${poly(p)}" fill="none" stroke="url(#m)" stroke-width="3" opacity="0.92"/>`;
  };
  return `${glow(m.glow)}
    ${bhupura(m)}
    ${petals(96, 16, 24, m)}
    ${petals(70, 8, 22, m)}
    <circle cx="${C}" cy="${C}" r="70" fill="none" stroke="url(#m)" stroke-width="3" opacity="0.7"/>
    ${up.map(([w, o]) => tri(w * 0.52, o * 0.5, false)).join('')}
    ${dn.map(([w, o]) => tri(w * 0.52, o * 0.5, true)).join('')}
    <circle cx="${C}" cy="${C}" r="6" fill="url(#m)"/>`;
}

function kuberYantra(m) {
  // The Kuber magic square: every row, column and diagonal totals 72.
  const grid = [[27, 20, 25], [22, 24, 26], [23, 28, 21]];
  const s = 78, o = C - s * 1.5;
  let cells = '';
  grid.forEach((row, r) => row.forEach((v, c) => {
    cells += `<rect x="${n(o + c * s)}" y="${n(o + r * s)}" width="${s}" height="${s}"
        fill="none" stroke="url(#m)" stroke-width="3" opacity="0.85"/>
      <text x="${n(o + c * s + s / 2)}" y="${n(o + r * s + s / 2 + 11)}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="url(#m)">${v}</text>`;
  }));
  return `${glow(m.glow)}${bhupura(m, 140)}
    <rect x="${n(o - 10)}" y="${n(o - 10)}" width="${n(s * 3 + 20)}" height="${n(s * 3 + 20)}"
      fill="none" stroke="url(#m)" stroke-width="5" opacity="0.6"/>${cells}`;
}

function mahamrityunjayaYantra(m) {
  const tri = (r, rot) => `<polygon points="${poly(ring(C, C, r, 3, rot))}"
    fill="none" stroke="url(#m)" stroke-width="3.5" opacity="0.9"/>`;
  return `${glow(m.glow)}${bhupura(m)}
    ${petals(92, 8, 26, m)}
    <circle cx="${C}" cy="${C}" r="92" fill="none" stroke="url(#m)" stroke-width="3" opacity="0.75"/>
    <circle cx="${C}" cy="${C}" r="66" fill="none" stroke="url(#m)" stroke-width="2" opacity="0.5"/>
    ${tri(62, 0)}${tri(62, 60)}${tri(34, 0)}
    <circle cx="${C}" cy="${C}" r="7" fill="url(#m)"/>`;
}

function bagalamukhiYantra(m) {
  return `${glow(m.glow)}${bhupura(m)}
    ${petals(94, 8, 26, m)}
    <circle cx="${C}" cy="${C}" r="94" fill="none" stroke="url(#m)" stroke-width="3" opacity="0.75"/>
    <polygon points="${poly(ring(C, C, 78, 3, 60))}" fill="none" stroke="url(#m)" stroke-width="4" opacity="0.95"/>
    <polygon points="${poly(ring(C, C, 46, 3, 60))}" fill="none" stroke="url(#m)" stroke-width="3" opacity="0.8"/>
    <circle cx="${C}" cy="${C}" r="7" fill="url(#m)"/>`;
}

// ─── other objects ───────────────────────────────────────────────────────────

// A locket on its bail, with a planetary sign cut into the face.
function kavach(m, sign) {
  const glyph = sign === 'saturn'
    // Saturn: the scythe
    ? `<path d="M ${C - 26} ${C - 34} h 46 M ${C - 4} ${C - 40} v 62 q 0 20 20 20 q 18 0 18 -20"
        fill="none" stroke="url(#m)" stroke-width="8" stroke-linecap="round"/>`
    // Mars: shield and spear
    : `<circle cx="${C - 8}" cy="${C + 14}" r="30" fill="none" stroke="url(#m)" stroke-width="8"/>
       <path d="M ${C + 14} ${C - 8} l 34 -34 M ${C + 26} ${C - 42} h 22 v 22"
        fill="none" stroke="url(#m)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `${glow(m.glow)}
    <path d="M ${C} ${C - 148} m -20 0 a 20 20 0 1 1 40 0 a 20 20 0 1 1 -40 0"
      fill="none" stroke="url(#m)" stroke-width="10"/>
    <rect x="${C - 104}" y="${C - 110}" width="208" height="248" rx="30" fill="url(#m)"/>
    <rect x="${C - 92}" y="${C - 98}" width="184" height="224" rx="24"
      fill="#12093A" opacity="0.55" stroke="url(#m)" stroke-width="3"/>
    ${glyph}`;
}

// A three-quarter view pyramid: lit face, shaded face, and a base shadow.
function pyramid({ light, mid, dark, edge }, base = 150, height = 165) {
  const bx = C, by = C + 96, apex = [C, by - height];
  const l = [bx - base, by], r = [bx + base * 0.72, by], back = [bx + base * 0.22, by - 42];
  return `${glow(edge)}
    <ellipse cx="${C}" cy="${by + 12}" rx="${base}" ry="22" fill="#000" opacity="0.28"/>
    <polygon points="${poly([apex, l, r])}" fill="${mid}"/>
    <polygon points="${poly([apex, r, back])}" fill="${dark}"/>
    <polygon points="${poly([apex, l, [bx - base * 0.1, by]])}" fill="${light}" opacity="0.55"/>
    <polygon points="${poly([apex, l, r])}" fill="none" stroke="${light}" stroke-width="2.5" opacity="0.8"/>
    <path d="M ${n(apex[0])} ${n(apex[1])} L ${n(r[0])} ${n(r[1])}" stroke="${light}" stroke-width="2" opacity="0.6"/>`;
}

function pyramidSet(m) {
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = C + (c - 1) * 88, y = C + (r - 1) * 62 + 30, w = 38, h = 46;
    cells.push(`<polygon points="${poly([[x, y - h], [x - w, y], [x + w, y]])}" fill="url(#m)" opacity="0.95"/>
      <polygon points="${poly([[x, y - h], [x, y], [x + w, y]])}" fill="#000" opacity="0.22"/>`);
  }
  return `${glow(m.glow)}
    <rect x="${C - 160}" y="${C - 130}" width="320" height="270" rx="18"
      fill="none" stroke="url(#m)" stroke-width="5" opacity="0.7"/>
    ${cells.join('')}`;
}

// ─── murtis ──────────────────────────────────────────────────────────────────

function lotusSeat(m, y) {
  return ring(C, y, 8, 9, 0).map((_, i) => {
    const a = -80 + i * 20;
    const [tx, ty] = pt(C, y, 96, a);
    return `<path d="M ${C} ${y} Q ${n(tx * 0.75 + C * 0.25)} ${n(y - 26)} ${n(tx)} ${n(ty * 0.35 + y * 0.65)} Q ${C} ${n(y + 14)} ${C} ${y} z"
      fill="url(#m)" opacity="${i % 2 ? 0.55 : 0.8}"/>`;
  }).join('');
}

// Ganesh, as a silhouette. The four things that make the figure legible are the
// broad ears, the thick curling trunk, the crown and the round belly — so those
// are drawn large and everything else is left out.
function ganesh(m) {
  return `${glow(m.glow)}
    <ellipse cx="${C}" cy="${C + 138}" rx="118" ry="22" fill="#000" opacity="0.3"/>
    <path d="M ${C - 96} ${C + 140} q 96 -30 192 0 q -24 22 -96 22 q -72 0 -96 -22 z" fill="url(#m)"/>
    <path d="M ${C - 92} ${C + 142} q -14 -96 92 -96 q 106 0 92 96 z" fill="url(#m)"/>
    <path d="M ${C - 74} ${C - 44} q -78 -34 -96 26 q -16 60 40 74 q 44 10 60 -30 z" fill="url(#m)" opacity="0.9"/>
    <path d="M ${C + 74} ${C - 44} q 78 -34 96 26 q 16 60 -40 74 q -44 10 -60 -30 z" fill="url(#m)" opacity="0.9"/>
    <ellipse cx="${C}" cy="${C - 34}" rx="76" ry="70" fill="url(#m)"/>
    <path d="M ${C} ${C - 116} q -30 -8 -26 -44 l 26 24 l 26 -24 q 4 36 -26 44 z" fill="url(#m)"/>
    <circle cx="${C}" cy="${C - 150}" r="9" fill="url(#m)"/>
    <path d="M ${C - 4} ${C - 12} q 4 52 -34 74 q -38 22 -44 -14 q -4 -26 24 -26"
      fill="none" stroke="url(#m)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M ${C - 46} ${C + 6} q -16 26 -6 44 M ${C + 46} ${C + 6} q 16 26 6 44"
      fill="none" stroke="#FFF6DC" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
    <ellipse cx="${C - 30}" cy="${C - 52}" rx="9" ry="7" fill="#2A1B08" opacity="0.55"/>
    <ellipse cx="${C + 30}" cy="${C - 52}" rx="9" ry="7" fill="#2A1B08" opacity="0.55"/>`;
}

// Lakshmi: seated on her lotus inside a halo, four arms, crown. Again a
// silhouette — the shape of the pose is what carries it, not the detail.
function lakshmi(m) {
  const arm = (dir) => `<path d="M ${C + dir * 28} ${C + 4} q ${dir * 62} -6 ${dir * 78} -56"
      fill="none" stroke="url(#m)" stroke-width="17" stroke-linecap="round"/>
    <path d="M ${C + dir * 24} ${C + 34} q ${dir * 58} 10 ${dir * 74} 52"
      fill="none" stroke="url(#m)" stroke-width="15" stroke-linecap="round"/>`;
  return `${glow(m.glow)}
    <circle cx="${C}" cy="${C - 16}" r="150" fill="none" stroke="url(#m)" stroke-width="3" opacity="0.35"/>
    <circle cx="${C}" cy="${C - 54}" r="72" fill="none" stroke="url(#m)" stroke-width="4" opacity="0.55"/>
    ${lotusSeat(m, C + 118)}
    ${arm(-1)}${arm(1)}
    <path d="M ${C - 66} ${C + 118} q 10 -104 66 -104 q 56 0 66 104 z" fill="url(#m)"/>
    <ellipse cx="${C}" cy="${C - 52}" rx="36" ry="42" fill="url(#m)"/>
    <path d="M ${C} ${C - 132} q -34 -8 -30 -48 l 30 26 l 30 -26 q 4 40 -30 48 z" fill="url(#m)"/>
    <circle cx="${C}" cy="${C - 168}" r="8" fill="url(#m)"/>
    <circle cx="${C - 106}" cy="${C - 58}" r="13" fill="url(#m)" opacity="0.85"/>
    <circle cx="${C + 106}" cy="${C - 58}" r="13" fill="url(#m)" opacity="0.85"/>
    <circle cx="${C}" cy="${C - 62}" r="6" fill="#7A2010" opacity="0.6"/>`;
}

function shivaLingam(m) {
  return `${glow(m.glow)}
    <ellipse cx="${C}" cy="${C + 116}" rx="130" ry="28" fill="#000" opacity="0.28"/>
    <path d="M ${C - 140} ${C + 104} q 0 -34 46 -34 h 188 q 46 0 46 34 q 0 26 -46 26 h -188 q -46 0 -46 -26 z"
      fill="url(#m)" opacity="0.9"/>
    <path d="M ${C - 74} ${C + 72} q 0 -142 74 -142 q 74 0 74 142 z" fill="url(#stone)"/>
    <path d="M ${C - 74} ${C + 72} q 0 -142 74 -142 q 74 0 74 142 z" fill="none" stroke="#2C2A33" stroke-width="3" opacity="0.5"/>
    <path d="M ${C - 44} ${C - 6} q 44 -18 88 0" fill="none" stroke="#FFF3D0" stroke-width="7" opacity="0.75" stroke-linecap="round"/>
    <path d="M ${C - 40} ${C + 16} q 40 -16 80 0" fill="none" stroke="#FFF3D0" stroke-width="6" opacity="0.55" stroke-linecap="round"/>
    <defs><linearGradient id="stone" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#8E8A93"/><stop offset="0.45" stop-color="#5E5A63"/>
      <stop offset="1" stop-color="#332F38"/></linearGradient></defs>`;
}

// ─── combos ──────────────────────────────────────────────────────────────────

// Three small things gathered together, which is what a combo is: a stone, a
// bead and a yantra, arranged in a triangle so none of them overlaps another.
function miniGem(cx, cy, r, c) {
  const o = ring(cx, cy, r, 8, 22.5), i = ring(cx, cy, r * 0.5, 8, 22.5);
  return `<polygon points="${poly(o)}" fill="${c.mid}" stroke="${c.light}" stroke-width="3"/>
    <polygon points="${poly(i)}" fill="${c.light}" opacity="0.85"/>`;
}
function miniBead(cx, cy, r, c) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.mid}" stroke="${c.light}" stroke-width="3"/>
    <circle cx="${n(cx - r * 0.3)}" cy="${n(cy - r * 0.32)}" r="${n(r * 0.28)}" fill="#fff" opacity="0.45"/>`;
}
function miniYantra(cx, cy, r, c) {
  return `<rect x="${n(cx - r)}" y="${n(cy - r)}" width="${n(r * 2)}" height="${n(r * 2)}" rx="6"
      fill="none" stroke="${c.light}" stroke-width="4"/>
    <polygon points="${poly(ring(cx, cy, r * 0.72, 3, 0))}" fill="none" stroke="${c.light}" stroke-width="3.5"/>
    <polygon points="${poly(ring(cx, cy, r * 0.72, 3, 60))}" fill="none" stroke="${c.light}" stroke-width="3.5"/>
    <circle cx="${cx}" cy="${cy}" r="3.5" fill="${c.light}"/>`;
}

function combo(colours, m) {
  const [a, b, c] = colours;
  return `${glow(m.glow, 175, 0.6)}
    <ellipse cx="${C}" cy="${C + 140}" rx="140" ry="24" fill="#000" opacity="0.28"/>
    ${miniGem(C - 82, C - 52, 64, a)}
    ${miniBead(C + 84, C - 46, 60, b)}
    ${miniYantra(C, C + 74, 62, c)}`;
}

// ─── stone palettes ──────────────────────────────────────────────────────────

const STONE = {
  sapphire:   { light: '#7FB6FF', mid: '#2C6BD8', dark: '#12306E', edge: '#4A8CF0' },
  pukhraj:    { light: '#FFE79A', mid: '#E9B928', dark: '#8A6408', edge: '#F2CC4A' },
  coral:      { light: '#FF9F86', mid: '#E2523A', dark: '#7E2114', edge: '#F26A4C' },
  emerald:    { light: '#86E8B4', mid: '#1E9E63', dark: '#0A4A2C', edge: '#35BE7C' },
  rose:       { light: '#FFD3E0', mid: '#F09BB6', dark: '#A45372', edge: '#F5AEC6' },
  tourmaline: { light: '#6E7686', mid: '#2E3440', dark: '#12151C', edge: '#4A5262' },
  quartz:     { light: '#FFFFFF', mid: '#D8E4F0', dark: '#8A9AAC', edge: '#E6EEF8' },
  tulsi:      { light: '#C79A6B', mid: '#9A6B3F', dark: '#573A1E', edge: '#B0824F' },
  sandal:     { light: '#E6C9A0', mid: '#C39A68', dark: '#7A5836', edge: '#D3AE7E' },
};

const CHAKRA = [
  { mid: '#E04A4A', light: '#FF8A8A', glow: '#E86A6A' },
  { mid: '#E8862B', light: '#FFB871' }, { mid: '#E8C93A', light: '#FFE894' },
  { mid: '#3FAE63', light: '#89E0A6' }, { mid: '#3A8FD8', light: '#8CC4F2' },
  { mid: '#3F4FBE', light: '#8E99E8' }, { mid: '#8B4FC9', light: '#C39BEA' },
];

// ─── the products ────────────────────────────────────────────────────────────

const ART = {
  // gemstones
  'blue-sapphire-5r':   () => gem(STONE.sapphire),
  'yellow-sapphire-5r': () => gem(STONE.pukhraj),
  'red-coral-6r':       () => cabochon(STONE.coral, 132, 104),
  'emerald-4r':         () => gem(STONE.emerald),

  // rudraksha
  '5-mukhi-mala': () => RUDRAKSHA_DEF + beadLoop({
    count: 22, beadR: 21, loopR: 118, tassel: '#8A5A2B', guru: '#5B3418',
    colours: [{ mid: '#7E4620', light: '#B4703C', glow: '#8A5A2B' }],
  }),
  '7-mukhi-rudraksha': () => RUDRAKSHA_DEF + glow('#8A5A2B') + rudrakshaBead(C, C, 138, 7),
  // Two beads grown together, so they overlap and share a seam rather than
  // being bridged by a bar.
  'gauri-shankar-rudraksha': () => RUDRAKSHA_DEF + glow('#8A5A2B') +
    rudrakshaBead(C, C - 74, 92, 4) + rudrakshaBead(C, C + 74, 92, 4) +
    `<path d="M ${C - 62} ${C} q 62 26 124 0 q -62 -26 -124 0 z" fill="#5B3418" opacity="0.85"/>`,
  'ek-mukhi-kaju': () => RUDRAKSHA_DEF + glow('#8A5A2B') +
    // A cashew: one long convex back, one shorter concave belly.
    `<path d="M ${C - 96} ${C + 78}
        C ${C - 148} ${C + 8} ${C - 116} ${C - 96} ${C - 26} ${C - 116}
        C ${C + 54} ${C - 132} ${C + 132} ${C - 62} ${C + 122} ${C + 16}
        C ${C + 114} ${C + 82} ${C + 46} ${C + 122} ${C - 12} ${C + 104}
        C ${C - 44} ${C + 94} ${C - 34} ${C + 62} ${C - 62} ${C + 60}
        C ${C - 78} ${C + 59} ${C - 88} ${C + 68} ${C - 96} ${C + 78} z"
      fill="url(#rd)" stroke="#33200E" stroke-width="6" stroke-linejoin="round"/>
     <path d="M ${C - 60} ${C - 86} C ${C + 6} ${C - 108} ${C + 78} ${C - 56} ${C + 88} ${C + 22}"
      fill="none" stroke="#3A210E" stroke-width="11" opacity="0.75" stroke-linecap="round"/>
     <ellipse cx="${C - 28}" cy="${C - 62}" rx="40" ry="20" fill="#fff" opacity="0.22"
      transform="rotate(-18 ${C - 28} ${C - 62})"/>`,

  // yantras
  'shree-yantra-gold':     () => metalDef('m', METALS.gold)   + shreeYantra(METALS.gold),
  'kuber-yantra-silver':   () => metalDef('m', METALS.silver) + kuberYantra(METALS.silver),
  'mahamrityunjaya-yantra':() => metalDef('m', METALS.copper) + mahamrityunjayaYantra(METALS.copper),
  'bagalamukhi-yantra':     () => metalDef('m', METALS.brass)  + bagalamukhiYantra(METALS.brass),

  // bracelets
  '7-chakra-bracelet': () => beadLoop({ count: 14, beadR: 30, loopR: 112, colours: CHAKRA }),
  'black-tourmaline-bracelet': () => beadLoop({
    count: 14, beadR: 30, loopR: 112,
    colours: [{ mid: '#2E3440', light: '#6E7686', glow: '#5A6272' }] }),
  'rose-quartz-bracelet': () => beadLoop({
    count: 14, beadR: 30, loopR: 112,
    colours: [{ mid: '#F09BB6', light: '#FFD3E0', glow: '#F5AEC6' }] }),

  // kavach
  'shani-kavach-silver': () => metalDef('m', METALS.silver) + kavach(METALS.silver, 'saturn'),
  'mangal-kavach':() => metalDef('m', METALS.copper) + kavach(METALS.copper, 'mars'),

  // murtis
  'ganesh-murti-brass-6in':  () => metalDef('m', METALS.brass) + ganesh(METALS.brass),
  'lakshmi-murti-brass-5in': () => metalDef('m', METALS.brass) + lakshmi(METALS.brass),
  'shiva-lingam-natural':    () => metalDef('m', METALS.brass) + shivaLingam(METALS.brass),

  // pyramids
  'lakshmi-yantra-pyramid': () => metalDef('m', METALS.copper) +
    pyramid({ light: METALS.copper.a, mid: METALS.copper.b, dark: METALS.copper.c, edge: METALS.copper.glow }),
  'vastu-pyramid-set-9': () => metalDef('m', METALS.copper) + pyramidSet(METALS.copper),
  'rose-quartz-pyramid': () => pyramid(STONE.rose),

  // malas
  'tulsi-mala-108': () => beadLoop({
    count: 26, beadR: 18, loopR: 122, tassel: '#9A6B3F', guru: '#573A1E',
    colours: [{ mid: '#9A6B3F', light: '#C79A6B', glow: '#B0824F' }] }),
  'sphatik-crystal-mala': () => beadLoop({
    count: 26, beadR: 18, loopR: 122, tassel: '#C8D6E6', guru: '#9AAABC',
    colours: [{ mid: '#D8E4F0', light: '#FFFFFF', glow: '#E6EEF8' }] }),
  'sandalwood-mala': () => beadLoop({
    count: 26, beadR: 18, loopR: 122, tassel: '#C39A68', guru: '#7A5836',
    colours: [{ mid: '#C39A68', light: '#E6C9A0', glow: '#D3AE7E' }] }),

  // combos
  'wealth-attraction-combo': () => combo(
    [STONE.pukhraj, { mid: '#9A6B3F', light: '#C79A6B' }, { mid: METALS.gold.b, light: METALS.gold.a }],
    METALS.gold),
  'love-harmony-combo': () => combo(
    [STONE.rose, { mid: '#F09BB6', light: '#FFD3E0' }, { mid: '#E08AAC', light: '#F5AEC6' }],
    { glow: '#F5AEC6' }),
  'navgraha-protection-combo': () => combo(
    [STONE.sapphire, { mid: '#7E4620', light: '#B4703C' }, { mid: METALS.copper.b, light: METALS.copper.a }],
    METALS.copper),
};

// ─── write them out ──────────────────────────────────────────────────────────

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img">${body}</svg>\n`;
}

const { PRODUCTS, PHOTOGRAPHED } = require('../backend/src/data/mallProducts');

fs.mkdirSync(OUT, { recursive: true });
let made = 0, skipped = 0;
const missing = [];
for (const p of PRODUCTS) {
  // A product with a real photograph does not need a drawing, and writing one
  // would leave an unused file next to the picture actually being served.
  if (PHOTOGRAPHED.includes(p.id)) { skipped++; continue; }
  const draw = ART[p.id];
  if (!draw) { missing.push(p.id); continue; }
  fs.writeFileSync(path.join(OUT, `${p.id}.svg`), svg(draw()));
  made++;
}
console.log(`drew ${made} of ${PRODUCTS.length} into frontend/public/products/` +
            (skipped ? ` (${skipped} have photographs)` : ''));
if (missing.length) {
  console.error(`no artwork defined for: ${missing.join(', ')}`);
  process.exitCode = 1;
}
