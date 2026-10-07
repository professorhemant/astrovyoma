import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, ArrowLeft, Clock, TrendingUp, CheckCircle, Hourglass,
  BarChart2, Calendar, Activity, Filter, CreditCard, ChevronDown, Send,
} from 'lucide-react';
import { panditProfile } from '../api';
import toast from 'react-hot-toast';

const TOKEN_KEY = 'pandit_token';

const INR = (n) => '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// ── CSS bar chart (last 30 days) ─────────────────────────────────────────────
function DailyBarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data.map(d => d.amount), 1);

  return (
    <div className="relative">
      <div className="flex items-end gap-[3px] h-32 px-1">
        {data.map((d, i) => {
          const pct = d.amount / max;
          const isToday = i === data.length - 1;
          return (
            <div key={d.date}
              className="flex-1 relative cursor-pointer"
              style={{ minWidth: 0 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              <div
                className="w-full rounded-t-sm transition-opacity"
                style={{
                  height: `${Math.max(pct * 100, d.amount > 0 ? 4 : 0)}%`,
                  minHeight: d.amount > 0 ? 3 : 1,
                  background: isToday
                    ? 'rgba(201,168,76,1)'
                    : d.amount > 0
                      ? `rgba(201,168,76,${Math.max(0.25, pct * 0.85 + 0.15)})`
                      : 'rgba(100,100,130,0.25)',
                  opacity: hovered !== null && hovered !== i ? 0.5 : 1,
                }}
              />
              {hovered === i && (
                <div className="absolute bottom-full mb-2 left-1/2 z-20 pointer-events-none"
                  style={{ transform: 'translateX(-50%)', minWidth: 110 }}>
                  <div className="bg-cosmic-800 border border-gold-600/30 rounded-xl px-3 py-2 text-xs shadow-lg">
                    <p className="text-gold-400 font-semibold">{INR(d.amount)}</p>
                    <p className="text-gray-400 mt-0.5">
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    {d.sessions > 0 && (
                      <p className="text-gray-500">{d.sessions} session{d.sessions !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <div className="w-0 h-0 mx-auto" style={{
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid rgba(100,80,40,0.4)',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* X-axis: every 7th day label */}
      <div className="flex justify-between mt-2 px-0.5">
        {data.filter((_, i) => i % 7 === 0 || i === data.length - 1).map(d => (
          <span key={d.date} className="text-[9px] text-gray-600">
            {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal monthly bars ───────────────────────────────────────────────────
function MonthlyBars({ data }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="space-y-2.5">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-gray-500 text-xs w-12 shrink-0">{d.label}</span>
          <div className="flex-1 bg-cosmic-900/70 rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.amount / max) * 100}%`,
                background: d.amount > 0
                  ? 'linear-gradient(90deg, rgba(139,92,246,0.7), rgba(201,168,76,0.9))'
                  : 'transparent',
                minWidth: d.amount > 0 ? 6 : 0,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <span className="text-gray-300 text-xs w-24 text-right shrink-0">
            {INR(d.amount)}
            {d.sessions > 0 && <span className="text-gray-600 ml-1">({d.sessions})</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-gray-400 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-serif text-2xl ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EarningsDashboardPage() {
  const navigate = useNavigate();
  const [pandit, setPandit] = useState(null);
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modeFilter, setModeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [histPage, setHistPage] = useState(1);
  const HIST_PER_PAGE = 20;

  const [bankOpen, setBankOpen] = useState(false);
  const [bankMethod, setBankMethod] = useState('upi'); // 'upi' | 'bank'
  const [bankForm, setBankForm] = useState({ upi_id: '', bank_account: '', bank_ifsc: '', bank_account_name: '' });
  const [bankSaving, setBankSaving] = useState(false);

  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { navigate('/pandit-portal', { replace: true }); return; }

    Promise.all([
      panditProfile.getMe(),
      panditProfile.getSummary(),
      panditProfile.getBreakdown(),
    ]).then(([me, sum, brk]) => {
      setPandit(me.data);
      setSummary(sum.data);
      setBreakdown(brk.data);
      const a = me.data;
      setBankForm({
        upi_id:           a.upi_id           || '',
        bank_account:     a.bank_account     || '',
        bank_ifsc:        a.bank_ifsc        || '',
        bank_account_name: a.bank_account_name || '',
      });
      if (a.bank_account && !a.upi_id) setBankMethod('bank');
    }).catch(() => {
      navigate('/pandit-portal', { replace: true });
    }).finally(() => setLoading(false));
  }, [navigate]);

  async function saveBankDetails(e) {
    e.preventDefault();
    setBankSaving(true);
    try {
      const payload = bankMethod === 'upi'
        ? { upi_id: bankForm.upi_id, bank_account: null, bank_ifsc: null, bank_account_name: null }
        : { upi_id: null, bank_account: bankForm.bank_account, bank_ifsc: bankForm.bank_ifsc, bank_account_name: bankForm.bank_account_name };
      await panditProfile.updateBankDetails(payload);
      setPandit(p => ({ ...p, ...payload }));
      toast.success('Bank details saved');
      setBankOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save details');
    } finally {
      setBankSaving(false);
    }
  }

  async function submitPayoutRequest() {
    if (requesting) return;
    setRequesting(true);
    try {
      await panditProfile.requestPayout();
      setPandit(p => ({ ...p, payout_requested: true, payout_requested_at: new Date().toISOString() }));
      toast.success('Payout request sent! We will process it within 1–2 business days.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send request');
    } finally {
      setRequesting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0d0820' }}>
        <div className="text-gold-400 text-sm animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  // Filtered + paginated history
  const allConsultations = breakdown?.all || [];
  const filtered = allConsultations.filter(r => {
    if (modeFilter !== 'all' && r.mode !== modeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / HIST_PER_PAGE);
  const page = Math.min(histPage, Math.max(1, totalPages));
  const histSlice = filtered.slice((page - 1) * HIST_PER_PAGE, page * HIST_PER_PAGE);

  const avgPerSession = summary?.consultations > 0
    ? Math.round(summary.lifetimeAmount / summary.consultations)
    : 0;

  const bestDay = breakdown?.bestDay;

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(120,40,200,0.2) 0%, transparent 50%), #0d0820' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/pandit-portal"
            className="w-9 h-9 rounded-full bg-cosmic-800 border border-gold-600/20 flex items-center justify-center hover:border-gold-500/50 transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          {pandit && (
            <div className="flex items-center gap-3 min-w-0">
              <img src={pandit.photo_url} alt={pandit.display_name}
                className="w-10 h-10 rounded-full object-cover border border-gold-400/40 shrink-0"
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${pandit.display_name}`; }} />
              <div className="min-w-0">
                <h1 className="font-serif text-gold-400 text-lg leading-tight truncate">{pandit.display_name}</h1>
                <p className="text-gray-500 text-xs">Earnings Dashboard</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            <StatCard icon={IndianRupee} label="Today" value={INR(summary.todayAmount)}
              color="text-gold-400" bg="bg-gold-500/8 border-gold-500/20" />
            <StatCard icon={Calendar} label="This Week" value={INR(summary.weekAmount)}
              color="text-purple-300" bg="bg-purple-500/8 border-purple-500/20" />
            <StatCard icon={Hourglass} label="Pending" value={INR(summary.pendingAmount)}
              sub={`${summary.pendingCount} session${summary.pendingCount !== 1 ? 's' : ''}`}
              color="text-amber-400" bg="bg-amber-500/8 border-amber-500/20" />
            <StatCard icon={CheckCircle} label="Paid Out" value={INR(summary.paidAmount)}
              color="text-green-400" bg="bg-green-500/8 border-green-500/20" />
            <StatCard icon={TrendingUp} label="Lifetime" value={INR(summary.lifetimeAmount)}
              sub={`${summary.consultations} sessions`}
              color="text-blue-300" bg="bg-blue-500/8 border-blue-500/20 col-span-2 sm:col-span-1" />
          </div>
        )}

        {/* Stats row */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Sessions', value: summary.consultations },
              { label: 'Total Minutes',  value: `${summary.totalMinutes} min` },
              { label: 'Avg per Session', value: INR(avgPerSession) },
              { label: 'Best Day (30d)',  value: bestDay ? INR(bestDay.amount) : '—',
                sub: bestDay ? new Date(bestDay.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '' },
            ].map(s => (
              <div key={s.label}
                className="rounded-xl bg-cosmic-900/50 border border-gold-600/10 px-4 py-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-gray-200 text-lg font-semibold">{s.value}</p>
                {s.sub && <p className="text-gray-600 text-xs mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── Payout request + bank details ── */}
        {summary && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">

            {/* Request Payout card */}
            <div className="card-cosmic p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-gold-500" />
                  <h2 className="text-gray-200 text-sm font-medium">Request Payout</h2>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  We process payouts within 1–2 business days of your request.
                </p>
              </div>

              {pandit?.payout_requested ? (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
                  <p className="text-amber-400 text-sm font-semibold">Request Sent ✓</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Requested on {new Date(pandit.payout_requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                    We'll process it within 1–2 business days.
                  </p>
                </div>
              ) : (
                <div>
                  {!(pandit?.upi_id || pandit?.bank_account) && (
                    <p className="text-red-400/80 text-xs mb-3">
                      Add your UPI ID or bank account below before requesting.
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-400 text-xs">Pending amount</p>
                      <p className="font-serif text-gold-400 text-xl">{INR(summary.pendingAmount)}</p>
                    </div>
                    <button
                      onClick={submitPayoutRequest}
                      disabled={requesting || summary.pendingAmount <= 0 || !(pandit?.upi_id || pandit?.bank_account)}
                      className="btn-gold px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
                      {requesting ? 'Sending…' : 'Request Payout'}
                    </button>
                  </div>
                  <p className="text-gray-600 text-[10px]">
                    {summary.pendingCount} unpaid session{summary.pendingCount !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Bank Details card */}
            <div className="card-cosmic p-5">
              <button onClick={() => setBankOpen(v => !v)}
                className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <h2 className="text-gray-200 text-sm font-medium">Payment Details</h2>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Current saved method (always visible) */}
              {!bankOpen && (
                <div className="mt-3">
                  {pandit?.upi_id ? (
                    <p className="text-gray-400 text-sm">UPI: <span className="text-gold-400 font-medium">{pandit.upi_id}</span></p>
                  ) : pandit?.bank_account ? (
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <p>A/C: <span className="text-gray-200">{pandit.bank_account}</span></p>
                      <p>IFSC: <span className="text-gray-200">{pandit.bank_ifsc || '—'}</span>
                        {pandit.bank_account_name && <> · {pandit.bank_account_name}</>}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs mt-2">No payment details saved. Add UPI or bank account to enable payout requests.</p>
                  )}
                </div>
              )}

              <AnimatePresence>
                {bankOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <form onSubmit={saveBankDetails} className="mt-4 space-y-3">
                      {/* Method toggle */}
                      <div className="flex gap-2">
                        {['upi', 'bank'].map(m => (
                          <button key={m} type="button"
                            onClick={() => setBankMethod(m)}
                            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                              bankMethod === m
                                ? 'bg-gold-500/15 border-gold-500/50 text-gold-400'
                                : 'border-gold-600/15 text-gray-500 hover:text-gray-300'
                            }`}>
                            {m === 'upi' ? 'UPI / PhonePe / GPay' : 'Bank Account'}
                          </button>
                        ))}
                      </div>

                      {bankMethod === 'upi' ? (
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">UPI ID</label>
                          <input type="text" value={bankForm.upi_id}
                            onChange={e => setBankForm(f => ({ ...f, upi_id: e.target.value }))}
                            placeholder="yourname@upi or 9876543210@ybl"
                            className="input-cosmic w-full text-sm" />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Account Holder Name</label>
                            <input type="text" value={bankForm.bank_account_name}
                              onChange={e => setBankForm(f => ({ ...f, bank_account_name: e.target.value }))}
                              placeholder="As on bank passbook"
                              className="input-cosmic w-full text-sm" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Account Number</label>
                            <input type="text" value={bankForm.bank_account}
                              onChange={e => setBankForm(f => ({ ...f, bank_account: e.target.value }))}
                              placeholder="e.g. 00110123456789"
                              className="input-cosmic w-full text-sm" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">IFSC Code</label>
                            <input type="text" value={bankForm.bank_ifsc}
                              onChange={e => setBankForm(f => ({ ...f, bank_ifsc: e.target.value.toUpperCase() }))}
                              placeholder="e.g. SBIN0001234"
                              className="input-cosmic w-full text-sm tracking-wider" />
                          </div>
                        </>
                      )}

                      <button type="submit" disabled={bankSaving}
                        className="btn-gold w-full py-2.5 text-sm font-semibold disabled:opacity-60">
                        {bankSaving ? 'Saving…' : 'Save Payment Details'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

        {/* Daily chart */}
        {breakdown?.daily && (
          <div className="card-cosmic p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-gold-500" />
                <h2 className="text-gray-200 text-sm font-medium">Daily Earnings — Last 30 Days</h2>
              </div>
              <span className="text-gray-600 text-xs">
                Today highlighted
              </span>
            </div>
            <DailyBarChart data={breakdown.daily} />
          </div>
        )}

        {/* Monthly chart */}
        {breakdown?.monthly && (
          <div className="card-cosmic p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-gray-200 text-sm font-medium">Monthly Earnings — Last 12 Months</h2>
            </div>
            <MonthlyBars data={breakdown.monthly} />
          </div>
        )}

        {/* Consultation history */}
        <div className="card-cosmic p-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-gray-200 text-sm font-medium">
                Consultation History
                {filtered.length !== allConsultations.length && (
                  <span className="text-gray-500 ml-1">({filtered.length} of {allConsultations.length})</span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-3.5 h-3.5 text-gray-600" />
              <select value={modeFilter} onChange={e => { setModeFilter(e.target.value); setHistPage(1); }}
                className="bg-cosmic-900 border border-gold-600/15 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                <option value="all">All Modes</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="chat">Chat</option>
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setHistPage(1); }}
                className="bg-cosmic-900 border border-gold-600/15 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">
              No consultations yet. Your earning history will appear here.
            </p>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_56px_80px_72px_72px_56px_64px] gap-2 px-3 pb-2 border-b border-gold-600/10">
                {['Date', 'Mode', 'Duration', 'Gross', 'Comm', 'Net', 'Status'].map(h => (
                  <span key={h} className="text-[10px] text-gray-600 uppercase tracking-wider">{h}</span>
                ))}
              </div>

              <div className="space-y-2 mt-3">
                {histSlice.map(r => (
                  <div key={r.id}
                    className="rounded-xl bg-cosmic-900/40 border border-gold-600/8 px-3 py-2.5 hover:border-gold-600/25 transition-colors">
                    {/* Mobile: stacked layout */}
                    <div className="sm:hidden flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-xs font-medium">
                          {r.duration_mins} min{r.mode ? ` · ${r.mode}` : ''}
                        </p>
                        <p className="text-gray-600 text-[10px] mt-0.5">
                          {new Date(r.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}seeker paid {INR(r.gross_amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 text-sm font-semibold">{INR(r.net_amount)}</p>
                        <span className={`text-[10px] ${r.status === 'paid' ? 'text-green-500' : 'text-amber-500/70'}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                    {/* Desktop: grid row */}
                    <div className="hidden sm:grid grid-cols-[1fr_56px_80px_72px_72px_56px_64px] gap-2 items-center">
                      <span className="text-gray-400 text-xs">
                        {new Date(r.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        <span className="text-gray-600 ml-1 text-[10px]">
                          {new Date(r.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                      <span className="text-gray-500 text-xs capitalize">{r.mode || '—'}</span>
                      <span className="text-gray-400 text-xs">{r.duration_mins} min</span>
                      <span className="text-gray-300 text-xs">{INR(r.gross_amount)}</span>
                      <span className="text-gray-500 text-xs">{r.commission_percent}%</span>
                      <span className="text-gold-400 text-xs font-semibold">{INR(r.net_amount)}</span>
                      <span className={`text-[10px] font-medium ${r.status === 'paid' ? 'text-green-400' : 'text-amber-400/80'}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg bg-cosmic-900 border border-gold-600/15 text-xs text-gray-400 hover:text-gold-400 disabled:opacity-40 transition-colors">
                    ← Prev
                  </button>
                  <span className="text-gray-500 text-xs">Page {page} of {totalPages}</span>
                  <button onClick={() => setHistPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-cosmic-900 border border-gold-600/15 text-xs text-gray-400 hover:text-gold-400 disabled:opacity-40 transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-700 text-xs mt-6">
          Payouts transferred every Monday for the previous week.
          Contact support if a payout is missing.
        </p>

      </div>
    </div>
  );
}
