import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';

/**
 * Asks for the contact detail an account is missing.
 *
 * Registration used to accept an email *or* a phone number, so most accounts —
 * seekers and astrologers both — carry only one. There was then no way to reach
 * somebody about the reading they had booked. New accounts must give both; the
 * ones that already exist are asked at sign-in, here.
 *
 * Dismissable on purpose. Nobody is locked out of a site they have already paid
 * into over a detail we forgot to ask for the first time; it simply asks again
 * next time.
 *
 * Props:
 *   missing  – { email: bool, phone: bool }
 *   onSave   – async ({ email?, phone? }) => void, throws with a message
 *   onSkip   – called when dismissed
 *   who      – 'seeker' | 'astrologer', only changes the wording
 */
export default function CompleteContactPrompt({ missing, onSave, onSkip, who = 'seeker' }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {};
    if (missing.email) payload.email = email.trim();
    if (missing.phone) payload.phone = phone.trim();

    if (missing.email && !payload.email) return setError('Please enter your email address.');
    if (missing.phone && !payload.phone) return setError('Please enter your mobile number.');

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const both = missing.email && missing.phone;

  // Attached to the body rather than rendered in place. The Pandit Portal draws
  // its page inside an animated container, and a transformed ancestor makes
  // `position: fixed` behave like `absolute` — so the prompt appeared pinned to
  // the bottom of the page instead of centred on the screen.
  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="card-cosmic p-6 w-full max-w-sm">
        <h3 className="font-serif text-gold-400 text-lg mb-1">
          {both ? 'How can we reach you?' : missing.email ? 'What is your email?' : 'What is your mobile number?'}
        </h3>
        <p className="text-cosmic-400 text-xs leading-relaxed mb-5">
          {who === 'astrologer'
            ? 'We keep both on your record so we can send your payout details and reach you about a booking.'
            : 'We keep both on your account so we can send your booking details and reach you if a session needs changing.'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {missing.email && (
            <div>
              <label className="text-xs text-cosmic-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" autoComplete="email"
                className="input-cosmic w-full text-sm" />
            </div>
          )}

          {missing.phone && (
            <div>
              <label className="text-xs text-cosmic-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Mobile number
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" autoComplete="tel" inputMode="numeric"
                className="input-cosmic w-full text-sm" />
            </div>
          )}

          {error && <p className="text-amber-300 text-xs leading-relaxed">{error}</p>}

          <button type="submit" disabled={saving}
            className="btn-cosmic w-full py-2.5 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onSkip}
            className="w-full text-cosmic-500 hover:text-cosmic-300 text-xs transition-colors">
            Not now
          </button>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
