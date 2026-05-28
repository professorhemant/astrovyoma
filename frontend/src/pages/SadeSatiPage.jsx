import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Loader, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { sadeSati as sadeSatiApi } from '../api';
import { Link } from 'react-router-dom';

const RASHI_ICONS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const RASHI = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function IntensityBar({ value }) {
  const color = value >= 8 ? '#EF4444' : value >= 6 ? '#F97316' : value >= 4 ? '#EAB308' : '#22C55E';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-cosmic-900 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value * 10}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-xs font-bold w-10 text-right" style={{ color }}>{value}/10</span>
    </div>
  );
}

function PhaseBadge({ phase, compact }) {
  const meta = {
    1: { label: 'Rising Phase', color: 'orange', bg: 'bg-orange-500/15', border: 'border-orange-400/40', text: 'text-orange-300' },
    2: { label: 'Peak Phase',   color: 'red',    bg: 'bg-red-500/15',    border: 'border-red-400/40',    text: 'text-red-300'    },
    3: { label: 'Setting Phase',color: 'amber',  bg: 'bg-amber-500/15',  border: 'border-amber-400/40',  text: 'text-amber-300'  },
  }[phase] || {};
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${meta.bg} ${meta.border} ${meta.text}`}>
      {compact ? `Phase ${phase}` : meta.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${d}, ${y}`;
}

export default function SadeSatiPage() {
  const [form, setForm] = useState({ dob: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('status');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dob) return toast.error('Please enter your date of birth');
    setLoading(true);
    setResult(null);
    try {
      const res = await sadeSatiApi.calculate({ dob: form.dob, name: form.name || undefined });
      setResult(res.data);
      setActiveTab('status');
      setTimeout(() => document.getElementById('ss-result')?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Saturn Transit Analysis</p>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            साढ़े साती कैलकुलेटर
          </h1>
          <p className="text-gray-300 text-xl mb-2">Sade Sati Calculator</p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Sade Sati is Saturn's 7.5-year transit through the sign before, on, and after your natal Moon sign.
            It is one of the most significant astrological periods — a time of profound testing and equally profound transformation.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {['Current Phase Detection','Past & Future Cycles','Moon-Sign Effects','Dhaiya (Small Panoti)','Saturn Remedies'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400">{f}</span>
            ))}
          </div>
        </motion.div>

        {/* What is Sade Sati — info cards */}
        {!result && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon:'🌑', title:'Phase 1 — Rising', sub:'Saturn in 12th from Moon', desc:'Increased expenses, mental restlessness, potential for travel or relocation. Spiritual inclinations deepen. Lasts ~2.5 years.' },
              { icon:'🪐', title:'Phase 2 — Peak', sub:'Saturn on your Moon sign', desc:'The most intense phase. Major life tests in career, relationships, and health. Greatest transformation potential. Lasts ~2.5 years.' },
              { icon:'🌕', title:'Phase 3 — Setting', sub:'Saturn in 2nd from Moon', desc:'Recovery begins. Financial and health improvement. Past lessons integrate as wisdom. Lasts ~2.5 years.' },
            ].map(c => (
              <div key={c.title} className="card-cosmic p-5 border border-gold-600/15">
                <div className="text-3xl mb-2">{c.icon}</div>
                <p className="text-gold-400 font-serif text-base">{c.title}</p>
                <p className="text-gray-500 text-xs mb-2">{c.sub}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="card-cosmic p-8 mb-8 border border-gold-600/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">Your Name <span className="text-gray-500 text-xs">(optional)</span></label>
                <input type="text" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" /> Date of Birth <span className="text-red-400">*</span>
                </label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 transition-all" required />
              </div>
            </div>
            <p className="text-gray-500 text-xs bg-cosmic-900/50 rounded-xl px-3 py-2 border border-gold-600/10">
              Moon sign is calculated from your birth date (time + place improves accuracy near Moon sign boundaries).
              Saturn's position is computed using Swiss Ephemeris Lahiri Ayanamsha.
            </p>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gold-500 text-cosmic-950 font-bold text-lg rounded-xl hover:bg-gold-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ boxShadow:'0 0 24px rgba(201,168,76,0.3)' }}>
              {loading ? <><Loader className="w-5 h-5 animate-spin" /> Calculating Saturn's Transit...</> : '🪐 Check My Sade Sati — साढ़े साती जाँचें'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div id="ss-result" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>

              {/* Status Banner */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                className={`rounded-2xl border-2 p-6 mb-6 relative overflow-hidden ${
                  result.isActive
                    ? 'border-red-400/50 bg-red-500/8'
                    : result.dhaiya
                      ? 'border-orange-400/40 bg-orange-500/8'
                      : 'border-emerald-400/40 bg-emerald-500/8'
                }`}
                style={{ boxShadow: result.isActive ? '0 0 32px rgba(239,68,68,0.15)' : result.dhaiya ? '0 0 24px rgba(249,115,22,0.12)' : '0 0 24px rgba(34,197,94,0.12)' }}>
                <div className="absolute top-0 right-0 text-8xl opacity-5 select-none pr-4 pt-2">🪐</div>
                <div className="relative flex flex-wrap items-center gap-4">
                  <div className="flex-shrink-0">
                    {result.isActive
                      ? <AlertTriangle className="w-10 h-10 text-red-400" />
                      : result.dhaiya
                        ? <Clock className="w-10 h-10 text-orange-400" />
                        : <CheckCircle className="w-10 h-10 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {result.name && <p className="text-gold-300 font-serif text-lg mb-0.5">{result.name}</p>}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-gray-300 text-sm">Moon Sign:</span>
                      <span className="text-gold-400 font-semibold">{result.moonSignHi} {result.moonSign}</span>
                      <span className="text-gray-500 text-xs">• Lord: {result.moonLord}</span>
                      <span className="text-gray-500 text-xs">• Saturn now in: <span className="text-gold-400">{result.currentSaturnSign}</span></span>
                    </div>
                    {result.isActive ? (
                      <div>
                        <p className="text-red-300 font-semibold text-lg">🪐 Sade Sati is Currently ACTIVE</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <PhaseBadge phase={result.currentPhase?.phase} />
                          <span className="text-gray-300 text-sm">{result.currentPhase?.name}</span>
                          {result.currentPhase?.remaining && (
                            <span className="text-gray-400 text-xs">
                              ({result.currentPhase.remaining.years}y {result.currentPhase.remaining.months}m remaining in this phase until {formatDate(result.currentPhase.periodEnd)})
                            </span>
                          )}
                        </div>
                      </div>
                    ) : result.dhaiya ? (
                      <div>
                        <p className="text-orange-300 font-semibold text-base">⚠️ {result.dhaiya.type} (Small Panoti) Active — Saturn in {result.dhaiya.sign}</p>
                        <p className="text-gray-400 text-sm mt-0.5">Ends: {formatDate(result.dhaiya.end)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-emerald-300 font-semibold text-lg">✓ Sade Sati is NOT Active</p>
                        {result.nextSadeSati && (
                          <p className="text-gray-400 text-sm mt-0.5">
                            Next Sade Sati begins: <span className="text-gold-400 font-medium">{formatDate(result.nextSadeSati.start)}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Intensity for {result.moonSign}</p>
                    <div className="w-32"><IntensityBar value={result.intensity} /></div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-cosmic-900/60 rounded-2xl border border-gold-600/15 mb-6 overflow-x-auto">
                {[
                  { id:'status',   label:'Current Status', icon:'🪐' },
                  { id:'effects',  label:'Moon Sign Effects', icon:'🌙' },
                  { id:'timeline', label:'Timeline', icon:'📅' },
                  { id:'remedies', label:'Remedies', icon:'🛕' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-max flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' : 'text-gray-400 hover:text-gray-200'
                    }`}>
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">

                {/* STATUS TAB */}
                {activeTab === 'status' && (
                  <motion.div key="status" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className="grid md:grid-cols-2 gap-6">

                      {/* Current Phase Detail */}
                      <div className="card-cosmic p-6 border border-gold-600/20">
                        <h3 className="font-serif text-gold-400 text-lg mb-4">
                          {result.isActive ? 'Current Phase' : 'Current Saturn Position'}
                        </h3>
                        {result.isActive && result.currentPhase ? (
                          <div className="space-y-3">
                            <PhaseBadge phase={result.currentPhase.phase} />
                            <p className="text-gold-300 font-serif text-base">{result.currentPhase.name}</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{result.currentPhase.desc}</p>
                            {result.currentPhase.periodEnd && (
                              <div className="bg-cosmic-900/50 rounded-xl p-3 border border-gold-600/10">
                                <p className="text-gray-400 text-xs">This phase ends</p>
                                <p className="text-gold-400 font-semibold">{formatDate(result.currentPhase.periodEnd)}</p>
                                {result.currentPhase.remaining && (
                                  <p className="text-gray-400 text-xs mt-0.5">
                                    {result.currentPhase.remaining.years} years, {result.currentPhase.remaining.months} months remaining
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-emerald-400 font-semibold">✓ Not in Sade Sati</p>
                            <div className="bg-cosmic-900/50 rounded-xl p-3 border border-gold-600/10">
                              <p className="text-gray-400 text-xs">Saturn is currently in</p>
                              <p className="text-gold-400 font-semibold text-lg">{result.currentSaturnSign}</p>
                              <p className="text-gray-400 text-xs">Longitude: {result.currentSaturnLon}°</p>
                            </div>
                            {result.nextSadeSati && (
                              <div className="bg-cosmic-900/50 rounded-xl p-3 border border-amber-400/15">
                                <p className="text-gray-400 text-xs">Next Sade Sati</p>
                                <p className="text-amber-400 font-semibold">{formatDate(result.nextSadeSati.start)}</p>
                                <p className="text-gray-500 text-xs">Ends: {formatDate(result.nextSadeSati.end)}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Active Cycle Phases */}
                      <div className="card-cosmic p-6 border border-gold-600/20">
                        <h3 className="font-serif text-gold-400 text-lg mb-4">
                          {result.activeCycle ? 'Active Sade Sati — Phase Breakdown' : 'Sade Sati Phases (Next Cycle)'}
                        </h3>
                        {result.activeCycle ? (
                          <div className="space-y-3">
                            <div className="text-xs text-gray-400 mb-2">
                              Cycle: {formatDate(result.activeCycle.start)} → {formatDate(result.activeCycle.end)}
                            </div>
                            {result.activeCycle.phases.map((p, i) => (
                              <div key={i} className={`p-3 rounded-xl border ${
                                p.phase === result.currentPhase?.phase
                                  ? 'border-gold-400/40 bg-gold-500/10'
                                  : 'border-gold-600/10 bg-cosmic-900/30'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <PhaseBadge phase={p.phase} compact />
                                  <span className="text-gray-400 text-xs">{formatDate(p.start)} → {formatDate(p.end)}</span>
                                </div>
                                <p className="text-gray-400 text-xs">{p.phaseName}</p>
                                {p.phase === result.currentPhase?.phase && (
                                  <span className="text-[10px] text-gold-400 font-bold">← YOU ARE HERE</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {[1,2,3].map(ph => (
                              <div key={ph} className="p-3 rounded-xl border border-gold-600/10 bg-cosmic-900/30">
                                <PhaseBadge phase={ph} compact />
                                <p className="text-gray-400 text-xs mt-1">{result.phaseInfo[ph]?.name} — ~2.5 years</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dhaiya info */}
                      <div className="card-cosmic p-6 border border-gold-600/20 md:col-span-2">
                        <h3 className="font-serif text-gold-400 text-base mb-3">Dhaiya — Small Panoti (ढैया)</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-3">
                          In addition to Sade Sati, Saturn also creates a 2.5-year period called <span className="text-gold-400">Dhaiya (ढैया)</span> when it
                          transits through the <span className="text-gold-400">4th or 8th house</span> from your natal Moon sign.
                          It's less intense than Sade Sati but still brings notable life lessons.
                        </p>
                        {result.dhaiya ? (
                          <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-3">
                            <p className="text-orange-300 font-semibold text-sm">{result.dhaiya.type} Currently Active — Saturn in {result.dhaiya.sign}</p>
                            <p className="text-gray-400 text-xs mt-0.5">Ends: {formatDate(result.dhaiya.end)}</p>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/8 border border-emerald-400/20 rounded-xl p-3">
                            <p className="text-emerald-400 text-sm">✓ No Dhaiya active at this time</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* EFFECTS TAB */}
                {activeTab === 'effects' && (
                  <motion.div key="effects" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className="card-cosmic p-6 border border-gold-600/20 mb-6">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-14 h-14 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{RASHI_ICONS[result.moonSignIndex]}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Sade Sati Effects for</p>
                          <h2 className="font-serif text-gold-400 text-2xl">{result.moonSignHi} — {result.moonSign} Moon</h2>
                          <p className="text-gray-400 text-xs mt-1">Ruling Planet: {result.moonLord}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs mb-1">Overall Intensity</p>
                          <div className="w-28"><IntensityBar value={result.intensity} /></div>
                        </div>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed mb-5 p-4 bg-cosmic-900/40 rounded-xl border border-gold-600/10">
                        {result.signEffects?.summary}
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { ph: 1, label:'🌑 Rising Phase', text: result.signEffects?.phase1, border:'border-orange-400/25', bg:'bg-orange-500/8' },
                          { ph: 2, label:'🪐 Peak Phase',   text: result.signEffects?.phase2, border:'border-red-400/25',    bg:'bg-red-500/8' },
                          { ph: 3, label:'🌕 Setting Phase',text: result.signEffects?.phase3, border:'border-amber-400/25',  bg:'bg-amber-500/8' },
                        ].map(({ ph, label, text, border, bg }) => (
                          <div key={ph} className={`rounded-xl p-4 border ${border} ${bg} ${result.currentPhase?.phase === ph ? 'ring-1 ring-gold-400/40' : ''}`}>
                            <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                            <p className="text-gray-300 text-xs leading-relaxed">{text}</p>
                            {result.currentPhase?.phase === ph && (
                              <p className="text-gold-400 text-[10px] font-bold mt-2">← ACTIVE NOW</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* General phase descriptions */}
                    {[1,2,3].map(ph => (
                      <div key={ph} className="card-cosmic p-5 border border-gold-600/15 mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <PhaseBadge phase={ph} />
                          <p className="text-gold-400 font-serif text-base">{result.phaseInfo[ph]?.name}</p>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{result.phaseInfo[ph]?.desc}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* TIMELINE TAB */}
                {activeTab === 'timeline' && (
                  <motion.div key="timeline" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className="card-cosmic p-6 border border-gold-600/20 mb-6">
                      <h3 className="font-serif text-gold-400 text-lg mb-4">Complete Sade Sati Timeline</h3>
                      <p className="text-gray-400 text-xs mb-5">Saturn completes one revolution every ~29.5 years. You experience Sade Sati approximately 3 times in a lifetime.</p>

                      <div className="space-y-3">
                        {result.pastCycles.map((c, i) => (
                          <div key={`p${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-cosmic-900/30 border border-gold-600/10">
                            <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-gray-400 text-xs uppercase tracking-wider">Past Cycle</span>
                              <p className="text-gray-300 text-sm font-medium">{formatDate(c.start)} → {formatDate(c.end)}</p>
                            </div>
                            <span className="text-gray-500 text-xs">Completed</span>
                          </div>
                        ))}

                        {result.activeCycle && (
                          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gold-400/50 bg-gold-500/8 relative overflow-hidden"
                            style={{ boxShadow:'0 0 20px rgba(201,168,76,0.15)' }}>
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gold-400/60 rounded-r-xl" />
                            <div className="w-3 h-3 rounded-full bg-gold-400 flex-shrink-0 animate-pulse" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-gold-400 text-xs uppercase tracking-wider font-bold">Active Now</span>
                                <PhaseBadge phase={result.currentPhase?.phase} compact />
                              </div>
                              <p className="text-gold-300 font-semibold">{formatDate(result.activeCycle.start)} → {formatDate(result.activeCycle.end)}</p>
                            </div>
                          </div>
                        )}

                        {!result.activeCycle && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-400/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <p className="text-emerald-300 text-sm">No active Sade Sati currently</p>
                          </div>
                        )}

                        {result.futureCycles.map((c, i) => (
                          <div key={`f${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-cosmic-900/30 border border-gold-600/10 opacity-60">
                            <div className="w-2 h-2 rounded-full border border-gold-400 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-gold-500 text-xs uppercase tracking-wider">Upcoming</span>
                              <p className="text-gray-300 text-sm font-medium">{formatDate(c.start)} → {formatDate(c.end)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Saturn's current position info */}
                    <div className="card-cosmic p-5 border border-gold-600/15">
                      <h3 className="font-serif text-gold-400 text-base mb-3">Saturn's Current Position</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-2xl">♄</div>
                        <div>
                          <p className="text-gold-400 font-semibold text-lg">{result.currentSaturnSign}</p>
                          <p className="text-gray-400 text-xs">Sidereal longitude: {result.currentSaturnLon}° (Lahiri Ayanamsha)</p>
                          <p className="text-gray-500 text-xs">Saturn transits each sign in approximately 2.5 years</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* REMEDIES TAB */}
                {activeTab === 'remedies' && (
                  <motion.div key="remedies" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className="card-cosmic p-6 border border-gold-600/20 mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-gold-400" />
                        <h3 className="font-serif text-gold-400 text-xl">Sade Sati Remedies — उपाय</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        Saturn responds to discipline, service, and devotion. These remedies, when practiced consistently,
                        help mitigate the challenging effects of Sade Sati and channel Saturn's energy toward growth rather than obstacle.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {result.remedies.map((r, i) => (
                          <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 p-4 rounded-xl bg-cosmic-900/40 border border-gold-600/15 hover:border-gold-400/30 transition-colors">
                            <span className="text-2xl flex-shrink-0">{r.icon}</span>
                            <p className="text-gray-300 text-sm leading-relaxed">{r.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Cross-sell: Book Pooja */}
                    <div className="card-cosmic p-6 border border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
                      <div className="absolute right-0 top-0 text-7xl opacity-10 pr-4 pt-2">🪔</div>
                      <div className="relative">
                        <h3 className="font-serif text-amber-300 text-lg mb-2">🛕 Book Shani Shanti Puja</h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          A <span className="text-amber-300 font-medium">Shani Shanti Puja</span> performed by a qualified Vedic priest is one of the most powerful remedies during Sade Sati.
                          Our experienced Pandits perform the complete vidhi with Shani Yantra, Abhishek, and Homa.
                        </p>
                        <Link to="/book-pooja"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 transition-all text-sm font-semibold">
                          🪔 Book Pooja Now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
