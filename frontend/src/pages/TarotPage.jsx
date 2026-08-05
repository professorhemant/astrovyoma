import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import TarotCardFlip from '../components/TarotCardFlip';
import { getRandomCards } from '../data/tarotCards';
import { kundali as kundaliApi } from '../api';
import { useAuth } from '../context/AuthContext';

// Pre-written English card meanings (no AI used)
const EN_MEANINGS = {
  0:  'A new journey begins. Step forward with faith and openness — infinite possibilities await. The universe supports your leap.',
  1:  'You have all the tools you need. Channel your focus and willpower — this is a powerful time for action and creation.',
  2:  'Listen deeply to your intuition. Hidden wisdom and inner knowing are your guides now. Patience reveals all truths.',
  3:  'Abundance and creativity surround you. Nurture your relationships and projects — growth flourishes naturally.',
  4:  'Establish structure and take authority over your life. Lead with confidence and create lasting foundations for success.',
  5:  'Seek wisdom through tradition, mentorship, or spiritual practice. Established paths bring stability and guidance now.',
  6:  'Harmony and meaningful choices define this moment. Honor your values and follow your heart in love and decisions.',
  7:  'Victory comes through focused determination. You have the willpower to overcome obstacles — stay in control and move forward.',
  8:  'Your inner compassion and courage are your greatest powers. Face challenges with gentle persistence and patient grace.',
  9:  'A period of sacred solitude brings profound clarity. Withdraw to reflect and let your inner light guide the way.',
  10: 'The cosmic wheel turns in your favor. A significant cycle shifts — stay centered and embrace this turning point.',
  11: 'Truth and fairness are at play. Your actions have consequences — act with integrity and trust that balance is restored.',
  12: 'Pause and release control. A new perspective gained through surrender brings unexpected enlightenment.',
  13: 'A powerful transformation is underway. Release what no longer serves you — this ending clears the path for beautiful new beginnings.',
  14: 'Balance, patience, and moderation are your keys. A period of healing and gentle integration brings lasting harmony.',
  15: 'Recognize what binds you. The power to break free from limiting patterns lies wholly within you.',
  16: 'Sudden change disrupts old foundations. Though unsettling, this revelation clears away the false to reveal essential truth.',
  17: 'Renewed hope and inspiration light your path. After struggle comes healing, serenity, and reconnection with your purpose.',
  18: 'Navigate carefully through illusion. Trust your instincts, pay attention to dreams, and all will become clear in time.',
  19: 'Joy, success, and radiant vitality fill your life. This is your time to shine — celebrate your achievements with confidence.',
  20: 'A profound awakening calls you to rise. Release past regrets, forgive yourself, and step fully into your true calling.',
  21: 'A magnificent cycle reaches its fulfilling completion. Celebrate your wholeness — you are ready for an even greater journey.',
};

// ── All UI copy, keyed by language ────────────────────────────────────────────
const T = {
  en: {
    badge: 'TAROT READER',
    title: 'Tarot Reading',
    subtitle: 'Tarot & Vedic Astrology united — your personal cosmic reading',
    kundaliNote: 'Lagna — personalized with your birth chart',
    chooseLang: 'Choose your language',
    langDesc: 'The entire reading experience will be in your chosen language',
    questionLabel: 'Enter your question (optional)',
    questionPlaceholder: 'e.g. What does my future hold?',
    sampleQ: ['What does my future hold?', 'Which direction should my career take?', 'Will my relationship succeed?', 'What should I focus on right now?'],
    chooseSpread: 'Choose a spread',
    goldNote: 'Golden Dawn Tradition — Each tarot card is linked to a Vedic planet or zodiac sign. Your birth chart, question, and cards are combined for a deeply personal reading.',
    shuffleBtn: count => `Draw ${count} Card${count > 1 ? 's' : ''}`,
    shuffling: 'Shuffling...',
    tapHint: 'Tap each card to reveal',
    tapProgress: (done, total) => `${done}/${total} revealed — continue`,
    loading: 'Preparing your reading...',
    readingTitle: 'Tarot Reading',
    newReading: 'New Reading',
    newReadingBtn: 'Read Again',
    askPandit: 'Ask Pandit Ji',
    back: 'Home',
    spreads: [
      { id: 'single', label: 'Daily Card',     sub: 'One Card',              count: 1, positions: ["Today's Message"],                        desc: 'One powerful message for today' },
      { id: 'three',  label: 'Past · Present · Future', sub: 'Three Cards',  count: 3, positions: ['Past', 'Present', 'Future'],               desc: 'Full timeline — past, present & future' },
      { id: 'five',   label: 'Full Spread',    sub: 'Five Cards',            count: 5, positions: ['Situation','Challenge','Subconscious','Advice','Outcome'], desc: 'Deep dive — situation, challenge, advice & outcome' },
    ],
    icons: ['✦', '✦✦✦', '✦✦✦✦✦'],
  },
  hi: {
    badge: 'तारो रीडर',
    title: 'तारो पठन',
    subtitle: 'ज्योतिष और तारो का संगम — आपके लिए व्यक्तिगत पठन',
    kundaliNote: 'लग्न — आपकी कुण्डली से जुड़ा पठन',
    chooseLang: 'भाषा चुनें',
    langDesc: 'पूरा तारो अनुभव आपकी चुनी हुई भाषा में होगा',
    questionLabel: 'अपना प्रश्न लिखें (वैकल्पिक)',
    questionPlaceholder: 'जैसे: मेरे जीवन में आगे क्या होगा?',
    sampleQ: ['मेरे जीवन में आगे क्या होगा?', 'मेरा करियर किस दिशा में जाएगा?', 'क्या मेरा रिश्ता सफल होगा?', 'मुझे इस समय क्या करना चाहिए?'],
    chooseSpread: 'स्प्रेड चुनें',
    goldNote: 'Golden Dawn परंपरा — प्रत्येक तारो कार्ड एक Vedic ग्रह या राशि से जुड़ा है। आपकी कुण्डली, प्रश्न और कार्डों को मिलाकर व्यक्तिगत पठन दिया जाता है।',
    shuffleBtn: count => `${count} कार्ड खींचें`,
    shuffling: 'शफल हो रहा है...',
    tapHint: '✦ कार्डों पर टैप करके उन्हें पलटें',
    tapProgress: (done, total) => `${done}/${total} कार्ड पलटे — जारी रखें`,
    loading: 'पठन तैयार हो रहा है...',
    readingTitle: 'तारो पठन',
    newReading: 'नया पठन',
    newReadingBtn: 'दोबारा पढ़ें',
    askPandit: 'Pandit Ji से पूछें',
    back: 'होम',
    spreads: [
      { id: 'single', label: 'दैनिक कार्ड',   sub: 'एक कार्ड',     count: 1, positions: ['आज का संदेश'],                                     desc: 'आज के दिन के लिए एक दिव्य संदेश' },
      { id: 'three',  label: 'भूत·वर्तमान·भविष्य', sub: 'तीन कार्ड', count: 3, positions: ['भूतकाल', 'वर्तमान', 'भविष्य'],                   desc: 'भूत, वर्तमान और भविष्य का पूर्ण दृष्टिकोण' },
      { id: 'five',   label: 'पूर्ण स्प्रेड',  sub: 'पाँच कार्ड',   count: 5, positions: ['स्थिति','चुनौती','अवचेतन','सलाह','परिणाम'],        desc: 'स्थिति, चुनौती, सलाह और परिणाम का विस्तृत पठन' },
    ],
    icons: ['✦', '✦✦✦', '✦✦✦✦✦'],
  },
};

// ── Background ────────────────────────────────────────────────────────────────
function TarotBg() {
  return (
    <>
      {[...Array(55)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${(i * 16.7 + 3) % 100}%`,
            top: `${(i * 11.3 + 7) % 100}%`,
            width: `${1 + (i % 3) * 0.7}px`,
            height: `${1 + (i % 3) * 0.7}px`,
            background: i % 5 === 0 ? 'rgba(232,197,71,0.8)' : 'rgba(255,255,255,0.6)',
          }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 2 + (i % 4), delay: (i * 0.13) % 5, repeat: Infinity }}
        />
      ))}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', top:'-10%', left:'-10%', width:'60%', height:'60%', background:'radial-gradient(ellipse, rgba(120,40,220,0.18) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'55%', height:'55%', background:'radial-gradient(ellipse, rgba(50,80,200,0.15) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TarotPage() {
  const { user } = useAuth();

  // phase: 'lang' → 'select' → 'draw' → 'reading' → 'result'
  const [phase, setPhase]               = useState('lang');
  const [lang, setLang]                 = useState(null);            // 'en' | 'hi'
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [question, setQuestion]         = useState('');
  const [drawnCards, setDrawnCards]     = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [kundaliContext, setKundaliContext] = useState(null);
  const [shuffling, setShuffling]       = useState(false);

  // Refs prevent stale closures in async callbacks
  const drawnCardsRef     = useRef([]);
  const selectedSpreadRef = useRef(null);
  const langRef           = useRef(null);

  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    if (user) {
      kundaliApi.getMyKundali()
        .then(r => { const k = r.data; if (k?.lagna) setKundaliContext({ lagna: k.lagna }); })
        .catch(() => {});
    }
  }, [user]);

  const t = lang ? T[lang] : T.en; // text dictionary

  // ── Handlers ──────────────────────────────────────────────────────────────

  const chooseLang = (l) => {
    setLang(l);
    langRef.current = l;
    setPhase('select');
  };

  const handleSpreadSelect = (spread) => {
    setSelectedSpread(spread);
    selectedSpreadRef.current = spread;
    setPhase('draw');
  };

  const handleShuffle = () => {
    setShuffling(true);
    const spread = selectedSpreadRef.current;
    setTimeout(() => {
      // Always upright — no reversed cards
      const cards = getRandomCards(spread.count).map(c => ({ ...c, reversed: false }));
      drawnCardsRef.current = cards;
      setDrawnCards(cards);
      setRevealedCount(0);
      setShuffling(false);
      setPhase('reading');
    }, 1400);
  };

  const handleCardReveal = () => {
    setRevealedCount(prev => {
      const next = prev + 1;
      const spread = selectedSpreadRef.current;
      if (spread && next === spread.count) {
        setTimeout(() => setPhase('result'), 400);
      }
      return next;
    });
  };

  const handleReset = () => {
    setPhase('select');
    setSelectedSpread(null);
    selectedSpreadRef.current = null;
    setDrawnCards([]);
    drawnCardsRef.current = [];
    setRevealedCount(0);
    setQuestion('');
    setShuffling(false);
  };

  const goChangeLang = () => {
    handleReset();
    setPhase('lang');
    setLang(null);
  };

  // ── Deck visual ────────────────────────────────────────────────────────────
  const DeckVisual = ({ animating }) => (
    <div className="relative h-60 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!animating ? (
          <motion.div key="deck" className="relative flex items-center justify-center">
            {[{r:-8,x:-16,y:6,z:0},{r:-3,x:-5,y:2,z:1},{r:2,x:6,y:0,z:2}].map((s, i) => (
              <motion.div key={i} className="absolute w-36 h-56 rounded-xl"
                style={{ rotate:s.r, x:s.x, y:s.y, zIndex:s.z,
                  background:'linear-gradient(160deg,#0d0728 0%,#1a0845 50%,#0d0f2e 100%)',
                  border:'1.5px solid rgba(201,168,76,0.4)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}
                animate={{ y:[s.y, s.y-4, s.y] }}
                transition={{ duration:3+i*0.6, repeat:Infinity, ease:'easeInOut', delay:i*0.4 }}>
                <div className="w-full h-full flex items-center justify-center">
                  <motion.span className="text-3xl opacity-40" animate={{ rotate:360 }}
                    transition={{ duration:16+i*5, repeat:Infinity, ease:'linear' }}>✶</motion.span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="shuffle" className="relative flex items-center justify-center">
            {[0,1,2,3,4,5,6].map(i => (
              <motion.div key={i} className="absolute w-36 h-56 rounded-xl"
                style={{ background:'linear-gradient(160deg,#0d0728,#1a0845)', border:'1.5px solid rgba(201,168,76,0.45)' }}
                initial={{ rotate:0, x:0, y:0 }}
                animate={{ rotate:[(i-3)*18,-(i-3)*22,(i-3)*8,0], x:[(i-3)*35,-(i-3)*18,(i-3)*5,0], y:[0,-30,15,0] }}
                transition={{ duration:1.2, ease:'easeInOut', delay:i*0.07 }}>
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">✶</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background:'linear-gradient(135deg,#0d0728 0%,#1a0533 40%,#0c1a3a 100%)' }}>
      <TarotBg />

      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <img src="/tarot-hero.png" alt="Tarot" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0728]" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Title */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest"
              style={{ background:'rgba(120,40,180,0.2)', border:'1px solid rgba(168,85,247,0.35)', color:'#C084FC' }}>
              <Sparkles className="w-3 h-3" /> {t.badge}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl md:text-5xl mb-3"
              style={{ color:'#E8C547', textShadow:'0 0 40px rgba(232,197,71,0.3)' }}>
              {t.title}
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">{t.subtitle}</p>
            {kundaliContext && lang && (
              <div className="inline-flex items-center gap-1.5 mt-3 text-xs px-3 py-1 rounded-full"
                style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:'#C9A84C' }}>
                ✦ {kundaliContext.lagna} {t.kundaliNote}
              </div>
            )}
            {/* Language switcher — visible below title when a language is chosen */}
            {lang && phase !== 'lang' && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={goChangeLang}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                  style={{ background:'rgba(120,40,180,0.15)', border:'1px solid rgba(168,85,247,0.25)', color:'#A78BFA' }}>
                  {lang === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'} · Change
                </button>
                {phase !== 'select' && (
                  <button onClick={handleReset}
                    className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all hover:opacity-80"
                    style={{ background:'rgba(120,40,180,0.15)', border:'1px solid rgba(168,85,247,0.25)', color:'#A78BFA' }}>
                    <RotateCcw className="w-3 h-3" /> {t.newReading}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            PHASE: Language Selection
        ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">

          {phase === 'lang' && (
            <motion.div key="lang" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="max-w-2xl mx-auto text-center">

              <p className="text-gray-300 text-base mb-2">Choose Language / भाषा चुनें</p>
              <p className="text-gray-500 text-xs mb-8">The entire experience will be in your chosen language · पूरा अनुभव आपकी भाषा में होगा</p>

              <div className="grid grid-cols-2 gap-6">

                {/* English */}
                <motion.button onClick={() => chooseLang('en')}
                  whileHover={{ y:-8, boxShadow:'0 0 50px rgba(168,85,247,0.35)' }}
                  whileTap={{ scale:0.97 }}
                  className="rounded-2xl p-8 flex flex-col items-center gap-4 transition-all"
                  style={{ background:'linear-gradient(160deg, #1a0533 0%, #0c1a3a 100%)', border:'2px solid rgba(168,85,247,0.3)' }}>
                  <div className="text-5xl">🇬🇧</div>
                  <div>
                    <div className="font-serif text-2xl font-bold mb-1" style={{ color:'#E9D5FF' }}>English</div>
                    <div className="text-xs text-gray-400">Cards, reading & all UI in English</div>
                  </div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{ background:'rgba(126,34,206,0.3)', border:'1px solid rgba(168,85,247,0.4)', color:'#C084FC' }}>
                    Continue in English →
                  </div>
                </motion.button>

                {/* Hindi */}
                <motion.button onClick={() => chooseLang('hi')}
                  whileHover={{ y:-8, boxShadow:'0 0 50px rgba(201,168,76,0.3)' }}
                  whileTap={{ scale:0.97 }}
                  className="rounded-2xl p-8 flex flex-col items-center gap-4 transition-all"
                  style={{ background:'linear-gradient(160deg, #1a0f00 0%, #1a0533 100%)', border:'2px solid rgba(201,168,76,0.3)' }}>
                  <div className="text-5xl">🇮🇳</div>
                  <div>
                    <div className="font-serif text-2xl font-bold mb-1" style={{ color:'#E8C547' }}>हिंदी</div>
                    <div className="text-xs text-gray-400">कार्ड, पठन और सब कुछ हिंदी में</div>
                  </div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', color:'#C9A84C' }}>
                    हिंदी में जारी रखें →
                  </div>
                </motion.button>

              </div>

              {/* Preview note */}
              <div className="mt-8 p-4 rounded-xl text-xs text-gray-500 leading-relaxed"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                ✦ Golden Dawn Tarot + Vedic Astrology (Jyotish) · ज्योतिष और Golden Dawn तारो का संगम
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PHASE: Spread Selection
          ════════════════════════════════════════════════════════════════ */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="max-w-3xl mx-auto">

              {/* Question input */}
              <div className="mb-8">
                <p className="text-center text-xs text-gray-400 mb-3 tracking-wider">{t.questionLabel}</p>
                <input value={question} onChange={e => setQuestion(e.target.value)}
                  placeholder={t.questionPlaceholder} maxLength={120}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(168,85,247,0.25)' }} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.sampleQ.map(q => (
                    <button key={q} onClick={() => setQuestion(q)}
                      className="text-xs px-3 py-1 rounded-full transition-all hover:opacity-80"
                      style={{ background:'rgba(120,40,180,0.15)', border:'1px solid rgba(168,85,247,0.2)', color:'#A78BFA' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mb-5 tracking-wider">{t.chooseSpread}</p>
              <div className="grid md:grid-cols-3 gap-5">
                {t.spreads.map((spread, i) => (
                  <motion.button key={spread.id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                    onClick={() => handleSpreadSelect(spread)}
                    whileHover={{ y:-6, boxShadow:'0 0 40px rgba(168,85,247,0.25)' }}
                    whileTap={{ scale:0.97 }}
                    className="p-6 rounded-2xl text-left transition-all"
                    style={{ background:'rgba(120,40,180,0.12)', border:'1.5px solid rgba(168,85,247,0.2)' }}>
                    <div className="text-xl mb-3 tracking-widest" style={{ color:'#E8C547' }}>{t.icons[i]}</div>
                    <div className="font-serif text-lg font-semibold mb-0.5" style={{ color:'#E9D5FF' }}>{spread.label}</div>
                    <div className="text-xs mb-3" style={{ color:'#A78BFA' }}>{spread.sub}</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{spread.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {spread.positions.map(p => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(168,85,247,0.15)', color:'#C084FC', border:'1px solid rgba(168,85,247,0.2)' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl flex gap-3"
                style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)' }}>
                <span className="text-sm flex-shrink-0 mt-0.5" style={{ color:'#C9A84C' }}>✦</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span style={{ color:'#C9A84C' }} className="font-medium">Golden Dawn — </span>
                  {t.goldNote}
                </p>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PHASE: Draw (shuffle)
          ════════════════════════════════════════════════════════════════ */}
          {phase === 'draw' && (
            <motion.div key="draw" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="max-w-2xl mx-auto text-center">

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full mb-2"
                  style={{ background:'rgba(120,40,180,0.2)', border:'1px solid rgba(168,85,247,0.3)', color:'#C084FC' }}>
                  {selectedSpread?.label}
                </div>
                {question && <p className="text-xs text-gray-400 mt-2">"{question}"</p>}
              </div>

              <DeckVisual animating={shuffling} />

              <motion.button onClick={handleShuffle} disabled={shuffling}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="mt-6 px-10 py-4 rounded-full font-semibold text-sm flex items-center gap-2 mx-auto"
                style={{ background:'linear-gradient(135deg,#7E22CE,#581C87)', border:'1.5px solid rgba(168,85,247,0.5)',
                  color:'#E9D5FF', boxShadow:'0 4px 24px rgba(126,34,206,0.45)', opacity:shuffling?0.7:1 }}>
                <Sparkles className={`w-4 h-4 ${shuffling ? 'animate-spin' : ''}`} />
                {shuffling ? t.shuffling : t.shuffleBtn(selectedSpread?.count || 1)}
              </motion.button>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PHASE: Reading + Result
          ════════════════════════════════════════════════════════════════ */}
          {(phase === 'reading' || phase === 'result') && drawnCards.length > 0 && (
            <motion.div key="reveal" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="max-w-5xl mx-auto">

              {/* Cards row */}
              <div className="flex flex-wrap gap-6 justify-center mb-6">
                {drawnCards.map((card, i) => (
                  <div key={card.id + '-' + i} className="flex flex-col items-center gap-3">
                    <div className="text-xs tracking-wider font-medium" style={{ color:'#A78BFA' }}>
                      {selectedSpread?.positions[i] || `Card ${i+1}`}
                    </div>
                    <TarotCardFlip
                      card={card}
                      reversed={false}
                      size={drawnCards.length === 1 ? 'xl' : drawnCards.length <= 3 ? 'lg' : 'md'}
                      onFlip={handleCardReveal}
                      autoFlipped={phase === 'result'}
                    />
                  </div>
                ))}
              </div>

              {/* Tap hint */}
              {phase === 'reading' && revealedCount < drawnCards.length && (
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="text-center text-xs text-gray-500 mb-4">
                  {revealedCount === 0 ? t.tapHint : t.tapProgress(revealedCount, drawnCards.length)}
                </motion.p>
              )}

              {/* Card meanings panel */}
              {phase === 'result' && (
                <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="max-w-3xl mx-auto">

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ background:'rgba(126,34,206,0.3)', border:'1.5px solid rgba(168,85,247,0.4)' }}>✦</div>
                    <div>
                      <div className="text-sm font-medium" style={{ color:'#E9D5FF' }}>{t.readingTitle}</div>
                      <div className="text-xs" style={{ color:'#A78BFA' }}>
                        {selectedSpread?.label}{kundaliContext ? ` · ${kundaliContext.lagna}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Question if entered */}
                  {question && (
                    <div className="mb-5 px-4 py-2 rounded-xl text-xs italic text-gray-400"
                      style={{ background:'rgba(255,255,255,0.04)', borderLeft:'2px solid rgba(201,168,76,0.4)' }}>
                      "{question}"
                    </div>
                  )}

                  {/* One block per card */}
                  <div className="space-y-4 mb-6">
                    {drawnCards.map((card, i) => (
                      <motion.div key={i}
                        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.12 }}
                        className="rounded-2xl p-5"
                        style={{ background:`linear-gradient(135deg, ${card.gradient[0]}cc, ${card.gradient[1]}99)`,
                                 border:`1px solid ${card.accent}35` }}>

                        {/* Position + card name */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl" style={{ filter:`drop-shadow(0 0 8px ${card.accent}80)` }}>
                            {card.symbol}
                          </span>
                          <div>
                            <div className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color:`${card.accent}99` }}>
                              {selectedSpread?.positions?.[i] || `Card ${i+1}`}
                            </div>
                            <div className="font-serif text-base font-semibold leading-tight" style={{ color:card.accent }}>
                              {lang === 'en' ? card.name : card.nameHi}
                              <span className="text-xs font-normal opacity-50 ml-2">
                                {lang === 'en' ? card.nameHi : card.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Meaning */}
                        <p className="text-sm text-gray-200 leading-relaxed mb-3">
                          {lang === 'en' ? EN_MEANINGS[card.id] : card.upright}
                        </p>

                        {/* Keywords + ruler */}
                        <div className="flex flex-wrap items-center gap-2">
                          {card.keywords.slice(0, 3).map(k => (
                            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background:`${card.accent}18`, color:card.accent, border:`1px solid ${card.accent}30` }}>
                              {k}
                            </span>
                          ))}
                          <span className="text-[10px] text-gray-500 ml-auto flex items-center gap-1">
                            {card.rulerGlyph} {card.ruler}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-semibold"
                      style={{ background:'linear-gradient(135deg,#7E22CE,#581C87)', border:'1.5px solid rgba(168,85,247,0.4)',
                        color:'#E9D5FF', boxShadow:'0 4px 20px rgba(126,34,206,0.3)' }}>
                      <RotateCcw className="w-4 h-4" />{t.newReadingBtn}
                    </button>
                    <Link to="/pandit"
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-semibold"
                      style={{ background:'rgba(120,40,180,0.15)', border:'1.5px solid rgba(168,85,247,0.3)', color:'#E9D5FF' }}>
                      <Sparkles className="w-4 h-4" />{t.askPandit}
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
