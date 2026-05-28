import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Star, Eye, Users, BookOpen, Home, Sparkles } from 'lucide-react';
import SwastikBorder from '../components/SwastikBorder';
import ZodiacWheel from '../components/ZodiacWheel';

// ── Floating cosmic symbols ────────────────────────────────────────────────────
function FloatingSymbol({ symbol, style }) {
  return (
    <motion.div
      animate={{ y: [0, -18, 0], opacity: [0.2, 0.55, 0.2] }}
      transition={{ duration: 5 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
      className="absolute text-gold-400 pointer-events-none select-none"
      style={{ fontSize: '1.4rem', textShadow: '0 0 14px rgba(201,168,76,0.5)', ...style }}
    >
      {symbol}
    </motion.div>
  );
}

// ── Animated star field ───────────────────────────────────────────────────────
function MiniStars() {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: (i * 9.7 + 7.3) % 100,
    y: (i * 13.1 + 3.7) % 100,
    size: ((i * 2.3) % 2) + 0.5,
    delay: (i * 0.4) % 6,
    dur: 2 + (i * 0.19) % 3.5,
    op: 0.3 + (i * 0.06) % 0.6,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.op }}
          animate={{ opacity: [s.op * 0.2, s.op, s.op * 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-600/30 to-transparent" />
      <span className="text-gold-600/50 text-xs">✦</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-600/30 to-transparent" />
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '5,000+', label: 'Years of Vedic Wisdom', icon: '📜' },
  { value: '12+',    label: 'Expert Astrologers',     icon: '🔭' },
  { value: '10,000+',label: 'Lives Guided',           icon: '🌟' },
  { value: '100%',   label: 'Confidential & Secure',  icon: '🔐' },
];

// ── Pillars ───────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: <Star className="w-6 h-6" />,
    emoji: '🏛️',
    title: 'The Elite Brain Trust',
    desc: 'Our panel doesn\'t consist of hobbyists. It features celebrated authors, institutional scholars, and trusted advisors to industry captains, global tech leaders, and innovators.',
    color: 'from-gold-600/20 to-gold-400/5',
    border: 'border-gold-500/30',
  },
  {
    icon: <Users className="w-6 h-6" />,
    emoji: '🤝',
    title: 'Power of Collaboration',
    desc: 'Unlike standalone consultations, AstroVyoma operates as a collaborative guild. For complex life blueprints, our top experts cross-verify planetary transits and charts to deliver unprecedented accuracy.',
    color: 'from-violet-600/20 to-violet-400/5',
    border: 'border-violet-500/30',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    emoji: '☮️',
    title: 'No Fear-Mongering',
    desc: 'We strictly forbid regressive, fear-inducing predictions. Our astrologers view a birth chart not as a fixed script of doom, but as a cosmic roadmap filled with potential and possibility.',
    color: 'from-emerald-600/20 to-emerald-400/5',
    border: 'border-emerald-500/30',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    emoji: '🔬',
    title: 'Scientific Remedial Measures',
    desc: 'Our remedies are practical, energetic, and lifestyle-oriented — combining psychological grounding, gemstone science, sound frequencies (Mantras), and spatial alignment (Vastu).',
    color: 'from-blue-600/20 to-blue-400/5',
    border: 'border-blue-500/30',
  },
];

// ── Expertise areas ───────────────────────────────────────────────────────────
const EXPERTISE = [
  {
    icon: '🪐',
    title: 'Traditional Vedic & KP Astrology',
    approach: 'Pinpoint timing of events using exact planetary degrees.',
    result: 'Clarity on Career, Finance & Relationships',
    color: 'border-gold-500/30',
  },
  {
    icon: '🔢',
    title: 'Advanced Numerology',
    approach: 'Harmonizing your name and birth frequencies with cosmic vibrations.',
    result: 'Enhanced personal branding and luck alignment',
    color: 'border-violet-500/30',
  },
  {
    icon: '🏠',
    title: 'Scientific Vastu Shastra',
    approach: 'Aligning living and digital workspaces with elemental energies.',
    result: 'Accelerated growth, peace, and abundance',
    color: 'border-emerald-500/30',
  },
];

// ── Promises ──────────────────────────────────────────────────────────────────
const PROMISES = [
  {
    icon: <Shield className="w-7 h-7 text-gold-400" />,
    emoji: '🔐',
    title: 'Absolute Confidentiality',
    desc: 'Your birth data and life challenges are treated with the highest level of data security and spiritual privacy. What you share stays sacred.',
  },
  {
    icon: <Eye className="w-7 h-7 text-violet-400" />,
    emoji: '⚖️',
    title: 'Uncompromising Integrity',
    desc: 'If a chart shows a challenging period, we present it with honesty — immediately followed by the exact cosmic tools required to navigate it.',
  },
  {
    icon: <BookOpen className="w-7 h-7 text-emerald-400" />,
    emoji: '📿',
    title: 'Authentic Lineage',
    desc: 'Every consultant on AstroVyoma is strictly vetted for credentialing, ethical standards, and predictive accuracy. No shortcuts, no imposters.',
  },
];

// ── Fade-in variant ───────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

// ─────────────────────────────────────────────────────────────────────────────
export default function AboutUsPage() {
  return (
    <div className="relative min-h-screen bg-cosmic-950 overflow-x-hidden">
      <SwastikBorder />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 lg:px-16 overflow-hidden">
        <MiniStars />

        {/* Floating glyphs */}
        <FloatingSymbol symbol="♈" style={{ top: '14%', left: '4%' }} />
        <FloatingSymbol symbol="♎" style={{ top: '22%', right: '5%' }} />
        <FloatingSymbol symbol="🔮" style={{ top: '55%', left: '2%' }} />
        <FloatingSymbol symbol="✦"  style={{ top: '70%', right: '3%' }} />
        <FloatingSymbol symbol="♓" style={{ bottom: '12%', left: '8%' }} />
        <FloatingSymbol symbol="🪐" style={{ top: '35%', right: '8%' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.p {...fadeUp(0)} className="text-gold-500/60 text-xs tracking-[0.25em] uppercase mb-4">
            ✦ Our Story
          </motion.p>

          <motion.h1 {...fadeUp(0.08)}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-gold-400 leading-tight mb-6"
            style={{ textShadow: '0 0 60px rgba(201,168,76,0.35)' }}>
            Where Cosmic Wisdom<br />
            <span className="text-white/90">Meets Digital Precision</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            India's premier digital sanctuary for authentic Vedic science, cosmic counseling, and astrological foresight — built by the finest astrological minds of the current era.
          </motion.p>

          {/* CTA row */}
          <motion.div {...fadeUp(0.22)} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/kundali" className="btn-gold px-8 py-3 text-sm font-semibold">
              Get Your Free Kundali →
            </Link>
            <Link to="/astrologers" className="btn-outline-gold px-8 py-3 text-sm">
              Meet Our Experts
            </Link>
          </motion.div>

          {/* Rotating zodiac wheel */}
          <motion.div {...fadeUp(0.3)} className="mt-14 flex justify-center">
            <div className="relative">
              <ZodiacWheel size={260} className="animate-spin-slow opacity-70" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-serif text-gold-400 text-5xl animate-pulse-gold">✦</div>
                  <div className="font-serif text-gold-400/60 text-xs mt-2 tracking-widest">AstroVyoma</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="relative z-10 py-10 px-4 md:px-8"
        style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.10) 50%, rgba(201,168,76,0.04) 100%)', borderTop: '1px solid rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.08)} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-serif text-gold-400 text-2xl md:text-3xl font-bold">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Genesis ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* Left: text */}
            <div>
              <motion.p {...fadeUp(0)} className="text-gold-500/60 text-xs tracking-[0.2em] uppercase mb-3">
                ✦ The Genesis
              </motion.p>
              <motion.h2 {...fadeUp(0.06)} className="font-serif text-3xl md:text-4xl text-gold-400 mb-6 leading-tight">
                The Genesis of a<br />Cosmic Revolution
              </motion.h2>
              <motion.p {...fadeUp(0.12)} className="text-gray-300 leading-relaxed mb-5">
                For centuries, the truest secrets of the cosmos were guarded in sacred lineages or lost in the noise of commercial, unverified predictions. AstroVyoma was born out of a collective realization among India's top astrological minds: <span className="text-gold-400 font-medium">the modern world deserves clarity, not superstition.</span>
              </motion.p>
              <motion.p {...fadeUp(0.18)} className="text-gray-400 leading-relaxed text-sm">
                We realized that while technology can connect people, only genuine, deeply researched spiritual insight can guide them. By blending rigorous astronomical calculation with intuitive Vedic mastery, our founders built a bridge between the ancient Rishis and the 21st-century seeker.
              </motion.p>

              <motion.div {...fadeUp(0.24)} className="mt-8 border border-gold-600/20 rounded-2xl p-5 bg-gold-500/5">
                <p className="text-gold-400 text-sm font-medium mb-2">🌟 Our Mission</p>
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "To demystify ancient stellar wisdom and deliver it with absolute mathematical precision to the modern world."
                </p>
              </motion.div>
            </div>

            {/* Right: decorative card */}
            <motion.div {...fadeUp(0.1)} className="relative">
              <div className="card-cosmic p-8 text-center relative overflow-hidden">
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="text-6xl mb-4">🌌</div>
                  <h3 className="font-serif text-gold-400 text-2xl mb-3">A Collaborative Dream</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    For the first time in digital history, the stalwarts of Vedic Astrology, KP System, Numerology, Lal Kitab, and Vastu Shastra have united under one cosmic canopy.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Vedic Astrology','KP System','Numerology','Lal Kitab','Vastu Shastra'].map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-16"><div className="max-w-6xl mx-auto"><Divider /></div></div>

      {/* ── Pillars ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-gold-500/60 text-xs tracking-[0.2em] uppercase mb-3">✦ Our Foundation</p>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-400 mb-4">
              The AstroVyoma Pillars
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Why our guild is unrivaled — when you step into the universe of AstroVyoma, you are not just getting a reading, you are consulting a powerhouse of cosmic knowledge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map((p, i) => (
              <motion.div key={p.title} {...fadeUp(i * 0.1)}
                whileHover={{ y: -4, boxShadow: '0 0 30px rgba(201,168,76,0.12)' }}
                className={`relative p-7 rounded-2xl border ${p.border} bg-gradient-to-br ${p.color} backdrop-blur-sm transition-all duration-300`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0 mt-1">{p.emoji}</div>
                  <div>
                    <h3 className="font-serif text-gold-400 text-lg mb-3">{p.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-16"><div className="max-w-6xl mx-auto"><Divider /></div></div>

      {/* ── Expertise ───────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-gold-500/60 text-xs tracking-[0.2em] uppercase mb-3">✦ Our Mastery</p>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-400 mb-4">
              Meet the Architects<br />of Your Destiny
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Our core panel represents the gold standard of contemporary Indian astrology — each domain mastered with decades of practice and scholarship.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {EXPERTISE.map((e, i) => (
              <motion.div key={e.title} {...fadeUp(i * 0.12)}
                whileHover={{ y: -5, boxShadow: '0 0 35px rgba(201,168,76,0.14)' }}
                className={`card-cosmic p-7 border ${e.color} text-center transition-all duration-300`}>
                <div className="text-5xl mb-4">{e.icon}</div>
                <h3 className="font-serif text-gold-400 text-base mb-4 leading-snug">{e.title}</h3>

                <div className="space-y-3 text-left">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-gold-500/70 text-[10px] uppercase tracking-wider mb-1">Our Approach</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{e.approach}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-gold-500/70 text-[10px] uppercase tracking-wider mb-1">The Result</p>
                    <p className="text-gray-200 text-xs font-medium">{e.result}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-16"><div className="max-w-6xl mx-auto"><Divider /></div></div>

      {/* ── Sacred Quote ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 md:px-8">
        <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto text-center">
          <div className="relative card-cosmic p-10 md:p-14 overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.10) 0%, transparent 65%)' }} />
            <div className="relative z-10">
              <div className="text-gold-400/40 font-serif text-8xl leading-none mb-2 -mt-4">"</div>
              <p className="font-serif text-xl md:text-3xl text-white/90 leading-relaxed mb-6 -mt-6">
                The stars that govern the universe also reside within you. We do not predict your future; we empower you to <span className="text-gold-400">co-create it with the cosmos.</span>
              </p>
              <div className="text-gold-500/60 text-sm tracking-widest">✦ The AstroVyoma Promise ✦</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Three Promises ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-8 pb-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-gold-500/60 text-xs tracking-[0.2em] uppercase mb-3">✦ Our Commitment</p>
            <h2 className="font-serif text-3xl md:text-5xl text-gold-400 mb-4">
              Our Sacred Promise to You
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              We understand that seeking astrological guidance requires immense trust. We honor your journey with three unshakeable promises.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROMISES.map((p, i) => (
              <motion.div key={p.title} {...fadeUp(i * 0.12)}
                whileHover={{ y: -5 }}
                className="card-cosmic p-8 text-center transition-all duration-300">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <div className="flex justify-center mb-4">{p.icon}</div>
                <h3 className="font-serif text-gold-400 text-lg mb-4">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 md:px-8"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(18,9,58,0.6), transparent)' }}>
        <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto text-center">
          <p className="text-gold-500/60 text-xs tracking-[0.2em] uppercase mb-4">✦ Begin Your Journey</p>
          <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
            Your Journey Beyond<br />the Stars <span className="text-gold-400">Begins Here</span>
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-4 max-w-xl mx-auto">
            You didn't arrive at AstroVyoma by accident. In the language of the cosmos, synchronization is everything.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you are standing at a crossroads in your career, searching for your soul's counterpart, or seeking profound inner peace — the finest minds of the current era are waiting to map your path.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/kundali" className="btn-gold px-10 py-3.5 text-sm font-semibold shadow-[0_0_30px_rgba(201,168,76,0.3)]">
              🪐 Get My Free Kundali
            </Link>
            <Link to="/astrologers" className="btn-outline-gold px-10 py-3.5 text-sm">
              👁 Talk to an Astrologer
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-center">
            {[
              { icon: '🔒', label: 'Data Secure' },
              { icon: '🕉️', label: 'Vedic Authentic' },
              { icon: '🤖', label: 'AI Enhanced' },
              { icon: '⚡', label: 'Instant Results' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 text-gray-400 text-xs">
                <span className="text-base">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Mini footer padding ──────────────────────────────────────────── */}
      <div className="pb-16" />
    </div>
  );
}
