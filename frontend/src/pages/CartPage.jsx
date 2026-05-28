import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CATEGORY_ICON = {
  gemstones:'💎', rudraksha:'🔮', yantras:'⭐', bracelets:'📿',
  kavach:'🛡️', murtis:'🕉️', pyramids:'🔺', malas:'📿', combos:'🎁',
};

export default function CartPage() {
  const { items, removeFromCart, updateQty, totalItems, totalPrice, clearCart } = useCart();

  if (items.length === 0) return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag className="w-20 h-20 text-gold-500/40" />
        <h2 className="font-serif text-3xl text-gold-400">Your cart is empty</h2>
        <p className="text-gray-200 text-sm text-center">Add some sacred products to your cart to see them here.</p>
        <Link to="/mall" className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity">
          Explore Astro Mall
        </Link>
      </div>
    </div>
  );

  const shipping = 0;
  const savings = items.reduce((s, i) => s + (i.originalPrice - i.price) * i.qty, 0);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-2">🕉️ Sacred Store</p>
            <h1 className="font-serif text-3xl md:text-4xl text-gold-400">Your Cart</h1>
            <p className="text-gray-200 text-sm mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} � energised & ready to dispatch</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}
                  className="bg-cosmic-800/60 border border-gold-500/30 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-cosmic-900/80 flex items-center justify-center text-3xl flex-shrink-0">
                    {CATEGORY_ICON[item.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/mall/product/${item.id}`} className="text-white font-medium text-sm hover:text-gold-300 transition-colors line-clamp-2">{item.name}</Link>
                    <p className="text-gold-400 font-semibold text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center border border-gold-500/30 rounded-xl overflow-hidden bg-cosmic-900/50 flex-shrink-0">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-1.5 text-gold-400 hover:bg-gold-500/10 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-white text-sm font-semibold min-w-[32px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1.5 text-gold-400 hover:bg-gold-500/10 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold text-sm">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    <button onClick={() => removeFromCart(item.id)} className="mt-1 text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <Link to="/mall" className="text-gold-400 text-sm hover:underline flex items-center gap-1">← Continue Shopping</Link>
                <button onClick={clearCart} className="text-red-400/60 text-xs hover:text-red-400 transition-colors">Clear cart</button>
              </div>
            </div>

            {/* Order summary */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="bg-cosmic-800/60 border border-gold-500/40 rounded-2xl p-5 h-fit">
              <h3 className="font-serif text-gold-400 text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal ({totalItems} items)</span>
                  <span className="text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-green-400 font-semibold">FREE</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-400">You Save</span>
                    <span className="text-green-400 font-semibold">₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-gold-500/25 pt-3 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-gold-400 text-lg">₹{(totalPrice + shipping).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold rounded-xl py-3 hover:opacity-90 transition-opacity mb-3">
                Proceed to Checkout
              </button>
              <p className="text-center text-gray-300 text-xs">🔒 Secure checkout � COD available</p>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gold-500/20 grid grid-cols-2 gap-2">
                {[['✅','Lab Certified'],['🙏','Energised'],['🚚','Free Ship'],['🔄','7-Day Return']].map(([icon,label]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-gray-200">
                    <span>{icon}</span><span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
