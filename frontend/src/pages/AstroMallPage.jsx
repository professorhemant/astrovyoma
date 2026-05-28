import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { mall } from '../api';

const SORT_OPTIONS = [
  { value:'',           label:'Featured' },
  { value:'popular',    label:'Most Popular' },
  { value:'rating',     label:'Top Rated' },
  { value:'price-asc',  label:'Price: Low to High' },
  { value:'price-desc', label:'Price: High to Low' },
];

const CATEGORY_ICONS = {
  gemstones:'💎', rudraksha:'🟤', yantras:'🔯', bracelets:'📿',
  kavach:'🛡️', murtis:'🙏', pyramids:'🔺', malas:'📿', combos:'🎁',
};

export default function AstroMallPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const activeCategory = searchParams.get('category') || '';
  const activePurpose  = searchParams.get('purpose')  || '';
  const activeSort     = searchParams.get('sort')     || '';

  const { totalItems } = useCart();

  useEffect(() => {
    mall.getCategories().then(r => setMeta(r.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (activePurpose)  params.purpose  = activePurpose;
    if (activeSort)     params.sort     = activeSort;
    if (search)         params.search   = search;
    mall.getProducts(params)
      .then(r => setProducts(r.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activePurpose, activeSort, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch(''); setSearchInput('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const hasFilter = activeCategory || activePurpose || activeSort || search;

  return (
    <div className="relative min-h-screen bg-cosmic-950">

      {/* Trust bar */}
      <div className="relative z-10 bg-gold-500/10 border-b border-gold-500/25 pt-16">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-2 px-4 text-xs text-gold-300">
          <span className="flex items-center gap-1.5">🚚 <b>Free Shipping</b> on all orders</span>
          <span className="hidden sm:flex items-center gap-1.5">✨ <b>Energised</b> by Expert Astrologers</span>
          <span className="flex items-center gap-1.5">🔬 <b>100% Authentic</b> & Certified</span>
          <span className="hidden sm:flex items-center gap-1.5">↩️ <b>7-Day</b> Easy Returns</span>
          <span className="flex items-center gap-1.5">📞 <b>COD</b> Available</span>
        </div>
      </div>

      <div className="relative z-10 pb-16">

        {/* Hero */}
        <section className="px-4 md:px-8 lg:px-16 py-10 max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✦ Sacred Products Store</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>
              AstroVyoma Mall
            </h1>
            <p className="text-gray-300 text-sm max-w-xl mx-auto">
              Genuine gemstones, Rudraksha, Yantras & sacred products — energised by our panel of Vedic astrologers
            </p>
          </motion.div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8 flex gap-2">
            <div className="flex-1 flex items-center bg-cosmic-800 border border-gold-500/40 rounded-full px-4 gap-2 focus-within:border-gold-500/70 transition-colors">
              <Search className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products, gemstones, yantras…"
                className="flex-1 bg-transparent py-2.5 text-white text-sm focus:outline-none placeholder-gray-500"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }} className="text-gray-300 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold text-sm rounded-full px-6 hover:opacity-90 transition-opacity">
              Search
            </button>
          </form>
        </section>

        {/* Categories */}
        {!hasFilter && meta && (
          <section className="px-4 md:px-8 lg:px-16 pb-10 max-w-6xl mx-auto">
            <h2 className="font-serif text-gold-400 text-2xl mb-5 text-center">Shop by Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
              {meta.categories.map((cat, i) => (
                <motion.button
                  key={cat.key}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setFilter('category', cat.key)}
                  className="flex flex-col items-center gap-2 p-3 bg-cosmic-800/60 border border-gold-500/25 rounded-2xl hover:border-gold-500/60 hover:bg-gold-500/10 transition-all group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-white text-xs font-medium text-center leading-tight">{cat.label}</span>
                  <span className="text-gold-500/60 text-[10px]">{cat.count} items</span>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Shop by Purpose */}
        {!hasFilter && meta && (
          <section className="px-4 md:px-8 lg:px-16 pb-10 max-w-6xl mx-auto">
            <h2 className="font-serif text-gold-400 text-2xl mb-5 text-center">Shop by Purpose</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {meta.purposes.map((p, i) => (
                <motion.button
                  key={p.key}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => setFilter('purpose', p.key)}
                  className="flex items-center gap-4 p-4 bg-cosmic-800/60 border border-gold-500/25 rounded-2xl hover:border-gold-500/55 hover:bg-gold-500/5 transition-all text-left group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{p.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm" style={{ color: p.color }}>{p.label}</p>
                    <p className="text-gray-300 text-xs mt-0.5 leading-tight">{p.desc}</p>
                    <p className="text-gold-500/60 text-xs mt-1">{p.count} products</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Products section */}
        <section className="px-4 md:px-8 lg:px-16 max-w-6xl mx-auto">

          {/* Section header + filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-gold-400 text-2xl">
                {activeCategory
                  ? `${CATEGORY_ICONS[activeCategory] || ''} ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`
                  : activePurpose
                  ? `✨ ${activePurpose.charAt(0).toUpperCase() + activePurpose.slice(1)} Products`
                  : search
                  ? `Search: "${search}"`
                  : '⭐ Bestsellers & Featured'}
              </h2>
              {!loading && (
                <span className="text-gray-200 text-sm">({products.length} products)</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {hasFilter && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-red-400 text-xs border border-red-400/40 rounded-full px-3 py-1.5 hover:bg-red-400/10 transition-colors">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
              <select
                value={activeSort}
                onChange={e => setFilter('sort', e.target.value)}
                className="bg-cosmic-800 border border-gold-500/40 text-gold-300 text-sm rounded-full px-3 py-1.5 focus:outline-none focus:border-gold-500/70 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category filter chips */}
          {meta && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('category', '')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!activeCategory ? 'bg-gold-500/20 border-gold-500/60 text-gold-300' : 'border-gold-500/25 text-gray-200 hover:border-gold-500/40'}`}
              >
                All
              </button>
              {meta.categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFilter('category', cat.key === activeCategory ? '' : cat.key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${activeCategory === cat.key ? 'bg-gold-500/20 border-gold-500/60 text-gold-300' : 'border-gold-500/25 text-gray-200 hover:border-gold-500/40'}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Loading Sacred Products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-200 text-lg mb-2">No products found</p>
              <button onClick={clearFilters} className="text-gold-400 text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Trust Pillars */}
        <section className="px-4 md:px-8 lg:px-16 mt-16 max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon:'🔬', title:'Lab Certified', desc:'Every product tested and certified for authenticity' },
                { icon:'🕉️', title:'Astrologer Energised', desc:'Charged with mantras by our panel of Vedic experts' },
                { icon:'🚚', title:'Free Shipping', desc:'Free delivery on all orders across India' },
                { icon:'↩️', title:'7-Day Returns', desc:'Hassle-free returns if you\'re not satisfied' },
              ].map(item => (
                <div key={item.title}>
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <p className="text-gold-400 font-serif font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-gray-300 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <div className="text-center mt-10 flex flex-wrap gap-3 justify-center px-4">
          <Link to="/astrologers" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">
            Consult an Astrologer
          </Link>
          <Link to="/panchang" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">
            Today's Panchang
          </Link>
        </div>

      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <Link to="/cart" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold px-5 py-3 rounded-full shadow-xl hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({totalItems})</span>
        </Link>
      )}
    </div>
  );
}
