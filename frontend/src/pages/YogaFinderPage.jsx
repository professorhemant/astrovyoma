import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader, ChevronDown, ChevronUp, Bookmark, Languages } from 'lucide-react';
import { yoga as yogaApi, reportHistory as historyApi } from '../api';
import BirthPlacePicker from '../components/BirthPlacePicker';
import { useAuth } from '../context/AuthContext';
import SwastikBorder from '../components/SwastikBorder';

// ── Category meta ──────────────────────────────────────────────────────────────
const CATEGORY_META = {
  'Pancha Mahapurusha': { color: '#FFD93D', bg: 'rgba(255,217,61,0.08)',  icon: '👑', label: 'Pancha Mahapurusha', labelHi: 'पंच महापुरुष योग' },
  'Raja Yoga':          { color: '#C9A84C', bg: 'rgba(201,168,76,0.08)',  icon: '🔱', label: 'Raja Yoga',          labelHi: 'राज योग'           },
  'Dhana Yoga':         { color: '#6BCB77', bg: 'rgba(107,203,119,0.08)', icon: '💰', label: 'Dhana Yoga',         labelHi: 'धन योग'            },
  'Special Yoga':       { color: '#74B9FF', bg: 'rgba(116,185,255,0.08)', icon: '✨', label: 'Special Yoga',       labelHi: 'विशेष योग'         },
  'Dosha':              { color: '#FF6B6B', bg: 'rgba(255,107,107,0.08)', icon: '⚠️', label: 'Dosha',              labelHi: 'दोष'               },
};

const STRENGTH_CONFIG = {
  'Very Strong':  { pct: 95, color: '#6BCB77', label: 'Very Strong',  labelHi: 'अत्यंत प्रबल' },
  'Strong':       { pct: 72, color: '#74B9FF', label: 'Strong',        labelHi: 'प्रबल'        },
  'Moderate':     { pct: 48, color: '#FFD93D', label: 'Moderate',      labelHi: 'मध्यम'        },
  'Challenging':  { pct: 28, color: '#FF9F43', label: 'Challenging',   labelHi: 'चुनौतीपूर्ण' },
};

// ── Hero yoga-type explainer cards ───────────────────────────────────────────
const YOGA_TYPES = [
  { icon: '🔱', title: 'Raja Yogas',             titleHi: 'राजयोग',          color: '#C9A84C', desc: 'Status & Power — formed via Kendra + Trikona lord connections.',      descHi: 'सत्ता और प्रभाव — केंद्र और त्रिकोण भावेशों के संयोग से बनता है।'     },
  { icon: '💰', title: 'Dhana Yogas',             titleHi: 'धनयोग',           color: '#6BCB77', desc: 'Wealth Accumulation — 2nd, 5th, 9th, 11th house lord linkages.',      descHi: 'धन संचय — द्वितीय, पंचम, नवम और एकादश भावेशों की युति से।'           },
  { icon: '👑', title: 'Pancha Mahapurusha',      titleHi: 'पंच महापुरुष',   color: '#FFD93D', desc: 'Exceptional Traits — Mars/Mercury/Jupiter/Venus/Saturn in Kendra.',   descHi: 'असाधारण व्यक्तित्व — पाँच ग्रह केंद्र में स्वगृही या उच्च राशि में।' },
  { icon: '⚡', title: 'Vipreet Raja Yoga',       titleHi: 'विपरीत राजयोग',  color: '#A78BFA', desc: 'Triumph Through Adversity — Dusthana lords placed in Dusthana.',      descHi: 'विपरीत में विजय — 6/8/12 भावेश का दूसरे दुःस्थान में स्थान।'         },
];

// ── 4 Dimensions (from doc) ──────────────────────────────────────────────────
const DIMENSIONS_EN = [
  { icon: '🔱', title: 'Material Elevation (Raja Yoga)',          desc: 'Gauges your capacity for leadership, social influence, and structural authority.' },
  { icon: '💎', title: 'Financial Intelligence (Dhana Yoga)',      desc: 'Maps your channels of wealth generation, asset accumulation, and resource management.' },
  { icon: '🌟', title: 'Internal Architecture (Mahapurusha Yoga)', desc: 'Identifies which element manifests as an extraordinary personality trait within you.' },
  { icon: '⚡', title: 'Alchemical Resilience (Vipreet Raja Yoga)', desc: 'Tracks your innate ability to turn crises and obstacles into massive personal victories.' },
];
const DIMENSIONS_HI = [
  { icon: '🔱', title: 'भौतिक उत्थान (राजयोग)',           desc: 'यह समाज में आपके नेतृत्व, सामाजिक प्रभाव और प्रशासनिक अधिकार प्राप्त करने की क्षमता को मापता है।' },
  { icon: '💎', title: 'वित्तीय बुद्धिमत्ता (धनयोग)',     desc: 'यह आपके जीवन में धन आगमन के स्रोतों, संपत्ति संचय और वित्तीय संसाधनों के प्रबंधन को दर्शाता है।' },
  { icon: '🌟', title: 'व्यक्तित्व संरचना (महापुरुष योग)', desc: 'यह पहचान करता है कि कौन सा तत्व आपके भीतर असाधारण मानवीय गुण के रूप में प्रकट हो रहा है।'      },
  { icon: '⚡', title: 'विपरीत विजय (विपरीत राजयोग)',      desc: 'यह संकटों और बाधाओं को बड़ी व्यक्तिगत जीत में बदलने की आपकी जन्मजात क्षमता को दर्शाता है।'       },
];

// ── Strength bar component ────────────────────────────────────────────────────
function StrengthBar({ strength, lang }) {
  const cfg = STRENGTH_CONFIG[strength] || STRENGTH_CONFIG['Moderate'];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{lang === 'hi' ? 'योग शक्ति' : 'Yoga Strength'}</span>
        <span style={{ color: cfg.color }} className="font-semibold">
          {lang === 'hi' ? cfg.labelHi : cfg.label}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${cfg.pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
        />
      </div>
    </div>
  );
}

// ── Individual yoga card ─────────────────────────────────────────────────────
function YogaCard({ yoga, defaultOpen, lang }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const cat = CATEGORY_META[yoga.category] || CATEGORY_META['Special Yoga'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: cat.color + '30', background: cat.bg }}
    >
      {/* Header row */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-5 text-left hover:bg-white/5 transition-colors">
        <span className="text-2xl flex-shrink-0 mt-0.5">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-serif text-gold-300 text-base font-semibold">{yoga.name}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
              style={{ color: cat.color, borderColor: cat.color + '40', background: cat.color + '15' }}>
              {lang === 'hi' ? cat.labelHi : cat.label}
            </span>
          </div>
          <StrengthBar strength={yoga.strength} lang={lang} />
          <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">{yoga.description}</p>
        </div>
        <span className="text-gold-500 flex-shrink-0 mt-1.5">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 border-t grid md:grid-cols-2 gap-4" style={{ borderColor: cat.color + '20' }}>
              {/* Left: Effects */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: cat.color }}>
                  {lang === 'hi' ? '⚡ प्रभाव एवं फल' : '⚡ Effects & Manifestation'}
                </p>
                <p className="text-gray-200 text-sm leading-relaxed">{yoga.effects}</p>
              </div>
              {/* Right: Remedies */}
              {yoga.remedies?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 mb-2">
                    {lang === 'hi' ? '🙏 उपाय' : '🙏 Remedies'}
                  </p>
                  <ul className="space-y-1.5">
                    {yoga.remedies.map((r, i) => (
                      <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Category score bar ────────────────────────────────────────────────────────
function CategoryMeter({ label, icon, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-300">
          <span>{icon}</span> {label}
        </span>
        <span style={{ color }} className="font-bold">{count}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function YogaFinderPage() {
  const { user } = useAuth();
  const [form, setForm]   = useState({ dob: '', birth_time: '12:00', place: '', lat: '', lng: '', timezone: '5.5', name: '' });
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lang, setLang]   = useState('en');   // 'en' | 'hi'
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dob) return toast.error('Please enter date of birth');
    setLoading(true);
    setData(null);
    try {
      const r = await yogaApi.analyse({
        dob: form.dob, birth_time: form.birth_time,
        lat: parseFloat(form.lat) || 22.57,
        lng: parseFloat(form.lng) || 88.36,
        timezone: parseFloat(form.timezone) || 5.5,
        name: form.name,
      });
      setData(r.data);
      setSaved(false);
      setActiveCategory('All');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const categories = data
    ? ['All', ...Object.keys(CATEGORY_META).filter(c => data.yogas.some(y => y.category === c))]
    : [];

  const filtered = data?.yogas.filter(y => activeCategory === 'All' || y.category === activeCategory) || [];

  const DIMS = lang === 'hi' ? DIMENSIONS_HI : DIMENSIONS_EN;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-28">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-gold-500/60 text-xs uppercase tracking-[0.28em] mb-3">Vedic Birth Chart Analysis</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-2" style={{ textShadow: '0 0 40px rgba(201,168,76,0.4)' }}>
            ग्रह योग खोजक
          </h1>
          <p className="text-white/80 text-xl font-light mb-3">Planetary Yoga Finder</p>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            A Yoga in Vedic Astrology is a specific planetary combination that alters your birth chart — producing life-altering breakthroughs in power, wealth, personality, and resilience.
          </p>
        </motion.div>

        {/* ── 4 Yoga-type explainer cards ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {YOGA_TYPES.map((yt, i) => (
            <div key={i} className="rounded-xl border p-4 text-center"
              style={{ borderColor: yt.color + '30', background: yt.color + '08' }}>
              <div className="text-3xl mb-2">{yt.icon}</div>
              <div className="font-serif text-xs font-semibold mb-1" style={{ color: yt.color }}>
                {lang === 'hi' ? yt.titleHi : yt.title}
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                {lang === 'hi' ? yt.descHi : yt.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Birth Form ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-cosmic rounded-2xl p-6 border border-gold-600/20 mb-8">
          <h2 className="font-serif text-gold-400 text-lg mb-5 flex items-center gap-2">
            <span>🪐</span>
            {lang === 'hi' ? 'अपना जन्म विवरण दर्ज करें' : 'Enter Your Birth Details'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">
                  {lang === 'hi' ? 'पूरा नाम (वैकल्पिक)' : 'Full Name (optional)'}
                </label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder={lang === 'hi' ? 'आपका नाम' : 'Your name'}
                  className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">
                  {lang === 'hi' ? 'जन्म तिथि *' : 'Date of Birth *'}
                </label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} required
                  className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">
                  {lang === 'hi' ? 'जन्म समय' : 'Birth Time'}
                </label>
                <input type="time" value={form.birth_time} onChange={e => set('birth_time', e.target.value)}
                  className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50" />
              </div>
            </div>
            <BirthPlacePicker
              label={lang === 'hi' ? 'जन्म स्थान (सटीक भाव हेतु)' : 'Birth Place (optional — for precise house positions)'}
              value={form.place}
              onChange={p => setForm(f => ({ ...f, place: p.place, lat: p.lat, lng: p.lng, timezone: p.timezone || '5.5' }))}
            />
            <button type="submit" disabled={loading}
              className="w-full btn-gold py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" />{lang === 'hi' ? 'कुंडली विश्लेषण हो रहा है...' : 'Analysing Birth Chart...'}</>
                : <>{lang === 'hi' ? '✦ मेरे ग्रह योग खोजें' : '✦ Find My Planetary Yogas'}</>}
            </button>
          </form>
        </motion.div>

        {/* ── Results ───────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Loading */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader className="w-10 h-10 text-gold-400 animate-spin" />
              <p className="text-gray-400 text-sm">
                {lang === 'hi' ? 'ग्रह योगों की पहचान की जा रही है...' : 'Scanning birth chart for planetary yogas...'}
              </p>
            </motion.div>
          )}

          {/* Full report */}
          {data && !loading && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">

              {/* ── Report header bar: language toggle + save ── */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Language toggle */}
                <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-full border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 transition-all">
                  <Languages className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
                </button>

                {/* Save */}
                {user && (
                  <button onClick={async () => {
                    if (saved) return;
                    setSaving(true);
                    try {
                      await historyApi.save({
                        type: 'yoga',
                        title: `${form.name || data.lagna + ' Lagna'} — Planetary Yogas`,
                        meta: { dob: form.dob, birth_place: form.place, lagna: data.lagna, moon_sign: data.moon_sign, total_yogas: data.summary.total, auspicious: data.summary.auspicious },
                      });
                      setSaved(true);
                      toast.success('Yoga analysis saved to History!');
                    } catch { toast.error('Could not save to history'); }
                    finally { setSaving(false); }
                  }} disabled={saving || saved}
                    className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border transition-all
                      ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                    {saved ? (lang === 'hi' ? 'इतिहास में सहेजा' : 'Saved to History') : saving ? (lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving…') : (lang === 'hi' ? 'इतिहास में सहेजें' : 'Save to History')}
                  </button>
                )}
              </div>

              {/* ── Report title ── */}
              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/20 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 65%)' }} />
                <div className="relative z-10">
                  <p className="text-gold-500/60 text-[10px] uppercase tracking-[0.25em] mb-2">🌌</p>
                  <h2 className="font-serif text-gold-400 text-xl md:text-2xl mb-1">
                    {lang === 'hi'
                      ? 'मुख्य ब्रह्मांडीय संरेखण: आपके ग्रह योग'
                      : 'Core Cosmic Alignments: Your Planetary Yogas'}
                  </h2>
                  {form.name && (
                    <p className="text-gray-300 text-sm mb-3">
                      {lang === 'hi' ? `${form.name} का विश्लेषण` : `Analysis for ${form.name}`}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                    {lang === 'hi'
                      ? 'आपकी जन्म कुंडली केवल यादृच्छिक राशियों में बैठे अलग-अलग ग्रहों का संग्रह नहीं है; यह ब्रह्मांडीय ज्यामिति का एक जटिल ताना-बाना है। जब ग्रह विशिष्ट गणितीय कोण, युति या भाव-परिवर्तन करते हैं, तो वे \'योग\' को जाग्रत करते हैं।'
                      : 'Your birth chart is more than just individual planets in random signs; it is a complex grid of cosmic geometry. When planets form specific mathematical angles, configurations, or house exchanges, they ignite Yogas — latent energetic blueprints determining your peaks of success.'}
                  </p>
                </div>
              </div>

              {/* ── Stats grid ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { val: data.summary.total,     label: lang === 'hi' ? 'कुल योग' : 'Total Yogas',       color: '#C9A84C', border: 'border-gold-600/20'   },
                  { val: data.summary.auspicious, label: lang === 'hi' ? 'शुभ योग' : 'Auspicious Yogas', color: '#6BCB77', border: 'border-green-600/25'  },
                  { val: data.summary.doshas,     label: lang === 'hi' ? 'दोष'     : 'Doshas',            color: '#FF6B6B', border: 'border-red-600/20'    },
                  { val: data.lagna,              label: lang === 'hi' ? `चंद्र: ${data.moon_sign}` : `Moon: ${data.moon_sign}`, color: '#74B9FF', border: 'border-blue-600/20' },
                ].map((s, i) => (
                  <div key={i} className={`card-cosmic rounded-xl p-4 border ${s.border} text-center`}>
                    <p className="text-2xl font-bold font-serif" style={{ color: s.color }}>{s.val}</p>
                    <p className="text-gray-500 text-[11px] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Category distribution meters ── */}
              {data.summary.total > 0 && (
                <div className="card-cosmic rounded-2xl p-5 border border-gold-600/15">
                  <p className="text-gold-400/70 text-[11px] uppercase tracking-widest mb-4">
                    {lang === 'hi' ? '📊 योग वर्गीकरण' : '📊 Yoga Distribution'}
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(CATEGORY_META).map(([key, meta]) => {
                      const count = data.summary.by_category?.[key] || 0;
                      if (count === 0) return null;
                      return (
                        <CategoryMeter key={key}
                          label={lang === 'hi' ? meta.labelHi : meta.label}
                          icon={meta.icon} count={count}
                          total={data.summary.total} color={meta.color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 4 Key Dimensions panel ── */}
              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/15">
                <p className="text-gold-400 font-serif text-lg mb-1">
                  {lang === 'hi' ? '🔭 योग खोजक द्वारा मूल्यांकित मुख्य आयाम' : '🔭 Key Dimensions Evaluated'}
                </p>
                <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                  {lang === 'hi'
                    ? 'यह विश्लेषण आपके जीवन के चार प्रमुख क्षेत्रों में ग्रहों की स्थिति का परीक्षण करता है।'
                    : 'This analysis examines planetary configurations across four core life dimensions.'}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {DIMS.map((d, i) => (
                    <div key={i} className="flex gap-3 bg-white/5 rounded-xl p-4">
                      <span className="text-xl flex-shrink-0">{d.icon}</span>
                      <div>
                        <p className="text-gold-400 text-xs font-semibold mb-1">{d.title}</p>
                        <p className="text-gray-400 text-xs leading-relaxed">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Category filter tabs ── */}
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const meta = cat === 'All' ? { color: '#C9A84C', icon: '🔮', labelHi: 'सभी' } : CATEGORY_META[cat];
                    const isActive = activeCategory === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all font-medium"
                        style={{
                          borderColor: isActive ? meta?.color         : 'rgba(201,168,76,0.2)',
                          background:  isActive ? meta?.color + '20' : 'transparent',
                          color:       isActive ? meta?.color         : '#9ca3af',
                        }}>
                        <span>{meta?.icon}</span>
                        {lang === 'hi' ? (cat === 'All' ? 'सभी' : meta?.labelHi) : cat}
                        {cat !== 'All' && ` (${data.yogas.filter(y => y.category === cat).length})`}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Yoga cards ── */}
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-3">🔍</p>
                  <p>{lang === 'hi' ? 'इस श्रेणी में कोई योग नहीं मिला।' : 'No yogas found in this category.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((y, i) => <YogaCard key={i} yoga={y} defaultOpen={i === 0} lang={lang} />)}
                </div>
              )}

              {/* Empty chart */}
              {data.yogas.length === 0 && (
                <div className="card-cosmic rounded-2xl p-10 border border-gold-600/20 text-center">
                  <p className="text-5xl mb-4">🌟</p>
                  <p className="text-gold-400 font-serif text-xl mb-3">
                    {lang === 'hi' ? 'संतुलित कुंडली' : 'A Balanced Chart'}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                    {lang === 'hi'
                      ? 'इस जन्म कुंडली में कोई प्रमुख योग या दोष नहीं मिला। यह एक संतुलित और स्थिर कुंडली का संकेत है।'
                      : 'No major yogas or doshas detected. This indicates a balanced, steady chart — success comes through consistent effort rather than dramatic highs.'}
                  </p>
                </div>
              )}

              {/* ── Disclaimer / strength note ── */}
              <div className="rounded-2xl border border-gold-600/15 bg-gold-500/5 p-5">
                <p className="text-gold-400 text-xs font-semibold mb-2">
                  {lang === 'hi' ? '📌 मूल्यांकन मार्गदर्शिका' : '📌 System Note on Strength'}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {lang === 'hi'
                    ? 'कुंडली में खोजे गए किसी भी योग की पूर्ण सफलता ग्रहों के अस्त होने (Combustion), ग्रह युद्ध (Graha Yuddha), और उनके षडबल (Shadbala) पर निर्भर करती है। योग एक मजबूत पाइपलाइन की तरह है, लेकिन आपकी सक्रिय महादशा/अंतर्दशा उस वाल्व की तरह काम करती है जो सही समय पर इस ऊर्जा को आपके जीवन में प्रवाहित करती है।'
                    : 'The ultimate manifestation of any found Yoga is highly dependent on planetary combustion (Asta), planetary warfare (Graha Yuddha), and developmental strength (Shadbala). A yoga provides the pipeline; the operating Dasha (planetary period) acts as the valve that turns the energy on.'}
                </p>
              </div>

            </motion.div>
          )}

          {/* Empty state */}
          {!data && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <div className="text-7xl mb-5">🔯</div>
              <p className="text-gray-300 text-lg font-serif mb-2">
                {lang === 'hi' ? 'अपने ग्रह योगों की खोज करें' : 'Discover Your Planetary Yogas'}
              </p>
              <p className="text-gray-500 text-sm mb-8">
                {lang === 'hi'
                  ? 'जन्म विवरण दर्ज करें और 25+ योगों का विश्लेषण पाएं'
                  : 'Enter birth details to analyse Gaja Kesari, Ruchaka, Hamsa, Kaal Sarp, Neecha Bhanga and 20+ more'}
              </p>
              {/* Cosmic alignment diagram */}
              <div className="max-w-sm mx-auto card-cosmic rounded-2xl p-6 border border-gold-600/15 font-mono text-xs text-left">
                <p className="text-gold-400 mb-3 text-center font-serif not-italic text-sm">[ Kendra Lord ] + [ Trikona Lord ]</p>
                <p className="text-gray-500 text-center mb-3">(Action/Structure)  ·  (Luck/Divine Grace)</p>
                <p className="text-gold-600 text-center mb-3">↘         ↙</p>
                <p className="text-gold-400 text-center font-serif not-italic">[ Powerful Raja Yoga ]</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
