import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { astrologerApplications } from '../api';

const STEPS = ['Personal Info', 'Your Expertise', 'About You'];

const EMPTY = {
  name: '', email: '', phone: '', photo_url: '', languages: '',
  experience_years: '', specialties: '', certifications: '', price_per_min: 30,
  bio: '', why_join: '',
};

export default function JoinAsAstrologerPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validateStep(s) {
    const errs = {};
    if (s === 0) {
      if (!form.name.trim()) errs.name = 'Full name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.phone.trim()) errs.phone = 'Phone is required';
    }
    if (s === 1) {
      if (!form.experience_years) errs.experience_years = 'Years of experience is required';
      else if (parseInt(form.experience_years) < 1) errs.experience_years = 'Must be at least 1 year';
      if (!form.price_per_min || parseFloat(form.price_per_min) < 10) errs.price_per_min = 'Minimum ₹10 per minute';
    }
    if (s === 2) {
      if (!form.bio.trim()) errs.bio = 'Bio is required';
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => s + 1);
  }

  function handleBack() {
    setStep(s => s - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await astrologerApplications.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        photo_url: form.photo_url.trim() || undefined,
        languages: form.languages.trim() || undefined,
        experience_years: parseInt(form.experience_years),
        specialties: form.specialties.trim() || undefined,
        certifications: form.certifications.trim() || undefined,
        price_per_min: parseFloat(form.price_per_min) || 30,
        bio: form.bio.trim(),
        why_join: form.why_join.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (key) =>
    `w-full bg-cosmic-900 border ${errors[key] ? 'border-red-500/60' : 'border-gold-600/20'} rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-gray-600`;

  const textareaClass = (key) =>
    `w-full bg-cosmic-900 border ${errors[key] ? 'border-red-500/60' : 'border-gold-600/20'} rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-gray-600 resize-none`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-cosmic-950 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="card-cosmic p-10 max-w-md w-full text-center border border-green-500/30">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="font-serif text-2xl text-green-400 mb-3">Application Submitted!</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Thank you <span className="text-gold-400 font-medium">{form.name}</span>! We have received your application.
            Our team will review it and contact you at <span className="text-gold-400">{form.email}</span> within 3-5 business days.
          </p>
          <Link to="/astrologers" className="btn-gold px-6 py-2.5 text-sm inline-block">Browse Astrologers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-950 pt-20 pb-16">
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <div className="text-gold-400 text-3xl mb-3">✦</div>
        <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3">Join AstroVyoma as an Astrologer</h1>
        <p className="text-gray-400 text-lg">Share your cosmic wisdom with thousands of seekers</p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {[
            { icon: '₹', label: '60-75% Earnings', sub: 'Industry-leading revenue share' },
            { icon: '👥', label: '10,000+ Users', sub: 'Active seekers on the platform' },
            { icon: '⏰', label: 'Flexible Hours', sub: 'Work on your own schedule' },
          ].map(b => (
            <div key={b.label} className="card-cosmic px-6 py-4 text-center min-w-[160px]">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-gold-400 font-semibold text-sm">{b.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4">
        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gold-500 text-cosmic-950' : 'bg-cosmic-800 text-gray-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${i === step ? 'text-gold-400' : 'text-gray-500'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${i < step ? 'bg-green-500/50' : 'bg-cosmic-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card-cosmic p-6 md:p-8">
          <h2 className="font-serif text-xl text-gold-400 mb-6">Step {step + 1}: {STEPS[step]}</h2>

          <form onSubmit={step === 2 ? handleSubmit : e => { e.preventDefault(); handleNext(); }}>
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Full Name *</label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Your full name" className={inputClass('name')} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com" className={inputClass('email')} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+91 98765 43210" className={inputClass('phone')} />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Photo URL <span className="text-gray-600">(optional)</span></label>
                  <input type="url" value={form.photo_url} onChange={e => set('photo_url', e.target.value)}
                    placeholder="https://..." className={inputClass('photo_url')} />
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Languages</label>
                  <input type="text" value={form.languages} onChange={e => set('languages', e.target.value)}
                    placeholder="Hindi, English, Marathi" className={inputClass('languages')} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Years of Experience *</label>
                  <input type="number" min="1" value={form.experience_years} onChange={e => set('experience_years', e.target.value)}
                    placeholder="e.g. 8" className={inputClass('experience_years')} />
                  {errors.experience_years && <p className="text-red-400 text-xs mt-1">{errors.experience_years}</p>}
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Specialties</label>
                  <input type="text" value={form.specialties} onChange={e => set('specialties', e.target.value)}
                    placeholder="Vedic Astrology, Tarot, Numerology, KP Astrology" className={inputClass('specialties')} />
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Certifications / Qualifications</label>
                  <textarea value={form.certifications} onChange={e => set('certifications', e.target.value)}
                    rows={3} placeholder="e.g. Jyotish Acharya from ICAS, 2018..." className={textareaClass('certifications')} />
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Preferred Price per Minute ₹ *</label>
                  <input type="number" min="10" value={form.price_per_min} onChange={e => set('price_per_min', e.target.value)}
                    className={inputClass('price_per_min')} />
                  {errors.price_per_min && <p className="text-red-400 text-xs mt-1">{errors.price_per_min}</p>}
                  <p className="text-gray-600 text-xs mt-1">Platform takes 25-40%; you keep 60-75%</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Your Bio *</label>
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                    rows={4} placeholder="Tell users about yourself, your approach, and your style..."
                    className={textareaClass('bio')} />
                  {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio}</p>}
                </div>
                <div>
                  <label className="text-gray-300 text-xs block mb-1.5">Why Join AstroVyoma?</label>
                  <textarea value={form.why_join} onChange={e => set('why_join', e.target.value)}
                    rows={3} placeholder="What motivates you to join our platform?"
                    className={textareaClass('why_join')} />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button type="button" onClick={handleBack}
                  className="btn-outline-gold flex-1 py-3 text-sm">
                  Back
                </button>
              )}
              {step < 2 ? (
                <button type="submit" className="btn-gold flex-1 py-3 text-sm">Next</button>
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
