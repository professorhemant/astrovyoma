import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader, Gift } from 'lucide-react';
import { auth as authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    if (!form.email && !form.phone) return toast.error('Email or phone is required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      const bonus = Number(res.data.welcome_bonus) || 0;
      toast.success(bonus > 0
        ? `Welcome to AstroVyoma! ₹${bonus} added to your wallet ✦`
        : 'Welcome to AstroVyoma! ✦');
      navigate('/kundali');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5">
            <Gift className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 text-sm">Get <strong className="text-gold-400">₹50</strong> free in your wallet</span>
          </div>
        </div>

        <motion.form onSubmit={handleRegister}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          className="card-cosmic p-8 space-y-4">
          <h2 className="font-serif text-gold-400 text-lg">Create Account</h2>
          <div>
            <label className="text-gray-200 text-sm block mb-1.5">Full Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name"
              className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm" />
          </div>
          <div>
            <label className="text-gray-200 text-sm block mb-1.5">Email</label>
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
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Creating Account...</> : 'Create Account ✦'}
          </button>
          <p className="text-gray-300 text-xs text-center">By registering you agree to our Terms of Service</p>
        </motion.form>

        <p className="text-center text-gray-300 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
