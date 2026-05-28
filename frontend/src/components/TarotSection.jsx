import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import TarotCardFlip from './TarotCardFlip';
import { MAJOR_ARCANA, ZODIAC_CARD_MAP, getRandomCards } from '../data/tarotCards';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const ZODIAC_HI = { Aries:'मेष', Taurus:'वृष', Gemini:'मिथुन', Cancer:'कर्क', Leo:'सिंह', Virgo:'कन्या', Libra:'तुला', Scorpio:'वृश्चिक', Sagittarius:'धनु', Capricorn:'मकर', Aquarius:'कुंभ', Pisces:'मीन' };

export default function TarotSection({ userLagna }) {
  const [phase, setPhase] = useState('idle'); // idle | shuffling | drawn | revealed
  const [drawnCard, setDrawnCard] = useState(null);
  const [isReversed, setIsReversed] = useState(false);
  const [selectedSign, setSelectedSign] = useState(userLagna || null);
  const [signResonance, setSignResonance] = useState(null);
  const [deckCards] = useState(() => getRandomCards(3)); // 3 back-facing deck cards for display

  // Today's date seed for consistent daily card (same card all day, always upright)
  useEffect(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const idx = seed % MAJOR_ARCANA.length;
    setDrawnCard(MAJOR_ARCANA[idx]);
    setIsReversed(false); // Always upright on homepage for clarity
  }, []);

  useEffect(() => {
    if (userLagna) setSelectedSign(userLagna);
  }, [userLagna]);

  useEffect(() => {
    if (drawnCard && selectedSign) {
      const zodiacCard = ZODIAC_CARD_MAP[selectedSign];
      if (zodiacCard?.major === drawnCard.id) {
        setSignResonance('power'); // Perfect alignment
      } else if (drawnCard.sign === selectedSign) {
        setSignResonance('strong');
      } else {
        setSignResonance('normal');
      }
    }
  }, [drawnCard, selectedSign]);

  const handleShuffle = () => {
    if (phase === 'revealed') {
      setPhase('idle');
      return;
    }
    setPhase('shuffling');
    setTimeout(() => setPhase('drawn'), 1200);
  };

  const handleReveal = () => setPhase('revealed');

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(40,10,80,0.4) 30%, rgba(40,10,80,0.5) 70%, transparent)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest"
            style={{ background: 'rgba(120,40,180,0.2)', border: '1px solid rgba(168,85,247,0.35)', color: '#C084FC' }}>
            <Sparkles className="w-3 h-3" /> DAILY COSMIC TAROT
          </div>
          <h2 className="font-serif text-3xl md:text-4xl mb-3" style={{ color: '#E8C547', textShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
            आज का ब्रह्मांडीय संदेश
          </h2>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            ज्योतिष और तारो कार्ड का संगम — आपके लिए आज का दिव्य संदेश
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">

          {/* ── Left: Card area ── */}
          <div className="flex flex-col items-center gap-6">

            {/* Deck / Card display */}
            <div className="relative h-72 flex items-center justify-center" style={{ minWidth: '200px' }}>
              <AnimatePresence mode="wait">

                {/* Idle: stacked deck */}
                {(phase === 'idle') && (
                  <motion.div key="deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative flex items-center justify-center">
                    {/* Stack of 3 cards */}
                    {[{ rotate: -8, x: -14, y: 4 }, { rotate: -3, x: -5, y: 1 }, { rotate: 2, x: 4, y: 0 }].map((style, i) => (
                      <motion.div key={i}
                        className="absolute w-36 h-56 rounded-xl"
                        style={{ rotate: style.rotate, x: style.x, y: style.y, zIndex: i,
                          background: 'linear-gradient(160deg, #0d0728 0%, #1a0845 50%, #0d0f2e 100%)',
                          border: '1.5px solid rgba(201,168,76,0.4)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                        }}
                        animate={{ y: [style.y, style.y - 3, style.y] }}
                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <motion.span className="text-3xl opacity-40"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }}>✶</motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Shuffling animation */}
                {phase === 'shuffling' && (
                  <motion.div key="shuffle" className="relative flex items-center justify-center">
                    {[0, 1, 2, 3, 4].map(i => (
                      <motion.div key={i}
                        className="absolute w-36 h-56 rounded-xl"
                        style={{ background: 'linear-gradient(160deg, #0d0728, #1a0845)', border: '1.5px solid rgba(201,168,76,0.4)' }}
                        initial={{ rotate: 0, x: 0, y: 0 }}
                        animate={{ rotate: [(i - 2) * 15, -(i - 2) * 20, (i - 2) * 10, 0], x: [(i - 2) * 30, -(i - 2) * 20, 0], y: [0, -20, 10, 0] }}
                        transition={{ duration: 1, ease: 'easeInOut', delay: i * 0.08 }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">✶</div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Drawn: one card face-down, tap to flip */}
                {phase === 'drawn' && drawnCard && (
                  <motion.div key="drawn"
                    initial={{ scale: 0.5, y: -60, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
                    <TarotCardFlip card={drawnCard} reversed={isReversed} size="lg" onFlip={handleReveal} />
                  </motion.div>
                )}

                {/* Revealed */}
                {phase === 'revealed' && drawnCard && (
                  <motion.div key="revealed"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}>
                    <TarotCardFlip card={drawnCard} reversed={isReversed} size="lg" autoFlipped={true} />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleShuffle}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all"
              style={{ background: phase === 'revealed' ? 'rgba(120,40,180,0.2)' : 'linear-gradient(135deg,#7E22CE,#581C87)',
                border: '1.5px solid rgba(168,85,247,0.5)', color: '#E9D5FF',
                boxShadow: phase !== 'revealed' ? '0 4px 24px rgba(126,34,206,0.4)' : 'none' }}>
              {phase === 'idle' && <><Sparkles className="w-4 h-4" /> Shuffle & Draw Card</>}
              {phase === 'shuffling' && <><Sparkles className="w-4 h-4 animate-spin" /> Shuffling...</>}
              {phase === 'drawn' && <><span>✦</span> Tap Card to Reveal</>}
              {phase === 'revealed' && <><RotateCcw className="w-4 h-4" /> Draw Again</>}
            </motion.button>
          </div>

          {/* ── Right: Reading panel ── */}
          <div className="flex-1 max-w-sm w-full">
            <AnimatePresence mode="wait">

              {/* Before draw */}
              {(phase === 'idle' || phase === 'shuffling') && (
                <motion.div key="pre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Sign selector */}
                  <div className="mb-6">
                    <p className="text-xs text-gray-400 mb-3 tracking-wider">अपनी राशि चुनें (वैकल्पिक)</p>
                    <div className="grid grid-cols-4 gap-2">
                      {ZODIAC_SIGNS.map(sign => (
                        <button key={sign} onClick={() => setSelectedSign(sign)}
                          className="py-1.5 rounded-lg text-xs transition-all"
                          style={{
                            background: selectedSign === sign ? 'rgba(120,40,180,0.4)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${selectedSign === sign ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.08)'}`,
                            color: selectedSign === sign ? '#E9D5FF' : '#9CA3AF'
                          }}>
                          {ZODIAC_HI[sign]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info cards */}
                  <div className="space-y-3">
                    {[['✦', 'तारो + ज्योतिष', 'Golden Dawn परंपरा — प्रत्येक कार्ड एक ग्रह या राशि से जुड़ा है'],
                      ['🌙', 'व्यक्तिगत संदेश', 'आपकी जन्मकुण्डली के आधार पर विशेष व्याख्या'],
                      ['⭐', 'AI विश्लेषण', '/tarot पर पूर्ण AI पठन — Past, Present, Future']
                    ].map(([icon, title, desc]) => (
                      <div key={title} className="flex gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(120,40,180,0.1)', border: '1px solid rgba(168,85,247,0.15)' }}>
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div>
                          <div className="text-xs font-medium" style={{ color: '#C084FC' }}>{title}</div>
                          <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* After reveal */}
              {(phase === 'drawn' || phase === 'revealed') && drawnCard && (
                <motion.div key="post" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  {/* Card title */}
                  <div className="mb-4">
                    <div className="text-xs tracking-widest mb-1" style={{ color: '#A78BFA' }}>
                      {phase === 'drawn' ? '✦ कार्ड तैयार है — टैप करें' : '✦ आज का कार्ड'}
                    </div>
                    <h3 className="font-serif text-2xl font-bold leading-tight" style={{ color: drawnCard.accent }}>
                      {drawnCard.nameHi}
                    </h3>
                    <p className="text-xs text-gray-400">{drawnCard.name} {isReversed ? '(Reversed)' : '(Upright)'}</p>
                  </div>

                  {/* Astrological ruler */}
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: `${drawnCard.gradient[1]}30`, border: `1px solid ${drawnCard.accent}25` }}>
                    <span className="text-2xl">{drawnCard.rulerGlyph}</span>
                    <div>
                      <div className="text-xs font-medium" style={{ color: drawnCard.accent }}>
                        {drawnCard.ruler} ऊर्जा
                      </div>
                      <div className="text-xs text-gray-400">{drawnCard.astroNote}</div>
                    </div>
                  </div>

                  {/* Sign resonance */}
                  {selectedSign && signResonance === 'power' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                      className="p-3 rounded-xl mb-4"
                      style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)' }}>
                      <div className="text-xs font-bold text-yellow-400 mb-1">⚡ Power Day!</div>
                      <div className="text-xs text-gray-300">
                        {ZODIAC_HI[selectedSign]} राशि के लिए यह कार्ड सर्वोच्च शक्ति का प्रतीक है। आज आपका दिन असाधारण है।
                      </div>
                    </motion.div>
                  )}

                  {/* Meaning */}
                  {phase === 'revealed' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <p className="text-sm text-gray-200 leading-relaxed mb-4">
                        {isReversed ? drawnCard.reversed : drawnCard.upright}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {drawnCard.keywords.map(k => (
                          <span key={k} className="text-xs px-2 py-1 rounded-full"
                            style={{ background: `${drawnCard.accent}18`, color: drawnCard.accent, border: `1px solid ${drawnCard.accent}30` }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Full reading CTA */}
                  <Link to="/tarot"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#7E22CE,#581C87)', border: '1px solid rgba(168,85,247,0.4)',
                      color: '#E9D5FF', boxShadow: '0 4px 20px rgba(126,34,206,0.3)' }}>
                    <Sparkles className="w-4 h-4" />
                    पूर्ण AI तारो पठन →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
