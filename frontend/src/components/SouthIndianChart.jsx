import React from 'react';

// South Indian Kundali Chart — traditional AstroSage style
// Fixed sign grid (4×4, center 2×2 empty). Signs fixed; houses rotate by Lagna.

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_ABBR = ['Ari','Tau','Gem','Can','Leo','Vir',
                   'Lib','Sco','Sag','Cap','Aqu','Pis'];

// (row, col) → sign index (0-based). -1 = center cell
const GRID = [
  [11, 0, 1, 2],
  [10, -1, -1, 3],
  [ 9, -1, -1, 4],
  [ 8, 7, 6, 5],
];

const PLANET_ABBR = {
  Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me',
  Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke',
};

// Traditional Vedic planet colors (AstroSage palette)
const PLANET_COLORS = {
  Sun:     '#CC3300',
  Moon:    '#0044CC',
  Mars:    '#CC0000',
  Mercury: '#006600',
  Jupiter: '#CC6600',
  Venus:   '#7700AA',
  Saturn:  '#222244',
  Rahu:    '#555555',
  Ketu:    '#884400',
};

export default function SouthIndianChart({ planetaryPositions = {}, lagna = 'Aries', size = 400, title = 'Janma\nKundali' }) {
  const lagnaIdx = SIGNS.indexOf(lagna);
  const cellSize = size / 4;
  const pad = size * 0.018;

  // Build sign → planets mapping
  const signPlanets = {};
  for (let i = 0; i < 12; i++) signPlanets[i] = [];

  for (const [pName, pos] of Object.entries(planetaryPositions)) {
    const sIdx = pos.sign_index ?? SIGNS.indexOf(pos.sign);
    if (sIdx >= 0) {
      signPlanets[sIdx].push({ name: pName, retrograde: pos.retrograde });
    }
  }

  const houseNumFontSize = size * 0.042;
  const signFontSize     = size * 0.034;
  const planetFontSize   = size * 0.042;
  const lagnaFontSize    = size * 0.03;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ fontFamily: 'Georgia, "Times New Roman", serif', display: 'block' }}
    >
      {/* White background */}
      <rect width={size} height={size} fill="#FFFEF8" rx="2" />

      {GRID.map((row, ri) =>
        row.map((signIdx, ci) => {
          const x = ci * cellSize;
          const y = ri * cellSize;

          // Center 2×2 block
          if (signIdx === -1) {
            const isCenterTL = ri === 1 && ci === 1;
            if (!isCenterTL) return null;
            return (
              <g key="center">
                <rect
                  x={cellSize} y={cellSize}
                  width={cellSize * 2} height={cellSize * 2}
                  fill="#FFFEF8" stroke="#333" strokeWidth="1"
                />
                {/* Decorative diagonal lines — traditional chart centre */}
                <line x1={cellSize} y1={cellSize} x2={cellSize * 3} y2={cellSize * 3}
                  stroke="#CCBBAA" strokeWidth="0.8" />
                <line x1={cellSize * 3} y1={cellSize} x2={cellSize} y2={cellSize * 3}
                  stroke="#CCBBAA" strokeWidth="0.8" />
                {title.split('\n').map((line, i, arr) => (
                  <text key={i}
                    x={size / 2}
                    y={size / 2 + (i - (arr.length - 1) / 2) * size * 0.062}
                    textAnchor="middle" fill="#663300"
                    fontSize={size * 0.038} fontWeight="bold" fontFamily="Georgia, serif">
                    {line}
                  </text>
                ))}
              </g>
            );
          }

          const houseNum = ((signIdx - lagnaIdx + 12) % 12) + 1;
          const isLagnaCell = signIdx === lagnaIdx;
          const planets = signPlanets[signIdx] || [];

          return (
            <g key={`cell-${ri}-${ci}`}>
              {/* Cell background */}
              <rect
                x={x} y={y} width={cellSize} height={cellSize}
                fill={isLagnaCell ? '#FFF8E0' : '#FFFEF8'}
                stroke="#333333" strokeWidth="1"
              />

              {/* Lagna: top-right filled triangle */}
              {isLagnaCell && (
                <polygon
                  points={`${x + cellSize - cellSize * 0.28},${y}  ${x + cellSize},${y}  ${x + cellSize},${y + cellSize * 0.28}`}
                  fill="#CC6600" opacity="0.85"
                />
              )}

              {/* House number — top-left */}
              <text
                x={x + pad} y={y + houseNumFontSize * 0.9 + pad}
                fill="#333333" fontSize={houseNumFontSize} fontWeight="bold"
              >
                {houseNum}
              </text>

              {/* Sign abbreviation — top-right (pushed left of lagna triangle if lagna) */}
              <text
                x={x + cellSize - pad - (isLagnaCell ? cellSize * 0.3 : 0)}
                y={y + signFontSize * 0.9 + pad}
                textAnchor="end" fill="#666644" fontSize={signFontSize}
              >
                {SIGN_ABBR[signIdx]}
              </text>

              {/* Lagna label below triangle */}
              {isLagnaCell && (
                <text
                  x={x + cellSize - pad} y={y + signFontSize * 0.9 + pad + lagnaFontSize + 1}
                  textAnchor="end" fill="#CC6600" fontSize={lagnaFontSize} fontWeight="bold"
                >
                  Lag
                </text>
              )}

              {/* Planets — stacked centrally */}
              {planets.map((p, pi) => {
                const col = PLANET_COLORS[p.name] || '#333333';
                const abbr = PLANET_ABBR[p.name] || p.name.substring(0, 2);
                const totalPlanets = planets.length;
                const startY = y + cellSize * 0.5 - ((totalPlanets - 1) * planetFontSize * 0.62) / 2;
                const py = startY + pi * planetFontSize * 0.62;
                return (
                  <text key={p.name}
                    x={x + cellSize / 2} y={py}
                    textAnchor="middle"
                    fill={col}
                    fontSize={planetFontSize}
                    fontWeight="bold"
                  >
                    {abbr}{p.retrograde ? '(R)' : ''}
                  </text>
                );
              })}
            </g>
          );
        })
      )}

      {/* Outer border */}
      <rect x={0.5} y={0.5} width={size - 1} height={size - 1}
        fill="none" stroke="#333333" strokeWidth="2" rx="1" />
    </svg>
  );
}
