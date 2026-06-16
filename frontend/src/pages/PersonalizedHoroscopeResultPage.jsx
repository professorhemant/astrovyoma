import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import SwastikBorder from '../components/SwastikBorder';
import NorthIndianChart from '../components/NorthIndianChart';
import { kundali as kundaliApi } from '../api';

// ── constants ────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const PLANET_SHORT = { Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me', Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke' };

const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const FRIENDS = {
  Sun:     ['Moon','Mars','Jupiter'],
  Moon:    ['Sun','Mercury'],
  Mars:    ['Sun','Moon','Jupiter'],
  Mercury: ['Sun','Venus'],
  Jupiter: ['Sun','Moon','Mars'],
  Venus:   ['Mercury','Saturn'],
  Saturn:  ['Mercury','Venus'],
  Rahu:    ['Venus','Mercury','Saturn'],
  Ketu:    ['Mars','Venus','Saturn'],
};
const ENEMIES = {
  Sun:     ['Venus','Saturn'],
  Moon:    ['Rahu','Ketu'],
  Mars:    ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury','Venus'],
  Venus:   ['Sun','Moon'],
  Saturn:  ['Sun','Moon','Mars'],
  Rahu:    ['Sun','Moon','Mars'],
  Ketu:    ['Sun','Moon'],
};

function getRelation(planet, signIdx) {
  const lord = SIGN_LORDS[signIdx];
  if (!lord || planet === lord) return 'Own';
  if (FRIENDS[planet]?.includes(lord)) return 'Friend';
  if (ENEMIES[planet]?.includes(lord)) return 'Enemy';
  return 'Neutral';
}

const RELATION_COLOR = {
  Own:     'text-gold-400',
  Friend:  'text-emerald-400',
  Neutral: 'text-gray-400',
  Enemy:   'text-red-400',
};

const DASHA_SHORT = { Sun:'Su', Moon:'Mo', Mars:'Ma', Mercury:'Me', Jupiter:'Ju', Venus:'Ve', Saturn:'Sa', Rahu:'Ra', Ketu:'Ke' };

// ── cards ────────────────────────────────────────────────────────────────────

const CARDS = [
  { icon:'🔮', title:'Birth Chart / Kundali',          desc:'Planetary position and your chart details',            link:'/kundali',         bg:'from-orange-500 to-amber-600' },
  { icon:'❤️', title:'Match Horoscope',                 desc:'Guna milan compatibility with your partner',           link:'/matching',        bg:'from-rose-500 to-pink-600' },
  { icon:'💬', title:'Talk to Astrologer',              desc:'Get first chat with a certified astrologer',           link:'/astrologers',     bg:'from-blue-500 to-indigo-600' },
  { icon:'🌟', title:'Your Life Predictions',           desc:'Know about your Nature, Love and Career',              link:'/purpose',         bg:'from-violet-500 to-purple-600' },
  { icon:'🌍', title:'Gochar Phal (Transit)',           desc:'How current planet positions influence you',           link:'/gochara',         bg:'from-teal-500 to-cyan-600' },
  { icon:'📖', title:'Lal Kitab Horoscope',             desc:'Lal Kitab (Red Book) predictions for you',            link:'/lal-kitab',       bg:'from-red-500 to-rose-600' },
  { icon:'♂',  title:'Mangal Dosha',                   desc:'Do you have Mangal dosha? Find remedies',             link:'/mangal-dosha',    bg:'from-orange-600 to-red-600' },
  { icon:'❓', title:'Ask A Question',                  desc:'Get a personalised report from expert astrologer',     link:'/astrologers',     bg:'from-amber-500 to-yellow-600' },
  { icon:'⬆️', title:'Ascendant',                      desc:'Know your rising sign and its influence',             link:'/kundali',         bg:'from-emerald-500 to-green-600' },
  { icon:'💎', title:'Gemstones Report',                desc:'Find your lucky gemstone based on your chart',         link:'/remedies',        bg:'from-cyan-500 to-blue-600' },
  { icon:'📜', title:'Brihat Kundali',                  desc:'Detailed Kundali with full life analysis',            link:'/kundali',         bg:'from-indigo-500 to-violet-600' },
  { icon:'⭐', title:'Personalized Annual Horoscope',   desc:'Your personalized annual horoscope forecast',          link:'/horoscope/extended', bg:'from-yellow-500 to-amber-500' },
  { icon:'☀️', title:'My Day Today',                    desc:"Know today's predictions based on your chart",        link:'/panchang',        bg:'from-orange-400 to-yellow-500' },
  { icon:'📊', title:'Year Analysis (Varshphal)',        desc:'Detailed year ahead analysis and predictions',        link:'/dasha',           bg:'from-blue-600 to-indigo-700' },
  { icon:'🪐', title:'Sade Sati Life Report',           desc:'Impact of Shani Sade Sati on your life',             link:'/sade-sati',       bg:'from-slate-500 to-gray-600' },
  { icon:'🐍', title:'Kalsarp Dosh / Yog',              desc:'Impact of Kalsarp dosh in your horoscope',            link:'/kundali',         bg:'from-green-600 to-emerald-700' },
  { icon:'⏳', title:'Dasha Phal Analysis',              desc:'Rise and fall in life — your good and bad times',    link:'/dasha',           bg:'from-purple-500 to-violet-600' },
  { icon:'❤️', title:'Love',                            desc:'Know about your Love life and relationships',          link:'/purpose',         bg:'from-pink-500 to-rose-600' },
  { icon:'💼', title:'Career',                          desc:'Know about your Career and professional life',         link:'/purpose',         bg:'from-blue-500 to-cyan-600' },
  { icon:'🌙', title:'Nakshatra',                       desc:'Know about your birth Nakshatra and traits',          link:'/nakshatra',       bg:'from-amber-500 to-orange-600' },
  { icon:'🌿', title:'Nature',                          desc:'Understand your personality from your chart',          link:'/purpose',         bg:'from-green-500 to-teal-600' },
  { icon:'🔢', title:'Numerology',                      desc:'Numerology predictions and lucky numbers',             link:'/numerology',      bg:'from-violet-500 to-indigo-600' },
  { icon:'🏥', title:'Health Index',                    desc:'Health and wellness predictions from your chart',      link:'/purpose',         bg:'from-red-500 to-orange-600' },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function buildNavamsaPositions(divCharts) {
  if (!divCharts?.navamsha) return {};
  const out = {};
  for (const [k, v] of Object.entries(divCharts.navamsha)) {
    if (k !== 'Lagna') out[k] = { sign: v.sign, sign_index: v.sign_index };
  }
  return out;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function PersonalizedHoroscopeResultPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const name  = state?.name  || 'Your';
  const sex   = state?.sex   || '';
  const day   = state?.day   || '';
  const month = state?.month ? MONTHS[parseInt(state.month) - 1] : '';
  const year  = state?.year  || '';
  const hour  = state?.hour  !== undefined ? String(state.hour).padStart(2,'0') : '00';
  const min   = state?.minute !== undefined ? String(state.minute).padStart(2,'0') : '00';
  const sec   = state?.second !== undefined ? String(state.second).padStart(2,'0') : '00';
  const place = state?.place || '';

  const dobStr  = day && month && year ? `${day} ${month} ${year}` : '';
  const timeStr = `${hour}:${min}:${sec}`;

  const [chart, setChart]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!state?.day || !state?.month || !state?.year) {
      setLoading(false);
      return;
    }
    const dob = `${state.year}-${String(state.month).padStart(2,'0')}-${String(state.day).padStart(2,'0')}`;
    const birth_time = `${hour}:${min}:${sec}`;

    kundaliApi.generatePublic({
      name: state.name,
      dob,
      birth_time,
      birth_place: state.place || '',
      lat: state.lat || null,
      lng: state.lng || null,
    })
      .then(res => setChart(res.data.chart))
      .catch(err => setError(err.response?.data?.error || 'Failed to calculate chart'))
      .finally(() => setLoading(false));
  }, []);

  const pp   = chart?.planetary_positions || {};
  const div  = chart?.divisional_charts || {};
  const navamsa = buildNavamsaPositions(div);
  const navamsaLagna = div?.navamsha?.Lagna?.sign || 'Aries';
  const dashas = chart?.dasha_sequence || [];
  const balance = chart?.dasha_balance;

  return (
    <div className="relative min-h-screen bg-cosmic-950 mt-16">
      <SwastikBorder />

      <div className="relative z-10 px-4 py-8 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-6">
            <p className="text-gold-500/60 text-xs tracking-widest uppercase mb-1">✦ Your Cosmic Profile</p>
            <h1 className="font-serif text-2xl md:text-3xl text-gold-400 mb-1">{name}'s Horoscope</h1>
            <p className="text-gray-400 text-sm">
              {sex && `${sex} · `}{dobStr}{dobStr && timeStr ? ` · ${timeStr}` : ''}{place ? ` · ${place}` : ''}
            </p>
            <button onClick={() => navigate('/horoscope')} className="mt-2 text-xs text-gold-500/70 hover:text-gold-400 transition-colors">
              ✎ Edit Birth Details
            </button>
          </motion.div>

          {/* ── Chart section ── */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-gold-400 animate-spin" />
              <span className="ml-3 text-gold-400 text-sm">Calculating your chart…</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {chart && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>

              {/* Charts row */}
              <div className="bg-cosmic-800/50 border border-gold-600/15 rounded-2xl p-4 md:p-6 mb-6">
                <h2 className="font-serif text-lg text-gold-300 mb-4 text-center">Kundli &amp; Planetary Position</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center">
                    <p className="text-gold-400/70 text-xs uppercase tracking-wider mb-2">Lagna Chart</p>
                    <NorthIndianChart
                      planetaryPositions={pp}
                      lagna={chart.lagna}
                      size={280}
                      title={chart.lagna?.[0] || 'ॐ'}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-gold-400/70 text-xs uppercase tracking-wider mb-2">Navamsa Chart</p>
                    <NorthIndianChart
                      planetaryPositions={navamsa}
                      lagna={navamsaLagna}
                      size={280}
                      title="D9"
                    />
                  </div>
                </div>
              </div>

              {/* Planet table + Dasha */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

                {/* Planet table */}
                <div className="lg:col-span-2 bg-cosmic-800/50 border border-gold-600/15 rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gold-400/70 uppercase border-b border-gold-600/15">
                        {['Planet','R','Rashi','Longitude','Nakshatra','Pada','Relation'].map(h => (
                          <th key={h} className="text-left pb-2 pr-3 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PLANET_ORDER.map((planet, i) => {
                        const pos = pp[planet];
                        if (!pos) return null;
                        const rel = getRelation(planet, pos.sign_index);
                        return (
                          <tr key={planet} className={`border-b border-gold-600/05 ${i%2===0 ? 'bg-cosmic-900/20' : ''}`}>
                            <td className="py-2 pr-3 text-white font-semibold whitespace-nowrap">
                              {PLANET_SHORT[planet]} <span className="text-gray-400 font-normal">({planet})</span>
                            </td>
                            <td className="py-2 pr-3">
                              {pos.retrograde
                                ? <span className="text-orange-400 font-bold">R</span>
                                : <span className="text-gray-500">D</span>}
                            </td>
                            <td className="py-2 pr-3 text-gold-300 whitespace-nowrap">{pos.sign}</td>
                            <td className="py-2 pr-3 text-gray-300 tabular-nums whitespace-nowrap">
                              {pos.sign_degree?.toFixed(2)}°
                            </td>
                            <td className="py-2 pr-3 text-gray-300 whitespace-nowrap">{pos.nakshatra}</td>
                            <td className="py-2 pr-3 text-gray-300">{pos.nakshatra_pada}</td>
                            <td className={`py-2 font-medium whitespace-nowrap ${RELATION_COLOR[rel]}`}>{rel}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Vimshottari Dasha */}
                <div className="bg-cosmic-800/50 border border-gold-600/15 rounded-2xl p-4">
                  <h3 className="text-gold-300 font-serif text-sm mb-1">Vimshottari Dasha</h3>
                  {balance && (
                    <div className="mb-3 pb-3 border-b border-gold-600/15">
                      <p className="text-gray-400 text-xs mb-0.5">Balance Of Dasha:</p>
                      <p className="text-gold-400 text-xs font-semibold">
                        {balance.planet?.toUpperCase()} — {balance.remaining_years?.toFixed(1)} yrs
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {dashas.slice(0, 9).map((d, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white text-xs font-medium w-6">{DASHA_SHORT[d.planet]}</span>
                        <span className="text-gray-400 text-xs tabular-nums">{fmtDate(d.start)}</span>
                        <span className="text-gray-500 text-xs">→</span>
                        <span className="text-gray-400 text-xs tabular-nums">{fmtDate(d.end)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* ── Card grid ── */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: chart ? 0.3 : 0.1 }}>
            <h2 className="font-serif text-xl text-gold-400 mb-4">Explore Your Horoscope</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CARDS.map((card, i) => (
                <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.05*i }}>
                  <Link
                    to={card.link}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gold-600/15 bg-cosmic-800/50 hover:bg-cosmic-800/80 hover:border-gold-500/30 transition-all duration-200 group h-full"
                  >
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${card.bg} flex items-center justify-center text-2xl shadow-lg`}>
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm group-hover:text-gold-300 transition-colors leading-tight mb-1">
                        {card.title}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{card.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
