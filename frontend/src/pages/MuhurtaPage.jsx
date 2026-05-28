import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader, Bookmark } from 'lucide-react';
import { muhurta as muhurtaApi, reportHistory as historyApi } from '../api';
import { useAuth } from '../context/AuthContext';

const CHOG_COLOR = { 'Very Auspicious':'#6BCB77', Auspicious:'#74B9FF', 'Inauspicious':'#FF6B6B' };
const CHOG_ICON  = { Amrit:'✨', Shubh:'🌟', Labh:'💰', Char:'✈️', Rog:'⚠️', Kaal:'🚫', Udveg:'❌' };

function ScoreRing({ score, verdict, color }) {
  const r = 44, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={110} height={110} className="-rotate-90">
        <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10}/>
        <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div className="text-center -mt-[88px] pb-[62px]">
        <p className="text-3xl font-bold" style={{ color }}>{score}</p>
        <p className="text-gray-500 text-[10px]">/ 100</p>
      </div>
      <p className="text-sm font-semibold" style={{ color }}>{verdict}</p>
    </div>
  );
}

function FactorRow({ factor }) {
  const isGood = factor.quality === 'Auspicious';
  const isBad  = factor.quality === 'Inauspicious';
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gold-600/05 last:border-0">
      <span className="text-lg mt-0.5">{isGood ? '✅' : isBad ? '❌' : '➖'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 text-xs uppercase tracking-wider">{factor.label}:</span>
          <span className="font-semibold text-sm" style={{ color: isGood ? '#6BCB77' : isBad ? '#FF6B6B' : '#FFD93D' }}>
            {factor.value}
          </span>
          {factor.points !== 0 && (
            <span className="text-xs" style={{ color: factor.points > 0 ? '#6BCB77' : '#FF6B6B' }}>
              ({factor.points > 0 ? '+' : ''}{factor.points} pts)
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-0.5">{factor.reason}</p>
      </div>
    </div>
  );
}

function ChoghadiyaSlot({ slot }) {
  const natColor = CHOG_COLOR[slot.nature] || '#C9A84C';
  const isGood = ['Very Auspicious','Auspicious'].includes(slot.nature);
  return (
    <div className={`rounded-xl p-3 border flex flex-col gap-1 relative ${slot.isRahu ? 'opacity-50' : ''}`}
      style={{ borderColor: natColor + '30', background: natColor + '08' }}>
      {(slot.isRahu || slot.isYamganda) && (
        <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400">
          {slot.isRahu ? 'Rahu Kaal' : 'Yamganda'}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <span className="text-base">{CHOG_ICON[slot.name] || '⏰'}</span>
        <span className="font-semibold text-sm" style={{ color: natColor }}>{slot.name}</span>
      </div>
      <p className="text-gray-400 text-xs">{slot.start} – {slot.end}</p>
      <p className="text-gray-500 text-[10px]">{slot.nature}</p>
    </div>
  );
}

export default function MuhurtaPage() {
  const { user } = useAuth();
  const [eventTypes, setEventTypes] = useState([]);
  const [form, setForm]  = useState({ event_type:'', date:'' });
  const [data, setData]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNight, setShowNight] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  useEffect(() => {
    muhurtaApi.getEventTypes()
      .then(r => setEventTypes(r.data.event_types || []))
      .catch(() => {});
    // Default to today
    setForm(f => ({ ...f, date: new Date().toISOString().split('T')[0] }));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event_type) return toast.error('Please select an event type');
    if (!form.date)       return toast.error('Please select a date');
    setLoading(true);
    setData(null);
    try {
      const r = await muhurtaApi.calculate({ event_type: form.event_type, date: form.date });
      setData(r.data);
      setSaved(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Calculation failed. Please try again.');
    } finally { setLoading(false); }
  };

  const selectedEvent = eventTypes.find(e => e.key === form.event_type);
  const daySlots   = data?.choghadiya.filter(s => s.period === 'Day')   || [];
  const nightSlots = data?.choghadiya.filter(s => s.period === 'Night') || [];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Vedic Auspicious Timing</p>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            मुहूर्त कैलकुलेटर
          </h1>
          <p className="text-gray-300 text-xl mb-1">Muhurta Calculator</p>
          <p className="text-gray-400 text-sm">Find the most auspicious date and time for any important life event</p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="card-cosmic rounded-2xl p-6 border border-gold-600/20 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Event type grid */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-3">Select Event Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {eventTypes.map(ev => (
                  <button key={ev.key} type="button" onClick={() => set('event_type', ev.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                      form.event_type === ev.key
                        ? 'border-gold-500/60 bg-gold-500/10 scale-105'
                        : 'border-gold-600/15 bg-cosmic-900/40 hover:border-gold-500/30'
                    }`}>
                    <span className="text-2xl">{ev.icon}</span>
                    <span className="text-xs text-gray-300 leading-tight">{ev.label.split(' (')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Select Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-gold py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin"/>Calculating Muhurta...</>
                : `✦ Calculate Muhurta${selectedEvent ? ` for ${selectedEvent.icon} ${selectedEvent.label.split(' (')[0]}` : ''}`}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader className="w-8 h-8 text-gold-400 animate-spin"/>
              <p className="text-gray-400 text-sm">Consulting the Panchanga...</p>
            </motion.div>
          )}

          {data && !loading && (
            <motion.div key="results" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-6">

              {/* ── VERDICT BANNER ── */}
              <motion.div
                initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.05 }}
                className="rounded-2xl p-6 border-2 text-center relative"
                style={{ borderColor: data.verdict.color + '60', background: data.verdict.color + '12' }}
              >
                {user && (
                  <button onClick={async () => {
                    if (saved) return;
                    setSaving(true);
                    try {
                      const eventLabel = eventTypes.find(e => e.key === form.event_type)?.label?.split(' (')[0] || form.event_type;
                      await historyApi.save({
                        type: 'muhurta',
                        title: `${eventLabel} Muhurta — ${new Date(form.date + 'T12:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}`,
                        meta: { event_type: form.event_type, date: form.date, score: data.scoring.score, verdict: data.verdict.headline },
                      });
                      setSaved(true);
                      toast.success('Muhurta saved to History!');
                    } catch { toast.error('Could not save to history'); }
                    finally { setSaving(false); }
                  }} disabled={saving || saved}
                    className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                    {saved ? 'Saved' : saving ? 'Saving…' : 'Save to History'}
                  </button>
                )}
                <p className="text-2xl md:text-3xl font-bold mb-2" style={{ color: data.verdict.color }}>
                  {data.verdict.headline}
                </p>
                <p className="text-gray-300 text-sm md:text-base">{data.verdict.message}</p>

                {/* Best time today — only if today is good */}
                {data.scoring.score >= 55 && data.best_slots?.length > 0 && data.best_slots[0] && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-white/10">
                    <span className="text-green-400 text-sm font-semibold">⏰ Best Time Today:</span>
                    <span className="text-white text-sm">{data.best_slots[0].start} – {data.best_slots[0].end} ({data.best_slots[0].name})</span>
                  </div>
                )}
              </motion.div>

              {/* ── BEST UPCOMING DATES (shown always but prominently when today is not ideal) ── */}
              {data.best_dates?.length > 0 && (
                <div className={`rounded-2xl p-5 border ${data.scoring.score < 55 ? 'border-amber-500/40 bg-amber-500/5' : 'border-gold-600/20'}`}>
                  <p className="font-serif text-base mb-1" style={{ color: data.scoring.score < 55 ? '#FFD93D' : '#C9A84C' }}>
                    {data.scoring.score < 55 ? '📅 Better Dates Recommended' : '📅 Next Best Date'}
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    {data.scoring.score < 55
                      ? `Top upcoming auspicious dates for ${data.event_label.split(' (')[0]}`
                      : `Next highly auspicious date for ${data.event_label.split(' (')[0]}`}
                  </p>
                  <div className="space-y-3">
                    {data.best_dates.map((bd, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl p-4 bg-cosmic-900/50 border border-gold-600/10">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                            style={{ background: bd.verdictColor + '20', color: bd.verdictColor }}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{bd.display}</p>
                            <p className="text-gray-500 text-xs">{bd.vara} · {bd.nakshatra} · {bd.tithi}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Score</p>
                            <p className="font-bold text-base" style={{ color: bd.verdictColor }}>{bd.score}</p>
                          </div>
                          <div className="text-right md:text-left">
                            <p className="text-xs text-gray-500">Best Time</p>
                            <p className="text-green-400 text-xs font-medium">{bd.bestTime}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Panchang + Score */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Score ring */}
                <div className="card-cosmic rounded-2xl p-6 border border-gold-600/20 flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-4">Muhurta Score</p>
                  <ScoreRing
                    score={data.scoring.score}
                    verdict={data.scoring.verdict}
                    color={data.scoring.verdictColor}
                  />
                </div>

                {/* Panchang details */}
                <div className="md:col-span-2 card-cosmic rounded-2xl p-5 border border-gold-600/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{data.event_icon}</span>
                    <div>
                      <p className="text-gold-400 font-semibold">{data.event_label}</p>
                      <p className="text-gray-500 text-xs">{new Date(data.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      ['🗓️','Day',          data.panchang.vara],
                      ['🪐','Ruled By',     data.panchang.varaLord],
                      ['🌙','Tithi',        data.panchang.tithi],
                      ['⭐','Nakshatra',    data.panchang.nakshatra],
                      ['☀️','Yoga',         data.panchang.yoga],
                      ['⏰','Karana',       data.panchang.karana],
                    ].map(([icon,label,val]) => (
                      <div key={label} className="bg-cosmic-900/40 rounded-lg p-2.5">
                        <p className="text-gray-500 text-xs">{icon} {label}</p>
                        <p className="text-gold-300 font-semibold text-sm">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3 text-xs text-gray-500">
                    <span>🌅 Sunrise: <span className="text-gray-300">{data.panchang.sunrise}</span></span>
                    <span>🌇 Sunset: <span className="text-gray-300">{data.panchang.sunset}</span></span>
                  </div>
                </div>
              </div>

              {/* Factor breakdown */}
              <div className="card-cosmic rounded-2xl p-5 border border-gold-600/20">
                <p className="text-gold-400 font-serif text-base mb-4">✦ Panchanga Assessment</p>
                <div>
                  {data.scoring.factors.map((f, i) => <FactorRow key={i} factor={f}/>)}
                </div>
              </div>

              {/* Best slots */}
              {data.best_slots.length > 0 && (
                <div className="card-cosmic rounded-2xl p-5 border border-green-600/20">
                  <p className="text-green-400 font-serif text-base mb-1">✅ Best Times for {data.event_icon} {data.event_label.split(' (')[0]}</p>
                  <p className="text-gray-500 text-xs mb-4">Auspicious Choghadiya slots (Rahu Kaal excluded)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {data.best_slots.map((s, i) => (
                      <div key={i} className="rounded-xl p-3 border border-green-600/25 bg-green-500/5 text-center">
                        <p className="text-green-400 font-semibold text-sm">{s.name}</p>
                        <p className="text-gray-300 text-xs mt-1">{s.start}</p>
                        <p className="text-gray-500 text-xs">to {s.end}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Choghadiya */}
              <div className="card-cosmic rounded-2xl p-5 border border-gold-600/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gold-400 font-serif text-base">⏰ Choghadiya for the Day</p>
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => setShowNight(false)}
                      className={`px-3 py-1 rounded-full border transition-all ${!showNight ? 'border-gold-500/60 text-gold-400 bg-gold-500/10' : 'border-gold-600/20 text-gray-400'}`}>
                      Day ☀️
                    </button>
                    <button onClick={() => setShowNight(true)}
                      className={`px-3 py-1 rounded-full border transition-all ${showNight ? 'border-gold-500/60 text-gold-400 bg-gold-500/10' : 'border-gold-600/20 text-gray-400'}`}>
                      Night 🌙
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(showNight ? nightSlots : daySlots).map((s, i) => (
                    <ChoghadiyaSlot key={i} slot={s}/>
                  ))}
                </div>
                <p className="text-gray-600 text-xs mt-3 text-center">Rahu Kaal & Yamaganda are inauspicious — avoid starting important activities during these periods.</p>
              </div>

              {/* Special notes */}
              {data.notes && (
                <div className="rounded-xl border border-gold-600/20 bg-gold-500/5 p-5">
                  <p className="text-gold-400 text-sm font-semibold mb-2">📿 Shastra Note</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{data.notes}</p>
                </div>
              )}
            </motion.div>
          )}

          {!data && !loading && (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-center py-16">
              <div className="text-6xl mb-4">🕐</div>
              <p className="text-gray-400 text-lg">Select an event and date to find the most auspicious Muhurta</p>
              <p className="text-gray-500 text-sm mt-2">Tithi, Nakshatra, Vara, Yoga and Choghadiya all analysed together</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
