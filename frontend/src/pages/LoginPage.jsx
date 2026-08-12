import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { auth as authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.emailOrPhone || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const isEmail = form.emailOrPhone.includes('@');
      const res = await authApi.login({
        email: isEmail ? form.emailOrPhone : undefined,
        phone: !isEmail ? form.emailOrPhone : undefined,
        password: form.password
      });
      login(res.data.user, res.data.token);
      toast.success('Welcome back! ✦');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
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
          <h1 className="font-serif text-3xl text-gold-400 mb-1">Welcome Back</h1>
          <p className="text-gray-300 text-sm">The cosmos awaits you</p>
        </div>

        <form onSubmit={handleSubmit} className="card-cosmic p-8 space-y-4">
          <div>
            <label className="text-gray-200 text-sm block mb-1.5">Email or Phone</label>
            <input
              value={form.emailOrPhone}
              onChange={e => setForm(f => ({ ...f, emailOrPhone: e.target.value }))}
              placeholder="your@email.com or 9876543210"
              className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm"
            />
          </div>
          <div className="relative">
            <label className="text-gray-200 text-sm block mb-1.5">Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
              className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 pr-10 text-gray-200 focus:outline-none focus:border-gold-500 text-sm"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-gold-400 hover:text-gold-300 text-xs">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In ✦'}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-6">
          New to AstroVyoma?{' '}
          <Link to="/register" className="text-gold-400 hover:text-gold-300">Create free account</Link>
        </p>

        {/* This form signs you in as a seeker. An astrologer who uses it gets a
            customer account with a wallet and stays offline to everyone — which
            is exactly how a caller ended up waiting in an empty channel. Say so
            here, where the wrong turn is being taken. */}
        <div className="mt-6 pt-5 border-t border-gold-600/15 text-center">
          <p className="text-gray-400 text-xs">
            Are you an astrologer on AstroVyoma?
          </p>
          <Link
            to="/pandit-portal"
            className="inline-flex items-center gap-1.5 mt-1.5 text-gold-400 hover:text-gold-300 text-sm"
          >
            Sign in to the Pandit Portal →
          </Link>
          <p className="text-gray-500 text-[11px] mt-1">
            Your phone number and 4-digit PIN. That is where you go online to take calls.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
