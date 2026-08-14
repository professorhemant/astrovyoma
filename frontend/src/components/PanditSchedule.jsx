import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Plus, X, Check } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Half-hour steps from 5 AM to 11 PM. Wide enough for an astrologer who starts
// at Brahma muhurta and one who only reads in the evening.
const TIMES = (() => {
  const out = [];
  for (let m = 5 * 60; m <= 23 * 60; m += 30) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    const h12 = (Math.floor(m / 60) % 12) || 12;
    out.push({ v: `${hh}:${mm}`, l: `${h12}:${mm} ${Math.floor(m / 60) < 12 ? 'am' : 'pm'}` });
  }
  return out;
})();

const pretty = (hhmm) => TIMES.find(t => t.v === hhmm)?.l || hhmm;

const prettyDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-IN',
    { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const todayISO = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

// ─────────────────────────────────────────────────────────────────────────────
// When she works.
//
// Before this the site sold every astrologer from 8 AM to 9 PM, seven days a
// week, whether or not that was true. Kept to one window a day on purpose: a
// morning-and-evening split is a second screen's worth of fiddling, and an
// astrologer can block the odd afternoon as a day off instead.
// ─────────────────────────────────────────────────────────────────────────────
function Hours({ token }) {
  const [days, setDays]   = useState(null);
  const [off, setOff]     = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');
  const [newOff, setNewOff] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/pandit/availability`, { headers })
      .then(r => { setDays(r.data.days); setOff(r.data.off || []); })
      .catch(() => setError('Could not load your hours.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const edit = (i, patch) => setDays(ds => ds.map((d, n) => (n === i ? { ...d, ...patch } : d)));

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const r = await axios.put(`${API}/pandit/availability`, { days, off }, { headers });
      setDays(r.data.days); setOff(r.data.off || []);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!days) {
    return <p className="text-gray-500 text-xs text-center py-4">{error || 'Loading your hours…'}</p>;
  }

  return (
    <div>
      <p className="text-gray-500 text-[11px] leading-relaxed mb-3">
        Seekers can only book you inside these hours. Turn a day off and nothing
        can be booked that day at all.
      </p>

      <div className="space-y-1.5">
        {days.map((d, i) => (
          <div key={d.day} className="flex items-center gap-2 rounded-xl border border-gold-600/15 bg-cosmic-900/40 px-3 py-2">
            <button type="button" onClick={() => edit(i, { working: !d.working })}
              className={`w-24 shrink-0 text-left text-xs font-medium transition-colors ${d.working ? 'text-gray-200' : 'text-gray-600'}`}>
              {d.name}
            </button>

            <button type="button" onClick={() => edit(i, { working: !d.working })}
              className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${d.working ? 'bg-green-500/40' : 'bg-cosmic-700'}`}
              aria-label={`${d.name}: ${d.working ? 'working' : 'day off'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white/90 transition-all ${d.working ? 'left-[22px]' : 'left-0.5'}`} />
            </button>

            {d.working ? (
              <div className="flex items-center gap-1.5 ml-auto">
                <select value={d.from} onChange={e => edit(i, { from: e.target.value })}
                  className="bg-cosmic-900 border border-gold-600/20 rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-gold-500/50">
                  {TIMES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
                <span className="text-gray-600 text-xs">to</span>
                <select value={d.to} onChange={e => edit(i, { to: e.target.value })}
                  className="bg-cosmic-900 border border-gold-600/20 rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-gold-500/50">
                  {TIMES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
            ) : (
              <span className="ml-auto text-gray-600 text-xs">Day off</span>
            )}
          </div>
        ))}
      </div>

      {/* Specific dates off — travel, illness, a festival at home. */}
      <div className="mt-4">
        <p className="text-[10px] text-gold-600 uppercase tracking-widest mb-2">Days off</p>
        {off.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {off.map(d => (
              <span key={d} className="inline-flex items-center gap-1.5 text-[11px] bg-cosmic-900/70 border border-gold-600/20 rounded-full pl-3 pr-1.5 py-1 text-gray-300">
                {prettyDate(d)}
                <button type="button" onClick={() => setOff(o => o.filter(x => x !== d))}
                  className="text-gray-500 hover:text-red-400 transition-colors" aria-label={`Remove ${d}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="date" value={newOff} min={todayISO()} onChange={e => setNewOff(e.target.value)}
            className="flex-1 bg-cosmic-900 border border-gold-600/20 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-gold-500/50 [color-scheme:dark]" />
          <button type="button" disabled={!newOff || off.includes(newOff)}
            onClick={() => { setOff(o => [...o, newOff].sort()); setNewOff(''); }}
            className="px-3 rounded-xl border border-gold-600/25 text-gold-400 text-xs hover:border-gold-500/60 disabled:opacity-40 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="btn-gold w-full mt-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-60">
        {saving ? 'Saving…' : saved ? <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4" />Saved</span> : 'Save my hours'}
      </button>
      {error && <p className="text-red-400 text-[11px] text-center mt-2">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Who has booked her. Appointments were being taken and there was nowhere she
// could see one.
// ─────────────────────────────────────────────────────────────────────────────
function Appointments({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/pandit/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => setData({ upcoming: [], past: [] }));
  }, [token]);

  if (!data) return <p className="text-gray-500 text-xs text-center py-4">Loading…</p>;

  if (!data.upcoming.length && !data.past.length) {
    return (
      <p className="text-gray-500 text-xs text-center py-4 leading-relaxed">
        Nobody has booked a session yet. Anything booked with you appears here,
        with the date, the length and what they want to talk about.
      </p>
    );
  }

  const Row = ({ a, faded }) => {
    const when = new Date(a.scheduled_at);
    return (
      <div className={`rounded-xl border px-3 py-2.5 ${faded ? 'border-cosmic-800 bg-cosmic-900/30 opacity-60' : 'border-gold-600/20 bg-cosmic-900/50'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gray-200 text-xs font-medium">
              {when.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
              {' · '}
              {when.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
            </p>
            <p className="text-gray-500 text-[10px] mt-0.5">
              {a.duration_mins} min · {a.mode} · {a.seeker}
              {a.concern_category && a.concern_category !== 'general' ? ` · ${a.concern_category}` : ''}
            </p>
            {a.concern_notes && (
              <p className="text-gray-400 text-[10px] mt-1 italic line-clamp-2">“{a.concern_notes}”</p>
            )}
          </div>
          <span className="text-gold-400 text-xs shrink-0">₹{Number(a.amount).toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      {data.upcoming.map(a => <Row key={a.id} a={a} />)}
      {data.past.length > 0 && (
        <>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest pt-3 pb-1">Already given</p>
          {data.past.map(a => <Row key={a.id} a={a} faded />)}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PanditSchedule({ token }) {
  return (
    <>
      <div className="mt-6">
        <h3 className="text-xs text-gold-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> My hours
        </h3>
        <Hours token={token} />
      </div>

      <div className="mt-6">
        <h3 className="text-xs text-gold-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Booked with me
        </h3>
        <Appointments token={token} />
      </div>
    </>
  );
}
