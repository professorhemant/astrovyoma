import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import TarotCardFlip from '../components/TarotCardFlip';
import { getRandomCards } from '../data/tarotCards';
import { kundali as kundaliApi } from '../api';
import { useAuth } from '../context/AuthContext';

// ── Element colors ─────────────────────────────────────────────────────────────
const ELEMENT_COLORS = {
  Fire:  { bg: 'rgba(251,146,60,0.15)',  text: '#FB923C', icon: '🔥' },
  Earth: { bg: 'rgba(110,231,183,0.15)', text: '#6EE7B7', icon: '🌿' },
  Air:   { bg: 'rgba(147,197,253,0.15)', text: '#93C5FD', icon: '💨' },
  Water: { bg: 'rgba(196,181,253,0.15)', text: '#C4B5FD', icon: '💧' },
};

// ── Planetary weather ─────────────────────────────────────────────────────────
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function getMoonPhase() {
  const knownNewMoon = new Date('2000-01-06').getTime();
  const cycle = 29.53 * 24 * 60 * 60 * 1000;
  const elapsed = ((Date.now() - knownNewMoon) % cycle + cycle) % cycle;
  const day = elapsed / (24 * 60 * 60 * 1000);
  if (day < 1.5)  return { phase: 'New Moon',        glyph: '🌑' };
  if (day < 7)    return { phase: 'Waxing Crescent',  glyph: '🌒' };
  if (day < 9)    return { phase: 'First Quarter',    glyph: '🌓' };
  if (day < 14)   return { phase: 'Waxing Gibbous',   glyph: '🌔' };
  if (day < 16)   return { phase: 'Full Moon',        glyph: '🌕' };
  if (day < 21)   return { phase: 'Waning Gibbous',   glyph: '🌖' };
  if (day < 23)   return { phase: 'Last Quarter',     glyph: '🌗' };
  return           { phase: 'Waning Crescent',        glyph: '🌘' };
}

function getTodayWeather() {
  const dayRuler = DAY_RULERS[new Date().getDay()];
  const moon = getMoonPhase();
  return { dayRuler, ...moon };
}

const PLANET_WEATHER_TEXT = {
  en: {
    Sun:     'Today\'s ruler is the Sun ☉ — a day of clarity, confidence, and visibility. Your reading carries solar themes of identity, success, and illumination.',
    Moon:    'Today\'s ruler is the Moon ☽ — emotions run deep and intuition is heightened. Your reading is especially attuned to feelings and subconscious truths.',
    Mars:    'Today\'s ruler is Mars ♂ — drive, courage, and decisive action are in the air. Your cards call you toward boldness and overcoming obstacles.',
    Mercury: 'Today\'s ruler is Mercury ☿ — communication and quick thinking are highlighted. Your reading speaks to choices, messages, and mental clarity.',
    Jupiter: 'Today\'s ruler is Jupiter ♃ — the great benefic expands whatever it touches. Your reading carries themes of growth, optimism, and fortunate timing.',
    Venus:   'Today\'s ruler is Venus ♀ — love, beauty, and harmony fill the air. Today\'s cards speak directly to your heart and what you most value.',
    Saturn:  'Today\'s ruler is Saturn ♄ — discipline and karmic lessons dominate. Your reading asks you to face reality with patience and long-term wisdom.',
  },
  hi: {
    Sun:     'आज सूर्य ☉ का दिन है — आत्मविश्वास और स्पष्टता की ऊर्जा। आज के कार्ड सफलता और आत्म-पहचान के विषयों को उजागर करते हैं।',
    Moon:    'आज चंद्रमा ☽ का दिन है — भावनाएं और अंतर्ज्ञान शिखर पर हैं। आज का पठन हृदय की गहराई से बात करता है।',
    Mars:    'आज मंगल ♂ का दिन है — साहस और कार्य की ऊर्जा प्रबल है। आज के कार्ड निर्णायक कदम उठाने का संकेत देते हैं।',
    Mercury: 'आज बुध ☿ का दिन है — संचार और बुद्धि सक्रिय हैं। आज का पठन विकल्पों और मानसिक स्पष्टता पर केंद्रित है।',
    Jupiter: 'आज गुरु ♃ का दिन है — विस्तार और शुभता का दिन। आज के कार्ड विकास और भाग्य के संकेत देते हैं।',
    Venus:   'आज शुक्र ♀ का दिन है — प्रेम और सौंदर्य का दिन। आज का पठन रिश्तों और आनंद पर विशेष ध्यान देता है।',
    Saturn:  'आज शनि ♄ का दिन है — अनुशासन और कर्म-पाठ का दिन। आज के कार्ड धैर्य और दीर्घकालिक ज्ञान की मांग करते हैं।',
  },
};

const MOON_CONTEXT_TEXT = {
  'New Moon':        { en: 'The New Moon amplifies new beginnings — intentions set today carry exceptional power.', hi: 'अमावस्या — नई शुरुआत का सर्वोत्तम समय। आज के संकल्प विशेष शक्ति रखते हैं।' },
  'Waxing Crescent': { en: 'The Waxing Crescent supports growth and forward momentum — take action on new plans.', hi: 'शुक्ल पक्ष — विकास और आगे बढ़ने का समय।' },
  'First Quarter':   { en: 'The First Quarter Moon challenges you to push through resistance with determination.', hi: 'प्रथम चतुर्थांश — बाधाओं को पार करने का समय।' },
  'Waxing Gibbous':  { en: 'The Waxing Gibbous refines your approach — you are almost at the peak, persist.', hi: 'लगभग पूर्णिमा — अपने प्रयासों को परिष्कृत करें।' },
  'Full Moon':       { en: 'The Full Moon brings culmination and revelation — hidden things come to light.', hi: 'पूर्णिमा — परिपूर्णता और प्रकटीकरण का समय।' },
  'Waning Gibbous':  { en: 'The Waning Gibbous invites gratitude and integration of wisdom gained.', hi: 'कृष्ण पक्ष — कृतज्ञता और ज्ञान को आत्मसात करने का समय।' },
  'Last Quarter':    { en: 'The Last Quarter calls for release — let go of what no longer serves you.', hi: 'अंतिम चतुर्थांश — जो काम न आए उसे छोड़ने का समय।' },
  'Waning Crescent': { en: 'The Waning Crescent is a time for rest, reflection, and preparing for renewal.', hi: 'अस्त चंद्र — विश्राम और नई शुरुआत की तैयारी का समय।' },
};

// ── Enhanced narrator synthesis ───────────────────────────────────────────────
function buildNarrator(cards, lang, question, dayRuler) {
  if (cards.length <= 1) return null;
  const elementCount = {};
  cards.forEach(c => { elementCount[c.element] = (elementCount[c.element] || 0) + 1; });
  const dominant = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0][0];
  const themes = {
    en: { Fire: 'action and transformation', Earth: 'stability and grounded growth', Air: 'clarity and new perspectives', Water: 'emotional healing and deep intuition' },
    hi: { Fire: 'साहस और परिवर्तन', Earth: 'स्थिरता और व्यावहारिक विकास', Air: 'स्पष्टता और नई दिशा', Water: 'भावनात्मक उपचार और अंतर्ज्ञान' },
  };
  const theme = themes[lang]?.[dominant] || themes.en[dominant];
  const qLine = question
    ? (lang === 'en' ? `Your question — "${question}" — finds its answer woven through these cards. ` : `आपका प्रश्न — "${question}" — इन कार्डों में उत्तर पाता है। `)
    : '';
  if (lang === 'en') {
    if (cards.length === 3) {
      const [p, pr, f] = cards;
      return `${qLine}Your reading traces a journey: from ${p.name} — carrying the energy of ${(p.keywordsEn || p.keywords)[0]} — through the ${pr.element} wisdom of ${pr.name} in this present moment, toward ${f.name} on the horizon. The dominant current running through all three is ${theme}. Ruled by ${dayRuler} today, the cosmic conditions amplify this message: trust the direction you are already moving.`;
    }
    return `${qLine}${cards.length} cards — ${cards.map(c => c.name).join(', ')} — converge on the theme of ${theme}. Each position illuminates one facet of your situation; together they speak with one voice. Ruled by ${dayRuler} today, the universe has chosen this moment deliberately. You are exactly where you need to be.`;
  }
  const rulerHi = { Sun:'सूर्य', Moon:'चंद्रमा', Mars:'मंगल', Mercury:'बुध', Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि' };
  if (cards.length === 3) {
    const [p, pr, f] = cards;
    return `${qLine}${p.nameHi} से ${pr.nameHi} होते हुए ${f.nameHi} तक — आपकी यात्रा ${theme} की दिशा में है। आज ${rulerHi[dayRuler] || dayRuler} की ऊर्जा इस संदेश को और गहरा करती है। ब्रह्मांड आपको इस मार्ग पर चलने का संकेत दे रहा है।`;
  }
  return `${qLine}${cards.length} कार्ड मिलकर ${theme} का संदेश देते हैं। आज ${rulerHi[dayRuler] || dayRuler} का प्रभाव इसे और सशक्त बनाता है। ब्रह्मांड ने यह समय जानबूझकर चुना है — आप बिल्कुल सही जगह पर हैं।`;
}

// ── Plain-language conclusion (what Seema actually wanted) ────────────────────
function buildConclusion(cards, spread, lang, question) {
  if (!cards.length) return null;
  const positions = spread?.positions || [];

  // Locate key position cards by label keyword
  const find = (...keys) => {
    const idx = positions.findIndex(p => keys.some(k => p.toLowerCase().includes(k)));
    return idx >= 0 ? { card: cards[idx], pos: positions[idx] } : null;
  };
  const advice  = find('advice');
  const outcome = find('outcome', 'final outcome');
  const future  = find('future', 'near future');
  const key     = outcome || future; // whichever is more "conclusive"

  if (lang === 'en') {
    const qRef = question ? `Regarding your question — "${question}" — ` : '';
    let body = '', bottom = '';

    if (cards.length === 1) {
      const c = cards[0]; const kw = (c.keywordsEn || c.keywords)[0];
      body   = `${qRef}the universe offers one clear message through ${c.name}: ${kw}. ${c.meanings?.general || ''}`;
      bottom = `One card, one message — ${kw.toLowerCase()} is what the cards are telling you right now.`;
    } else if (advice && key) {
      const { card: aC } = advice; const { card: kC } = key;
      const aKw  = (aC.keywordsEn || aC.keywords)[0];
      const aKw2 = (aC.keywordsEn || aC.keywords)[1];
      const kKw  = (kC.keywordsEn || kC.keywords)[0];
      body   = `${qRef}your cards point in a clear direction. The advice card, ${aC.name}, calls for ${aKw.toLowerCase()} — ${(aC.meanings?.general || '').replace(/\.+$/, '')}. The ${key.pos.toLowerCase()} card, ${kC.name}, reveals ${kKw.toLowerCase()} as the likely destination of this journey.`;
      bottom = `What to do: embrace ${aKw.toLowerCase()}${aKw2 ? ` and ${aKw2.toLowerCase()}` : ''}. What awaits you: ${kKw.toLowerCase()}.`;
    } else if (key) {
      const { card: kC, pos } = key; const kKw = (kC.keywordsEn || kC.keywords)[0];
      body   = `${qRef}your ${pos.toLowerCase()} card, ${kC.name}, holds the direct answer. Its message of ${kKw.toLowerCase()} is where this reading lands. ${kC.meanings?.general || ''}`;
      bottom = `The answer is clear: ${kKw.toLowerCase()} — move forward with that in mind.`;
    } else if (cards.length === 3) {
      const [, pr, f] = cards; const fKw = (f.keywordsEn || f.keywords)[0];
      body   = `${qRef}the reading speaks plainly. Your present moment — shaped by ${pr.name} — is shifting toward ${f.name}. The energy of ${fKw.toLowerCase()} is what lies ahead for you.`;
      bottom = `${fKw} is ahead — trust that and take the next step.`;
    } else {
      const last = cards[cards.length - 1]; const lKw = (last.keywordsEn || last.keywords)[0];
      body   = `${qRef}across all ${cards.length} cards, the reading arrives at ${last.name} — ${lKw.toLowerCase()}. This is the universe's direct reply to where you stand.`;
      bottom = `${lKw} is the conclusion — act on it now.`;
    }
    return { body, bottom };
  }

  // Hindi
  const qRef = question ? `"${question}" के बारे में — ` : '';
  let body = '', bottom = '';
  if (cards.length === 1) {
    const c = cards[0];
    body   = `${qRef}${c.nameHi} का संदेश स्पष्ट है। ${c.upright}`;
    bottom = `यही एक कार्ड आपके प्रश्न का उत्तर है। इसकी ऊर्जा को अपनाएं।`;
  } else if (advice && key) {
    const { card: aC } = advice; const { card: kC } = key;
    body   = `${qRef}आपके कार्ड एक स्पष्ट दिशा दिखाते हैं। सलाह कार्ड ${aC.nameHi} कहता है — ${aC.upright?.split('।')[0]}। परिणाम में ${kC.nameHi} आपकी राह बताता है।`;
    bottom = `${aC.nameHi} की सलाह मानें और ${kC.nameHi} की दिशा में आगे बढ़ें — यही इस पठन का सार है।`;
  } else if (key) {
    const { card: kC } = key;
    body   = `${qRef}${kC.nameHi} इस पठन का अंतिम उत्तर है। ${kC.upright?.split('।')[0]}।`;
    bottom = `${kC.nameHi} की ऊर्जा में आगे बढ़ें — कार्ड यही कह रहे हैं।`;
  } else if (cards.length === 3) {
    const [, , f] = cards;
    body   = `${qRef}भविष्य कार्ड ${f.nameHi} इस पठन का उत्तर है। ${f.upright?.split('।')[0]}।`;
    bottom = `${f.nameHi} की दिशा में विश्वास के साथ कदम बढ़ाएं।`;
  } else {
    const last = cards[cards.length - 1];
    body   = `${qRef}${cards.length} कार्डों का निष्कर्ष ${last.nameHi} पर आता है। ${last.upright?.split('।')[0]}।`;
    bottom = `${last.nameHi} की ऊर्जा को अपना मार्गदर्शक मानें।`;
  }
  return { body, bottom };
}

// ── All UI copy, keyed by language ────────────────────────────────────────────
const T = {
  en: {
    badge: 'TAROT READER',
    title: 'Tarot Reading',
    subtitle: 'Tarot & Vedic Astrology united — your personal cosmic reading',
    kundaliNote: 'Lagna — personalized with your birth chart',
    questionLabel: 'Enter your question (optional)',
    questionPlaceholder: 'e.g. What does my future hold?',
    sampleQ: ['What does my future hold?', 'Which direction should my career take?', 'Will my relationship succeed?', 'What should I focus on right now?'],
    chooseSpread: 'Choose a spread',
    goldNote: 'Golden Dawn Tradition — Each tarot card is linked to a Vedic planet or zodiac sign. Your birth chart, question, and cards are combined for a deeply personal reading.',
    shuffleBtn: count => `Draw ${count} Card${count > 1 ? 's' : ''}`,
    shuffling: 'Shuffling...',
    tapHint: 'Tap each card to reveal',
    tapProgress: (done, total) => `${done}/${total} revealed — continue`,
    readingTitle: 'Tarot Reading',
    newReading: 'New Reading',
    newReadingBtn: 'Read Again',
    askPandit: 'Ask Pandit Ji',
    cosmicWeather: 'Today\'s Cosmic Weather',
    domainLabels: [
      { id: 'general',  label: 'General',   icon: '✦' },
      { id: 'love',     label: 'Love',       icon: '♥' },
      { id: 'career',   label: 'Career',     icon: '⚡' },
      { id: 'spiritual',label: 'Spiritual',  icon: '☽' },
      { id: 'finances', label: 'Finances',   icon: '◆' },
    ],
    overallReading: 'OVERALL READING',
    spreads: [
      { id: 'single', label: 'Daily Card',              sub: 'One Card',    count: 1,
        positions: ["Today's Message"],
        desc: 'One powerful message for today' },
      { id: 'three',  label: 'Past · Present · Future', sub: 'Three Cards', count: 3,
        positions: ['Past', 'Present', 'Future'],
        desc: 'Full timeline — past, present & future' },
      { id: 'five',   label: 'Full Spread',             sub: 'Five Cards',  count: 5,
        positions: ['Situation', 'Challenge', 'Subconscious', 'Advice', 'Outcome'],
        desc: 'Deep dive — situation, challenge, advice & outcome' },
      { id: 'celtic', label: 'Celtic Cross',            sub: 'Ten Cards',   count: 10,
        positions: ['The Present', 'The Challenge', 'Root Cause', 'Recent Past', 'Higher Goal', 'Near Future', 'Your Stance', 'External Influences', 'Hopes & Fears', 'Final Outcome'],
        desc: 'The most complete tarot spread — situation, challenges, past, future & final outcome' },
      { id: 'love',   label: 'Love & Relationship',     sub: 'Six Cards',   count: 6,
        positions: ['Your Energy', 'Their Energy', 'The Bond', 'The Challenge', 'What to Release', 'Outcome'],
        desc: 'Deep dive into relationship dynamics — what connects you, what challenges you' },
      { id: 'year',   label: 'Year Ahead',              sub: 'Twelve Cards', count: 12,
        positions: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        desc: 'One card per month — your cosmic roadmap for the full year ahead' },
      { id: 'moon',   label: 'Moon Phase Spread',       sub: 'Four Cards',  count: 4,
        positions: ['New Moon — Plant', 'Waxing — Grow', 'Full Moon — Harvest', 'Waning — Release'],
        desc: 'Align your intentions with the lunar cycle — one card for each moon phase' },
    ],
    icons: ['✦', '✦✦✦', '✦✦✦✦✦', '✦✦✦✦✦✦✦✦✦✦', '✦✦✦✦✦✦', '✦✦✦✦✦✦✦✦✦✦✦✦', '✦✦✦✦'],
  },
  hi: {
    badge: 'तारो रीडर',
    title: 'तारो पठन',
    subtitle: 'ज्योतिष और तारो का संगम — आपके लिए व्यक्तिगत पठन',
    kundaliNote: 'लग्न — आपकी कुण्डली से जुड़ा पठन',
    questionLabel: 'अपना प्रश्न लिखें (वैकल्पिक)',
    questionPlaceholder: 'जैसे: मेरे जीवन में आगे क्या होगा?',
    sampleQ: ['मेरे जीवन में आगे क्या होगा?', 'मेरा करियर किस दिशा में जाएगा?', 'क्या मेरा रिश्ता सफल होगा?', 'मुझे इस समय क्या करना चाहिए?'],
    chooseSpread: 'स्प्रेड चुनें',
    goldNote: 'Golden Dawn परंपरा — प्रत्येक तारो कार्ड एक Vedic ग्रह या राशि से जुड़ा है। आपकी कुण्डली, प्रश्न और कार्डों को मिलाकर व्यक्तिगत पठन दिया जाता है।',
    shuffleBtn: count => `${count} कार्ड खींचें`,
    shuffling: 'शफल हो रहा है...',
    tapHint: '✦ कार्डों पर टैप करके उन्हें पलटें',
    tapProgress: (done, total) => `${done}/${total} कार्ड पलटे — जारी रखें`,
    readingTitle: 'तारो पठन',
    newReading: 'नया पठन',
    newReadingBtn: 'दोबारा पढ़ें',
    askPandit: 'Pandit Ji से पूछें',
    cosmicWeather: 'आज का ग्रह प्रभाव',
    domainLabels: [],
    overallReading: 'समग्र पठन',
    spreads: [
      { id: 'single', label: 'दैनिक कार्ड',           sub: 'एक कार्ड',    count: 1,
        positions: ['आज का संदेश'],
        desc: 'आज के दिन के लिए एक दिव्य संदेश' },
      { id: 'three',  label: 'भूत·वर्तमान·भविष्य',   sub: 'तीन कार्ड',  count: 3,
        positions: ['भूतकाल', 'वर्तमान', 'भविष्य'],
        desc: 'भूत, वर्तमान और भविष्य का पूर्ण दृष्टिकोण' },
      { id: 'five',   label: 'पूर्ण स्प्रेड',         sub: 'पाँच कार्ड', count: 5,
        positions: ['स्थिति', 'चुनौती', 'अवचेतन', 'सलाह', 'परिणाम'],
        desc: 'स्थिति, चुनौती, सलाह और परिणाम का विस्तृत पठन' },
      { id: 'celtic', label: 'सेल्टिक क्रॉस',         sub: 'दस कार्ड',   count: 10,
        positions: ['वर्तमान', 'चुनौती', 'मूल कारण', 'हाल का अतीत', 'उच्च लक्ष्य', 'निकट भविष्य', 'आपका दृष्टिकोण', 'बाहरी प्रभाव', 'आशाएं और भय', 'अंतिम परिणाम'],
        desc: 'सबसे संपूर्ण तारो स्प्रेड — स्थिति, चुनौती, अतीत, भविष्य और परिणाम' },
      { id: 'love',   label: 'प्रेम स्प्रेड',          sub: 'छह कार्ड',   count: 6,
        positions: ['आपकी ऊर्जा', 'उनकी ऊर्जा', 'बंधन', 'चुनौती', 'क्या छोड़ें', 'परिणाम'],
        desc: 'रिश्तों की गहराई में — जो जोड़ता है और जो चुनौती देता है' },
      { id: 'year',   label: 'वार्षिक पठन',            sub: 'बारह कार्ड', count: 12,
        positions: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
        desc: 'प्रत्येक माह के लिए एक कार्ड — पूरे वर्ष का ब्रह्मांडीय नक्शा' },
      { id: 'moon',   label: 'चंद्र स्प्रेड',           sub: 'चार कार्ड',  count: 4,
        positions: ['अमावस्या — बीज', 'शुक्ल — विकास', 'पूर्णिमा — फल', 'कृष्ण — त्याग'],
        desc: 'चंद्र चक्र के साथ अपनी ऊर्जा को संरेखित करें' },
    ],
    icons: ['✦', '✦✦✦', '✦✦✦✦✦', '✦✦✦✦✦✦✦✦✦✦', '✦✦✦✦✦✦', '✦✦✦✦✦✦✦✦✦✦✦✦', '✦✦✦✦'],
  },
};

// ── Background ────────────────────────────────────────────────────────────────
function TarotBg() {
  return (
    <>
      {[...Array(55)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${(i * 16.7 + 3) % 100}%`,
            top: `${(i * 11.3 + 7) % 100}%`,
            width: `${1 + (i % 3) * 0.7}px`,
            height: `${1 + (i % 3) * 0.7}px`,
            background: i % 5 === 0 ? 'rgba(232,197,71,0.8)' : 'rgba(255,255,255,0.6)',
          }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 2 + (i % 4), delay: (i * 0.13) % 5, repeat: Infinity }}
        />
      ))}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', top:'-10%', left:'-10%', width:'60%', height:'60%', background:'radial-gradient(ellipse, rgba(120,40,220,0.18) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'55%', height:'55%', background:'radial-gradient(ellipse, rgba(50,80,200,0.15) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TarotPage() {
  const { user } = useAuth();

  const [phase, setPhase]                   = useState('lang');
  const [lang, setLang]                     = useState(null);
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [question, setQuestion]             = useState('');
  const [drawnCards, setDrawnCards]         = useState([]);
  const [revealedCount, setRevealedCount]   = useState(0);
  const [kundaliContext, setKundaliContext]  = useState(null);
  const [shuffling, setShuffling]           = useState(false);
  const [domain, setDomain]                 = useState('general');

  const drawnCardsRef     = useRef([]);
  const selectedSpreadRef = useRef(null);
  const langRef           = useRef(null);

  const weather = getTodayWeather();

  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    if (user) {
      kundaliApi.getMyKundali()
        .then(r => { const k = r.data; if (k?.lagna) setKundaliContext({ lagna: k.lagna }); })
        .catch(() => {});
    }
  }, [user]);

  const t = lang ? T[lang] : T.en;

  const chooseLang = (l) => { setLang(l); langRef.current = l; setPhase('select'); };

  const handleSpreadSelect = (spread) => {
    setSelectedSpread(spread);
    selectedSpreadRef.current = spread;
    setPhase('draw');
  };

  const handleShuffle = () => {
    setShuffling(true);
    const spread = selectedSpreadRef.current;
    setTimeout(() => {
      const cards = getRandomCards(spread.count).map(c => ({ ...c, reversed: false }));
      drawnCardsRef.current = cards;
      setDrawnCards(cards);
      setRevealedCount(0);
      setShuffling(false);
      setPhase('reading');
    }, 1400);
  };

  const handleCardReveal = () => {
    setRevealedCount(prev => {
      const next = prev + 1;
      const spread = selectedSpreadRef.current;
      if (spread && next === spread.count) setTimeout(() => setPhase('result'), 400);
      return next;
    });
  };

  const handleReset = () => {
    setPhase('select');
    setSelectedSpread(null);
    selectedSpreadRef.current = null;
    setDrawnCards([]);
    drawnCardsRef.current = [];
    setRevealedCount(0);
    setQuestion('');
    setShuffling(false);
    setDomain('general');
  };

  const goChangeLang = () => { handleReset(); setPhase('lang'); setLang(null); };

  const DeckVisual = ({ animating }) => (
    <div className="relative h-60 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!animating ? (
          <motion.div key="deck" className="relative flex items-center justify-center">
            {[{r:-8,x:-16,y:6,z:0},{r:-3,x:-5,y:2,z:1},{r:2,x:6,y:0,z:2}].map((s, i) => (
              <motion.div key={i} className="absolute w-36 h-56 rounded-xl"
                style={{ rotate:s.r, x:s.x, y:s.y, zIndex:s.z,
                  background:'linear-gradient(160deg,#0d0728 0%,#1a0845 50%,#0d0f2e 100%)',
                  border:'1.5px solid rgba(201,168,76,0.4)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}
                animate={{ y:[s.y, s.y-4, s.y] }}
                transition={{ duration:3+i*0.6, repeat:Infinity, ease:'easeInOut', delay:i*0.4 }}>
                <div className="w-full h-full flex items-center justify-center">
                  <motion.span className="text-3xl opacity-40" animate={{ rotate:360 }}
                    transition={{ duration:16+i*5, repeat:Infinity, ease:'linear' }}>✶</motion.span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="shuffle" className="relative flex items-center justify-center">
            {[0,1,2,3,4,5,6].map(i => (
              <motion.div key={i} className="absolute w-36 h-56 rounded-xl"
                style={{ background:'linear-gradient(160deg,#0d0728,#1a0845)', border:'1.5px solid rgba(201,168,76,0.45)' }}
                initial={{ rotate:0, x:0, y:0 }}
                animate={{ rotate:[(i-3)*18,-(i-3)*22,(i-3)*8,0], x:[(i-3)*35,-(i-3)*18,(i-3)*5,0], y:[0,-30,15,0] }}
                transition={{ duration:1.2, ease:'easeInOut', delay:i*0.07 }}>
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">✶</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // card size by count
  const cardSize = (n) => n === 1 ? 'xl' : n <= 3 ? 'lg' : n <= 5 ? 'md' : 'sm';

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background:'linear-gradient(135deg,#0d0728 0%,#1a0533 40%,#0c1a3a 100%)' }}>
      <TarotBg />

      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden mt-16">
        <img src="/tarot-hero.webp" alt="Tarot" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0728]" />
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Title */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest"
              style={{ background:'rgba(120,40,180,0.2)', border:'1px solid rgba(168,85,247,0.35)', color:'#C084FC' }}>
              <Sparkles className="w-3 h-3" /> {t.badge}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl md:text-5xl mb-3"
              style={{ color:'#E8C547', textShadow:'0 0 40px rgba(232,197,71,0.3)' }}>
              {t.title}
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">{t.subtitle}</p>
            {kundaliContext && lang && (
              <div className="inline-flex items-center gap-1.5 mt-3 text-xs px-3 py-1 rounded-full"
                style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:'#C9A84C' }}>
                ✦ {kundaliContext.lagna} {t.kundaliNote}
              </div>
            )}
            {lang && phase !== 'lang' && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={goChangeLang}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                  style={{ background:'rgba(120,40,180,0.15)', border:'1px solid rgba(168,85,247,0.25)', color:'#A78BFA' }}>
                  {lang === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'} · Change
                </button>
                {phase !== 'select' && (
                  <button onClick={handleReset}
                    className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all hover:opacity-80"
                    style={{ background:'rgba(120,40,180,0.15)', border:'1px solid rgba(168,85,247,0.25)', color:'#A78BFA' }}>
                    <RotateCcw className="w-3 h-3" /> {t.newReading}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── PHASE: Language ─────────────────────────────────────────── */}
          {phase === 'lang' && (
            <motion.div key="lang" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="max-w-2xl mx-auto text-center">
              <p className="text-gray-300 text-base mb-2">Choose Language / भाषा चुनें</p>
              <p className="text-gray-500 text-xs mb-8">The entire experience will be in your chosen language · पूरा अनुभव आपकी भाषा में होगा</p>
              <div className="grid grid-cols-2 gap-6">
                <motion.button onClick={() => chooseLang('en')}
                  whileHover={{ y:-8, boxShadow:'0 0 50px rgba(168,85,247,0.35)' }} whileTap={{ scale:0.97 }}
                  className="rounded-2xl p-8 flex flex-col items-center gap-4 transition-all"
                  style={{ background:'linear-gradient(160deg, #1a0533 0%, #0c1a3a 100%)', border:'2px solid rgba(168,85,247,0.3)' }}>
                  <div className="text-5xl">🇬🇧</div>
                  <div>
                    <div className="font-serif text-2xl font-bold mb-1" style={{ color:'#E9D5FF' }}>English</div>
                    <div className="text-xs text-gray-400">Cards, reading & all UI in English</div>
                  </div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{ background:'rgba(126,34,206,0.3)', border:'1px solid rgba(168,85,247,0.4)', color:'#C084FC' }}>
                    Continue in English →
                  </div>
                </motion.button>
                <motion.button onClick={() => chooseLang('hi')}
                  whileHover={{ y:-8, boxShadow:'0 0 50px rgba(201,168,76,0.3)' }} whileTap={{ scale:0.97 }}
                  className="rounded-2xl p-8 flex flex-col items-center gap-4 transition-all"
                  style={{ background:'linear-gradient(160deg, #1a0f00 0%, #1a0533 100%)', border:'2px solid rgba(201,168,76,0.3)' }}>
                  <div className="text-5xl">🇮🇳</div>
                  <div>
                    <div className="font-serif text-2xl font-bold mb-1" style={{ color:'#E8C547' }}>हिंदी</div>
                    <div className="text-xs text-gray-400">कार्ड, पठन और सब कुछ हिंदी में</div>
                  </div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', color:'#C9A84C' }}>
                    हिंदी में जारी रखें →
                  </div>
                </motion.button>
              </div>
              <div className="mt-8 p-4 rounded-xl text-xs text-gray-500 leading-relaxed"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                ✦ Golden Dawn Tarot + Vedic Astrology (Jyotish) · ज्योतिष और Golden Dawn तारो का संगम
              </div>
            </motion.div>
          )}

          {/* ── PHASE: Spread Selection ─────────────────────────────────── */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="max-w-5xl mx-auto">

              {/* Question */}
              <div className="mb-8 max-w-2xl mx-auto">
                <p className="text-center text-xs text-gray-400 mb-3 tracking-wider">{t.questionLabel}</p>
                <input value={question} onChange={e => setQuestion(e.target.value)}
                  placeholder={t.questionPlaceholder} maxLength={120}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(168,85,247,0.25)' }} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.sampleQ.map(q => (
                    <button key={q} onClick={() => setQuestion(q)}
                      className="text-xs px-3 py-1 rounded-full transition-all hover:opacity-80"
                      style={{ background:'rgba(120,40,180,0.15)', border:'1px solid rgba(168,85,247,0.2)', color:'#A78BFA' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mb-5 tracking-wider">{t.chooseSpread}</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {t.spreads.map((spread, i) => (
                  <motion.button key={spread.id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                    onClick={() => handleSpreadSelect(spread)}
                    whileHover={{ y:-5, boxShadow:'0 0 30px rgba(168,85,247,0.22)' }}
                    whileTap={{ scale:0.97 }}
                    className="p-5 rounded-2xl text-left transition-all"
                    style={{ background:'rgba(120,40,180,0.12)', border:'1.5px solid rgba(168,85,247,0.2)' }}>
                    <div className="text-sm mb-2 tracking-widest truncate" style={{ color:'#E8C547' }}>
                      {(t.icons[i] || '✦').slice(0, 5)}
                    </div>
                    <div className="font-serif text-sm font-semibold mb-0.5 leading-tight" style={{ color:'#E9D5FF' }}>{spread.label}</div>
                    <div className="text-[10px] mb-2" style={{ color:'#A78BFA' }}>{spread.sub}</div>
                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{spread.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {spread.positions.slice(0, 4).map(p => (
                        <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ background:'rgba(168,85,247,0.15)', color:'#C084FC', border:'1px solid rgba(168,85,247,0.2)' }}>
                          {p}
                        </span>
                      ))}
                      {spread.positions.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ background:'rgba(168,85,247,0.1)', color:'#9b6fc9' }}>
                          +{spread.positions.length - 4} more
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 max-w-2xl mx-auto p-4 rounded-xl flex gap-3"
                style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)' }}>
                <span className="text-sm flex-shrink-0 mt-0.5" style={{ color:'#C9A84C' }}>✦</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span style={{ color:'#C9A84C' }} className="font-medium">Golden Dawn — </span>
                  {t.goldNote}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── PHASE: Draw ─────────────────────────────────────────────── */}
          {phase === 'draw' && (
            <motion.div key="draw" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="max-w-2xl mx-auto text-center">

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full mb-2"
                  style={{ background:'rgba(120,40,180,0.2)', border:'1px solid rgba(168,85,247,0.3)', color:'#C084FC' }}>
                  {selectedSpread?.label}
                </div>
              </div>

              {/* Intention-setting moment */}
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                className="mb-6 px-6 py-5 rounded-2xl mx-auto max-w-md"
                style={{ background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.18)' }}>
                <div className="text-2xl mb-2">🕯️</div>
                <h3 className="font-serif text-base mb-2" style={{ color:'#E9D5FF' }}>
                  {lang === 'en' ? 'Set Your Intention' : 'अपना संकल्प जगाएं'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  {lang === 'en'
                    ? 'Close your eyes, take a slow breath, and hold your question gently in your heart. When you feel centered, draw your cards.'
                    : 'आँखें बंद करें। गहरी सांस लें। अपना प्रश्न मन में स्थिर करें। जब तैयार हों, कार्ड खींचें।'}
                </p>
                {question && (
                  <div className="mt-3 px-3 py-1.5 rounded-lg text-xs italic"
                    style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#C9A84C' }}>
                    "{question}"
                  </div>
                )}
                {/* Today's planetary weather in draw phase */}
                <div className="mt-3 pt-3 border-t flex items-center gap-2"
                  style={{ borderColor:'rgba(168,85,247,0.15)' }}>
                  <span className="text-base">{weather.glyph}</span>
                  <span className="text-[10px]" style={{ color:'#A78BFA' }}>
                    {weather.phase} · {lang === 'en' ? weather.dayRuler + ' rules today' : (
                      { Sun:'आज सूर्य', Moon:'आज चंद्रमा', Mars:'आज मंगल', Mercury:'आज बुध', Jupiter:'आज गुरु', Venus:'आज शुक्र', Saturn:'आज शनि' }[weather.dayRuler] + ' का प्रभाव'
                    )}
                  </span>
                </div>
              </motion.div>

              <DeckVisual animating={shuffling} />

              <motion.button onClick={handleShuffle} disabled={shuffling}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="mt-6 px-10 py-4 rounded-full font-semibold text-sm flex items-center gap-2 mx-auto"
                style={{ background:'linear-gradient(135deg,#7E22CE,#581C87)', border:'1.5px solid rgba(168,85,247,0.5)',
                  color:'#E9D5FF', boxShadow:'0 4px 24px rgba(126,34,206,0.45)', opacity:shuffling?0.7:1 }}>
                <Sparkles className={`w-4 h-4 ${shuffling ? 'animate-spin' : ''}`} />
                {shuffling ? t.shuffling : t.shuffleBtn(selectedSpread?.count || 1)}
              </motion.button>
            </motion.div>
          )}

          {/* ── PHASE: Reading + Result ─────────────────────────────────── */}
          {(phase === 'reading' || phase === 'result') && drawnCards.length > 0 && (
            <motion.div key="reveal" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="max-w-5xl mx-auto">

              {/* Cards row */}
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                {drawnCards.map((card, i) => (
                  <div key={card.id + '-' + i} className="flex flex-col items-center gap-2">
                    <div className="text-[10px] tracking-wider font-medium text-center max-w-[120px] leading-tight" style={{ color:'#A78BFA' }}>
                      {selectedSpread?.positions[i] || `Card ${i+1}`}
                    </div>
                    <TarotCardFlip
                      card={card}
                      reversed={false}
                      size={cardSize(drawnCards.length)}
                      onFlip={handleCardReveal}
                      autoFlipped={phase === 'result'}
                      lang={lang || 'hi'}
                    />
                  </div>
                ))}
              </div>

              {/* Tap hint */}
              {phase === 'reading' && revealedCount < drawnCards.length && (
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="text-center text-xs text-gray-500 mb-4">
                  {revealedCount === 0 ? t.tapHint : t.tapProgress(revealedCount, drawnCards.length)}
                </motion.p>
              )}

              {/* ── Result panel ────────────────────────────────────────── */}
              {phase === 'result' && (
                <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="max-w-3xl mx-auto">

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ background:'rgba(126,34,206,0.3)', border:'1.5px solid rgba(168,85,247,0.4)' }}>✦</div>
                    <div>
                      <div className="text-sm font-medium" style={{ color:'#E9D5FF' }}>{t.readingTitle}</div>
                      <div className="text-xs" style={{ color:'#A78BFA' }}>
                        {selectedSpread?.label}{kundaliContext ? ` · ${kundaliContext.lagna}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  {question && (
                    <div className="mb-4 px-4 py-2 rounded-xl text-xs italic text-gray-400"
                      style={{ background:'rgba(255,255,255,0.04)', borderLeft:'2px solid rgba(201,168,76,0.4)' }}>
                      "{question}"
                    </div>
                  )}

                  {/* Today's cosmic weather banner */}
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
                    className="mb-5 p-4 rounded-xl flex gap-3"
                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-xl flex-shrink-0">{weather.glyph}</div>
                    <div>
                      <div className="text-[10px] font-medium tracking-widest mb-1" style={{ color:'#C9A84C' }}>
                        {t.cosmicWeather}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {PLANET_WEATHER_TEXT[lang || 'en'][weather.dayRuler]}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {MOON_CONTEXT_TEXT[weather.phase]?.[lang || 'en']}
                      </p>
                    </div>
                  </motion.div>

                  {/* Domain tabs — English only */}
                  {lang === 'en' && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {t.domainLabels.map(d => (
                        <button key={d.id} onClick={() => setDomain(d.id)}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all"
                          style={domain === d.id
                            ? { background:'rgba(201,168,76,0.2)', border:'1px solid rgba(201,168,76,0.5)', color:'#E8C547', fontWeight:600 }
                            : { background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#6B7280' }}>
                          {d.icon} {d.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Card blocks */}
                  <div className="space-y-4 mb-6">
                    {drawnCards.map((card, i) => {
                      const elMeta = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.Fire;
                      const kws = (lang === 'en' ? (card.keywordsEn || card.keywords) : card.keywords).slice(0, 3);
                      const meaning = lang === 'en'
                        ? (card.meanings?.[domain] || card.meanings?.general || '')
                        : card.upright;
                      return (
                        <motion.div key={i}
                          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
                          className="rounded-2xl p-5"
                          style={{ background:`linear-gradient(135deg, ${card.gradient[0]}cc, ${card.gradient[1]}99)`,
                                   border:`1px solid ${card.accent}35` }}>

                          {/* Header row */}
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-2xl mt-0.5 flex-shrink-0"
                              style={{ filter:`drop-shadow(0 0 8px ${card.accent}80)` }}>
                              {card.symbol}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] tracking-widest uppercase mb-0.5"
                                style={{ color:`${card.accent}99` }}>
                                {selectedSpread?.positions?.[i] || `Card ${i+1}`}
                              </div>
                              <div className="font-serif text-base font-semibold leading-tight" style={{ color:card.accent }}>
                                {lang === 'en' ? card.name : card.nameHi}
                                <span className="text-xs font-normal opacity-50 ml-2">
                                  {lang === 'en' ? card.nameHi : card.name}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                              style={{ background: elMeta.bg, color: elMeta.text, border:`1px solid ${elMeta.text}30` }}>
                              {elMeta.icon} {card.element}
                            </span>
                          </div>

                          {/* Numerology + zodiac sign badges */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background:'rgba(255,255,255,0.05)', color:'#9b6fc9', border:'1px solid rgba(168,85,247,0.2)' }}>
                              No.{card.id}
                            </span>
                            {card.sign && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background:'rgba(201,168,76,0.08)', color:'#C9A84C', border:'1px solid rgba(201,168,76,0.2)' }}>
                                {card.signGlyph} {card.sign}
                              </span>
                            )}
                          </div>

                          {/* Meaning paragraph */}
                          <p className="text-sm text-gray-200 leading-relaxed mb-3">{meaning}</p>

                          {/* Keywords + ruler */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {kws.map(k => (
                              <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background:`${card.accent}18`, color:card.accent, border:`1px solid ${card.accent}30` }}>
                                {k}
                              </span>
                            ))}
                            <span className="text-[10px] text-gray-500 ml-auto flex items-center gap-1">
                              {card.rulerGlyph} {card.ruler}
                            </span>
                          </div>

                          {/* Vedic astro note */}
                          <div className="text-[10px] leading-relaxed pt-2 border-t"
                            style={{ color:`${card.accent}70`, borderColor:`${card.accent}20` }}>
                            ✦ {lang === 'en' ? card.astroNoteEn : card.astroNote}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Overall narrator synthesis */}
                  {buildNarrator(drawnCards, lang || 'en', question, weather.dayRuler) && (
                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: drawnCards.length * 0.1 + 0.2 }}
                      className="mb-6 p-5 rounded-2xl"
                      style={{ background:'rgba(201,168,76,0.07)', border:'1px solid rgba(201,168,76,0.25)' }}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0" style={{ color:'#C9A84C' }}>✦</span>
                        <div>
                          <div className="text-xs font-medium tracking-wider mb-1.5" style={{ color:'#C9A84C' }}>
                            {t.overallReading}
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {buildNarrator(drawnCards, lang || 'en', question, weather.dayRuler)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Conclusion */}
                  {(() => {
                    const c = buildConclusion(drawnCards, selectedSpread, lang || 'en', question);
                    if (!c) return null;
                    return (
                      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                        transition={{ delay: drawnCards.length * 0.1 + 0.4 }}
                        className="mb-6 rounded-2xl overflow-hidden"
                        style={{ border:'1.5px solid rgba(56,189,248,0.35)' }}>
                        <div className="px-5 py-2 flex items-center gap-2"
                          style={{ background:'rgba(56,189,248,0.12)' }}>
                          <span style={{ color:'#38BDF8', fontSize:14 }}>◉</span>
                          <span className="text-xs font-semibold tracking-widest uppercase"
                            style={{ color:'#38BDF8' }}>
                            {lang === 'en' ? 'Conclusion' : 'निष्कर्ष'}
                          </span>
                        </div>
                        <div className="px-5 py-4" style={{ background:'rgba(12,26,60,0.7)' }}>
                          {question && (
                            <div className="mb-3 text-xs italic text-gray-400 border-l-2 pl-3"
                              style={{ borderColor:'rgba(56,189,248,0.4)' }}>
                              "{question}"
                            </div>
                          )}
                          <p className="text-sm text-gray-200 leading-relaxed mb-3">{c.body}</p>
                          <div className="pt-3 border-t flex items-start gap-2"
                            style={{ borderColor:'rgba(56,189,248,0.2)' }}>
                            <span style={{ color:'#E8C547', flexShrink:0, fontSize:13 }}>✦</span>
                            <p className="text-sm font-semibold leading-snug" style={{ color:'#E8C547' }}>
                              {lang === 'en' ? 'Bottom line: ' : 'सार: '}
                              <span className="font-normal text-gray-200">{c.bottom}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-semibold"
                      style={{ background:'linear-gradient(135deg,#7E22CE,#581C87)', border:'1.5px solid rgba(168,85,247,0.4)',
                        color:'#E9D5FF', boxShadow:'0 4px 20px rgba(126,34,206,0.3)' }}>
                      <RotateCcw className="w-4 h-4" />{t.newReadingBtn}
                    </button>
                    <Link to="/pandit"
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-semibold"
                      style={{ background:'rgba(120,40,180,0.15)', border:'1.5px solid rgba(168,85,247,0.3)', color:'#E9D5FF' }}>
                      <Sparkles className="w-4 h-4" />{t.askPandit}
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
