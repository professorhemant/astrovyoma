import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader, Bookmark } from 'lucide-react';
import { muhurta as muhurtaApi, reportHistory as historyApi, kundali as kundaliApi } from '../api';
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

// Kundali records store moon_sign in English; the dropdown lists Sanskrit names.
const RASHI_EN_TO_SA = {
  Aries:'Mesha', Taurus:'Vrishabha', Gemini:'Mithuna', Cancer:'Karka',
  Leo:'Simha', Virgo:'Kanya', Libra:'Tula', Scorpio:'Vrishchika',
  Sagittarius:'Dhanu', Capricorn:'Makara', Aquarius:'Kumbha', Pisces:'Meena',
};

export default function MuhurtaPage() {
  const { user } = useAuth();
  const [eventTypes, setEventTypes] = useState([]);
  const [nakshatras, setNakshatras] = useState([]);
  const [rashis, setRashis]         = useState([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [mode, setMode]  = useState('find');   // 'find' = list dates, 'check' = one date
  const [listData, setListData] = useState(null);
  const [form, setForm]  = useState({ event_type:'', date:'', janma_nakshatra:'', janma_rashi:'', partner_nakshatra:'', partner_rashi:'', months:'4' });
  const [data, setData]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNight, setShowNight] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  useEffect(() => {
    muhurtaApi.getEventTypes()
      .then(r => {
        setEventTypes(r.data.event_types || []);
        setNakshatras(r.data.nakshatras || []);
        setRashis(r.data.rashis || []);
      })
      .catch(() => {});
    // Default to today
    setForm(f => ({ ...f, date: new Date().toISOString().split('T')[0] }));
  }, []);

  // Pre-fill the seeker's birth star / sign from their saved kundali so logged-in
  // users get a personalised muhurta without filling anything in.
  useEffect(() => {
    if (!user) return;
    kundaliApi.getMyKundali()
      .then(r => {
        const k = r.data?.kundali || r.data;
        if (!k?.nakshatra && !k?.moon_sign) return;
        setForm(f => ({
          ...f,
          janma_nakshatra: f.janma_nakshatra || k.nakshatra || '',
          janma_rashi:     f.janma_rashi     || RASHI_EN_TO_SA[k.moon_sign] || k.moon_sign || '',
        }));
        setAutoFilled(true);
      })
      .catch(() => {});
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event_type) return toast.error('Please select an event type');
    if (mode === 'check' && !form.date) return toast.error('Please select a date');

    const isMarriage = form.event_type === 'marriage';
    const person = {
      ...(form.janma_nakshatra ? { janma_nakshatra: form.janma_nakshatra } : {}),
      ...(form.janma_rashi     ? { janma_rashi:     form.janma_rashi     } : {}),
      ...(isMarriage && form.partner_nakshatra ? { partner_nakshatra: form.partner_nakshatra } : {}),
      ...(isMarriage && form.partner_rashi     ? { partner_rashi:     form.partner_rashi     } : {}),
    };

    setLoading(true);
    setData(null);
    setListData(null);
    try {
      if (mode === 'find') {
        const r = await muhurtaApi.bestDates({
          event_type: form.event_type,
          from_date: form.date || undefined,
          months: parseInt(form.months, 10) || 4,
          count: 6,
          ...person,
        });
        setListData(r.data);
      } else {
        const r = await muhurtaApi.calculate({ event_type: form.event_type, date: form.date, ...person });
        setData(r.data);
      }
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

            {/* Mode toggle — finding dates is the primary job, checking one is secondary */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-cosmic-900/60 border border-gold-600/15">
              {[
                { key:'find',  label:'📅 Find Best Dates', hint:'Show me when' },
                { key:'check', label:'🔍 Check a Date',    hint:'Is this date good?' },
              ].map(m => (
                <button key={m.key} type="button"
                  onClick={() => { setMode(m.key); setData(null); setListData(null); }}
                  className={`rounded-lg px-3 py-2.5 text-center transition-all ${
                    mode === m.key ? 'bg-gold-500/15 border border-gold-500/50' : 'border border-transparent hover:bg-white/5'
                  }`}>
                  <span className={`block text-sm font-semibold ${mode === m.key ? 'text-gold-400' : 'text-gray-400'}`}>{m.label}</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">{m.hint}</span>
                </button>
              ))}
            </div>

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

            {mode === 'check' ? (
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Select Date *</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50"/>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Search from</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50"/>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Look ahead</label>
                  <select value={form.months} onChange={e => set('months', e.target.value)}
                    className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                    <option value="2">Next 2 months</option>
                    <option value="4">Next 4 months</option>
                    <option value="6">Next 6 months</option>
                    <option value="12">Next 12 months</option>
                  </select>
                </div>
              </div>
            )}

            {/* Personalisation — Tara Bala / Chandra Bala */}
            <div className="rounded-xl border border-gold-600/15 bg-cosmic-900/30 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block">
                    Personalise for you <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
                  </label>
                  <p className="text-gray-500 text-[11px] mt-1 leading-relaxed">
                    Adds <span className="text-gold-500">Tara Bala</span> &amp; <span className="text-gold-500">Chandra Bala</span> — the day's strength for
                    <em> your</em> birth star, which pandits weigh most heavily.
                  </p>
                </div>
                {autoFilled && (
                  <span className="shrink-0 text-[10px] px-2 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                    From your Kundali
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-[11px] block mb-1.5">Janma Nakshatra (birth star)</label>
                  <select value={form.janma_nakshatra} onChange={e => set('janma_nakshatra', e.target.value)}
                    className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                    <option value="">— Not specified —</option>
                    {nakshatras.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-[11px] block mb-1.5">Janma Rashi (Moon sign)</label>
                  <select value={form.janma_rashi} onChange={e => set('janma_rashi', e.target.value)}
                    className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                    <option value="">— Not specified —</option>
                    {rashis.map(r => <option key={r} value={r}>{r}</option>)}
                    {form.janma_rashi && !rashis.includes(form.janma_rashi) && (
                      <option value={form.janma_rashi}>{form.janma_rashi}</option>
                    )}
                  </select>
                </div>
              </div>
              {!user && (
                <p className="text-gray-600 text-[11px] mt-3">
                  Don't know yours? <a href="/kundali" className="text-gold-500 hover:text-gold-400 underline">Generate your free Kundali</a> and this fills in automatically.
                </p>
              )}

              {/* Marriage is checked for both parties — classically the bride's
                  bala is primary and the groom's is verified alongside it. */}
              {form.event_type === 'marriage' && (
                <div className="mt-4 pt-4 border-t border-gold-600/10">
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">
                    Partner's details <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
                  </label>
                  <p className="text-gray-500 text-[11px] mb-3 leading-relaxed">
                    For vivah, both parties are checked. The details above are treated as primary; the partner's are weighed alongside.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-500 text-[11px] block mb-1.5">Partner's Janma Nakshatra</label>
                      <select value={form.partner_nakshatra} onChange={e => set('partner_nakshatra', e.target.value)}
                        className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                        <option value="">— Not specified —</option>
                        {nakshatras.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 text-[11px] block mb-1.5">Partner's Janma Rashi</label>
                      <select value={form.partner_rashi} onChange={e => set('partner_rashi', e.target.value)}
                        className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                        <option value="">— Not specified —</option>
                        {rashis.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-gold py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin"/>{mode === 'find' ? 'Searching for auspicious dates…' : 'Calculating Muhurta…'}</>
                : `✦ ${mode === 'find' ? 'Find Auspicious Dates' : 'Check This Date'}${selectedEvent ? ` for ${selectedEvent.icon} ${selectedEvent.label.split(' (')[0]}` : ''}`}
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

          {listData && !loading && (
            <motion.div key="list" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-6">

              <div className="rounded-2xl p-5 border border-gold-600/25 bg-gold-500/5">
                <p className="font-serif text-xl text-gold-400 mb-1">
                  {listData.event_icon} Best dates for {listData.event_label.split(' (')[0]}
                </p>
                <p className="text-gray-400 text-xs">
                  {listData.count} most auspicious {listData.count === 1 ? 'date' : 'dates'} in the next {listData.searched_days} days
                  {listData.personalized
                    ? <span className="text-emerald-400"> · personalised for your birth star</span>
                    : <span className="text-gray-500"> · general panchang (add your birth star above for a personal reading)</span>}
                </p>
              </div>

              {listData.count === 0 && (
                <div className="rounded-2xl p-6 border border-amber-500/40 bg-amber-500/5 text-center">
                  <p className="text-amber-300 text-sm font-semibold mb-1">No auspicious dates found in this window</p>
                  <p className="text-gray-400 text-xs">Try a longer "look ahead" range — some events have long barren stretches in the traditional calendar.</p>
                </div>
              )}

              <div className="space-y-3">
                {listData.dates.map((bd, i) => (
                  <div key={bd.date} className="rounded-2xl p-5 bg-cosmic-900/50 border border-gold-600/15">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                        style={{ background: bd.verdictColor + '20', color: bd.verdictColor }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-base">{bd.display}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {bd.vara} · {bd.nakshatra} · {bd.tithi} · {bd.yoga} yoga
                        </p>
                        {bd.tara && (
                          <p className="text-emerald-400/90 text-xs mt-1.5">✦ {bd.tara} for you</p>
                        )}
                        {bd.slots?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {bd.slots.map((s, si) => (
                              <span key={si}
                                className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                                {s.start} – {s.end} · {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-center shrink-0">
                        <p className="text-[11px] text-gray-500">Score</p>
                        <p className="font-bold text-xl" style={{ color: bd.verdictColor }}>{bd.score}</p>
                        <p className="text-[10px]" style={{ color: bd.verdictColor }}>{bd.verdict}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {listData.notes && (
                <div className="rounded-2xl p-4 border border-gold-600/15 bg-cosmic-900/40">
                  <p className="text-gray-400 text-xs leading-relaxed"><span className="text-gold-500">Note: </span>{listData.notes}</p>
                </div>
              )}
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

              {/* ── Personal warnings (Vipat/Pratyari/Vadha tara, 4/8/12 Chandra Bala) ── */}
              {data.scoring.warnings?.length > 0 && (
                <div className="rounded-2xl p-5 border border-red-500/40 bg-red-500/5">
                  <p className="font-serif text-base text-red-300 mb-2">⚠️ Personal caution for your birth star</p>
                  <ul className="space-y-1.5">
                    {data.scoring.warnings.map((w, i) => (
                      <li key={i} className="text-gray-300 text-sm flex gap-2">
                        <span className="text-red-400 shrink-0">•</span>{w}
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-500 text-xs mt-3">
                    The general panchang may be favourable, but these are traditionally treated as disqualifying for you personally. Prefer a date below.
                  </p>
                </div>
              )}

              {/* ── Tara Bala / Chandra Bala for the day (everyone, no input needed) ── */}
              {data.bala && (
                <div className="rounded-2xl p-5 border border-gold-600/20">
                  <p className="font-serif text-base text-gold-400 mb-1">✦ Tara Bala &amp; Chandra Bala</p>
                  <p className="text-gray-500 text-xs mb-4">
                    Moon in {data.bala.day_nakshatra} ({data.bala.moon_rashi}) — find your own birth star or Moon sign below.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-emerald-400 text-xs font-semibold mb-1.5">Good Tara Bala for these janma nakshatras</p>
                      <p className="text-gray-300 text-xs leading-relaxed">{data.bala.good_tara_nakshatras.join(' · ')}</p>
                    </div>
                    <div>
                      <p className="text-red-400 text-xs font-semibold mb-1.5">Avoid — Vipat / Pratyari / Vadha tara</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{data.bala.bad_tara_nakshatras.join(' · ')}</p>
                    </div>
                    <div className="pt-3 border-t border-gold-600/10">
                      <p className="text-emerald-400 text-xs font-semibold mb-1.5">Good Chandra Bala for these rashis</p>
                      <p className="text-gray-300 text-xs leading-relaxed">{data.bala.good_chandra_rashis.join(' · ')}</p>
                      <p className="text-red-400 text-xs font-semibold mt-2 mb-1.5">Avoid (4th / 8th / 12th from Moon)</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{data.bala.bad_chandra_rashis.join(' · ')}</p>
                    </div>
                  </div>
                </div>
              )}

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
