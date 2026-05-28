import React from 'react';

// North Indian Kundali Chart — traditional diamond/lozenge style
// House positions FIXED (H1 always top). Signs rotate by Lagna.
// Style matches classic Indian astrology software (full Hindi sign names, OM centre)

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_HI = [
  'मेष राशि','वृष राशि','मिथुन राशि','कर्क राशि','सिंह राशि','कन्या राशि',
  'तुला राशि','वृश्चिक राशि','धनु राशि','मकर राशि','कुंभ राशि','मीन राशि',
];

const PLANET_HI = {
  Sun:'सूर्य', Moon:'चंद्र', Mars:'मंगल', Mercury:'बुध',
  Jupiter:'बृहस्पति', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु',
};

const PLANET_COLORS = {
  Sun:'#CC2200', Moon:'#0033BB', Mars:'#BB0000', Mercury:'#006600',
  Jupiter:'#CC5500', Venus:'#770099', Saturn:'#222255',
  Rahu:'#555555', Ketu:'#774400',
};

// 12 house cells — polygon vertices (normalised 0–1) + visual text centre
const HOUSE_DEFS = [
  { h:1,  pts:[[.5,0],[.75,.25],[.5,.5],[.25,.25]], cx:.500, cy:.220 },
  { h:4,  pts:[[1,.5],[.75,.75],[.5,.5],[.75,.25]], cx:.785, cy:.500 },
  { h:7,  pts:[[.5,1],[.25,.75],[.5,.5],[.75,.75]], cx:.500, cy:.780 },
  { h:10, pts:[[0,.5],[.25,.25],[.5,.5],[.25,.75]], cx:.215, cy:.500 },
  { h:2,  pts:[[1,0],[.5,0],[.75,.25]],             cx:.730, cy:.118 },
  { h:3,  pts:[[1,0],[.75,.25],[1,.5]],             cx:.905, cy:.255 },
  { h:5,  pts:[[1,1],[1,.5],[.75,.75]],             cx:.905, cy:.745 },
  { h:6,  pts:[[1,1],[.75,.75],[.5,1]],             cx:.730, cy:.882 },
  { h:8,  pts:[[0,1],[.5,1],[.25,.75]],             cx:.270, cy:.882 },
  { h:9,  pts:[[0,1],[.25,.75],[0,.5]],             cx:.095, cy:.745 },
  { h:11, pts:[[0,0],[0,.5],[.25,.25]],             cx:.095, cy:.255 },
  { h:12, pts:[[0,0],[.25,.25],[.5,0]],             cx:.270, cy:.118 },
];

export default function NorthIndianChart({
  planetaryPositions = {},
  lagna = 'Aries',
  size = 400,
  title = 'ॐ',
}) {
  const lagnaIdx = Math.max(0, SIGNS.indexOf(lagna));

  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  for (const [pName, pos] of Object.entries(planetaryPositions)) {
    const sIdx = pos.sign_index ?? SIGNS.indexOf(pos.sign);
    if (sIdx >= 0) {
      const hNum = ((sIdx - lagnaIdx + 12) % 12) + 1;
      housePlanets[hNum].push({ name: pName, retrograde: !!pos.retrograde });
    }
  }

  const hnFS  = size * 0.038;
  const sigFS = size * 0.026;
  const plFS  = size * 0.036;

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ fontFamily: '"Noto Sans Devanagari","Mangal","Arial Unicode MS",sans-serif', display:'block' }}
    >
      {/* Saffron background */}
      <rect width={size} height={size} fill="#FFF8EC" rx="2" />

      {HOUSE_DEFS.map(({ h, pts, cx, cy }) => {
        const isLagna = h === 1;
        const signIdx = (lagnaIdx + h - 1) % 12;
        const planets = housePlanets[h] || [];
        const polyPts = pts.map(([x, y]) => `${x * size},${y * size}`).join(' ');

        const hnY  = (cy - 0.044) * size;
        const sigY = (cy + 0.000) * size;
        const lagY = (cy + 0.040) * size;
        const pl0Y = isLagna ? (cy + 0.068) * size : (cy + 0.046) * size;

        return (
          <g key={h}>
            <polygon
              points={polyPts}
              fill={isLagna ? '#FFE8C0' : '#FFF8EC'}
              stroke="#CC6600"
              strokeWidth="1"
            />

            {isLagna && (
              <polygon
                points={`${.50*size},${0} ${.62*size},${0} ${.50*size},${.058*size}`}
                fill="#CC6600" opacity="0.9"
              />
            )}

            {/* House number */}
            <text x={cx * size} y={hnY}
              textAnchor="middle" dominantBaseline="middle"
              fill="#444444" fontSize={hnFS} fontWeight="bold">
              {h}
            </text>

            {/* Full Hindi sign name */}
            <text x={cx * size} y={sigY}
              textAnchor="middle" dominantBaseline="middle"
              fill="#885500" fontSize={sigFS}>
              {SIGN_HI[signIdx]}
            </text>

            {isLagna && (
              <text x={cx * size} y={lagY}
                textAnchor="middle" dominantBaseline="middle"
                fill="#CC5500" fontSize={sigFS * 0.9} fontWeight="bold">
                लग्न
              </text>
            )}

            {planets.map((p, pi) => (
              <text key={p.name}
                x={cx * size}
                y={pl0Y + pi * plFS * 0.72}
                textAnchor="middle" dominantBaseline="middle"
                fill={PLANET_COLORS[p.name] || '#333333'}
                fontSize={plFS}
                fontWeight="bold">
                {(PLANET_HI[p.name] || p.name)}{p.retrograde ? '(व)' : ''}
              </text>
            ))}
          </g>
        );
      })}

      {/* Centre: title (supports \n for two lines) */}
      {title.split('\n').map((line, i, arr) => (
        <text key={i}
          x={size / 2}
          y={size / 2 + (i - (arr.length - 1) / 2) * size * 0.058}
          textAnchor="middle" dominantBaseline="middle"
          fill="#CC5500"
          fontSize={arr.length === 1 ? size * 0.072 : size * 0.040}
          fontWeight="bold">
          {line}
        </text>
      ))}

      {/* Outer border */}
      <rect x="0.5" y="0.5" width={size - 1} height={size - 1}
        fill="none" stroke="#CC6600" strokeWidth="2" rx="1" />
    </svg>
  );
}
