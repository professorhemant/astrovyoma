import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { dream as dreamApi } from '../api';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const MOOD_OPTIONS = ['Peaceful','Anxious','Confused','Excited','Scared','Melancholic','Joyful','Strange'];

const AUSPICIOUS_COLOR = { Auspicious:'text-emerald-400', Neutral:'text-amber-400', Inauspicious:'text-red-400' };

const DREAM_EXAMPLES = [
  'I was flying high above the clouds, felt free and peaceful, then landed on a mountain',
  'A snake was chasing me through a dark forest, I kept running but couldn\'t escape',
  'I was standing in a flooded house watching water rise around me',
  'I met my deceased grandmother who gave me a gift and smiled',
];

function SymbolCard({ s, index }) {
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:index*0.07}}
      className="bg-cosmic-900 rounded-xl p-4 border border-gold-600/10">
      <div className="text-gold-400 font-medium text-sm mb-2">✦ {s.symbol}</div>
      <p className="text-xs text-cosmic-300 mb-1"><span className="text-cosmic-500">Vedic: </span>{s.vedic_meaning}</p>
      <p className="text-xs text-cosmic-400"><span className="text-cosmic-500">Archetype: </span>{s.psychological}</p>
    </motion.div>
  );
}

function ResultSection({ data }) {
  const it = data.interpretation;
  if (!it) return <p className="text-cosmic-400 text-sm">{data.raw_response}</p>;

  const auspColor = AUSPICIOUS_COLOR[it.auspiciousness?.split(' ')[0]] || 'text-amber-400';

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
      {/* Summary */}
      <div className="card-cosmic p-5 border-l-4 border-gold-500">
        <p className="font-serif text-gold-300 text-lg leading-relaxed italic">"{it.summary}"</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <span className="bg-cosmic-900 rounded-full px-3 py-1 text-cosmic-300">Theme: <span className="text-cosmic-100">{it.overall_theme}</span></span>
          <span className="bg-cosmic-900 rounded-full px-3 py-1 text-cosmic-300">Tone: <span className="text-cosmic-100">{it.emotional_tone}</span></span>
          <span className={`bg-cosmic-900 rounded-full px-3 py-1 ${auspColor}`}>{it.auspiciousness}</span>
          <span className="bg-cosmic-900 rounded-full px-3 py-1 text-cosmic-300">Planet: <span className="text-violet-400">{it.planetary_influence?.split(' ')[0]}</span></span>
        </div>
      </div>

      {/* Symbols */}
      {it.symbols?.length > 0 && (
        <div>
          <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-3">Dream Symbols</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {it.symbols.map((s,i) => <SymbolCard key={i} s={s} index={i} />)}
          </div>
        </div>
      )}

      {/* Spiritual message */}
      <div className="card-cosmic p-5">
        <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">Spiritual Message</h3>
        <p className="text-sm text-cosmic-200 leading-relaxed">{it.spiritual_message}</p>
      </div>

      {/* Planetary influence */}
      <div className="card-cosmic p-4">
        <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">Planetary Influence</h3>
        <p className="text-sm text-cosmic-300">{it.planetary_influence}</p>
      </div>

      {/* Guidance & Remedies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-cosmic p-4">
          <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">Practical Guidance</h3>
          <p className="text-sm text-cosmic-300 leading-relaxed">{it.practical_guidance}</p>
        </div>
        {it.remedies?.length > 0 && (
          <div className="card-cosmic p-4">
            <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">Vedic Remedies</h3>
            <ul className="space-y-1">
              {it.remedies.map((r,i) => (
                <li key={i} className="text-sm text-cosmic-300 flex gap-2"><span className="text-gold-500">•</span>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Affirmation */}
      {it.affirmation && (
        <div className="text-center py-4 border border-gold-600/20 rounded-xl bg-gold-500/5">
          <p className="text-gold-400 font-serif text-base italic">✦ {it.affirmation} ✦</p>
        </div>
      )}
    </motion.div>
  );
}

export default function DreamInterpretationPage() {
  const [form, setForm] = useState({ dream_text:'', name:'', zodiac_sign:'', mood:'' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.dream_text.trim().length < 10) return toast.error('Please describe your dream in more detail.');
    setLoading(true);
    setResult(null);
    try {
      const res = await dreamApi.interpret(form);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Interpretation failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-10">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="font-serif text-3xl text-gold-400 mb-2">Dream Interpretation</h1>
          <p className="text-cosmic-400 text-sm max-w-md mx-auto">
            Decode your dreams through Vedic Svapna Shastra and spiritual symbolism
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card-cosmic p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Dream input */}
            <div>
              <label className="text-xs text-cosmic-400 mb-1 block">Describe Your Dream *</label>
              <textarea
                className="input-cosmic w-full h-32 resize-none"
                placeholder="Describe everything you remember — people, places, objects, feelings, colors…"
                value={form.dream_text}
                onChange={e => setForm(f=>({...f,dream_text:e.target.value}))}
                required
              />
              <p className="text-xs text-cosmic-600 mt-1">More detail = deeper interpretation</p>
            </div>

            {/* Example prompts */}
            <div>
              <p className="text-xs text-cosmic-600 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {DREAM_EXAMPLES.map((ex,i) => (
                  <button key={i} type="button"
                    onClick={() => setForm(f=>({...f,dream_text:ex}))}
                    className="text-xs border border-cosmic-700 text-cosmic-500 hover:border-gold-600/30 hover:text-cosmic-300 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {ex.slice(0,40)}…
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-cosmic-400 mb-1 block">Your Name (optional)</label>
                <input className="input-cosmic w-full" placeholder="Name"
                  value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-cosmic-400 mb-1 block">Zodiac Sign (optional)</label>
                <select className="input-cosmic w-full" value={form.zodiac_sign}
                  onChange={e => setForm(f=>({...f,zodiac_sign:e.target.value}))}>
                  <option value="">Select…</option>
                  {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-cosmic-400 mb-1 block">Mood on Waking (optional)</label>
                <select className="input-cosmic w-full" value={form.mood}
                  onChange={e => setForm(f=>({...f,mood:e.target.value}))}>
                  <option value="">Select…</option>
                  {MOOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? '🌙 Interpreting your dream…' : '🌙 Interpret My Dream'}
            </button>
          </form>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="text-center py-12 space-y-3">
              <div className="text-4xl animate-pulse">🌙</div>
              <p className="text-gold-400 font-serif animate-pulse">Journeying through the dream realms…</p>
              <p className="text-cosmic-600 text-sm">Consulting Svapna Shastra and cosmic symbolism</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && !loading && <ResultSection data={result} />}
      </div>
    </div>
  );
}
