import React, { useState, useEffect, useRef } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, Clock, Shield, Users, Zap, Star, CheckCircle, ChevronDown } from 'lucide-react';
import ScrollDatePicker from '../components/ScrollDatePicker';
import toast from 'react-hot-toast';
import { astrologerApplications, content as contentApi } from '../api';

function ApplicationSuccessScreen({ name, email, phone }) {
  const [query, setQuery]     = useState('');
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError]   = useState('');

  async function checkStatus(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setChecking(true);
    setStatusResult(null);
    setStatusError('');
    try {
      const isPhone = /^\d/.test(query.trim());
      const params = isPhone ? { phone: query.trim() } : { email: query.trim() };
      const res = await astrologerApplications.checkStatus(params);
      setStatusResult(res.data);
    } catch (err) {
      setStatusError(err.response?.data?.error || 'No application found with these details');
    } finally {
      setChecking(false);
    }
  }

  const statusColors = {
    pending:  { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', label: 'Under Review' },
    approved: { bg: 'bg-green-500/10 border-green-500/30',  text: 'text-green-400',  label: 'Approved ✓' },
    rejected: { bg: 'bg-red-500/10 border-red-500/30',      text: 'text-red-400',    label: 'Not Selected' },
  };

  return (
    <div className="min-h-screen bg-cosmic-950 pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto space-y-6">

        {/* Success card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="card-cosmic p-8 text-center border border-green-500/30">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-serif text-2xl text-green-400 mb-3">Application Submitted!</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Thank you <span className="text-gold-400 font-medium">{name}</span>! Our team will review your
            application and contact you at <span className="text-gold-400">{email}</span> within 3–5 business days.
          </p>
          <div className="text-left bg-cosmic-900/60 border border-gold-600/15 rounded-xl p-4 mb-6">
            <p className="text-gold-400 text-xs font-semibold mb-2">If approved</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              You will receive an email with a link to your <strong className="text-gray-300">Pandit Portal</strong> and
              a 4-digit PIN. Sign in with your mobile number and PIN to go online and start receiving seekers.
            </p>
          </div>
          <Link to="/astrologers" className="btn-gold px-6 py-2.5 text-sm inline-block">Browse Astrologers</Link>
        </motion.div>

        {/* Status checker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card-cosmic p-6 border border-gold-600/15">
          <h3 className="text-gold-400 font-semibold text-sm mb-1">Check Application Status</h3>
          <p className="text-gray-500 text-xs mb-4">Come back any time and enter your mobile number or email to see where your application stands.</p>

          <form onSubmit={checkStatus} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Mobile number or email"
              className="input-cosmic flex-1 text-sm"
              defaultValue={phone || email}
            />
            <button type="submit" disabled={checking}
              className="btn-gold px-4 py-2 text-xs font-semibold shrink-0 disabled:opacity-60">
              {checking ? '…' : 'Check'}
            </button>
          </form>

          {statusError && (
            <p className="text-red-400 text-xs mt-3">{statusError}</p>
          )}

          {statusResult && (() => {
            const sc = statusColors[statusResult.status] || statusColors.pending;
            return (
              <div className={`mt-4 rounded-xl border p-4 ${sc.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm font-medium">{statusResult.name}</span>
                  <span className={`text-xs font-bold uppercase tracking-wide ${sc.text}`}>{sc.label}</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Submitted {new Date(statusResult.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {statusResult.status === 'pending' && (
                  <p className="text-yellow-300/70 text-xs mt-2">Our team typically responds within 3–5 business days. Check back soon!</p>
                )}
                {statusResult.status === 'approved' && (
                  <p className="text-green-300/80 text-xs mt-2">Check your email for your Pandit Portal PIN. If you didn't receive it, contact support.</p>
                )}
                {statusResult.status === 'rejected' && statusResult.rejection_reason && (
                  <p className="text-gray-400 text-xs mt-2">Reason: {statusResult.rejection_reason}</p>
                )}
              </div>
            );
          })()}
        </motion.div>

        <div className="text-center">
          <Link to="/" className="text-gold-600 hover:text-gold-400 text-xs transition-colors">← Back to AstroVyoma</Link>
        </div>
      </div>
    </div>
  );
}

const STEPS = ['Personal Info', 'Skills & Languages', 'Education', 'Profile & Pricing', 'About You'];

const SKILLS = [
  'Vedic Astrology', 'KP System', 'Lal Kitab', 'Nadi Astrology', 'Tarot',
  'Numerology', 'Palmistry', 'Vastu Shastra', 'Prashana', 'Horary',
  'Gemology', 'Face Reading', 'Western Astrology', 'Life Coach',
  'Muhurta', 'Kundali Reading', 'Remedial Astrology', 'Loshu Grid',
];

const LANGUAGES = [
  'Hindi', 'English', 'Sanskrit', 'Tamil', 'Telugu', 'Marathi',
  'Gujarati', 'Bengali', 'Punjabi', 'Malayalam', 'Kannada', 'Odia',
  'Assamese', 'Marwari', 'Urdu', 'Sindhi', 'Bhojpuri', 'Nepali',
  'Maithili', 'Konkani', 'Rajasthani',
];

const HOURS = ['1–2 hrs', '2–4 hrs', '4–6 hrs', '6–8 hrs', '8+ hrs'];

const EMPTY = {
  name: '', dob: '', gender: '', email: '', phone: '', location: '',
  skills: [], languages: [],
  astrology_learned_from: '', highest_qualification: '', degree: '', college: '',
  other_platform: null, fulltime_job: null, daily_hours: '',
  photo_url: '', youtube_channel: '', linkedin_url: '',
  experience_years: '', price_per_min: 30,
  bio: '', why_join: '',
};

const STARS = Array.from({ length: 18 }, (_, i) => ({
  w: (((i * 7 + 3) % 3) + 1),
  h: (((i * 11 + 5) % 3) + 1),
  left: ((i * 37 + 13) % 97),
  top: ((i * 53 + 7) % 95),
  dur: 2 + (i % 4),
  delay: (i % 5) * 0.6,
}));

const BENEFITS = [
  { icon: IndianRupee, title: 'Highest Payout', sub: 'Earn 60% of every consultation — the best split in the industry', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
  { icon: Shield,      title: 'No Joining Fee', sub: 'Zero registration cost. No monthly subscription. No hidden charges', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Clock,       title: 'Flexible Hours', sub: 'Go live when you want. Take breaks freely. Your schedule, your rules', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Zap,         title: 'Instant Activation', sub: 'Once approved, your portal goes live the same day — start earning immediately', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: Users,       title: 'Real Seekers', sub: 'Verified clients. No bots, no fake sessions. Genuine spiritual seekers', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { icon: Star,        title: 'Weekly Payouts', sub: 'Earnings transferred every Monday. Track every rupee in your portal', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

const HOW_STEPS = [
  { n: '01', title: 'Apply in 5 minutes', body: 'Fill in your profile, skills, and set your rate. No documents needed upfront.' },
  { n: '02', title: 'We review & approve', body: 'Our team calls you within 3–5 days. We check credentials and match your speciality.' },
  { n: '03', title: 'Go live & earn', body: 'Get your Pandit Portal login. Toggle online and start receiving seekers instantly.' },
];

export default function JoinAsAstrologerPage() {
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [share, setShare]       = useState(60);
  const [minsPerDay, setMinsPerDay] = useState(30);
  const [ratePerMin, setRatePerMin] = useState(30);
  const formRef = useRef(null);

  useEffect(() => {
    contentApi.settings()
      .then(r => { const s = r.data?.settings?.astrologerSharePercent; if (Number.isFinite(s)) setShare(s); })
      .catch(() => {});
  }, []);

  const weeklyEarning  = Math.round(minsPerDay * ratePerMin * (share / 100) * 7);
  const monthlyEarning = Math.round(minsPerDay * ratePerMin * (share / 100) * 30);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function toggleTag(key, val) {
    setForm(f => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validateStep(s) {
    const errs = {};
    if (s === 0) {
      if (!form.name.trim()) errs.name = 'Full name is required';
      if (!form.dob) errs.dob = 'Date of birth is required';
      if (!form.gender) errs.gender = 'Please select gender';
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.phone.trim()) errs.phone = 'Phone is required';
      if (!form.location.trim()) errs.location = 'City, State, Country is required';
    }
    if (s === 1) {
      if (form.skills.length === 0) errs.skills = 'Select at least one skill';
      if (form.languages.length === 0) errs.languages = 'Select at least one language';
    }
    if (s === 2) {
      if (!form.astrology_learned_from.trim()) errs.astrology_learned_from = 'This field is required';
      if (!form.highest_qualification.trim()) errs.highest_qualification = 'This field is required';
      if (!form.daily_hours) errs.daily_hours = 'Please select daily hours';
      if (form.other_platform === null) errs.other_platform = 'Please select an option';
      if (form.fulltime_job === null) errs.fulltime_job = 'Please select an option';
    }
    if (s === 3) {
      if (!form.experience_years) errs.experience_years = 'Years of experience is required';
      else if (parseInt(form.experience_years) < 1) errs.experience_years = 'Must be at least 1 year';
      if (!form.price_per_min || parseFloat(form.price_per_min) < 10) errs.price_per_min = 'Minimum ₹10 per minute';
    }
    if (s === 4) {
      if (!form.bio.trim()) errs.bio = 'Bio is required';
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(4);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await astrologerApplications.submit({
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        dob: form.dob || undefined, gender: form.gender || undefined,
        location: form.location.trim() || undefined,
        skills: form.skills.join(', ') || undefined,
        languages: form.languages.join(', ') || undefined,
        astrology_learned_from: form.astrology_learned_from.trim() || undefined,
        highest_qualification: form.highest_qualification.trim() || undefined,
        degree: form.degree.trim() || undefined, college: form.college.trim() || undefined,
        other_platform: form.other_platform, fulltime_job: form.fulltime_job,
        daily_hours: form.daily_hours || undefined,
        photo_url: form.photo_url.trim() || undefined,
        youtube_channel: form.youtube_channel.trim() || undefined,
        linkedin_url: form.linkedin_url.trim() || undefined,
        experience_years: parseInt(form.experience_years),
        price_per_min: parseFloat(form.price_per_min) || 30,
        bio: form.bio.trim(), why_join: form.why_join.trim() || undefined,
        specialties: form.skills.join(', ') || undefined,
      });
      setSubmitted(true);
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inp = (key) =>
    `w-full bg-cosmic-900 border ${errors[key] ? 'border-red-500/60' : 'border-gold-600/20'} rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-gray-600`;
  const ta = (key) =>
    `w-full bg-cosmic-900 border ${errors[key] ? 'border-red-500/60' : 'border-gold-600/20'} rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-gray-600 resize-none`;

  function TagGrid({ label, items, selected, onToggle, error, hint }) {
    return (
      <div>
        <label className="text-gray-300 text-xs block mb-2">{label}</label>
        {hint && <p className="text-gray-500 text-xs mb-2">{hint}</p>}
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <button key={item} type="button" onClick={() => onToggle(item)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                selected.includes(item)
                  ? 'bg-gold-500 border-gold-500 text-cosmic-950 font-semibold'
                  : 'bg-cosmic-900 border-gold-600/20 text-gray-400 hover:border-gold-500/50'
              }`}>
              {selected.includes(item) ? '✓ ' : '+ '}{item}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    );
  }

  function YesNo({ label, value, onChange, error }) {
    return (
      <div>
        <label className="text-gray-300 text-xs block mb-2">{label}</label>
        <div className="flex gap-3">
          {[true, false].map(opt => (
            <button key={String(opt)} type="button" onClick={() => onChange(opt)}
              className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                value === opt
                  ? 'bg-gold-500 border-gold-500 text-cosmic-950 font-semibold'
                  : 'bg-cosmic-900 border-gold-600/20 text-gray-400 hover:border-gold-500/40'
              }`}>
              {opt ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  /* ── Success screen ── */
  if (submitted) {
    return <ApplicationSuccessScreen name={form.name} email={form.email} phone={form.phone} />;
  }

  return (
    <div className="min-h-screen bg-cosmic-950">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden pt-20 pb-20 px-4"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(139,92,246,0.35) 0%, rgba(201,168,76,0.08) 40%, transparent 70%), #0d0820' }}>

        {/* Floating stars */}
        {STARS.map((s, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-gold-400/30"
            style={{ width: s.w, height: s.h, left: `${s.left}%`, top: `${s.top}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
          />
        ))}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Om glyph */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-7xl font-serif mb-4 select-none"
            style={{ color: '#c9a84c', textShadow: '0 0 60px rgba(201,168,76,0.5), 0 0 120px rgba(139,92,246,0.3)' }}>
            ॐ
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs text-purple-300/70 uppercase tracking-[0.3em] mb-4">
            AstroVyoma Pandit Portal
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="font-serif text-4xl md:text-6xl text-gold-400 leading-tight mb-4">
            Share Your Divine Knowledge.<br />
            <span className="text-white">Earn on Your Terms.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            India's new sacred platform for Vedic astrologers. No middlemen. No locks. Just you, your wisdom, and seekers who need you.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="btn-gold px-8 py-4 text-base font-semibold rounded-full shadow-lg shadow-gold-500/20">
              Apply Now — It's Free
            </button>
            <Link to="/astrologer-kit"
              className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-1">
              Read the Astrologer Kit <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-gray-500">
            {['✦ Free to join', '✦ Weekly payouts every Monday', '✦ Your profile goes live within 24 hrs of approval', '✦ Cancel anytime'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          BENEFITS GRID
      ══════════════════════════════════════ */}
      <div className="py-16 px-4" style={{ background: '#110d2a', position: 'relative', zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c' }}>Why Astrologers Choose Us</p>
            <h2 className="font-serif text-3xl" style={{ color: '#e8d48b' }}>Built for Serious Pandits</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <b.icon style={{ width: 20, height: 20, color: '#c9a84c' }} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 15, color: '#e8d48b', marginBottom: 8 }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <div className="py-16 px-4" style={{ background: '#0d0820', position: 'relative', zIndex: 1 }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c' }}>Simple & Fast</p>
            <h2 className="font-serif text-3xl" style={{ color: '#e8d48b' }}>How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className="relative text-center px-4">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] right-0 h-px" style={{ borderTop: '1px dashed rgba(201,168,76,0.35)' }} />
                )}
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.6)', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 700, color: '#c9a84c' }}>{s.n}</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 14, color: '#e5e7eb', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          EARNINGS CALCULATOR
      ══════════════════════════════════════ */}
      <div className="py-16 px-4" style={{ background: '#110d2a', position: 'relative', zIndex: 1 }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c' }}>Earnings Potential</p>
            <h2 className="font-serif text-3xl" style={{ color: '#e8d48b' }}>See What You Could Earn</h2>
          </div>

          <div style={{ border: '1px solid rgba(201,168,76,0.4)', borderRadius: 24, background: 'rgba(201,168,76,0.06)', padding: 32 }}>
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between text-xs mb-2" style={{ color: '#9ca3af' }}>
                  <span>Consulting minutes per day</span>
                  <span style={{ color: '#c9a84c', fontWeight: 600 }}>{minsPerDay} min</span>
                </div>
                <input type="range" min={5} max={120} step={5} value={minsPerDay}
                  onChange={e => setMinsPerDay(Number(e.target.value))}
                  className="w-full cursor-pointer accent-yellow-500" />
                <div className="flex justify-between mt-1" style={{ fontSize: 11, color: '#4b5563' }}>
                  <span>5 min</span><span>120 min</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2" style={{ color: '#9ca3af' }}>
                  <span>Your rate per minute</span>
                  <span style={{ color: '#c9a84c', fontWeight: 600 }}>₹{ratePerMin}/min</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={ratePerMin}
                  onChange={e => setRatePerMin(Number(e.target.value))}
                  className="w-full cursor-pointer accent-yellow-500" />
                <div className="flex justify-between mt-1" style={{ fontSize: 11, color: '#4b5563' }}>
                  <span>₹10</span><span>₹100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ borderRadius: 16, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Weekly Earnings</p>
                <p style={{ fontFamily: 'serif', fontSize: 28, color: '#c9a84c', fontWeight: 700 }}>₹{weeklyEarning.toLocaleString('en-IN')}</p>
              </div>
              <div style={{ borderRadius: 16, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.4)', padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Monthly Earnings</p>
                <p style={{ fontFamily: 'serif', fontSize: 28, color: '#c4b5fd', fontWeight: 700 }}>₹{monthlyEarning.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <p style={{ fontSize: 11, color: '#4b5563', textAlign: 'center', marginTop: 12 }}>
              Based on {share}% astrologer share · ₹{ratePerMin}/min · {minsPerDay} min/day
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          APPLICATION FORM
      ══════════════════════════════════════ */}
      <div ref={formRef} className="py-16 px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 60%)', position: 'relative', zIndex: 1 }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-gold-600 uppercase tracking-widest mb-2">Join the Founding Panel</p>
            <h2 className="font-serif text-3xl text-gold-400">Start Your Application</h2>
            <p className="text-gray-500 text-sm mt-2">Takes about 5 minutes · Completely free</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8 overflow-x-auto pb-1">
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gold-500 text-cosmic-950' : 'bg-cosmic-800 text-gray-500'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${i === step ? 'text-gold-400' : 'text-gray-600'}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors min-w-[12px] ${i < step ? 'bg-green-500/50' : 'bg-cosmic-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="card-cosmic p-6 md:p-8 border border-gold-600/15">

            <h2 className="font-serif text-xl text-gold-400 mb-6">Step {step + 1}: {STEPS[step]}</h2>

            <form onSubmit={step === 4 ? handleSubmit : e => { e.preventDefault(); handleNext(); }}>

              {/* ── Step 0: Personal Info ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Full Name (नाम) *</label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Your full name" className={inp('name')} />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Date of Birth (जन्म तिथि) *</label>
                    <ScrollDatePicker value={form.dob} onChange={v => set('dob', v)}
                      max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]} />
                    {errors.dob && <p className="text-red-400 text-xs mt-1">{errors.dob}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-2">Gender (लिंग) *</label>
                    <div className="flex gap-3">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button key={g} type="button" onClick={() => set('gender', g)}
                          className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                            form.gender === g
                              ? 'bg-gold-500 border-gold-500 text-cosmic-950 font-semibold'
                              : 'bg-cosmic-900 border-gold-600/20 text-gray-400 hover:border-gold-500/40'
                          }`}>
                          {g}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Email Address *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="you@example.com" className={inp('email')} />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Phone Number *</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210" className={inp('phone')} />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Current City, State, Country *</label>
                    <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                      placeholder="e.g. Jaipur, Rajasthan, India" className={inp('location')} />
                    {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
                  </div>
                </div>
              )}

              {/* ── Step 1: Skills & Languages ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <TagGrid label="Skills (स्किल) *" hint="Select all that apply — these appear on your public profile"
                    items={SKILLS} selected={form.skills} onToggle={v => toggleTag('skills', v)} error={errors.skills} />
                  <TagGrid label="Languages (भाषाएँ) *" hint="Languages you can consult in"
                    items={LANGUAGES} selected={form.languages} onToggle={v => toggleTag('languages', v)} error={errors.languages} />
                </div>
              )}

              {/* ── Step 2: Education & Availability ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">From where did you learn Astrology? *</label>
                    <input type="text" value={form.astrology_learned_from}
                      onChange={e => set('astrology_learned_from', e.target.value)}
                      placeholder="e.g. Sanskrit Mahavidyalaya, Gurukul, Self-taught"
                      className={inp('astrology_learned_from')} />
                    {errors.astrology_learned_from && <p className="text-red-400 text-xs mt-1">{errors.astrology_learned_from}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Highest Qualification *</label>
                    <input type="text" value={form.highest_qualification}
                      onChange={e => set('highest_qualification', e.target.value)}
                      placeholder="e.g. Jyotish Acharya, M.A. Sanskrit, B.A."
                      className={inp('highest_qualification')} />
                    {errors.highest_qualification && <p className="text-red-400 text-xs mt-1">{errors.highest_qualification}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Degree / Diploma <span className="text-gray-600">(optional)</span></label>
                    <input type="text" value={form.degree} onChange={e => set('degree', e.target.value)}
                      placeholder="e.g. Jyotish Visharad, B.Sc." className={inp('degree')} />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">College / School / University <span className="text-gray-600">(optional)</span></label>
                    <input type="text" value={form.college} onChange={e => set('college', e.target.value)}
                      placeholder="e.g. BHU Varanasi, ICAS" className={inp('college')} />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">How many hours can you contribute daily? *</label>
                    <select value={form.daily_hours} onChange={e => set('daily_hours', e.target.value)}
                      className={inp('daily_hours')}>
                      <option value="">Select hours</option>
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {errors.daily_hours && <p className="text-red-400 text-xs mt-1">{errors.daily_hours}</p>}
                  </div>
                  <YesNo label="Are you working on any other online platform? *"
                    value={form.other_platform} onChange={v => set('other_platform', v)} error={errors.other_platform} />
                  <YesNo label="Are you currently working a full-time job? *"
                    value={form.fulltime_job} onChange={v => set('fulltime_job', v)} error={errors.fulltime_job} />
                </div>
              )}

              {/* ── Step 3: Profile & Pricing ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-xs block mb-2">Profile Photo <span className="text-gray-600">(optional)</span></label>
                    <PhotoUpload
                      value={form.photo_url}
                      onChange={v => set('photo_url', v)}
                      name={form.name}
                      size={112}
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">YouTube Channel <span className="text-gray-600">(optional)</span></label>
                    <input type="url" value={form.youtube_channel} onChange={e => set('youtube_channel', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel" className={inp('youtube_channel')} />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">LinkedIn Profile <span className="text-gray-600">(optional)</span></label>
                    <input type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile" className={inp('linkedin_url')} />
                  </div>
                  <div className="border-t border-gold-600/10 pt-4">
                    <label className="text-gray-300 text-xs block mb-1.5">Years of Experience *</label>
                    <input type="number" min="1" value={form.experience_years}
                      onChange={e => set('experience_years', e.target.value)}
                      placeholder="e.g. 8" className={inp('experience_years')} />
                    {errors.experience_years && <p className="text-red-400 text-xs mt-1">{errors.experience_years}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Preferred Price per Minute (₹) *</label>
                    <input type="number" min="10" value={form.price_per_min}
                      onChange={e => set('price_per_min', e.target.value)}
                      className={inp('price_per_min')} />
                    {errors.price_per_min && <p className="text-red-400 text-xs mt-1">{errors.price_per_min}</p>}
                    <p className="text-gray-600 text-xs mt-1">Platform takes {100 - share}%; you keep {share}%</p>
                  </div>
                </div>
              )}

              {/* ── Step 4: About You ── */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Your Bio *</label>
                    <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={4}
                      placeholder="Tell seekers about yourself, your approach, your tradition, and what makes your readings unique..."
                      className={ta('bio')} />
                    {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio}</p>}
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs block mb-1.5">Why should we choose you? <span className="text-gray-600">(optional)</span></label>
                    <textarea value={form.why_join} onChange={e => set('why_join', e.target.value)} rows={4}
                      placeholder="What makes you the right fit for AstroVyoma? What do seekers gain from your consultations?"
                      className={ta('why_join')} maxLength={1000} />
                    <p className="text-gray-600 text-xs mt-1 text-right">{form.why_join.length}/1000</p>
                  </div>
                  <div className="bg-cosmic-900/40 border border-gold-600/10 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                    <p className="text-gold-400 font-semibold mb-1">Submitting your application</p>
                    By submitting, you confirm that all information is accurate. Our team reviews every application
                    and will contact you within 3–5 business days. Approved astrologers get a Pandit Portal login
                    via email with a 4-digit PIN.
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button type="button" onClick={handleBack} className="btn-outline-gold flex-1 py-3 text-sm">
                    ← Back
                  </button>
                )}
                {step < 4 ? (
                  <button type="submit" className="btn-gold flex-1 py-3 text-sm font-semibold">
                    Continue →
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="btn-gold flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                    {loading && <span className="w-4 h-4 border-2 border-cosmic-950/50 border-t-cosmic-950 rounded-full animate-spin" />}
                    Submit Application
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          FOOTER STRIP
      ══════════════════════════════════════ */}
      <div className="py-10 px-4 text-center border-t border-gold-600/10" style={{ position: 'relative', zIndex: 1 }}>
        <p className="text-gold-400 font-serif text-lg mb-1">ॐ नमः शिवाय</p>
        <p className="text-gray-600 text-xs">AstroVyoma — Connecting seekers with India's finest Vedic astrologers</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link to="/" className="text-gold-600 hover:text-gold-400 text-xs transition-colors">← Back to AstroVyoma</Link>
          <span className="text-gray-700 text-xs">·</span>
          <Link to="/privacy-policy" className="text-gray-600 hover:text-gold-400 text-xs transition-colors">Privacy Policy</Link>
        </div>
      </div>

    </div>
  );
}
