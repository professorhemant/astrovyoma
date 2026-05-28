import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SwastikBorder from '../components/SwastikBorder';

const NAKSHATRAS = [
  { name: 'Ashwini', symbol: '🐴', lord: 'Ketu', deity: 'Ashwini Kumaras', pada: [1,2,3,4], element: 'Fire', gana: 'Deva', quality: 'Movable', degrees: '0��13�20\' Aries', traits: ['Pioneer','Healer','Swift','Energetic','Independent'], purpose: 'To initiate, heal, and lead with speed and courage', career: 'Medicine, Sports, Military, Entrepreneurship, Emergency Services', remedy: 'Worship Lord Ganesha on Tuesdays, wear red coral', famous: 'Aries risings, natural starters' },
  { name: 'Bharani', symbol: '🔺', lord: 'Venus', deity: 'Yama', pada: [1,2,3,4], element: 'Fire', gana: 'Manushya', quality: 'Fixed', degrees: '13�20\'�26�40\' Aries', traits: ['Creative','Intense','Sensual','Transformative','Determined'], purpose: 'To create, transform, and experience life\'s full spectrum', career: 'Arts, Fashion, Medicine, Finance, Entertainment', remedy: 'Chant Venus mantra, wear diamond or white sapphire', famous: 'Artists, designers, those who carry the creative fire' },
  { name: 'Krittika', symbol: '🔥', lord: 'Sun', deity: 'Agni', pada: [1,2,3,4], element: 'Fire/Earth', gana: 'Rakshasa', quality: 'Fixed', degrees: '26�40\' Aries�10� Taurus', traits: ['Sharp','Purifying','Leader','Decisive','Perfectionist'], purpose: 'To cut through illusion and purify with sacred fire', career: 'Military, Judiciary, Surgery, Administration, Spiritual Leadership', remedy: 'Sun worship at sunrise, Ruby gemstone', famous: 'Strong willed leaders, fire workers' },
  { name: 'Rohini', symbol: '🌷', lord: 'Moon', deity: 'Brahma', pada: [1,2,3,4], element: 'Earth', gana: 'Manushya', quality: 'Fixed', degrees: '10��23�20\' Taurus', traits: ['Magnetic','Artistic','Nurturing','Sensual','Fertile'], purpose: 'To cultivate beauty, abundance, and lasting foundations', career: 'Agriculture, Arts, Entertainment, Beauty, Food', remedy: 'Moon fasting on Mondays, wear pearl', famous: 'Most creative nakshatra, favored by Lord Krishna' },
  { name: 'Mrigashira', symbol: '🦌', lord: 'Mars', deity: 'Soma (Moon)', pada: [1,2,3,4], element: 'Earth/Air', gana: 'Deva', quality: 'Soft', degrees: '23�20\' Taurus�6�40\' Gemini', traits: ['Curious','Searching','Gentle','Intelligent','Restless'], purpose: 'To seek truth, beauty, and knowledge through constant exploration', career: 'Research, Travel, Writing, Journalism, Teaching', remedy: 'Chant Moon mantras, wear pearl or moonstone', famous: 'Natural seekers and wanderers' },
  { name: 'Ardra', symbol: '💫', lord: 'Rahu', deity: 'Rudra', pada: [1,2,3,4], element: 'Air', gana: 'Manushya', quality: 'Sharp', degrees: '6�40\'�20� Gemini', traits: ['Intense','Stormy','Intellectual','Transformative','Raw'], purpose: 'To destroy the old, transform through storms, and emerge renewed', career: 'Research, Data Science, Engineering, Activism, Writing', remedy: 'Worship Lord Shiva, blue sapphire with guidance', famous: 'Agents of change and transformation' },
  { name: 'Punarvasu', symbol: '🏹', lord: 'Jupiter', deity: 'Aditi', para: [1,2,3,4], element: 'Air/Water', gana: 'Deva', quality: 'Movable', degrees: '20� Gemini�3�20\' Cancer', traits: ['Generous','Philosophical','Optimistic','Restoring','Wise'], purpose: 'To restore hope and return divine light after darkness', career: 'Teaching, Counseling, Healing, Philosophy, Travel', remedy: 'Worship Lord Vishnu, yellow sapphire', famous: 'Natural healers and wisdom teachers' },
  { name: 'Pushya', symbol: '🌸', lord: 'Saturn', deity: 'Brihaspati', pada: [1,2,3,4], element: 'Water', gana: 'Deva', quality: 'Fixed', degrees: '3�20\'�16�40\' Cancer', traits: ['Nurturing','Nourishing','Protective','Spiritual','Disciplined'], purpose: 'To nourish all beings and create sacred structures that sustain', career: 'Teaching, Farming, Medicine, Social Work, Priesthood', remedy: 'Worship Lord Vishnu, fast on Thursdays', famous: 'The most auspicious Nakshatra for new beginnings' },
  { name: 'Ashlesha', symbol: '🐍', lord: 'Mercury', deity: 'Nagas', pada: [1,2,3,4], element: 'Water', gana: 'Rakshasa', quality: 'Sharp', degrees: '16�40\'�30� Cancer', traits: ['Mystical','Perceptive','Strategic','Intense','Psychic'], purpose: 'To master hidden knowledge and heal through depth of perception', career: 'Psychology, Occult, Research, Politics, Medicine', remedy: 'Worship Nagas, wear emerald', famous: 'Kundalini energy, serpent power' },
  { name: 'Magha', symbol: '👑', lord: 'Ketu', deity: 'Pitras (Ancestors)', pada: [1,2,3,4], element: 'Fire', gana: 'Rakshasa', quality: 'Fixed', degrees: '0��13�20\' Leo', traits: ['Regal','Proud','Traditional','Ancestral','Leader'], purpose: 'To honor heritage, lead with authority, and bridge past to future', career: 'Politics, Management, Royalty, Law, Administration', remedy: 'Honor ancestors on new moons, wear cat\'s eye', famous: 'Natural leaders and royalty' },
];

const MORE_NAKSHATRAS = [
  'Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
].map(name => ({ name, symbol: '⭐', lord: 'Various', traits: ['Wise','Purposeful','Spiritual','Evolved'], purpose: 'A unique cosmic purpose guiding your dharmic path', career: 'Various spiritual and professional paths', remedy: 'Consult an astrologer for personalized remedies', degrees: 'Various degrees' }));

const ALL_NAKSHATRAS = [...NAKSHATRAS, ...MORE_NAKSHATRAS];

export default function NakshatraPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = ALL_NAKSHATRAS.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">⭐ Your Birth Star</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 30px rgba(201,168,76,0.4)' }}>Nakshatra Reading</h1>
            <p className="text-gray-200 max-w-xl mx-auto text-sm">The 27 lunar mansions of Vedic astrology � discover the star that defines your soul's blueprint</p>
          </motion.div>

          {/* Don't know nakshatra CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-gold-400 font-medium text-sm">Don't know your Nakshatra?</p>
              <p className="text-gray-300 text-xs">Generate your free Kundali to find your Moon's Nakshatra instantly</p>
            </div>
            <Link to="/kundali" className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-6 py-2.5 text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
              Find My Nakshatra ?
            </Link>
          </motion.div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="?? Search nakshatra..."
            className="w-full max-w-md mx-auto block bg-cosmic-800 border border-gold-600/20 rounded-full px-5 py-3 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50 mb-8 transition-colors" />

          {/* Nakshatra grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {filtered.map((n, i) => (
              <motion.button key={n.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(selected?.name === n.name ? null : n)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200
                  ${selected?.name === n.name
                    ? 'bg-gold-500/20 border-gold-400/60 shadow-lg shadow-gold-500/20'
                    : 'bg-cosmic-800/50 border-gold-600/10 hover:border-gold-600/30 hover:bg-cosmic-800/80'}`}>
                <div className="text-2xl mb-1">{n.symbol}</div>
                <div className={`text-xs font-semibold ${selected?.name === n.name ? 'text-gold-400' : 'text-gray-300'}`}>{n.name}</div>
                {n.lord && <div className="text-gray-300 text-[10px] mt-0.5">Lord: {n.lord}</div>}
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div key={selected.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-cosmic-800/60 backdrop-blur-sm border border-gold-600/20 rounded-3xl p-8">
                <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gold-600/10 flex-wrap">
                  <div className="text-4xl md:text-6xl">{selected.symbol}</div>
                  <div className="flex-1">
                    <h2 className="font-serif text-3xl text-gold-400 mb-1">{selected.name} Nakshatra</h2>
                    {selected.degrees && <p className="text-gray-300 text-sm mb-2">{selected.degrees}</p>}
                    <div className="flex flex-wrap gap-2">
                      {selected.lord && <span className="text-xs bg-cosmic-900 border border-gold-600/20 px-2.5 py-1 rounded-full text-gray-200">Lord: {selected.lord}</span>}
                      {selected.deity && <span className="text-xs bg-cosmic-900 border border-gold-600/20 px-2.5 py-1 rounded-full text-gray-200">Deity: {selected.deity}</span>}
                      {selected.gana && <span className="text-xs bg-cosmic-900 border border-gold-600/20 px-2.5 py-1 rounded-full text-gray-200">Gana: {selected.gana}</span>}
                      {selected.element && <span className="text-xs bg-cosmic-900 border border-gold-600/20 px-2.5 py-1 rounded-full text-gray-200">Element: {selected.element}</span>}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gold-500 text-sm font-semibold mb-3 uppercase tracking-wider">Personality Traits</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selected.traits.map(t => (
                        <span key={t} className="text-xs bg-gold-500/10 border border-gold-500/30 text-gold-400 px-3 py-1.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <h3 className="text-gold-500 text-sm font-semibold mb-2 uppercase tracking-wider">Life Purpose</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{selected.purpose}</p>
                  </div>
                  <div>
                    {selected.career && <>
                      <h3 className="text-gold-500 text-sm font-semibold mb-2 uppercase tracking-wider">Ideal Careers</h3>
                      <p className="text-gray-200 text-sm mb-4">{selected.career}</p>
                    </>}
                    {selected.remedy && <>
                      <h3 className="text-gold-500 text-sm font-semibold mb-2 uppercase tracking-wider">Vedic Remedy</h3>
                      <p className="text-gray-200 text-sm">{selected.remedy}</p>
                    </>}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gold-600/10 flex gap-3 flex-wrap">
                  <Link to="/kundali" className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 text-sm hover:opacity-90 transition-opacity">
                    Get Full Nakshatra Report
                  </Link>
                  <Link to="/astrologers" className="border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 text-sm hover:bg-gold-500/10 transition-colors">
                    Ask an Astrologer
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
