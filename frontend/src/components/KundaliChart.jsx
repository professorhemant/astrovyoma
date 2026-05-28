import React from 'react';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANET_SYMBOLS = { Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋' };
const PLANET_COLORS = { Sun: '#F97316', Moon: '#93C5FD', Mars: '#EF4444', Mercury: '#10B981', Jupiter: '#FBBF24', Venus: '#F472B6', Saturn: '#6366F1', Rahu: '#8B5CF6', Ketu: '#64748B' };

function getHousePlanetCount(planetaryPositions, houseCusps) {
  const houses = {};
  for (let i = 1; i <= 12; i++) houses[i] = [];

  if (!planetaryPositions || !houseCusps) return houses;

  for (const [name, pos] of Object.entries(planetaryPositions)) {
    const deg = pos.degree;
    for (let i = 1; i <= 12; i++) {
      const cusp = houseCusps[`H${i}`]?.degree ?? ((i - 1) * 30);
      const nextCusp = houseCusps[`H${(i % 12) + 1}`]?.degree ?? (i * 30);
      let inHouse;
      if (nextCusp > cusp) {
        inHouse = deg >= cusp && deg < nextCusp;
      } else {
        inHouse = deg >= cusp || deg < nextCusp;
      }
      if (inHouse) {
        houses[i].push({ name, symbol: PLANET_SYMBOLS[name] || name[0], degree: pos.degree, retrograde: pos.retrograde, color: PLANET_COLORS[name] || '#E8C547' });
        break;
      }
    }
  }
  return houses;
}

export default function KundaliChart({ planetaryPositions, houseCusps, lagna, size = 400 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.47;
  const innerR = size * 0.32;
  const labelR = size * 0.39;
  const planetR = size * 0.24;

  const housePlanets = getHousePlanetCount(planetaryPositions, houseCusps);

  const lagnaIdx = ZODIAC_SIGNS.indexOf(lagna || 'Aries');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0F1540" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#04051A" stopOpacity="0.95" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={outerR + 5} fill="url(#chartBg)" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={size * 0.08} fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.6)" strokeWidth="1" />

      {Array.from({ length: 12 }, (_, i) => {
        const houseNum = ((i + lagnaIdx) % 12) + 1;
        const signIdx = (i + lagnaIdx) % 12;
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const midAngle = (i * 30 + 15 - 90) * (Math.PI / 180);

        const x1 = cx + innerR * Math.cos(angle);
        const y1 = cy + innerR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);
        const px = cx + planetR * Math.cos(midAngle);
        const py = cy + planetR * Math.sin(midAngle);

        const planets = housePlanets[houseNum] || [];

        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.55)" strokeWidth="1" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(232,197,71,0.95)" fontSize={size * 0.028} fontFamily="Cormorant Garamond, serif">
              {ZODIAC_SIGNS[signIdx].substring(0, 3)}
            </text>
            <text x={lx} y={ly + size * 0.032} textAnchor="middle" dominantBaseline="middle" fill="#E8C87A" fontSize={size * 0.022} fontWeight="bold">
              {houseNum}
            </text>
            {planets.map((p, pi) => {
              const offset = (pi - (planets.length - 1) / 2) * size * 0.05;
              return (
                <g key={p.name}>
                  <text
                    x={px + offset}
                    y={py}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={p.color}
                    fontSize={size * 0.032}
                    style={{ filter: `drop-shadow(0 0 3px ${p.color}80)` }}
                  >
                    {p.symbol}
                  </text>
                  {p.retrograde && (
                    <text x={px + offset + size * 0.02} y={py - size * 0.02} textAnchor="middle" fill={p.color} fontSize={size * 0.015} opacity="0.8">R</text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ASC marker */}
      <g>
        <line
          x1={cx}
          y1={cy - innerR}
          x2={cx}
          y2={cy - outerR}
          stroke="#E8C547"
          strokeWidth="2.5"
          strokeDasharray="none"
        />
        <text x={cx} y={cy - outerR - 10} textAnchor="middle" fill="#E8C547" fontSize={size * 0.025} fontWeight="bold">ASC</text>
      </g>

      <text x={cx} y={cy + size * 0.015} textAnchor="middle" dominantBaseline="middle" fill="#E8C547" fontSize={size * 0.025} fontFamily="Cormorant Garamond, serif">
        {lagna}
      </text>
      <text x={cx} y={cy - size * 0.015} textAnchor="middle" dominantBaseline="middle" fill="rgba(201,168,76,0.85)" fontSize={size * 0.018}>
        Lagna
      </text>
    </svg>
  );
}
