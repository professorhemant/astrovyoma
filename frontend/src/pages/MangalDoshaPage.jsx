import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Loader, Shield, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangalDosha as mangalDoshaApi } from '../api';
import { Link } from 'react-router-dom';
import BirthPlacePicker from '../components/BirthPlacePicker';

const TABS = [
  { id: 'overview',      label: 'Overview',       icon: '♂' },
  { id: 'perspectives',  label: 'Analysis',        icon: '🔍' },
  { id: 'cancellations', label: 'Cancellations',   icon: '🛡' },
  { id: 'remedies',      label: 'Remedies',        icon: '🪔' },
];

function SeverityBar({ percent, color }) {
  return (
    <div className="relative h-4 bg-cosmic-900 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
      <div className="absolute inset-0 flex items-center justify-end pr-3">
        <span className="text-xs font-bold" style={{ color }}>{percent}%</span>
      </div>
    </div>
  );
}

function PerspectiveCard({ data, label, icon }) {
  const active = data?.active;
  return (
    <div className={`rounded-2xl border p-5 ${active ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xl mb-1">{icon}</div>
          <p className="text-gray-200 font-semibold text-sm">{label}</p>
          <p className="text-gray-500 text-xs">From {data?.sign}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${active ? 'bg-red-500/15 border-red-400/40 text-red-300' : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'}`}>
          {active ? `Dosha Active` : 'No Dosha'}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400 text-xs">Mars in House:</span>
        <span className={`text-2xl font-serif font-bold ${active ? 'text-red-400' : 'text-emerald-400'}`}>{data?.house_of_mars}</span>
      </div>
      {active && data.details && (
        <div className="space-y-2">
          <p className="text-gold-400 text-xs font-semibold">{data.details.title}</p>
          <p className="text-gray-400 text-xs leading-relaxed">{data.details.effect}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500 text-xs">Intensity:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < data.details.intensity ? 'bg-red-400' : 'bg-cosmic-800'}`} />
              ))}
            </div>
            <span className="text-red-400 text-xs font-bold">{data.details.intensity}/10</span>
          </div>
          <p className="text-amber-300/80 text-xs mt-2 bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/15">
            💑 {data.details.marriage_impact}
          </p>
        </div>
      )}
    </div>
  );
}

const PRIORITY_COLOR = { High: 'text-red-400 border-red-400/30 bg-red-500/10', Medium: 'text-amber-400 border-amber-400/30 bg-amber-500/10', Low: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10' };

export default function MangalDoshaPage() {
  const [form, setForm]       = useState({ name: '', dob: '', tob: '12:00', city: '', lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const resultRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dob)            return toast.error('Date of birth is required');
    if (!form.lat || !form.lng) return toast.error('Please select a birth city from the suggestions');
    setLoading(true);
    setResult(null);
    try {
      const res = await mangalDoshaApi.calculate({
        dob: form.dob,
        tob: form.tob || '12:00',
        lat: form.lat,
        lng: form.lng,
        city: form.city,
        name: form.name || undefined,
      });
      setResult(res.data);
      setActiveTab('overview');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const r = result;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-red-400 text-xs uppercase tracking-[0.3em] mb-3">Mars Affliction Analysis</p>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 40px rgba(201,168,76,0.4)' }}>
            मंगल दोष कैलकुलेटर
          </h1>
          <p className="text-gray-300 text-xl mb-2">Mangal Dosha Calculator</p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Mangal Dosha (Kuja Dosha / Manglik) occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house
            from the Lagna, Moon, or Venus. It is analyzed from all three reference points for a complete picture.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {['All 3 Charts (Lagna/Moon/Venus)', 'Cancellation Rules', 'Severity Scoring', 'Partner Compatibility', 'Vedic Remedies'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300">{f}</span>
            ))}
          </div>
        </motion.div>

        {/* Info cards */}
        {!result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '♂', title: 'What is Mangal Dosha?', desc: 'When Mars occupies the 1st, 2nd, 4th, 7th, 8th, or 12th house from Lagna, Moon, or Venus in the birth chart. Classically associated with challenges in married life.' },
              { icon: '⚖️', title: 'Is it always harmful?', desc: 'No. Many Mangliks have wonderful marriages. The dosha\'s impact depends on its severity, the specific house, and whether cancellation conditions apply. Modern astrology views it as manageable.' },
              { icon: '🛡️', title: 'Can it be cancelled?', desc: 'Yes — Mars in own sign/exaltation, Jupiter\'s protection, Venus in Lagna, or two Manglik partners marrying each other are among the 12+ cancellation rules in Parashari tradition.' },
            ].map(c => (
              <div key={c.title} className="card-cosmic p-5 border border-red-600/15">
                <div className="text-3xl mb-2">{c.icon}</div>
                <p className="text-gold-400 font-serif text-base mb-2">{c.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-cosmic p-8 mb-8 border border-gold-600/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">Your Name <span className="text-gray-500 text-xs">(optional)</span></label>
                <input type="text" placeholder="e.g. Priya Sharma"
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
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-500" /> Time of Birth <span className="text-red-400">*</span>
                </label>
                <input type="time" value={form.tob} onChange={e => setForm(f => ({ ...f, tob: e.target.value }))}
                  className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 transition-all" required />
              </div>
              <div>
                <BirthPlacePicker
                  label="Birth City"
                  required
                  value={form.city || ''}
                  onChange={p => setForm(f => ({ ...f, city: p.place, lat: parseFloat(p.lat) || null, lng: parseFloat(p.lng) || null }))}
                />
              </div>
            </div>
            <p className="text-gray-500 text-xs bg-cosmic-900/50 rounded-xl px-3 py-2 border border-gold-600/10">
              Birth time and location are required to calculate the Ascendant (Lagna) — the primary reference for Mangal Dosha analysis.
              All calculations use Lahiri Ayanamsha (Vedic sidereal system).
            </p>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg rounded-xl hover:from-red-500 hover:to-orange-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 24px rgba(239,68,68,0.3)' }}>
              {loading
                ? <><Loader className="w-5 h-5 animate-spin" /> Analysing Mars Position...</>
                : '♂ Check Mangal Dosha — मंगल दोष जाँचें'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }} className="space-y-6">

              {/* Status Hero */}
              <div className={`rounded-2xl border-2 p-6 text-center ${
                r.isManglik && !r.isCancelled ? 'border-red-500/50 bg-red-500/8' :
                r.isManglik && r.isCancelled  ? 'border-amber-500/50 bg-amber-500/8' :
                'border-emerald-500/50 bg-emerald-500/8'
              }`}>
                <div className="text-5xl mb-3">
                  {r.isManglik && !r.isCancelled ? '♂' : r.isManglik && r.isCancelled ? '🛡️' : '✅'}
                </div>
                <p className={`text-2xl font-serif font-bold mb-2 ${
                  r.isManglik && !r.isCancelled ? 'text-red-400' :
                  r.isManglik && r.isCancelled  ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {r.isManglik && !r.isCancelled
                    ? `You are Manglik — ${r.severity.label}`
                    : r.isManglik && r.isCancelled
                    ? 'Mangal Dosha — Partially/Fully Cancelled'
                    : 'Not Manglik — No Dosha Found'}
                </p>
                {form.name && <p className="text-gray-400 text-sm mb-3">for {form.name}</p>}
                <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">{r.summary}</p>

                {/* Birth data chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    { label: 'Lagna', val: r.birthData.lagna },
                    { label: 'Moon', val: r.birthData.moon_sign },
                    { label: 'Mars', val: `${r.birthData.mars_sign}${r.birthData.mars_retrograde ? ' ℞' : ''}` },
                    { label: 'Venus', val: r.birthData.venus_sign },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cosmic-900/60 border border-gold-600/20">
                      <span className="text-gray-500 text-xs">{item.label}:</span>
                      <span className="text-gold-300 text-xs font-semibold">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity Meter */}
              {r.isManglik && (
                <div className="card-cosmic p-5 border border-gold-600/15">
                  <p className="text-gray-300 text-sm font-semibold mb-3">Dosha Severity</p>
                  <SeverityBar percent={r.severity.percent} color={r.severity.color} />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Mild</span><span>Moderate</span><span>High</span>
                  </div>
                  {r.cancellations.length > 0 && (
                    <p className="text-emerald-400 text-xs mt-3 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      {r.cancellations.length} cancellation rule{r.cancellations.length > 1 ? 's' : ''} applied — effective severity reduced
                    </p>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 bg-cosmic-900/40 p-1 rounded-2xl border border-gold-600/15">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === t.id ? 'bg-gold-500 text-cosmic-950' : 'text-gray-400 hover:text-gray-200'
                    }`}>
                    <span className="mr-1">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                  {/* Compatibility Advice */}
                  <div className="card-cosmic p-6 border border-gold-600/15">
                    <p className="text-gold-400 font-serif text-lg mb-1">{r.compatibilityAdvice.title}</p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{r.compatibilityAdvice.detail}</p>
                    {r.compatibilityAdvice.alternatives?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs font-semibold mb-2">Recommended Actions:</p>
                        <ul className="space-y-1.5">
                          {r.compatibilityAdvice.alternatives.map((alt, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-400 text-xs">
                              <span className="text-gold-500 mt-0.5">•</span>{alt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Navamsha note */}
                  {r.navamshaNote && (
                    <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-400/20 rounded-xl p-4">
                      <Star className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-300 text-sm leading-relaxed">{r.navamshaNote}</p>
                    </div>
                  )}

                  {/* Famous Mangliks */}
                  <div className="card-cosmic p-5 border border-gold-600/15">
                    <p className="text-gold-400 font-serif text-base mb-3">Famous Manglik Personalities</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {r.famousMangliks.map((p, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-cosmic-900/40 rounded-xl p-3">
                          <span className="text-red-400 text-lg">♂</span>
                          <div>
                            <p className="text-gray-200 text-xs font-semibold">{p.name}</p>
                            <p className="text-gray-500 text-xs leading-snug">{p.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cross-sell */}
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-red-300 font-semibold">Book Mangal Shanti Puja</p>
                      <p className="text-gray-400 text-sm">Connect with a Vedic priest for a personalised Mangal Graha Shanti ceremony.</p>
                    </div>
                    <Link to="/book-pooja"
                      className="flex-shrink-0 px-4 py-2 bg-red-500/20 border border-red-400/40 text-red-300 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-all">
                      Book Now →
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Tab: Perspectives */}
              {activeTab === 'perspectives' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <p className="text-gray-400 text-sm text-center">
                    Mangal Dosha is examined from three reference points. Even one active perspective makes a person Manglik.
                  </p>
                  <div className="space-y-4">
                    <PerspectiveCard data={r.analysis.fromLagna}  label="From Lagna (Ascendant)" icon="⬆️" />
                    <PerspectiveCard data={r.analysis.fromMoon}   label="From Moon (Chandra Lagna)" icon="🌙" />
                    <PerspectiveCard data={r.analysis.fromVenus}  label="From Venus (Shukra Lagna)" icon="♀️" />
                  </div>
                  <div className="bg-cosmic-900/50 rounded-xl p-4 border border-gold-600/10 text-xs text-gray-500 leading-relaxed">
                    <strong className="text-gray-400">Weight of perspectives:</strong> Lagna chart carries the highest weight (100%),
                    Moon chart 60%, Venus chart 50%. The severity score reflects all three proportionally.
                    Mars retrograde does not cancel the dosha but may delay its manifestation.
                  </div>
                </motion.div>
              )}

              {/* Tab: Cancellations */}
              {activeTab === 'cancellations' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {r.cancellations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">♂</div>
                      <p className="text-gray-400">No cancellation conditions apply to your chart.</p>
                      {r.isManglik && <p className="text-gray-500 text-sm mt-2">The dosha is present in full — remedies are recommended.</p>}
                    </div>
                  ) : (
                    <>
                      <p className="text-emerald-400 text-sm text-center font-semibold">
                        ✓ {r.cancellations.length} Cancellation Rule{r.cancellations.length > 1 ? 's' : ''} Active in Your Chart
                      </p>
                      {r.cancellations.map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                          className="card-cosmic p-4 border border-emerald-500/20 bg-emerald-500/5">
                          <div className="flex items-start gap-3">
                            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-emerald-300 text-sm font-semibold">{c.rule}</p>
                              <p className="text-gray-400 text-xs leading-relaxed mt-1">{c.detail}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div className="bg-cosmic-900/50 rounded-xl p-4 border border-gold-600/10 text-xs text-gray-500 leading-relaxed">
                        Cancellations reduce the effective severity but may not completely eliminate the dosha. The number and quality
                        of cancellations, combined with the specific house placement, determine the final impact.
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Tab: Remedies */}
              {activeTab === 'remedies' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {!r.isManglik ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">✅</div>
                      <p className="text-emerald-400 font-semibold">No remedies needed</p>
                      <p className="text-gray-500 text-sm mt-2">You do not have Mangal Dosha. No Mars-specific remedies are required.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-400 text-sm text-center">
                        These remedies are based on classical Vedic texts and traditional practice.
                        Perform with faith and consistency for best results.
                      </p>
                      {r.remedies.map((rem, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="card-cosmic p-4 border border-gold-600/15">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-gold-400 font-semibold text-sm">{rem.title}</p>
                            <div className="flex gap-2 flex-shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${PRIORITY_COLOR[rem.priority]}`}>{rem.priority}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-cosmic-900/60 border border-gold-600/15 text-gray-400">{rem.timing}</span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">{rem.desc}</p>
                        </motion.div>
                      ))}
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                        <p className="text-red-300 font-semibold mb-1">Book Mangal Shanti Puja</p>
                        <p className="text-gray-400 text-sm mb-3">A Vedic priest will perform a personalised puja with the correct mantras and rituals based on your chart.</p>
                        <Link to="/book-pooja" className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-500/20 border border-red-400/40 text-red-300 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-all">
                          🪔 Book Mangal Shanti Puja
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
