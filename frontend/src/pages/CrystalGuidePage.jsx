import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { crystals as crystalsApi } from '../api';
import { useLanguage } from '../context/LanguageContext';

const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const SIGNS   = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const TYPE_LABELS = {
  navagraha: { label:'Navagraha Gem', color:'bg-gold-500/20 text-gold-400 border-gold-500/30' },
  healing:   { label:'Healing Crystal', color:'bg-violet-500/20 text-violet-300 border-violet-500/30' },
};

function CrystalCard({ crystal, index }) {
  const typeMeta = TYPE_LABELS[crystal.type] || TYPE_LABELS.healing;
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/crystals/${crystal.slug}`}
        className="card-cosmic flex flex-col h-full group hover:ring-1 transition-all"
        style={{ '--tw-ring-color': crystal.color + '60' }}>
        <div className="p-5 flex flex-col h-full">
          {/* Color swatch + icon */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: crystal.color + '25', border: `1px solid ${crystal.color}50` }}>
              {crystal.icon}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${typeMeta.color}`}>
              {typeMeta.label}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-serif text-base text-cosmic-100 group-hover:text-gold-400 transition-colors mb-0.5">
            {crystal.name}
          </h3>
          <p className="text-xs text-cosmic-500 mb-2 italic">{crystal.hindiName}</p>

          {/* Planet + chakra */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-cosmic-800 text-cosmic-300 border border-cosmic-700">
              ☿ {crystal.planet}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cosmic-800 text-cosmic-300 border border-cosmic-700">
              {crystal.chakra}
            </span>
          </div>

          <p className="text-xs text-cosmic-400 leading-relaxed line-clamp-2 flex-1 mb-3">
            {crystal.shortDesc}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gold-500/10">
            <span className="text-[10px] text-cosmic-600">{crystal.hardness}</span>
            {crystal.mallProductId && (
              <span className="text-[10px] text-emerald-400 font-medium">✦ Available in Mall</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CrystalGuidePage() {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [typeFilter,setTypeFilter]= useState('all');
  const [planet,    setPlanet]    = useState('');
  const [sign,      setSign]      = useState('');
  const [search,    setSearch]    = useState('');
  const [searchInput,setSearchInput]=useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (typeFilter !== 'all') params.type = typeFilter;
    if (planet) params.planet = planet;
    if (sign)   params.sign = sign;
    if (search) params.search = search;
    crystalsApi.list(params)
      .then(r => setList(r.data.crystals))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang, typeFilter, planet, sign, search]);

  const clearFilters = () => { setTypeFilter('all'); setPlanet(''); setSign(''); setSearch(''); setSearchInput(''); };
  const hasFilter = typeFilter !== 'all' || planet || sign || search;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <div className="text-5xl mb-4">💎</div>
          <h1 className="text-3xl font-serif text-gold-400 mb-2">Crystal & Gemstone Guide</h1>
          <p className="text-cosmic-300 text-sm max-w-xl mx-auto">
            Explore the 9 Navagraha gems and healing crystals of Vedic astrology — their planetary rulers, benefits, and how to use them.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="card-cosmic p-5 mb-8 space-y-4">
          {/* Type tabs */}
          <div className="flex flex-wrap gap-2">
            {[{v:'all',l:'All Stones'},{v:'navagraha',l:'Navagraha Gems'},{v:'healing',l:'Healing Crystals'}].map(f => (
              <button key={f.v} onClick={() => setTypeFilter(f.v)}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${typeFilter === f.v ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold' : 'border-white/10 text-cosmic-400 hover:border-gold-500/30 hover:text-gold-400'}`}>
                {f.l}
              </button>
            ))}
          </div>

          {/* Planet + Sign + Search row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={planet} onChange={e => setPlanet(e.target.value)}
              className="input-cosmic text-sm py-2">
              <option value="">All Planets</option>
              {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={sign} onChange={e => setSign(e.target.value)}
              className="input-cosmic text-sm py-2">
              <option value="">All Zodiac Signs</option>
              {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); }} className="flex gap-2">
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Search…" className="input-cosmic flex-1 text-sm py-2" />
              <button type="submit" className="px-4 py-2 bg-gold-500/20 border border-gold-500/40 text-gold-400 rounded-lg text-sm hover:bg-gold-500/30 transition-colors">Go</button>
            </form>
          </div>

          {hasFilter && (
            <button onClick={clearFilters} className="text-xs text-cosmic-500 hover:text-gold-400 transition-colors underline">
              Clear all filters
            </button>
          )}
        </div>

        {/* "Find my gemstone" quick tool */}
        <div className="card-cosmic p-5 mb-8 border border-gold-500/20">
          <h3 className="text-gold-400 font-serif mb-1">✦ Find Your Gemstone by Lagna</h3>
          <p className="text-xs text-cosmic-400 mb-3">Select your Lagna (Ascendant) sign to see the primary recommended gemstone.</p>
          <div className="flex flex-wrap gap-2">
            {SIGNS.map(s => (
              <button key={s} onClick={() => { setSign(s); setTypeFilter('navagraha'); }}
                className="text-xs px-3 py-1.5 rounded-full border border-cosmic-700 text-cosmic-400 hover:border-gold-500/40 hover:text-gold-400 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gold-400 animate-pulse font-serif text-lg">✦ Loading crystals…</div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-cosmic-500">No crystals match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {list.map((c, i) => <CrystalCard key={c.slug} crystal={c} index={i} />)}
          </div>
        )}

        {/* Mall CTA */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="mt-12 text-center card-cosmic p-6 border-gold-500/20">
          <div className="text-3xl mb-3">🛍️</div>
          <h3 className="text-gold-400 font-serif text-lg mb-2">Shop Certified Gemstones</h3>
          <p className="text-cosmic-400 text-sm mb-4">
            Astro-charged, lab-certified gemstones — Blue Sapphire, Yellow Sapphire, Red Coral, Emerald, and more.
          </p>
          <Link to="/mall" className="btn-cosmic px-8 py-3 text-sm inline-block">Browse Astro Mall →</Link>
        </motion.div>
      </div>
    </div>
  );
}
