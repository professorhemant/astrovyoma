import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { referral as referralApi } from '../api';

export default function ReferralRedirectPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [astrologer, setAstrologer] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'found' | 'invalid'

  useEffect(() => {
    referralApi.getInfo(code)
      .then(res => {
        setAstrologer(res.data);
        setStatus('found');
        // Store the code so RegisterPage can pick it up even if the user browses
        // around before signing up.
        try { localStorage.setItem('astrovyoma_ref', code.toUpperCase()); } catch {}
        // Short pause so the user reads the "referred by" message, then forward.
        setTimeout(() => navigate('/register'), 2200);
      })
      .catch(() => {
        setStatus('invalid');
        setTimeout(() => navigate('/register'), 2000);
      });
  }, [code]);

  return (
    <div className="min-h-screen bg-cosmic-950 flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at top, #1a1060 0%, #0A0E2A 40%, #04051A 100%)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm">
        {status === 'loading' && (
          <div className="text-gold-400 font-serif text-xl animate-pulse">✦ Verifying…</div>
        )}

        {status === 'found' && astrologer && (
          <>
            <div className="text-5xl mb-4">✦</div>
            <h1 className="font-serif text-2xl text-gold-400 mb-2">
              {astrologer.display_name} invited you!
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Create a free account and get <span className="text-gold-400 font-semibold">₹50</span> in your wallet.
              Your first consultation earns{' '}
              <span className="text-gold-400 font-semibold">₹25 bonus</span> for {astrologer.display_name}.
            </p>
            <div className="text-gray-500 text-xs animate-pulse">Redirecting to sign up…</div>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="text-4xl mb-4 text-gray-600">✦</div>
            <p className="text-gray-400 text-sm mb-2">This referral link doesn't seem to be valid.</p>
            <p className="text-gray-500 text-xs animate-pulse">Redirecting you to sign up anyway…</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
