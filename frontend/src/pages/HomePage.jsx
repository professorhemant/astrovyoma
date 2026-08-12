import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, ChevronRight, Sparkles } from 'lucide-react';
import ZodiacWheel from '../components/ZodiacWheel';
import AstrologerCard from '../components/AstrologerCard';
import TarotSection from '../components/TarotSection';
import VedicClock from '../components/VedicClock';
import { astrologers as astrologersApi, horoscope as horoscopeApi, kundali as kundaliApi, content as contentApi } from '../api';
import { useAuth } from '../context/AuthContext';
import VisualEditor from '../components/editor/VisualEditor';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const ZODIAC_SYMBOLS = { Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓' };

const FREE_FEATURES = [
  { icon: '🪐', title: 'Free Kundali', desc: 'Complete birth chart with planetary positions', link: '/kundali' },
  { icon: '⭐', title: 'Daily Horoscope', desc: 'Personalized cosmic guidance every day', link: '/horoscope' },
  { icon: '💫', title: 'Kundali Matching', desc: 'Find your soulmate compatibility', link: '/matching' },
  { icon: '🔮', title: 'Nakshatra Reading', desc: 'Discover your birth star secrets', link: '/nakshatra' },
  { icon: '🌙', title: 'Dasha Timeline', desc: 'Your life periods mapped to the stars', link: '/dasha' },
  { icon: '🧮', title: 'Panchang', desc: 'Auspicious timings for every occasion', link: '/panchang' },
];

const TESTIMONIALS = [
  { heading: 'Calculated, not guessed', text: 'Charts are computed with the Swiss Ephemeris using the Lahiri ayanamsha and Whole Sign houses — the same standard professional astrologers work to.' },
  { heading: 'Free where it matters', text: 'Your full birth chart, planetary positions, dashas and nakshatra reading cost nothing, and no card is asked for.' },
  { heading: 'You decide what you spend', text: 'Consultations are charged by the minute from your wallet, only while you are talking, and you can stop at any moment.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter Your Birth Details', desc: 'Name, date, time and place of birth. Auto-detects your location for quick fill.' },
  { step: '02', title: 'Get Your Free Kundali', desc: 'Swiss Ephemeris precision calculates your complete birth chart in seconds.' },
  { step: '03', title: 'Talk to Your Astrologer', desc: 'Matched to your exact concern — love, career, health, or spiritual guidance.' },
];


// ── Nebula + Starfield backgrounds ────────────────────────────────────────────

function NebulaBg() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: '#12093A' }} />
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 10% 20%, rgba(120,40,220,0.55) 0%, transparent 45%),
          radial-gradient(ellipse at 90% 12%, rgba(50,90,255,0.4)  0%, transparent 42%),
          radial-gradient(ellipse at 55% 65%, rgba(100,20,190,0.35) 0%, transparent 48%),
          radial-gradient(ellipse at 80% 88%, rgba(0,170,170,0.18)  0%, transparent 36%),
          radial-gradient(ellipse at 15% 82%, rgba(150,50,230,0.3)  0%, transparent 44%),
          radial-gradient(ellipse at 45% 40%, rgba(80,0,160,0.2)    0%, transparent 55%)
        `
      }} />
    </div>
  );
}

function StarField() {
  const stars = useMemo(() => Array.from({ length: 140 }, (_, i) => ({
    id: i,
    x: (i * 7.3 + 11.7) % 100,
    y: (i * 13.1 + 5.3) % 100,
    size: ((i * 3.7) % 2.2) + 0.4,
    delay: (i * 0.31) % 7,
    duration: 1.8 + (i * 0.17) % 4,
    opacity: 0.3 + (i * 0.07) % 0.7,
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            opacity: s.opacity,
            background: s.size > 2
              ? 'radial-gradient(circle, #E8C547 0%, rgba(255,255,255,0.7) 40%, transparent 100%)'
              : 'rgba(255,255,255,0.85)',
          }}
        />
      ))}
    </div>
  );
}



// ── Small reusables ───────────────────────────────────────────────────────────

function FloatingSymbol({ symbol, style }) {
  return (
    <motion.div
      animate={{ y: [0,-15,0], opacity: [0.25,0.65,0.25] }}
      transition={{ duration: 4+Math.random()*3, repeat: Infinity, ease: 'easeInOut', delay: Math.random()*2 }}
      className="absolute text-gold-400 pointer-events-none select-none"
      style={{ fontSize: '1.5rem', textShadow: '0 0 12px rgba(201,168,76,0.5)', ...style }}>
      {symbol}
    </motion.div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2 relative z-10">
      <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3))' }} />
      <span className="text-gold-600 text-xs">✦</span>
      <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.3))' }} />
    </div>
  );
}

// The mandala and clock now take their position from Settings -> Homepage
// Layout. 15% was the constant they both used before that.
// The banner is 3168x1344 (2.36:1) and carries its headline painted into the
// artwork. A tall box on a narrow screen makes object-fit:cover throw away the
// sides — at 77vh on a phone that is 76% of the width, which slices the
// headline in half. Keep the box short until there is room to be cinematic.
// Laptop and desktop go full-screen: at 2560x1440 and 1512x860 cover trims ~26%
// off the sides and the sage, mandala, globe and clock all stay in frame. Below
// xl the hero keeps its letterboxed height — narrower than that the floating CTA
// pill runs into the Vedic clock at 15% and its labels wrap. Phones keep the
// short box for the reason above.
const heroBannerClass = 'w-full block object-cover object-center h-80 sm:h-96 md:h-[clamp(300px,77vh,880px)] xl:h-[100svh]';

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [featuredAstrologers, setFeaturedAstrologers] = useState([]);
  const [selectedSign, setSelectedSign]   = useState(null);
  const [horoscopeText, setHoroscopeText] = useState('');
  const [userLagna, setUserLagna] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Homepage copy comes from the admin's Site Content screen. The hardcoded
  // arrays above are the fallback: if the request fails the page still renders
  // what it always did rather than showing empty sections.
  const [cms, setCms] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  useEffect(() => {
    contentApi.bundle(['testimonials', 'home_features', 'how_it_works', 'hero_ctas', 'footer_links', 'section_headings', 'purpose_cards'])
      .then(r => { setCms(r.data.lists); setSiteSettings(r.data.settings); })
      .catch(() => {});
  }, []);

  // Hero button position is admin-adjustable. Fed in as CSS variables because
  // the two layouts need different properties — margin below xl where the row
  // sits in flow, `bottom` from xl up where it floats over the artwork — and an
  // inline style cannot vary by breakpoint.
  const num = (v, fallback) => (Number.isFinite(v) ? v : fallback);
  const heroVars = {
    '--hero-btn-gap': `${num(siteSettings?.heroButtonGap, 12)}px`,
    '--hero-btn-bottom': `${num(siteSettings?.heroButtonBottom, 56)}px`,
  };
  // Defaults match where these sat before they became adjustable, so turning the
  // controls on moved nothing until someone changes a number.
  const mandalaPos = {
    left: `${num(siteSettings?.mandalaLeft, 15)}%`,
    '--mandala-top': `${num(siteSettings?.mandalaTop, 44)}%`,
    '--mandala-size': `${num(siteSettings?.mandalaSize, 288)}px`,
  };
  const clockPos = {
    left: `${num(siteSettings?.clockLeft, 15)}%`,
    bottom: `${num(siteSettings?.clockBottom, 8)}px`,
  };

  const features     = cms?.home_features?.length ? cms.home_features : FREE_FEATURES;
  const steps        = cms?.how_it_works?.length  ? cms.how_it_works  : HOW_IT_WORKS;
  const testimonials = cms?.testimonials?.length  ? cms.testimonials  : TESTIMONIALS;
  const heroCtas     = cms?.hero_ctas?.length     ? cms.hero_ctas     : null;
  const footerLinks  = cms?.footer_links?.length  ? cms.footer_links  : null;
  const purposeCards = cms?.purpose_cards?.length ? cms.purpose_cards : null;

  // Section headings are looked up by their id. An unknown id falls back to the
  // text the page shipped with, so a mistyped id loses the edit, not the heading.
  const sec = (key, fallback) => {
    const row = (cms?.section_headings || []).find(r => r.key === key);
    return { ...fallback, ...(row || {}), row_id: row?.row_id };
  };

  // Editor hooks plus the admin's spacing and alignment for a heading.
  const secProps = (key) => {
    const row = sec(key);
    return {
      'data-edit-item': row.row_id ? `section_headings:${row.row_id}` : undefined,
      'data-edit-flow': row.row_id ? 'section_headings' : undefined,
      style: {
        ...(row.align ? { textAlign: row.align } : {}),
        ...(Number.isFinite(row.spaceAbove) && row.spaceAbove ? { marginTop: `${row.spaceAbove}px` } : {}),
        ...(Number.isFinite(row.spaceBelow) && row.spaceBelow ? { marginBottom: `${row.spaceBelow}px` } : {}),
      },
    };
  };

  useEffect(() => {
    astrologersApi.getAll({ limit: 6 }).then(r => setFeaturedAstrologers(r.data.astrologers || [])).catch(() => {});
  }, []);

  // Signed-in only: the chart endpoint needs a token, and asking without one
  // just earns a 401. Keyed on user so the lagna also follows a login or logout
  // without a page reload.
  useEffect(() => {
    if (!user) { setUserLagna(null); return; }
    kundaliApi.getMyKundali().then(r => { if (r.data?.lagna) setUserLagna(r.data.lagna); }).catch(() => {});
  }, [user]);

  async function handleSignClick(sign) {
    setSelectedSign(sign);
    try {
      const r = await horoscopeApi.getDaily(sign);
      setHoroscopeText(r.data.horoscope);
    } catch {
      setHoroscopeText('The stars whisper their guidance to you today. Trust your inner wisdom and the cosmic flow of your destiny.');
    }
  }

  // Editor chrome only mounts for the admin's preview frame, never for visitors.
  // The flag alone is not enough — anyone can type ?editor=1 — so it also has to
  // be running inside a frame, which only the admin preview does. Nothing here
  // can save in any case; the admin holds the token and does the writing.
  const editorMode =
    new URLSearchParams(window.location.search).get('editor') === '1' &&
    window.parent !== window;

  return (
    <>
      {editorMode && <VisualEditor />}
      <NebulaBg />
      <StarField />

      <div className="relative min-h-screen overflow-x-hidden" style={{ zIndex: 3 }}>

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden">
          {/* Every artwork overlay below anchors to this wrapper, not to the
              section. On a phone the CTA row sits in flow underneath and makes
              the section taller than the image — a clock pinned to the section
              would then float down behind the buttons. */}
          <div className="relative">
          <motion.img
            src="/hero-banner.png"
            alt="AstroVyoma — Unveil Your Destiny, Map Your Cosmic Journey"
            className={heroBannerClass}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {/* cover the baked-in text at the top of the image */}
          <div className="absolute inset-x-0 top-0 pointer-events-none h-[55%] md:h-[32%]"
            style={{ background: 'linear-gradient(to bottom, rgba(6,4,18,0.96) 0%, rgba(6,4,18,0.75) 45%, transparent 100%)' }} />
          {/* Phone only: the painted headline sits about a fifth down the
              artwork and cover cannot crop it away vertically, so it shows
              through as a ghost of the real one. Mask that band outright.
              Desktop keeps its painted headline, so it must not inherit this. */}
          <div className="absolute inset-x-0 top-0 pointer-events-none h-[31%] md:hidden"
            style={{ background: 'linear-gradient(to bottom, rgb(6,4,18) 0%, rgb(6,4,18) 80%, transparent 100%)' }} />
          {/* The headline is painted into the artwork, sized for a 3168px-wide
              canvas — on a phone it renders about four pixels tall. Carry it as
              real text here, where it can scale and be read. */}
          <h1 className="absolute inset-x-0 top-16 md:hidden pointer-events-none px-6 pt-2 font-serif text-center leading-snug text-[19px]"
            style={{ color: '#F3D98B', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>
            Unveil Your Destiny.<br />Map Your Cosmic Journey.
          </h1>
          {/* bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #12093A)' }} />
          {/* zodiac mandala overlaid on banner — vertically centered, slightly left */}
          {/* top: the desktop offset is tuned for a ~693px hero; on a phone the
              same figure lands the wheel behind the navbar, so anchor it by
              percentage there, clear of the headline and above the clock. */}
          <div
            data-edit="mandala" data-edit-label="Zodiac wheel"
            className="absolute flex flex-col items-center justify-center pointer-events-none top-[54%] md:top-[var(--mandala-top)]"
            style={{ ...mandalaPos, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <img
              src="/zodiac-mandala.png"
              alt="Vedic Zodiac Mandala"
              className="w-24 md:w-56 lg:w-[var(--mandala-size)]"
              style={{
                animation: 'spinCW 120s linear infinite',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="hidden md:block md:text-xs md:mt-2.5"
              style={{ fontFamily: 'serif', color: '#C9A84C', letterSpacing: '0.12em', textShadow: '0 0 18px rgba(201,168,76,0.8)', textAlign: 'center' }}>
              यत्र ब्रह्माण्डे तत्र पिण्डे
            </motion.p>
          </div>

          {/* Vedic Clock — bottom-left of hero, aligned under mandala */}
          {/* VedicClock lays out at a fixed 200x228. It is absolutely positioned,
              so scaling the inner wrapper shrinks it on a phone without
              disturbing anything around it. */}
          <div data-edit="clock" data-edit-label="Vedic clock"
            className="absolute pointer-events-none"
            style={{ ...clockPos, transform: 'translateX(-50%)', zIndex: 10 }}>
            <div className="scale-[0.38] md:scale-100 origin-bottom">
              <VedicClock />
            </div>
          </div>
          </div>

          {/* ── CTA Buttons ── */}
          {/* The seven tool pills that used to sit here (Tarot, Book Pooja, Astro
              Mall, Vastu, Namkaran, Festivals, Crystals) now live under Tools ▾
              and Shop ▾ in the navbar. Only the conversion paths stay on the
              hero. In flow under the banner below xl:; from xl: up the hero
              fills the screen, so they float over the artwork instead.
              The scrim is what keeps the outline button readable — without it
              it lands on the bright marble tabletop and disappears. */}
          <div data-edit="heroButtons" data-edit-label="Hero buttons" style={heroVars}
            className="relative z-20 grid grid-cols-2 sm:flex sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch pt-3 pb-4 px-4 mt-[var(--hero-btn-gap)]
            xl:absolute xl:left-1/2 xl:-translate-x-1/2 xl:bottom-[var(--hero-btn-bottom)] xl:mt-0 xl:w-auto
            xl:px-6 xl:py-3.5 xl:rounded-full xl:border xl:border-gold-600/25 xl:backdrop-blur-md">
            <div className="hidden xl:block absolute inset-0 rounded-full pointer-events-none"
              style={{ background: 'rgba(6,4,18,0.55)', boxShadow: '0 8px 40px rgba(6,4,18,0.55)' }} />
            {/* Editable under Site Content -> Hero Buttons. An odd button out on
                a phone spans the row so the two-up grid never leaves a gap. */}
            {(heroCtas || [
              { label: 'Get Free Kundali',      to: '/kundali',     style: 'solid'   },
              { label: 'Talk to Astrologer',    to: '/astrologers', style: 'outline' },
              { label: 'Talk to AstroVyoma AI', to: '/chat',        style: 'outline' },
            ]).map((cta, i, all) => (
              <Link key={cta.id || i} to={cta.to} data-edit-item={cta.row_id && `hero_ctas:${cta.row_id}`}
                className={`relative ${cta.style === 'solid' ? 'btn-gold font-semibold' : 'btn-outline-gold font-medium'}
                  ${all.length % 2 === 1 && i === all.length - 1 ? 'col-span-2 sm:col-span-1' : ''}
                  px-3 sm:px-7 py-3 text-xs flex items-center justify-center gap-2 xl:whitespace-nowrap`}>
                {cta.style === 'solid'
                  ? <>{cta.label} <ChevronRight className="w-3.5 h-3.5" /></>
                  : <>{/AI/i.test(cta.label) && <Sparkles className="w-3.5 h-3.5" />}{cta.label}</>}
              </Link>
            ))}
          </div>

        </section>

        {/* ── AI Chatbot Preview ── */}
        <section className="py-16 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-10">
              <h2 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3"
                {...secProps('ai')}>{sec('ai', {heading:'Talk to AstroVyoma AI ✦'}).heading}</h2>
              <p className="text-gray-400 text-sm">Powered by Vedic wisdom + AI — Your birth chart as context</p>
            </motion.div>
            <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="card-cosmic p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-600/10">
                <div className="w-10 h-10 rounded-full bg-cosmic-800 border border-gold-600/40 flex items-center justify-center text-gold-400">✦</div>
                <div>
                  <div className="text-gold-400 font-medium text-sm">AstroVyoma AI</div>
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cosmic-800 border border-gold-600/30 flex items-center justify-center text-gold-400 text-xs flex-shrink-0">✦</div>
                  <div className="bg-cosmic-800/80 border border-gold-600/15 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                    <p className="text-gray-300 text-sm">Namaste 🙏 I am AstroVyoma AI, your personal Vedic astrology guide. With your birth chart as my guide, I can reveal your Nakshatra, current Dasha, life purpose, and cosmic timing. What would you like to know?</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="bg-gold-600/20 border border-gold-600/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                    <p className="text-gray-200 text-sm">What does my current Mahadasha mean for my career?</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cosmic-800 border border-gold-600/30 flex items-center justify-center text-gold-400 text-xs flex-shrink-0">✦</div>
                  <div className="bg-cosmic-800/80 border border-gold-600/15 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                    <p className="text-gray-300 text-sm">Your current Jupiter Mahadasha (Brihaspati Dasha) is a period of great expansion. Jupiter is activating your 10th house of career and public recognition...</p>
                    <p className="text-gold-500 text-xs mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Personalized with your Kundali</p>
                  </div>
                </div>
              </div>
              <Link to="/chat" className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Start Chatting Free →
              </Link>
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Free Features ── */}
        <section className="pt-2 pb-4 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="font-serif text-center text-3xl md:text-4xl text-gold-400 mb-4 -mt-3">
              ✦ Everything Free to Start
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {features.map((f,i) => (
                <Link to={f.link} key={f.id || f.title} data-edit-item={f.row_id && `home_features:${f.row_id}`}>
                  <motion.div
                    initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                    transition={{delay:i*0.1}}
                    whileHover={{y:-5,boxShadow:'0 0 30px rgba(201,168,76,0.2)',borderColor:'rgba(232,197,71,0.5)'}}
                    className="card-cosmic p-4 text-center cursor-pointer group h-full transition-all">
                    <div className="text-3xl mb-2">{f.icon}</div>
                    <h3 className="font-serif text-gold-400 text-base font-semibold mb-1 group-hover:text-gold-300">{f.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Find Your Purpose ── */}
        <section className="py-4 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="text-center mb-6">
              <p className="font-devanagari text-gold-500 text-lg mb-2">{sec('purpose', {eyebrow:'किस चीज़ के लिए बने हो?'}).eyebrow}</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4"
                {...secProps('purpose')}>{sec('purpose', {heading:'What Were You Born For?'}).heading}</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">{sec('purpose', {subheading:"Your birth chart reveals your soul's purpose, personality, and path"}).subheading}</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {(purposeCards || [
                {title:'Swabhav',      subtitle:'Your Nature',       icon:'🌟', desc:'Discover your innate personality traits, strengths, and patterns written in the stars at the moment of your birth', link:'/purpose'},
                {title:'Karma Path',   subtitle:'Your Life Purpose', icon:'☯',  desc:'Understand your dharma — the unique contribution your soul came to make in this lifetime, guided by your Nakshatra', link:'/purpose'},
                {title:'Personality',  subtitle:'Sun, Moon & Lagna', icon:'💠', desc:'Your Sun, Moon, and Ascendant form a cosmic trinity. Uncover the layers of who you truly are', link:'/kundali'},
              ]).map((card,i) => (
                <motion.div key={card.id || card.title} data-edit-item={card.row_id && `purpose_cards:${card.row_id}`}
                  initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{delay:i*0.15}}
                  whileHover={{y:-6,boxShadow:'0 0 40px rgba(201,168,76,0.2)'}}
                  className="card-cosmic p-5 group cursor-pointer transition-all"
                  onClick={() => navigate(card.link)}>
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className="text-xs text-gold-600 uppercase tracking-widest mb-1">{card.subtitle}</div>
                  <h3 className="font-serif text-xl text-gold-400 mb-2 group-hover:text-gold-300">{card.title}</h3>
                  <p className="text-gray-300 text-xs leading-relaxed mb-3">{card.desc}</p>
                  <Link to={card.link} className="text-gold-500 text-xs flex items-center gap-1 hover:text-gold-400">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── How It Works ── */}
        <section className="py-16 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="font-serif text-center text-4xl md:text-5xl text-gold-400 mb-16"
              {...secProps('howitworks')}>
              {sec('howitworks', {heading:'How It Works'}).heading}
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step,i) => (
                <motion.div key={step.id || step.step} data-edit-item={step.row_id && `how_it_works:${step.row_id}`}
                  initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{delay:i*0.2}} className="text-center">
                  <motion.div whileHover={{scale:1.1,boxShadow:'0 0 30px rgba(201,168,76,0.35)'}}
                    className="w-16 h-16 rounded-full border border-gold-600/40 flex items-center justify-center mx-auto mb-4 bg-cosmic-800/60 transition-all">
                    <span className="font-serif text-gold-400 text-2xl font-bold">{step.step}</span>
                  </motion.div>
                  <h3 className="font-serif text-xl text-gold-400 mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/kundali" className="btn-gold px-10 py-4 text-base inline-flex items-center gap-2">
                Start Your Journey ✦
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* The video section that sat here moved to components/VideoShowcase.jsx —
            6 MB every visitor paid for before asking. Drop it on any page with
            <VideoShowcase />. */}

        {/* ── Live Astrologers ── */}
        <section className="py-16 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3"
                {...secProps('connect')}>{sec('connect', {heading:'✦ Connect with Your Cosmic Guide'}).heading}</h2>
              <p className="text-gray-300">Expert Vedic astrologers, available now</p>
            </motion.div>
            {featuredAstrologers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {featuredAstrologers.map((a,i) => (
                  <motion.div key={a.id}
                    initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                    transition={{delay:i*0.1}}>
                    <AstrologerCard astrologer={a} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">Loading astrologers...</div>
            )}
            <div className="text-center">
              <Link to="/astrologers" className="btn-outline-gold px-8 py-3 text-sm inline-flex items-center gap-2">
                View All Astrologers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Tarot Section ── */}
        <TarotSection userLagna={userLagna} />

        <SectionDivider />

        {/* ── Who We Are ── */}
        <section className="py-16 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="flex justify-center">
                <div className="relative">
                  <ZodiacWheel size={360} className="animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-serif text-gold-400 text-4xl animate-pulse-gold">✦</div>
                      <div className="font-serif text-gold-400 text-sm mt-2 opacity-70">AstroVyoma</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="space-y-6">
                <h2 className="font-serif text-4xl text-gold-400 leading-tight"
                  {...secProps('about')}>{sec('about', {heading:'Where Ancient Stars Meet Modern Lives'}).heading}</h2>
                <p className="text-gray-300 leading-relaxed">AstroVyoma bridges 5,000 years of Vedic wisdom with the modern seeker's journey. Your birth chart is a cosmic map of your soul's unique potential.</p>
                <p className="text-gray-400 leading-relaxed text-sm">Our platform unites India's most respected Jyotishis with cutting-edge AI to provide guidance that is authentically ancient and practically modern.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[{icon:'🔮',label:'Vedic Precision'},{icon:'👁',label:'Verified Experts'},{icon:'🤖',label:'AI Enhanced'}].map(item => (
                    <div key={item.label} className="card-cosmic p-4 text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-gold-400 text-xs font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="border border-gold-600/20 rounded-xl p-4 bg-cosmic-800/30">
                  <p className="text-gold-400 text-sm font-medium mb-1">Our Commitment</p>
                  <p className="text-gray-400 text-xs">Every reading grounded in authentic Jyotish tradition — no shortcuts, no generic predictions. Your stars deserve better.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Daily Horoscope ── */}
        <section id="horoscope-strip" className="py-16 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="font-serif text-center text-3xl md:text-4xl text-gold-400 mb-8"
              {...secProps('horoscope')}>
              {sec('horoscope', {heading:"Today's Cosmic Guidance"}).heading}
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {ZODIAC_SIGNS.map(sign => (
                <button key={sign} onClick={() => handleSignClick(sign)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
                    selectedSign === sign ? 'bg-gold-600 text-cosmic-950 font-semibold shadow-[0_0_20px_rgba(201,168,76,0.4)]' : 'btn-outline-gold'
                  }`}>
                  <span>{ZODIAC_SYMBOLS[sign]}</span>
                  <span>{sign}</span>
                </button>
              ))}
            </div>
            <AnimatePresence>
              {selectedSign && horoscopeText && (
                <motion.div key={selectedSign}
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
                  className="card-cosmic p-6 max-w-3xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{ZODIAC_SYMBOLS[selectedSign]}</span>
                    <div>
                      <h3 className="font-serif text-gold-400 text-xl">{selectedSign}</h3>
                      <p className="text-gray-400 text-xs">Today's horoscope</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{horoscopeText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <SectionDivider />

        {/* ── Testimonials ── */}
        <section className="py-16 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="font-serif text-center text-4xl text-gold-400 mb-12"
              {...secProps('testimonials')}>
              {sec('testimonials', {heading:'Why AstroVyoma'}).heading}
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t,i) => (
                <motion.div key={t.id || t.name} data-edit-item={t.row_id && `testimonials:${t.row_id}`}
                  initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{delay:i*0.15}}
                  whileHover={{y:-4,boxShadow:'0 0 30px rgba(201,168,76,0.15)'}}
                  className="card-cosmic p-6 transition-all">
                  {/* Stars, quote marks and a face are what make a card read as
                      somebody's testimony. They appear only when a real person
                      is named — otherwise the card is plainly a statement about
                      the service, which is what it is. */}
                  {t.name ? (
                    <>
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({length:5}).map((_,j) => <Star key={j} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border border-gold-600/30" />
                        <div>
                          <div className="text-gold-400 text-sm font-medium">{t.name}</div>
                          <div className="text-gray-400 text-xs">{t.location}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {t.heading && (
                        <h3 className="text-gold-400 font-medium text-sm mb-3">{t.heading}</h3>
                      )}
                      <p className="text-gray-300 text-sm leading-relaxed">{t.text}</p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-10 border-t border-gold-600/10 py-14 px-4 md:px-8 lg:px-16 mt-4"
          style={{background:'linear-gradient(to top, rgba(18,9,58,0.96), transparent)'}}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gold-400 text-xl">✦</span>
                  <span className="font-serif text-gold-400 text-xl">AstroVyoma</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">Ancient Wisdom, Modern Guidance. Your cosmic journey starts here.</p>
              </div>
              <div>
                <h4 className="text-gold-400 text-sm font-medium mb-3">Platform</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {/* Editable under Site Content -> Footer Links. */}
                  {(footerLinks || [
                    { label: 'Kundali',              to: '/kundali' },
                    { label: 'Find Purpose',         to: '/purpose' },
                    { label: 'Astrologers',          to: '/astrologers' },
                    { label: 'Talk to AstroVyoma AI', to: '/chat' },
                    { label: 'Blog',                 to: '/blog' },
                    { label: 'About Us',             to: '/about' },
                    { label: 'Join As Astrologer',   to: '/join-as-astrologer' },
                  ]).map((l, i) => (
                    <li key={l.id || i} data-edit-item={l.row_id && `footer_links:${l.row_id}`}><Link to={l.to} className="hover:text-gold-400 transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-gold-400 text-sm font-medium mb-3">Zodiac Signs</h4>
                <ul className="grid grid-cols-2 gap-1 text-gray-400 text-xs">
                  {ZODIAC_SIGNS.slice(0,8).map(sign => (
                    <li key={sign}><button onClick={() => handleSignClick(sign)} className="hover:text-gold-400 transition-colors">{sign}</button></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-gold-400 text-sm font-medium mb-3">More Signs</h4>
                <ul className="space-y-1 text-gray-400 text-xs">
                  {ZODIAC_SIGNS.slice(8).map(sign => (
                    <li key={sign}><button onClick={() => handleSignClick(sign)} className="hover:text-gold-400 transition-colors">{sign}</button></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-gold-600/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2025 AstroVyoma. All rights reserved.</p>
              <p className="font-serif text-gold-600 text-sm">✦ Ancient Wisdom, Modern Guidance</p>
              <div className="flex gap-4 text-gray-400 text-xs">
                <Link to="/about" className="hover:text-gold-400 transition-colors">About Us</Link>
                <span className="text-gold-600/30">·</span>
                <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy</Link>
                <span className="text-gold-600/30">·</span>
                <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
