import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, Star, MessageCircle, Map } from 'lucide-react';
import { kundali as kundaliApi } from '../api';
import SwastikBorder from '../components/SwastikBorder';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kundali, setKundali] = useState(null);

  useEffect(() => {
    kundaliApi.getMyKundali().then(res => setKundali(res.data)).catch(() => {});
  }, []);

  const dashas = kundali?.dasha_sequence || [];
  const now = new Date();
  const currentDasha = dashas.find(d => now >= new Date(d.start) && now <= new Date(d.end));

  const quickLinks = [
    { icon: '🔮', label: 'View Kundali', desc: 'Your complete birth chart', onClick: () => navigate('/kundali') },
    { icon: '✨', label: 'Find Purpose', desc: 'Soul blueprint & purpose', onClick: () => navigate('/purpose') },
    { icon: '🌟', label: 'Talk to Astrologer', desc: 'Expert guidance now', onClick: () => navigate('/astrologers') },
    { icon: '🤖', label: 'Talk to AstroVyoma AI', desc: 'Your personal AI astrologer', onClick: () => navigate('/chat') },
  ];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gold-400">{user?.name} ✦</h1>
          <p className="text-gray-200 mt-1">Your cosmic journey continues</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card-cosmic p-5 flex items-center gap-4 cursor-pointer" onClick={() => navigate('/wallet')}>
            <div className="p-3 rounded-full bg-gold-600/15 border border-gold-600/20">
              <Wallet className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <div className="text-gray-300 text-xs">Wallet Balance</div>
              <div className="font-serif text-2xl text-gold-400">₹{parseFloat(user?.wallet_balance || 0).toFixed(0)}</div>
            </div>
          </motion.div>

          {kundali && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card-cosmic p-5 flex items-center gap-4 cursor-pointer" onClick={() => navigate('/kundali')}>
              <div className="p-3 rounded-full bg-purple-900/30 border border-purple-600/20">
                <Map className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-gray-300 text-xs">Your Chart</div>
                <div className="text-gold-400 font-medium">{kundali.lagna} Lagna</div>
                <div className="text-gray-300 text-xs">{kundali.nakshatra} Nakshatra</div>
              </div>
            </motion.div>
          )}

          {currentDasha && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card-cosmic p-5 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-900/30 border border-blue-600/20">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-gray-300 text-xs">Current Mahadasha</div>
                <div className="text-gold-400 font-medium">{currentDasha.planet} Dasha</div>
                <div className="text-gray-300 text-xs">Until {currentDasha.end.substring(0, 4)}</div>
              </div>
            </motion.div>
          )}
        </div>

        {!kundali && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card-cosmic p-8 text-center mb-8 border border-gold-600/20">
            <div className="text-4xl mb-3">🔮</div>
            <h2 className="font-serif text-gold-400 text-2xl mb-2">Generate Your Free Kundali</h2>
            <p className="text-gray-200 text-sm mb-5">Unlock your complete birth chart, personality report, and life purpose with Swiss Ephemeris precision.</p>
            <button onClick={() => navigate('/kundali')} className="btn-gold px-8 py-3">Generate Kundali ✦</button>
          </motion.div>
        )}

        <h2 className="font-serif text-gold-400 text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((l, i) => (
            <motion.button
              key={l.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={l.onClick}
              whileHover={{ y: -3, boxShadow: '0 0 20px rgba(201,168,76,0.15)' }}
              className="card-cosmic p-5 text-center cursor-pointer group"
            >
              <div className="text-3xl mb-2">{l.icon}</div>
              <div className="text-gold-400 text-sm font-medium group-hover:text-gold-300">{l.label}</div>
              <div className="text-gray-300 text-xs mt-0.5">{l.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
