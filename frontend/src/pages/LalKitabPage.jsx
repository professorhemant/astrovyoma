import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Bookmark } from 'lucide-react';
import { lalKitab as lalKitabApi, reportHistory as historyApi } from '../api';
import { Link } from 'react-router-dom';
import BirthPlacePicker from '../components/BirthPlacePicker';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PLANET_SYMBOLS = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃',
  Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};


function PlanetCard({ planet }) {
  const [open, setOpen] = useState(false);
  const borderColor = planet.good ? '#22c55e' : '#f97316';
  const bgColor     = planet.good ? '#22c55e0d' : '#f974160d';

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{ borderColor: borderColor + '40', background: bgColor }}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 border"
            style={{ color: planet.color, borderColor: planet.color + '50', background: planet.color + '18' }}>
            {PLANET_SYMBOLS[planet.planet]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-100">{planet.planet}</span>
              <span className="text-gray-500 text-xs">({planet.hindiName})</span>
              {planet.retrograde && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">℞</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400">House {planet.house} · {planet.sign}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                planet.good
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-orange-500/10 border-orange-500/25 text-orange-400'
              }`}>
                {planet.title}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {planet.good
              ? <CheckCircle className="w-5 h-5 text-green-400" />
              : <AlertTriangle className="w-5 h-5 text-orange-400" />
            }
            {open ? <ChevronUp className="w-4 h-4 text-gray-500 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-500 mt-1" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}>
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">{planet.summary}</p>

              {planet.advice && (
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2.5">
                  <p className="text-blue-300 text-xs font-semibold mb-0.5">Guidance</p>
                  <p className="text-gray-300 text-xs leading-relaxed">{planet.advice}</p>
                </div>
              )}

              <div className="bg-gold-500/5 border border-gold-600/20 rounded-lg px-3 py-2.5">
                <p className="text-gold-400 text-xs font-semibold mb-0.5">✦ Lal Kitab Remedy (Upaya)</p>
                <p className="text-gray-300 text-xs leading-relaxed">{planet.remedy}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RinCard({ rin }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-red-400 text-lg">🔺</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-red-300">{rin.name}</span>
            <span className="text-gray-500 text-xs">{rin.hindiName}</span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{rin.planet} in House {rin.planetHouse} ({rin.planetSign})</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}>
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">{rin.desc}</p>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-400 text-xs font-semibold mb-1">Root Cause</p>
                <p className="text-gray-400 text-xs leading-relaxed">{rin.cause}</p>
              </div>
              <div className="bg-gold-500/5 border border-gold-600/20 rounded-lg p-3">
                <p className="text-gold-400 text-xs font-semibold mb-1">✦ Remedy</p>
                <p className="text-gray-300 text-xs leading-relaxed">{rin.remedy}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TABS = ['Planet Analysis', 'Remedies', 'Rin (Debts)'];

export default function LalKitabPage() {
  const { user } = useAuth();
  const [form, setForm]   = useState({ dob:'', tob:'12:00', lat:'', lng:'', place:'' });
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  const submit = async () => {
    setError('');
    if (!form.dob) { setError('Date of birth is required.'); return; }
    if (!form.lat) { setError('Birth city is required.'); return; }
    setLoading(true);
    setData(null);
    try {
      const r = await lalKitabApi.analyse({
        dob: form.dob, tob: form.tob || '12:00',
        lat: form.lat, lng: form.lng,
      });
      setData(r.data);
      setTab(0);
      setSaved(false);
    } catch (e) {
      setError(e.response?.data?.error || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const overallColor = data
    ? data.goodCount >= 6 ? '#22c55e' : data.goodCount >= 4 ? '#f59e0b' : '#f97316'
    : '#C9A84C';

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Ancient Vedic Palmistry Astrology</p>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            लाल किताब
          </h1>
          <p className="text-gray-300 text-xl mb-1">Lal Kitab Analysis</p>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mt-2">
            Lal Kitab is a unique 20th-century astrological system known for its simple, affordable remedies (upayas) and deep karmic insight. It identifies hidden debts (Rin) and planetary influences with remarkable precision.
          </p>
        </motion.div>

        {/* Input form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="card-cosmic rounded-2xl p-6 border border-gold-600/15 mb-8">
          <p className="text-gold-400 text-sm font-semibold mb-4">Enter Birth Details</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-cosmic-800 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Time of Birth</label>
              <input type="time" value={form.tob} onChange={e => setForm(f => ({ ...f, tob: e.target.value }))}
                className="w-full bg-cosmic-800 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 text-sm" />
            </div>
            <div>
              <BirthPlacePicker
                label="Birth City"
                required
                value={form.place || ''}
                onChange={p => setForm(f => ({ ...f, lat: p.lat, lng: p.lng, place: p.place }))}
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
          <div className="mt-5 text-center">
            <button onClick={submit} disabled={loading}
              className="btn-gold px-10 py-3 text-base font-semibold disabled:opacity-50">
              {loading
                ? <span className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Analysing…</span>
                : '✦ Reveal My Lal Kitab Chart'}
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
                <p className="text-gray-400 text-sm">Casting your Lal Kitab chart…</p>
              </div>
            </motion.div>
          )}

          {data && !loading && (
            <motion.div key="result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-6">

              {/* Hero */}
              <div className="card-cosmic rounded-2xl p-6 border-2 text-center relative" style={{ borderColor: overallColor + '40' }}>
                {user && (
                  <button onClick={async () => {
                    if (saved) return;
                    setSaving(true);
                    try {
                      await historyApi.save({
                        type: 'lal_kitab',
                        title: `${data.lagna} Lagna — Lal Kitab Analysis`,
                        meta: { dob: form.dob, birth_place: form.place, lagna: data.lagna, moon_sign: data.moonSign, nakshatra: data.nakshatra, overall_tone: data.overallTone },
                      });
                      setSaved(true);
                      toast.success('Lal Kitab analysis saved to History!');
                    } catch { toast.error('Could not save to history'); }
                    finally { setSaving(false); }
                  }} disabled={saving || saved}
                    className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                    {saved ? 'Saved' : saving ? 'Saving…' : 'Save to History'}
                  </button>
                )}
                <div className="text-5xl mb-2">📖</div>
                <h2 className="font-serif text-2xl text-gold-400 mb-1">{data.lagna} Lagna · {data.moonSign} Moon</h2>
                <p className="text-gray-500 text-xs mb-4">{data.nakshatra} Nakshatra · Lal Kitab Analysis</p>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-semibold"
                  style={{ borderColor: overallColor + '60', background: overallColor + '15', color: overallColor }}>
                  {data.overallTone}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <span className="text-green-400">{data.goodCount} Favourable Planets</span>
                  <span className="text-orange-400">{data.totalPlanets - data.goodCount} Challenging Planets</span>
                  {data.rin.length > 0 && <span className="text-red-400">{data.rin.length} Rin Detected</span>}
                </div>
              </div>

              {/* Planet house table */}
              <div className="card-cosmic rounded-2xl p-5 border border-gold-600/15 overflow-x-auto">
                <p className="text-gold-400 font-serif text-base mb-4">✦ Lal Kitab Kundali — Planet Positions</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-gray-500 text-left pb-2 font-medium">Planet</th>
                      <th className="text-gray-500 text-center pb-2 font-medium">House</th>
                      <th className="text-gray-500 text-left pb-2 font-medium">Sign</th>
                      <th className="text-gray-500 text-center pb-2 font-medium hidden md:table-cell">Degree</th>
                      <th className="text-gray-500 text-center pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.planets.map(p => (
                      <tr key={p.planet} className="border-b border-white/3">
                        <td className="py-2 flex items-center gap-2">
                          <span className="font-bold" style={{ color: p.color }}>{PLANET_SYMBOLS[p.planet]}</span>
                          <span className="text-gray-200">{p.planet}</span>
                          {p.retrograde && <span className="text-violet-400 text-[10px]">℞</span>}
                        </td>
                        <td className="py-2 text-center">
                          <span className="w-7 h-7 rounded-full border inline-flex items-center justify-center font-bold text-gray-100"
                            style={{ borderColor: p.color + '50', background: p.color + '15', fontSize:'11px' }}>
                            {p.house}
                          </span>
                        </td>
                        <td className="py-2 text-gray-400">{p.sign}</td>
                        <td className="py-2 text-center text-gray-500 hidden md:table-cell">{p.degree.toFixed(1)}°</td>
                        <td className="py-2 text-center">
                          {p.good
                            ? <span className="text-green-400 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/25">Good</span>
                            : <span className="text-orange-400 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/25">Upaya Needed</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-cosmic-800/50 rounded-xl p-1">
                {TABS.map((t, i) => (
                  <button key={t} onClick={() => setTab(i)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      tab === i
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}>
                    {t}
                    {i === 2 && data.rin.length > 0 && (
                      <span className="ml-1.5 text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full">
                        {data.rin.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">

                {/* Planet Analysis */}
                {tab === 0 && (
                  <motion.div key="planets" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="space-y-2">
                    <p className="text-gray-500 text-xs text-center mb-3">
                      Click any planet to expand its Lal Kitab effect and upaya
                    </p>
                    {data.planets.map(p => <PlanetCard key={p.planet} planet={p} />)}
                  </motion.div>
                )}

                {/* All Remedies */}
                {tab === 1 && (
                  <motion.div key="remedies" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                    <p className="text-gray-400 text-sm text-center mb-4">
                      Lal Kitab upayas are simple, practical actions. Perform them consistently for best results.
                    </p>
                    <div className="space-y-3">
                      {data.planets.filter(p => !p.good).length > 0 && (
                        <>
                          <p className="text-orange-400 text-xs uppercase tracking-widest font-medium">Priority Remedies — Challenging Planets</p>
                          {data.planets.filter(p => !p.good).map(p => (
                            <div key={p.planet} className="rounded-xl p-4 border border-orange-500/20 bg-orange-500/5">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg" style={{ color: p.color }}>{PLANET_SYMBOLS[p.planet]}</span>
                                <span className="text-gray-200 font-medium text-sm">{p.planet} — House {p.house}</span>
                              </div>
                              <p className="text-gray-300 text-xs leading-relaxed">{p.remedy}</p>
                            </div>
                          ))}
                        </>
                      )}
                      {data.planets.filter(p => p.good).length > 0 && (
                        <>
                          <p className="text-green-400 text-xs uppercase tracking-widest font-medium mt-4">Supportive Planets — Strengthen Further</p>
                          {data.planets.filter(p => p.good).map(p => (
                            <div key={p.planet} className="rounded-xl p-4 border border-green-500/15 bg-green-500/5">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg" style={{ color: p.color }}>{PLANET_SYMBOLS[p.planet]}</span>
                                <span className="text-gray-200 font-medium text-sm">{p.planet} — House {p.house}</span>
                              </div>
                              <p className="text-gray-300 text-xs leading-relaxed">{p.remedy}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Rin Analysis */}
                {tab === 2 && (
                  <motion.div key="rin" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                    {data.rin.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-3">✨</div>
                        <p className="text-green-400 font-semibold text-lg">No Rin Detected</p>
                        <p className="text-gray-500 text-sm mt-2">Your chart shows no significant ancestral or karmic debts in this analysis.</p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 mb-5">
                          <p className="text-red-300 text-sm font-semibold mb-1">⚠ {data.rin.length} Rin (Debt) Detected</p>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            Rin (ऋण) are karmic debts from past lives or ancestral actions that manifest as persistent obstacles in this life. Performing the specified remedies sincerely can significantly reduce their influence.
                          </p>
                        </div>
                        <div className="space-y-3">
                          {data.rin.map(r => <RinCard key={r.id} rin={r} />)}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer CTA */}
              <div className="rounded-2xl bg-gold-500/5 border border-gold-600/20 p-5 text-center">
                <p className="text-gold-400 font-serif text-base mb-2">Get a Deep Lal Kitab Consultation</p>
                <p className="text-gray-400 text-xs mb-4">
                  Our Lal Kitab specialists provide personalised annual charts, Varshphal predictions, and customised upaya plans.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/astrologers" className="btn-gold px-7 py-2.5 text-sm">Consult Expert →</Link>
                  <Link to="/kundali" className="border border-gold-600/30 text-gold-400 px-6 py-2.5 rounded-xl text-sm hover:bg-gold-500/10 transition-all">
                    Full Kundali Report
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
