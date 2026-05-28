import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { pooja as poojaApi } from '../api';

const HOW_IT_WORKS = [
  { step:'01', icon:'🙏', title:'Choose Your Paath', desc:'Select from 11 sacred paaths — each performed with full Vedic rituals by our experienced Pandit Ji.' },
  { step:'02', icon:'📅', title:'Book & Pay', desc:'Fill in your name, WhatsApp number, and preferred date. Pay the small paath fee to confirm.' },
  { step:'03', icon:'🕉️', title:'Pandit Ji Performs', desc:'Our dedicated Pandit Ji performs the paath on your chosen date with proper sankalp in your name and gotra.' },
  { step:'04', icon:'📲', title:'Receive Video Proof', desc:'A clear video of the complete paath is sent directly to your WhatsApp number within 24 hours of completion.' },
];

const TESTIMONIALS = [
  { name:'Priya Sharma', city:'Delhi', text:'Got Sunderkand done 5 times for my son\'s job. He got selected within a month! Pandit Ji was very professional and the video was crystal clear.', stars:5 },
  { name:'Ramesh Gupta', city:'Mumbai', text:'Booked Satyanarayan Katha for our new home. The pandit ji recited everything perfectly. Will definitely book again for Navratri.', stars:5 },
  { name:'Anita Verma', city:'Jaipur', text:'Maha Mrityunjaya Jaap for my mother\'s health recovery. She has shown significant improvement. Grateful to AstroVyoma for this service.', stars:5 },
];

export default function BookPoojaPage() {
  const [paaths, setPaaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    poojaApi.getPaaths()
      .then(r => setPaaths(r.data.paaths))
      .catch(() => setPaaths([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-cosmic-950">

      {/* Top announcement banner */}
      <div className="relative z-10 pt-16">
        <div className="bg-gradient-to-r from-amber-700/80 via-orange-700/80 to-red-700/80 border-b border-amber-500/40 px-4 py-3">
          <p className="text-center text-amber-100 text-sm font-medium leading-relaxed max-w-3xl mx-auto">
            🙏 <strong>Our Pandit Ji will perform these Pooja Paaths for you to get benefit sitting at home.</strong> A video will be sent to your mobile number on WhatsApp as proof of the paath. Book now and receive divine blessings without leaving your home. 📲
          </p>
        </div>
      </div>

      <div className="relative z-10 pb-16">

        {/* Hero */}
        <section className="px-4 md:px-8 lg:px-16 py-12 max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✦ Divine Paath Seva</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-4" style={{ textShadow:'0 0 30px rgba(201,168,76,0.45)' }}>
              Book a Pooja Paath
            </h1>
            <p className="text-gray-300 text-base max-w-2xl mx-auto leading-relaxed mb-6">
              Can't perform the paath yourself? Let our experienced Pandit Ji perform it on your behalf with proper Vedic rituals, sankalp in your name — and receive the complete video on WhatsApp.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/35 text-green-300 px-4 py-2 rounded-full">✅ Experienced Pandits</span>
              <span className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/35 text-amber-300 px-4 py-2 rounded-full">📲 Video on WhatsApp</span>
              <span className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/35 text-blue-300 px-4 py-2 rounded-full">🙏 Sankalp in Your Name</span>
              <span className="flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/35 text-purple-300 px-4 py-2 rounded-full">🏠 Performed at Temple</span>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="px-4 md:px-8 lg:px-16 pb-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}
                className="bg-cosmic-800/50 border border-gold-500/25 rounded-2xl p-4 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-cosmic-950 text-xs font-black px-2.5 py-0.5 rounded-full">{step.step}</div>
                <div className="text-3xl mt-2 mb-2">{step.icon}</div>
                <p className="text-gold-300 font-semibold text-sm mb-1">{step.title}</p>
                <p className="text-gray-300 text-xs leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Paath Cards */}
        <section className="px-4 md:px-8 lg:px-16 max-w-6xl mx-auto">
          <h2 className="font-serif text-gold-400 text-3xl text-center mb-2">Available Paath Seva</h2>
          <p className="text-gray-200 text-sm text-center mb-8">Select any paath — our Pandit Ji will perform it with complete Vedic vidhi</p>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Loading Paaths...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paaths.map((paath, i) => (
                <PaathCard key={paath.id} paath={paath} index={i} onBook={() => setSelected(paath)} />
              ))}
            </div>
          )}
        </section>

        {/* Trust section */}
        <section className="px-4 md:px-8 lg:px-16 mt-16 max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/35 rounded-3xl p-8">
            <h3 className="font-serif text-2xl text-amber-300 text-center mb-6">Why Book With AstroVyoma?</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { icon:'👨‍🎓', title:'Vedic Scholars', desc:'All pandits hold traditional degrees from Vedic institutions with 10+ years of recitation experience.' },
                { icon:'🎥', title:'Video Proof on WhatsApp', desc:'You receive a clear video of the complete paath on your registered WhatsApp — no trust required, just verify.' },
                { icon:'📿', title:'Sankalp in Your Name', desc:'Every paath begins with a proper Sankalp (intention) in your name, gotra, and purpose.' },
                { icon:'🛕', title:'Performed at Sacred Venue', desc:'Paaths are performed at a dedicated puja space with proper samagri, flowers, and incense.' },
                { icon:'💬', title:'WhatsApp Updates', desc:'You receive booking confirmation and real-time updates throughout the paath on WhatsApp.' },
                { icon:'💰', title:'Transparent Pricing', desc:'No hidden charges. Pay only the displayed amount. Secure UPI payment accepted.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-amber-200 font-semibold text-sm">{item.title}</p>
                    <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="px-4 md:px-8 lg:px-16 mt-14 max-w-6xl mx-auto">
          <h3 className="font-serif text-gold-400 text-2xl text-center mb-6">What Devotees Say</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="bg-cosmic-800/50 border border-gold-500/25 rounded-2xl p-5">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-gold-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gold-500/20 border border-gold-500/40 rounded-full flex items-center justify-center text-gold-400 font-bold text-sm">{t.name[0]}</div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-gray-300 text-xs">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mt-12 flex flex-wrap gap-3 justify-center px-4">
          <Link to="/astrologers" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">
            Consult an Astrologer
          </Link>
          <Link to="/mall" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">
            🛍️ Astro Mall
          </Link>
        </div>
      </div>

      {/* Booking Modal */}
      {selected && <BookingModal paath={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PaathCard({ paath, index, onBook }) {
  const discount = Math.round((1 - paath.price / paath.originalPrice) * 100);
  const gradStyle = { background: `linear-gradient(135deg, ${paath.gradient[0]}, ${paath.gradient[1]})` };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: index * 0.06 }}
      className="rounded-3xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
      style={{ boxShadow:`0 8px 32px ${paath.gradient[0]}20` }}
    >
      {/* Colored header */}
      <div className="relative px-6 pt-6 pb-5 text-center" style={gradStyle}>
        {/* Discount badge */}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {discount}% OFF
        </div>
        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">{paath.icon}</div>
        <p className="text-white/90 text-xs uppercase tracking-widest mb-1">{paath.deity}</p>
        <h3 className="text-white font-serif text-xl font-bold leading-tight mb-1">{paath.name}</h3>
        <p className="text-white/80 text-sm">{paath.subtitle}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">⏱️ {paath.duration}</span>
          {paath.planet && <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">🪐 {paath.planet}</span>}
        </div>
      </div>

      {/* Card body */}
      <div className="bg-cosmic-800 p-5">
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{paath.description}</p>

        {/* Benefits */}
        <ul className="space-y-1.5 mb-4">
          {paath.benefits.slice(0, 3).map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
              <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>{b}
            </li>
          ))}
        </ul>

        {/* Includes */}
        <div className="bg-cosmic-900/60 rounded-xl p-3 mb-4">
          <p className="text-gold-400/80 text-xs uppercase tracking-wider mb-2">Includes</p>
          <div className="flex flex-wrap gap-1.5">
            {paath.includes.map((inc, i) => (
              <span key={i} className="text-xs bg-cosmic-700/60 border border-gold-500/20 text-gray-300 px-2.5 py-1 rounded-full">
                {inc}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            {paath.variants ? (
              <>
                <p className="text-gray-300 text-xs">Starting from</p>
                <p className="text-gold-400 font-bold text-2xl">₹{paath.price.toLocaleString('en-IN')}</p>
              </>
            ) : (
              <>
                <p className="text-gold-400 font-bold text-2xl">₹{paath.price.toLocaleString('en-IN')}</p>
                <p className="text-gray-300 text-xs line-through">₹{paath.originalPrice.toLocaleString('en-IN')}</p>
              </>
            )}
          </div>
          <button
            onClick={onBook}
            className="bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-bold text-sm rounded-xl px-6 py-2.5 hover:opacity-90 transition-opacity"
          >
            🙏 Book Now
          </button>
        </div>

        {paath.occasion && (
          <p className="text-gray-300 text-xs mt-3 border-t border-gold-500/15 pt-3">
            📅 Best for: <span className="text-gray-200">{paath.occasion}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
