import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import RichText from '../components/RichText';
import { mall } from '../api';

const CATEGORY_STYLE = {
  gemstones: { grad:'from-blue-900/80 to-indigo-950',   icon:'💎' },
  rudraksha: { grad:'from-amber-900/80 to-orange-950',  icon:'🔮' },
  yantras:   { grad:'from-yellow-900/80 to-amber-950',  icon:'⭐' },
  bracelets: { grad:'from-purple-900/80 to-violet-950', icon:'📿' },
  kavach:    { grad:'from-red-900/80 to-rose-950',      icon:'🛡️' },
  murtis:    { grad:'from-orange-900/80 to-yellow-950', icon:'🕉️' },
  pyramids:  { grad:'from-teal-900/80 to-cyan-950',     icon:'🔺' },
  malas:     { grad:'from-pink-900/80 to-fuchsia-950',  icon:'📿' },
  combos:    { grad:'from-emerald-900/80 to-green-950', icon:'🎁' },
};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gold-500/20">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-white font-medium text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gold-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-gray-300 text-sm pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function AstroMallProductPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    setLoading(true);
    setQty(1);
    mall.getProduct(id)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gold-400 font-serif text-xl animate-pulse">✦ Loading Product...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-400">Product not found.</p>
        <Link to="/mall" className="text-gold-400 hover:underline text-sm">← Back to Mall</Link>
      </div>
    </div>
  );

  const { product, related } = data;
  const cs = CATEGORY_STYLE[product.category] || CATEGORY_STYLE.combos;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  const FAQS = [
    { q:'Is this product 100% authentic and natural?', a:`Yes. All our products are 100% natural and authentic, sourced from verified suppliers and tested in certified gemology labs. Each piece comes with an authenticity certificate.` },
    { q:'How are the products energised?', a:'Every product is energised by our panel of experienced Vedic astrologers using specific mantras, vedic rituals, and prana pratishtha (life force installation) procedures before dispatch.' },
    { q:`What is the best way to use this ${product.category.slice(0,-1)}?`, a: product.howToUse },
    { q:'Can I return this if I\'m not satisfied?', a:'Yes. We offer a 7-day return policy from the date of delivery. The product must be in unused condition in its original packaging. Contact our support team for hassle-free returns.' },
    { q:'Do you offer personalised product recommendations?', a:'Yes! You can consult one of our expert astrologers who will analyse your birth chart and recommend the most suitable products for your specific planetary configuration.' },
  ];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-6 flex-wrap">
            <Link to="/mall" className="hover:text-gold-400 transition-colors">Mall</Link>
            <span>/</span>
            <Link to={`/mall?category=${product.category}`} className="hover:text-gold-400 transition-colors capitalize">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
          </div>

          {/* Main product section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">

            {/* Left � Product visual */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
              <div className={`aspect-square rounded-3xl bg-gradient-to-br ${cs.grad} flex items-center justify-center border border-gold-500/25 relative overflow-hidden`}
                style={{ boxShadow:'0 0 60px rgba(201,168,76,0.08)' }}>
                {product.image
                  ? <img src={product.image} alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover" />
                  : <span className="text-[120px]">{cs.icon}</span>}
                {product.isBestseller && (
                  <div className="absolute top-4 left-4 bg-gold-500 text-cosmic-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Bestseller
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    {discount}% OFF
                  </div>
                )}
              </div>

              {/* Trust badges below image */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon:'✅', text: product.certification || 'Lab Certified' },
                  { icon:'🙏', text:'Astrologer Energised' },
                  { icon:'🚚', text:'Free Shipping' },
                ].map(b => (
                  <div key={b.text} className="bg-cosmic-800/60 border border-gold-500/25 rounded-xl p-2.5 text-center">
                    <div className="text-xl mb-1">{b.icon}</div>
                    <p className="text-gray-300 text-xs leading-tight">{b.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right � Product info */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="flex flex-col gap-4">

              {/* Category + Planet badges */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-gold-500/15 border border-gold-500/40 text-gold-300 text-xs px-3 py-1 rounded-full capitalize">{product.category}</span>
                {product.planet && (
                  <span className="bg-cosmic-800 border border-gold-500/30 text-gray-300 text-xs px-3 py-1 rounded-full">🪐 {product.planet}</span>
                )}
                {product.bestDay && (
                  <span className="bg-cosmic-800 border border-gold-500/30 text-gray-300 text-xs px-3 py-1 rounded-full">📅 Best day: {product.bestDay}</span>
                )}
              </div>

              {/* Name */}
              <h1 className="font-serif text-3xl text-white leading-tight">{product.name}</h1>

              {/* Rating — stars only once there are reviews to average. */}
              <div className="flex items-center gap-3">
                {product.reviewCount > 0 ? (
                  <>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'text-gold-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gold-400 font-semibold">{product.rating}</span>
                    <span className="text-gray-200 text-sm">({product.reviewCount} reviews)</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No reviews yet</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-4xl font-bold text-gold-400">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-gray-200 text-lg line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
              </div>

              {/* Short description */}
              <p className="text-gray-300 text-sm leading-relaxed">{product.shortDesc}</p>

              {/* Benefits */}
              <div className="bg-cosmic-800/50 border border-gold-500/25 rounded-2xl p-4">
                <h3 className="text-gold-400 font-semibold text-sm mb-3">✨ Key Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qty + Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gold-500/40 rounded-xl overflow-hidden bg-cosmic-800">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 text-gold-400 hover:bg-gold-500/10 transition-colors text-lg">-</button>
                  <span className="px-4 py-2.5 text-white font-semibold min-w-[40px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-4 py-2.5 text-gold-400 hover:bg-gold-500/10 transition-colors text-lg">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isInStock}
                  className="flex-1 bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold text-sm rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Policies */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-200">
                <span className="flex items-center gap-1">🚚 Free Shipping</span>
                <span className="flex items-center gap-1">🔄 7-Day Returns</span>
                <span className="flex items-center gap-1">💵 COD Available</span>
                <span className="flex items-center gap-1">🔒 Secure Payment</span>
              </div>
            </motion.div>
          </div>

          {/* Detailed Info Tabs */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Description */}
            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6">
              <h3 className="text-gold-400 font-serif font-semibold text-lg mb-3">About This Product</h3>
              <RichText content={product.description} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {product.weight && (
                  <div className="bg-cosmic-900/50 rounded-xl p-3">
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Weight / Size</p>
                    <p className="text-white text-sm">{product.weight}</p>
                  </div>
                )}
                {product.material && (
                  <div className="bg-cosmic-900/50 rounded-xl p-3">
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Material</p>
                    <p className="text-white text-sm">{product.material}</p>
                  </div>
                )}
                {product.planet && (
                  <div className="bg-cosmic-900/50 rounded-xl p-3">
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Ruling Planet</p>
                    <p className="text-white text-sm">🪐 {product.planet}</p>
                  </div>
                )}
                {product.zodiac?.length > 0 && (
                  <div className="bg-cosmic-900/50 rounded-xl p-3">
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Best for Zodiac</p>
                    <p className="text-white text-sm">{product.zodiac.join(', ')}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* How to Use */}
            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6">
              <h3 className="text-gold-400 font-serif font-semibold text-lg mb-3">How to Use</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{product.howToUse}</p>
              {(product.bestDay || product.bestTime) && (
                <div className="flex flex-wrap gap-3">
                  {product.bestDay && (
                    <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      <div>
                        <p className="text-gray-300 text-xs">Best Day</p>
                        <p className="text-gold-300 font-semibold text-sm">{product.bestDay}</p>
                      </div>
                    </div>
                  )}
                  {product.bestTime && (
                    <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <span className="text-xl">⏰</span>
                      <div>
                        <p className="text-gray-300 text-xs">Best Time</p>
                        <p className="text-gold-300 font-semibold text-sm">{product.bestTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* FAQ */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6 mb-12">
            <h3 className="text-gold-400 font-serif font-semibold text-xl mb-4">Frequently Asked Questions</h3>
            {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </motion.div>

          {/* Related Products */}
          {related?.length > 0 && (
            <section className="mb-12">
              <h3 className="font-serif text-gold-400 text-2xl mb-5">Related Products</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </section>
          )}

          {/* Astrologer CTA */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="bg-gradient-to-r from-cosmic-800/80 to-cosmic-900/80 border border-gold-500/40 rounded-2xl p-6 text-center">
            <p className="text-gray-300 text-sm mb-3">Not sure which product is right for your birth chart? Consult a Vedic astrologer for personalised recommendations.</p>
            <Link to="/astrologers" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">
              Get Personalised Recommendation ?
            </Link>
          </motion.div>

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
