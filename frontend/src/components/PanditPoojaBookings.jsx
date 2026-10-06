import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, IndianRupee, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { panditPooja } from '../api';

const STATUS_LABEL = { confirmed: 'Pending', completed: 'Done', paid: 'Paid' };
const STATUS_COLOR = {
  confirmed: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  completed: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  paid:      'text-green-400 bg-green-500/15 border-green-500/30',
};

export default function PanditPoojaBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [marking, setMarking]   = useState(null);

  function load() {
    setLoading(true);
    panditPooja.getBookings()
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => toast.error('Could not load pooja bookings'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleMarkDone(id, refId) {
    if (marking) return;
    setMarking(id);
    try {
      await panditPooja.markDone(id);
      toast.success(`${refId} marked as completed!`);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'completed' } : b));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not mark as completed');
    } finally {
      setMarking(null);
    }
  }

  const pending   = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status !== 'confirmed');

  const totalPending  = pending.reduce((s, b) => s + b.your_earnings, 0);
  const totalEarned   = bookings.reduce((s, b) => s + b.your_earnings, 0);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gold-600 uppercase tracking-widest">Pooja Bookings</h3>
        <button onClick={load} className="text-gray-500 hover:text-gold-400 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-xs text-center py-4">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-4 leading-relaxed">
          No pooja bookings yet. New bookings will appear here.
        </p>
      ) : (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-600/10 px-4 py-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Pending payout</p>
              <p className="text-amber-400 font-serif text-xl">₹{totalPending.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{pending.length} puja{pending.length !== 1 ? 's' : ''} to perform</p>
            </div>
            <div className="rounded-2xl border border-gold-600/20 bg-cosmic-900/60 px-4 py-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total earned</p>
              <p className="text-gray-200 font-serif text-xl">₹{totalEarned.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Bookings list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {bookings.map(b => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-cosmic-900/50 border border-gold-600/10 px-3 py-3"
                >
                  {/* Top row — name + status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-gold-400 text-xs font-semibold truncate">{b.paath_name}{b.variant ? ` (${b.variant})` : ''}</p>
                      <p className="text-gray-300 text-xs">{b.customer_name}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[b.status] || STATUS_COLOR.confirmed}`}>
                      {STATUS_LABEL[b.status] || b.status}
                    </span>
                  </div>

                  {/* Date + time */}
                  <div className="flex items-center gap-3 mb-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(b.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {b.time_slot && <span>· {b.time_slot}</span>}
                  </div>

                  {/* Ref + intention */}
                  {(b.gotra || b.intention) && (
                    <p className="text-[10px] text-gray-600 mb-2 leading-relaxed">
                      {b.gotra ? `Gotra: ${b.gotra}` : ''}
                      {b.gotra && b.intention ? ' · ' : ''}
                      {b.intention ? b.intention.slice(0, 60) + (b.intention.length > 60 ? '…' : '') : ''}
                    </p>
                  )}

                  {/* Amount row + Mark Done button */}
                  <div className="flex items-center justify-between pt-2 border-t border-gold-600/10">
                    <div className="text-[11px]">
                      <span className="text-gray-500">Customer paid </span>
                      <span className="text-gray-300">₹{b.customer_paid?.toLocaleString('en-IN')}</span>
                      <span className="text-gray-600"> · </span>
                      <span className="text-gold-400 font-semibold">Your share ₹{b.your_earnings?.toLocaleString('en-IN')}</span>
                      {b.status === 'paid' && (
                        <span className="ml-1 text-green-500">✓ Paid</span>
                      )}
                    </div>
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleMarkDone(b.id, b.ref_id)}
                        disabled={marking === b.id}
                        className="text-[10px] bg-green-500/20 border border-green-500/40 text-green-400 px-2.5 py-1 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 shrink-0 ml-2"
                      >
                        {marking === b.id ? '…' : '✓ Mark Done'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">Ref: {b.ref_id}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
