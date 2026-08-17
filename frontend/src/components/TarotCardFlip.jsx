import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Card Back ─────────────────────────────────────────────────────────────────
function CardBack() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d0728 0%, #1a0845 50%, #0d0f2e 100%)',
               border: '1.5px solid rgba(201,168,76,0.45)' }}>

      {/* Inner border ring */}
      <div className="absolute inset-2 rounded-xl pointer-events-none"
        style={{ border: '1px solid rgba(201,168,76,0.2)' }} />

      {/* Corner stars */}
      {[['top-2','left-2'],['top-2','right-2'],['bottom-2','left-2'],['bottom-2','right-2']].map(([t,l], i) => (
        <div key={i} className={`absolute ${t} ${l} text-[10px] opacity-50`} style={{ color:'#C9A84C' }}>✦</div>
      ))}

      {/* Central mandala */}
      <div className="flex flex-col items-center gap-1 z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="text-4xl" style={{ color:'#C9A84C', opacity:0.7, filter:'drop-shadow(0 0 8px rgba(201,168,76,0.5))' }}>
          ✶
        </motion.div>
        <div className="text-[9px] tracking-[0.2em] opacity-40 font-serif" style={{ color:'#C9A84C' }}>
          ASTROVYOMA
        </div>
      </div>

      {/* Star dots */}
      {[10,25,40,60,75,90,15,50,80].map((v, i) => (
        <div key={i} className="absolute rounded-full bg-white opacity-20"
          style={{ left:`${v}%`, top:`${(v*1.3+i*7)%90}%`, width:'2px', height:'2px' }} />
      ))}
    </div>
  );
}

// ── Card Face ─────────────────────────────────────────────────────────────────
function CardFace({ card, reversed, lang = 'hi' }) {
  return (
    <div className="w-full h-full rounded-xl flex flex-col relative overflow-hidden"
      style={{ background:`linear-gradient(160deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)`,
               border:`1.5px solid ${card.accent}55` }}>

      {/* Inner border */}
      <div className="absolute inset-1 rounded-xl pointer-events-none"
        style={{ border:`1px solid ${card.accent}25` }} />

      {/* Top row */}
      <div className="flex justify-between items-start px-4 pt-3 pb-1 flex-shrink-0">
        <span className="text-xs font-bold tracking-wider font-serif" style={{ color:card.accent }}>
          {card.numeral}
        </span>
        <span className="text-sm" style={{ color:card.accent, opacity:0.8 }}>
          {card.rulerGlyph}
        </span>
      </div>

      {/* Central symbol */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute rounded-full opacity-20"
            style={{ width:'70px', height:'70px', background:card.accent, filter:'blur(20px)' }} />
          <motion.div className="text-5xl relative z-10"
            animate={{ y:[0,-4,0] }}
            transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
            style={{ filter:`drop-shadow(0 0 12px ${card.accent}80)` }}>
            {card.symbol}
          </motion.div>
        </div>
        <div className="h-px w-12 mx-auto" style={{ background:`${card.accent}50` }} />
        <div className="flex flex-wrap gap-1 justify-center px-1">
          {(lang === 'en' ? (card.keywordsEn || card.keywords) : card.keywords).slice(0, 2).map(k => (
            <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background:`${card.accent}20`, color:card.accent, border:`1px solid ${card.accent}30` }}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 pb-3 pt-1 flex-shrink-0 text-center">
        <div className="h-px mb-2" style={{ background:`${card.accent}30` }} />
        <div className="font-serif text-xs font-semibold leading-tight" style={{ color:card.accent }}>
          {lang === 'en' ? card.name : card.nameHi}
        </div>
        <div className="text-[9px] opacity-50 mt-0.5" style={{ color:card.accent }}>
          {lang === 'en' ? card.nameHi : card.name}
        </div>
        {reversed && (
          <div className="text-[9px] mt-1 opacity-70" style={{ color:'#F87171' }}>↕ Reversed</div>
        )}
      </div>

      {/* Corner ornaments */}
      {[['top-2','left-2'],['top-2','right-2'],['bottom-2','left-2'],['bottom-2','right-2']].map(([t,l], i) => (
        <div key={i} className={`absolute ${t} ${l} text-[8px] opacity-30`} style={{ color:card.accent }}>◆</div>
      ))}
    </div>
  );
}

// ── Main flip component ───────────────────────────────────────────────────────
// Uses scaleX animation (card "squishes" to 0, content swaps, scales back)
// — avoids backface-visibility / preserve-3d browser bugs entirely
export default function TarotCardFlip({ card, reversed = false, size = 'md', onFlip, autoFlipped = false, lang = 'hi' }) {
  const [flipped, setFlipped]     = useState(autoFlipped);
  const [showFront, setShowFront] = useState(autoFlipped);
  const [animating, setAnimating] = useState(false);

  const sizes = {
    sm: { w: 96,  h: 160 },
    md: { w: 144, h: 240 },
    lg: { w: 176, h: 288 },
    xl: { w: 208, h: 336 },
  };
  const dim = sizes[size] || sizes.md;

  const handleClick = () => {
    if (flipped || animating) return;
    setAnimating(true);
    // Phase 1: squish to 0 (200ms)
    setTimeout(() => {
      setShowFront(true);   // swap content at scaleX=0 (invisible)
    }, 200);
    // Phase 2: scale back to 1 (200ms later)
    setTimeout(() => {
      setAnimating(false);
      setFlipped(true);
      onFlip?.();
    }, 420);
  };

  return (
    <div style={{ width: dim.w, height: dim.h, position: 'relative', cursor: flipped ? 'default' : 'pointer', userSelect: 'none' }}
      onClick={handleClick}>

      <motion.div
        style={{ width: '100%', height: '100%' }}
        animate={{ scaleX: animating ? 0.04 : 1 }}
        transition={{ duration: 0.2, ease: 'easeIn' }}
        whileHover={!flipped ? { scale: 1.04, y: -6 } : {}}>
        {showFront ? <CardFace card={card} reversed={reversed} lang={lang} /> : <CardBack />}
      </motion.div>

      {/* Tap hint — only before flip */}
      {!flipped && !animating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          style={{
            position: 'absolute', bottom: -22, left: 0, right: 0,
            textAlign: 'center', fontSize: '10px', color: 'rgba(201,168,76,0.7)',
            pointerEvents: 'none',
          }}>
          tap to reveal
        </motion.div>
      )}
    </div>
  );
}
