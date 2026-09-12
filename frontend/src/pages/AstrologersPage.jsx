import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Gem, Coins, Leaf, Sparkles, Layers, SlidersHorizontal, Users, Zap } from 'lucide-react';
import AstrologerCard from '../components/AstrologerCard';
import { astrologers as astrologersApi } from '../api';
import SwastikBorder from '../components/SwastikBorder';

const CONCERNS = [
  { key: 'all',      label: 'All',       Icon: Layers    },
  { key: 'love',     label: 'Love',      Icon: Heart     },
  { key: 'career',   label: 'Career',    Icon: Briefcase },
  { key: 'marriage', label: 'Marriage',  Icon: Gem       },
  { key: 'finance',  label: 'Finance',   Icon: Coins     },
  { key: 'health',   label: 'Health',    Icon: Leaf      },
  { key: 'spiritual',label: 'Spiritual', Icon: Sparkles  },
];

const SORTS = [
  { key: '',           label: 'Best Match'         },
  { key: 'rating',     label: 'Top Rated'          },
  { key: 'orders',     label: 'Most Consulted'     },
  { key: 'price_asc',  label: 'Price: Low → High'  },
  { key: 'price_desc', label: 'Price: High → Low'  },
];

export default function AstrologersPage() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [concern, setConcern] = useState('all');
  const [sort, setSort]       = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    setLoading(true);
    astrologersApi.getAll({ concern: concern === 'all' ? undefined : concern, sort, page, limit: LIMIT })
      .then(res => { setList(res.data.astrologers || []); setTotal(res.data.total || 0); })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [concern, sort, page]);

  const onlineCount = list.filter(a => a.is_online).length;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-24">

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-gold-500 text-xs uppercase tracking-widest mb-2">Our Experts</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3">Find Your Cosmic Guide</h1>
          <p className="text-gray-300 text-sm">Verified Vedic astrologers, matched to your needs</p>

          {/* Live stats strip */}
          {!loading && total > 0 && (
            <div className="flex items-center justify-center gap-6 mt-5">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Users className="w-3.5 h-3.5 text-gold-500" />
                {total} astrologers
              </span>
              <span className="w-px h-3 bg-gold-600/30" />
              {onlineCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  {onlineCount} online now
                </span>
              )}
              <span className="w-px h-3 bg-gold-600/30" />
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Zap className="w-3.5 h-3.5 text-gold-500" />
                Instant connection
              </span>
            </div>
          )}
        </motion.div>

        {/* Glow separator */}
        <div className="h-px mb-7" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)' }} />

        {/* ── Filter + Sort row ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          {/* Concern pills */}
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map(c => (
              <button key={c.key} onClick={() => { setConcern(c.key); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition-all ${
                  concern === c.key
                    ? 'bg-gold-500 text-cosmic-950 font-semibold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                    : 'btn-outline-gold'
                }`}>
                <c.Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort control */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-gold-500" />
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="input-cosmic py-1.5 text-sm pr-8" style={{ width: 'auto', minWidth: '11rem' }}>
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Finding your guides…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {list.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <AstrologerCard astrologer={a} />
                </motion.div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="text-center py-20">
                <Sparkles className="w-10 h-10 text-gold-500/40 mx-auto mb-4" />
                <p className="text-gray-300 font-serif text-lg">No astrologers found for this filter</p>
                <button onClick={() => { setConcern('all'); setSort(''); setPage(1); }}
                  className="mt-4 btn-outline-gold px-5 py-2 text-sm">
                  Show all astrologers
                </button>
              </div>
            )}

            {total > LIMIT && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-outline-gold px-5 py-2 text-sm disabled:opacity-40">← Prev</button>
                <span className="text-gray-400 text-sm">Page {page} of {Math.ceil(total / LIMIT)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * LIMIT >= total}
                  className="btn-outline-gold px-5 py-2 text-sm disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
