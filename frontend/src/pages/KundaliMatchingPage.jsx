import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollDatePicker from '../components/ScrollDatePicker';
import { Loader, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { gunaMilan as gunaMilanApi, reportHistory as historyApi } from '../api';
import { Link } from 'react-router-dom';
import SwastikBorder from '../components/SwastikBorder';
import BirthPlacePicker from '../components/BirthPlacePicker';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAKSHATRA_LIST = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const SIGN_LIST = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

// Nakshatra → default Moon sign index (for manual entry)
const NAK_SIGN = [0,0,1,1,2,2,2,3,3,4,4,5,5,5,6,6,7,7,8,8,8,9,9,10,10,11,11];

function PersonForm({ title, emoji, mode, value, onChange }) {
  const nidx = NAKSHATRA_LIST.indexOf(value.nakshatra);
  const defaultSign = nidx >= 0 ? SIGN_LIST[NAK_SIGN[nidx]] : '';

  return (
    <div className="bg-cosmic-800/60 border border-gold-600/20 rounded-2xl p-5">
      <h3 className="font-serif text-gold-400 text-lg mb-4">{emoji} {title}</h3>

      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Name (optional)</label>
          <input value={value.name || ''} onChange={e => onChange({ ...value, name: e.target.value })}
            placeholder="Enter name"
            className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50" />
        </div>

        {mode === 'birth' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Date of Birth</label>
                <ScrollDatePicker value={value.dob || ''} onChange={v => onChange({ ...value, dob: v })} max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Time of Birth</label>
                <input type="time" value={value.tob || '12:00'} onChange={e => onChange({ ...value, tob: e.target.value })}
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50" />
              </div>
            </div>
            <div>
              <BirthPlacePicker
                label="Birth City"
                value={value.place || ''}
                onChange={p => onChange({ ...value, place: p.place, lat: p.lat, lng: p.lng, timezone: p.timezone })}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Birth Nakshatra (Moon Star)</label>
              <select value={value.nakshatra || ''} onChange={e => {
                const nidx2 = NAKSHATRA_LIST.indexOf(e.target.value);
                onChange({ ...value, nakshatra: e.target.value, moonSign: nidx2 >= 0 ? SIGN_LIST[NAK_SIGN[nidx2]] : value.moonSign });
              }}
                className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                <option value="">Select Nakshatra</option>
                {NAKSHATRA_LIST.map((n, i) => <option key={n} value={n}>{i+1}. {n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
                Moon Sign (Rashi)
                {value.nakshatra && <span className="ml-1 text-gray-600 normal-case text-xs">— auto: {defaultSign}</span>}
              </label>
              <select value={value.moonSign || ''} onChange={e => onChange({ ...value, moonSign: e.target.value })}
                className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                <option value="">Select Rashi</option>
                {SIGN_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KootBar({ koot }) {
  const pct = (koot.scored / koot.max) * 100;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#f97316' : '#ef4444';
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-200 text-sm font-medium">{koot.name}</span>
            <span className="text-gray-500 text-xs hidden md:block">— {koot.desc}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color }}>{koot.scored}/{koot.max}</span>
            {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
          </div>
        </div>
        <div className="h-2 bg-cosmic-900 rounded-full overflow-hidden mb-0.5">
          <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.7, ease:'easeOut' }}
            className="h-full rounded-full" style={{ background: color }} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} transition={{ duration:0.15 }}
            className="overflow-hidden">
            <p className="text-gray-500 text-xs mt-1 mb-2 md:hidden">{koot.desc}</p>
            <p className="text-gold-400/80 text-xs mt-1 mb-2">{koot.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoshaCard({ dosha }) {
  const severityColor = dosha.severity === 'High' ? '#ef4444' : dosha.severity === 'Medium' ? '#f97316' : '#f59e0b';
  if (dosha.cancelled) {
    return (
      <div className="rounded-xl p-4 border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-400 text-sm font-semibold">✓ {dosha.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full">Cancelled</span>
        </div>
        <p className="text-gray-500 text-xs">{dosha.cancellationReason}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: severityColor + '30', background: severityColor + '08' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold" style={{ color: severityColor }}>⚠ {dosha.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full border text-xs" style={{ color: severityColor, borderColor: severityColor + '50', background: severityColor + '15' }}>
          {dosha.severity} Severity
        </span>
      </div>
      <p className="text-gray-400 text-xs mb-1">{dosha.effect}</p>
      <p className="text-gray-600 text-xs italic">{dosha.remedy}</p>
    </div>
  );
}

export default function KundaliMatchingPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState('nakshatra'); // 'birth' | 'nakshatra'
  const [p1, setP1] = useState({ name:'', nakshatra:'', moonSign:'', dob:'', tob:'12:00', place:'', lat:null, lng:null, timezone:null });
  const [p2, setP2] = useState({ name:'', nakshatra:'', moonSign:'', dob:'', tob:'12:00', place:'', lat:null, lng:null, timezone:null });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  function buildPayload(p) {
    if (mode === 'birth') {
      if (!p.dob || !p.lat) return null;
      return { dob: p.dob, tob: p.tob || '12:00', lat: p.lat, lng: p.lng, timezone: p.timezone };
    }
    if (!p.nakshatra) return null;
    const nidx = NAKSHATRA_LIST.indexOf(p.nakshatra);
    const midx = p.moonSign ? SIGN_LIST.indexOf(p.moonSign) : NAK_SIGN[nidx];
    return { nakshatraIndex: nidx, moonSignIndex: midx };
  }

  async function handleMatch() {
    setError('');
    const pay1 = buildPayload(p1);
    const pay2 = buildPayload(p2);

    if (!pay1) { setError(mode === 'birth' ? 'Please fill Date of Birth and Birth City for Person 1.' : 'Please select Nakshatra for Person 1.'); return; }
    if (!pay2) { setError(mode === 'birth' ? 'Please fill Date of Birth and City for Person 2.' : 'Please select Nakshatra for Person 2.'); return; }

    setLoading(true);
    setResult(null);
    try {
      const r = await gunaMilanApi.calculate({
        person1: { ...pay1, name: p1.name },
        person2: { ...pay2, name: p2.name },
      });
      setResult(r.data);
      setSaved(false);
    } catch (e) {
      setError(e.response?.data?.error || 'Calculation failed. Please try again.');
    }
    setLoading(false);
  }

  const verdict = result?.verdict;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />

      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <img
          src="/kundali-hero.webp"
          alt="Kundali Matching"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cosmic-950" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          {/* Mode toggle */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
            className="flex gap-1 bg-cosmic-800/50 rounded-xl p-1 mb-6 max-w-sm mx-auto">
            <button onClick={() => setMode('nakshatra')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode==='nakshatra' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-400 hover:text-gray-200'}`}>
              By Nakshatra
            </button>
            <button onClick={() => setMode('birth')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode==='birth' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-400 hover:text-gray-200'}`}>
              By Birth Details
            </button>
          </motion.div>

          {/* Forms */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="grid md:grid-cols-2 gap-5 mb-6">
            <PersonForm title="Person 1" emoji="💙" mode={mode} value={p1} onChange={setP1} />
            <PersonForm title="Person 2" emoji="💗" mode={mode} value={p2} onChange={setP2} />
          </motion.div>

          {mode === 'nakshatra' && (
            <p className="text-gray-500 text-xs text-center mb-4">
              Don't know your Nakshatra? <Link to="/kundali" className="text-gold-500 hover:text-gold-400">Generate free Kundali →</Link>
            </p>
          )}

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <div className="text-center mb-10">
            <button onClick={handleMatch} disabled={loading}
              className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold rounded-full px-14 py-4 text-base hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-gold-500/20">
              {loading
                ? <span className="flex items-center gap-2"><Loader className="w-5 h-5 animate-spin" />Calculating…</span>
                : '✦ Check Compatibility'}
            </button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-6">

                {/* Score hero */}
                <div className="bg-cosmic-800/70 border-2 rounded-3xl p-8 text-center relative"
                  style={{ borderColor: verdict.color + '50', boxShadow:`0 0 80px ${verdict.color}15` }}>
                  {user && (
                    <button onClick={async () => {
                      if (saved) return;
                      setSaving(true);
                      try {
                        const n1 = p1.name || result.person1.nakshatra;
                        const n2 = p2.name || result.person2.nakshatra;
                        await historyApi.save({
                          type: 'guna_milan',
                          title: `${n1} & ${n2} — Kundali Matching`,
                          meta: { score: result.total, percentage: result.percentage, verdict: verdict.label, nakshatra1: result.person1.nakshatra, nakshatra2: result.person2.nakshatra, moon_sign1: result.person1.moonSign, moon_sign2: result.person2.moonSign },
                        });
                        setSaved(true);
                        toast.success('Kundali matching saved to History!');
                      } catch { toast.error('Could not save to history'); }
                      finally { setSaving(false); }
                    }} disabled={saving || saved}
                      className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                      {saved ? 'Saved' : saving ? 'Saving…' : 'Save to History'}
                    </button>
                  )}
                  <div className="text-6xl mb-3">{verdict.emoji}</div>
                  <div className="font-serif text-7xl font-bold mb-1" style={{ color: verdict.color }}>
                    {result.total.toFixed(1)}<span className="text-3xl text-gray-400">/36</span>
                  </div>
                  <h2 className="font-serif text-2xl text-gray-100 mb-2">{verdict.label}</h2>
                  <p className="text-gray-400 text-sm mb-5">
                    {result.person1.name || 'Person 1'} ({result.person1.nakshatra}, {result.person1.moonSign})
                    {' '}&amp;{' '}
                    {result.person2.name || 'Person 2'} ({result.person2.nakshatra}, {result.person2.moonSign})
                  </p>

                  {/* SVG arc meter */}
                  <div className="flex justify-center mb-2">
                    <svg width="160" height="90" viewBox="0 0 160 90">
                      <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="#1a1a3e" strokeWidth="14" strokeLinecap="round"/>
                      <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke={verdict.color} strokeWidth="14"
                        strokeLinecap="round" strokeDasharray={`${result.percentage * 2.04} 204`} opacity="0.85"/>
                      <text x="80" y="80" textAnchor="middle" fill={verdict.color} fontSize="20" fontWeight="bold">{result.percentage}%</text>
                    </svg>
                  </div>

                  <div className="flex justify-center gap-8 text-xs text-gray-500 mt-1">
                    <span>&lt;18 Not Recommended</span>
                    <span>18–24 Acceptable</span>
                    <span>24–32 Good</span>
                    <span>&gt;32 Excellent</span>
                  </div>
                </div>

                {/* Person comparison */}
                <div className="grid grid-cols-2 gap-3">
                  {[{label:'Person 1', p:result.person1, emoji:'💙'}, {label:'Person 2', p:result.person2, emoji:'💗'}].map(({label,p,emoji}) => (
                    <div key={label} className="bg-cosmic-800/60 border border-gold-600/15 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-xs mb-1">{emoji} {p.name || label}</p>
                      <p className="text-gold-300 font-semibold">{p.nakshatra}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{p.moonSign} Moon</p>
                      {p.lagna && <p className="text-gray-500 text-xs mt-0.5">{p.lagna} Lagna</p>}
                    </div>
                  ))}
                </div>

                {/* Koot breakdown */}
                <div className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-6 md:p-8">
                  <h3 className="font-serif text-gold-400 text-xl mb-6">✦ Ashtakoot Breakdown</h3>
                  <div className="space-y-4">
                    {result.koots.map(k => <KootBar key={k.id} koot={k} />)}
                  </div>
                </div>

                {/* Doshas */}
                {result.doshas.length > 0 && (
                  <div className="bg-cosmic-800/60 border border-gold-600/15 rounded-3xl p-6 md:p-8">
                    <h3 className="font-serif text-gold-400 text-xl mb-4">✦ Dosha Analysis</h3>
                    <div className="space-y-3">
                      {result.doshas.map(d => <DoshaCard key={d.name} dosha={d} />)}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-6 md:p-8">
                  <h3 className="font-serif text-gold-400 text-xl mb-4">✦ Cosmic Interpretation</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{result.verdictText}</p>
                </div>

                {/* CTA */}
                <div className="text-center space-y-3">
                  <p className="text-gray-400 text-sm">For a complete matching report with Mangal Dosha, Nadi Dosha remedies, and auspicious muhurat, consult our expert astrologers</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link to="/astrologers"
                      className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-10 py-3 hover:opacity-90 transition-opacity">
                      Consult an Expert →
                    </Link>
                    <Link to="/mangal-dosha"
                      className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-all text-sm">
                      ♂ Check Mangal Dosha
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
