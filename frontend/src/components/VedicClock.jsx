import React, { useState, useEffect } from 'react';

const SIZE   = 160;
const RADIUS = SIZE / 2;
const pad    = n => String(n).padStart(2, '0');

export default function VedicClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hr  = time.getHours();
  const min = time.getMinutes();
  const sec = time.getSeconds();

  const degSec = (sec / 60) * 360;
  const degMin = (min / 60) * 360 + (sec / 60) * 6;
  const degHr  = ((hr % 12) / 12) * 360 + (min / 60) * 30;

  const displayHour = (hr % 12) || 12;
  const ampm        = hr >= 12 ? 'PM' : 'AM';

  // Hour tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const inner = RADIUS - 14;
    const outer = RADIUS - 6;
    return {
      x1: RADIUS + inner * Math.cos(angle),
      y1: RADIUS + inner * Math.sin(angle),
      x2: RADIUS + outer * Math.cos(angle),
      y2: RADIUS + outer * Math.sin(angle),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

      {/* ── Analog clock ── */}
      <svg width={SIZE} height={SIZE} style={{ display: 'block' }}>
        {/* Face */}
        <circle cx={RADIUS} cy={RADIUS} r={RADIUS - 2}
          fill="rgba(10,6,30,0.85)"
          stroke="rgba(201,168,76,0.7)" strokeWidth="2.5" />

        {/* Outer glow ring */}
        <circle cx={RADIUS} cy={RADIUS} r={RADIUS - 2}
          fill="none"
          stroke="rgba(201,168,76,0.15)" strokeWidth="6" />

        {/* Hour tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={i % 3 === 0 ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.4)'}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            strokeLinecap="round" />
        ))}

        {/* Hour hand */}
        <line
          x1={RADIUS} y1={RADIUS}
          x2={RADIUS + 38 * Math.sin((degHr * Math.PI) / 180)}
          y2={RADIUS - 38 * Math.cos((degHr * Math.PI) / 180)}
          stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.8))' }} />

        {/* Minute hand */}
        <line
          x1={RADIUS} y1={RADIUS}
          x2={RADIUS + 52 * Math.sin((degMin * Math.PI) / 180)}
          y2={RADIUS - 52 * Math.cos((degMin * Math.PI) / 180)}
          stroke="#E8E8E8" strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />

        {/* Second hand */}
        <line
          x1={RADIUS} y1={RADIUS}
          x2={RADIUS + 58 * Math.sin((degSec * Math.PI) / 180)}
          y2={RADIUS - 58 * Math.cos((degSec * Math.PI) / 180)}
          stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255,107,0,0.9))' }} />

        {/* Counter-weight stub on second hand */}
        <line
          x1={RADIUS} y1={RADIUS}
          x2={RADIUS - 12 * Math.sin((degSec * Math.PI) / 180)}
          y2={RADIUS + 12 * Math.cos((degSec * Math.PI) / 180)}
          stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" />

        {/* Centre pin */}
        <circle cx={RADIUS} cy={RADIUS} r={5}
          fill="radial-gradient(circle, #fff, #C9A84C)"
          stroke="#C9A84C" strokeWidth="1.5" />
        <circle cx={RADIUS} cy={RADIUS} r={2.5} fill="#fff" />
      </svg>

      {/* ── Digital clock (independent) ── */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(255,255,255,0.7), 0 0 20px rgba(255,255,255,0.3)',
        }}>
          {displayHour}:{pad(min)}:{pad(sec)}
        </span>
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '0.55rem',
          color: '#C9A84C',
          marginLeft: '5px',
          letterSpacing: '1px',
        }}>
          {ampm} IST
        </span>
      </div>

    </div>
  );
}
