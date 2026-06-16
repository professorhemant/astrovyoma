import React, { useState, useEffect } from 'react';

const pad = n => String(n).padStart(2, '0');

// Display size — image is 1852×2304 (portrait)
const W = 190;
const H = Math.round(W * 2304 / 1852); // 236

// Clock-face centre (Om symbol) — same proportions as original image
const CX = W * 0.50;  // 95
const CY = H * 0.49;  // ~116

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

  // Wrapper uses absolute positioning so analog and digital move independently.
  // SHIFT_DOWN pushes only the analog image lower without affecting the digital clock.
  const SHIFT_DOWN = 25;
  const DIGITAL_H  = 28;

  return (
    <div style={{ position: 'relative', width: W, height: H + DIGITAL_H, alignItems: 'center' }}>

      {/* ── Analog clock — shifted down independently ── */}
      <div style={{ position: 'absolute', top: SHIFT_DOWN, left: '50%', transform: 'translateX(-50%)' }}>
      <div style={{ position: 'relative', width: W, height: H }}>

        <img
          src="/vedic-clock-gemini.png"
          alt="Vedic Clock"
          style={{ width: W, height: H, display: 'block', objectFit: 'fill' }}
        />

        {/* ── Animated hands ── */}
        <div style={{ position: 'absolute', left: CX, top: CY, width: 0, height: 0, zIndex: 3 }}>

          {/* Hour hand */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 7, height: 42, marginLeft: -3.5,
            transformOrigin: 'bottom center',
            transform: `rotate(${degHr}deg)`,
            background: 'linear-gradient(to top, #c9a84c 55%, #ffffff 100%)',
            borderRadius: '3px 3px 1px 1px',
            clipPath: 'polygon(50% 0%,100% 18%,72% 100%,28% 100%,0% 18%)',
            filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.9))',
          }} />

          {/* Minute hand */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 5, height: 58, marginLeft: -2.5,
            transformOrigin: 'bottom center',
            transform: `rotate(${degMin}deg)`,
            background: 'linear-gradient(to top, #f0f0f0 55%, #a8ecf5 100%)',
            borderRadius: '2px 2px 1px 1px',
            clipPath: 'polygon(50% 0%,100% 14%,70% 100%,30% 100%,0% 14%)',
            filter: 'drop-shadow(0 0 5px rgba(168,236,245,0.9))',
          }} />

          {/* Second hand */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 1.5, height: 65, marginLeft: -0.75,
            transformOrigin: 'bottom center',
            transform: `rotate(${degSec}deg)`,
            background: 'linear-gradient(to top, #ff6b00, #ffaa00)',
            filter: 'drop-shadow(0 0 3px rgba(255,120,0,0.9))',
          }} />

          {/* Centre pin */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 12, height: 12,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, #c9a84c 55%, #5a3e22 100%)',
            boxShadow: '0 0 6px rgba(201,168,76,0.9)',
            zIndex: 4,
          }} />
        </div>

      </div>
      </div>

      {/* ── Digital clock — fixed at bottom, unaffected by analog shift ── */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap' }}>
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
