import React from 'react';

export default function ZodiacIcon({ sign, size = 64 }) {
  const id = `zg${sign}`;
  const gf = `url(#${id})`;
  const sk = { fill: gf, stroke: '#5C3A00', strokeWidth: 1.2 };
  const skn = { fill: gf, stroke: 'none' };

  const Defs = () => (
    <defs>
      <linearGradient id={id} x1="10%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#FFF0A0" />
        <stop offset="35%" stopColor="#D4A017" />
        <stop offset="100%" stopColor="#7A5000" />
      </linearGradient>
    </defs>
  );

  const icons = {

    Aries: (
      <>
        <Defs />
        {/* Left horn curling inward */}
        <path d="M50 78 L50 58 C50 52 44 46 36 48 C26 50 20 42 24 33 C27 25 37 23 43 30 C47 34 46 43 41 47 C39 49 38 53 39 58" {...sk} strokeLinejoin="round" />
        {/* Right horn curling inward */}
        <path d="M50 78 L50 58 C50 52 56 46 64 48 C74 50 80 42 76 33 C73 25 63 23 57 30 C53 34 54 43 59 47 C61 49 62 53 61 58" {...sk} strokeLinejoin="round" />
        <ellipse cx="50" cy="62" rx="8" ry="5" {...skn} />
      </>
    ),

    Taurus: (
      <>
        <Defs />
        {/* Head */}
        <circle cx="50" cy="62" r="22" {...sk} />
        {/* Left horn */}
        <path d="M32 46 C27 36 22 25 30 17 C35 11 43 16 41 28" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Right horn */}
        <path d="M68 46 C73 36 78 25 70 17 C65 11 57 16 59 28" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Nostril dots */}
        <circle cx="44" cy="70" r="3" fill="#5C3A00" />
        <circle cx="56" cy="70" r="3" fill="#5C3A00" />
        {/* Eyes */}
        <circle cx="41" cy="58" r="3.5" fill="#5C3A00" />
        <circle cx="59" cy="58" r="3.5" fill="#5C3A00" />
      </>
    ),

    Gemini: (
      <>
        <Defs />
        {/* Top bar */}
        <rect x="15" y="12" width="70" height="8" rx="4" {...sk} />
        {/* Bottom bar */}
        <rect x="15" y="80" width="70" height="8" rx="4" {...sk} />
        {/* Left pillar */}
        <rect x="20" y="20" width="14" height="60" rx="4" {...sk} />
        {/* Right pillar */}
        <rect x="66" y="20" width="14" height="60" rx="4" {...sk} />
        {/* Middle connector */}
        <rect x="34" y="46" width="32" height="8" rx="4" {...sk} />
      </>
    ),

    Cancer: (
      <>
        <Defs />
        {/* Body */}
        <ellipse cx="50" cy="54" rx="18" ry="15" {...sk} />
        {/* Left big claw */}
        <path d="M32 54 C22 46 14 38 18 28 C21 20 30 22 30 30" {...sk} fill="none" strokeWidth="6" strokeLinecap="round" />
        <path d="M32 46 C24 36 20 26 26 20 C30 15 38 18 36 26" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Right big claw */}
        <path d="M68 54 C78 46 86 38 82 28 C79 20 70 22 70 30" {...sk} fill="none" strokeWidth="6" strokeLinecap="round" />
        <path d="M68 46 C76 36 80 26 74 20 C70 15 62 18 64 26" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Legs */}
        <line x1="38" y1="66" x2="30" y2="80" stroke={gf} strokeWidth="5" strokeLinecap="round" />
        <line x1="44" y1="68" x2="40" y2="84" stroke={gf} strokeWidth="5" strokeLinecap="round" />
        <line x1="56" y1="68" x2="60" y2="84" stroke={gf} strokeWidth="5" strokeLinecap="round" />
        <line x1="62" y1="66" x2="70" y2="80" stroke={gf} strokeWidth="5" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="44" cy="50" r="2.5" fill="#5C3A00" />
        <circle cx="56" cy="50" r="2.5" fill="#5C3A00" />
      </>
    ),

    Leo: (
      <>
        <Defs />
        {/* Mane rays */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
          <ellipse key={i} cx={50 + 32 * Math.cos(angle * Math.PI / 180)} cy={50 + 32 * Math.sin(angle * Math.PI / 180)}
            rx="7" ry="11"
            transform={`rotate(${angle}, ${50 + 32 * Math.cos(angle * Math.PI / 180)}, ${50 + 32 * Math.sin(angle * Math.PI / 180)})`}
            {...skn} opacity="0.85" />
        ))}
        {/* Face */}
        <circle cx="50" cy="50" r="24" {...sk} />
        {/* Eyes */}
        <circle cx="42" cy="46" r="4" fill="#5C3A00" />
        <circle cx="58" cy="46" r="4" fill="#5C3A00" />
        <circle cx="43" cy="45" r="1.5" fill="#FFF0A0" />
        <circle cx="59" cy="45" r="1.5" fill="#FFF0A0" />
        {/* Nose */}
        <path d="M46 55 C48 58 52 58 54 55" stroke="#5C3A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="54" r="2" fill="#5C3A00" />
        {/* Mouth */}
        <path d="M44 62 C47 66 53 66 56 62" stroke="#5C3A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="26" y1="56" x2="38" y2="58" stroke="#5C3A00" strokeWidth="1" />
        <line x1="26" y1="60" x2="38" y2="60" stroke="#5C3A00" strokeWidth="1" />
        <line x1="62" y1="58" x2="74" y2="56" stroke="#5C3A00" strokeWidth="1" />
        <line x1="62" y1="60" x2="74" y2="60" stroke="#5C3A00" strokeWidth="1" />
      </>
    ),

    Virgo: (
      <>
        <Defs />
        {/* Head */}
        <ellipse cx="50" cy="26" rx="16" ry="18" {...sk} />
        {/* Hair flowing */}
        <path d="M34 20 C26 14 24 8 30 6 C36 4 40 10 38 18" {...skn} />
        <path d="M66 20 C74 14 76 8 70 6 C64 4 60 10 62 18" {...skn} />
        <path d="M34 26 C24 30 20 40 24 50 C26 56 30 58 34 56" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Body/robe */}
        <path d="M34 40 L30 85 L70 85 L66 40 C60 44 54 46 50 46 C46 46 40 44 34 40 Z" {...sk} />
        {/* Shoulders */}
        <ellipse cx="50" cy="42" rx="18" ry="8" {...sk} />
        {/* Face features */}
        <ellipse cx="44" cy="24" rx="2.5" ry="3" fill="#5C3A00" />
        <ellipse cx="56" cy="24" rx="2.5" ry="3" fill="#5C3A00" />
        <path d="M46 32 C48 34 52 34 54 32" stroke="#5C3A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Wheat stalks */}
        <line x1="66" y1="58" x2="80" y2="30" stroke={gf} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="80" cy="26" rx="5" ry="8" fill={gf} stroke="#5C3A00" strokeWidth="1" transform="rotate(-15,80,26)" />
        <line x1="70" y1="50" x2="82" y2="28" stroke={gf} strokeWidth="3" strokeLinecap="round" />
      </>
    ),

    Libra: (
      <>
        <Defs />
        {/* Base stand */}
        <rect x="40" y="78" width="20" height="6" rx="3" {...sk} />
        {/* Center pole */}
        <rect x="47" y="38" width="6" height="42" rx="3" {...sk} />
        {/* Balance beam */}
        <rect x="12" y="34" width="76" height="7" rx="3.5" {...sk} />
        {/* Left pan chain */}
        <line x1="20" y1="41" x2="20" y2="55" stroke={gf} strokeWidth="3" strokeLinecap="round" />
        {/* Left pan */}
        <path d="M10 55 Q20 70 30 55 Z" {...sk} />
        {/* Right pan chain */}
        <line x1="80" y1="41" x2="80" y2="55" stroke={gf} strokeWidth="3" strokeLinecap="round" />
        {/* Right pan */}
        <path d="M70 55 Q80 70 90 55 Z" {...sk} />
        {/* Top gem */}
        <polygon points="50,8 56,20 44,20" {...sk} />
        <polygon points="50,34 56,22 44,22" fill="#5C3A00" stroke="none" />
      </>
    ),

    Scorpio: (
      <>
        <Defs />
        {/* Body */}
        <ellipse cx="40" cy="48" rx="22" ry="16" {...sk} />
        {/* Head */}
        <ellipse cx="40" cy="32" rx="12" ry="10" {...sk} />
        {/* Claws */}
        <path d="M22 36 C12 28 8 18 16 12 C20 8 26 12 24 20" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        <path d="M22 28 C14 20 14 12 20 10 C24 8 28 14 26 20" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
        {/* Legs */}
        <line x1="28" y1="58" x2="22" y2="72" stroke={gf} strokeWidth="4" strokeLinecap="round" />
        <line x1="36" y1="62" x2="32" y2="76" stroke={gf} strokeWidth="4" strokeLinecap="round" />
        <line x1="44" y1="62" x2="46" y2="76" stroke={gf} strokeWidth="4" strokeLinecap="round" />
        <line x1="52" y1="58" x2="58" y2="72" stroke={gf} strokeWidth="4" strokeLinecap="round" />
        {/* Tail segments */}
        <path d="M62 48 C72 44 78 38 76 30 C74 22 68 20 64 24 C60 28 62 36 68 36 C72 36 74 32 72 28" {...sk} fill="none" strokeWidth="6" strokeLinecap="round" />
        {/* Stinger */}
        <polygon points="72,28 66,16 78,20" {...sk} />
        {/* Eyes */}
        <circle cx="36" cy="30" r="2.5" fill="#5C3A00" />
        <circle cx="44" cy="30" r="2.5" fill="#5C3A00" />
      </>
    ),

    Sagittarius: (
      <>
        <Defs />
        {/* Arrow shaft */}
        <line x1="15" y1="85" x2="75" y2="15" stroke={gf} strokeWidth="8" strokeLinecap="round" />
        {/* Arrowhead */}
        <polygon points="75,15 58,22 68,32" {...sk} />
        {/* Tail feathers */}
        <path d="M15 85 C10 78 8 72 14 70" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
        <path d="M15 85 C8 82 6 76 12 74" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
        <path d="M15 85 C14 76 16 70 22 70" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
        {/* Cross bar */}
        <line x1="30" y1="70" x2="60" y2="40" stroke={gf} strokeWidth="5" strokeLinecap="round" />
        <line x1="25" y1="58" x2="50" y2="52" stroke={gf} strokeWidth="5" strokeLinecap="round" />
      </>
    ),

    Capricorn: (
      <>
        <Defs />
        {/* Goat head */}
        <ellipse cx="36" cy="28" rx="18" ry="16" {...sk} />
        {/* Beard */}
        <path d="M28 40 C26 50 28 58 32 60" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Horn */}
        <path d="M42 14 C46 6 56 4 60 10 C64 16 58 24 52 22 C46 20 44 14 48 12" {...sk} fill="none" strokeWidth="5" strokeLinecap="round" />
        {/* Ear */}
        <ellipse cx="18" cy="28" rx="5" ry="7" {...sk} />
        {/* Eye */}
        <circle cx="40" cy="26" r="3.5" fill="#5C3A00" />
        <circle cx="30" cy="26" r="3.5" fill="#5C3A00" />
        {/* Fish tail */}
        <path d="M50 42 C60 50 66 58 62 68 C70 62 76 66 72 76 C80 68 84 72 80 82" {...sk} fill="none" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 44 C58 56 60 68 56 80" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
        {/* Tail fins */}
        <path d="M62 68 C70 72 74 80 68 84" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
        <path d="M72 76 C76 82 76 88 70 88" {...sk} fill="none" strokeWidth="4" strokeLinecap="round" />
      </>
    ),

    Aquarius: (
      <>
        <Defs />
        {/* Water bearer figure */}
        {/* Head */}
        <circle cx="50" cy="18" r="10" {...sk} />
        {/* Body */}
        <path d="M40 28 L36 54 L64 54 L60 28 Z" {...sk} />
        {/* Arm holding jug */}
        <line x1="64" y1="36" x2="78" y2="30" stroke={gf} strokeWidth="5" strokeLinecap="round" />
        {/* Jug */}
        <path d="M78 22 L74 30 L84 30 L82 22 Z" {...sk} />
        <rect x="74" y="18" width="10" height="6" rx="2" {...sk} />
        {/* Water waves pouring out */}
        <path d="M84 30 C88 34 86 38 90 42 C94 46 92 50 96 54" stroke={gf} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M88 28 C92 32 90 36 94 40 C98 44 96 48 100 52" stroke={gf} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* Legs */}
        <line x1="42" y1="54" x2="38" y2="80" stroke={gf} strokeWidth="6" strokeLinecap="round" />
        <line x1="58" y1="54" x2="62" y2="80" stroke={gf} strokeWidth="6" strokeLinecap="round" />
        {/* Face */}
        <circle cx="46" cy="16" r="2" fill="#5C3A00" />
        <circle cx="54" cy="16" r="2" fill="#5C3A00" />
      </>
    ),

    Pisces: (
      <>
        <Defs />
        {/* Top fish (swimming right) */}
        {/* Body */}
        <ellipse cx="50" cy="28" rx="22" ry="11" {...sk} />
        {/* Tail fin */}
        <path d="M72 28 L82 18 L82 38 Z" {...sk} />
        {/* Fin */}
        <path d="M52 18 C56 12 62 12 64 18" {...sk} fill="none" strokeWidth="3" strokeLinecap="round" />
        {/* Eye */}
        <circle cx="32" cy="27" r="3" fill="#5C3A00" />
        <circle cx="33" cy="26" r="1" fill="#FFF0A0" />

        {/* Bottom fish (swimming left) */}
        <ellipse cx="50" cy="72" rx="22" ry="11" {...sk} />
        {/* Tail fin */}
        <path d="M28 72 L18 62 L18 82 Z" {...sk} />
        {/* Fin */}
        <path d="M48 82 C44 88 38 88 36 82" {...sk} fill="none" strokeWidth="3" strokeLinecap="round" />
        {/* Eye */}
        <circle cx="68" cy="71" r="3" fill="#5C3A00" />
        <circle cx="69" cy="70" r="1" fill="#FFF0A0" />

        {/* Center connecting bar */}
        <rect x="46" y="38" width="8" height="24" rx="4" {...sk} />
      </>
    ),

  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {icons[sign] || null}
    </svg>
  );
}
