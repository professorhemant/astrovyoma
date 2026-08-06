import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsCalendar } from '../api';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_META = {
  'festival':        { label:'Festival',       color:'bg-amber-500/20 border-amber-500/40 text-amber-300',  dot:'bg-amber-400',    icon:'🎉' },
  'purnima':         { label:'Purnima',         color:'bg-blue-500/20  border-blue-500/40  text-blue-300',   dot:'bg-blue-400',     icon:'🌕' },
  'amavasya':        { label:'Amavasya',        color:'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', dot:'bg-indigo-400', icon:'🌑' },
  'eclipse':         { label:'Eclipse',         color:'bg-red-500/20   border-red-500/40   text-red-300',    dot:'bg-red-400',      icon:'🌒' },
  'retrograde-start':{ label:'Retrograde ↻',   color:'bg-orange-500/20 border-orange-500/40 text-orange-300', dot:'bg-orange-400', icon:'↩' },
  'retrograde-end':  { label:'Direct ↺',        color:'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', dot:'bg-emerald-400', icon:'↪' },
  'transit':         { label:'Transit',         color:'bg-cyan-500/20  border-cyan-500/40  text-cyan-300',   dot:'bg-cyan-400',     icon:'🪐' },
  'ekadashi':        { label:'Ekadashi',        color:'bg-violet-500/20 border-violet-500/40 text-violet-300', dot:'bg-violet-400', icon:'🙏' },
};

const FILTERS = [
  { key:'all',              label:'All' },
  { key:'festival',         label:'Festivals' },
  { key:'purnima',          label:'Purnima' },
  { key:'amavasya',         label:'Amavasya' },
  { key:'ekadashi',         label:'Ekadashi' },
  { key:'eclipse',          label:'Eclipses' },
  { key:'retrograde-start', label:'Retrogrades' },
  { key:'transit',          label:'Transits' },
];

function EventChip({ event, compact }) {
  const meta = TYPE_META[event.type] || TYPE_META.festival;
  if (compact) {
    return <span className={`inline-block w-2 h-2 rounded-full ${meta.dot} mr-0.5`} title={event.title} />;
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>
      <span>{meta.icon}</span>
      <span className="truncate max-w-[120px]">{event.title}</span>
    </span>
  );
}

function EventCard({ event }) {
  const meta = TYPE_META[event.type] || TYPE_META.festival;
  return (
    <div className={`p-3 rounded-xl border ${meta.color} bg-opacity-10`}>
      <div className="flex items-start gap-2">
        <span className="text-lg shrink-0">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">{event.title}</span>
            {event.planet && (
              <span className="text-xs opacity-70">({event.planet})</span>
            )}
          </div>
          <p className="text-xs opacity-80 leading-relaxed">{event.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function FestivalCalendarPage() {
  const today    = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [filter, setFilter] = useState('all');
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const load = useCallback(async (m, y) => {
    setLoading(true);
    setSelectedDay(null);
    try {
      const res = await eventsCalendar.get({ month: m, year: y });
      setData(res.data);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(month, year); }, [month, year, load]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const todayStr = today.toISOString().slice(0, 10);

  const grouped = data?.grouped || {};

  const getFiltered = (dateStr) => {
    const evts = grouped[dateStr] || [];
    if (filter === 'all') return evts;
    if (filter === 'retrograde-start') return evts.filter(e => e.type === 'retrograde-start' || e.type === 'retrograde-end');
    return evts.filter(e => e.type === filter);
  };

  const selectedEvents = selectedDay ? getFiltered(selectedDay) : [];

  // All events for the month filtered
  const allMonthEvents = (data?.events || []).filter(e =>
    filter === 'all' ? true :
    filter === 'retrograde-start' ? (e.type === 'retrograde-start' || e.type === 'retrograde-end') :
    e.type === filter
  );

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <div className="text-5xl mb-4">🗓️</div>
          <h1 className="text-3xl font-serif text-gold-400 mb-2">Hindu Festival & Planetary Events Calendar</h1>
          <p className="text-cosmic-300 text-sm max-w-xl mx-auto">
            Festivals, Ekadashi, Purnima, Amavasya, eclipses, retrogrades and transits — computed from the Swiss Ephemeris for any month you page to.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Calendar + Filters */}
          <div className="lg:col-span-2 space-y-5">

            {/* Month navigator */}
            <div className="card-cosmic p-4 flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-gold-400 transition-colors text-lg">‹</button>
              <div className="text-center">
                <div className="text-gold-400 font-serif text-xl">{MONTHS[month - 1]} {year}</div>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-gold-400 transition-colors text-lg">›</button>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    filter === f.key
                      ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold'
                      : 'bg-white/5 border-white/10 text-cosmic-300 hover:border-gold-500/40 hover:text-gold-400'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="card-cosmic p-10 text-center text-gold-400 animate-pulse font-serif text-lg">✦ Loading…</div>
            ) : (
              <div className="card-cosmic p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className={`text-center text-xs font-semibold py-1 ${d === 'Sun' ? 'text-red-400' : 'text-cosmic-400'}`}>{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-px">
                  {/* Leading empty cells */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`e-${i}`} className="min-h-[60px] sm:min-h-[72px]" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day    = i + 1;
                    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const events  = getFiltered(dateStr);
                    const isToday = dateStr === todayStr;
                    const isSel   = dateStr === selectedDay;
                    const dow     = (firstDayOfWeek + i) % 7;

                    return (
                      <button key={dateStr}
                        onClick={() => setSelectedDay(isSel ? null : dateStr)}
                        className={`min-h-[60px] sm:min-h-[72px] p-1 sm:p-1.5 rounded-lg border text-left transition-all ${
                          isSel
                            ? 'bg-gold-500/15 border-gold-500/60'
                            : isToday
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : events.length > 0
                            ? 'bg-white/3 border-white/10 hover:bg-white/6 hover:border-gold-500/30'
                            : 'border-transparent hover:bg-white/3'
                        }`}>
                        <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-400' : dow === 0 ? 'text-red-400' : 'text-cosmic-300'}`}>
                          {day}
                          {isToday && <span className="ml-1 text-blue-400">•</span>}
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {events.slice(0, 3).map((e, idx) => (
                            <EventChip key={idx} event={e} compact />
                          ))}
                          {events.length > 3 && (
                            <span className="text-gold-500 text-[10px]">+{events.length - 3}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="card-cosmic p-3">
              <div className="flex flex-wrap gap-3">
                {Object.entries(TYPE_META).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs text-cosmic-400">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    {meta.icon} {meta.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Selected day / Upcoming events */}
          <div className="space-y-5">

            {/* Selected day panel */}
            <AnimatePresence mode="wait">
              {selectedDay && (
                <motion.div key={selectedDay} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                  <div className="card-cosmic p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gold-400 font-serif">
                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
                      </h3>
                      <button onClick={() => setSelectedDay(null)} className="text-cosmic-500 hover:text-cosmic-300 text-lg">×</button>
                    </div>
                    {selectedEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEvents.map((e, i) => <EventCard key={i} event={e} />)}
                      </div>
                    ) : (
                      <p className="text-cosmic-500 text-sm text-center py-4">No events match the current filter.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* This month events list */}
            <div className="card-cosmic p-4">
              <h3 className="text-gold-400 font-serif mb-4">
                {allMonthEvents.length > 0 ? `${MONTHS[month-1]} Events (${allMonthEvents.length})` : `${MONTHS[month-1]} Events`}
              </h3>
              {loading ? (
                <div className="text-center text-gold-400 animate-pulse py-4 font-serif">✦</div>
              ) : allMonthEvents.length === 0 ? (
                <p className="text-cosmic-500 text-sm text-center py-4">No events this month for the selected filter.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                  {allMonthEvents.map((e, i) => {
                    const meta = TYPE_META[e.type] || TYPE_META.festival;
                    const dayNum = parseInt(e.date.slice(8));
                    const dow = new Date(e.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday:'short' });
                    return (
                      <button key={i}
                        onClick={() => setSelectedDay(e.date)}
                        className={`w-full text-left flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                          selectedDay === e.date
                            ? 'bg-gold-500/10 border-gold-500/40'
                            : 'border-transparent hover:bg-white/5 hover:border-white/10'
                        }`}>
                        <div className="text-center shrink-0 w-9">
                          <div className="text-gold-400 font-bold text-sm leading-none">{dayNum}</div>
                          <div className="text-cosmic-500 text-[10px]">{dow}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                            <span className="text-cosmic-200 text-xs font-medium truncate">{e.title}</span>
                          </div>
                          {e.planet && <div className="text-cosmic-500 text-[10px] ml-3">{e.planet}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming events (cross-month) */}
            {data?.upcoming?.length > 0 && (
              <div className="card-cosmic p-4">
                <h3 className="text-gold-400 font-serif mb-3 text-sm">Coming Up Next</h3>
                <div className="space-y-2">
                  {data.upcoming.map((e, i) => {
                    const meta = TYPE_META[e.type] || TYPE_META.festival;
                    const d = new Date(e.date + 'T12:00:00');
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className="shrink-0 text-center w-10">
                          <div className="text-gold-400 font-bold">{d.getDate()}</div>
                          <div className="text-cosmic-500">{MONTHS[d.getMonth()].slice(0,3)}</div>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          <span className="text-cosmic-300 truncate">{e.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
