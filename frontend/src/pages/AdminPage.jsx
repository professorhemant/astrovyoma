import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { admin as adminApi } from '../api';
import {
  LayoutDashboard, Users, Star, MessageSquare, Wallet,
  Settings, LogOut, Loader, Trash2, Edit2, Plus, X,
  CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight,
  Shield, Bell, AlertTriangle
} from 'lucide-react';

const TABS = [
  { key: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { key: 'users',         label: 'Users',          icon: Users },
  { key: 'astrologers',   label: 'Astrologers',    icon: Star },
  { key: 'consultations', label: 'Consultations',  icon: MessageSquare },
  { key: 'transactions',  label: 'Transactions',   icon: Wallet },
  { key: 'settings',      label: 'Settings',       icon: Settings },
];

function StatCard({ label, value, sub, color = 'gold' }) {
  return (
    <div className="card-cosmic p-5">
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bold text-${color}-400`}>{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
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
function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-gold-400 animate-spin" /></div>;

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} sub={`+${stats?.todaySignups ?? 0} today`} />
        <StatCard label="Astrologers" value={stats?.totalAstrologers ?? 0} />
        <StatCard label="Consultations" value={stats?.totalConsultations ?? 0} sub={`${stats?.activeConsultations ?? 0} active now`} />
        <StatCard label="Total Revenue" value={`₹${Number(stats?.totalRevenue ?? 0).toLocaleString()}`} color="green" />
        <StatCard label="Today Signups" value={stats?.todaySignups ?? 0} />
        <StatCard label="Active Now" value={stats?.activeConsultations ?? 0} color="yellow" />
      </div>
      <div className="card-cosmic p-5">
        <p className="text-gray-300 text-sm">Welcome to AstroVyoma Admin. Use the sidebar to manage all aspects of your platform.</p>
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
        <h2 className="font-serif text-2xl text-gold-400">Users</h2>
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
                  <td className="py-2 pr-4 text-gold-400">₹{parseFloat(u.wallet_balance).toFixed(0)}</td>
                  <td className="py-2 pr-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-2 flex items-center gap-2">
                    <button onClick={() => { setEditUser(u); setWalletAmount(''); setWalletNote(''); }} title="Wallet" className="text-gold-400 hover:text-gold-300"><Wallet className="w-4 h-4" /></button>
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
            <p className="text-gray-400 text-sm mb-4">Current balance: <span className="text-gold-400">₹{parseFloat(editUser.wallet_balance).toFixed(2)}</span></p>
            <form onSubmit={handleWallet} className="space-y-3">
              <input type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="Amount (negative to debit)"
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

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete astrologer "${name}"?`)) return;
    try { await adminApi.deleteAstrologer(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-gold-400">Astrologers</h2>
        <button onClick={() => setForm({ ...EMPTY_ASTRO })} className="btn-gold px-4 py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add New</button>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gold-600/20 text-gold-400 text-xs uppercase">
                <th className="text-left py-2 pr-4">Name</th>
                <th className="text-left py-2 pr-4">Phone</th>
                <th className="text-left py-2 pr-4">Price/min</th>
                <th className="text-left py-2 pr-4">Rating</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {astrologers.map(a => (
                <tr key={a.id} className="border-b border-cosmic-800 hover:bg-cosmic-900/50">
                  <td className="py-2 pr-4 font-medium">{a.display_name}</td>
                  <td className="py-2 pr-4 text-gray-400">{a.phone || '—'}</td>
                  <td className="py-2 pr-4 text-gold-400">₹{a.price_per_min}</td>
                  <td className="py-2 pr-4">⭐ {a.rating}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${a.is_online ? 'bg-green-900/50 text-green-300' : 'bg-cosmic-800 text-gray-400'}`}>{a.is_online ? 'Online' : 'Offline'}</span>
                  </td>
                  <td className="py-2 flex items-center gap-2">
                    <button onClick={() => setForm({ ...a, specialties: Array.isArray(a.specialties) ? a.specialties.join(', ') : a.specialties, languages: Array.isArray(a.languages) ? a.languages.join(', ') : a.languages })} className="text-gold-400 hover:text-gold-300"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(a.id, a.display_name)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {astrologers.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No astrologers</td></tr>}
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
                ['free_minutes', 'Free Minutes', 'number'],
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
                Verified (shows in listings)
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

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-4">Consultations</h2>
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
                  <td className="py-2 pr-4 capitalize">{c.mode}</td>
                  <td className={`py-2 pr-4 capitalize font-medium ${statusColor(c.status)}`}>{c.status}</td>
                  <td className="py-2 pr-4">{c.duration_mins}m</td>
                  <td className="py-2 pr-4 text-gold-400">₹{parseFloat(c.total_cost || 0).toFixed(0)}</td>
                  <td className="py-2 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
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

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function TransactionsTab() {
  const [data, setData] = useState({ transactions: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.getTransactions({ page, limit: 15 }).then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-4">Transactions</h2>
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
                  <td className="py-2 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
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

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState({ maintenanceMode: false, announcement: '', announcementActive: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then(r => setSettings(r.data)).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try { await adminApi.updateSettings(settings); toast.success('Settings saved'); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;

  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-2xl text-gold-400 mb-6">Site Settings</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-cosmic p-5 space-y-4">
          <h3 className="text-gold-400 font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Maintenance Mode</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-cosmic-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-gray-300 text-sm">{settings.maintenanceMode ? 'Site is in maintenance mode' : 'Site is live'}</span>
          </label>
          <p className="text-gray-500 text-xs">When enabled, visitors see a maintenance message instead of the site.</p>
        </div>

        <div className="card-cosmic p-5 space-y-4">
          <h3 className="text-gold-400 font-medium flex items-center gap-2"><Bell className="w-4 h-4" /> Announcement Banner</h3>
          <textarea value={settings.announcement} onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))}
            placeholder="Enter announcement text to show users..."
            rows={3}
            className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500 resize-none" />
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setSettings(s => ({ ...s, announcementActive: !s.announcementActive }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.announcementActive ? 'bg-gold-500' : 'bg-cosmic-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.announcementActive ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-gray-300 text-sm">Show announcement to users</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Settings
        </button>
      </form>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); toast.error('Admin access required'); }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const tabContent = { overview: <Overview />, users: <UsersTab />, astrologers: <AstrologersTab />, consultations: <ConsultationsTab />, transactions: <TransactionsTab />, settings: <SettingsTab /> };

  return (
    <div className="min-h-screen bg-cosmic-950 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-cosmic-900 border-r border-gold-600/10 flex flex-col transition-all duration-200 shrink-0`}>
        <div className="p-4 border-b border-gold-600/10 flex items-center justify-between">
          {sidebarOpen && <span className="font-serif text-gold-400 text-sm">✦ Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gold-400 ml-auto">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${tab === key ? 'bg-gold-500/10 text-gold-400' : 'text-gray-400 hover:text-gray-200 hover:bg-cosmic-800'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gold-600/10">
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-cosmic-800 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Back to Site</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {tabContent[tab]}
        </div>
      </div>
    </div>
  );
}
