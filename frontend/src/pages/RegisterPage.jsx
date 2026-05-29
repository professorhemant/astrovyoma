import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader, ShieldCheck } from 'lucide-react';
import { auth as authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const identifier = form.email || form.phone;

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    if (!form.email && !form.phone) return toast.error('Email or phone is required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await authApi.sendOtp({ email: form.email || undefined, phone: form.phone || undefined });
      setOtpSent(true);
      setStep(2);
      toast.success(`OTP sent to ${identifier}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndRegister(e) {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await authApi.register({ ...form, otp });
      login(res.data.user, res.data.token);
      toast.success('Welcome to AstroVyoma! ✦');
      navigate('/kundali');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    try {
      await authApi.sendOtp({ email: form.email || undefined, phone: form.phone || undefined });
      toast.success(`OTP resent to ${identifier}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-cosmic-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-gold-400 text-2xl">✦</span>
            <span className="font-serif text-gold-400 text-2xl">AstroVyoma</span>
          </Link>
          <h1 className="font-serif text-3xl text-gold-400 mb-1">Begin Your Journey</h1>
          <p className="text-gray-300 text-sm">Free Kundali • AI guidance • Expert astrologers</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step === s ? 'bg-gold-400 text-cosmic-950' : step > s ? 'bg-gold-600/40 text-gold-400' : 'bg-cosmic-800 text-gray-300'}`}>
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" onSubmit={handleSendOtp}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-cosmic p-8 space-y-4">
              <h2 className="font-serif text-gold-400 text-lg">Your Details</h2>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name"
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Email <span className="text-gray-400 text-xs">(OTP will be sent here)</span></label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com"
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210"
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
              <div className="relative">
                <label className="text-gray-200 text-sm block mb-1.5">Password *</label>
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters"
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 pr-10 text-gray-200 focus:outline-none focus:border-gold-500 text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="btn-gold w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Sending OTP...</> : 'Send OTP →'}
              </button>
              <p className="text-gray-300 text-xs text-center">By registering you agree to our Terms of Service</p>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" onSubmit={handleVerifyAndRegister}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="card-cosmic p-8 space-y-5">
              <div className="text-center">
                <ShieldCheck className="w-12 h-12 text-gold-400 mx-auto mb-3" />
                <h2 className="font-serif text-gold-400 text-xl mb-1">Verify Your Account</h2>
                <p className="text-gray-300 text-sm">Enter the 6-digit OTP sent to</p>
                <p className="text-gold-400 text-sm font-medium">{identifier}</p>
              </div>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Enter OTP *</label>
                <input
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP" maxLength={6}
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm text-center text-2xl tracking-[1rem]"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Verifying...</> : 'Create Account ✦'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-200 transition-colors">
                  ← Change details
                </button>
                <button type="button" onClick={handleResendOtp} disabled={loading}
                  className="text-gold-400 hover:text-gold-300 transition-colors disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-gray-300 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
