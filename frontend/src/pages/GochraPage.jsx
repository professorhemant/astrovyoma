import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollDatePicker from '../components/ScrollDatePicker';
import { Loader, ChevronDown, ChevronUp, Info, Bookmark } from 'lucide-react';
import { gochara as gochaApi, reportHistory as historyApi } from '../api';
import { Link } from 'react-router-dom';
import BirthPlacePicker from '../components/BirthPlacePicker';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const SIGN_SYMBOLS = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

const PLANET_COLORS = {
  Sun:'#FFB347', Moon:'#C0C0FF', Mars:'#FF6B6B', Mercury:'#7EC8A4',
  Jupiter:'#FFD700', Venus:'#FFB6C1', Saturn:'#A0A0B0', Rahu:'#8B5CF6', Ketu:'#F97316',
};

const PLANET_ICONS = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃',
  Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

const INTENSITY_DOTS = [1,2,3,4,5];

function ScoreBar({ label, score, color }) {
  const pct = Math.round((score / 10) * 100);
  const barColor = score >= 6.5 ? '#22c55e' : score >= 4.5 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-xs uppercase tracking-wider">{label}</span>
        <span className="font-bold text-sm" style={{ color: barColor }}>{score.toFixed(1)}/10</span>
      </div>
      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: barColor }} />
      </div>
    </div>
  );
}

function TransitCard({ transit }) {
  const [open, setOpen] = useState(false);
  const fx = transit.effect || transit.effects;
  const planetColor = PLANET_COLORS[transit.planet] || '#C9A84C';

  return (
    <div className={`card-cosmic rounded-xl border transition-all ${
      transit.favorable ? 'border-green-500/25' : 'border-red-500/20'
    }`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          {/* Planet symbol */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold border"
            style={{ borderColor: planetColor + '50', background: planetColor + '18', color: planetColor }}>
            {PLANET_ICONS[transit.planet]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-100">{transit.planet}</span>
              <span className="text-xs text-gray-500">in {transit.transitSign || transit.curSign}</span>
              {transit.retrograde && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">℞ Retro</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                transit.favorable
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}>
                {transit.favorable ? '✓ Favorable' : '⚠ Unfavorable'} — House {transit.houseFromMoon}
              </span>
              <span className="text-xs text-gray-600">~{transit.daysUntilNextSign ?? transit.daysUntilNext}d in sign</span>
            </div>
          </div>

          {/* Intensity dots */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex gap-0.5">
              {INTENSITY_DOTS.map(d => (
                <div key={d} className="w-2 h-2 rounded-full" style={{
                  background: d <= transit.intensity
                    ? (transit.favorable ? '#22c55e' : '#ef4444')
                    : '#374151'
                }} />
              ))}
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-gray-500 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-500 mt-1" />}
          </div>
        </div>

        {/* Summary preview */}
        {!open && fx && (
          <p className="text-gray-400 text-xs mt-2 ml-14 line-clamp-2">{fx.summary}</p>
        )}
      </button>

      <AnimatePresence>
        {open && fx && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} transition={{ duration:0.18 }}>
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">{fx.summary}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { icon:'💼', label:'Career', val: fx.career },
                  { icon:'❤️', label:'Love',   val: fx.love },
                  { icon:'💚', label:'Health', val: fx.health },
                  { icon:'💰', label:'Finance',val: fx.finance },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-cosmic-800/50 rounded-lg p-2.5 border border-white/5">
                    <p className="text-gray-500 mb-1">{icon} {label}</p>
                    <p className="text-gray-200 leading-snug">{val}</p>
                  </div>
                ))}
              </div>

              {fx.advice && (
                <div className="flex gap-2 text-xs bg-gold-500/5 border border-gold-600/15 rounded-lg p-3">
                  <Info className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{fx.advice}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function GochraPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState('sign'); // 'sign' | 'birth'
  const [moonSign, setMoonSign] = useState('');
  const [form, setForm] = useState({ dob:'', tob:'12:00', lat:'', lng:'', place:'' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  const resultRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const submit = async () => {
    setError('');
    if (mode === 'sign' && !moonSign) { setError('Please select your Moon sign.'); return; }
    if (mode === 'birth') {
      if (!form.dob) { setError('Date of birth is required.'); return; }
      if (!form.lat) { setError('Birth city is required.'); return; }
    }

    setLoading(true);
    setData(null);
    try {
      const payload = mode === 'sign'
        ? { moonSign }
        : { dob: form.dob, tob: form.tob || '12:00', lat: form.lat, lng: form.lng };
      const r = await gochaApi.calculate(payload);
      setData(r.data);
      setSaved(false);
      setTimeout(() => {
        if (!resultRef.current) return;
        const top = resultRef.current.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 150);
    } catch (e) {
      setError(e.response?.data?.error || 'Calculation failed. Please try again.');
    }
    setLoading(false);
  };

  const overallColor = data
    ? data.overallScore >= 6.5 ? '#22c55e' : data.overallScore >= 4.5 ? '#f59e0b' : '#ef4444'
    : '#C9A84C';

  const overallLabel = data
    ? data.overallScore >= 6.5 ? 'Favorable Period' : data.overallScore >= 4.5 ? 'Mixed Period' : 'Challenging Period'
    : '';

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Vedic Transit Analysis</p>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            गोचर विश्लेषण
          </h1>
          <p className="text-gray-300 text-xl mb-1">Gochara — Planetary Transits</p>
          <p className="text-gray-400 text-sm">{today}</p>
          <p className="text-gray-500 text-xs mt-2 max-w-lg mx-auto">
            Gochara shows how today's planetary positions affect you based on your natal Moon sign
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="card-cosmic rounded-2xl p-6 border border-gold-600/15 mb-8">

          {/* Mode toggle */}
          <div className="flex gap-1 bg-cosmic-800/50 rounded-xl p-1 mb-6 max-w-sm mx-auto">
            <button onClick={() => setMode('sign')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode==='sign' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-400 hover:text-gray-200'}`}>
              I know my Moon sign
            </button>
            <button onClick={() => setMode('birth')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode==='birth' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-400 hover:text-gray-200'}`}>
              Use birth details
            </button>
          </div>

          {mode === 'sign' ? (
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-3">Select Your Moon Sign (Rashi)</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {SIGNS.map(s => (
                  <button key={s} onClick={() => setMoonSign(s)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all ${
                      moonSign === s
                        ? 'border-gold-500/60 bg-gold-500/10 text-gold-300 scale-105'
                        : 'border-gold-600/15 bg-cosmic-900/40 text-gray-400 hover:border-gold-500/30 hover:text-gray-200'
                    }`}>
                    <span className="text-lg">{SIGN_SYMBOLS[s]}</span>
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Date of Birth</label>
                <ScrollDatePicker value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Time of Birth</label>
                <input type="time" value={form.tob} onChange={e => setForm(f => ({ ...f, tob: e.target.value }))}
                  className="w-full bg-cosmic-800 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 text-sm" />
              </div>
              <div>
                <BirthPlacePicker
                  label="Birth City"
                  value={form.place || ''}
                  onChange={p => setForm(f => ({ ...f, lat: p.lat, lng: p.lng, place: p.place }))}
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

          <div className="mt-6 text-center">
            <button onClick={submit} disabled={loading}
              className="btn-gold px-10 py-3 text-base font-semibold disabled:opacity-50">
              {loading ? <span className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Calculating…</span> : '✦ Analyse My Transits'}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-8 h-8 text-gold-400 animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Casting today's planetary chart…</p>
              </div>
            </motion.div>
          )}

          {data && !loading && (
            <motion.div ref={resultRef} key="result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-6">

              {/* Hero */}
              <div className="card-cosmic rounded-2xl p-6 border-2 text-center relative" style={{ borderColor: overallColor + '40' }}>
                {user && (
                  <button onClick={async () => {
                    if (saved) return;
                    setSaving(true);
                    try {
                      await historyApi.save({
                        type: 'gochara',
                        title: `Moon in ${data.natalMoonSign} — Gochara Transits`,
                        meta: { moon_sign: data.natalMoonSign, date: data.dateLabel, overall_score: data.overallScore, dob: form.dob || null, birth_place: form.place || null },
                      });
                      setSaved(true);
                      toast.success('Gochara analysis saved to History!');
                    } catch { toast.error('Could not save to history'); }
                    finally { setSaving(false); }
                  }} disabled={saving || saved}
                    className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                    {saved ? 'Saved' : saving ? 'Saving…' : 'Save to History'}
                  </button>
                )}
                <div className="text-5xl mb-2">{SIGN_SYMBOLS[data.natalMoonSign]}</div>
                <h2 className="font-serif text-2xl text-gold-400">Moon in {data.natalMoonSign}</h2>
                <p className="text-gray-500 text-xs mt-1 mb-4">Your Natal Rashi · Analysis for {data.dateLabel}</p>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-semibold" style={{ borderColor: overallColor + '60', background: overallColor + '15', color: overallColor }}>
                  <span style={{ fontSize:'1.1em' }}>
                    {data.overallScore >= 6.5 ? '✓' : data.overallScore >= 4.5 ? '~' : '⚠'}
                  </span>
                  {overallLabel} · {data.overallScore.toFixed(1)}/10
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <span className="text-green-400">{data.favorable_count} Favorable</span>
                  <span className="text-red-400">{data.unfavorable_count} Unfavorable</span>
                </div>
                <p className="text-gray-300 text-sm mt-4 max-w-lg mx-auto leading-relaxed">{data.summary}</p>
              </div>

              {/* Life Area Scores */}
              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/15">
                <p className="text-gold-400 font-serif text-lg mb-5">✦ Life Area Forecast</p>
                <div className="space-y-4">
                  <ScoreBar label="Career & Work"    score={data.lifeAreas.career?.score ?? data.lifeAreas.career} />
                  <ScoreBar label="Love & Relationships" score={data.lifeAreas.love?.score ?? data.lifeAreas.love} />
                  <ScoreBar label="Health & Vitality"   score={data.lifeAreas.health?.score ?? data.lifeAreas.health} />
                  <ScoreBar label="Finance & Wealth"    score={data.lifeAreas.finance?.score ?? data.lifeAreas.finance} />
                </div>
              </div>

              {/* Key Planets (Jupiter + Saturn) */}
              {data.keyPlanets && data.keyPlanets.length > 0 && (
                <div className="card-cosmic rounded-2xl p-6 border border-gold-600/15">
                  <p className="text-gold-400 font-serif text-lg mb-4">✦ Key Planetary Influences</p>
                  <p className="text-gray-500 text-xs mb-4">Jupiter and Saturn shape major life themes over months to years</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.keyPlanets.map(kp => {
                      const planetColor = PLANET_COLORS[kp.planet] || '#C9A84C';
                      return (
                        <div key={kp.planet} className={`rounded-xl p-4 border ${kp.favorable ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold" style={{ color: planetColor }}>{PLANET_ICONS[kp.planet]}</span>
                            <div>
                              <p className="font-semibold text-gray-100">{kp.planet}</p>
                              <p className="text-xs text-gray-500">in {kp.transitSign} · House {kp.houseFromMoon}</p>
                            </div>
                          </div>
                          {(kp.effect || kp.effects) && <p className="text-gray-300 text-sm leading-relaxed">{(kp.effect || kp.effects).summary}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Transit Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gold-400 font-serif text-lg">✦ All 9 Planetary Transits</p>
                  <button onClick={() => setExpandAll(e => !e)} className="text-xs text-gray-500 hover:text-gold-400 transition-colors">
                    {expandAll ? 'Collapse all' : 'Expand all'}
                  </button>
                </div>

                {/* Favorable group */}
                {data.transits.filter(t => t.favorable).length > 0 && (
                  <div className="mb-4">
                    <p className="text-green-400 text-xs uppercase tracking-widest mb-2">Favorable Transits</p>
                    <div className="space-y-2">
                      {data.transits.filter(t => t.favorable).map(t => (
                        <TransitCard key={t.planet} transit={{ ...t, _forceOpen: expandAll }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unfavorable group */}
                {data.transits.filter(t => !t.favorable).length > 0 && (
                  <div>
                    <p className="text-red-400 text-xs uppercase tracking-widest mb-2">Challenging Transits</p>
                    <div className="space-y-2">
                      {data.transits.filter(t => !t.favorable).map(t => (
                        <TransitCard key={t.planet} transit={{ ...t, _forceOpen: expandAll }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Educational note */}
              <div className="rounded-2xl border border-gold-600/15 bg-gold-500/5 p-5">
                <p className="text-gold-400 text-sm font-semibold mb-2">About Gochara</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Gochara (गोचर) is the Vedic system of transit predictions. The current position of each planet is analysed
                  relative to your natal Moon sign (Janma Rashi). Planets transiting favorable houses from the Moon bring
                  their best results; unfavorable houses create resistance. Jupiter and Saturn, being slow-moving, have the
                  greatest long-term impact.
                </p>
              </div>

              {/* CTA links */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/kundali"
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  📜 Generate Full Kundali
                </Link>
                <Link to="/dasha"
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  ⏳ View Dasha Periods
                </Link>
                <Link to="/astrologers"
                  className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
                  🔭 Consult an Astrologer
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
