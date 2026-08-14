import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIButton() {
  const location = useLocation();
  const [showLabel, setShowLabel] = useState(false);

  if (location.pathname === '/chat' || location.pathname === '/pandit' || location.pathname.startsWith('/consult/')) return null;

  return (
    // Tucked tighter into the corner on a phone. At 24px in from a 390px screen
    // a 56px button — with pulse rings reaching twice that — sat on top of the
    // right-hand end of every centred row it passed, and covered the Pisces and
    // Sagittarius chips, which are meant to be tapped.
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#2d0e5e,#1a0845)', border: '1px solid rgba(201,168,76,0.5)', color: '#E8C547', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              AstroVyoma AI से बात करें ✦
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/chat"
        className="pointer-events-auto"
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        title="Talk to AstroVyoma AI"
      >
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3d1a6e 0%, #1a0845 100%)', border: '2px solid rgba(201,168,76,0.7)', boxShadow: '0 0 24px rgba(201,168,76,0.25), 0 8px 32px rgba(0,0,0,0.5)' }}>

          {/* Outer pulse ring 1 */}
          <motion.div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(201,168,76,0.5)' }}
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.7, 0, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />

          {/* Outer pulse ring 2 */}
          <motion.div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(201,168,76,0.35)' }}
            animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />

          {/* Icon */}
          <motion.span
            className="text-gold-400 text-2xl select-none"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >✦</motion.span>
        </div>
      </Link>
    </div>
  );
}
