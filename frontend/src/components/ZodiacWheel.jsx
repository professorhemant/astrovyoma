import React from 'react';

const ZODIAC = [
  { name: 'Aries', symbol: '♈', color: '#E8C547' },
  { name: 'Taurus', symbol: '♉', color: '#E8C547' },
  { name: 'Gemini', symbol: '♊', color: '#E8C547' },
  { name: 'Cancer', symbol: '♋', color: '#E8C547' },
  { name: 'Leo', symbol: '♌', color: '#E8C547' },
  { name: 'Virgo', symbol: '♍', color: '#E8C547' },
  { name: 'Libra', symbol: '♎', color: '#E8C547' },
  { name: 'Scorpio', symbol: '♏', color: '#E8C547' },
  { name: 'Sagittarius', symbol: '♐', color: '#E8C547' },
  { name: 'Capricorn', symbol: '♑', color: '#E8C547' },
  { name: 'Aquarius', symbol: '♒', color: '#E8C547' },
  { name: 'Pisces', symbol: '♓', color: '#E8C547' },
];

export default function ZodiacWheel({ size = 500, className = '' }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.48;
  const innerR = size * 0.35;
  const symbolR = size * 0.42;
  const nameR = size * 0.3;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.2))' }}
    >
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={size * 0.22} fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={size * 0.06} fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />

      {ZODIAC.map((sign, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const midAngle = (i * 30 + 15 - 90) * (Math.PI / 180);

        const x1 = cx + innerR * Math.cos(angle);
        const y1 = cy + innerR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);

        const sx = cx + symbolR * Math.cos(midAngle);
        const sy = cy + symbolR * Math.sin(midAngle);
        const nx = cx + nameR * Math.cos(midAngle);
        const ny = cy + nameR * Math.sin(midAngle);

        return (
          <g key={sign.name}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
            <text
              x={sx} y={sy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(232,197,71,0.8)"
              fontSize={size * 0.038}
            >
              {sign.symbol}
            </text>
            <text
              x={nx} y={ny}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(232,197,71,0.4)"
              fontSize={size * 0.022}
              fontFamily="Cormorant Garamond, serif"
            >
              {sign.name.substring(0, 3)}
            </text>
          </g>
        );
      })}

      {[0, 90, 180, 270].map((deg, i) => {
        const angle = (deg - 90) * (Math.PI / 180);
        const x1 = cx + innerR * 0.2 * Math.cos(angle);
        const y1 = cy + innerR * 0.2 * Math.sin(angle);
        const x2 = cx + innerR * Math.cos(angle);
        const y2 = cy + innerR * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.2)" strokeWidth="0.8" />;
      })}
    </svg>
  );
}
