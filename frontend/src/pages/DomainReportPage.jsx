import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollDatePicker from '../components/ScrollDatePicker';
import toast from 'react-hot-toast';
import { Bookmark } from 'lucide-react';
import { domainReport, reportHistory as historyApi } from '../api';
import BirthPlacePicker from '../components/BirthPlacePicker';
import { useAuth } from '../context/AuthContext';

const DOMAIN_TABS = [
  { key: 'career',  label: 'Career',  icon: '💼', color: 'from-blue-600 to-indigo-700' },
  { key: 'love',    label: 'Love',    icon: '❤️', color: 'from-rose-600 to-pink-700' },
  { key: 'finance', label: 'Finance', icon: '💰', color: 'from-emerald-600 to-green-700' },
  { key: 'health',  label: 'Health',  icon: '🌿', color: 'from-teal-600 to-cyan-700' },
];

const LABEL_COLORS = {
  'Excellent':       'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  'Good':            'text-blue-400   border-blue-500/40   bg-blue-500/10',
  'Average':         'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  'Needs Attention': 'text-red-400    border-red-500/40    bg-red-500/10',
};

const SCORE_COLORS = {
  'Excellent':       '#34d399',
  'Good':            '#60a5fa',
  'Average':         '#fbbf24',
  'Needs Attention': '#f87171',
};

function ScoreGauge({ score, label }) {
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  const color = SCORE_COLORS[label] || '#e8c547';
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="serif">
          {score.toFixed(1)}
        </text>
        <text x="65" y="78" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">
          / 10
        </text>
      </svg>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${LABEL_COLORS[label] || 'text-gold-400'}`}>
        {label}
      </span>
    </div>
  );
}

function DomainPanel({ data, config }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header row */}
      <div className="card-cosmic p-5 flex flex-col sm:flex-row items-center gap-5">
        <ScoreGauge score={data.score} label={data.label} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-xl font-serif text-gold-400">{config.label} Domain</h3>
          </div>
          <p className="text-cosmic-200 text-sm leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Current Dasha Period */}
      {data.currentPeriod && (
        <div className="card-cosmic p-4 border-l-4 border-gold-500/60">
          <p className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-1">
            Current Dasha Period — {data.currentPeriod.planet}
          </p>
          <p className="text-cosmic-200 text-sm">{data.currentPeriod.insight}</p>
        </div>
      )}

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-cosmic p-4">
          <h4 className="text-emerald-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <span>✦</span> Strengths
          </h4>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-cosmic-200 text-sm flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5 shrink-0">▸</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-cosmic p-4">
          <h4 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <span>⚠</span> Challenges
          </h4>
          <ul className="space-y-2">
            {data.challenges.map((c, i) => (
              <li key={i} className="text-cosmic-200 text-sm flex items-start gap-2">
                <span className="text-amber-400 mt-0.5 shrink-0">▸</span>{c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Remedies */}
      {data.remedies && data.remedies.length > 0 && (
        <div className="card-cosmic p-4">
          <h4 className="text-gold-400 font-semibold text-sm mb-3">Remedies & Recommendations</h4>
          <ul className="space-y-2">
            {data.remedies.map((r, i) => (
              <li key={i} className="text-cosmic-200 text-sm flex items-start gap-2">
                <span className="text-gold-500 mt-0.5 shrink-0">✦</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export default function DomainReportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ dob: '', tob: '', lat: '', lng: '', timezone: '', place: '' });
  const [activeTab, setActiveTab] = useState('career');
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dob || !form.lat || !form.lng) { setError('Please fill all fields and select a city.'); return; }
    setLoading(true); setError(''); setReport(null);
    try {
      const { data } = await domainReport.generate(form);
      setReport(data);
      setActiveTab('career');
      setSaved(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate report. Please try again.');
    } finally { setLoading(false); }
  };

  const activeDomain   = report?.domains?.[activeTab];
  const activeTabConfig = DOMAIN_TABS.find(t => t.key === activeTab);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <div className="text-5xl mb-4">🔭</div>
          <h1 className="text-3xl font-serif text-gold-400 mb-2">Life Domain Reports</h1>
          <p className="text-cosmic-300 text-sm max-w-xl mx-auto">
            Comprehensive Vedic analysis of your Career, Love, Finance &amp; Health domains based on your birth chart.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card-cosmic p-6 mb-8">
          <h2 className="text-gold-400 font-serif text-lg mb-5">Enter Birth Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-cosmic-400 mb-1">Date of Birth</label>
                <ScrollDatePicker value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} />
              </div>
              <div>
                <label className="block text-xs text-cosmic-400 mb-1">Time of Birth</label>
                <input type="time" className="input-cosmic w-full"
                  value={form.tob} onChange={e => setForm(f => ({ ...f, tob: e.target.value }))} />
              </div>
            </div>
            <div>
              <BirthPlacePicker
                label="Birth City"
                required
                value={form.place}
                onChange={p => setForm(f => ({ ...f, lat: p.lat, lng: p.lng, timezone: p.timezone, place: p.place }))}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-cosmic w-full py-3 text-sm font-semibold disabled:opacity-60">
              {loading ? '✦ Generating Report…' : '✦ Generate Domain Report'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {report && (
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

              {/* Birth summary */}
              <div className="card-cosmic p-4 mb-6">
              {user && (
                <div className="flex justify-end mb-3">
                  <button onClick={async () => {
                    if (saved) return;
                    setSaving(true);
                    try {
                      await historyApi.save({
                        type: 'domain',
                        title: `${report.lagna} Lagna — Life Domain Report`,
                        meta: { dob: form.dob, birth_place: form.place, lagna: report.lagna, moon_sign: report.moonSign, nakshatra: report.nakshatra },
                      });
                      setSaved(true);
                      toast.success('Domain Report saved to History!');
                    } catch { toast.error('Could not save to history'); }
                    finally { setSaving(false); }
                  }} disabled={saving || saved}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                    {saved ? 'Saved' : saving ? 'Saving…' : 'Save to History'}
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label:'Lagna',     value: report.lagna },
                  { label:'Moon Sign', value: report.moonSign },
                  { label:'Sun Sign',  value: report.sunSign },
                  { label:'Nakshatra', value: report.nakshatra },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-xs text-cosmic-500 mb-0.5">{item.label}</div>
                    <div className="text-gold-400 font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
              </div>

              {/* Dasha banner */}
              {report.currentDasha && (
                <div className="card-cosmic p-3 mb-6 flex flex-wrap items-center gap-3 text-sm text-center sm:text-left">
                  <span className="text-gold-500 font-semibold">Current Mahadasha:</span>
                  <span className="text-cosmic-200">{report.currentDasha}</span>
                  {report.dashaBalance && (
                    <span className="text-cosmic-400 text-xs ml-auto">{report.dashaBalance} remaining</span>
                  )}
                </div>
              )}

              {/* Overview score row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {DOMAIN_TABS.map(tab => {
                  const d = report.domains[tab.key];
                  const color = SCORE_COLORS[d?.label] || '#e8c547';
                  return (
                    <button key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`card-cosmic p-4 flex flex-col items-center gap-2 transition-all ${activeTab === tab.key ? 'ring-2 ring-gold-500/60' : 'hover:ring-1 hover:ring-gold-500/30'}`}
                    >
                      <span className="text-2xl">{tab.icon}</span>
                      <span className="text-xs text-cosmic-400">{tab.label}</span>
                      <span className="font-bold text-lg" style={{ color }}>{d?.score?.toFixed(1)}</span>
                      <span className="text-xs" style={{ color }}>{d?.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active domain detail */}
              {activeDomain && activeTabConfig && (
                <DomainPanel data={activeDomain} config={activeTabConfig} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
