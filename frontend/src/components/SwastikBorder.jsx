import React from 'react';

function SwastikSVG({ size = 20 }) {
  const s = size / 2;
  const t = size / 6.5;
  return (
    <svg width={size} height={size} viewBox={`-${s} -${s} ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect x={-s} y={-t/2} width={size} height={t} fill="rgba(201,168,76,0.85)" />
      <rect x={-t/2} y={-s} width={t} height={size} fill="rgba(201,168,76,0.85)" />
      <rect x={t/2} y={-s} width={s-t/2} height={t} fill="rgba(201,168,76,0.85)" />
      <rect x={s-t} y={t/2} width={t} height={s-t/2} fill="rgba(201,168,76,0.85)" />
      <rect x={-s} y={s-t} width={s-t/2} height={t} fill="rgba(201,168,76,0.85)" />
      <rect x={-s} y={-s} width={t} height={s-t/2} fill="rgba(201,168,76,0.85)" />
    </svg>
  );
}

export default function SwastikBorder() {
  const m = 10;
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ inset: m, border: '1.5px solid rgba(201,168,76,0.35)', borderRadius: 2 }}
    >
      <div className="absolute" style={{ top: -12, left: -12 }}><SwastikSVG /></div>
      <div className="absolute" style={{ top: -12, right: -12, transform: 'rotate(90deg)' }}><SwastikSVG /></div>
      <div className="absolute" style={{ bottom: -12, left: -12, transform: 'rotate(270deg)' }}><SwastikSVG /></div>
      <div className="absolute" style={{ bottom: -12, right: -12, transform: 'rotate(180deg)' }}><SwastikSVG /></div>
    </div>
  );
}
