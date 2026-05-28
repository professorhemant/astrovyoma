import React from 'react';

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0" style={{ background: '#12093A' }} />
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 10% 20%, rgba(120,40,220,0.5) 0%, transparent 45%),
          radial-gradient(ellipse at 90% 12%, rgba(50,90,255,0.35) 0%, transparent 42%),
          radial-gradient(ellipse at 55% 65%, rgba(100,20,190,0.3) 0%, transparent 48%),
          radial-gradient(ellipse at 80% 88%, rgba(0,170,170,0.15) 0%, transparent 36%),
          radial-gradient(ellipse at 15% 82%, rgba(150,50,230,0.25) 0%, transparent 44%)
        `
      }} />
    </div>
  );
}
