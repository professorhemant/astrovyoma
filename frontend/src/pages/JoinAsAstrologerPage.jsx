import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScrollDatePicker from '../components/ScrollDatePicker';
import toast from 'react-hot-toast';
import { astrologerApplications, content as contentApi } from '../api';

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

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

export default function JoinAsAstrologerPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState(60);
  const photoInputRef = React.useRef(null);

  useEffect(() => {
    contentApi.settings()
      .then(r => { const s = r.data?.settings?.astrologerSharePercent; if (Number.isFinite(s)) setShare(s); })
      .catch(() => {});
  }, []);

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

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) { toast.error('Photo must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => set('photo_url', ev.target.result);
    reader.readAsDataURL(file);
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
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dob: form.dob || undefined,
        gender: form.gender || undefined,
        location: form.location.trim() || undefined,
        skills: form.skills.join(', ') || undefined,
        languages: form.languages.join(', ') || undefined,
        astrology_learned_from: form.astrology_learned_from.trim() || undefined,
        highest_qualification: form.highest_qualification.trim() || undefined,
        degree: form.degree.trim() || undefined,
        college: form.college.trim() || undefined,
        other_platform: form.other_platform,
        fulltime_job: form.fulltime_job,
        daily_hours: form.daily_hours || undefined,
        photo_url: form.photo_url.trim() || undefined,
        youtube_channel: form.youtube_channel.trim() || undefined,
        linkedin_url: form.linkedin_url.trim() || undefined,
        experience_years: parseInt(form.experience_years),
        price_per_min: parseFloat(form.price_per_min) || 30,
        bio: form.bio.trim(),
        why_join: form.why_join.trim() || undefined,
        specialties: form.skills.join(', ') || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit. Please try again.';
      toast.error(msg);
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
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                selected.includes(item)
                  ? 'bg-gold-500 border-gold-500 text-cosmic-950 font-semibold'
                  : 'bg-cosmic-900 border-gold-600/20 text-gray-400 hover:border-gold-500/50'
              }`}
            >
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
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                value === opt
                  ? 'bg-gold-500 border-gold-500 text-cosmic-950 font-semibold'
                  : 'bg-cosmic-900 border-gold-600/20 text-gray-400 hover:border-gold-500/40'
              }`}
            >
              {opt ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cosmic-950 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="card-cosmic p-10 max-w-md w-full text-center border border-green-500/30">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="font-serif text-2xl text-green-400 mb-3">Application Submitted!</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Thank you <span className="text-gold-400 font-medium">{form.name}</span>! Our team will review your application
            and contact you at <span className="text-gold-400">{form.email}</span> within 3–5 business days.
          </p>
          <div className="text-left bg-cosmic-900/60 border border-gold-600/15 rounded-xl p-4 mb-6">
            <p className="text-gold-400 text-xs font-semibold mb-2">If approved</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              You will receive an email with a link to your <strong className="text-gray-300">Pandit Portal</strong> and
              a 4-digit PIN. Sign in with your mobile number and PIN to go online and start receiving seekers.
            </p>
          </div>
          <Link to="/astrologers" className="btn-gold px-6 py-2.5 text-sm inline-block">Browse Astrologers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-950 pt-20 pb-16">
      {/* Hero */}
      <div className="text-center py-10 px-4">
        <div className="text-gold-400 text-3xl mb-3">✦</div>
        <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3">Join AstroVyoma as an Astrologer</h1>
        <p className="text-gray-400 text-lg">Join the founding panel and set your own terms</p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {[
            { icon: '₹', label: `${share}% Earnings`, sub: 'Your share of every consultation' },
            { icon: '🆓', label: 'No Joining Fee', sub: 'No registration or subscription charge' },
            { icon: '⏰', label: 'Flexible Hours', sub: 'Work on your own schedule' },
          ].map(b => (
            <div key={b.label} className="card-cosmic px-6 py-4 text-center min-w-[160px]">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-gold-400 font-semibold text-sm">{b.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-6">
          Want the full picture first?{' '}
          <Link to="/astrologer-kit" className="text-gold-400 hover:underline">Read the astrologer's kit</Link>
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4">
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

        <div className="card-cosmic p-6 md:p-8">
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
                  <ScrollDatePicker value={form.dob} onChange={v => set('dob', v)} max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]} />
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
                <TagGrid
                  label="Skills (स्किल) *"
                  hint="Select all that apply — these appear on your public profile"
                  items={SKILLS}
                  selected={form.skills}
                  onToggle={v => toggleTag('skills', v)}
                  error={errors.skills}
                />
                <TagGrid
                  label="Languages (भाषाएँ) *"
                  hint="Languages you can consult in"
                  items={LANGUAGES}
                  selected={form.languages}
                  onToggle={v => toggleTag('languages', v)}
                  error={errors.languages}
                />
              </div>
            )}

            {/* ── Step 2: Education & Availability ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">From where did you learn Astrology? *</label>
                  <input type="text" value={form.astrology_learned_from}
                    onChange={e => set('astrology_learned_from', e.target.value)}
                    placeholder="e.g. Sanskrit Mahavidyalaya, Gurukul, Self-taught" className={inp('astrology_learned_from')} />
                  {errors.astrology_learned_from && <p className="text-red-400 text-xs mt-1">{errors.astrology_learned_from}</p>}
                </div>

                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Highest Qualification *</label>
                  <input type="text" value={form.highest_qualification}
                    onChange={e => set('highest_qualification', e.target.value)}
                    placeholder="e.g. Jyotish Acharya, M.A. Sanskrit, B.A." className={inp('highest_qualification')} />
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

                <YesNo
                  label="Are you working on any other online platform? *"
                  value={form.other_platform}
                  onChange={v => set('other_platform', v)}
                  error={errors.other_platform}
                />

                <YesNo
                  label="Are you currently working a full-time job? *"
                  value={form.fulltime_job}
                  onChange={v => set('fulltime_job', v)}
                  error={errors.fulltime_job}
                />
              </div>
            )}

            {/* ── Step 3: Profile & Pricing ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-xs block mb-2">Profile Photo (प्रोफाइल फोटो) <span className="text-gray-600">(optional)</span></label>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="relative w-28 h-28 rounded-full border-2 border-dashed border-gold-600/40 hover:border-gold-500 transition-colors overflow-hidden bg-cosmic-900 flex items-center justify-center group"
                    >
                      {form.photo_url ? (
                        <img src={form.photo_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 80 80" className="w-20 h-20 text-gray-700" fill="currentColor">
                          <circle cx="40" cy="28" r="16" />
                          <path d="M8 72c0-17.673 14.327-32 32-32s32 14.327 32 32" />
                        </svg>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    {form.photo_url
                      ? <button type="button" onClick={() => set('photo_url', '')} className="text-red-400 text-xs hover:underline">Remove photo</button>
                      : <p className="text-gray-500 text-xs text-center">Click to upload · JPG, PNG, WEBP · Max 2 MB</p>
                    }
                  </div>
                  <p className="text-gray-600 text-xs mt-2 text-center">Make sure your face is in the centre and clearly visible.</p>
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
                  Back
                </button>
              )}
              {step < 4 ? (
                <button type="submit" className="btn-gold flex-1 py-3 text-sm">Next →</button>
              ) : (
                <button type="submit" disabled={loading}
                  className="btn-gold flex-1 py-3 text-sm flex items-center justify-center gap-2">
                  {loading && <span className="w-4 h-4 border-2 border-cosmic-950/50 border-t-cosmic-950 rounded-full animate-spin" />}
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
