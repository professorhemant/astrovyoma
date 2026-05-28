import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AstrologerCard from '../components/AstrologerCard';
import { astrologers as astrologersApi } from '../api';
import SwastikBorder from '../components/SwastikBorder';

const CONCERNS = [
  { key: 'all', label: 'All', icon: '🔮' },
  { key: 'love', label: 'Love', icon: '❤️' },
  { key: 'career', label: 'Career', icon: '💼' },
  { key: 'marriage', label: 'Marriage', icon: '💍' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'health', label: 'Health', icon: '🌿' },
  { key: 'spiritual', label: 'Spiritual', icon: '🙏' },
];

const SORTS = [
  { key: '', label: 'Best Match' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'orders', label: 'Most Consulted' },
  { key: 'price_asc', label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
];

export default function AstrologersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [concern, setConcern] = useState('all');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    setLoading(true);
    astrologersApi.getAll({ concern: concern === 'all' ? undefined : concern, sort, page, limit: LIMIT })
      .then(res => { setList(res.data.astrologers || []); setTotal(res.data.total || 0); })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [concern, sort, page]);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Our Experts</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400">Find Your Cosmic Guide</h1>
          <p className="text-gray-200 mt-2">Verified Vedic astrologers, matched to your needs</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CONCERNS.map(c => (
            <button key={c.key} onClick={() => { setConcern(c.key); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${concern === c.key ? 'bg-gold-500 text-cosmic-950 font-semibold' : 'btn-outline-gold'}`}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end mb-8">
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="bg-cosmic-800 border border-gold-600/20 text-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold-500">
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gold-400 font-serif text-xl animate-pulse">✦ Finding your guides...</div>
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
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔭</div>
                <p className="text-gray-200">No astrologers found for this filter</p>
              </div>
            )}
            {total > LIMIT && (
              <div className="flex justify-center gap-3 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-outline-gold px-5 py-2 text-sm disabled:opacity-40">← Prev</button>
                <span className="text-gray-200 text-sm py-2">Page {page} of {Math.ceil(total / LIMIT)}</span>
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
