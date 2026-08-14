import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SwastikBorder from '../components/SwastikBorder';

const DASHA_INFO = {
  Sun:     { years: 6,  color: '#FF9F43', icon: '☀️', keywords: 'Authority, Father, Career, Health, Government', meaning: 'A period of self-realization, leadership, and connection to authority figures. Your soul seeks recognition and purpose. Health, career advancement, and relationship with father figures are highlighted.' },
  Moon:    { years: 10, color: '#74B9FF', icon: '🌙', keywords: 'Mind, Mother, Emotions, Home, Public', meaning: 'A deeply emotional and intuitive period. Your inner world takes center stage. Relationships with mother and women, home life, public reputation, and emotional healing are the themes of this dasha.' },
  Mars:    { years: 7,  color: '#FF6B6B', icon: '🔴', keywords: 'Energy, Courage, Siblings, Property, Action', meaning: 'A time of intense energy, ambition, and action. Property acquisition, courage in the face of challenges, sibling relationships, and physical vitality are highlighted. Channel this fire constructively.' },
  Rahu:    { years: 18, color: '#A29BFE', icon: '🐉', keywords: 'Obsession, Foreign, Technology, Illusion, Growth', meaning: 'The longest dasha brings radical change, ambition, and sometimes confusion. Foreign connections, technology, unconventional paths, and karmic lessons dominate. A transformative period of massive worldly expansion.' },
  Jupiter: { years: 16, color: '#FFD93D', icon: '⭐', keywords: 'Wisdom, Guru, Children, Wealth, Dharma', meaning: 'The most auspicious dasha — Jupiter, the divine teacher, brings blessings, wisdom, and abundance. Children, education, wealth, spiritual growth, and dharmic life purpose are all illuminated.' },
  Saturn:  { years: 19, color: '#6C5CE7', icon: '🪐', keywords: 'Discipline, Karma, Service, Delays, Reward', meaning: 'The longest, most challenging dasha teaches patience, discipline, and karmic reckoning. Delays are followed by lasting rewards. Service, hard work, and letting go of ego are the lessons. What you build now lasts.' },
  Mercury: { years: 17, color: '#6BCB77', icon: '💚', keywords: 'Communication, Business, Intelligence, Trade, Siblings', meaning: 'A mentally active period favoring communication, business, writing, teaching, and trade. Your intellect and communication skills are your greatest assets. Nervous system health and relationships with siblings are highlighted.' },
  Ketu:    { years: 7,  color: '#FD79A8', icon: '☄️', keywords: 'Spirituality, Liberation, Past Life, Detachment, Healing', meaning: 'A period of deep spiritual seeking and detachment from material things. Past life karma surfaces for resolution. Unexpected events lead to inner liberation. Healing gifts, psychic sensitivity, and moksha-seeking are heightened.' },
  Venus:   { years: 20, color: '#E17055', icon: '💕', keywords: 'Love, Luxury, Arts, Marriage, Pleasure', meaning: 'The most pleasurable dasha — Venus brings love, beauty, luxury, and artistic expression. Marriage, romantic relationships, creative arts, wealth, and enjoyment of life\'s pleasures are all blessed. The soul learns through beauty.' },
};

const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const NAKSHATRA_LIST = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };

function calculateDashas(nakshatraIdx, dob) {
  const lord = NAKSHATRA_LORDS[nakshatraIdx];
  const lordIdx = DASHA_ORDER.indexOf(lord);
  const nSize = 360 / 27;
  const completedFraction = (nakshatraIdx % 1) || 0.5;
  const completedYears = DASHA_YEARS[lord] * completedFraction;

  const dashas = [];
  let current = new Date(dob);
  current.setFullYear(current.getFullYear() - Math.floor(completedYears));

  for (let i = 0; i < 9; i++) {
    const planet = DASHA_ORDER[(lordIdx + i) % 9];
    const years = DASHA_YEARS[planet];
    const start = new Date(current);
    const end = new Date(current);
    end.setFullYear(end.getFullYear() + years);
    dashas.push({ planet, start, end, years });
    current = end;
  }
  return dashas;
}

function isCurrentDasha(start, end) {
  const now = new Date();
  return now >= start && now <= end;
}

export default function DashaPage() {
  const [dob, setDob] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [dashas, setDashas] = useState(null);
  const [selectedDasha, setSelectedDasha] = useState(null);

  function generate() {
    if (!dob || !nakshatra) return;
    const idx = NAKSHATRA_LIST.indexOf(nakshatra);
    if (idx === -1) return;
    const calculated = calculateDashas(idx, dob);
    setDashas(calculated);
    const current = calculated.find(d => isCurrentDasha(d.start, d.end));
    setSelectedDasha(current || calculated[0]);
  }

  const totalYears = dashas ? dashas.reduce((s, d) => s + d.years, 0) : 120;
  const startYear = dashas ? dashas[0].start.getFullYear() : 2000;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✦ Vimshottari Dasha System</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 30px rgba(201,168,76,0.4)' }}>Dasha Timeline</h1>
            <p className="text-gray-200 max-w-xl mx-auto text-sm">Your life's planetary periods — 120 years mapped to the 9 planets of Vedic astrology</p>
          </motion.div>

          {/* Input form */}
          <div className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-gray-300 text-xs mb-2 block">Date of Birth</label>
                <div className="flex items-center bg-cosmic-900 border border-gold-600/20 rounded-xl focus-within:border-gold-500/50 transition-colors">
                  <span className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                    className="flex-1 bg-transparent py-3 pr-4 text-gray-200 text-sm focus:outline-none [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-xs mb-2 block">Moon Nakshatra</label>
                <select value={nakshatra} onChange={e => setNakshatra(e.target.value)}
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50">
                  <option value="">Select Nakshatra</option>
                  {NAKSHATRA_LIST.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <button onClick={generate} className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold rounded-xl py-3 hover:opacity-90 transition-opacity">
                Generate Timeline
              </button>
            </div>
            <p className="text-gray-300 text-xs mt-3">Don't know your Nakshatra? <Link to="/kundali" className="text-gold-500 hover:text-gold-400">Get free Kundali →</Link></p>
          </div>

          {dashas && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Timeline bar */}
              <div className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-8 mb-6">
                <h2 className="font-serif text-gold-400 text-xl mb-6">Your 120-Year Dasha Timeline</h2>
                <div className="flex rounded-xl overflow-hidden mb-4 h-10">
                  {dashas.map((d, i) => {
                    const info = DASHA_INFO[d.planet];
                    const pct = (d.years / 120) * 100;
                    const isCurrent = isCurrentDasha(d.start, d.end);
                    return (
                      <button key={i} onClick={() => setSelectedDasha(d)} title={`${d.planet} (${d.years}y)`}
                        className="relative flex items-center justify-center text-xs font-bold transition-all hover:brightness-125"
                        style={{ width: `${pct}%`, background: info?.color + (isCurrent ? 'FF' : '80'), outline: isCurrent ? `2px solid ${info?.color}` : 'none' }}>
                        {pct > 8 && <span className="text-cosmic-950 text-[10px] font-black truncate px-1">{d.planet}</span>}
                        {isCurrent && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white bg-black/60 px-1 rounded whitespace-nowrap">NOW</span>}
                      </button>
                    );
                  })}
                </div>
                {/* Year labels */}
                <div className="flex justify-between text-gray-300 text-xs px-1">
                  {dashas.map((d, i) => i % 3 === 0 && <span key={i}>{d.start.getFullYear()}</span>)}
                  <span>{dashas[dashas.length - 1].end.getFullYear()}</span>
                </div>
              </div>

              {/* Dasha cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {dashas.map((d, i) => {
                  const info = DASHA_INFO[d.planet] || {};
                  const isCurrent = isCurrentDasha(d.start, d.end);
                  return (
                    <motion.button key={i} onClick={() => setSelectedDasha(d)} whileHover={{ y: -3 }}
                      className={`text-left p-4 rounded-2xl border transition-all ${isCurrent ? 'border-gold-400/60 bg-gold-400/10' : 'border-gold-600/10 bg-cosmic-800/50 hover:border-gold-600/30'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl" style={{ color: info.color }}>{info.icon}</span>
                        <span className="font-semibold text-gray-200 text-sm">{d.planet} Dasha</span>
                        {isCurrent && <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">Active</span>}
                      </div>
                      <p className="text-gray-300 text-xs">{d.start.getFullYear()} — {d.end.getFullYear()}</p>
                      <p className="text-gray-300 text-xs mt-1">{d.years} years</p>
                    </motion.button>
                  );
                })}
              </div>

              {/* Selected dasha detail */}
              {selectedDasha && (
                <motion.div key={selectedDasha.planet} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-8">
                  {(() => {
                    const info = DASHA_INFO[selectedDasha.planet] || {};
                    const isCurrent = isCurrentDasha(selectedDasha.start, selectedDasha.end);
                    return (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2"
                            style={{ borderColor: info.color + '60', background: info.color + '15', color: info.color }}>
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="font-serif text-2xl text-gold-400">{selectedDasha.planet} Mahadasha</h3>
                            <p className="text-gray-300 text-sm">{selectedDasha.start.getFullYear()} — {selectedDasha.end.getFullYear()} — {selectedDasha.years} years</p>
                            {isCurrent && <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-0.5">✦ Your Current Period</span>}
                          </div>
                        </div>
                        {info.keywords && <div className="flex flex-wrap gap-2 mb-4">
                          {info.keywords.split(', ').map(k => <span key={k} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: info.color + '40', color: info.color, background: info.color + '10' }}>{k}</span>)}
                        </div>}
                        <p className="text-gray-300 leading-relaxed text-sm">{info.meaning}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              <div className="text-center mt-8">
                <p className="text-gray-300 text-sm mb-4">For detailed Antardasha (sub-period) analysis, consult our Vedic astrologers</p>
                <Link to="/astrologers" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-10 py-3 hover:opacity-90 transition-opacity">
                  Get Full Dasha Reading ✦
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
