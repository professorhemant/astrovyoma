import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-8xl mb-6 select-none">✦</div>
          <h1 className="font-serif text-7xl text-gold-400 mb-4" style={{ textShadow: '0 0 40px rgba(201,168,76,0.5)' }}>404</h1>
          <p className="text-gray-300 text-xl font-serif mb-2">Lost in the cosmos</p>
          <p className="text-gray-300 text-sm mb-10 max-w-sm">The stars couldn't find the page you're looking for. It may have shifted with the planets.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-gold px-8 py-3">Return Home</Link>
            <Link to="/astrologers" className="btn-outline-gold px-8 py-3">Consult an Astrologer</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
