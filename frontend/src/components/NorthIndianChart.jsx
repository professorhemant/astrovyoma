import React from 'react';

// North Indian Kundali Chart — traditional diamond/lozenge style
// House positions are FIXED (H1 always top). Signs rotate by Lagna.
//
// Geometry: outer square + inner diamond (midpoints) + two full diagonals
// creates exactly 12 cells: 4 inner kites (H1,4,7,10) + 8 outer triangles.

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_ABBR = ['मेष','वृष','मिथ','कर्क','सिंह','कन्या',
                   'तुला','वृश्चि','धनु','मकर','कुंभ','मीन'];
const PLANET_ABBR = {
  Sun:'सूर्य', Moon:'चंद्र', Mars:'मंगल', Mercury:'बुध',
  Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु',
};
const PLANET_COLORS = {
  Sun:'#CC3300', Moon:'#0044CC', Mars:'#CC0000', Mercury:'#006600',
  Jupiter:'#CC6600', Venus:'#7700AA', Saturn:'#222244',
  Rahu:'#555555', Ketu:'#884400',
};

// Key geometry points (normalised 0–1):
//   Diamond vertices: T(0.5,0) R(1,0.5) B(0.5,1) L(0,0.5)
//   Diagonal↔diamond edge intersections: TL(0.25,0.25) TR(0.75,0.25) BR(0.75,0.75) BL(0.25,0.75)
//   Outer corners: (0,0) (1,0) (1,1) (0,1)   Centre: (0.5,0.5)
//
// 12 house cells (cx,cy = visual centre for text):
const HOUSE_DEFS = [
  // ── Inner kites (Kendra) ──────────────────────────────────────────
  { h:1,  pts:[[.5,0],[.75,.25],[.5,.5],[.25,.25]], cx:.500, cy:.220 }, // top   — Lagna
  { h:4,  pts:[[1,.5],[.75,.75],[.5,.5],[.75,.25]], cx:.785, cy:.500 }, // right
  { h:7,  pts:[[.5,1],[.25,.75],[.5,.5],[.75,.75]], cx:.500, cy:.780 }, // bottom
  { h:10, pts:[[0,.5],[.25,.25],[.5,.5],[.25,.75]], cx:.215, cy:.500 }, // left
  // ── Outer triangles (clockwise from top-right) ───────────────────
  { h:2,  pts:[[1,0],[.5,0],[.75,.25]],             cx:.730, cy:.118 }, // TR upper
  { h:3,  pts:[[1,0],[.75,.25],[1,.5]],             cx:.905, cy:.255 }, // TR lower
  { h:5,  pts:[[1,1],[1,.5],[.75,.75]],             cx:.905, cy:.745 }, // BR upper
  { h:6,  pts:[[1,1],[.75,.75],[.5,1]],             cx:.730, cy:.882 }, // BR lower
  { h:8,  pts:[[0,1],[.5,1],[.25,.75]],             cx:.270, cy:.882 }, // BL lower
  { h:9,  pts:[[0,1],[.25,.75],[0,.5]],             cx:.095, cy:.745 }, // BL upper
  { h:11, pts:[[0,0],[0,.5],[.25,.25]],             cx:.095, cy:.255 }, // TL lower
  { h:12, pts:[[0,0],[.25,.25],[.5,0]],             cx:.270, cy:.118 }, // TL upper
];

export default function NorthIndianChart({ planetaryPositions = {}, lagna = 'Aries', size = 400 }) {
  const lagnaIdx = Math.max(0, SIGNS.indexOf(lagna));

  // Map each planet to its house number
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  for (const [pName, pos] of Object.entries(planetaryPositions)) {
    const sIdx = pos.sign_index ?? SIGNS.indexOf(pos.sign);
    if (sIdx >= 0) {
      const hNum = ((sIdx - lagnaIdx + 12) % 12) + 1;
      housePlanets[hNum].push({ name: pName, retrograde: !!pos.retrograde });
    }
  }

  const hnFS  = size * 0.040; // house-number font size
  const sigFS = size * 0.033; // sign abbreviation font size
  const plFS  = size * 0.041; // planet abbreviation font size

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ fontFamily: '"Noto Sans Devanagari", "Mangal", "Arial Unicode MS", sans-serif', display: 'block' }}
    >
      {/* Background */}
      <rect width={size} height={size} fill="#FFFEF8" rx="2" />

      {HOUSE_DEFS.map(({ h, pts, cx, cy }) => {
        const isLagna  = h === 1;
        const signIdx  = (lagnaIdx + h - 1) % 12;
        const planets  = housePlanets[h] || [];
        const polyPts  = pts.map(([x, y]) => `${x * size},${y * size}`).join(' ');

        // Vertical layout inside each cell
        const hnY   = (cy - 0.042) * size;      // house number
        const sigY  = (cy + 0.002) * size;      // sign abbreviation
        const lagY  = (cy + 0.042) * size;      // "Lag" label (H1 only)
        const pl0Y  = isLagna                   // first planet baseline
          ? (cy + 0.068) * size
          : (cy + 0.045) * size;

        return (
          <g key={h}>
            {/* Cell fill + border */}
            <polygon
              points={polyPts}
              fill={isLagna ? '#FFF8E0' : '#FFFEF8'}
              stroke="#333333"
              strokeWidth="0.9"
            />

            {/* Lagna corner triangle (top-right of H1 kite's top edge) */}
            {isLagna && (
              <polygon
                points={`${.50*size},${0} ${.62*size},${0} ${.50*size},${.058*size}`}
                fill="#CC6600"
                opacity="0.85"
              />
            )}

            {/* House number */}
            <text x={cx * size} y={hnY}
              textAnchor="middle" dominantBaseline="middle"
              fill="#444444" fontSize={hnFS} fontWeight="bold">
              {h}
            </text>

            {/* Sign abbreviation */}
            <text x={cx * size} y={sigY}
              textAnchor="middle" dominantBaseline="middle"
              fill="#887755" fontSize={sigFS}>
              {SIGN_ABBR[signIdx]}
            </text>

            {/* "लग्न" marker for House 1 */}
            {isLagna && (
              <text x={cx * size} y={lagY}
                textAnchor="middle" dominantBaseline="middle"
                fill="#CC6600" fontSize={sigFS * 0.88} fontWeight="bold">
                लग्न
              </text>
            )}

            {/* Planet abbreviations, stacked downward */}
            {planets.map((p, pi) => (
              <text key={p.name}
                x={cx * size}
                y={pl0Y + pi * plFS * 0.68}
                textAnchor="middle" dominantBaseline="middle"
                fill={PLANET_COLORS[p.name] || '#333333'}
                fontSize={plFS}
                fontWeight="bold">
                {(PLANET_ABBR[p.name] || p.name.slice(0, 2))}{p.retrograde ? '(व)' : ''}
              </text>
            ))}
          </g>
        );
      })}

      {/* Centre label */}
      <text x={size / 2} y={size / 2 - size * 0.028}
        textAnchor="middle" dominantBaseline="middle"
        fill="#663300" fontSize={size * 0.036} fontWeight="bold">
        जन्म
      </text>
      <text x={size / 2} y={size / 2 + size * 0.028}
        textAnchor="middle" dominantBaseline="middle"
        fill="#663300" fontSize={size * 0.036} fontWeight="bold">
        कुंडली
      </text>

      {/* Outer border */}
      <rect x="0.5" y="0.5" width={size - 1} height={size - 1}
        fill="none" stroke="#333333" strokeWidth="2" rx="1" />
    </svg>
  );
}
