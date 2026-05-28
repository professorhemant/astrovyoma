import React, { useState, useEffect } from 'react';

const VEDIC_ENG = {
  1:  'Ishwar: The One Supreme Divine',
  2:  'Paksha: The Two Lunar Fortnights',
  3:  'Triguna: The Three Sacred Cosmic Qualities',
  4:  'Veda: The Four Eternal Vedas',
  5:  'Prana: The Five Vital Life Forces',
  6:  'Shaddarshan: The Six Vedic Philosophies',
  7:  'Saptarishi: The Seven Celestial Sages',
  8:  'Ashtasiddhi: The Eight Divine Attainments',
  9:  'Navagraha: The Nine Cosmic Planets',
  10: 'Dashadik: The Ten Directions of Space',
  11: 'Rudra: The Eleven Sacred Manifestations',
  12: 'Aditya: The Twelve Solar Deities',
};

const pad = n => String(n).padStart(2, '0');

// Display size (image is 1852×2304, ratio preserved)
const W = 180;
const H = Math.round(W * 2304 / 1852); // 224

// Clock-face centre (Om symbol) — tweak CY if hands are off
const CX = W * 0.50;   // 130
const CY = H * 0.49;   // ~158

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: W, height: H }}>

        {/* Background image — mask fades edges into hero banner */}
        <img
          src="/vedic-clock-bg.png"
          alt="Vedic Clock"
          style={{
            width: W, height: H,
            objectFit: 'fill',
            display: 'block',
            WebkitMaskImage: 'radial-gradient(ellipse 88% 94% at 50% 44%, black 58%, transparent 88%)',
            maskImage:        'radial-gradient(ellipse 88% 94% at 50% 44%, black 58%, transparent 88%)',
          }}
        />



        {/* Hide static digital text from image — blends with image bg */}
        <div style={{
          position: 'absolute',
          top: H * 0.765,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 175, height: 30,
          background: 'linear-gradient(to bottom, #181D21, #232221)',
          zIndex: 2,
        }} />

        {/* ── Animated clock hands ── */}
        <div style={{ position: 'absolute', left: CX, top: CY, width: 0, height: 0, zIndex: 3 }}>

          {/* Hour hand */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 7, height: 50, marginLeft: -3.5,
            transformOrigin: 'bottom center',
            transform: `rotate(${degHr}deg)`,
            background: 'linear-gradient(to top, #c9a84c 55%, #a8ecf5 100%)',
            borderRadius: '3px 3px 1px 1px',
            clipPath: 'polygon(50% 0%,100% 18%,72% 100%,28% 100%,0% 18%)',
            filter: 'drop-shadow(0 0 5px rgba(168,236,245,0.85))',
          }} />

          {/* Minute hand */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 5, height: 70, marginLeft: -2.5,
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
            width: 1.5, height: 76, marginLeft: -0.75,
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

        {/* ── Live digital display ── */}
        <div style={{
          position: 'absolute',
          top: H * 0.783,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3, textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '1.25rem',
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: '3px',
            textShadow: '0 0 10px rgba(255,255,255,0.75), 0 0 22px rgba(255,255,255,0.3)',
          }}>
            {displayHour}:{pad(min)}:{pad(sec)}
          </span>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '0.55rem', color: '#aaa', marginLeft: 5 }}>
            {ampm} IST
          </span>
        </div>


      </div>
    </div>
  );
}
