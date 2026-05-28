import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { pooja as poojaApi } from '../api';

const HOW_IT_WORKS = [
  { step: '01', icon: '🏠', title: 'Choose Your Puja', desc: 'Select the Vastu puja that matches your need — new home, defect removal, business, or land.' },
  { step: '02', icon: '📅', title: 'Book & Pay', desc: 'Fill in your details and preferred date. Pay securely via UPI, card, or net banking.' },
  { step: '03', icon: '🕉️', title: 'Pandit Ji Performs', desc: 'Our Vastu-expert Pandit Ji performs the puja with proper Vedic vidhi, sankalp in your name and gotra.' },
  { step: '04', icon: '📲', title: 'Receive Video on WhatsApp', desc: 'A clear video of the complete puja is sent to your WhatsApp within 24 hours of completion.' },
];

const VASTU_BENEFITS = [
  { icon: '💰', title: 'Financial Prosperity', desc: 'Correct Vastu activates the north (Kubera) zone, attracting wealth and stable income.' },
  { icon: '❤️', title: 'Family Harmony', desc: 'Balanced directions reduce conflicts, improve relationships, and create a peaceful home.' },
  { icon: '🌿', title: 'Health & Vitality', desc: 'Proper east and northeast energy brings positive prana, improving physical and mental health.' },
  { icon: '🚀', title: 'Career Growth', desc: 'Office and study Vastu alignment sharpens focus, attracts opportunities, and speeds success.' },
  { icon: '😴', title: 'Restful Sleep', desc: 'Correct bedroom direction and head placement ensures deep, rejuvenating sleep every night.' },
  { icon: '🛡️', title: 'Protection & Safety', desc: 'Vastu corrections create an energy shield that protects the family from negative forces.' },
];

const TESTIMONIALS = [
  {
    name: 'Suresh Agarwal', city: 'Indore',
    text: 'After Vastu Shanti Havan, the financial losses we were suffering for 2 years completely stopped within a month. Pandit Ji was very experienced and the puja was very detailed.',
    stars: 5,
  },
  {
    name: 'Kavita Mehta', city: 'Jaipur',
    text: 'We had Griha Pravesh puja done before entering our new flat. The puja was beautiful and very authentic. Our family has been very peaceful and happy since then!',
    stars: 5,
  },
  {
    name: 'Ramakant Sharma', city: 'Bhopal',
    text: 'Booked Office Vastu Puja for my shop. Business has grown noticeably in just 3 months. Very satisfied with AstroVyoma — highly recommend for Vastu pujas.',
    stars: 5,
  },
];

export default function VastuPoojaPage() {
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    poojaApi.getVastuPujas()
      .then(r => setPujas(r.data.paaths))
      .catch(() => setPujas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-cosmic-950">

      {/* Top announcement banner */}
      <div className="relative z-10 pt-16">
        <div className="bg-gradient-to-r from-amber-900/90 via-orange-900/90 to-yellow-900/90 border-b border-amber-600/40 px-4 py-3">
          <p className="text-center text-amber-100 text-sm font-medium leading-relaxed max-w-3xl mx-auto">
            🏠 <strong>Our Vastu-expert Pandit Ji performs these sacred pujas for you remotely.</strong> Receive divine Vastu blessings anywhere in India — with a WhatsApp video as proof. 📲
          </p>
        </div>
      </div>

      <div className="relative z-10 pb-16">

        {/* Hero */}
        <section className="px-4 md:px-8 lg:px-16 py-12 max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-amber-500/70 text-sm tracking-widest uppercase mb-3">✦ Vedic Vastu Seva</p>
            <h1 className="font-serif text-3xl md:text-5xl text-amber-400 mb-4" style={{ textShadow: '0 0 30px rgba(217,119,6,0.5)' }}>
              Book Vastu Puja
            </h1>
            <p className="text-gray-300 text-base max-w-2xl mx-auto leading-relaxed mb-2">
              Restore cosmic harmony in your home, office, or land with authentic Vedic Vastu pujas — performed by our expert Pandit Ji with proper sankalp in your name.
            </p>
            <p className="text-amber-400/70 text-sm max-w-xl mx-auto mb-6">
              No physical changes to your home needed — powerful energetic corrections through sacred puja rituals.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/35 text-green-300 px-4 py-2 rounded-full">✅ Vastu Expert Pandits</span>
              <span className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/35 text-amber-300 px-4 py-2 rounded-full">📲 Video on WhatsApp</span>
              <span className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/35 text-blue-300 px-4 py-2 rounded-full">🙏 Sankalp in Your Name</span>
              <span className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/35 text-orange-300 px-4 py-2 rounded-full">🏠 No Demolition Needed</span>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="px-4 md:px-8 lg:px-16 pb-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-amber-900/20 border border-amber-600/25 rounded-2xl p-4 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">{step.step}</div>
                <div className="text-3xl mt-2 mb-2">{step.icon}</div>
                <p className="text-amber-300 font-semibold text-sm mb-1">{step.title}</p>
                <p className="text-gray-300 text-xs leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Puja Cards */}
        <section className="px-4 md:px-8 lg:px-16 max-w-6xl mx-auto">
          <h2 className="font-serif text-amber-400 text-3xl text-center mb-2">Vastu Puja Seva</h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Choose the puja that matches your need — our expert Pandit Ji will perform it with complete Vedic vidhi
          </p>

          {loading ? (
            <div className="text-center py-20 text-amber-400 font-serif text-xl animate-pulse">✦ Loading Vastu Pujas...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pujas.map((puja, i) => (
                <PujaCard key={puja.id} puja={puja} index={i} onBook={() => setSelected(puja)} />
              ))}
            </div>
          )}
        </section>

        {/* Vastu Benefits */}
        <section className="px-4 md:px-8 lg:px-16 mt-16 max-w-6xl mx-auto">
          <h3 className="font-serif text-amber-400 text-2xl text-center mb-2">Why Vastu Matters</h3>
          <p className="text-gray-400 text-sm text-center mb-8">Your home's energy directly affects every area of your life</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {VASTU_BENEFITS.map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                className="bg-amber-900/15 border border-amber-600/20 rounded-2xl p-5 flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{b.icon}</span>
                <div>
                  <p className="text-amber-200 font-semibold text-sm">{b.title}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust section */}
        <section className="px-4 md:px-8 lg:px-16 mt-14 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-600/30 rounded-3xl p-8">
            <h3 className="font-serif text-2xl text-amber-300 text-center mb-6">Why Book With AstroVyoma?</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { icon: '🎓', title: 'Vastu-Expert Pandits', desc: 'All our pandits specialise in Vastu Shastra with years of experience in Vastu Shanti, Griha Pravesh, and Bhoomi pujas.' },
                { icon: '🎥', title: 'Video Proof on WhatsApp', desc: 'You receive a clear video of the complete puja on your registered WhatsApp — verify every step yourself.' },
                { icon: '📿', title: 'Sankalp in Your Name', desc: 'Every puja begins with a proper Sankalp (intention) in your name, gotra, and specific Vastu purpose.' },
                { icon: '🛕', title: 'Sacred Venue', desc: 'Pujas are performed at a dedicated puja space with authentic samagri, Vastu yantras, and proper Vedic setup.' },
                { icon: '🚫', title: 'No Demolition Needed', desc: 'Our pujas energetically correct Vastu doshas without any physical changes to your home or office.' },
                { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges. Pay only the displayed amount. Secure UPI, card, and net banking accepted.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-amber-200 font-semibold text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="px-4 md:px-8 lg:px-16 mt-14 max-w-6xl mx-auto">
          <h3 className="font-serif text-amber-400 text-2xl text-center mb-6">What Our Clients Say</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="bg-cosmic-800/50 border border-amber-600/25 rounded-2xl p-5">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA footer */}
        <div className="text-center mt-12 flex flex-wrap gap-3 justify-center px-4">
          <Link to="/vastu"
            className="inline-block border border-amber-500/40 text-amber-400 rounded-full px-8 py-3 hover:bg-amber-500/10 transition-colors text-sm">
            ← Back to Vastu Shastra Guide
          </Link>
          <Link to="/astrologers"
            className="inline-block bg-gradient-to-r from-amber-600 to-amber-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">
            Consult a Vastu Expert →
          </Link>
        </div>
      </div>

      {/* Booking Modal */}
      {selected && <BookingModal paath={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PujaCard({ puja, index, onBook }) {
  const discount = Math.round((1 - puja.price / puja.originalPrice) * 100);
  const gradStyle = { background: `linear-gradient(135deg, ${puja.gradient[0]}, ${puja.gradient[1]})` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="rounded-3xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
      style={{ boxShadow: `0 8px 32px ${puja.gradient[0]}25` }}
    >
      {/* Colored header */}
      <div className="relative px-6 pt-6 pb-5 text-center" style={gradStyle}>
        {/* Discount badge */}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {discount}% OFF
        </div>
        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">{puja.icon}</div>
        <p className="text-white/80 text-xs uppercase tracking-widest mb-1">{puja.deity}</p>
        <h3 className="text-white font-serif text-xl font-bold leading-tight mb-1">{puja.name}</h3>
        <p className="text-white/80 text-sm">{puja.subtitle}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">⏱️ {puja.duration}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="bg-cosmic-800 p-5">
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{puja.description}</p>

        {/* Benefits */}
        <ul className="space-y-1.5 mb-4">
          {puja.benefits.slice(0, 3).map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
              <span className="text-amber-400 flex-shrink-0 mt-0.5">✓</span>{b}
            </li>
          ))}
        </ul>

        {/* Includes */}
        <div className="bg-cosmic-900/60 rounded-xl p-3 mb-4">
          <p className="text-amber-400/80 text-xs uppercase tracking-wider mb-2">Includes</p>
          <div className="flex flex-wrap gap-1.5">
            {puja.includes.map((inc, i) => (
              <span key={i} className="text-xs bg-cosmic-700/60 border border-amber-500/20 text-gray-300 px-2.5 py-1 rounded-full">
                {inc}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-400 font-bold text-2xl">₹{puja.price.toLocaleString('en-IN')}</p>
            <p className="text-gray-400 text-xs line-through">₹{puja.originalPrice.toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={onBook}
            className="bg-gradient-to-r from-amber-600 to-amber-400 text-cosmic-950 font-bold text-sm rounded-xl px-6 py-2.5 hover:opacity-90 transition-opacity"
          >
            🏠 Book Now
          </button>
        </div>

        {puja.occasion && (
          <p className="text-gray-400 text-xs mt-3 border-t border-amber-500/15 pt-3">
            📅 Best for: <span className="text-gray-300">{puja.occasion}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
