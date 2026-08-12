import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, LogOut, Wifi, WifiOff, IndianRupee, Clock } from 'lucide-react';
import PanditCallPanel from '../components/PanditCallPanel';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'pandit_token';

export default function PanditPortalPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [pandit, setPandit] = useState(null);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${API}/pandit/me`, { headers })
      .then(r => setPandit(r.data))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); });
    // Earnings failing must not sign anybody out — only /pandit/me decides
    // whether the token is still good.
    axios.get(`${API}/pandit/earnings`, { headers })
      .then(r => setEarnings(r.data))
      .catch(() => {});
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/pandit/login`, { phone, pin });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      setPandit(res.data.pandit);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus() {
    if (!pandit || toggling) return;
    setToggling(true);
    try {
      const next = !pandit.is_online;
      await axios.patch(`${API}/pandit/status`, { is_online: next }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPandit(p => ({ ...p, is_online: next }));
    } catch {
      setError('Could not update status. Try again.');
    } finally {
      setToggling(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setPandit(null);
    setPhone('');
    setPin('');
  }

  if (!token || !pandit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(120,40,200,0.25) 0%, transparent 60%), #0d0820' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="card-cosmic w-full max-w-sm p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🕉️</div>
            <h1 className="font-serif text-2xl text-gold-400">Pandit Portal</h1>
            <p className="text-gray-400 text-sm mt-1">AstroVyoma — Pandit Login</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-cosmic pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="4-digit PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                maxLength={4}
                className="input-cosmic pl-10 tracking-widest"
                required
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-400 text-xs text-center">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="btn-gold py-3 text-sm font-semibold mt-2 disabled:opacity-60">
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          {/* Says which door this is, since an astrologer arriving here has
              often just tried the customer login — and gives a way back out,
              now that the site navbar is not carried onto this page. */}
          <p className="text-gray-500 text-[11px] text-center mt-6 leading-relaxed">
            For astrologers on AstroVyoma. Sign in with the mobile number and
            4-digit PIN we emailed you.
            <br />
            <Link to="/" className="text-gold-600 hover:text-gold-400 transition-colors">
              ← Back to AstroVyoma
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(120,40,200,0.25) 0%, transparent 60%), #0d0820' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="card-cosmic w-full max-w-sm p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs text-gold-600 uppercase tracking-widest">Pandit Portal</div>
          <button onClick={logout} className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-400/60"
              style={{ boxShadow: '0 0 16px rgba(201,168,76,0.3)' }}>
              <img src={pandit.photo_url} alt={pandit.display_name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${pandit.display_name}`; }} />
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cosmic-800 ${pandit.is_online ? 'bg-green-400' : 'bg-gray-500'}`} />
          </div>
          <div>
            <h2 className="font-serif text-gold-400 text-lg leading-tight">{pandit.display_name}</h2>
            <p className="text-gray-400 text-xs mt-0.5">Verified Pandit ✦ AstroVyoma</p>
            <div className="flex gap-3 mt-2 text-xs text-gray-300">
              <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{pandit.price_per_min}/min</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pandit.free_minutes} min free</span>
            </div>
          </div>
        </div>

        {/* Live Toggle */}
        <div className="rounded-2xl p-6 text-center"
          style={{ background: pandit.is_online ? 'rgba(22,163,74,0.08)' : 'rgba(100,100,120,0.08)', border: `1px solid ${pandit.is_online ? 'rgba(22,163,74,0.3)' : 'rgba(120,120,140,0.2)'}` }}>

          <div className={`text-4xl mb-2 ${pandit.is_online ? 'text-green-400' : 'text-gray-500'}`}>
            {pandit.is_online ? <Wifi className="w-10 h-10 mx-auto" /> : <WifiOff className="w-10 h-10 mx-auto" />}
          </div>

          <p className={`font-semibold text-lg mb-1 ${pandit.is_online ? 'text-green-400' : 'text-gray-400'}`}>
            {pandit.is_online ? 'You are LIVE' : 'You are Offline'}
          </p>
          <p className="text-gray-500 text-xs mb-5">
            {pandit.is_online
              ? 'Clients can see you and book consultations'
              : 'You are hidden from client searches'}
          </p>

          <button onClick={toggleStatus} disabled={toggling}
            className={`w-full py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-60 ${
              pandit.is_online
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'btn-gold'
            }`}>
            {toggling ? 'Updating…' : pandit.is_online ? 'Go Offline' : 'Go Live'}
          </button>
        </div>

        {/* Incoming calls sit directly under the online toggle, because the
            toggle is the promise and this is what keeps it. */}
        <div className="mt-5">
          <PanditCallPanel token={token} isOnline={pandit.is_online} displayName={pandit.display_name} />
        </div>

        {/* Earnings. The kit promises a payout every Monday for the week before,
            so the two figures shown largest are what is owed and what this week
            has brought in — the ones an astrologer checks against that promise. */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs text-gold-600 uppercase tracking-widest">Earnings</h3>
            {earnings && (
              <span className="text-[11px] text-gray-500">
                {earnings.consultations} consultation{earnings.consultations === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {!earnings ? (
            <p className="text-gray-500 text-xs text-center py-4">Loading…</p>
          ) : earnings.consultations === 0 ? (
            <p className="text-gray-500 text-xs text-center py-4 leading-relaxed">
              No paid consultations yet. Your share of each one appears here as soon as it ends.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-2xl border border-gold-500/30 bg-gold-600/10 px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Awaiting payout</p>
                  <p className="text-gold-400 font-serif text-xl">₹{earnings.pendingAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-2xl border border-gold-600/20 bg-cosmic-900/60 px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">This week</p>
                  <p className="text-gray-200 font-serif text-xl">₹{earnings.weekAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 px-1 mb-4">
                <span>Today ₹{earnings.todayAmount.toLocaleString('en-IN')}</span>
                <span>Paid out ₹{earnings.paidAmount.toLocaleString('en-IN')}</span>
                <span>Lifetime ₹{earnings.lifetimeAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {earnings.recent.map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-cosmic-900/50 border border-gold-600/10 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-gray-300 text-xs">
                        {r.duration_mins} min{r.mode ? ` · ${r.mode}` : ''}
                      </p>
                      <p className="text-gray-600 text-[10px] mt-0.5">
                        {new Date(r.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' · '}seeker paid ₹{r.gross_amount.toLocaleString('en-IN')}
                        {' · '}platform {r.commission_percent}%
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gold-400 text-sm">₹{r.net_amount.toLocaleString('en-IN')}</p>
                      <p className={`text-[10px] ${r.status === 'paid' ? 'text-green-500/70' : 'text-gray-600'}`}>
                        {r.status === 'paid' ? 'paid' : 'pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-red-400 text-xs text-center mt-3">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
