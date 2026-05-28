import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader, ChevronDown } from 'lucide-react';
import { horoscope as horoscopeApi } from '../api';

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

const PERIODS = [
  { id:'weekly',  label:'This Week',      icon:'📅' },
  { id:'monthly', label:'This Month',     icon:'🗓' },
  { id:'yearly',  label:'2026 Forecast',  icon:'🌟' },
];

function Section({ icon, title, children }) {
  return (
    <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
      <p className="text-gold-400 font-semibold text-sm mb-2 flex items-center gap-1.5">
        <span>{icon}</span>{title}
      </p>
      <p className="text-gray-300 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function LuckyChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 bg-cosmic-900/60 rounded-xl px-3 py-2 border border-gold-600/15">
      <span className="text-gray-500 text-xs">{label}:</span>
      <span className="font-semibold text-xs" style={{ color: color || '#c9a84c' }}>{value}</span>
    </div>
  );
}

export default function WeeklyHoroscopePage() {
  const [selectedSign, setSelectedSign] = useState(null);
  const [period, setPeriod]             = useState('weekly');
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(false);
  const [year, setYear]                 = useState(2026);

  const signObj = SIGNS.find(s => s.name === selectedSign);

  useEffect(() => {
    if (!selectedSign) return;
    setData(null);
    setLoading(true);
    const fetch = async () => {
      try {
        let res;
        if (period === 'weekly')       res = await horoscopeApi.getWeekly(selectedSign);
        else if (period === 'monthly') res = await horoscopeApi.getMonthly(selectedSign);
        else                           res = await horoscopeApi.getYearly(selectedSign, year);
        setData(res.data);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [selectedSign, period, year]);

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Vedic Cosmic Forecasts</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            Weekly · Monthly · Yearly
          </h1>
          <p className="text-gray-300 text-lg mb-2">Extended Horoscope Forecasts</p>
          <p className="text-gray-400 text-sm">{today}</p>
          <p className="text-gray-500 text-xs mt-2">
            For today's daily reading → <Link to="/horoscope" className="text-gold-400 hover:underline">Daily Horoscope</Link>
          </p>
        </motion.div>

        {/* Sign Selector */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mb-8">
          <p className="text-gray-400 text-sm text-center mb-4">Select Your Zodiac Sign</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {SIGNS.map(s => (
              <button key={s.name} onClick={() => setSelectedSign(s.name)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  selectedSign === s.name
                    ? 'border-gold-500/60 bg-gold-500/10 scale-105'
                    : 'border-gold-600/15 bg-cosmic-900/40 hover:border-gold-500/30 hover:bg-gold-500/5'
                }`}>
                <span className="text-2xl" style={{ color: s.color }}>{s.symbol}</span>
                <span className="text-xs text-gray-300 font-medium">{s.name}</span>
                <span className="text-gray-600 text-[10px] hidden md:block">{s.dates}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Period Tabs */}
        {selectedSign && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mb-6 space-y-4">
            <div className="flex gap-2">
              {PERIODS.map(p => (
                <button key={p.id} onClick={() => setPeriod(p.id)}
                  className={`flex-1 py-3 px-2 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    period === p.id ? 'bg-gold-500 text-cosmic-950 border-gold-500' : 'border-gold-600/20 text-gray-400 hover:text-gray-200 bg-cosmic-900/40'
                  }`}>
                  <span>{p.icon}</span>{p.label}
                </button>
              ))}
            </div>

            {period === 'yearly' && (
              <div className="flex gap-2 justify-center">
                {[2026, 2027].map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`px-4 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                      year === y ? 'bg-gold-500/20 border-gold-500/60 text-gold-300' : 'border-gold-600/20 text-gray-400 hover:text-gray-200'
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-gold-400 animate-spin" />
            </motion.div>
          )}

          {data && !loading && (
            <motion.div key={`${selectedSign}-${period}-${year}`} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-5">

              {/* Sign Hero */}
              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/20 text-center">
                <div className="text-5xl mb-2" style={{ color: signObj?.color }}>{signObj?.symbol}</div>
                <h2 className="font-serif text-2xl text-gold-400">{selectedSign}</h2>
                <p className="text-gray-500 text-sm">{signObj?.dates}</p>
                {period === 'weekly' && (
                  <p className="text-gray-400 text-xs mt-2">
                    Week {data.weekNumber} · {data.weekStart} to {data.weekEnd}
                    {data.theme && <span className="ml-2 text-gold-500 font-semibold">✦ {data.theme} Week</span>}
                  </p>
                )}
                {period === 'monthly' && (
                  <p className="text-gray-400 text-xs mt-2">{data.month} {data.year} Forecast</p>
                )}
                {period === 'yearly' && (
                  <p className="text-gray-400 text-xs mt-2">{data.year} Annual Forecast</p>
                )}
              </div>

              {/* Overview */}
              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/20">
                <p className="text-gold-400 font-serif text-lg mb-3">
                  {period === 'weekly' ? 'Weekly Overview' : period === 'monthly' ? 'Monthly Overview' : 'Annual Overview'}
                </p>
                <p className="text-gray-300 leading-relaxed">{data.overview}</p>
              </div>

              {/* Weekly sections */}
              {period === 'weekly' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Section icon="💕" title="Love & Relationships">{data.love}</Section>
                  <Section icon="💼" title="Career & Finance">{data.career}</Section>
                  <Section icon="🌿" title="Health & Wellness">{data.health}</Section>
                  <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
                    <p className="text-gold-400 font-semibold text-sm mb-3">Lucky Factors</p>
                    <div className="flex flex-wrap gap-2">
                      <LuckyChip label="Color" value={data.lucky?.color} />
                      <LuckyChip label="Number" value={data.lucky?.number} />
                      <LuckyChip label="Day" value={data.lucky?.day} />
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly sections */}
              {period === 'monthly' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Section icon="💕" title="Love & Relationships">{data.love}</Section>
                    <Section icon="💼" title="Career & Finance">{data.career}</Section>
                    <Section icon="🌿" title="Health & Wellness">{data.health}</Section>
                    <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
                      <p className="text-gold-400 font-semibold text-sm mb-3">Monthly Lucky Factors</p>
                      <div className="flex flex-wrap gap-2">
                        <LuckyChip label="Color" value={data.lucky?.color} />
                        <LuckyChip label="Number" value={data.lucky?.number} />
                        <LuckyChip label="Day" value={data.lucky?.day} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Yearly sections */}
              {period === 'yearly' && (
                <>
                  {data.quarters && (
                    <div className="card-cosmic rounded-2xl p-6 border border-gold-600/15">
                      <p className="text-gold-400 font-serif text-base mb-4">Quarterly Breakdown</p>
                      <div className="space-y-3">
                        {data.quarters.map((q, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-gold-500/15 border border-gold-500/30 flex-shrink-0 flex items-center justify-center text-gold-400 text-xs font-bold">
                              Q{i+1}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.lucky && (
                    <div className="card-cosmic rounded-xl p-5 border border-gold-600/15">
                      <p className="text-gold-400 font-semibold text-sm mb-3">{data.year} Lucky Factors</p>
                      <div className="flex flex-wrap gap-2">
                        <LuckyChip label="Color" value={data.lucky.color} />
                        <LuckyChip label="Number" value={data.lucky.number} />
                        {data.lucky.gemstone && <LuckyChip label="Gemstone" value={data.lucky.gemstone} color="#60a5fa" />}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Footer links */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/horoscope/${selectedSign}`}
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  → Today's Daily Reading
                </Link>
                <Link to="/kundali"
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  → Get Free Kundali
                </Link>
              </div>
            </motion.div>
          )}

          {!selectedSign && !loading && (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-center py-16">
              <div className="text-6xl mb-4">🔮</div>
              <p className="text-gray-400 text-lg">Select your zodiac sign above to see your forecast</p>
              <p className="text-gray-500 text-sm mt-2">Weekly, monthly, and yearly predictions available</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
