import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { lucky as luckyApi } from '../api';
import { Link } from 'react-router-dom';

const SIGNS = [
  { name:'Aries',       symbol:'♈', color:'#FF6B6B', dates:'Mar 21–Apr 19' },
  { name:'Taurus',      symbol:'♉', color:'#6BCB77', dates:'Apr 20–May 20' },
  { name:'Gemini',      symbol:'♊', color:'#FFD93D', dates:'May 21–Jun 20' },
  { name:'Cancer',      symbol:'♋', color:'#C9A84C', dates:'Jun 21–Jul 22' },
  { name:'Leo',         symbol:'♌', color:'#FF9F43', dates:'Jul 23–Aug 22' },
  { name:'Virgo',       symbol:'♍', color:'#A29BFE', dates:'Aug 23–Sep 22' },
  { name:'Libra',       symbol:'♎', color:'#FD79A8', dates:'Sep 23–Oct 22' },
  { name:'Scorpio',     symbol:'♏', color:'#6C5CE7', dates:'Oct 23–Nov 21' },
  { name:'Sagittarius', symbol:'♐', color:'#E17055', dates:'Nov 22–Dec 21' },
  { name:'Capricorn',   symbol:'♑', color:'#636E72', dates:'Dec 22–Jan 19' },
  { name:'Aquarius',    symbol:'♒', color:'#00CEC9', dates:'Jan 20–Feb 18' },
  { name:'Pisces',      symbol:'♓', color:'#74B9FF', dates:'Feb 19–Mar 20' },
];

function LuckyCard({ icon, label, value, valueColor, sub }) {
  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
      className="card-cosmic rounded-xl p-4 border border-gold-600/15 flex flex-col items-center text-center gap-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="font-bold text-lg leading-tight" style={{ color: valueColor || '#C9A84C' }}>{value}</p>
      {sub && <p className="text-gray-500 text-xs">{sub}</p>}
    </motion.div>
  );
}

export default function LuckyPage() {
  const [selectedSign, setSelectedSign] = useState(null);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const signObj = SIGNS.find(s => s.name === selectedSign);

  useEffect(() => {
    if (!selectedSign) return;
    setData(null);
    setLoading(true);
    luckyApi.getToday(selectedSign)
      .then(r => setData(r.data))
      .catch(() => toast.error('Could not load lucky info. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [selectedSign]);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Daily Cosmic Blessings</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            आज का भाग्य
          </h1>
          <p className="text-gray-300 text-xl mb-1">Today's Lucky Info</p>
          <p className="text-gray-400 text-sm">{today}</p>
        </motion.div>

        {/* Sign Grid */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mb-8">
          <p className="text-gray-400 text-sm text-center mb-4">Select Your Zodiac Sign</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {SIGNS.map(s => (
              <button key={s.name} onClick={() => setSelectedSign(s.name)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  selectedSign === s.name
                    ? 'border-gold-500/60 bg-gold-500/10 scale-105'
                    : 'border-gold-600/15 bg-cosmic-900/40 hover:border-gold-500/30'
                }`}>
                <span className="text-2xl" style={{ color: s.color }}>{s.symbol}</span>
                <span className="text-xs text-gray-300 font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-gold-400 animate-spin" />
            </motion.div>
          )}

          {data && !loading && (
            <motion.div key={selectedSign} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-6">

              {/* Hero */}
              <div className="card-cosmic rounded-2xl p-6 border-2 text-center" style={{ borderColor: signObj?.color + '40' }}>
                <div className="text-6xl mb-2" style={{ color: signObj?.color }}>{data.symbol}</div>
                <h2 className="font-serif text-2xl text-gold-400">{data.sign}</h2>
                <p className="text-gray-500 text-xs mt-1">{signObj?.dates}</p>
                <div className="flex justify-center gap-3 mt-3 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-cosmic-900/60 border border-gold-600/15 text-gray-400">
                    {data.element} Sign
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-cosmic-900/60 border border-gold-600/15 text-gray-400">
                    Ruled by {data.ruler}
                  </span>
                </div>
              </div>

              {/* Lucky Grid */}
              <div>
                <p className="text-gold-400 font-serif text-lg text-center mb-4">✦ Today's Lucky Factors ✦</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <LuckyCard icon="🎨" label="Lucky Color"   value={data.luckyColor}     valueColor={data.luckyColorHex} />
                  <LuckyCard icon="🔢" label="Lucky Number"  value={data.luckyNumber}    valueColor="#C9A84C" />
                  <LuckyCard icon="🧭" label="Lucky Direction" value={data.luckyDirection} valueColor="#60A5FA" />
                  <LuckyCard icon="⏰" label="Lucky Hour"    value={data.luckyHour}      valueColor="#A78BFA" />
                  <LuckyCard icon="📅" label="Lucky Day"     value={data.luckyDay}       valueColor="#34D399" />
                  <LuckyCard icon="💎" label="Lucky Stone"   value={data.luckyStone}     valueColor="#FB7185" />
                  <LuckyCard icon="⚙️" label="Lucky Metal"   value={data.luckyMetal}     valueColor="#FCD34D" />
                  <LuckyCard icon="🦁" label="Lucky Animal"  value={data.luckyAnimal}    valueColor="#F97316" />
                </div>
              </div>

              {/* Power Word */}
              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/20 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Today's Power Word</p>
                <p className="font-serif text-3xl text-gold-400 mb-2">{data.luckyWord}</p>
                <div className="w-12 h-0.5 bg-gold-500/30 mx-auto rounded-full" />
              </div>

              {/* Affirmation */}
              <div className="rounded-2xl border border-gold-600/20 bg-gold-500/5 p-6 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">✦ Today's Affirmation ✦</p>
                <p className="text-gray-200 text-lg font-serif leading-relaxed italic">"{data.affirmation}"</p>
              </div>

              {/* Mantra & Deity */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Presiding Deity</p>
                  <p className="text-gold-400 font-semibold">{data.deity}</p>
                  <p className="text-gray-500 text-xs mt-1">Offer prayers today for special blessings</p>
                </div>
                <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Beej Mantra</p>
                  <p className="text-gold-400 font-semibold text-sm">{data.mantra}</p>
                  <p className="text-gray-500 text-xs mt-1">Chant 108 times for maximum benefit</p>
                </div>
              </div>

              {/* Color visual */}
              <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
                <p className="text-gray-400 text-sm font-semibold mb-3">Today's Lucky Color Palette</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl shadow-lg flex-shrink-0" style={{ background: data.luckyColorHex, boxShadow:`0 0 20px ${data.luckyColorHex}50` }} />
                  <div>
                    <p className="text-gold-300 font-bold text-lg">{data.luckyColor}</p>
                    <p className="text-gray-500 text-xs mt-1">Wear this color today or keep something in this shade nearby for enhanced luck and positive energy.</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/horoscope/${data.sign}`}
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  📖 Today's Daily Reading
                </Link>
                <Link to="/horoscope/extended"
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  📅 Weekly & Monthly
                </Link>
              </div>
            </motion.div>
          )}

          {!selectedSign && !loading && (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-center py-16">
              <div className="text-6xl mb-4">🍀</div>
              <p className="text-gray-400 text-lg">Select your zodiac sign to reveal today's lucky factors</p>
              <p className="text-gray-500 text-sm mt-2">Lucky color, number, direction, hour, stone, mantra, and more</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
