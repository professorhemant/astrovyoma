import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import SwastikBorder from '../components/SwastikBorder';
import ZodiacIcon from '../components/ZodiacIcon';
import BirthPlacePicker from '../components/BirthPlacePicker';

const SIGNS = [
  { name: 'Aries',       nameHi: 'मेष',      symbol: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire',  ruling: 'Mars',    color: '#FF6B6B' },
  { name: 'Taurus',      nameHi: 'वृष',       symbol: '♉', dates: 'Apr 20 – May 20', element: 'Earth', ruling: 'Venus',   color: '#6BCB77' },
  { name: 'Gemini',      nameHi: 'मिथुन',     symbol: '♊', dates: 'May 21 – Jun 20', element: 'Air',   ruling: 'Mercury', color: '#FFD93D' },
  { name: 'Cancer',      nameHi: 'कर्क',      symbol: '♋', dates: 'Jun 21 – Jul 22', element: 'Water', ruling: 'Moon',    color: '#C9A84C' },
  { name: 'Leo',         nameHi: 'सिंह',      symbol: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire',  ruling: 'Sun',     color: '#FF9F43' },
  { name: 'Virgo',       nameHi: 'कन्या',     symbol: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth', ruling: 'Mercury', color: '#A29BFE' },
  { name: 'Libra',       nameHi: 'तुला',      symbol: '♎', dates: 'Sep 23 – Oct 22', element: 'Air',   ruling: 'Venus',   color: '#FD79A8' },
  { name: 'Scorpio',     nameHi: 'वृश्चिक',   symbol: '♏', dates: 'Oct 23 – Nov 21', element: 'Water', ruling: 'Mars',    color: '#6C5CE7' },
  { name: 'Sagittarius', nameHi: 'धनु',       symbol: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire',  ruling: 'Jupiter', color: '#E17055' },
  { name: 'Capricorn',   nameHi: 'मकर',       symbol: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth', ruling: 'Saturn',  color: '#636E72' },
  { name: 'Aquarius',    nameHi: 'कुंभ',      symbol: '♒', dates: 'Jan 20 – Feb 18', element: 'Air',   ruling: 'Saturn',  color: '#00CEC9' },
  { name: 'Pisces',      nameHi: 'मीन',       symbol: '♓', dates: 'Feb 19 – Mar 20', element: 'Water', ruling: 'Jupiter', color: '#74B9FF' },
];

const ELEMENT_ICON = { Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧' };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getSunSign(day, month) {
  const m = parseInt(month), d = parseInt(day);
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'aries';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'taurus';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'gemini';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'cancer';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'leo';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'virgo';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'libra';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'scorpio';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagittarius';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'capricorn';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'aquarius';
  return 'pisces';
}

export default function HoroscopePage() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const [form, setForm] = useState({
    name: '',
    sex: 'Male',
    day: '1',
    month: '1',
    year: String(new Date().getFullYear() - 25),
    hour: '12',
    minute: '0',
    second: '0',
    place: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const sign = getSunSign(form.day, form.month);
    navigate(`/horoscope/${sign}`);
  };

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />

      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <img src="/horoscope-hero.png" alt="Horoscope" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cosmic-950" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✦ Cosmic Guidance</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 30px rgba(201,168,76,0.4)' }}>
              Personalized Horoscope
            </h1>
            <p className="text-gray-300 text-sm">Enter your birth details for a personalized cosmic reading</p>
          </motion.div>

          {/* Birth Details Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-cosmic-800/60 border border-gold-500/30 rounded-2xl p-6 md:p-8 mb-14"
              style={{ boxShadow: '0 0 50px rgba(201,168,76,0.08), inset 0 1px 0 rgba(201,168,76,0.1)' }}>

              <h2 className="font-serif text-xl text-gold-300 text-center mb-6">Enter Your Birth Details</h2>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name + Sex */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gold-400/80 text-sm mb-1.5 font-medium">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gold-400/80 text-sm mb-1.5 font-medium">Sex</label>
                    <select
                      value={form.sex}
                      onChange={e => set('sex', e.target.value)}
                      className="w-full bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-gold-400/80 text-sm mb-1.5 font-medium">Date of Birth</label>
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={form.day}
                      onChange={e => set('day', e.target.value)}
                      className="bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={form.month}
                      onChange={e => set('month', e.target.value)}
                      className="bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={form.year}
                      onChange={e => set('year', e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="Year"
                      className="bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Time of Birth */}
                <div>
                  <label className="block text-gold-400/80 text-sm mb-1.5 font-medium">Time of Birth</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <select
                        value={form.hour}
                        onChange={e => set('hour', e.target.value)}
                        className="w-full bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map(h => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-[10px] mt-1 text-center">Hour</p>
                    </div>
                    <div>
                      <select
                        value={form.minute}
                        onChange={e => set('minute', e.target.value)}
                        className="w-full bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(m => (
                          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-[10px] mt-1 text-center">Minute</p>
                    </div>
                    <div>
                      <select
                        value={form.second}
                        onChange={e => set('second', e.target.value)}
                        className="w-full bg-cosmic-900/70 border border-gold-600/20 rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(s => (
                          <option key={s} value={s}>{String(s).padStart(2, '0')}</option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-[10px] mt-1 text-center">Second</p>
                    </div>
                  </div>
                </div>

                {/* Place of Birth */}
                <div>
                  <BirthPlacePicker
                    value={form.place}
                    onChange={({ place, lat, lng }) => setForm(f => ({ ...f, place, lat, lng }))}
                    label="Place of Birth"
                    required
                    placeholder="Type city or town name…"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-xl py-3 text-base hover:opacity-90 transition-opacity mt-2"
                >
                  Get Personalized Horoscope
                </button>
              </form>
            </div>
          </motion.div>

          {/* Daily Sun Sign Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl text-gold-400 mb-2">Daily Horoscope by Sign</h2>
            <p className="text-gray-200 text-sm mb-1">{today}</p>
            <p className="text-gray-400 text-xs">Or select your zodiac sign directly</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link to="/horoscope/extended"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-300 text-sm font-semibold hover:bg-gold-500/20 transition-all">
                Weekly – Monthly – Yearly Forecasts
              </Link>
            </div>
          </motion.div>

          {/* Sign grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
            {SIGNS.map((sign, i) => (
              <motion.div
                key={sign.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
              >
                <Link
                  to={`/horoscope/${sign.name.toLowerCase()}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 bg-cosmic-800/50 border-gold-600/10 hover:border-gold-400/40 hover:bg-cosmic-800/80 hover:shadow-lg block"
                >
                  <ZodiacIcon sign={sign.name} size={52} />
                  <span className="text-gold-400 font-semibold text-sm leading-tight" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{sign.nameHi}</span>
                  <span className="text-gray-300 text-[10px]">{sign.name}</span>
                  <span className="text-gray-300 text-[10px]">{ELEMENT_ICON[sign.element]}</span>
                  <span className="text-gray-300 text-[10px]">{sign.dates.split(' – ')[0]}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link to="/kundali" className="flex-1 text-center bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full py-3 text-sm hover:opacity-90 transition-opacity">
                Get My Kundali
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
