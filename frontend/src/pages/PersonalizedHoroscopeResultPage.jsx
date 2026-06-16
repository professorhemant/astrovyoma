import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import SwastikBorder from '../components/SwastikBorder';

const SIDEBAR_ITEMS = [
  { label: 'Profile',                       link: '/dashboard' },
  { label: 'Print Birth Chart / Life Report', link: '/kundali' },
  { label: 'Calculations',                  link: '/kundali' },
  { label: 'Predictions & Reports',         link: '/purpose',   active: true },
  { label: 'Numerology',                    link: '/numerology' },
  { label: 'Dasha',                         link: '/dasha' },
  { label: 'Lal Kitab',                     link: '/lal-kitab' },
  { label: 'KP System',                     link: '/kundali' },
  { label: 'Match Horoscope',               link: '/matching' },
  { label: 'Paid Consultation',             link: '/plans' },
  { label: 'Talk to Astrologer',            link: '/astrologers' },
];

const CARDS = [
  {
    icon: '🔮', title: 'Birth Chart / Kundali',
    desc: 'Planetary position and your chart details',
    link: '/kundali', bg: 'from-orange-500 to-amber-600',
  },
  {
    icon: '❤️', title: 'Match Horoscope',
    desc: 'Guna milan compatibility with your partner',
    link: '/matching', bg: 'from-rose-500 to-pink-600',
  },
  {
    icon: '💬', title: 'Talk to Astrologer',
    desc: 'Get first chat with a certified astrologer',
    link: '/astrologers', bg: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '🌟', title: 'Your Life Predictions',
    desc: 'Know about your Nature, Love and Career',
    link: '/purpose', bg: 'from-violet-500 to-purple-600',
  },
  {
    icon: '🌍', title: 'Gochar Phal (Transit)',
    desc: 'How current planet positions influence you',
    link: '/gochara', bg: 'from-teal-500 to-cyan-600',
  },
  {
    icon: '📖', title: 'Lal Kitab Horoscope',
    desc: 'Lal Kitab (Red Book) predictions for you',
    link: '/lal-kitab', bg: 'from-red-500 to-rose-600',
  },
  {
    icon: '♂', title: 'Mangal Dosha',
    desc: 'Do you have Mangal dosha? Find remedies',
    link: '/mangal-dosha', bg: 'from-orange-600 to-red-600',
  },
  {
    icon: '❓', title: 'Ask A Question',
    desc: 'Get a personalised report from expert astrologer',
    link: '/astrologers', bg: 'from-amber-500 to-yellow-600',
  },
  {
    icon: '⬆️', title: 'Ascendant',
    desc: 'Know your rising sign and its influence',
    link: '/kundali', bg: 'from-emerald-500 to-green-600',
  },
  {
    icon: '💎', title: 'Gemstones Report',
    desc: 'Find your lucky gemstone based on your chart',
    link: '/remedies', bg: 'from-cyan-500 to-blue-600',
  },
  {
    icon: '📜', title: 'Brihat Kundali',
    desc: 'Detailed Kundali with full life analysis',
    link: '/kundali', bg: 'from-indigo-500 to-violet-600',
  },
  {
    icon: '⭐', title: 'Personalized Annual Horoscope',
    desc: 'Your personalized annual horoscope forecast',
    link: '/horoscope/extended', bg: 'from-yellow-500 to-amber-500',
  },
  {
    icon: '☀️', title: 'My Day Today',
    desc: 'Know today\'s predictions based on your chart',
    link: '/panchang', bg: 'from-orange-400 to-yellow-500',
  },
  {
    icon: '📊', title: 'Year Analysis (Varshphal)',
    desc: 'Detailed year ahead analysis and predictions',
    link: '/dasha', bg: 'from-blue-600 to-indigo-700',
  },
  {
    icon: '🪐', title: 'Sade Sati Life Report',
    desc: 'Impact of Shani Sade Sati on your life',
    link: '/sade-sati', bg: 'from-slate-500 to-gray-600',
  },
  {
    icon: '🐍', title: 'Kalsarp Dosh / Yog',
    desc: 'Impact of Kalsarp dosh in your horoscope',
    link: '/kundali', bg: 'from-green-600 to-emerald-700',
  },
  {
    icon: '⏳', title: 'Dasha Phal Analysis',
    desc: 'Rise and fall in life — your good and bad times',
    link: '/dasha', bg: 'from-purple-500 to-violet-600',
  },
  {
    icon: '❤️', title: 'Love',
    desc: 'Know about your Love life and relationships',
    link: '/purpose', bg: 'from-pink-500 to-rose-600',
  },
  {
    icon: '💼', title: 'Career',
    desc: 'Know about your Career and professional life',
    link: '/purpose', bg: 'from-blue-500 to-cyan-600',
  },
  {
    icon: '🌙', title: 'Nakshatra',
    desc: 'Know about your birth Nakshatra and traits',
    link: '/nakshatra', bg: 'from-amber-500 to-orange-600',
  },
  {
    icon: '🌿', title: 'Nature',
    desc: 'Understand your personality from your chart',
    link: '/purpose', bg: 'from-green-500 to-teal-600',
  },
  {
    icon: '🔢', title: 'Numerology',
    desc: 'Numerology predictions and lucky numbers',
    link: '/numerology', bg: 'from-violet-500 to-indigo-600',
  },
  {
    icon: '🏥', title: 'Health Index',
    desc: 'Health and wellness predictions from your chart',
    link: '/purpose', bg: 'from-red-500 to-orange-600',
  },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PersonalizedHoroscopeResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const name  = state?.name  || 'Your';
  const sex   = state?.sex   || '';
  const day   = state?.day   || '';
  const month = state?.month ? MONTHS[parseInt(state.month) - 1] : '';
  const year  = state?.year  || '';
  const hour  = state?.hour  !== undefined ? String(state.hour).padStart(2, '0') : '';
  const min   = state?.minute !== undefined ? String(state.minute).padStart(2, '0') : '';
  const place = state?.place || '';

  const dobStr  = day && month && year ? `${day} ${month} ${year}` : '';
  const timeStr = hour && min ? `${hour}:${min}` : '';

  return (
    <div className="relative min-h-screen bg-cosmic-950 mt-16">
      <SwastikBorder />

      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed bottom-6 left-4 z-50 bg-orange-900 text-white p-3 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(o => !o)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40 flex-shrink-0 overflow-y-auto transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ background: 'linear-gradient(180deg, #7a2200 0%, #5c1a00 100%)' }}
        >
          {/* Name header */}
          <div className="px-4 py-4 border-b border-white/10">
            <p className="text-white font-semibold text-base leading-tight">{name}'s Kundli</p>
            {dobStr && <p className="text-orange-200/70 text-xs mt-0.5">{dobStr}{timeStr ? `, ${timeStr}` : ''}</p>}
            {place && <p className="text-orange-200/60 text-xs">{place}</p>}
          </div>

          {/* Menu items */}
          <nav className="py-1">
            {SIDEBAR_ITEMS.map((item, i) => (
              <Link
                key={i}
                to={item.link || '#'}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm border-b border-white/5 transition-colors
                  ${item.active
                    ? 'bg-orange-700/60 text-orange-200 font-medium'
                    : 'text-white hover:bg-white/10'}`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-60" />
              </Link>
            ))}
          </nav>

          {/* Edit birth details */}
          <div className="px-4 py-4 border-t border-white/10">
            <button
              onClick={() => navigate('/horoscope')}
              className="w-full text-center text-xs text-orange-300 hover:text-orange-100 transition-colors py-1"
            >
              ✎ Edit Birth Details
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 overflow-x-hidden">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <p className="text-gold-500/60 text-xs tracking-widest uppercase mb-1">✦ Your Cosmic Profile</p>
            <h1 className="font-serif text-2xl md:text-3xl text-gold-400 mb-1">
              {name}'s Horoscope
            </h1>
            {(dobStr || place) && (
              <p className="text-gray-400 text-sm">
                {sex && `${sex} · `}{dobStr}{timeStr ? ` · ${timeStr}` : ''}{place ? ` · ${place}` : ''}
              </p>
            )}
          </motion.div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
              >
                <Link
                  to={card.link}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gold-600/15 bg-cosmic-800/50 hover:bg-cosmic-800/80 hover:border-gold-500/30 transition-all duration-200 group h-full"
                >
                  {/* Icon circle */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${card.bg} flex items-center justify-center text-2xl shadow-lg`}>
                    {card.icon}
                  </div>
                  {/* Text */}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-gold-300 transition-colors leading-tight mb-1">
                      {card.title}
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
