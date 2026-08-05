import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Volume2, VolumeX, RefreshCw, ChevronLeft, Mic, MicOff, LogIn } from 'lucide-react';
import { chatbot as chatbotApi, kundali as kundaliApi } from '../api';
import { useAuth } from '../context/AuthContext';

// ── Pandit Ji SVG Avatar ──────────────────────────────────────────────────────
function PanditJiSVG({ isSpeaking, isThinking }) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!isSpeaking) { setMouthOpen(false); return; }
    const iv = setInterval(() => setMouthOpen(p => !p), 180);
    return () => clearInterval(iv);
  }, [isSpeaking]);

  return (
    <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="skinG" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E8AA68" />
          <stop offset="100%" stopColor="#C47840" />
        </radialGradient>
        <radialGradient id="auraG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.22" />
          <stop offset="70%" stopColor="#F5A623" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glassG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BDE0FF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#BDE0FF" stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* Divine aura */}
      <ellipse cx="100" cy="160" rx="95" ry="120" fill="url(#auraG)" />

      {/* === BODY === */}
      {/* Saffron uttariya / dhoti */}
      <path d="M52 205 Q30 270 38 295 L162 295 Q170 270 148 205 Z" fill="#E2711D" />
      {/* Kurta/upper garment fold */}
      <path d="M60 192 Q100 210 140 192 L148 205 Q100 228 52 205 Z" fill="#F5931E" />
      {/* White shirt visible at top */}
      <rect x="80" y="168" width="40" height="24" rx="4" fill="#FFFDE7" opacity="0.7" />
      {/* Garment border lines */}
      <path d="M65 218 Q100 230 135 218" stroke="#C4590A" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M60 235 Q100 250 140 235" stroke="#C4590A" strokeWidth="1.5" fill="none" opacity="0.4" />

      {/* === MALA (Prayer beads) === */}
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 1.05 + 0.0;
        const cx = 100 + 42 * Math.cos(angle);
        const cy = 200 + 14 * Math.sin(angle * 0.6);
        return <circle key={i} cx={cx} cy={cy} r="2.8" fill="#7B3F00" opacity="0.85" />;
      })}

      {/* === NECK === */}
      <path d="M86 158 Q86 175 90 182 L110 182 Q114 175 114 158 Z" fill="url(#skinG)" />

      {/* === HEAD === */}
      <ellipse cx="100" cy="128" rx="44" ry="50" fill="url(#skinG)" />

      {/* === HAIR — grey/white === */}
      {/* Side hair */}
      <ellipse cx="60" cy="115" rx="21" ry="26" fill="#DDDDD0" />
      <ellipse cx="140" cy="115" rx="21" ry="26" fill="#DDDDD0" />
      {/* Back hair */}
      <ellipse cx="100" cy="85" rx="38" ry="14" fill="#D8D8CC" />
      {/* Hair bun on top */}
      <ellipse cx="100" cy="80" rx="16" ry="11" fill="#CCCCBE" />
      <circle cx="100" cy="73" r="9" fill="#C4C4B6" />
      {/* Hair highlight */}
      <ellipse cx="97" cy="71" rx="5" ry="4" fill="#E0E0D4" opacity="0.6" />

      {/* === EARS === */}
      <ellipse cx="56" cy="128" rx="9" ry="12" fill="url(#skinG)" />
      <ellipse cx="144" cy="128" rx="9" ry="12" fill="url(#skinG)" />
      <ellipse cx="56" cy="128" rx="5" ry="7" fill="#C47840" opacity="0.4" />
      <ellipse cx="144" cy="128" rx="5" ry="7" fill="#C47840" opacity="0.4" />

      {/* === TILAK (Vaishnavite — vertical white lines with red center) === */}
      {/* Left white line */}
      <rect x="92" y="95" width="5" height="18" rx="2.5" fill="white" opacity="0.92" />
      {/* Right white line */}
      <rect x="103" y="95" width="5" height="18" rx="2.5" fill="white" opacity="0.92" />
      {/* Red center */}
      <rect x="97.5" y="96" width="5" height="16" rx="2.5" fill="#CC2222" opacity="0.9" />

      {/* === SPECTACLES === */}
      <circle cx="84" cy="124" r="11" fill="url(#glassG)" stroke="#8B6914" strokeWidth="1.8" opacity="0.75" />
      <circle cx="116" cy="124" r="11" fill="url(#glassG)" stroke="#8B6914" strokeWidth="1.8" opacity="0.75" />
      <path d="M95 124 L105 124" stroke="#8B6914" strokeWidth="1.8" opacity="0.75" />
      <path d="M73 122 L63 118" stroke="#8B6914" strokeWidth="1.8" opacity="0.75" />
      <path d="M127 122 L137 118" stroke="#8B6914" strokeWidth="1.8" opacity="0.75" />

      {/* === EYES (inside glasses) === */}
      <ellipse cx="84" cy="124" rx="6" ry="5.5" fill="white" />
      <ellipse cx="116" cy="124" rx="6" ry="5.5" fill="white" />
      <circle cx="84" cy="125" r="4" fill="#2C1A0E" />
      <circle cx="116" cy="125" r="4" fill="#2C1A0E" />
      <circle cx="85.5" cy="123" r="1.5" fill="white" />
      <circle cx="117.5" cy="123" r="1.5" fill="white" />
      {/* Eyelid lines */}
      <path d="M78 120 Q84 117 90 120" stroke="#5C3317" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M110 120 Q116 117 122 120" stroke="#5C3317" strokeWidth="1.2" fill="none" opacity="0.5" />

      {/* === EYEBROWS — white/grey, bushy === */}
      <path d="M74 114 Q84 109 94 113" stroke="#AAAAA0" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M106 113 Q116 109 126 114" stroke="#AAAAA0" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* === NOSE === */}
      <ellipse cx="100" cy="137" rx="5" ry="4" fill="#C47840" opacity="0.7" />
      <path d="M95 141 Q100 144 105 141" stroke="#A06030" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* === MOUSTACHE — white === */}
      <path d="M86 147 Q93 143 100 146 Q107 143 114 147"
        stroke="#D0D0C4" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* === MOUTH — animated === */}
      {isSpeaking && mouthOpen ? (
        <ellipse cx="100" cy="154" rx="10" ry="7" fill="#7A3010" />
      ) : isSpeaking ? (
        <ellipse cx="100" cy="154" rx="10" ry="4" fill="#7A3010" />
      ) : isThinking ? (
        <path d="M91 154 Q100 157 109 154" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        // Gentle smile
        <path d="M89 152 Q100 162 111 152" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* === BEARD — white === */}
      <path d="M70 152 Q100 185 130 152 Q128 172 100 182 Q72 172 70 152 Z"
        fill="#E8E8DC" opacity="0.92" />
      <path d="M78 168 Q100 178 122 168" stroke="#D0D0C4" strokeWidth="1" fill="none" opacity="0.5" />

      {/* === HANDS in namaste / blessing === */}
      {/* Left arm */}
      <path d="M55 215 Q38 235 45 260 Q55 265 65 255 Q60 235 70 220 Z" fill="url(#skinG)" />
      {/* Right arm */}
      <path d="M145 215 Q162 235 155 260 Q145 265 135 255 Q140 235 130 220 Z" fill="url(#skinG)" />
      {/* Hands joined — namaste */}
      <ellipse cx="100" cy="268" rx="28" ry="16" fill="url(#skinG)" />
      <path d="M76 265 Q100 258 124 265" stroke="#C47840" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M78 272 Q100 276 122 272" stroke="#C47840" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── Sound wave indicator ──────────────────────────────────────────────────────
function SoundWave({ active }) {
  const bars = [0.4, 0.8, 1, 0.7, 0.5, 0.9, 0.6];
  return (
    <div className="flex items-center gap-1 h-8">
      {bars.map((h, i) => (
        <motion.div key={i}
          className="w-1 rounded-full"
          style={{ background: '#E8C547', minHeight: '4px' }}
          animate={active ? { height: [`${h * 8}px`, `${h * 28}px`, `${h * 8}px`] } : { height: '4px' }}
          transition={{ duration: 0.6, repeat: active ? Infinity : 0, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Suggested questions ───────────────────────────────────────────────────────
const PANDIT_QUESTIONS = [
  { hi: 'पंडित जी, मेरी शादी कब होगी?', short: 'विवाह योग' },
  { hi: 'मेरे जीवन का उद्देश्य क्या है?', short: 'जीवन उद्देश्य' },
  { hi: 'मुझे कौन सा रत्न धारण करना चाहिए?', short: 'रत्न उपाय' },
  { hi: 'मेरी करियर में कब सफलता मिलेगी?', short: 'करियर' },
  { hi: 'मेरी कुण्डली में कोई दोष है?', short: 'दोष विचार' },
  { hi: 'आज के लिए कोई मंत्र बताएँ।', short: 'आज का मंत्र' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PanditJiPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [kundali, setKundali] = useState(null);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const synthRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user) kundaliApi.getMyKundali().then(r => setKundali(r.data)).catch(() => {});
    setMessages([{
      id: 'welcome',
      role: 'pandit',
      content: 'हरि ॐ 🙏\n\nवत्स, आपका स्वागत है। मैं पंडित AI जी हूँ — आपका वैदिक ज्योतिषाचार्य।\n\nआपकी जन्मकुण्डली के आधार पर मैं आपके जीवन के हर प्रश्न का उत्तर दे सकता हूँ। निःसंकोच पूछिए।\n\nईश्वर आपका कल्याण करें। 🙏'
    }]);
  }, [user]);

  // TTS — speak response aloud
  const speak = useCallback((text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown formatting
    let cleaned = text
      .replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6} /g, '')
      .replace(/\n/g, ' ');

    // Fix numeric ranges: "1-2" → "1 से 2", "2-3 वर्ष" → "2 से 3 वर्ष"
    cleaned = cleaned.replace(/(\d+)\s*-\s*(\d+)/g, '$1 से $2');
    // Fix standalone hyphens used as dashes: " - " → ", "
    cleaned = cleaned.replace(/\s+-\s+/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.82;
    utterance.pitch = 0.72;
    utterance.volume = 1;

    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();

      // Prefer male Hindi voice (Microsoft Hemant on Windows)
      const maleHindi = voices.find(v =>
        v.name.toLowerCase().includes('hemant') ||
        (v.lang.startsWith('hi') && v.name.toLowerCase().includes('male'))
      );
      const anyHindi = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      const indianEnglish = voices.find(v => v.lang.includes('IN') && !v.name.toLowerCase().includes('kalpana'));

      utterance.voice = maleHindi || anyHindi || indianEnglish || voices[0];
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = trySpeak;
    }
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Voice input
  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported in this browser'); return; }

    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = 'hi-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    rec.start();
    setListening(true);
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    if (!user) { toast.error('कृपया लॉगिन करें'); navigate('/login'); return; }

    stopSpeaking();
    setInput('');
    setMessages(p => [...p, { id: Date.now(), role: 'user', content: msg }]);
    setIsThinking(true);
    setLoading(true);

    try {
      const res = await chatbotApi.panditChat(msg);
      const reply = res.data.response;
      setMessages(p => [...p, { id: Date.now() + 1, role: 'pandit', content: reply }]);
      setTimeout(() => speak(reply), 400);
    } catch {
      const err = 'क्षमा करें वत्स, कुछ विघ्न आ गया। पुनः प्रयास करें। 🙏';
      setMessages(p => [...p, { id: Date.now() + 1, role: 'pandit', content: err }]);
    } finally {
      setIsThinking(false);
      setLoading(false);
    }
  };

  const clearChat = async () => {
    stopSpeaking();
    try { await chatbotApi.panditClear(); } catch {}
    setMessages([{
      id: 'reset',
      role: 'pandit',
      content: 'हरि ॐ 🙏 नई वार्तालाप आरंभ हो गई। वत्स, पुनः पूछिए।'
    }]);
  };

  const lastPanditMsg = [...messages].reverse().find(m => m.role === 'pandit');

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#080520' }}>

      {/* Cosmic nebula bg */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(180,80,10,0.18) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 70%, rgba(120,40,0,0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(60,20,5,0.25) 0%, transparent 55%)
          `
        }} />
        {/* Subtle star dots */}
        {[5,18,32,46,60,74,88,12,29,43,57,71,85].map(v => (
          <div key={v} className="absolute rounded-full bg-white"
            style={{ left: `${(v * 1.7 + 3) % 97}%`, top: `${(v * 2.3 + 7) % 93}%`, width: '2px', height: '2px', opacity: 0.25 }} />
        ))}
      </div>

      {/* Navbar is h-16, plus a desktop-only Free Tools sub-bar — clear both, or it
          covers this page's top bar and eats its clicks. */}
      <div className="relative z-10 flex flex-col min-h-screen pt-16 md:pt-[104px]">

        {/* ── Top bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-3 border-b backdrop-blur-md"
          style={{ borderColor: 'rgba(201,168,76,0.2)', background: 'linear-gradient(to right, rgba(80,30,5,0.7), rgba(40,15,3,0.8))' }}>
          <div className="flex items-center gap-3">
            <Link to="/chat" className="text-gold-400 hover:text-gold-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="font-serif text-base font-semibold" style={{ color: '#F5A623' }}>पंडित AI जी</div>
              <div className="text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ color: '#22c55e' }}>Live • वैदिक ज्योतिष AI</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Pandits used to reach their portal at this URL — send them on */}
            <Link to="/pandit-portal" title="Pandit login"
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-full text-xs transition-colors hover:bg-gold-600/10"
              style={{ border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pandit login</span>
            </Link>
            <button onClick={() => { setVoiceEnabled(v => { if (v) stopSpeaking(); return !v; })}
            } title={voiceEnabled ? 'Mute' : 'Unmute'}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: voiceEnabled ? 'rgba(201,168,76,0.15)' : 'rgba(255,80,80,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
              {voiceEnabled ? <Volume2 className="w-4 h-4" style={{ color: '#E8C547' }} /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button onClick={clearChat} title="New conversation"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gold-600/10"
              style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
              <RefreshCw className="w-4 h-4" style={{ color: '#C9A84C' }} />
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* ── Avatar panel ── */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 py-6 lg:w-80"
            style={{ background: 'linear-gradient(to bottom, rgba(80,30,5,0.25), rgba(20,5,0,0.4))' }}>

            {/* Video-call frame */}
            <div className="relative w-52 h-64 rounded-2xl overflow-hidden mb-4"
              style={{
                background: 'linear-gradient(160deg, #1E0A00 0%, #0A0500 100%)',
                border: '2px solid rgba(201,168,76,0.5)',
                boxShadow: '0 0 40px rgba(180,80,10,0.3), 0 0 80px rgba(180,80,10,0.1)'
              }}>

              {/* Avatar glow bg inside frame */}
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(180,80,10,0.2) 0%, transparent 70%)' }} />

              {/* Speaking aura rings */}
              <AnimatePresence>
                {isSpeaking && (
                  <>
                    {[1, 1.15, 1.3].map((s, i) => (
                      <motion.div key={i}
                        className="absolute inset-0 rounded-2xl"
                        style={{ border: `1px solid rgba(201,168,76,${0.5 - i * 0.15})` }}
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: s, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Pandit Ji SVG */}
              <motion.div className="absolute inset-0 flex items-end justify-center pb-1"
                animate={isSpeaking
                  ? { y: [0, -3, 0] }
                  : isThinking
                    ? { rotate: [0, 1.5, -1.5, 0] }
                    : { y: [0, -4, 0] }
                }
                transition={isSpeaking
                  ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
                  : isThinking
                    ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <div style={{ width: '170px', height: '230px' }}>
                  <PanditJiSVG isSpeaking={isSpeaking} isThinking={isThinking} />
                </div>
              </motion.div>

              {/* "LIVE" badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,80,80,0.6)', color: '#FF6B6B' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>

              {/* Sound wave at bottom */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <SoundWave active={isSpeaking} />
              </div>
            </div>

            {/* Name card */}
            <div className="text-center">
              <div className="font-serif text-lg font-semibold" style={{ color: '#F5A623', textShadow: '0 0 20px rgba(201,168,76,0.5)' }}>
                पंडित AI जी
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#C49060' }}>
                वैदिक ज्योतिषाचार्य
              </div>
              {kundali && (
                <div className="mt-2 text-[11px] px-3 py-1 rounded-full"
                  style={{ background: 'rgba(180,80,10,0.2)', border: '1px solid rgba(201,168,76,0.25)', color: '#D4A060' }}>
                  {kundali.lagna} लग्न • {kundali.nakshatra} नक्षत्र
                </div>
              )}
              {isSpeaking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-2 text-xs" style={{ color: '#E8C547' }}>
                  🔊 बोल रहे हैं...
                </motion.div>
              )}
              {isThinking && !isSpeaking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-2 text-xs" style={{ color: '#C49060' }}>
                  ✦ विचार कर रहे हैं...
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Chat panel ── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>

                  {msg.role === 'pandit' && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                      style={{ background: 'linear-gradient(135deg,#C4590A,#7A3010)', border: '1px solid rgba(201,168,76,0.4)' }}>
                      🙏
                    </div>
                  )}

                  <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                  }`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg,#2e0e62,#1a0845)', border: '1px solid rgba(201,168,76,0.2)', color: '#E8E0D0' }
                      : { background: 'linear-gradient(135deg,rgba(100,35,5,0.45),rgba(50,15,2,0.55))', border: '1px solid rgba(201,168,76,0.25)', color: '#F0E8D8' }
                    }>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg,#C4590A,#7A3010)', border: '1px solid rgba(201,168,76,0.4)' }}>🙏</div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
                    style={{ background: 'rgba(100,35,5,0.4)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    {[0, 0.18, 0.36].map(d => (
                      <motion.div key={d} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.75, delay: d }}
                        className="w-2 h-2 rounded-full" style={{ background: '#F5A623', opacity: 0.7 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {messages.length <= 1 && (
              <div className="flex-shrink-0 px-4 md:px-6 pb-2">
                <p className="text-xs mb-2 text-center" style={{ color: '#9A7040' }}>✦ प्रश्न चुनें</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {PANDIT_QUESTIONS.map(q => (
                    <button key={q.short} onClick={() => handleSend(q.hi)}
                      className="flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all hover:scale-105"
                      style={{ background: 'rgba(100,35,5,0.35)', border: '1px solid rgba(201,168,76,0.3)', minWidth: '80px' }}>
                      <span style={{ color: '#F5A623' }} className="font-medium">{q.short}</span>
                      <span className="text-[10px] mt-0.5 leading-tight text-center" style={{ color: '#C49060' }}>{q.hi.substring(0, 22)}…</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4 border-t backdrop-blur-md"
              style={{ borderColor: 'rgba(201,168,76,0.15)', background: 'linear-gradient(to right,rgba(80,30,5,0.5),rgba(30,10,0,0.6))' }}>
              {!user && (
                <p className="text-center text-xs mb-3" style={{ color: '#9A7040' }}>
                  <button onClick={() => navigate('/login')} style={{ color: '#F5A623' }} className="font-medium hover:underline">Login करें</button>
                  {' '} — पंडित जी से बात करने के लिए
                </p>
              )}
              <div className="flex gap-2 max-w-2xl mx-auto">
                {/* Voice input button */}
                <button onClick={toggleListening} disabled={!user}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{
                    background: listening ? 'rgba(255,80,80,0.2)' : 'rgba(100,35,5,0.3)',
                    border: `1px solid ${listening ? 'rgba(255,80,80,0.5)' : 'rgba(201,168,76,0.3)'}`,
                    animation: listening ? 'pulse 1s infinite' : 'none'
                  }}>
                  {listening
                    ? <MicOff className="w-4 h-4 text-red-400" />
                    : <Mic className="w-4 h-4" style={{ color: '#C9A84C' }} />
                  }
                </button>

                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={user ? 'पंडित जी से अपना प्रश्न पूछें...' : 'Login करें'}
                  disabled={!user || loading}
                  className="flex-1 text-sm focus:outline-none disabled:opacity-50 px-5 py-3 rounded-full"
                  style={{ background: 'rgba(15,5,0,0.8)', border: '1px solid rgba(201,168,76,0.25)', color: '#F0E8D8' }}
                />

                <button onClick={() => handleSend()}
                  disabled={!user || loading || !input.trim()}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: input.trim() && user ? 'linear-gradient(135deg,#C4590A,#E8720A)' : 'rgba(100,35,5,0.3)', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <Send className="w-4 h-4" style={{ color: input.trim() && user ? 'white' : '#C9A84C' }} />
                </button>
              </div>
              <p className="text-center text-[10px] mt-2" style={{ color: '#6A4020' }}>
                Vedic AI • Powered by Claude • आपकी कुण्डली context में
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
