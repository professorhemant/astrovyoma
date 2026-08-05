import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blog } from '../api';

const CAT_COLORS = {
  'Vedic Astrology': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Planets':         'bg-blue-500/20   text-blue-300   border-blue-500/30',
  'Horoscope':       'bg-gold-500/20   text-gold-300   border-gold-500/30',
  'Relationships':   'bg-rose-500/20   text-rose-300   border-rose-500/30',
  'Career':          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Spirituality':    'bg-indigo-500/20 text-indigo-300  border-indigo-500/30',
  'Vastu':           'bg-amber-500/20  text-amber-300   border-amber-500/30',
  'Remedies':        'bg-teal-500/20   text-teal-300    border-teal-500/30',
};

function CatChip({ cat, small }) {
  const cls = CAT_COLORS[cat] || 'bg-cosmic-700 text-cosmic-300 border-cosmic-600';
  return (
    <span className={`inline-block border rounded-full font-medium ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${cls}`}>
      {cat}
    </span>
  );
}

function ArticleCard({ article, index }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.05 }}
      className="card-cosmic flex flex-col h-full group"
    >
      <Link to={`/blog/${article.slug}`} className="flex flex-col h-full p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-3xl">{article.icon}</div>
          <CatChip cat={article.category} small />
        </div>
        <h2 className="text-base font-serif text-cosmic-100 group-hover:text-gold-400 transition-colors mb-2 leading-snug line-clamp-2">
          {article.title}
        </h2>
        <p className="text-sm text-cosmic-400 leading-relaxed line-clamp-3 flex-1 mb-4">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-cosmic-500 mt-auto pt-3 border-t border-gold-500/10">
          <span>{new Date(article.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          <span>{article.readTime} min read</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPage() {
  const [articles,    setArticles]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [activeTab,   setActiveTab]   = useState('all');
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const params = {};
    if (activeTab !== 'all') params.category = activeTab;
    if (search) params.search = search;
    setLoading(true);
    blog.list(params)
      .then(r => { setArticles(r.data.articles); setCategories(r.data.categories || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setActiveTab('all');
  };

  // relative z-10: without a stacking context the fixed z-0 CosmicBackground
  // paints over this page's heading and filters.
  return (
    <div className="relative z-10 min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-3xl font-serif text-gold-400 mb-2">Vedic Astrology Insights</h1>
          <p className="text-cosmic-300 text-sm max-w-xl mx-auto">
            Deep-dive articles on Jyotish, planetary transits, relationships, Vastu, and the art of living in alignment with the cosmos.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search articles…"
              className="input-cosmic flex-1 py-2.5 text-sm"
            />
            <button type="submit" className="btn-cosmic px-5 py-2.5 text-sm">Search</button>
          </form>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => { setActiveTab('all'); setSearch(''); setSearchInput(''); }}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${activeTab === 'all' ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold' : 'border-white/10 text-cosmic-400 hover:border-gold-500/30 hover:text-gold-400'}`}>
            All Articles
          </button>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => { setActiveTab(cat); setSearch(''); setSearchInput(''); }}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all ${activeTab === cat ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold' : 'border-white/10 text-cosmic-400 hover:border-gold-500/30 hover:text-gold-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-gold-400 animate-pulse font-serif text-lg">✦ Loading articles…</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-cosmic-500">No articles found. Try a different search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
