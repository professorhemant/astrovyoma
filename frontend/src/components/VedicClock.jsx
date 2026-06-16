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
