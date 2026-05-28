import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { remedies as remediesApi } from '../api';
import SwastikBorder from '../components/SwastikBorder';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'career', label: 'Career & Finance', icon: '💼' },
  { value: 'love', label: 'Love & Marriage', icon: '💑' },
  { value: 'health', label: 'Health & Vitality', icon: '🌿' },
  { value: 'education', label: 'Education & Learning', icon: '📚' },
  { value: 'legal', label: 'Legal Disputes', icon: '⚖️' },
  { value: 'family', label: 'Family Harmony', icon: '🏠' },
  { value: 'mental', label: 'Mental Peace', icon: '🧘' },
  { value: 'debt', label: 'Debt & Losses', icon: '💸' },
  { value: 'enemies', label: 'Enemies & Obstacles', icon: '🛡️' },
  { value: 'children', label: 'Children & Fertility', icon: '🌸' },
];

const PLANET_COLOR = {
  Sun: '#FF9F43', Moon: '#74B9FF', Mars: '#FF6B6B', Mercury: '#6BCB77',
  Jupiter: '#FFD93D', Venus: '#FD79A8', Saturn: '#A29BFE', Rahu: '#636e72', Ketu: '#b2bec3'
};

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-cosmic-800/50 border border-gold-600/15 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cosmic-700/30 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-serif text-gold-400 text-base font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ background: (color || '#C9A84C') + '20', color: color || '#C9A84C', border: `1px solid ${(color || '#C9A84C')}40` }}>
      {children}
    </span>
  );
}

export default function RemediesPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category) { toast.error('Please select a problem category'); return; }
    if (description.trim().length < 15) { toast.error('Please describe your problem in at least 15 characters'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await remediesApi.get({ problem_category: category, problem_description: description });
      setResult(res.data);
      setTimeout(() => {
        if (!resultRef.current) return;
        const top = resultRef.current.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate remedies');
    } finally {
      setLoading(false);
    }
  }

  const r = result?.remedies;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✶ Jyotish Upaya</p>
          <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 30px rgba(201,168,76,0.4)' }}>Problems & Remedies</h1>
          <p className="text-gray-200 text-sm max-w-xl mx-auto">Share your problem and receive personalized Vedic remedies based on your birth chart — mantras, gemstones, fasting, rituals and more</p>
        </motion.div>

        {!user && (
          <div className="bg-gold-600/10 border border-gold-600/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <p className="text-gold-300 text-sm">
              <Link to="/login" className="underline hover:text-gold-200">Login</Link> and generate your Kundali for personalized remedies based on your exact birth chart.
            </p>
          </div>
        )}

        {/* Input form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-cosmic p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-200 text-sm mb-3">Select Your Problem Area</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all text-xs font-medium
                      ${category === c.value
                        ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                        : 'border-gold-600/15 bg-cosmic-800/40 text-gray-200 hover:border-gold-600/40 hover:text-gray-300'}`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-200 text-sm mb-2">Describe Your Problem</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="E.g. I have been struggling with finding a stable job for 2 years despite good qualifications. I feel blocked and my finances are deteriorating..."
                className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 resize-none transition-colors"
              />
              <p className="text-gray-300 text-xs mt-1">{description.length} characters — be specific for better remedies</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">✶</span>
                  Consulting the stars...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Vedic Remedies
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {r && (
            <motion.div ref={resultRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Header */}
              <div className="bg-gradient-to-r from-cosmic-800/80 to-cosmic-900/80 border border-gold-600/25 rounded-2xl p-6 text-center" style={{ boxShadow: '0 0 50px rgba(201,168,76,0.08)' }}>
                <p className="text-gold-500/60 text-xs uppercase tracking-widest mb-2">Personalized Vedic Upaya</p>
                <h2 className="font-serif text-2xl text-gold-400 mb-3">{result?.category}</h2>
                {!result?.hasKundali && (
                  <p className="text-amber-400/70 text-xs mb-2">⚠️ General remedies — <Link to="/kundali" className="underline hover:text-amber-300">generate your Kundali</Link> for chart-specific guidance</p>
                )}
                {r.afflicted_planets?.length > 0 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                    <span className="text-gray-300 text-xs">Afflicted planets:</span>
                    {r.afflicted_planets.map(p => (
                      <Tag key={p} color={PLANET_COLOR[p]}>{p}</Tag>
                    ))}
                  </div>
                )}
              </div>

              {/* Root cause */}
              <Section title="Astrological Root Cause" icon="🔭" defaultOpen={true}>
                <p className="text-gray-300 text-sm leading-relaxed">{r.root_cause}</p>
              </Section>

              {/* Mantras */}
              {r.mantras?.length > 0 && (
                <Section title="Mantras & Prayers" icon="🕉️" defaultOpen={true}>
                  <div className="space-y-4">
                    {r.mantras.map((m, i) => (
                      <div key={i} className="bg-cosmic-900/50 rounded-xl p-4 border border-gold-600/10">
                        <p className="font-serif text-gold-300 text-base mb-1">{m.mantra}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300 mt-2">
                          {m.deity && <span>🙏 {m.deity}</span>}
                          {m.count && <span>📿 {m.count}</span>}
                          {m.benefit && <span>✨ {m.benefit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Gemstone */}
              {r.gemstone && (
                <Section title="Gemstone Therapy" icon="💎">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ['Primary Gemstone', r.gemstone.primary],
                      ['Affordable Substitute', r.gemstone.substitute],
                      ['Metal', r.gemstone.metal],
                      ['Wear on Finger', r.gemstone.finger],
                      ['Day & Time', r.gemstone.day_time],
                      ['Minimum Weight', r.gemstone.weight],
                    ].map(([label, val]) => val && (
                      <div key={label} className="bg-cosmic-900/40 rounded-lg px-4 py-3">
                        <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-gray-200 text-sm font-medium">{val}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Rudraksha */}
              {r.rudraksha && (
                <Section title="Rudraksha" icon="📿">
                  <p className="text-gray-300 text-sm leading-relaxed">{r.rudraksha}</p>
                </Section>
              )}

              {/* Fasting & Charity */}
              <Section title="Fasting & Charity" icon="🌙">
                <div className="space-y-3">
                  {r.fasting && (
                    <div>
                      <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Fasting</p>
                      <p className="text-gray-300 text-sm">{r.fasting}</p>
                    </div>
                  )}
                  {r.charity && (
                    <div>
                      <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Charity (Dana)</p>
                      <p className="text-gray-300 text-sm">{r.charity}</p>
                    </div>
                  )}
                </div>
              </Section>

              {/* Puja */}
              {r.puja && (
                <Section title="Puja & Rituals" icon="🪔">
                  <p className="text-gray-300 text-sm leading-relaxed">{r.puja}</p>
                </Section>
              )}

              {/* Yantra & Colors */}
              <Section title="Yantra & Color Therapy" icon="🔺">
                <div className="space-y-3">
                  {r.yantra && (
                    <div>
                      <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Yantra</p>
                      <p className="text-gray-300 text-sm">{r.yantra}</p>
                    </div>
                  )}
                  {r.color_therapy && (
                    <div>
                      <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Color Therapy</p>
                      <p className="text-gray-300 text-sm">{r.color_therapy}</p>
                    </div>
                  )}
                </div>
              </Section>

              {/* Do's and Don'ts */}
              {(r.dos?.length > 0 || r.donts?.length > 0) && (
                <Section title="Do's & Don'ts" icon="✅">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {r.dos?.length > 0 && (
                      <div>
                        <p className="text-green-400 text-xs uppercase tracking-wider font-semibold mb-2">Follow These</p>
                        <ul className="space-y-1.5">
                          {r.dos.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.donts?.length > 0 && (
                      <div>
                        <p className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-2">Avoid These</p>
                        <ul className="space-y-1.5">
                          {r.donts.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Affirmation */}
              {r.affirmation && (
                <div className="bg-gradient-to-r from-gold-600/10 to-cosmic-800/60 border border-gold-600/20 rounded-2xl p-6 text-center">
                  <p className="text-gold-500/60 text-xs uppercase tracking-widest mb-3">✶ Cosmic Affirmation</p>
                  <p className="font-serif text-gold-300 text-lg leading-relaxed italic">{r.affirmation}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-xs leading-relaxed">
                  These remedies are spiritual guidance based on Vedic tradition. They are not a substitute for professional medical, legal, or financial advice. Results vary by individual faith and sincerity of practice.
                </p>
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <p className="text-gray-300 text-sm mb-4">For deeper guidance, consult directly with our Vedic astrologers</p>
                <Link to="/astrologers" className="btn-gold px-8 py-3">Book a Personal Consultation</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
