import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, Sparkles, Compass, ShieldCheck, BrainCircuit } from 'lucide-react';
import ZodiacWheel from '../components/ZodiacWheel';
import HeroMarquee from '../components/HeroMarquee';
import TarotSection from '../components/TarotSection';
import { horoscope as horoscopeApi, kundali as kundaliApi, content as contentApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSeoMeta } from '../hooks/useSeoMeta';
import VisualEditor from '../components/editor/VisualEditor';
import { useLanguage } from '../context/LanguageContext';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const ZODIAC_SYMBOLS = { Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓' };

const FREE_FEATURES = [
  { icon: '♄', title: 'Free Kundali', desc: 'Complete birth chart with planetary positions', link: '/kundali' },
  { icon: '☉', title: 'Daily Horoscope', desc: 'Personalized cosmic guidance every day', link: '/horoscope' },
  { icon: '♀', title: 'Kundali Matching', desc: 'Find your soulmate compatibility', link: '/matching' },
  { icon: '✦', title: 'Nakshatra Reading', desc: 'Discover your birth star secrets', link: '/nakshatra' },
  { icon: '☽', title: 'Dasha Timeline', desc: 'Your life periods mapped to the stars', link: '/dasha' },
  { icon: '☿', title: 'Panchang', desc: 'Auspicious timings for every occasion', link: '/panchang' },
];

const TESTIMONIALS = [
  { icon: '☉', heading: 'Calculated, not guessed', text: 'Charts are computed with the Swiss Ephemeris using the Lahiri ayanamsha and Whole Sign houses — the same standard professional astrologers work to.' },
  { icon: '✦', heading: 'Free where it matters', text: 'Your full birth chart, planetary positions, dashas and nakshatra reading cost nothing, and no card is asked for.' },
  { icon: '☽', heading: 'You decide what you spend', text: 'Consultations are charged by the minute from your wallet, only while you are talking, and you can stop at any moment.' },
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
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
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
const heroBannerClass = 'w-full block object-cover object-[80%_50%] h-80 sm:h-96 md:h-[clamp(300px,77vh,880px)] xl:h-[100svh]';

function EarningCalc() {
  const [rate, setRate]     = React.useState(50);
  const [mins, setMins]     = React.useState(40);
  const share = 0.60;
  const weekly  = Math.round(rate * mins * 7 * share);
  const monthly = Math.round(rate * mins * 30 * share);
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between text-xs mb-2 text-gray-400">
          <span>Your rate</span>
          <span className="text-gold-400 font-semibold">₹{rate}/min</span>
        </div>
        <input type="range" min={10} max={150} step={5} value={rate}
          onChange={e => setRate(Number(e.target.value))}
          className="w-full accent-yellow-500 cursor-pointer" />
        <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>₹10</span><span>₹150</span></div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-2 text-gray-400">
          <span>Active minutes/day</span>
          <span className="text-purple-300 font-semibold">{mins} min</span>
        </div>
        <input type="range" min={10} max={240} step={10} value={mins}
          onChange={e => setMins(Number(e.target.value))}
          className="w-full accent-purple-500 cursor-pointer" />
        <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>10 min</span><span>4 hrs</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gold-500/10 border border-gold-500/30 p-4 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Weekly</p>
          <p className="font-serif text-gold-400 text-2xl">₹{weekly.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 p-4 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Monthly</p>
          <p className="font-serif text-purple-300 text-2xl">₹{monthly.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <p className="text-[10px] text-gray-600 text-center">Based on 60% astrologer share · ₹{rate}/min · {mins} min/day</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  useSeoMeta({
    title:       'AstroVyoma — Vedic Astrology Platform',
    description: 'Free Kundali, daily horoscopes, expert Vedic astrologers & AI-powered cosmic guidance. India\'s sacred astrology platform.',
    ogUrl:       'https://astrovyoma.com/',
  });

  const [selectedSign, setSelectedSign]   = useState(null);
  const [horoscopeText, setHoroscopeText] = useState('');
  const { lang } = useLanguage();
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
  }, [lang]);

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
        ...(Number.isFinite(row.spaceAbove) && row.spaceAbove > 0 ? { marginTop: `${row.spaceAbove}px` } : {}),
        ...(Number.isFinite(row.spaceBelow) && row.spaceBelow > 0 ? { marginBottom: `${row.spaceBelow}px` } : {}),
      },
    };
  };


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
            src="/hero-banner.webp"
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
          {/* Headline and tagline in one block, stacked in normal flow.
              Positioning the tagline separately meant guessing where the
              headline ended, and the guess was wrong the moment the headline
              wrapped differently — it printed straight over "Map Your Cosmic
              Journey". One container, two children, no arithmetic. */}
          <div className="absolute inset-x-0 top-16 md:hidden pointer-events-none px-6 pt-2 text-center z-20">
            <h1 className="font-serif leading-snug text-[19px]"
              style={{ color: '#F3D98B', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>
              Unveil Your Destiny.<br />Map Your Cosmic Journey.
            </h1>
            {/* The tagline streams out of the rishi's palm from tablet up — see
                HeroMarquee — but that band is only about 240px wide at 390px and
                crosses the busiest part of the painting. Same words, same admin
                field, shown here as a line a phone can actually read. */}
            {siteSettings?.heroMarqueeText?.trim() && (
              <p className="mt-1.5 mx-auto max-w-[19rem] leading-snug text-[11px]"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E8C547',
                         letterSpacing: '0.05em', textShadow: '0 2px 12px rgba(0,0,0,0.95)' }}>
                {siteSettings.heroMarqueeText}
              </p>
            )}
          </div>
          {/* bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #12093A)' }} />
          {/* Tagline streaming out of the rishi's open right palm. Positions
              itself against the artwork rather than the window — see the
              component for why that distinction matters here. */}
          <HeroMarquee
            text={siteSettings?.heroMarqueeText ?? ''}
            left={num(siteSettings?.heroMarqueeLeft, 63)}
            top={num(siteSettings?.heroMarqueeTop, 59)}
            width={num(siteSettings?.heroMarqueeWidth, 32)}
            speed={num(siteSettings?.heroMarqueeSpeed, 26)}
            size={num(siteSettings?.heroMarqueeSize, 17)}
          />
          {/* zodiac mandala — center-left of hero, original position. Headline is
              z-20 so it always renders above this on mobile. Desktop uses the
              admin-set CSS variable for top; size matches the Vedic Clock (200px). */}
          <div
            data-edit="mandala" data-edit-label="Zodiac wheel"
            className="absolute flex flex-col items-center justify-center pointer-events-none top-[38%] md:top-[var(--mandala-top)]"
            style={{ ...mandalaPos, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <img
              src="/zodiac-mandala.webp"
              alt="Vedic Zodiac Mandala"
              className="w-20 md:w-[200px]"
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

          {/* Book Your Paath — anchored to the bottom of the hero inner div */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 py-4"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(8,5,22,0.92) 40%)' }}>
            <Link
              to="/book-pooja"
              className="px-10 py-3 rounded-full font-bold text-base text-[#1a0a00] whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c96a)', boxShadow: '0 4px 24px rgba(201,168,76,0.5)' }}
            >
              Book Your Paath ›
            </Link>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-xs">
              <span><span className="text-green-400 mr-1">✓</span><span className="text-gray-200">Experienced Vedic Pandits</span></span>
              <span><span className="text-gold-400 mr-1">◆</span><span className="text-gray-200">Video Clip on WhatsApp</span></span>
              <span><span className="text-blue-300 mr-1">ॐ</span><span className="text-gray-200">Sankalp in Your Name &amp; Gotra</span></span>
              <span><span className="text-sky-300 mr-1">✦</span><span className="text-gray-200">Performed at Sacred Temple</span></span>
            </div>
          </div>

          </div>

        </section>


        {/* ── Book Pooja ── */}
        <section className="py-16 px-4 md:px-8 lg:px-16 relative z-10 overflow-hidden">
          {/* Sacred amber glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(180,80,10,0.22) 0%, rgba(120,40,5,0.10) 45%, transparent 75%)'
          }} />
          <div className="max-w-7xl mx-auto relative">


            {/* Header */}
            <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-3">✦ Divine Paath Seva</p>
              <p className="font-devanagari text-amber-400/80 text-lg mb-3 tracking-wide">ॐ नमः शिवाय · हर हर महादेव</p>
              <h2 className="font-serif text-4xl md:text-6xl text-gold-400 mb-5 leading-tight"
                style={{ textShadow:'0 0 50px rgba(201,168,76,0.4), 0 2px 20px rgba(0,0,0,0.8)' }}>
                When Your Prayers Need Sacred Hands
              </h2>
              <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Can't reach the temple? Our experienced Pandit Ji performs your sacred paath with full Vedic rituals —
                <span className="text-gold-400 font-medium"> sankalp in your name</span> — video clip of sankalp in your name on WhatsApp.
              </p>
            </motion.div>

            {/* Pooja cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon:'🪔', name:'Satyanarayan Katha', desc:'Prosperity, family harmony & divine grace', border:'border-amber-500/30',  glow:'rgba(200,120,0,0.18)'   },
                { icon:'📿', name:'Sunderkand Paath',   desc:'Remove obstacles, receive Lord Hanuman blessings', border:'border-orange-500/30', glow:'rgba(220,90,10,0.15)'   },
                { icon:'🌙', name:'Maha Mrityunjaya',   desc:'Healing, longevity & protection from illness',      border:'border-blue-400/30',   glow:'rgba(60,100,220,0.15)'  },
                { icon:'⭐', name:'Navgraha Shanti',    desc:'Pacify malefic planets — peace & good fortune',     border:'border-purple-400/30', glow:'rgba(140,60,200,0.15)'  },
              ].map((p, i) => (
                <motion.div key={p.name}
                  initial={{opacity:0, y:16}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i * 0.09}}
                  className={`relative rounded-2xl border ${p.border} p-5 text-center group hover:scale-[1.03] transition-transform duration-300 cursor-default`}
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.glow} 0%, rgba(10,6,30,0.85) 70%)` }}>
                  <div className="text-4xl mb-3 drop-shadow-lg">{p.icon}</div>
                  <p className="text-gold-300 font-semibold text-sm mb-1.5 leading-snug">{p.name}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Slogans strip */}
            <div className="grid md:grid-cols-3 gap-4 mb-10 text-center">
              {[
                { heading:'"दूरी कोई बाधा नहीं"',   sub:'Distance is no barrier to devotion. Your faith reaches the divine.',       icon:'🙏' },
                { heading:'"आपका संकल्प, हमारी सेवा"', sub:'Your intention, our sacred service. We perform with complete dedication.', icon:'◈' },
                { heading:'"पूजा का प्रमाण, आपके हाथ"', sub:'Video clip of sankalp in your name delivered directly to your WhatsApp.', icon:'📱' },
              ].map((s, i) => (
                <motion.div key={s.heading}
                  initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i * 0.1}}
                  className="bg-cosmic-800/40 border border-white/8 rounded-2xl px-6 py-5">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="font-devanagari text-gold-400 text-base font-semibold mb-1.5">{s.heading}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.sub}</p>
                </motion.div>
              ))}
            </div>


          </div>
        </section>

        <SectionDivider />

        {/* The AI chat preview that sat here moved to components/AiChatPreview.jsx.
            The real chat is a page of its own at /chat, reached from the navbar,
            the floating button and the dashboard. Drop the band back on any page
            with <AiChatPreview />. */}

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
                {title:'Swabhav',      subtitle:'Your Nature',       icon:'✦', desc:'Discover your innate personality traits, strengths, and patterns written in the stars at the moment of your birth', link:'/purpose'},
                {title:'Karma Path',   subtitle:'Your Life Purpose', icon:'☯',  desc:'Understand your dharma — the unique contribution your soul came to make in this lifetime, guided by your Nakshatra', link:'/purpose'},
                {title:'Personality',  subtitle:'Sun, Moon & Lagna', icon:'◈', desc:'Your Sun, Moon, and Ascendant form a cosmic trinity. Uncover the layers of who you truly are', link:'/kundali'},
              ]).map((card,i) => (
                <motion.div key={card.row_id || card.id || card.title || i} data-edit-item={card.row_id && `purpose_cards:${card.row_id}`}
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
                <motion.div key={step.row_id || step.id || step.step || i} data-edit-item={step.row_id && `how_it_works:${step.row_id}`}
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

        {/* The astrologer band that sat here moved to components/FeaturedAstrologers.jsx.
            Astrologers are still reached from the menu and /astrologers. Drop the band
            on any page with <FeaturedAstrologers />. */}

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
                  {[
                    {Icon: Compass,      label:'Vedic Precision'},
                    {Icon: ShieldCheck,  label:'Verified Experts'},
                    {Icon: BrainCircuit, label:'AI Enhanced'},
                  ].map(item => (
                    <div key={item.label} className="card-cosmic p-4 text-center">
                      <item.Icon className="w-6 h-6 mx-auto mb-1" style={{ color: '#E8C547', filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
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
                <motion.div key={t.row_id || t.id || t.name || i} data-edit-item={t.row_id && `testimonials:${t.row_id}`}
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
                      {t.icon && (
                        <div className="text-2xl text-gold-400 mb-3 font-serif" style={{ textShadow: '0 0 16px rgba(201,168,76,0.4)' }}>{t.icon}</div>
                      )}
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

        {/* ── Earn with AstroVyoma ── */}
        <section className="py-20 px-4 md:px-8 lg:px-16 relative z-10 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl border border-gold-500/20 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(139,92,246,0.07) 100%)' }}>
              <div className="grid md:grid-cols-2 gap-0">

                {/* Left: pitch */}
                <div className="p-10 md:p-14">
                  <p className="text-xs text-gold-600 uppercase tracking-widest mb-3">For Astrologers</p>
                  <h2 className="font-serif text-3xl md:text-4xl text-gold-400 leading-tight mb-4">
                    Earn ₹30,000+<br />
                    <span className="text-white">a Month from Home</span>
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    India's most generous platform for Vedic astrologers. Zero joining fee, weekly payouts, and seekers matched to your exact specialty.
                  </p>
                  <ul className="space-y-3 mb-10">
                    {[
                      ['60% payout', 'Highest split in the industry — we take only 40%'],
                      ['₹0 joining fee', 'Free to apply, free to go live, no monthly charges'],
                      ['Flexible schedule', 'Toggle online when you want. Take breaks freely'],
                      ['Weekly payments', 'Transferred every Monday, straight to your bank'],
                    ].map(([title, desc]) => (
                      <li key={title} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-gold-400 text-[10px]">✓</span>
                        </span>
                        <div>
                          <span className="text-gray-200 text-sm font-medium">{title}</span>
                          <span className="text-gray-500 text-xs"> — {desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link to="/join-as-astrologer"
                    className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold">
                    Apply in 5 Minutes →
                  </Link>
                  <p className="text-gray-600 text-xs mt-3">No documents needed upfront. Our team calls you within 3–5 days.</p>
                </div>

                {/* Right: earnings calculator */}
                <div className="bg-cosmic-900/40 border-l border-gold-500/10 p-10 md:p-14 flex flex-col justify-center">
                  <p className="text-xs text-purple-300/60 uppercase tracking-widest mb-6">Earnings Calculator</p>
                  <EarningCalc />
                </div>

              </div>
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
                    { label: 'Astrologer Login',     to: '/pandit-portal' },
                  ]).map((l, i) => (
                    <li key={l.row_id || l.id || i} data-edit-item={l.row_id && `footer_links:${l.row_id}`}><Link to={l.to} className="hover:text-gold-400 transition-colors">{l.label}</Link></li>
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

              {/* Contact column */}
              <div>
                <h4 className="text-gold-400 text-sm font-medium mb-3">Contact Us</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="font-medium text-gray-300 text-xs">Prof. Hemant Kumar Sharma</li>
                  <li>
                    <a href="tel:+919414282954" className="hover:text-gold-400 transition-colors text-xs">
                      📞 +91 94142 82954
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/919414282954" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xs">
                      💬 WhatsApp
                    </a>
                  </li>
                  <li>
                    <a href="mailto:prof.hemant.sgnr@gmail.com" className="hover:text-gold-400 transition-colors text-xs break-all">
                      ✉ prof.hemant.sgnr@gmail.com
                    </a>
                  </li>
                  <li className="text-xs text-gray-500">📍 Jaipur, Rajasthan</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gold-600/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2025 AstroVyoma. All rights reserved.</p>
              <p className="font-serif text-gold-600 text-sm">✦ Ancient Wisdom, Modern Guidance</p>
              <div className="flex gap-4 text-gray-400 text-xs">
                <Link to="/about" className="hover:text-gold-400 transition-colors">About Us</Link>
                <span className="text-gold-600/30">·</span>
                <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
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
