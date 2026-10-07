import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, LogOut, Wifi, WifiOff, IndianRupee, Clock, ChevronDown, User, Shield, Share2, Copy } from 'lucide-react';
import PanditCallPanel from '../components/PanditCallPanel';
import PanditSchedule from '../components/PanditSchedule';
import CompleteContactPrompt from '../components/CompleteContactPrompt';
import PanditPoojaBookings from '../components/PanditPoojaBookings';
import PhotoUpload from '../components/PhotoUpload';
import { panditProfile } from '../api';
import toast from 'react-hot-toast';
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
  const [contactSkipped, setContactSkipped] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [pinOpen, setPinOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);

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

  function openEdit() {
    setEditForm({
      bio: pandit.bio || '',
      price_per_min: pandit.price_per_min || 30,
      experience_years: pandit.experience_years || '',
      photo_url: pandit.photo_url || '',
    });
    setEditOpen(v => !v);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setEditSaving(true);
    try {
      await panditProfile.update(editForm);
      setPandit(p => ({ ...p, ...editForm }));
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update profile');
    } finally {
      setEditSaving(false);
    }
  }

  async function submitChangePin(e) {
    e.preventDefault();
    if (newPin !== confirmPin) return toast.error('New PINs do not match');
    if (!/^\d{4}$/.test(newPin)) return toast.error('PIN must be exactly 4 digits');
    setPinSaving(true);
    try {
      await panditProfile.changePin({ current_pin: currentPin, new_pin: newPin });
      toast.success('PIN changed successfully');
      setCurrentPin(''); setNewPin(''); setConfirmPin('');
      setPinOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change PIN');
    } finally {
      setPinSaving(false);
    }
  }

  if (!token || !pandit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(120,40,200,0.25) 0%, transparent 60%), #0d0820' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="card-cosmic w-full max-w-sm p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3 font-serif text-gold-400">ॐ</div>
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

        {/* Shareable profile link */}
        {pandit.slug && (
          <div className="mb-6 rounded-2xl border border-gold-600/15 bg-gold-600/5 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-gold-600 uppercase tracking-widest mb-0.5">Your Public Profile</p>
              <p className="text-gray-400 text-xs truncate">astrovyoma.com/astrologer/{pandit.slug}</p>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/astrologer/${pandit.slug}`;
                if (navigator.share) {
                  navigator.share({ title: `${pandit.display_name} — AstroVyoma`, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(url)
                    .then(() => toast.success('Link copied!'))
                    .catch(() => toast.error('Could not copy'));
                }
              }}
              className="shrink-0 flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        )}

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
            <Link to="/pandit-earnings" className="text-[11px] text-gold-600 hover:text-gold-400 transition-colors">
              Full Dashboard →
            </Link>
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

        {/* Pooja bookings — new bookings from /book-pooja page */}
        <PanditPoojaBookings />

        {/* Her hours, and who has booked them. The online toggle above is for
            someone wanting to talk *now*; this is the diary. */}
        <PanditSchedule token={token} />

        {/* ── Edit Profile ── */}
        <div className="mt-6 rounded-2xl border border-gold-600/15 overflow-hidden">
          <button onClick={openEdit}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-gray-300 font-medium">Edit Profile</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${editOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {editOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <form onSubmit={saveProfile} className="px-5 pb-5 space-y-4 border-t border-gold-600/10">
                  <div className="pt-4">
                    <label className="text-gray-400 text-xs block mb-1">Rate per minute (₹)</label>
                    <input type="number" min={10} max={500} value={editForm.price_per_min || ''}
                      onChange={e => setEditForm(f => ({ ...f, price_per_min: Number(e.target.value) }))}
                      className="input-cosmic w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Experience (years)</label>
                    <input type="number" min={0} max={60} value={editForm.experience_years || ''}
                      onChange={e => setEditForm(f => ({ ...f, experience_years: Number(e.target.value) }))}
                      className="input-cosmic w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-2">Profile Photo</label>
                    <PhotoUpload
                      value={editForm.photo_url || ''}
                      onChange={v => setEditForm(f => ({ ...f, photo_url: v }))}
                      name={pandit?.display_name}
                      size={96}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Bio</label>
                    <textarea rows={3} value={editForm.bio || ''}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell seekers about yourself…"
                      className="input-cosmic w-full text-sm resize-none" />
                  </div>
                  <button type="submit" disabled={editSaving}
                    className="btn-gold w-full py-2.5 text-sm font-semibold disabled:opacity-60">
                    {editSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Change PIN ── */}
        <div className="mt-3 rounded-2xl border border-gold-600/15 overflow-hidden">
          <button onClick={() => setPinOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300 font-medium">Change PIN</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${pinOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {pinOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <form onSubmit={submitChangePin} className="px-5 pb-5 space-y-3 border-t border-gold-600/10">
                  <div className="pt-4">
                    <label className="text-gray-400 text-xs block mb-1">Current PIN</label>
                    <input type="password" maxLength={4} value={currentPin}
                      onChange={e => setCurrentPin(e.target.value)}
                      className="input-cosmic w-full text-sm tracking-widest" placeholder="••••" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">New PIN (4 digits)</label>
                    <input type="password" maxLength={4} value={newPin}
                      onChange={e => setNewPin(e.target.value)}
                      className="input-cosmic w-full text-sm tracking-widest" placeholder="••••" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Confirm New PIN</label>
                    <input type="password" maxLength={4} value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value)}
                      className="input-cosmic w-full text-sm tracking-widest" placeholder="••••" required />
                  </div>
                  <button type="submit" disabled={pinSaving}
                    className="w-full py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-semibold hover:bg-purple-500/30 transition-colors disabled:opacity-60">
                    {pinSaving ? 'Changing…' : 'Change PIN'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Approval used to drop the email an astrologer applied with, so most
            accounts have only the number she signs in with. Ask once she is in,
            rather than blocking the login of somebody trying to take a call. */}
        {pandit && (!pandit.email || !pandit.phone) && !contactSkipped && (
          <CompleteContactPrompt
            who="astrologer"
            missing={{ email: !pandit.email, phone: !pandit.phone }}
            onSkip={() => setContactSkipped(true)}
            onSave={async (payload) => {
              const r = await axios.patch(`${API}/pandit/contact`, payload, { headers: { Authorization: `Bearer ${token}` } });
              setPandit(p => ({ ...p, email: r.data.email, phone: r.data.phone }));
            }}
          />
        )}

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
