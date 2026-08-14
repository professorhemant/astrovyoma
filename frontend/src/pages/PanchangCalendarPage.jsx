import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';
import PanchangPlacePicker from '../components/PanchangPlacePicker';

const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TITHI_COLOR = {
  Pratipada:'#74B9FF', Dwitiya:'#74B9FF', Tritiya:'#6BCB77', Chaturthi:'#FF9F43',
  Panchami:'#6BCB77', Shashthi:'#6BCB77', Saptami:'#FFD93D', Ashtami:'#FD79A8',
  Navami:'#FD79A8', Dashami:'#6BCB77', Ekadashi:'#C9A84C', Dwadashi:'#74B9FF',
  Trayodashi:'#FD79A8', Chaturdashi:'#FF6B6B', Purnima:'#E8C547', Amavasya:'#A29BFE',
};

export default function PanchangCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calData, setCalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const { place, setPlace, params, placeKey } = usePanchangPlace();

  useEffect(() => {
    setLoading(true);
    panchangApi.calendar({ year, month, ...params })
      .then(r => setCalData(r.data))
      .catch(() => setCalData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, placeKey]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // Build grid: blank cells + day cells
  const grid = calData ? [
    ...Array(calData.firstDayOfWeek).fill(null),
    ...calData.days,
  ] : [];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">🕉️ Hindu Almanac</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>Panchang Calendar</h1>
            <p className="text-gray-200 text-sm">Monthly view — Tithi, Nakshatra & festivals for each day</p>
          </motion.div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6 bg-cosmic-800/60 border border-gold-500/45 rounded-2xl p-4">
            <button onClick={prevMonth} className="text-gold-400 hover:text-gold-300 transition-colors p-2 rounded-xl hover:bg-gold-500/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="font-serif text-2xl text-gold-400">{calData?.monthName || '—'} {year}</h2>
              <p className="text-gray-300 text-xs mt-0.5">{calData?.days?.length || '—'} days</p>
            </div>
            <button onClick={nextMonth} className="text-gold-400 hover:text-gold-300 transition-colors p-2 rounded-xl hover:bg-gold-500/10">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-200 justify-center">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gold-400/60 inline-block"></span> Today</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400/40 inline-block"></span> Festival</span>
            <span className="flex items-center gap-1.5">S = Shukla Paksha</span>
            <span className="flex items-center gap-1.5">K = Krishna Paksha</span>
          </div>

          <div className="mb-8">
            <PanchangPlacePicker place={place} onChange={setPlace} />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Building Calendar...</div>
          ) : !calData ? (
            <div className="text-center py-20 text-red-400">Failed to load calendar.</div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl overflow-hidden mb-6">
                {/* Header */}
                <div className="grid grid-cols-7 border-b border-gold-500/40">
                  {DAYS_OF_WEEK.map(d => (
                    <div key={d} className={`text-center py-3 text-xs font-semibold tracking-wider ${d === 'Sun' ? 'text-red-400' : d === 'Sat' ? 'text-blue-400' : 'text-gray-200'}`}>{d}</div>
                  ))}
                </div>
                {/* Cells */}
                <div className="grid grid-cols-7">
                  {grid.map((cell, idx) => {
                    if (!cell) return <div key={`e${idx}`} className="border-r border-b border-gold-500/25 min-h-[80px]" />;
                    const isToday = cell.date === todayStr;
                    const hasFestival = !!cell.festival;
                    const tithiColor = TITHI_COLOR[cell.tithi] || '#C9A84C';
                    const dayNum = new Date(cell.date).getDay();
                    const dayColor = dayNum === 0 ? 'text-red-400' : dayNum === 6 ? 'text-blue-400' : 'text-gray-200';
                    return (
                      <motion.div key={cell.date}
                        whileHover={{ backgroundColor: 'rgba(201,168,76,0.07)' }}
                        onClick={() => setSelected(cell)}
                        className={`border-r border-b border-gold-500/25 min-h-[80px] p-1.5 cursor-pointer transition-colors relative ${isToday ? 'bg-gold-500/10' : ''}`}>
                        <div className="flex items-start justify-between mb-1">
                          <span className={`text-sm font-semibold ${dayColor} ${isToday ? 'bg-gold-400 text-cosmic-950 rounded-full w-6 h-6 flex items-center justify-center text-xs' : ''}`}>{cell.day}</span>
                          {hasFestival && <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-[10px] font-medium leading-tight" style={{ color: tithiColor }}>{cell.paksha}{cell.tithiNum}</p>
                        <p className="text-[9px] text-gray-300 leading-tight truncate">{cell.tithi}</p>
                        {hasFestival && <p className="text-[9px] text-green-400 leading-tight truncate mt-0.5">{cell.festival}</p>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Festivals this month */}
              {calData.days.some(d => d.festival) && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="bg-green-500/10 border border-green-500/50 rounded-2xl p-5 mb-6">
                  <h3 className="text-green-400 font-semibold mb-3">🎉 Festivals This Month</h3>
                  <div className="space-y-2">
                    {calData.days.filter(d => d.festival).map(d => (
                      <div key={d.date} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-200 w-14 flex-shrink-0">{new Date(d.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                        <span className="text-gray-300 text-xs">{d.vara}</span>
                        <span className="text-green-300 font-medium">{d.festival}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          <div className="text-center">
            <Link to="/panchang" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">Today's Full Panchang</Link>
          </div>
        </div>
      </div>

      {/* Day Detail Popup */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-950/80 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:20 }}
              onClick={e => e.stopPropagation()}
              className="bg-cosmic-800 border border-gold-500/55 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-300 text-xs uppercase tracking-wider">{selected.vara}</p>
                  <p className="font-serif text-2xl text-gold-400">{new Date(selected.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-300 p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-200">Tithi</span><span className="text-gold-300 font-medium">{selected.paksha === 'S' ? 'Shukla' : 'Krishna'} {selected.tithiNum} — {selected.tithi}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-200">Nakshatra</span><span className="text-purple-300 font-medium">{selected.nakshatra}</span></div>
                {selected.festival && <div className="flex justify-between text-sm"><span className="text-gray-200">Festival</span><span className="text-green-400 font-medium">{selected.festival}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-200">Auspicious</span><span className={selected.isAuspicious ? 'text-green-400' : 'text-red-400'}>{selected.isAuspicious ? 'Yes' : 'Avoid new starts'}</span></div>
              </div>
              <Link to="/panchang" className="mt-5 block text-center bg-gold-500/10 border border-gold-500/55 text-gold-400 rounded-xl py-2.5 text-sm hover:bg-gold-500/20 transition-colors" onClick={() => setSelected(null)}>
                View Full Day Panchang ?
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
