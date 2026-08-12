import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Loader, Hash, Sparkles, Grid3x3, Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { numerology as numerologyApi } from '../api';

const TABS = [
  { id: 'profile',  label: 'Number Profile',  icon: '🔢' },
  { id: 'loshu',    label: 'Lo Shu Grid',      icon: '🔲' },
  { id: 'year',     label: 'Personal Year',    icon: '📅' },
  { id: 'prashna',  label: 'Prashna Game',     icon: '🎲' },
];

const COMPAT_META = {
  friendly:   { label: 'Harmonious ✓',   cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' },
  neutral:    { label: 'Neutral ○',      cls: 'text-gray-300 bg-white/5 border-white/20' },
  challenging:{ label: 'Challenging △',  cls: 'text-orange-400 bg-orange-500/10 border-orange-500/40' },
};

// Lo Shu fixed grid positions
const LO_SHU_GRID = [[4,9,2],[3,5,7],[8,1,6]];

const PLANE_LABELS = {
  row0: { label:'Mental Plane', sub:'Intellect & Memory' },
  row1: { label:'Emotional Plane', sub:'Feelings & Intuition' },
  row2: { label:'Practical Plane', sub:'Material Success' },
  col0: { label:'Thought Column', sub:'Idea Generation' },
  col1: { label:'Will Column', sub:'Determination' },
  col2: { label:'Action Column', sub:'Execution' },
};

// Prashna combination readings (pre-written for all 9×9 pairs)
function getPrashnaReading(n1, n2, themes) {
  const p1 = themes[n1];
  const p2 = themes[n2];
  if (!p1 || !p2) return '';
  if (n1 === n2) {
    return `The energy of ${p1.planet} (Number ${n1}) is doubled and amplified powerfully around you right now. ${p1.themes[0].charAt(0).toUpperCase() + p1.themes[0].slice(1)} is at the very center of this moment. This intense single-planetary focus suggests that ${p1.themes[1]} is your immediate priority. Trust this concentrated energy — it rarely speaks so clearly.`;
  }
  const combined = [
    `The cosmic forces of ${p1.planet} and ${p2.planet} are speaking directly to you in this moment.`,
    `${p1.planet} (${n1}) brings the vibration of ${p1.themes[0]}, while ${p2.planet} (${n2}) introduces the energy of ${p2.themes[0]}.`,
    `Together, this combination reveals that ${p1.themes[2]} and ${p2.themes[1]} are the dominant currents in your life right now.`,
    `This is not coincidence — your inner self chose these numbers because your soul recognizes what it needs. The union of ${p1.planet} and ${p2.planet} is an auspicious signal to take mindful action in the direction of ${p2.themes[2]}.`,
  ].join(' ');
  return combined;
}

function NumberCard({ title, subtitle, num, data, badge, compact }) {
  if (!data) return null;
  const isMaster = data.isMaster;
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      className="card-cosmic border border-gold-600/20 overflow-hidden relative"
      style={{ boxShadow: `0 0 32px ${data.colorHex}22` }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, ${data.colorHex}11 0%, transparent 65%)` }} />
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">{title}</p>
            <p className="text-gray-500 text-xs">{subtitle}</p>
          </div>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400">{badge}</span>
          )}
        </div>

        {/* Big Number */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2"
            style={{ borderColor: data.colorHex + '80', background: data.colorHex + '18', boxShadow: `0 0 24px ${data.colorHex}33` }}>
            <span className="font-serif font-bold" style={{ fontSize: isMaster ? '1.6rem' : '2.5rem', color: data.colorHex, lineHeight:1 }}>{num}</span>
          </div>
          <div>
            <p className="font-serif text-gold-400 text-lg leading-tight">{data.psychicTitle}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span style={{ fontSize:'1rem' }}>{data.symbol}</span>
              <span className="text-gray-300 text-sm">{data.planet}</span>
              <span className="text-gray-600 text-xs">·</span>
              <span className="text-gray-400 text-xs">{data.element}</span>
            </div>
            {isMaster && (
              <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 font-semibold uppercase tracking-wider">Master Number</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{title === 'Destiny Number' ? data.destinyDesc : data.psychicDesc}</p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.keywords.map(k => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: data.colorHex + '60', color: data.colorHex, background: data.colorHex + '15' }}>{k}</span>
          ))}
        </div>

        {!compact && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5">Strengths</p>
                {data.strengths.map(s => <p key={s} className="text-gray-300 text-xs py-0.5 flex items-center gap-1"><span className="text-emerald-500 text-[10px]">▲</span>{s}</p>)}
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5">Challenges</p>
                {data.challenges.map(c => <p key={c} className="text-gray-300 text-xs py-0.5 flex items-center gap-1"><span className="text-orange-400 text-[10px]">▼</span>{c}</p>)}
              </div>
            </div>

            {/* Lucky info */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gold-600/10">
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Lucky Day</p>
                <p className="text-gold-400 text-xs font-medium">{data.luckyDay}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Gemstone</p>
                <p className="text-gold-400 text-xs font-medium">{data.gemstone}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Colors</p>
                <p className="text-gold-400 text-xs font-medium">{data.luckyColors[0]}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function LoShuCell({ number, count }) {
  const present = count > 0;
  const dots = Math.min(count, 4);
  return (
    <div className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all relative ${
      present
        ? 'bg-gold-500/12 border-gold-400/50'
        : 'bg-cosmic-900/40 border-gold-600/15'
    }`}
      style={present ? { boxShadow: '0 0 16px rgba(201,168,76,0.2)' } : {}}>
      <span className={`font-serif font-bold text-2xl md:text-3xl ${present ? 'text-gold-300' : 'text-gray-700'}`}>{number}</span>
      {count > 0 && (
        <div className="flex gap-0.5 mt-1">
          {Array.from({length: dots}).map((_,i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400" />
          ))}
        </div>
      )}
      {!present && <span className="text-gray-700 text-[10px] mt-0.5">missing</span>}
    </div>
  );
}

export default function NumerologyPage() {
  const [form, setForm] = useState({ name: '', dob: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [prashnaSelected, setPrashnaSelected] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dob) return toast.error('Please enter your date of birth');
    setLoading(true);
    setResult(null);
    try {
      const res = await numerologyApi.calculate({ name: form.name || undefined, dob: form.dob });
      setResult(res.data);
      setActiveTab('profile');
      setPrashnaSelected([]);
      setTimeout(() => document.getElementById('num-results')?.scrollIntoView({ behavior:'smooth' }), 150);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrashnaSelect = (n) => {
    setPrashnaSelected(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n);
      if (prev.length >= 2) return [prev[1], n];
      return [...prev, n];
    });
  };

  return (
    <div className="relative min-h-screen bg-cosmic-950">

      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <img src="/numerology-hero.webp" alt="Numerology" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cosmic-950" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Vedic · Chaldean · Pythagorean</p>
          <h1 className="font-serif text-3xl md:text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            अंक ज्योतिष
          </h1>
          <p className="text-gray-300 text-xl mb-2">Numerology — The Science of Numbers</p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Every number vibrates with a specific planetary energy. Your birth date and name carry a unique numerical signature
            that reveals your personality, life mission, strengths, and the energies shaping your destiny.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Psychic Number (Moolank)','Destiny Number (Bhagyank)','Name Number (Namank)','Lo Shu Grid','Personal Year','Prashna Game'].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400">{f}</span>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="card-cosmic p-8 mb-8 border border-gold-600/20">
          <h2 className="font-serif text-gold-400 text-xl mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5" /> जन्म विवरण — Your Birth Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-300 text-sm mb-1.5">Your Name <span className="text-gray-500 text-xs">(for Name Number — Chaldean)</span></label>
                <input type="text" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" /> Date of Birth <span className="text-red-400">*</span>
                </label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 transition-all"
                  required />
              </div>
            </div>

            <div className="bg-cosmic-900/50 rounded-xl p-3 border border-gold-600/10">
              <p className="text-gray-400 text-xs leading-relaxed">
                <span className="text-gold-400 font-medium">How it works: </span>
                Your Psychic Number comes from your birth day. Destiny Number uses your full date. Name Number uses Chaldean letter vibrations.
                All calculations are mathematical — no AI involved.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gold-500 text-cosmic-950 font-bold text-lg rounded-xl hover:bg-gold-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ boxShadow:'0 0 24px rgba(201,168,76,0.3)' }}>
              {loading
                ? <><Loader className="w-5 h-5 animate-spin" /> Calculating...</>
                : '✦ Reveal My Numbers — संख्या प्रकट करें'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div id="num-results" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>

              {/* Summary banner */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                className="card-cosmic border border-gold-500/40 p-5 mb-6 relative overflow-hidden"
                style={{ boxShadow:'0 0 40px rgba(201,168,76,0.12)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-600/8 via-transparent to-purple-600/8 pointer-events-none" />
                <div className="relative flex flex-wrap items-center justify-center gap-6 md:gap-10">
                  {result.name && (
                    <div className="text-center">
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Name</p>
                      <p className="text-gold-300 font-serif text-xl">{result.name}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Psychic / Moolank</p>
                    <p className="text-gold-400 font-serif text-4xl font-bold" style={{ textShadow:'0 0 20px rgba(201,168,76,0.6)' }}>{result.psychic.number}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{result.psychic.data?.planet}</p>
                  </div>
                  <div className="w-px h-12 bg-gold-600/30 hidden md:block" />
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Destiny / Bhagyank</p>
                    <p className="text-purple-400 font-serif text-4xl font-bold" style={{ textShadow:'0 0 20px rgba(139,92,246,0.5)' }}>{result.destiny.number}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{result.destiny.data?.planet}</p>
                  </div>
                  {result.nameNumber && (
                    <>
                      <div className="w-px h-12 bg-gold-600/30 hidden md:block" />
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Name / Namank</p>
                        <p className="text-pink-400 font-serif text-4xl font-bold" style={{ textShadow:'0 0 20px rgba(236,72,153,0.5)' }}>{result.nameNumber.single}</p>
                        <p className="text-gray-300 text-xs mt-0.5">{result.nameNumber.data?.planet}</p>
                      </div>
                    </>
                  )}
                  <div className="w-px h-12 bg-gold-600/30 hidden md:block" />
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Personal Year</p>
                    <p className="text-amber-400 font-serif text-4xl font-bold" style={{ textShadow:'0 0 20px rgba(251,191,36,0.5)' }}>{result.personalYear.number}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{result.personalYear.year}</p>
                  </div>
                </div>
              </motion.div>

              {/* Compatibility row */}
              <div className="flex flex-wrap gap-3 mb-6 justify-center">
                {result.compatibility.psychicDestiny && (() => {
                  const meta = COMPAT_META[result.compatibility.psychicDestiny];
                  return <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${meta.cls}`}>Psychic ↔ Destiny: {meta.label}</span>;
                })()}
                {result.compatibility.psychicName && (() => {
                  const meta = COMPAT_META[result.compatibility.psychicName];
                  return <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${meta.cls}`}>Psychic ↔ Name: {meta.label}</span>;
                })()}
                {result.compatibility.destinyName && (() => {
                  const meta = COMPAT_META[result.compatibility.destinyName];
                  return <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${meta.cls}`}>Destiny ↔ Name: {meta.label}</span>;
                })()}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-cosmic-900/60 rounded-2xl border border-gold-600/15 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-max flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}>
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {/* === PROFILE TAB === */}
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className={`grid gap-6 ${result.nameNumber ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                      <NumberCard title="Psychic Number" subtitle="Moolank — Your Inner Self" num={result.psychic.number} data={result.psychic.data} />
                      <NumberCard title="Destiny Number" subtitle="Bhagyank — Your Life Path" num={result.destiny.number} data={result.destiny.data} />
                      {result.nameNumber && (
                        <div className="card-cosmic border border-gold-600/20 overflow-hidden relative" style={{ boxShadow:`0 0 32px ${result.nameNumber.data?.colorHex}22` }}>
                          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, ${result.nameNumber.data?.colorHex}11 0%, transparent 65%)` }} />
                          <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="text-gray-400 text-xs uppercase tracking-widest">Name Number</p>
                                <p className="text-gray-500 text-xs">Namank — Chaldean Vibration</p>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400">Compound: {result.nameNumber.compound}</span>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2"
                                style={{ borderColor:(result.nameNumber.data?.colorHex||'#EC4899')+'80', background:(result.nameNumber.data?.colorHex||'#EC4899')+'18', boxShadow:`0 0 24px ${result.nameNumber.data?.colorHex||'#EC4899'}33` }}>
                                <span className="font-serif font-bold text-4xl leading-none" style={{ color: result.nameNumber.data?.colorHex||'#EC4899' }}>{result.nameNumber.single}</span>
                              </div>
                              <div>
                                <p className="font-serif text-gold-400 text-lg leading-tight">{result.nameNumber.data?.psychicTitle}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span>{result.nameNumber.data?.symbol}</span>
                                  <span className="text-gray-300 text-sm">{result.nameNumber.data?.planet}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">{result.nameNumber.data?.psychicDesc}</p>
                            {/* Letter breakdown */}
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Chaldean Letter Values</p>
                              <div className="flex flex-wrap gap-1.5">
                                {result.nameNumber.breakdown.map((b, i) => (
                                  <div key={i} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg bg-cosmic-900/60 border border-gold-600/15">
                                    <span className="text-gold-300 font-bold text-sm">{b.letter}</span>
                                    <span className="text-gray-400 text-[10px]">{b.value || '—'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-gold-600/10">
                              <div className="text-center">
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Lucky Day</p>
                                <p className="text-gold-400 text-xs font-medium">{result.nameNumber.data?.luckyDay}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Gemstone</p>
                                <p className="text-gold-400 text-xs font-medium">{result.nameNumber.data?.gemstone}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Colors</p>
                                <p className="text-gold-400 text-xs font-medium">{result.nameNumber.data?.luckyColors?.[0]}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Career paths row */}
                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                      {[
                        { label:`Psychic ${result.psychic.number} Career Paths`, careers: result.psychic.data?.career },
                        { label:`Destiny ${result.destiny.number} Career Paths`, careers: result.destiny.data?.career },
                      ].map(({ label, careers }) => careers && (
                        <div key={label} className="card-cosmic p-5 border border-gold-600/15">
                          <p className="text-gold-400 text-xs uppercase tracking-wider mb-3">{label}</p>
                          <div className="space-y-1.5">
                            {careers.map(c => (
                              <div key={c} className="flex items-center gap-2 text-gray-300 text-sm">
                                <span className="text-gold-500 text-xs">✦</span>{c}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* === LO SHU GRID TAB === */}
                {activeTab === 'loshu' && (
                  <motion.div key="loshu" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>

                    {/* Raj / Rajat Yog alerts */}
                    {result.loShu.formations.filter(f => f.type === 'yog').map(yog => (
                      <motion.div key={yog.name} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                        className="mb-5 p-4 rounded-2xl border-2 border-gold-400/60 bg-gold-500/10 relative overflow-hidden"
                        style={{ boxShadow:'0 0 32px rgba(201,168,76,0.25)' }}>
                        <div className="absolute top-0 right-0 text-7xl opacity-10 select-none pr-3 pt-1">✨</div>
                        <div className="relative flex items-start gap-3">
                          <span className="text-2xl">✨</span>
                          <div>
                            <p className="text-gold-300 font-serif text-lg font-semibold">{yog.name}</p>
                            <p className="text-gold-400 text-xs mb-1">{yog.rarity}</p>
                            <p className="text-gray-200 text-sm leading-relaxed">{yog.desc}</p>
                            <p className="text-gold-500 text-xs mt-1.5">Numbers: {yog.numbers.join(' · ')}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* The Grid */}
                      <div className="card-cosmic p-6 border border-gold-600/20">
                        <h3 className="font-serif text-gold-400 text-lg mb-1">Lo Shu Grid — लो शू ग्रिड</h3>
                        <p className="text-gray-400 text-xs mb-5">Birth date digits placed in the magic 3×3 square</p>

                        {/* Grid + axis labels */}
                        <div className="flex gap-4 items-center justify-center mb-4">
                          {/* Vertical plane labels */}
                          <div className="flex flex-col justify-around h-full gap-2 text-right hidden sm:flex">
                            <span className="text-gray-500 text-[10px] leading-tight w-16">Mental<br/>Plane</span>
                            <span className="text-gray-500 text-[10px] leading-tight w-16">Emotional<br/>Plane</span>
                            <span className="text-gray-500 text-[10px] leading-tight w-16">Practical<br/>Plane</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                            {LO_SHU_GRID.flat().map(n => (
                              <LoShuCell key={n} number={n} count={result.loShu.counts[n] || 0} />
                            ))}
                          </div>
                        </div>

                        {/* Column labels */}
                        <div className="flex justify-center gap-2 max-w-[240px] mx-auto mt-1">
                          {['Thought','Will','Action'].map(l => (
                            <span key={l} className="flex-1 text-center text-gray-500 text-[10px]">{l}</span>
                          ))}
                        </div>

                        {/* Present numbers */}
                        <div className="mt-4 pt-4 border-t border-gold-600/10">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Present Digits</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.loShu.present.sort((a,b)=>a-b).map(n => (
                              <span key={n} className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 font-bold">{n}</span>
                            ))}
                          </div>
                          {result.loShu.missing.length > 0 && (
                            <div className="mt-2">
                              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Missing Digits</p>
                              <div className="flex flex-wrap gap-1.5">
                                {result.loShu.missing.sort((a,b)=>a-b).map(n => (
                                  <span key={n} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold">{n}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Formations + Missing analysis */}
                      <div className="space-y-4">
                        {/* Formations */}
                        {result.loShu.formations.filter(f => f.type !== 'yog').length > 0 && (
                          <div className="card-cosmic p-5 border border-gold-600/20">
                            <h3 className="font-serif text-gold-400 text-base mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4" /> Active Formations
                            </h3>
                            <div className="space-y-3">
                              {result.loShu.formations.filter(f => f.type !== 'yog').map(f => (
                                <div key={f.name} className="bg-gold-500/8 border border-gold-500/20 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gold-400 font-semibold text-sm">{f.name}</span>
                                    <span className="text-xs text-gold-600">[{f.numbers.join(' · ')}]</span>
                                  </div>
                                  <p className="text-gray-300 text-xs leading-relaxed">{f.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.loShu.formations.filter(f => f.type !== 'yog').length === 0 && (
                          <div className="card-cosmic p-5 border border-gold-600/20">
                            <h3 className="font-serif text-gold-400 text-base mb-2">Active Formations</h3>
                            <p className="text-gray-400 text-sm">No complete row/column formations in your grid. This indicates a balanced, spread-out energy that benefits from developing all areas equally.</p>
                          </div>
                        )}

                        {/* Missing meanings */}
                        {result.loShu.missingMeanings.length > 0 && (
                          <div className="card-cosmic p-5 border border-gold-600/20">
                            <h3 className="font-serif text-gold-400 text-base mb-3 flex items-center gap-2">
                              <Zap className="w-4 h-4" /> Missing Number Insights
                            </h3>
                            <div className="space-y-2.5">
                              {result.loShu.missingMeanings.map(m => (
                                <div key={m.number} className="flex items-start gap-3 py-2 border-b border-gold-600/10 last:border-0">
                                  <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-sm flex-shrink-0">{m.number}</div>
                                  <div>
                                    <p className="text-orange-300 text-xs font-medium">{m.short}</p>
                                    <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* === PERSONAL YEAR TAB === */}
                {activeTab === 'year' && (
                  <motion.div key="year" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className="card-cosmic border border-amber-500/30 overflow-hidden relative mb-6"
                      style={{ boxShadow:'0 0 40px rgba(251,191,36,0.15)' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-gold-600/8 pointer-events-none" />
                      <div className="relative p-8 text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Personal Year {result.personalYear.year}</p>
                        <div className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-amber-400/60"
                          style={{ background:'rgba(251,191,36,0.1)', boxShadow:'0 0 40px rgba(251,191,36,0.3)' }}>
                          <span className="font-serif font-bold text-5xl text-amber-300" style={{ textShadow:'0 0 20px rgba(251,191,36,0.6)' }}>{result.personalYear.number}</span>
                        </div>
                        <h2 className="font-serif text-gold-400 text-2xl mb-3">{result.personalYear.title}</h2>
                        <p className="text-gray-200 text-base leading-relaxed max-w-xl mx-auto">{result.personalYear.desc}</p>
                      </div>
                    </div>

                    {/* 9-year cycle */}
                    <div className="card-cosmic p-6 border border-gold-600/20">
                      <h3 className="font-serif text-gold-400 text-lg mb-4">The 9-Year Life Cycle</h3>
                      <p className="text-gray-400 text-xs mb-5">Your current position in the universal cycle. Each year builds on the previous.</p>
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                        {[1,2,3,4,5,6,7,8,9].map(y => {
                          const isCurrent = y === result.personalYear.number;
                          const yearLabels = { 1:'New Start',2:'Partnership',3:'Creation',4:'Foundation',5:'Change',6:'Love',7:'Reflection',8:'Achievement',9:'Completion' };
                          return (
                            <div key={y} className={`rounded-xl p-2.5 text-center border transition-all ${
                              isCurrent
                                ? 'border-amber-400/60 bg-amber-500/15 shadow-lg'
                                : 'border-gold-600/15 bg-cosmic-900/30'
                            }`}
                              style={isCurrent ? { boxShadow:'0 0 20px rgba(251,191,36,0.25)' } : {}}>
                              <p className={`font-serif font-bold text-xl mb-1 ${isCurrent ? 'text-amber-300' : 'text-gray-500'}`}>{y}</p>
                              <p className={`text-[10px] leading-tight ${isCurrent ? 'text-amber-200' : 'text-gray-600'}`}>{yearLabels[y]}</p>
                              {isCurrent && <p className="text-amber-400 text-[10px] font-bold mt-1">← YOU</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* === PRASHNA GAME TAB === */}
                {activeTab === 'prashna' && (
                  <motion.div key="prashna" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}>
                    <div className="card-cosmic p-6 border border-gold-600/20 mb-6">
                      <div className="text-center mb-6">
                        <h3 className="font-serif text-gold-400 text-xl mb-2">प्रश्न अंक ज्योतिष — Prashna Numerology</h3>
                        <p className="text-gray-400 text-sm max-w-lg mx-auto">
                          Close your eyes. Think of a question or a current situation in your life.
                          Now intuitively pick <span className="text-gold-400 font-medium">2 numbers</span> from 1 to 9.
                          The planetary energies you choose reveal what the universe is saying to you right now.
                        </p>
                      </div>

                      {/* Number grid */}
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-2 max-w-xl mx-auto mb-6">
                        {[1,2,3,4,5,6,7,8,9].map(n => {
                          const pt = result.planetThemes[n];
                          const isSelected = prashnaSelected.includes(n);
                          return (
                            <button key={n} onClick={() => handlePrashnaSelect(n)}
                              className={`rounded-2xl p-3 text-center border-2 transition-all flex flex-col items-center gap-1 ${
                                isSelected
                                  ? 'border-gold-400 bg-gold-500/20 scale-105'
                                  : 'border-gold-600/20 bg-cosmic-900/40 hover:border-gold-400/50 hover:bg-gold-500/10'
                              }`}
                              style={isSelected ? { boxShadow:`0 0 20px ${pt?.color}55` } : {}}>
                              <span className="text-lg">{pt?.icon}</span>
                              <span className={`font-serif font-bold text-2xl leading-none ${isSelected ? 'text-gold-300' : 'text-gray-400'}`}>{n}</span>
                              <span className={`text-[9px] leading-tight text-center ${isSelected ? 'text-gold-400' : 'text-gray-600'}`}>{pt?.planet}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-center text-gray-400 text-sm mb-4">
                        {prashnaSelected.length === 0 && 'Select 2 numbers above'}
                        {prashnaSelected.length === 1 && `Selected: ${prashnaSelected[0]} — Pick one more`}
                        {prashnaSelected.length === 2 && `Selected: ${prashnaSelected[0]} + ${prashnaSelected[1]}`}
                      </div>

                      {/* Reading */}
                      <AnimatePresence>
                        {prashnaSelected.length === 2 && (() => {
                          const [n1, n2] = prashnaSelected;
                          const p1 = result.planetThemes[n1];
                          const p2 = result.planetThemes[n2];
                          const reading = getPrashnaReading(n1, n2, result.planetThemes);
                          return (
                            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                              className="bg-gold-500/8 border border-gold-500/30 rounded-2xl p-6 relative overflow-hidden"
                              style={{ boxShadow:'0 0 32px rgba(201,168,76,0.15)' }}>
                              <div className="absolute inset-0 bg-gradient-to-br from-gold-600/8 via-transparent to-purple-600/5 pointer-events-none" />
                              <div className="relative">
                                <div className="flex items-center justify-center gap-4 mb-5">
                                  <div className="text-center">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 mx-auto mb-1"
                                      style={{ borderColor: p1?.color+'80', background: p1?.color+'18' }}>
                                      <span className="font-serif font-bold text-2xl" style={{ color: p1?.color }}>{n1}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: p1?.color }}>{p1?.icon} {p1?.planet}</p>
                                  </div>
                                  <div className="text-gold-600 text-2xl">+</div>
                                  <div className="text-center">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 mx-auto mb-1"
                                      style={{ borderColor: p2?.color+'80', background: p2?.color+'18' }}>
                                      <span className="font-serif font-bold text-2xl" style={{ color: p2?.color }}>{n2}</span>
                                    </div>
                                    <p className="text-xs" style={{ color: p2?.color }}>{p2?.icon} {p2?.planet}</p>
                                  </div>
                                </div>
                                <p className="text-gray-200 text-sm leading-relaxed text-center">{reading}</p>
                                <button onClick={() => setPrashnaSelected([])}
                                  className="mt-5 mx-auto block text-xs text-gray-500 hover:text-gold-400 transition-colors underline underline-offset-2">
                                  Pick different numbers
                                </button>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>

                    {/* Planetary number guide */}
                    <div className="card-cosmic p-6 border border-gold-600/15">
                      <h3 className="font-serif text-gold-400 text-base mb-4">ग्रह अंक मानचित्र — Planetary Number Map</h3>
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                        {Object.entries(result.planetThemes).map(([n, pt]) => (
                          <div key={n} className="text-center p-2 rounded-xl border border-gold-600/15 bg-cosmic-900/30">
                            <span className="text-xl">{pt.icon}</span>
                            <p className="font-serif font-bold text-gold-400 text-lg mt-1">{n}</p>
                            <p className="text-gray-400 text-[10px] leading-tight">{pt.planet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info section when no result yet */}
        {!result && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <div className="grid md:grid-cols-3 gap-4 mt-2">
              {[
                { icon:'🔢', title:'Psychic Number', sub:'Moolank', desc:'Based on your birth day. Reveals your core personality, inner nature, and how you instinctively approach life.' },
                { icon:'⭐', title:'Destiny Number', sub:'Bhagyank', desc:'Based on your full birth date. Reveals your life path, karmic mission, and the destiny you came to fulfill.' },
                { icon:'🔤', title:'Name Number', sub:'Namank — Chaldean', desc:'Each letter vibrates at a specific frequency. Your name number shows how the world perceives you and your outer success potential.' },
                { icon:'🔲', title:'Lo Shu Grid', sub:'Chinese Magic Square', desc:'Your birth digits fill a 3×3 magic grid. Active formations reveal strengths; rare Raj Yog and Rajat Yog alignments bring extraordinary fortune.' },
                { icon:'📅', title:'Personal Year', sub:'Current Year Energy', desc:'A 9-year cycle governs your life. Your personal year number reveals the dominant theme and energy available to you this year.' },
                { icon:'🎲', title:'Prashna Game', sub:'Intuitive Reading', desc:'Pick 2 numbers that speak to you right now. The planets behind your choices reveal what the universe is communicating to you in this moment.' },
              ].map(item => (
                <div key={item.title} className="card-cosmic p-5 border border-gold-600/15 hover:border-gold-400/30 transition-colors">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <p className="text-gold-400 font-serif text-base">{item.title}</p>
                  <p className="text-gray-500 text-xs mb-2">{item.sub}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
