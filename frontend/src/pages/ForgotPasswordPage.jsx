import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader, ArrowLeft } from 'lucide-react';
import { auth as authApi } from '../api';

const inputClass =
  'w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  // 'request' → ask where to send the code; 'reset' → enter code + new password
  const [step, setStep] = useState('request');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  // The address the code actually went to — the reset call is keyed by email,
  // so a user who typed their phone number still needs one to submit.
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e) {
    e.preventDefault();
    if (!emailOrPhone) return toast.error('Please enter your email or phone');
    setLoading(true);
    try {
      await authApi.forgotPassword({ emailOrPhone });
      // The API deliberately does not say whether the account exists, so the
      // copy here stays conditional rather than promising an email was sent.
      toast.success('If that account exists, a reset code is on its way');
      if (emailOrPhone.includes('@')) setEmail(emailOrPhone.trim());
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send reset code');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email || !otp || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, password });
      toast.success('Password reset — please sign in ✦');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password reset failed');
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
          <h1 className="font-serif text-3xl text-gold-400 mb-1">
            {step === 'request' ? 'Forgot Password' : 'Set New Password'}
          </h1>
          <p className="text-gray-300 text-sm">
            {step === 'request'
              ? 'We will send a reset code to your registered email'
              : 'Enter the code from your email and choose a new password'}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="card-cosmic p-8 space-y-4">
            <div>
              <label className="text-gray-200 text-sm block mb-1.5">Email or Phone</label>
              <input
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                placeholder="your@email.com or 9876543210"
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Code ✦'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="card-cosmic p-8 space-y-4">
            <div>
              <label className="text-gray-200 text-sm block mb-1.5">Registered Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-gray-200 text-sm block mb-1.5">Reset Code</label>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                className={`${inputClass} tracking-[0.4em] text-center`}
              />
            </div>
            <div className="relative">
              <label className="text-gray-200 text-sm block mb-1.5">New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={`${inputClass} pr-10`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password ✦'}
            </button>
            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-center text-gray-300 text-sm hover:text-gold-400"
            >
              Didn't get a code? Send again
            </button>
          </form>
        )}

        <p className="text-center text-gray-300 text-sm mt-6">
          <Link to="/login" className="text-gold-400 hover:text-gold-300 inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
