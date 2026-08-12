import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Shown when the signed-in seeker account shares a phone number with an
 * astrologer profile — i.e. an astrologer has signed in on the customer side of
 * the site by mistake.
 *
 * This is not a hypothetical. On 2026-08-12 Seema Sharma signed in here, saw her
 * own name in the header, and reasonably assumed she was available. Her
 * astrologer profile stayed offline, a seeker called her, waited in an empty
 * channel and was billed for it. Two logins for one person needs saying out
 * loud, at the moment the mistake is being made.
 *
 * Louder while she is offline, since that is the case that costs someone money.
 * Dismissable, and remembered for the session so it does not nag.
 */
export default function AstrologerPortalNotice() {
  const { user } = useAuth();
  const profile = user?.astrologer_profile;
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('av_portal_notice_dismissed') === '1'
  );

  if (!profile || dismissed) return null;

  const offline = !profile.is_online;

  function dismiss() {
    sessionStorage.setItem('av_portal_notice_dismissed', '1');
    setDismissed(true);
  }

  return (
    <div
      className={`relative z-30 px-4 py-2.5 text-sm ${
        offline
          ? 'bg-amber-500/15 border-b border-amber-400/30'
          : 'bg-cosmic-800/80 border-b border-gold-600/20'
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <Radio className={`w-4 h-4 flex-shrink-0 ${offline ? 'text-amber-300' : 'text-green-400'}`} />
        <p className="flex-1 text-gray-200">
          {offline ? (
            <>
              You are signed in as a customer, and <strong>{profile.display_name}</strong> is
              showing as <strong>offline</strong> to seekers. Going online happens in the
              Pandit Portal, not here.
            </>
          ) : (
            <>
              This is your customer account. Your astrologer profile{' '}
              <strong>{profile.display_name}</strong> is online.
            </>
          )}
        </p>
        <Link
          to="/pandit-portal"
          className="flex-shrink-0 btn-gold px-3 py-1.5 rounded-full text-xs font-semibold"
        >
          Open Pandit Portal
        </Link>
        <button onClick={dismiss} aria-label="Dismiss" className="text-gray-400 hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
