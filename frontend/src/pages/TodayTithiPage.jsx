import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';
import PanchangPlacePicker from '../components/PanchangPlacePicker';

const PAKSHA_PHASE = {
  'Shukla Paksha': { label: 'Waxing Moon', icon: '🌒', desc: 'Bright fortnight — energy building, growth, new beginnings' },
  'Krishna Paksha': { label: 'Waning Moon', icon: '🌘', desc: 'Dark fortnight — release, introspection, ancestor worship' },
};
const NATURE_STYLE = {
  Nanda:  { bg: 'bg-blue-500/10', border: 'border-blue-500/30',  text: 'text-blue-300',   label: 'Nanda (Joyful)' },
  Bhadra: { bg: 'bg-green-500/10',border: 'border-green-500/30', text: 'text-green-300',  label: 'Bhadra (Stable)' },
  Jaya:   { bg: 'bg-gold-500/10', border: 'border-yellow-500/30',text: 'text-yellow-300', label: 'Jaya (Victorious)' },
  Rikta:  { bg: 'bg-red-500/10',  border: 'border-red-500/30',   text: 'text-red-300',    label: 'Rikta (Empty)' },
  Poorna: { bg: 'bg-purple-500/10',border: 'border-purple-500/30',text: 'text-purple-300',label: 'Poorna (Complete)' },
  Transformative: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-300', label: 'Transformative' },
};

export default function TodayTithiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { place, setPlace, params, placeKey } = usePanchangPlace();

  useEffect(() => {
    setLoading(true);
    panchangApi.tithi(params)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeKey]);

  const paksha = data ? (data.paksha || '') : '';
  const phase = PAKSHA_PHASE[paksha] || PAKSHA_PHASE['Shukla Paksha'];
  const nature = data?.nature || 'Bhadra';
  const ns = NATURE_STYLE[nature] || NATURE_STYLE['Bhadra'];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">🕉️ Panchang — First Limb</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>Today's Tithi</h1>
            <p className="text-gray-200 text-sm">The lunar day — determined by the angular distance between Sun & Moon</p>
          </motion.div>

          <div className="mb-8">
            <PanchangPlacePicker place={place} onChange={setPlace} />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Calculating Tithi...</div>
          ) : !data ? (
            <div className="text-center py-20 text-red-400">Failed to load. Please try again.</div>
          ) : (
            <>
              {/* Main Tithi Card */}
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="bg-gradient-to-br from-cosmic-800/80 to-cosmic-900/80 border border-gold-500/50 rounded-3xl p-8 mb-6 text-center"
                style={{ boxShadow:'0 0 60px rgba(201,168,76,0.1)' }}>
                <div className="text-6xl mb-3">{phase.icon}</div>
                <p className="text-gray-300 text-sm uppercase tracking-widest mb-2">{data.date}</p>
                <h2 className="font-serif text-5xl text-gold-400 mb-2" style={{ textShadow:'0 0 20px rgba(201,168,76,0.5)' }}>{data.tithi}</h2>
                <div className="flex items-center justify-center gap-3 flex-wrap mt-3">
                  <span className="bg-cosmic-900/80 border border-gold-500/55 text-gold-300 text-sm px-4 py-1.5 rounded-full">{data.tithiPaksha}</span>
                  <span className={`${ns.bg} border ${ns.border} ${ns.text} text-sm px-4 py-1.5 rounded-full`}>{ns.label}</span>
                </div>
                <p className="text-white mt-5 text-base max-w-lg mx-auto leading-relaxed">{data.meaning}</p>
              </motion.div>

              {/* Timing Banner */}
              {data.tithiEnds && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.05 }}
                  className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                  <div className="bg-gold-500/10 border border-gold-500/40 rounded-full px-5 py-2 flex items-center gap-2 text-sm">
                    <span className="text-gold-400">⏰</span>
                    <span className="text-gray-200">Tithi ends at</span>
                    <span className="text-gold-300 font-semibold">{data.tithiEnds.time}</span>
                    <span className={`text-xs ${data.tithiEnds.day === 'Tomorrow' ? 'text-yellow-500/70' : 'text-gray-200'}`}>({data.tithiEnds.day})</span>
                  </div>
                  {data.nextTithi && (
                    <div className="bg-cosmic-800/60 border border-gold-500/25 rounded-full px-5 py-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-300">Next Tithi:</span>
                      <span className="text-gold-400 font-medium">{data.nextTithi}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Paksha Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
                  className="bg-cosmic-800/60 border border-gold-500/40 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{phase.icon}</span>
                    <div>
                      <p className="text-gold-400 font-serif font-semibold text-lg">{paksha}</p>
                      <p className="text-gray-200 text-sm">{phase.label}</p>
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{phase.desc}</p>
                </motion.div>

                <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
                  className="bg-cosmic-800/60 border border-gold-500/40 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🙏</span>
                    <div>
                      <p className="text-gold-400 font-serif font-semibold text-lg">Presiding Deity</p>
                      <p className="text-gray-200 text-sm">Divine ruler of this Tithi</p>
                    </div>
                  </div>
                  <p className="text-white text-2xl font-serif font-semibold">{data.deity}</p>
                </motion.div>
              </div>

              {/* Do & Avoid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6">
                  <h3 className="text-green-400 font-semibold text-lg mb-3 flex items-center gap-2">✅ Favorable Activities</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{data.goodFor}</p>
                </motion.div>
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6">
                  <h3 className="text-red-400 font-semibold text-lg mb-3 flex items-center gap-2">🚫 Activities to Avoid</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{data.avoid}</p>
                </motion.div>
              </div>

              {/* Tithi Number Info */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-serif text-gold-400 font-bold w-14 h-14 flex items-center justify-center bg-gold-500/10 border border-gold-500/20 rounded-full">{data.tithiNum}</div>
                  <div>
                    <p className="text-gold-400 font-serif font-semibold text-lg">{data.type} Tithi</p>
                    <p className="text-gray-200 text-sm mt-1 leading-relaxed">
                      This is Tithi number {data.tithiNum} of the {paksha}. Each of the 30 tithis in a lunar month is governed by
                      a specific deity and carries distinct energy for human activities.
                    </p>
                    <p className="text-gray-300 text-sm mt-2">Today is {data.vara}, ruled by {data.varaLord}.</p>
                  </div>
                </div>
              </motion.div>

              {/* Tithi Schedule Chart */}
              {data.tithiChart && data.tithiChart.length > 0 && (
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                  className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl overflow-hidden mb-8">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gold-500/25">
                    <h3 className="text-gold-400 font-serif font-semibold">Tithi Schedule</h3>
                    <span className="text-gray-200 text-xs">📍 {data.location}</span>
                  </div>
                  <div className="divide-y divide-gold-500/10">
                    {data.tithiChart.map((entry, i) => (
                      <div key={i} className={`flex gap-3 px-5 py-3 ${i === 0 ? 'bg-gold-500/5' : ''}`}>
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: i === 0 ? '#C9A84C' : '#4B4B4B' }} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${i === 0 ? 'text-gold-300' : 'text-gray-300'}`}>{entry.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                            <span className="text-gray-300 text-sm">Start: <span className="text-white">{entry.startDate}, {entry.startTime}</span></span>
                            <span className="text-gray-300 text-sm">End: <span className="text-white">{entry.endDate}, {entry.endTime}</span></span>
                          </div>
                        </div>
                        {i === 0 && <span className="text-[10px] bg-gold-500/15 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-full self-start mt-0.5 flex-shrink-0">Now</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="text-center">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/panchang" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">View Full Panchang</Link>
                  <Link to="/panchang/choghadiya" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">Today's Choghadiya</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
