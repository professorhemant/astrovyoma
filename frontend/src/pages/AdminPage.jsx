import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { admin as adminApi, astrologerApplications } from '../api';
import {
  LayoutDashboard, Users, Star, MessageSquare, Wallet,
  Settings, LogOut, Loader, Trash2, Edit2, Plus, X,
  CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight,
  Shield, Bell, AlertTriangle, Calendar, TrendingUp,
  Phone, Mail, BarChart2, Eye, EyeOff, IndianRupee, FileText, Home
} from 'lucide-react';

const TABS = [
  { key: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { key: 'users',         label: 'Users',          icon: Users },
  { key: 'astrologers',   label: 'Astrologers',    icon: Star },
  { key: 'consultations', label: 'Consultations',  icon: MessageSquare },
  { key: 'appointments',  label: 'Appointments',   icon: Calendar },
  { key: 'transactions',  label: 'Transactions',   icon: Wallet },
  { key: 'revenue',       label: 'Revenue',        icon: TrendingUp },
  { key: 'settings',      label: 'Settings',       icon: Settings },
  { key: 'applications',  label: 'Applications',   icon: FileText },
];

// Tailwind scans source text at build time, so an interpolated class name like
// `bg-${color}-500` is never emitted on its own account. These happened to work
// only because other files mention the same names literally — add a colour here
// that nothing else uses and it would silently render unstyled. Look them up.
const ACCENT = {
  gold:   { soft: 'bg-gold-500/10',   text: 'text-gold-400',   on: 'bg-gold-500' },
  red:    { soft: 'bg-red-500/10',    text: 'text-red-400',    on: 'bg-red-500' },
  yellow: { soft: 'bg-yellow-500/10', text: 'text-yellow-400', on: 'bg-yellow-500' },
  blue:   { soft: 'bg-blue-500/10',   text: 'text-blue-400',   on: 'bg-blue-500' },
  purple: { soft: 'bg-purple-500/10', text: 'text-purple-400', on: 'bg-purple-500' },
  green:  { soft: 'bg-green-500/10',  text: 'text-green-400',  on: 'bg-green-500' },
};

function StatCard({ label, value, sub, color = 'gold', icon: Icon }) {
  const accent = ACCENT[color] || ACCENT.gold;
  return (
    <div className="card-cosmic p-5 flex items-start gap-4">
      {Icon && (
        <div className={`p-2 rounded-xl ${accent.soft} shrink-0`}>
          <Icon className={`w-5 h-5 ${accent.text}`} />
        </div>
      )}
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-bold ${accent.text}`}>{value}</p>
        {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// Module scope on purpose: defined inside SettingsTab this was a new component
// type on every render, so React unmounted and remounted it on each keystroke.
function Toggle({ checked, onChange, label, desc, color = 'gold' }) {
  const accent = ACCENT[color] || ACCENT.gold;
  return (
    <div className="flex items-start gap-4">
      <button type="button" onClick={onChange} role="switch" aria-checked={!!checked} aria-label={label}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 mt-0.5 ${checked ? accent.on : 'bg-cosmic-700'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
      <div>
        <p className="text-gray-200 text-sm font-medium">{label}</p>
        {desc && <p className="text-gray-500 text-xs mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
      <span>Page {page} of {totalPages} ({total} total)</span>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="p-1 hover:text-gold-400 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className="p-1 hover:text-gold-400 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ─── OVERVIEW ───────────────────────────────────────────────────────────────
function Overview({ setTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-gold-400 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-gold-400">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} sub={`+${stats?.todaySignups ?? 0} today`} icon={Users} />
        <StatCard label="Astrologers" value={stats?.totalAstrologers ?? 0} sub={`${stats?.onlineAstrologers ?? 0} online now`} icon={Star} color="yellow" />
        <StatCard label="Consultations" value={stats?.totalConsultations ?? 0} sub={`${stats?.activeConsultations ?? 0} active`} icon={MessageSquare} color="blue" />
        <StatCard label="Appointments" value={stats?.totalAppointments ?? 0} icon={Calendar} color="purple" />
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`₹${Number(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="green" />
        <StatCard label="Today's Revenue" value={`₹${Number(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}`} icon={TrendingUp} color="green" />
        <StatCard label="This Week" value={`₹${Number(stats?.weekRevenue ?? 0).toLocaleString('en-IN')}`} icon={BarChart2} color="green" />
        <StatCard label="Active Now" value={stats?.activeConsultations ?? 0} sub="live sessions" icon={Eye} color="red" />
      </div>

      {/* Quick actions */}
      <div className="card-cosmic p-5 mb-6">
        <h3 className="text-gold-400 font-medium mb-4 text-sm uppercase tracking-widest">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Manage Users', tab: 'users', color: 'text-blue-400' },
            { label: 'Add Astrologer', tab: 'astrologers', color: 'text-yellow-400' },
            { label: 'View Consultations', tab: 'consultations', color: 'text-purple-400' },
            { label: 'Appointments', tab: 'appointments', color: 'text-green-400' },
            { label: 'Revenue Report', tab: 'revenue', color: 'text-gold-400' },
            { label: 'Site Settings', tab: 'settings', color: 'text-gray-300' },
          ].map(({ label, tab, color }) => (
            <button key={tab} onClick={() => setTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm border border-gold-600/20 hover:border-gold-500/50 ${color} hover:bg-cosmic-800 transition-all`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Research insights box */}
      <div className="card-cosmic p-5 border border-gold-600/20">
        <h3 className="text-gold-400 font-medium mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Platform Intelligence (Based on Industry Research)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-cosmic-900/60 rounded-xl p-4">
            <p className="text-gold-300 font-medium mb-2">AstroTalk Model</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• Per-minute wallet billing</li>
              <li>• Concern-based matching</li>
              <li>• Astrologer verification queue</li>
              <li>• Call + chat + video modes</li>
            </ul>
          </div>
          <div className="bg-cosmic-900/60 rounded-xl p-4">
            <p className="text-gold-300 font-medium mb-2">AstroSage Model</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• AstroGPT AI integration</li>
              <li>• 100M+ kundali answers</li>
              <li>• Free tools drive traffic</li>
              <li>• Premium upsell on reports</li>
            </ul>
          </div>
          <div className="bg-cosmic-900/60 rounded-xl p-4">
            <p className="text-gold-300 font-medium mb-2">Our Edge — AstroVyoma</p>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• Swiss Ephemeris precision</li>
              <li>• Pandit portal for pandits</li>
              <li>• AstroMall + Pooja booking</li>
              <li>• Full Vedic feature suite</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USERS ──────────────────────────────────────────────────────────────────
function UsersTab() {
  const [data, setData] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getUsers({ search, page, limit: 15 }).then(r => setData(r.data)).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try { await adminApi.deleteUser(id); toast.success('User deleted'); load(); }
    catch { toast.error('Failed to delete user'); }
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Set ${user.name} as ${newRole}?`)) return;
    try { await adminApi.updateUser(user.id, { role: newRole }); toast.success(`Role set to ${newRole}`); load(); }
    catch { toast.error('Failed to update role'); }
  }

  async function handleWallet(e) {
    e.preventDefault();
    if (!walletAmount || isNaN(walletAmount)) return toast.error('Enter valid amount');
    try {
      await adminApi.updateUser(editUser.id, { wallet_adjustment: parseFloat(walletAmount), adjustment_note: walletNote });
      toast.success('Wallet updated'); setEditUser(null); setWalletAmount(''); setWalletNote(''); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-gold-400">Users <span className="text-gray-500 text-sm font-sans font-normal ml-2">({data.total})</span></h2>
        <div className="flex gap-2">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name/email/phone..."
            className="bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-gold-500 w-56" />
          <button onClick={load} className="p-2 text-gold-400 hover:text-gold-300"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-4">Name</th>
                <th className="text-left py-2 pr-4">Email / Phone</th>
                <th className="text-left py-2 pr-4">Role</th>
                <th className="text-left py-2 pr-4">Wallet</th>
                <th className="text-left py-2 pr-4">Joined</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(u => (
                <tr key={u.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 text-gray-400">{u.email || u.phone}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-900/50 text-purple-300' : 'bg-cosmic-800 text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="py-2 pr-4 text-gold-400">₹{parseFloat(u.wallet_balance || 0).toFixed(0)}</td>
                  <td className="py-2 pr-4 text-gray-500">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="py-2 flex items-center gap-2">
                    <button onClick={() => { setEditUser(u); setWalletAmount(''); setWalletNote(''); }} title="Adjust Wallet" className="text-gold-400 hover:text-gold-300"><Wallet className="w-4 h-4" /></button>
                    <button onClick={() => handleRoleToggle(u)} title="Toggle Role" className="text-blue-400 hover:text-blue-300"><Shield className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id, u.name)} title="Delete" className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {data.users.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No users found</td></tr>}
            </tbody>
          </table>
          <Pagination page={page} total={data.total} limit={15} onPage={setPage} />
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card-cosmic p-6 w-80">
            <div className="flex justify-between mb-4">
              <h3 className="font-serif text-gold-400">Wallet — {editUser.name}</h3>
              <button onClick={() => setEditUser(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Current: <span className="text-gold-400">₹{parseFloat(editUser.wallet_balance || 0).toFixed(2)}</span></p>
            <form onSubmit={handleWallet} className="space-y-3">
              <input type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="Amount (+credit / -debit)"
                className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-gold-500" />
              <input value={walletNote} onChange={e => setWalletNote(e.target.value)} placeholder="Note (optional)"
                className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-gold-500" />
              <button type="submit" className="btn-gold w-full py-2 text-sm">Apply</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ASTROLOGERS ─────────────────────────────────────────────────────────────
const EMPTY_ASTRO = { display_name: '', bio: '', phone: '', pin: '', price_per_min: 30, experience_years: 5, specialties: '', languages: 'Hindi, English', free_minutes: 0, photo_url: '', is_verified: true };

function AstrologersTab() {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getAstrologers().then(r => setAstrologers(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        specialties: typeof form.specialties === 'string' ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : form.specialties,
        languages: typeof form.languages === 'string' ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : form.languages,
      };
      if (form.id) await adminApi.updateAstrologer(form.id, payload);
      else await adminApi.createAstrologer(payload);
      toast.success(form.id ? 'Updated' : 'Created'); setForm(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  // Removes the seeded demo profiles in one transaction. Deleting them one row
  // at a time proved unreliable, and they are fictional records with fabricated
  // review counts, so they are worth removing decisively.
  async function handleCleanupDemo() {
    if (!window.confirm(
      'Remove all seeded demo astrologer profiles?\n\n' +
      'These are fictional (invented names, biographies and review counts) and their ' +
      'consultations were answered by AI. Genuine astrologers are not affected.\n\n' +
      'This cannot be undone.'
    )) return;
    try {
      const { data } = await adminApi.cleanupDemoAstrologers();
      toast.success(data.deleted ? `Removed ${data.deleted} demo profile(s)` : 'No demo profiles found');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.error || 'Cleanup failed');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete astrologer "${name}"?`)) return;
    try {
      await adminApi.deleteAstrologer(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      const d = err?.response?.data;
      // The server refuses when the astrologer has billing history. Show why —
      // a bare "Failed" left it impossible to tell a protected record from a
      // real error — and let the admin confirm the wider delete explicitly.
      if (err?.response?.status === 409 && d?.can_force) {
        const ok = window.confirm(
          `${d.error}\n\n${d.detail}\n\n` +
          `Delete "${name}" AND its ${d.consultations} consultation(s) and ${d.appointments} appointment(s)? This cannot be undone.`
        );
        if (!ok) return;
        try {
          await adminApi.deleteAstrologer(id, true);
          toast.success('Deleted with history');
          load();
        } catch (e2) {
          toast.error(e2?.response?.data?.error || 'Failed to delete');
        }
        return;
      }
      toast.error(d?.error || 'Failed to delete');
    }
  }

  async function handleToggleVerified(a) {
    try {
      await adminApi.updateAstrologer(a.id, { is_verified: !a.is_verified });
      toast.success(a.is_verified ? 'Unverified' : 'Verified'); load();
    } catch { toast.error('Failed'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-gold-400">Astrologers <span className="text-gray-500 text-sm font-sans font-normal ml-2">({astrologers.length})</span></h2>
        <div className="flex items-center gap-2">
          <button onClick={handleCleanupDemo}
            className="px-4 py-2 text-sm rounded-full border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors">
            Remove demo profiles
          </button>
          <button onClick={() => setForm({ ...EMPTY_ASTRO })} className="btn-gold px-4 py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add New</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-3">Name</th>
                <th className="text-left py-2 pr-3">Phone</th>
                <th className="text-left py-2 pr-3">₹/min</th>
                <th className="text-left py-2 pr-3">Rating</th>
                <th className="text-left py-2 pr-3">Orders</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2 pr-3">Verified</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {astrologers.map(a => (
                <tr key={a.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-3 font-medium">{a.display_name}</td>
                  <td className="py-2 pr-3 text-gray-400">{a.phone || '—'}</td>
                  <td className="py-2 pr-3 text-gold-400">₹{a.price_per_min}</td>
                  <td className="py-2 pr-3">⭐ {a.rating}</td>
                  <td className="py-2 pr-3 text-gray-400">{a.completed_orders}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${a.is_online ? 'bg-green-900/50 text-green-300' : 'bg-cosmic-800 text-gray-500'}`}>{a.is_online ? 'Online' : 'Offline'}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <button onClick={() => handleToggleVerified(a)} title="Toggle Verified"
                      className={`px-2 py-0.5 rounded text-xs ${a.is_verified ? 'bg-blue-900/50 text-blue-300' : 'bg-cosmic-800 text-gray-500'}`}>
                      {a.is_verified ? '✓ Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="py-2 flex items-center gap-2">
                    <button onClick={() => setForm({ ...a, specialties: Array.isArray(a.specialties) ? a.specialties.join(', ') : a.specialties, languages: Array.isArray(a.languages) ? a.languages.join(', ') : a.languages })} className="text-gold-400 hover:text-gold-300"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(a.id, a.display_name)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {astrologers.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-500">No astrologers</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-cosmic p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-serif text-gold-400">{form.id ? 'Edit Astrologer' : 'Add Astrologer'}</h3>
              <button onClick={() => setForm(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {[
                ['display_name', 'Display Name *', 'text'],
                ['bio', 'Bio', 'text'],
                ['phone', 'Phone', 'tel'],
                ['pin', form.id ? 'New PIN (leave blank to keep)' : 'PIN (4 digits)', 'text'],
                ['price_per_min', 'Price per Minute (₹)', 'number'],
                ['experience_years', 'Experience (years)', 'number'],
                ['free_minutes', 'Free Minutes for New Users', 'number'],
                ['photo_url', 'Photo URL', 'url'],
                ['specialties', 'Specialties (comma-separated)', 'text'],
                ['languages', 'Languages (comma-separated)', 'text'],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-gray-300 text-xs block mb-1">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-gold-500" />
                </div>
              ))}
              <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} className="accent-gold-400" />
                Verified (shows badge in listings)
              </label>
              <button type="submit" disabled={saving} className="btn-gold w-full py-2 text-sm flex items-center justify-center gap-2">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : null} {form.id ? 'Save Changes' : 'Create Astrologer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONSULTATIONS ────────────────────────────────────────────────────────────
function ConsultationsTab() {
  const [data, setData] = useState({ consultations: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.getConsultations({ page, limit: 15 }).then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [page]);

  const statusColor = s => ({ active: 'text-green-400', completed: 'text-blue-400', pending: 'text-yellow-400' })[s] || 'text-gray-400';
  const modeColor = m => ({ video: 'bg-purple-900/50 text-purple-300', audio: 'bg-blue-900/50 text-blue-300', chat: 'bg-green-900/50 text-green-300' })[m] || 'bg-cosmic-800 text-gray-400';

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-4">Consultations <span className="text-gray-500 text-sm font-sans font-normal ml-2">({data.total})</span></h2>
      {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Astrologer</th>
                <th className="text-left py-2 pr-4">Mode</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Duration</th>
                <th className="text-left py-2 pr-4">Cost</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.consultations.map(c => (
                <tr key={c.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-4">{c.user?.name || '—'}</td>
                  <td className="py-2 pr-4">{c.astrologer?.display_name || '—'}</td>
                  <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs capitalize ${modeColor(c.mode)}`}>{c.mode}</span></td>
                  <td className={`py-2 pr-4 capitalize font-medium ${statusColor(c.status)}`}>{c.status}</td>
                  <td className="py-2 pr-4">{c.duration_mins}m</td>
                  <td className="py-2 pr-4 text-gold-400">₹{parseFloat(c.total_cost || 0).toFixed(0)}</td>
                  <td className="py-2 text-gray-500">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {data.consultations.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">No consultations yet</td></tr>}
            </tbody>
          </table>
          <Pagination page={page} total={data.total} limit={15} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
function AppointmentsTab() {
  const [data, setData] = useState({ appointments: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.getAppointments({ page, limit: 15 }).then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [page]);

  const statusColor = s => ({ confirmed: 'text-green-400', cancelled: 'text-red-400', completed: 'text-blue-400', pending: 'text-yellow-400' })[s] || 'text-gray-400';

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-4">Appointments <span className="text-gray-500 text-sm font-sans font-normal ml-2">({data.total})</span></h2>
      {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Astrologer</th>
                <th className="text-left py-2 pr-4">Scheduled At</th>
                <th className="text-left py-2 pr-4">Mode</th>
                <th className="text-left py-2 pr-4">Concern</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map(a => (
                <tr key={a.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-4">
                    <div>{a.user?.name || '—'}</div>
                    <div className="text-gray-500 text-xs">{a.user?.phone || a.user?.email || ''}</div>
                  </td>
                  <td className="py-2 pr-4">{a.astrologer?.display_name || '—'}</td>
                  <td className="py-2 pr-4 text-gray-300">{new Date(a.scheduled_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="py-2 pr-4 capitalize text-gray-400">{a.mode}</td>
                  <td className="py-2 pr-4 text-gray-400 max-w-xs truncate">{a.concern_category || '—'}</td>
                  <td className={`py-2 pr-4 capitalize font-medium ${statusColor(a.status)}`}>{a.status}</td>
                  <td className="py-2 text-gold-400">₹{parseFloat(a.amount || 0).toFixed(0)}</td>
                </tr>
              ))}
              {data.appointments.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">No appointments yet</td></tr>}
            </tbody>
          </table>
          <Pagination page={page} total={data.total} limit={15} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function TransactionsTab() {
  const [data, setData] = useState({ transactions: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi.getTransactions({ page, limit: 15, type: typeFilter || undefined }).then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [page, typeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-gold-400">Transactions <span className="text-gray-500 text-sm font-sans font-normal ml-2">({data.total})</span></h2>
        <div className="flex gap-2">
          {['', 'credit', 'debit'].map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs border ${typeFilter === t ? 'border-gold-500 text-gold-400 bg-gold-500/10' : 'border-gold-600/20 text-gray-400 hover:text-gray-200'}`}>
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2 pr-4">Amount</th>
                <th className="text-left py-2 pr-4">Balance After</th>
                <th className="text-left py-2 pr-4">Description</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map(t => (
                <tr key={t.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-4">{t.user?.name || '—'}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${t.type === 'credit' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{t.type}</span>
                  </td>
                  <td className={`py-2 pr-4 font-medium ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'credit' ? '+' : '-'}₹{parseFloat(t.amount).toFixed(2)}
                  </td>
                  <td className="py-2 pr-4 text-gold-400">₹{parseFloat(t.balance_after || 0).toFixed(2)}</td>
                  <td className="py-2 pr-4 text-gray-400 max-w-xs truncate">{t.description || '—'}</td>
                  <td className="py-2 text-gray-500">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {data.transactions.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No transactions yet</td></tr>}
            </tbody>
          </table>
          <Pagination page={page} total={data.total} limit={15} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ─── REVENUE ──────────────────────────────────────────────────────────────────
function RevenueTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getRevenue().then(r => setData(r.data)).catch(() => toast.error('Failed to load revenue data')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-gold-400 animate-spin" /></div>;

  const maxAmount = data?.daily ? Math.max(...data.daily.map(d => d.amount), 1) : 1;

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-6">Revenue Analytics</h2>

      {/* 7-day bar chart */}
      <div className="card-cosmic p-6 mb-6">
        <h3 className="text-gold-400 font-medium mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Last 7 Days Revenue</h3>
        <div className="flex items-end gap-3 h-36">
          {(data?.daily || []).map(({ date, amount }) => {
            const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-gold-400 text-xs font-medium">₹{Number(amount).toLocaleString('en-IN')}</span>
                <div className="w-full rounded-t-lg bg-gold-500/20 relative" style={{ height: '80px' }}>
                  <div className="absolute bottom-0 w-full rounded-t-lg bg-gold-400/60 transition-all"
                    style={{ height: `${Math.max(pct, 2)}%` }} />
                </div>
                <span className="text-gray-500 text-xs">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top astrologers */}
      <div className="card-cosmic p-6 mb-6">
        <h3 className="text-gold-400 font-medium mb-4 flex items-center gap-2"><Star className="w-4 h-4" /> Top Astrologers by Consultations</h3>
        {(data?.topAstrologers || []).length === 0 ? (
          <p className="text-gray-500 text-sm">No completed consultations yet.</p>
        ) : (
          <div className="space-y-3">
            {(data?.topAstrologers || []).map((row, i) => (
              <div key={i} className="flex items-center justify-between bg-cosmic-900/60 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-bold text-lg w-6">#{i + 1}</span>
                  <div>
                    <p className="text-gray-200 font-medium">{row.astrologer?.display_name || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{row.dataValues?.consultCount || 0} consultations</p>
                  </div>
                </div>
                <span className="text-green-400 font-medium">₹{Number(row.dataValues?.revenue || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode breakdown */}
      <div className="card-cosmic p-6">
        <h3 className="text-gold-400 font-medium mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Consultation Mode Breakdown</h3>
        {(data?.modeBreakdown || []).length === 0 ? (
          <p className="text-gray-500 text-sm">No data yet.</p>
        ) : (
          <div className="flex gap-6">
            {(data?.modeBreakdown || []).map((row, i) => {
              const colors = { video: 'text-purple-400', audio: 'text-blue-400', chat: 'text-green-400' };
              return (
                <div key={i} className="text-center">
                  <p className={`text-3xl font-bold ${colors[row.mode] || 'text-gold-400'}`}>{row.dataValues?.count || 0}</p>
                  <p className="text-gray-400 text-sm capitalize mt-1">{row.mode}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    announcement: '',
    announcementActive: false,
    commissionPercent: 20,
    newUserFreeMinutes: 5,
    minWalletRecharge: 100,
    maxWalletRecharge: 10000,
    platformPhone: '',
    platformEmail: '',
    platformWhatsApp: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then(r => setSettings(r.data)).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try { await adminApi.updateSettings(settings); toast.success('Settings saved'); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-gold-400 mb-6">Site Settings</h2>
      <form onSubmit={handleSave} className="space-y-6">

        {/* Site controls */}
        <div className="card-cosmic p-5 space-y-5">
          <h3 className="text-gold-400 font-medium text-sm uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Site Controls</h3>
          <Toggle checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} label="Maintenance Mode" desc="When on, visitors see a maintenance page instead of the site." color="red" />
        </div>

        {/* Announcement */}
        <div className="card-cosmic p-5 space-y-4">
          <h3 className="text-gold-400 font-medium text-sm uppercase tracking-widest flex items-center gap-2"><Bell className="w-4 h-4" /> Announcement Banner</h3>
          <textarea value={settings.announcement} onChange={e => set('announcement', e.target.value)}
            placeholder="Enter announcement text (e.g. 'Free consultation on Guru Purnima!')"
            rows={2}
            className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500 resize-none" />
          <Toggle checked={settings.announcementActive} onChange={() => toggle('announcementActive')} label="Show announcement to all users" desc="Displays a banner at the top of every page." />
        </div>

        {/* Business settings */}
        <div className="card-cosmic p-5 space-y-4">
          <h3 className="text-gold-400 font-medium text-sm uppercase tracking-widest flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Business Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['commissionPercent', 'Platform Commission (%)', 'number', '20'],
              ['newUserFreeMinutes', 'Free Minutes (New Users)', 'number', '5'],
              ['minWalletRecharge', 'Min Wallet Recharge (₹)', 'number', '100'],
              ['maxWalletRecharge', 'Max Wallet Recharge (₹)', 'number', '10000'],
            ].map(([k, label, type, placeholder]) => (
              <div key={k}>
                <label className="text-gray-300 text-xs block mb-1">{label}</label>
                <input type={type} value={settings[k] || ''} onChange={e => set(k, type === 'number' ? parseFloat(e.target.value) : e.target.value)} placeholder={placeholder}
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-gold-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="card-cosmic p-5 space-y-4">
          <h3 className="text-gold-400 font-medium text-sm uppercase tracking-widest flex items-center gap-2"><Phone className="w-4 h-4" /> Platform Contact Info</h3>
          <div className="space-y-3">
            {[
              ['platformPhone', 'Support Phone', 'tel', Phone],
              ['platformEmail', 'Support Email', 'email', Mail],
              ['platformWhatsApp', 'WhatsApp Number', 'tel', Phone],
            ].map(([k, label, type, Icon]) => (
              <div key={k}>
                <label className="text-gray-300 text-xs block mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={type} value={settings[k] || ''} onChange={e => set(k, e.target.value)}
                    className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl pl-9 pr-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-gold-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky so the save action stays reachable — the form is taller than
            the viewport, which left this button permanently below the fold. */}
        <div className="sticky bottom-0 -mx-1 px-1 py-3 bg-cosmic-950/95 backdrop-blur border-t border-gold-600/10">
          <button type="submit" disabled={saving} className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
function ApplicationsTab() {
  const [data, setData] = useState({ applications: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [approvedModal, setApprovedModal] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    astrologerApplications.getAll({ page, limit: 10, status: statusFilter || undefined })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id) {
    try {
      const r = await astrologerApplications.approve(id);
      setApprovedModal({ name: r.data.astrologer.display_name, pin: r.data.pin });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  }

  async function handleReject(id) {
    try {
      await astrologerApplications.reject(id, { reason: rejectReason });
      toast.success('Application rejected');
      setRejectingId(null);
      setRejectReason('');
      load();
    } catch {
      toast.error('Failed to reject');
    }
  }

  const statusBadge = (s) => {
    const map = {
      pending: 'bg-yellow-900/50 text-yellow-300',
      approved: 'bg-green-900/50 text-green-300',
      rejected: 'bg-red-900/50 text-red-300',
    };
    return `px-2 py-0.5 rounded text-xs capitalize ${map[s] || 'bg-cosmic-800 text-gray-400'}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-gold-400">Astrologer Applications <span className="text-gray-500 text-sm font-sans font-normal ml-2">({data.total})</span></h2>
        <button onClick={load} className="p-2 text-gold-400 hover:text-gold-300"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs border capitalize ${statusFilter === s ? 'border-gold-500 text-gold-400 bg-gold-500/10' : 'border-gold-600/20 text-gray-400 hover:text-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-3">Name</th>
                <th className="text-left py-2 pr-3">Email</th>
                <th className="text-left py-2 pr-3">Phone</th>
                <th className="text-left py-2 pr-3">Exp</th>
                <th className="text-left py-2 pr-3">₹/min</th>
                <th className="text-left py-2 pr-3">Specialties</th>
                <th className="text-left py-2 pr-3">Date</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.applications.map(a => (
                <tr key={a.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-3 font-medium">{a.name}</td>
                  <td className="py-2 pr-3 text-gray-400 text-xs">{a.email}</td>
                  <td className="py-2 pr-3 text-gray-400 text-xs">{a.phone}</td>
                  <td className="py-2 pr-3">{a.experience_years}y</td>
                  <td className="py-2 pr-3 text-gold-400">₹{a.price_per_min}</td>
                  <td className="py-2 pr-3 text-gray-400 max-w-[140px] truncate text-xs">{a.specialties || '—'}</td>
                  <td className="py-2 pr-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="py-2 pr-3"><span className={statusBadge(a.status)}>{a.status}</span></td>
                  <td className="py-2">
                    {a.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(a.id)}
                          className="px-2 py-1 rounded text-xs bg-green-900/50 text-green-300 hover:bg-green-900/80 transition-colors">
                          Approve
                        </button>
                        {rejectingId === a.id ? (
                          <div className="flex items-center gap-1">
                            <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                              placeholder="Reason (optional)"
                              className="bg-cosmic-900 border border-gold-600/20 rounded px-2 py-1 text-gray-200 text-xs focus:outline-none focus:border-gold-500 w-32" />
                            <button onClick={() => handleReject(a.id)}
                              className="px-2 py-1 rounded text-xs bg-red-900/50 text-red-300 hover:bg-red-900/80 transition-colors">
                              Confirm
                            </button>
                            <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                              className="text-gray-500 hover:text-gray-300"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setRejectingId(a.id); setRejectReason(''); }}
                            className="px-2 py-1 rounded text-xs bg-red-900/50 text-red-300 hover:bg-red-900/80 transition-colors">
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                    {a.status === 'rejected' && a.rejection_reason && (
                      <span className="text-gray-500 text-xs italic">{a.rejection_reason}</span>
                    )}
                  </td>
                </tr>
              ))}
              {data.applications.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-gray-500">No applications found</td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} total={data.total} limit={10} onPage={setPage} />
        </div>
      )}

      {approvedModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card-cosmic p-6 max-w-sm w-full text-center border border-green-500/30">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h3 className="font-serif text-xl text-green-400 mb-2">Application Approved!</h3>
            <p className="text-gray-300 text-sm mb-4">
              <span className="text-gold-400 font-medium">{approvedModal.name}</span> has been added as an astrologer.
            </p>
            <div className="bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 mb-5">
              <p className="text-gray-400 text-xs mb-1">Portal Login PIN</p>
              <p className="text-gold-400 font-bold text-3xl tracking-widest">{approvedModal.pin}</p>
              <p className="text-gray-500 text-xs mt-1">Share this PIN with the astrologer — it won't be shown again.</p>
            </div>
            <button onClick={() => setApprovedModal(null)} className="btn-gold px-6 py-2 text-sm">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); toast.error('Admin access required'); }
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-cosmic-950 flex items-center justify-center">
      <Loader className="w-8 h-8 text-gold-400 animate-spin" />
    </div>
  );
  if (!user || user.role !== 'admin') return null;

  const tabContent = {
    overview:      <Overview setTab={setTab} />,
    users:         <UsersTab />,
    astrologers:   <AstrologersTab />,
    consultations: <ConsultationsTab />,
    appointments:  <AppointmentsTab />,
    transactions:  <TransactionsTab />,
    revenue:       <RevenueTab />,
    settings:      <SettingsTab />,
    applications:  <ApplicationsTab />,
  };

  return (
    // h-screen + overflow-hidden so the content column below is the actual
    // scroll container. With min-h-screen it grew to fit its content, the
    // window scrolled instead, and both the sticky tab bar and the sticky
    // save button had a scrollport that never moved.
    // relative z-10 lifts the whole shell above CosmicBackground, which is
    // `fixed inset-0 z-0 pointer-events-none` and was painting over the
    // sidebar — clicks passed through, but nothing was visible.
    <div className="relative z-10 h-screen overflow-hidden bg-cosmic-950 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-cosmic-900 border-r border-gold-600/10 flex flex-col transition-all duration-200 shrink-0`}>
        <div className="p-4 border-b border-gold-600/10 flex items-center justify-between">
          {sidebarOpen && <span className="font-serif text-gold-400 text-sm">✦ AstroVyoma Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gold-400 ml-auto" title={sidebarOpen ? 'Collapse' : 'Expand'}>
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} title={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${tab === key ? 'bg-gold-500/10 text-gold-400' : 'text-gray-400 hover:text-gray-200 hover:bg-cosmic-800'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gold-600/10 space-y-1">
          <button onClick={() => navigate('/')} title="View Site"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-cosmic-800 transition-colors">
            <Eye className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>View Site</span>}
          </button>
          <button onClick={logout} title="Logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-cosmic-800 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top tab bar — always visible regardless of sidebar state */}
        <div className="bg-cosmic-900 border-b border-gold-600/10 px-4 sticky top-0 z-10 flex items-center gap-2">
          {/* Always-visible way back to the site — the sidebar's "View Site"
              is easy to miss, and disappears entirely when it is collapsed. */}
          <button onClick={() => navigate('/')} title="Back to site"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 text-gray-300 hover:text-gold-400 hover:bg-cosmic-800 border border-gold-600/20 transition-colors">
            <Home className="w-3.5 h-3.5 shrink-0" />
            Home
          </button>
          <div className="w-px h-5 bg-gold-600/20 shrink-0" />
          <div className="flex overflow-x-auto scrollbar-none gap-1 py-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0
                  ${tab === key ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-cosmic-800'}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {tabContent[tab]}
        </div>
      </div>
    </div>
  );
}
