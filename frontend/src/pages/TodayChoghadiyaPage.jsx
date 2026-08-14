import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';
import PanchangPlacePicker from '../components/PanchangPlacePicker';

const NATURE_BADGE = {
  'Very Auspicious': 'bg-green-500/20 border-green-500/40 text-green-300',
  'Auspicious':      'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'Inauspicious':    'bg-red-500/20 border-red-500/40 text-red-300',
};

function ChoghadiyaRow({ slot, index, isCurrent }) {
  const borderColor = slot.color || '#C9A84C';
  return (
    <motion.div
      initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrent ? 'bg-gold-500/10 border-gold-500/60 shadow-lg' : 'bg-cosmic-800/40 border-gold-500/25'}`}
      style={isCurrent ? { boxShadow:`0 0 20px ${borderColor}20` } : {}}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background:`${borderColor}20`, color: borderColor, border:`1px solid ${borderColor}40` }}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm">{slot.icon}</span>
          <span className="font-serif font-semibold" style={{ color: borderColor }}>{slot.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${NATURE_BADGE[slot.nature] || 'bg-gray-500/20 border-gray-500/40 text-gray-300'}`}>{slot.nature}</span>
          {isCurrent && <span className="text-xs bg-gold-500/20 border border-gold-500/40 text-gold-300 px-2 py-0.5 rounded-full animate-pulse">✦ Now</span>}
        </div>
        <p className="text-gray-300 text-sm mt-0.5 truncate">{slot.desc}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-white text-sm font-medium">{slot.start}</p>
        <p className="text-gray-300 text-sm">to {slot.end}</p>
      </div>
    </motion.div>
  );
}

export default function TodayChoghadiyaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('day');

  const { place, setPlace, params, placeKey } = usePanchangPlace();

  useEffect(() => {
    setLoading(true);
    panchangApi.choghadiya(params)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeKey]);

  const slots = tab === 'day' ? (data?.daySlots || []) : (data?.nightSlots || []);
  const currentIdx = tab === 'day' ? data?.currentDaySlotIdx : data?.currentNightSlotIdx;

  const goodCount = slots.filter(s => s.nature !== 'Inauspicious').length;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">⏰ Vedic Time Division</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>Today's Choghadiya</h1>
            <p className="text-gray-200 text-sm">8 auspicious & inauspicious time periods — day and night</p>
          </motion.div>

          <div className="mb-8">
            <PanchangPlacePicker place={place} onChange={setPlace} />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Dividing the Day...</div>
          ) : !data ? (
            <div className="text-center py-20 text-red-400">Failed to load. Please try again.</div>
          ) : (
            <>
              {/* Header */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="bg-cosmic-800/60 border border-gold-500/45 rounded-2xl p-5 mb-6 text-center">
                <p className="text-gray-200 text-sm">{data.date}</p>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <span className="text-sm text-orange-300">🌅 Sunrise {data.sunrise}</span>
                  <span className="text-sm text-purple-300">🌇 Sunset {data.sunset}</span>
                </div>
              </motion.div>

              {/* Day / Night Tabs */}
              <div className="flex bg-cosmic-800/60 border border-gold-500/45 rounded-2xl p-1 mb-5">
                {[['day','☀️ Day Choghadiya'],['night','🌙 Night Choghadiya']].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab===key ? 'bg-gold-500/20 text-gold-400 border border-gold-500/55' : 'text-gray-200 hover:text-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Slots */}
              <div className="space-y-2 mb-6">
                {slots.map((slot, i) => (
                  <ChoghadiyaRow key={i} slot={slot} index={i} isCurrent={i === currentIdx} />
                ))}
              </div>

              {/* Legend */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-5 mb-8">
                <h3 className="text-gold-400 font-serif font-semibold mb-4 text-center">Choghadiya Meanings</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name:'Amrit', color:'#6BCB77', note:'Best — all work' },
                    { name:'Shubh', color:'#74B9FF', note:'Good — new starts' },
                    { name:'Labh', color:'#FFD93D', note:'Good — business' },
                    { name:'Char', color:'#A29BFE', note:'Good — travel' },
                    { name:'Rog', color:'#FF6B6B', note:'Avoid — new work' },
                    { name:'Kaal', color:'#E17055', note:'Avoid — auspicious' },
                    { name:'Udveg', color:'#FD79A8', note:'Avoid — all starts' },
                  ].map(item => (
                    <div key={item.name} className="text-center p-3 rounded-xl bg-cosmic-900/50">
                      <p className="font-serif font-semibold text-sm" style={{ color: item.color }}>{item.name}</p>
                      <p className="text-gray-200 text-sm mt-0.5">{item.note}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="text-center flex flex-wrap gap-3 justify-center">
                <Link to="/panchang" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">Full Panchang</Link>
                <Link to="/panchang/shubhamuhurat" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">Shubha Muhurat</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
