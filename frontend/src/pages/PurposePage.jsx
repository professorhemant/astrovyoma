import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { kundali as kundaliApi } from '../api';
import { useAuth } from '../context/AuthContext';
import SwastikBorder from '../components/SwastikBorder';

const PLANET_MEANINGS = {
  Rahu: 'Your North Node (Rahu) shows the soul\'s highest aspirations in this lifetime — the direction of spiritual growth and worldly mastery.',
  Ketu: 'Your South Node (Ketu) shows accumulated past-life wisdom and innate gifts you bring into this incarnation.',
};

const DASHA_MEANINGS = {
  Sun: 'A time for self-expression, leadership, and stepping into your authentic power. The ego is being refined and your true self emerges.',
  Moon: 'An emotionally rich period calling for deep inner work, nurturing connections, and trusting your intuition above all else.',
  Mars: 'A dynamic, action-oriented period. Channel your considerable energy into purposeful effort and avoid unnecessary conflict.',
  Mercury: 'A time for learning, communication, and intellectual growth. Excellent for business, education, and building networks.',
  Jupiter: 'Your most expansive and blessed period. Growth in wisdom, wealth, and spiritual understanding flows naturally now.',
  Venus: 'A beautiful period of creativity, love, and material abundance. Relationships flourish and artistic expression reaches its peak.',
  Saturn: 'A defining period of discipline, karma, and profound inner transformation. What is built now lasts a lifetime.',
  Rahu: 'An unconventional, ambitious period breaking old patterns. Material achievement through unique and unexpected paths.',
  Ketu: 'A spiritual, introspective period calling for detachment and inner wisdom. Liberation from past patterns accelerates now.',
};

export default function PurposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kundali, setKundali] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      kundaliApi.getMyKundali().then(res => setKundali(res.data)).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-cosmic-950">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gold-400 text-2xl font-serif animate-pulse">✦ Loading your cosmic blueprint...</div>
        </div>
      </div>
    );
  }

  if (!user || !kundali) {
    return (
      <div className="relative min-h-screen bg-cosmic-950">
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card-cosmic p-10 text-center max-w-md">
            <div className="text-5xl mb-4">🔮</div>
            <h2 className="font-serif text-3xl text-gold-400 mb-3">Discover Your Purpose</h2>
            <p className="text-gray-200 mb-6 leading-relaxed">Generate your free Kundali first to unlock your soul's purpose, personality blueprint, and cosmic life path.</p>
            <button onClick={() => navigate(user ? '/kundali' : '/register')} className="btn-gold px-8 py-3">
              {user ? 'Generate My Kundali' : 'Get Started Free'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const traits = kundali.personality_traits?.combined_traits || [];
  const nakshatraTraits = kundali.personality_traits?.nakshatra_traits || [];
  const lagnaTraits = kundali.personality_traits?.lagna_traits || [];
  const dashas = kundali.dasha_sequence || [];
  const now = new Date();
  const currentDasha = dashas.find(d => now >= new Date(d.start) && now <= new Date(d.end));
  const rahuSign = kundali.planetary_positions?.Rahu?.sign;
  const ketuSign = kundali.planetary_positions?.Ketu?.sign;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Your Soul Blueprint</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-2">आपके जीवन का उद्देश्य क्या है?</h1>
          <p className="text-gray-200">What Were You Born For?</p>
        </motion.div>

        <div className="space-y-6">
          {/* Life Purpose */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-cosmic p-8 border border-gold-600/30">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌟</div>
              <div>
                <div className="text-xs text-gold-600 uppercase tracking-widest mb-1">Your Life Purpose</div>
                <h2 className="font-serif text-2xl text-gold-400 mb-3">{kundali.nakshatra} Nakshatra</h2>
                <p className="text-gold-300 text-base mb-4 font-medium">{kundali.life_purpose}</p>
                <p className="text-gray-300 leading-relaxed text-sm">{kundali.swabhav}</p>
              </div>
            </div>
          </motion.div>

          {/* Swabhav */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-cosmic p-8">
            <h2 className="font-serif text-gold-400 text-2xl mb-6">Your Swabhav (Nature)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gold-500 text-sm font-medium mb-3">Nakshatra Traits — {kundali.nakshatra}</h3>
                <div className="flex flex-wrap gap-2">
                  {nakshatraTraits.map(t => (
                    <span key={t} className="px-3 py-1.5 rounded-full text-sm bg-purple-900/30 text-purple-300 border border-purple-600/20">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-gold-500 text-sm font-medium mb-3">Lagna Traits — {kundali.lagna}</h3>
                <div className="flex flex-wrap gap-2">
                  {lagnaTraits.map(t => (
                    <span key={t} className="px-3 py-1.5 rounded-full text-sm bg-blue-900/30 text-blue-300 border border-blue-600/20">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-gold-500 text-sm font-medium mb-3">Your Core Personality</h3>
              <div className="flex flex-wrap gap-2">
                {traits.map(t => (
                  <span key={t} className="px-4 py-1.5 rounded-full text-sm bg-gold-600/15 text-gold-400 border border-gold-600/20 font-medium">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Rahu-Ketu Axis */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-cosmic p-8">
            <h2 className="font-serif text-gold-400 text-2xl mb-6">Karma Path — Rahu-Ketu Axis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-cosmic-900/60 rounded-xl p-5">
                <div className="text-2xl mb-2">🐍</div>
                <div className="text-gold-400 font-semibold mb-1">Rahu in {rahuSign}</div>
                <div className="text-xs text-gray-300 mb-2">North Node — Soul's Destiny</div>
                <p className="text-gray-200 text-sm leading-relaxed">{PLANET_MEANINGS.Rahu} With Rahu in {rahuSign}, your soul is growing toward the qualities of this sign in this lifetime.</p>
              </div>
              <div className="bg-cosmic-900/60 rounded-xl p-5">
                <div className="text-2xl mb-2">🔮</div>
                <div className="text-gold-400 font-semibold mb-1">Ketu in {ketuSign}</div>
                <div className="text-xs text-gray-300 mb-2">South Node — Past Life Gifts</div>
                <p className="text-gray-200 text-sm leading-relaxed">{PLANET_MEANINGS.Ketu} With Ketu in {ketuSign}, you carry deep mastery of this sign's energy from previous lifetimes.</p>
              </div>
            </div>
          </motion.div>

          {/* Current Dasha */}
          {currentDasha && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-cosmic p-8 border border-gold-600/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gold-600/20 border border-gold-600/40 flex items-center justify-center">
                  <span className="text-gold-400 text-xl">🔮</span>
                </div>
                <div>
                  <div className="text-xs text-gold-600 uppercase tracking-widest">Current Phase</div>
                  <h2 className="font-serif text-gold-400 text-2xl">{currentDasha.planet} Mahadasha</h2>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-3">{DASHA_MEANINGS[currentDasha.planet] || 'A powerful period of transformation and growth guided by the planets.'}</p>
              <p className="text-gray-300 text-sm">{currentDasha.start} — {currentDasha.end} ({currentDasha.years} years)</p>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-cosmic p-8 text-center">
            <p className="font-serif text-gold-400 text-xl mb-2">Ready to go deeper?</p>
            <p className="text-gray-200 text-sm mb-6">Talk to an expert astrologer who can interpret every nuance of your chart, answer your specific questions, and guide your next steps.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/astrologers')} className="btn-gold px-8 py-3">Talk to an Astrologer →</button>
              <button onClick={() => navigate('/chat')} className="btn-outline-gold px-8 py-3">Talk to AstroVyoma AI</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
