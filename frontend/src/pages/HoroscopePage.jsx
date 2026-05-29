import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SwastikBorder from '../components/SwastikBorder';
import ZodiacIcon from '../components/ZodiacIcon';

const SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 � Apr 19', element: 'Fire', ruling: 'Mars', color: '#FF6B6B' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 � May 20', element: 'Earth', ruling: 'Venus', color: '#6BCB77' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 � Jun 20', element: 'Air', ruling: 'Mercury', color: '#FFD93D' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 � Jul 22', element: 'Water', ruling: 'Moon', color: '#C9A84C' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 � Aug 22', element: 'Fire', ruling: 'Sun', color: '#FF9F43' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 � Sep 22', element: 'Earth', ruling: 'Mercury', color: '#A29BFE' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 � Oct 22', element: 'Air', ruling: 'Venus', color: '#FD79A8' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 � Nov 21', element: 'Water', ruling: 'Mars', color: '#6C5CE7' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 � Dec 21', element: 'Fire', ruling: 'Jupiter', color: '#E17055' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 � Jan 19', element: 'Earth', ruling: 'Saturn', color: '#636E72' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 � Feb 18', element: 'Air', ruling: 'Saturn', color: '#00CEC9' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 � Mar 20', element: 'Water', ruling: 'Jupiter', color: '#74B9FF' },
];

const ELEMENT_ICON = { Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧' };

export default function HoroscopePage() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />

      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <img src="/horoscope-hero.png" alt="Horoscope" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cosmic-950" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✦ Today's Cosmic Guidance</p>
            <h1 className="font-serif text-3xl md:text-5xl md:text-6xl text-gold-400 mb-3" style={{ textShadow: '0 0 30px rgba(201,168,76,0.4)' }}>
              Daily Horoscope
            </h1>
            <p className="text-gray-200 mb-2">{today}</p>
            <p className="text-gray-300 text-sm">Select your zodiac sign for a detailed daily reading</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link to="/horoscope/extended"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-300 text-sm font-semibold hover:bg-gold-500/20 transition-all">
                ?? Weekly � Monthly � Yearly Forecasts ?
              </Link>
            </div>
          </motion.div>

          {/* Sign grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-10">
            {SIGNS.map((sign, i) => (
              <motion.div
                key={sign.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/horoscope/${sign.name.toLowerCase()}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 bg-cosmic-800/50 border-gold-600/10 hover:border-gold-400/40 hover:bg-cosmic-800/80 hover:shadow-lg block"
                  style={{ '--hover-shadow': sign.color + '20' }}
                >
                  <ZodiacIcon sign={sign.name} size={52} />
                  <span className="text-xs font-medium text-gray-200 group-hover:text-gold-400">{sign.name}</span>
                  <span className="text-gray-300 text-[10px]">{ELEMENT_ICON[sign.element]}</span>
                  <span className="text-gray-300 text-[10px]">{sign.dates.split(' � ')[0]}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link to="/kundali" className="flex-1 text-center bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full py-3 text-sm hover:opacity-90 transition-opacity">
                Get My Free Kundali
              </Link>
              <Link to="/astrologers" className="flex-1 text-center border border-gold-500/40 text-gold-400 rounded-full py-3 text-sm hover:bg-gold-500/10 transition-colors">
                Talk to Astrologer
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
