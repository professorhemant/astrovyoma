import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { appointments as apptApi } from '../api';

const MODE_ICON = { chat:'💬', voice:'🎙', video:'📹' };
const STATUS_STYLE = {
  confirmed:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending:    'bg-amber-500/15   text-amber-400   border-amber-500/30',
  completed:  'bg-blue-500/15    text-blue-400    border-blue-500/30',
  cancelled:  'bg-red-500/15     text-red-400     border-red-500/30',
};

function AppointmentCard({ appt, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const ast       = appt.astrologer || {};
  const isUpcoming= new Date(appt.scheduled_at) > new Date() && appt.status !== 'cancelled';
  const statusCls = STATUS_STYLE[appt.status] || STATUS_STYLE.confirmed;

  const scheduledIST = new Date(appt.scheduled_at).toLocaleString('en-IN', {
    weekday:'short', day:'numeric', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Kolkata'
  });

  const minsUntil = (new Date(appt.scheduled_at) - new Date()) / 60000;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await apptApi.cancel(appt.id, { reason: 'User cancelled' });
      toast.success('Appointment cancelled.');
      onCancel(appt.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not cancel appointment.');
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="card-cosmic p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gold-500/20 flex items-center justify-center text-xl shrink-0">
          {ast.photo_url ? <img src={ast.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : '🔮'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-cosmic-100">{ast.display_name || 'Astrologer'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusCls}`}>
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </span>
          </div>

          <div className="text-xs text-cosmic-400 mb-2">
            {scheduledIST} · {appt.duration_mins} min · {MODE_ICON[appt.mode] || '💬'} {appt.mode}
          </div>

          {appt.concern_category && appt.concern_category !== 'general' && (
            <div className="text-xs text-cosmic-500 mb-2">
              Topic: <span className="text-cosmic-300">{appt.concern_category}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gold-400 font-medium">₹{parseFloat(appt.amount).toFixed(0)}</span>

            {isUpcoming && minsUntil > 60 && (
              <button onClick={() => setShowConfirm(true)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/10">
                Cancel
              </button>
            )}
            {isUpcoming && minsUntil <= 60 && minsUntil > 0 && (
              <span className="text-xs text-amber-400 font-medium">
                🔔 Starting in {Math.ceil(minsUntil)} min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cancel confirm inline */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-red-500/20">
            <p className="text-sm text-cosmic-300 mb-3">Cancel this appointment? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 text-sm border border-cosmic-700 text-cosmic-400 rounded-lg hover:bg-white/5 transition-colors">
                Keep it
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-2 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-60">
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyAppointmentsPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [past,     setPast]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('upcoming');

  useEffect(() => {
    apptApi.getMy()
      .then(r => { setUpcoming(r.data.upcoming); setPast(r.data.past); })
      .catch(() => toast.error('Could not load appointments.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = (id) => {
    setUpcoming(prev => prev.filter(a => a.id !== id));
  };

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="relative z-10 min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <div className="text-4xl mb-3">📅</div>
          <h1 className="text-2xl font-serif text-gold-400">My Appointments</h1>
          <p className="text-cosmic-400 text-sm mt-1">Scheduled sessions with your astrologers</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cosmic-900 rounded-xl p-1 border border-gold-500/10 mb-6">
          {[
            { k:'upcoming', l:`Upcoming (${upcoming.length})` },
            { k:'past',     l:`Past (${past.length})` },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.k ? 'bg-gold-500/20 text-gold-400' : 'text-cosmic-500 hover:text-cosmic-300'}`}>
              {t.l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gold-400 animate-pulse font-serif">✦ Loading…</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl">{tab === 'upcoming' ? '🗓️' : '📖'}</div>
            <p className="text-cosmic-500">
              {tab === 'upcoming'
                ? 'No upcoming appointments.'
                : 'No past appointments yet.'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/astrologers" className="btn-cosmic px-6 py-2.5 text-sm inline-block mt-2">
                Book a Session →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(a => (
              <AppointmentCard key={a.id} appt={a} onCancel={handleCancel} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/astrologers" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            + Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
