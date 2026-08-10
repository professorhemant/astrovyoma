import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CATEGORY_STYLE = {
  gemstones: { grad:'from-blue-900/70 to-indigo-950',   icon:'💎' },
  rudraksha: { grad:'from-amber-900/70 to-orange-950',  icon:'🟤' },
  yantras:   { grad:'from-yellow-900/70 to-amber-950',  icon:'🔯' },
  bracelets: { grad:'from-purple-900/70 to-violet-950', icon:'📿' },
  kavach:    { grad:'from-red-900/70 to-rose-950',      icon:'🛡️' },
  murtis:    { grad:'from-orange-900/70 to-yellow-950', icon:'🙏' },
  pyramids:  { grad:'from-teal-900/70 to-cyan-950',     icon:'🔺' },
  malas:     { grad:'from-pink-900/70 to-fuchsia-950',  icon:'📿' },
  combos:    { grad:'from-emerald-900/70 to-green-950', icon:'🎁' },
};

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const cs = CATEGORY_STYLE[product.category] || CATEGORY_STYLE.combos;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-cosmic-800/60 border border-gold-500/30 rounded-2xl overflow-hidden group hover:border-gold-500/60 hover:shadow-lg transition-all duration-300"
      style={{ boxShadow: 'none' }}
      whileHover={{ boxShadow: '0 0 24px rgba(201,168,76,0.12)' }}
    >
      {/* Image area */}
      <Link to={`/mall/product/${product.id}`} className="block relative">
        <div className={`aspect-square bg-gradient-to-br ${cs.grad} flex items-center justify-center relative overflow-hidden`}>
          {product.image
            ? <img src={product.image} alt={product.name} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{cs.icon}</span>}
          {/* Badges */}
          {product.isBestseller && (
            <span className="absolute top-2 left-2 bg-gold-500 text-cosmic-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
          {!product.isInStock && (
            <div className="absolute inset-0 bg-cosmic-950/70 flex items-center justify-center">
              <span className="text-red-400 font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4">
        <p className="text-gold-500/70 text-xs uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/mall/product/${product.id}`}>
          <h3 className="text-white font-serif font-semibold text-sm leading-snug mb-2 line-clamp-2 hover:text-gold-300 transition-colors">{product.name}</h3>
        </Link>

        {/* Rating. Stars are shown only when reviews exist to average — the
            shop shipped with counts in the hundreds and no review had ever
            been left. The row keeps its height either way so the grid does
            not reflow when the first real review arrives. */}
        <div className="flex items-center gap-1.5 mb-3 min-h-[18px]">
          {product.reviewCount > 0 ? (
            <>
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-gold-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gold-400 text-xs font-semibold">{product.rating}</span>
              <span className="text-gray-200 text-xs">({product.reviewCount})</span>
            </>
          ) : (
            <span className="text-gray-500 text-xs">No reviews yet</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-gold-400 font-bold text-lg">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-gray-300 text-sm line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => product.isInStock && addToCart(product)}
          disabled={!product.isInStock}
          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold text-sm rounded-xl py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          🛒 {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
}
