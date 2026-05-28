import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { panchang as panchangApi } from '../api';

const MUHURTA_INFO = [
  { key:'brahma',  icon:'🌅', title:'Brahma Muhurta',  color:'#FF9F43', desc:'The Creator\'s time � 1.5 hours before sunrise. Best for meditation, prayer, yoga, and starting spiritual practices. The most sattvic period of the day.' },
  { key:'pratah',  icon:'🌄', title:'Pratah Sandhya',  color:'#FFD93D', desc:'Dawn twilight � the transition at sunrise. Auspicious for bathing, prayers, and morning rituals.' },
  { key:'abhijit', icon:'☀️', title:'Abhijit Muhurta', color:'#6BCB77', desc:'The midday muhurta � when the Sun is at its peak power. This is the most powerful auspicious period for starting any important work, signing contracts, or making major decisions.' },
  { key:'vijaya',  icon:'🏆', title:'Vijaya Muhurta',  color:'#74B9FF', desc:'Victory time � 2 muhurtas before sunset. Excellent for important tasks, winning competitions, and new ventures in the afternoon.' },
  { key:'godhuli', icon:'🐄', title:'Godhuli Muhurta', color:'#FD79A8', desc:'Cow-dust time � at sunset when cattle return. Traditionally one of the most auspicious times for marriage ceremonies and new beginnings.' },
  { key:'nisitha', icon:'🌙', title:'Nisitha Muhurta',  color:'#A29BFE', desc:'Midnight muhurta � around 12 AM. Sacred for Shiva worship, deep meditation, and tantric practices.' },
];

const ACTIVITY_ICONS = { Marriage:'💍', Business:'💼', Travel:'✈️', Education:'📚', Property:'🏠', Medicine:'💊' };

export default function TodayShubhamuhuratPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    panchangApi.shubhamuhurat()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✨ Auspicious Timings</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>Today's Shubha Muhurat</h1>
            <p className="text-gray-200 text-sm">Sacred time windows for important activities � aligned with planetary rhythms</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Finding Auspicious Times...</div>
          ) : !data ? (
            <div className="text-center py-20 text-red-400">Failed to load. Please try again.</div>
          ) : (
            <>
              {/* Date header */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="bg-cosmic-800/60 border border-gold-500/45 rounded-2xl p-4 mb-6 text-center">
                <p className="text-gold-300 font-serif">{data.date}</p>
                <p className="text-gray-200 text-sm mt-1">{data.vara} � ruled by {data.varaLord}</p>
                {(data.isSarvarthaSiddhi || data.isAmritSiddhi) && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {data.isSarvarthaSiddhi && (
                      <span className="bg-green-500/20 border border-green-500/60 text-green-300 text-xs px-3 py-1.5 rounded-full">
                        ? Sarvartha Siddhi Yoga � Highly Auspicious Day
                      </span>
                    )}
                    {data.isAmritSiddhi && (
                      <span className="bg-blue-500/20 border border-blue-500/60 text-blue-300 text-xs px-3 py-1.5 rounded-full">
                        ?? Amrit Siddhi Yoga � Nectar of Success
                      </span>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Avoid Rahu Kaal */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.05 }}
                className="bg-red-500/10 border border-red-500/50 rounded-xl px-5 py-3 mb-5 flex items-center gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <div>
                  <span className="text-red-400 font-medium text-sm">Avoid � Rahu Kaal: </span>
                  <span className="text-red-300 text-sm">{data.rahuKaal}</span>
                  <span className="text-gray-200 text-sm ml-2">Do not start new work during this period</span>
                </div>
              </motion.div>

              {/* Muhurta Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {MUHURTA_INFO.map((m, i) => {
                  const timeVal = data[m.key];
                  if (!timeVal) return null;
                  return (
                    <motion.div key={m.key} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 + i * 0.06 }}
                      className="bg-cosmic-800/60 border border-gold-500/40 rounded-2xl p-5"
                      style={{ borderColor: `${m.color}25` }}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{m.icon}</div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-300 uppercase tracking-wider mb-0.5">{m.title}</p>
                          <p className="font-serif text-lg font-semibold mb-2" style={{ color: m.color }}>{timeVal}</p>
                          <p className="text-gray-200 text-sm leading-relaxed">{m.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Activity-Based Muhurta */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
                className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6 mb-8">
                <h3 className="text-gold-400 font-serif font-semibold text-lg mb-4">Activity-Based Muhurta</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(data.activities || {}).map(([activity, time]) => time && (
                    <div key={activity} className="bg-cosmic-900/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{ACTIVITY_ICONS[activity] || '⭐'}</span>
                        <span className="text-gold-400 font-medium text-sm">{activity}</span>
                      </div>
                      <p className="text-white text-sm">{time}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What is Muhurta */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-5 mb-8 text-center">
                <p className="text-gray-200 text-sm leading-relaxed">
                  A <span className="text-gold-400">Muhurta</span> is a unit of time (approximately 48 minutes) in Vedic astrology.
                  The day has 30 muhurtas from sunrise to next sunrise. Each muhurta has a quality � auspicious muhurtas
                  amplify the success of activities started within them, based on planetary alignments.
                </p>
              </motion.div>

              <div className="text-center flex flex-wrap gap-3 justify-center">
                <Link to="/panchang" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">Full Panchang</Link>
                <Link to="/astrologers" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">Ask a Muhurta Expert</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
