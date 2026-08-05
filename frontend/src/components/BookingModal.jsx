import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { pooja as poojaApi } from '../api';
import { loadRazorpay as loadRazorpayScript } from '../utils/razorpay';

const TIME_SLOTS = [
  'Morning (5:30 – 8:00 AM)',
  'Morning (8:00 – 11:00 AM)',
  'Afternoon (11:00 AM – 2:00 PM)',
  'Evening (4:00 – 7:00 PM)',
  'Flexible (Pandit Ji\'s discretion)',
];

export default function BookingModal({ paath, onClose }) {
  const [form, setForm] = useState({
    name: '', mobile: '', date: '', timeSlot: TIME_SLOTS[0],
    gotra: '', intention: '',
    variant: paath?.variants ? paath.variants[0].label : null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  if (!paath) return null;

  const activeVariant = paath.variants?.find(v => v.label === form.variant);
  const price        = activeVariant ? activeVariant.price        : paath.price;
  const originalPrice = activeVariant ? activeVariant.originalPrice : paath.originalPrice;
  const discount     = Math.round((1 - price / originalPrice) * 100);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())                 { toast.error('Please enter your name'); return; }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) { toast.error('Enter a valid 10-digit Indian mobile number'); return; }
    if (!form.date)                        { toast.error('Please select a preferred date'); return; }

    setSubmitting(true);

    try {
      // Step 1 — create Razorpay order on backend
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setSubmitting(false);
        return;
      }

      const orderRes = await poojaApi.createOrder({ paathId: paath.id, ...form });
      const { order_id, amount, currency, key } = orderRes.data;

      // Step 2 — open Razorpay checkout
      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        order_id,
        name:        'AstroVyoma',
        description: `${paath.name}`,
        image:       '/vite.svg',
        prefill:     { name: form.name, contact: form.mobile },
        theme:       { color: '#C9A84C' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast('Payment cancelled. Your booking was not confirmed.', { icon: 'ℹ️' });
          },
        },
        handler: async (response) => {
          // Step 3 — verify payment + confirm booking
          try {
            const verifyRes = await poojaApi.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              paathId:    paath.id,
              name:       form.name,
              mobile:     form.mobile,
              date:       form.date,
              timeSlot:   form.timeSlot,
              gotra:      form.gotra,
              intention:  form.intention,
              variant:    form.variant,
            });
            setConfirmed(verifyRes.data);
            toast.success('Booking confirmed! 🙏');
          } catch (err) {
            const msg = err.response?.data?.error || 'Payment verification failed';
            toast.error(`${msg}. Please contact support with your payment ID: ${response.razorpay_payment_id}`);
            setSubmitting(false);
          }
        },
      });

      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setSubmitting(false);
      });

      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const gradStyle = {
    background: `linear-gradient(135deg, ${paath.gradient[0]}, ${paath.gradient[1]})`,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-cosmic-950/85 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-cosmic-800 border border-gold-500/40 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Modal header */}
          <div className="relative p-6 pb-4 rounded-t-3xl overflow-hidden" style={gradStyle}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/90 hover:text-white bg-black/20 rounded-full p-1.5 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="text-5xl mb-2">{paath.icon}</div>
            <p className="text-white/80 text-xs uppercase tracking-widest mb-1">{paath.deity}</p>
            <h2 className="text-white font-serif text-xl font-bold leading-tight">{paath.name}</h2>
            <p className="text-white/90 text-sm">{paath.subtitle}</p>
          </div>

          <div className="p-6">
            {confirmed ? (
              /* ── Confirmation screen ── */
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-green-400 mb-1">Booking Confirmed!</h3>
                <p className="text-gray-400 text-sm mb-4">Payment received — your paath is scheduled.</p>

                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-4 text-left">
                  <p className="text-white font-semibold text-sm mb-1">
                    Reference ID: <span className="text-gold-400 font-bold">{confirmed.refId}</span>
                  </p>
                  <p className="text-gray-300 text-xs">Please save this ID for your records.</p>
                </div>

                <div className="bg-cosmic-900/60 border border-gold-500/25 rounded-2xl p-4 text-left space-y-2 mb-5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-200">Paath</span><span className="text-white font-medium text-right max-w-[200px]">{paath.name}</span></div>
                  {form.variant && <div className="flex justify-between"><span className="text-gray-200">Times</span><span className="text-white">{form.variant}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-200">Name</span><span className="text-white">{form.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-200">WhatsApp</span><span className="text-white">{form.mobile}</span></div>
                  <div className="flex justify-between"><span className="text-gray-200">Date</span><span className="text-white">{new Date(form.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span></div>
                  <div className="flex justify-between font-bold border-t border-gold-500/20 pt-2 mt-1">
                    <span className="text-gold-400">Amount Paid</span><span className="text-gold-400">₹{price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left mb-5">
                  <p className="text-amber-300 font-semibold text-sm mb-2">📲 What happens next:</p>
                  <ol className="text-gray-300 text-sm space-y-1.5 list-decimal ml-4">
                    <li>Our Pandit Ji will perform the paath on your chosen date</li>
                    <li>A video of sankalp related to your paath will be sent to <strong className="text-white">{form.mobile}</strong> on WhatsApp within 24 hours</li>
                  </ol>
                </div>

                <button onClick={onClose} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold rounded-xl py-3">
                  Done
                </button>
              </motion.div>
            ) : (
              /* ── Booking form ── */
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Variant selector (Sunderkand) */}
                {paath.variants && (
                  <div>
                    <label className="block text-gray-300 text-xs uppercase tracking-wider mb-2">Number of Times</label>
                    <div className="grid grid-cols-3 gap-2">
                      {paath.variants.map(v => (
                        <button key={v.label} type="button"
                          onClick={() => set('variant', v.label)}
                          className={`py-2 px-2 rounded-xl border text-sm font-medium transition-all ${form.variant === v.label ? 'border-gold-500 bg-gold-500/15 text-gold-300' : 'border-gold-500/25 text-gray-200 hover:border-gold-500/45'}`}
                        >
                          <div>{v.label}</div>
                          <div className="text-xs font-bold mt-0.5" style={{ color: form.variant === v.label ? '#C9A84C' : '#666' }}>₹{v.price.toLocaleString('en-IN')}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price summary */}
                <div className="flex items-center justify-between bg-cosmic-900/60 border border-gold-500/25 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-gray-200 text-xs">Paath Fee</p>
                    <p className="text-gold-400 font-bold text-xl">₹{price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
                    <p className="text-green-400 text-xs font-semibold">Save {discount}%</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-gray-300 text-xs uppercase tracking-wider mb-1.5">Your Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className="w-full bg-cosmic-900/60 border border-gold-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/70 placeholder-gray-600" />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-gray-300 text-xs uppercase tracking-wider mb-1.5">WhatsApp Mobile Number * <span className="text-gold-400/70 normal-case">(video will be sent here)</span></label>
                  <input value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/,''))} required
                    placeholder="10-digit mobile number" maxLength={10}
                    className="w-full bg-cosmic-900/60 border border-gold-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/70 placeholder-gray-600" />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-xs uppercase tracking-wider mb-1.5">Preferred Date *</label>
                    <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className="w-full bg-cosmic-900/60 border border-gold-500/30 rounded-xl px-3 py-2.5 text-gold-300 text-sm focus:outline-none focus:border-gold-500/70 [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs uppercase tracking-wider mb-1.5">Preferred Time</label>
                    <select value={form.timeSlot} onChange={e => set('timeSlot', e.target.value)}
                      className="w-full bg-cosmic-900/60 border border-gold-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/70 cursor-pointer">
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Gotra */}
                <div>
                  <label className="block text-gray-300 text-xs uppercase tracking-wider mb-1.5">Gotra <span className="text-gray-300 normal-case">(optional — for Sankalp)</span></label>
                  <input value={form.gotra} onChange={e => set('gotra', e.target.value)}
                    placeholder="e.g. Kashyap, Bharadwaj, Vashishtha"
                    className="w-full bg-cosmic-900/60 border border-gold-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/70 placeholder-gray-600" />
                </div>

                {/* Intention */}
                <div>
                  <label className="block text-gray-300 text-xs uppercase tracking-wider mb-1.5">Your Intention / Sankalp <span className="text-gray-300 normal-case">(optional)</span></label>
                  <textarea value={form.intention} onChange={e => set('intention', e.target.value)} rows={2}
                    placeholder="e.g. For good health, for my son's career, for removal of obstacles…"
                    className="w-full bg-cosmic-900/60 border border-gold-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/70 placeholder-gray-600 resize-none" />
                </div>

                {/* Info note */}
                <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl px-4 py-3 text-xs text-gray-300 leading-relaxed">
                  📲 A video of sankalp related to your paath will be sent to your WhatsApp number within 24 hours of completion. Payment details will be shared after booking confirmation.
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold text-sm rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? '⏳ Opening Payment...' : `💳 Pay & Confirm — ₹${price.toLocaleString('en-IN')}`}
                </button>

                <p className="text-center text-gray-500 text-xs">
                  🔒 Secured by Razorpay · UPI · Cards · NetBanking
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
