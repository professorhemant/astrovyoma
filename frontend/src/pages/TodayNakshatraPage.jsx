import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';
import PanchangPlacePicker from '../components/PanchangPlacePicker';

const ELEMENT_STYLE = {
  Earth:  { bg:'bg-yellow-500/10',  border:'border-yellow-500/30',  text:'text-yellow-300',  icon:'🌍' },
  Water:  { bg:'bg-blue-500/10',    border:'border-blue-500/30',    text:'text-blue-300',    icon:'💧' },
  Fire:   { bg:'bg-red-500/10',     border:'border-red-500/30',     text:'text-red-300',     icon:'🔥' },
  Air:    { bg:'bg-cyan-500/10',    border:'border-cyan-500/30',    text:'text-cyan-300',    icon:'💨' },
  Ether:  { bg:'bg-purple-500/10',  border:'border-purple-500/30',  text:'text-purple-300',  icon:'✨' },
};
const RULER_COLOR = {
  Sun:'#FF9F43', Moon:'#74B9FF', Mars:'#FF6B6B', Mercury:'#6BCB77',
  Jupiter:'#FFD93D', Venus:'#FD79A8', Saturn:'#A29BFE', Rahu:'#636e72', Ketu:'#b2bec3',
};
const PADA_RASHI = ['Aries','Taurus','Gemini','Cancer'];

export default function TodayNakshatraPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { place, setPlace, params, placeKey } = usePanchangPlace();

  useEffect(() => {
    setLoading(true);
    panchangApi.nakshatra(params)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeKey]);

  const element = data?.element || 'Earth';
  const es = ELEMENT_STYLE[element] || ELEMENT_STYLE['Earth'];
  const rulerColor = RULER_COLOR[data?.ruler] || '#C9A84C';

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">🌟 Panchang — Second Limb</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>Today's Nakshatra</h1>
            <p className="text-gray-200 text-sm">The Moon's lunar mansion — one of the 27 cosmic star clusters</p>
          </motion.div>

          <div className="mb-8">
            <PanchangPlacePicker place={place} onChange={setPlace} />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Locating Moon's Star...</div>
          ) : !data ? (
            <div className="text-center py-20 text-red-400">Failed to load. Please try again.</div>
          ) : (
            <>
              {/* Hero Nakshatra Card */}
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="bg-gradient-to-br from-cosmic-800/80 to-cosmic-900/80 border border-gold-500/50 rounded-3xl p-8 mb-6 text-center"
                style={{ boxShadow:`0 0 60px ${rulerColor}15` }}>
                <div className="text-5xl mb-3">⭐</div>
                <p className="text-gray-200 text-sm uppercase tracking-widest mb-2">{data.date}</p>
                <h2 className="font-serif text-5xl mb-2" style={{ color: rulerColor, textShadow:`0 0 20px ${rulerColor}50` }}>{data.nakshatra}</h2>
                <div className="flex items-center justify-center gap-3 flex-wrap mt-3">
                  <span className="bg-cosmic-900/80 border border-gold-500/55 text-gold-300 text-sm px-4 py-1.5 rounded-full">Nakshatra #{data.nakshatraNum}</span>
                  <span className="bg-cosmic-900/80 border border-gold-500/55 text-gold-300 text-sm px-4 py-1.5 rounded-full">Pada {data.pada} — {PADA_RASHI[(data.pada - 1) % 4]}</span>
                  <span className={`${es.bg} border ${es.border} ${es.text} text-sm px-4 py-1.5 rounded-full`}>{es.icon} {element} Element</span>
                </div>
                <p className="text-white mt-4 text-sm">Moon at {data.moonDegree}° sidereal</p>
              </motion.div>

              {/* Timing Banner */}
              {data.nakshatraEnds && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.05 }}
                  className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                  <div className="bg-purple-500/10 border border-purple-500/40 rounded-full px-5 py-2 flex items-center gap-2 text-sm">
                    <span className="text-purple-300">⏰</span>
                    <span className="text-gray-200">Nakshatra ends at</span>
                    <span className="text-purple-300 font-semibold">{data.nakshatraEnds.time}</span>
                    <span className={`text-xs ${data.nakshatraEnds.day === 'Tomorrow' ? 'text-yellow-500/70' : 'text-gray-300'}`}>({data.nakshatraEnds.day})</span>
                  </div>
                  {data.nextNakshatra && (
                    <div className="bg-cosmic-800/60 border border-purple-500/25 rounded-full px-5 py-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-300">Next:</span>
                      <span className="text-purple-300 font-medium">{data.nextNakshatra}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Ruler & Deity */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { icon:'🪐', label:'Ruling Planet', value: data.ruler, color: rulerColor },
                  { icon:'🙏', label:'Presiding Deity', value: data.deity, color:'#C9A84C' },
                  { icon:'⭐', label:'Symbol', value: data.symbol, color:'#A29BFE' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="bg-cosmic-800/60 border border-gold-500/40 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="font-serif text-lg font-semibold" style={{ color: item.color }}>{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Good for / Avoid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
                  className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6">
                  <h3 className="text-green-400 font-semibold text-lg mb-3 flex items-center gap-2">✅ Favored Activities</h3>
                  <p className="text-white text-sm leading-relaxed">{data.goodFor}</p>
                </motion.div>
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6">
                  <h3 className="text-red-400 font-semibold text-lg mb-3 flex items-center gap-2">🚫 Best to Avoid</h3>
                  <p className="text-white text-sm leading-relaxed">{data.avoid}</p>
                </motion.div>
              </div>

              {/* What is Nakshatra */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6 mb-8">
                <h3 className="text-gold-400 font-serif font-semibold text-lg mb-3">About Nakshatras</h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  The 27 Nakshatras are lunar mansions — star clusters that the Moon passes through during its monthly journey.
                  The Nakshatra the Moon occupies at birth determines your birth star (Janma Nakshatra), which guides
                  personality, life path, and the Vimshotari Dasha sequence. Today's Nakshatra influences the collective
                  energy and is used to determine the auspiciousness of activities.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
                  <div><span className="text-gold-400 font-semibold block">27</span><span className="text-gray-300">Total Nakshatras</span></div>
                  <div><span className="text-gold-400 font-semibold block">4</span><span className="text-gray-300">Padas each</span></div>
                  <div><span className="text-gold-400 font-semibold block">13°20'</span><span className="text-gray-300">Arc per Nakshatra</span></div>
                </div>
              </motion.div>

              <div className="text-center flex flex-wrap gap-3 justify-center">
                <Link to="/panchang" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">View Full Panchang</Link>
                <Link to="/nakshatra" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">Nakshatra Traits Guide</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
