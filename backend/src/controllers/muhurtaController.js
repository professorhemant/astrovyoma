'use strict';

const { getPanchangData } = require('./panchangController');

// ── Event-type rules ──────────────────────────────────────────────────────────
// good/bad tithis (by name), good/bad nakshatras, good/bad varas, good yogas

const EVENTS = {
  marriage: {
    label: 'Marriage (Vivah)',
    icon: '💍',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Trayodashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Navami','Chaturdashi','Amavasya','Pratipada'],
    goodNakshatras: ['Rohini','Mrigashira','Magha','Uttara Phalguni','Hasta','Swati','Anuradha','Mula','Uttara Ashadha','Uttara Bhadrapada','Revati'],
    badNakshatras:  ['Bharani','Krittika','Ardra','Ashlesha','Jyeshtha','Vishakha'],
    goodVaras:      ['Monday','Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Indra','Vriddhi','Dhruva'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'The Uttara nakshatras (Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) are traditionally considered most auspicious for marriage.',
  },
  business: {
    label: 'Business Start (Vyapar Arambh)',
    icon: '💼',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Trayodashi'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Shravana','Dhanishtha','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Magha','Jyeshtha','Mula','Shatabhisha'],
    goodVaras:      ['Wednesday','Thursday','Friday'],
    badVaras:       ['Saturday','Tuesday'],
    goodYogas:      ['Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vriddhi'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Wednesday (Mercury\'s day) is the most auspicious for starting any business or financial venture.',
  },
  travel: {
    label: 'Journey / Travel (Yatra)',
    icon: '✈️',
    goodTithis:     ['Dwitiya','Tritiya','Saptami','Dashami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya','Navami'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Hasta','Chitra','Swati','Shravana','Dhanishtha','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Jyeshtha','Mula'],
    goodVaras:      ['Monday','Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Vriddhi','Ayushman'],
    badYogas:       ['Vishkumbha','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Travel on Char Choghadiya is traditionally considered best. Avoid Rahu Kaal for departure.',
  },
  griha_pravesh: {
    label: 'House Entry (Griha Pravesh)',
    icon: '🏠',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Trayodashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Navami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Rohini','Mrigashira','Pushya','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada','Revati','Dhanishtha','Shravana','Anuradha'],
    badNakshatras:  ['Bharani','Krittika','Ardra','Ashlesha','Jyeshtha','Mula','Shatabhisha'],
    goodVaras:      ['Monday','Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday','Sunday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Vriddhi','Dhruva'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Fixed nakshatras (Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) are ideal for Griha Pravesh — they indicate permanence and stability.',
  },
  vehicle: {
    label: 'Vehicle Purchase (Vahan Kharid)',
    icon: '🚗',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Hasta','Chitra','Swati','Shravana','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Magha','Jyeshtha','Mula'],
    goodVaras:      ['Wednesday','Thursday','Friday'],
    badVaras:       ['Saturday','Tuesday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Vriddhi','Ayushman'],
    badYogas:       ['Vishkumbha','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Vaidhriti'],
    notes: 'Ashwini nakshatra (ruled by Ashwini Kumaras, the divine physicians) is especially auspicious for vehicles.',
  },
  surgery: {
    label: 'Surgery / Medical Procedure',
    icon: '🏥',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya','Purnima'],
    goodNakshatras: ['Ashwini','Mrigashira','Hasta','Ashlesha','Jyeshtha','Mula'],
    badNakshatras:  ['Rohini','Ardra','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada'],
    goodVaras:      ['Tuesday','Saturday'],
    badVaras:       ['Monday','Thursday'],
    goodYogas:      ['Siddha','Shubha','Harshana','Vriddhi'],
    badYogas:       ['Vishkumbha','Shoola','Ganda','Vyaghata','Parigha','Vaidhriti'],
    notes: 'Unlike most activities, Tuesdays and Saturdays are preferred for surgery. Avoid operating on the body part ruled by the current Moon sign.',
  },
  education: {
    label: 'Education Start (Vidyarambha)',
    icon: '📚',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Uttara Phalguni','Hasta','Chitra','Swati','Shravana','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Magha','Jyeshtha','Mula','Shatabhisha'],
    goodVaras:      ['Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Vriddhi','Saubhagya'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vaidhriti'],
    notes: 'Wednesday (Mercury\'s day) is the most auspicious for starting studies, exams, or academic pursuits.',
  },
  investment: {
    label: 'Investment / Property Purchase',
    icon: '💰',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Rohini','Mrigashira','Punarvasu','Pushya','Uttara Phalguni','Hasta','Swati','Uttara Ashadha','Dhanishtha','Uttara Bhadrapada','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Jyeshtha','Mula'],
    goodVaras:      ['Thursday','Friday','Wednesday'],
    badVaras:       ['Saturday','Tuesday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Indra','Vriddhi','Dhruva'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Dhruva (Fixed) nakshatras are especially good for property purchases — they indicate permanence and long-term stability.',
  },
};

// ── Personalisation: Tara Bala & Chandra Bala ────────────────────────────────
// Both are computed relative to the seeker's janma nakshatra / janma rashi, so
// unlike tithi/vara/yoga they differ from person to person on the same day.

const NAKSHATRA_LIST = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];

const RASHI_LIST = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];

// Kundali records store moon_sign in English (kundaliEngine.ZODIAC_SIGNS), so
// accept either naming when resolving a rashi.
const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// The 9 taras, counted from the seeker's janma nakshatra to the day's nakshatra.
// 3rd (Vipat), 5th (Pratyari) and 7th (Vadha) are rejected for auspicious work;
// the 1st (Janma) is treated as mixed rather than outright bad.
const TARAS = [
  { name:'Janma',     quality:'Mixed',        meaning:'Your own birth star — guard your health and avoid risk' },
  { name:'Sampat',    quality:'Auspicious',   meaning:'Wealth and gain — highly favourable' },
  { name:'Vipat',     quality:'Inauspicious', meaning:'Danger and loss — avoid new undertakings' },
  { name:'Kshema',    quality:'Auspicious',   meaning:'Prosperity and well-being — favourable' },
  { name:'Pratyari',  quality:'Inauspicious', meaning:'Obstruction and opposition — avoid' },
  { name:'Sadhaka',   quality:'Auspicious',   meaning:'Accomplishment — good for achieving aims' },
  { name:'Vadha',     quality:'Inauspicious', meaning:'Harm and destruction — strongly avoid' },
  { name:'Mitra',     quality:'Auspicious',   meaning:'Friendly and supportive' },
  { name:'Ati-Mitra', quality:'Auspicious',   meaning:'Best friend — the most supportive tara' },
];

// Moon's transit sign counted from janma rashi. 4th, 8th and 12th are rejected.
const CHANDRA_BALA = {
  1:'Auspicious', 2:'Neutral', 3:'Auspicious', 4:'Inauspicious',
  5:'Neutral',    6:'Auspicious', 7:'Auspicious', 8:'Inauspicious',
  9:'Neutral',   10:'Auspicious', 11:'Auspicious', 12:'Inauspicious',
};

function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function nakshatraIndex(name) {
  if (name == null) return -1;
  return NAKSHATRA_LIST.findIndex(n => n.toLowerCase() === String(name).trim().toLowerCase());
}

function rashiIndex(name) {
  if (name == null) return -1;
  const n = String(name).trim().toLowerCase();
  const i = RASHI_LIST.findIndex(r => r.toLowerCase() === n);
  return i >= 0 ? i : RASHI_EN.findIndex(r => r.toLowerCase() === n);
}

function getTaraBala(janmaNakIdx, dayNakIdx) {
  const count   = ((dayNakIdx - janmaNakIdx + 27) % 27) + 1; // 1..27
  const taraNum = ((count - 1) % 9) + 1;                     // 1..9
  const tara    = TARAS[taraNum - 1];
  return { taraNum, count, name: tara.name, quality: tara.quality, meaning: tara.meaning };
}

function getChandraBala(janmaRashiIdx, moonRashiIdx) {
  const house = ((moonRashiIdx - janmaRashiIdx + 12) % 12) + 1; // 1..12
  return { house, quality: CHANDRA_BALA[house], moonRashi: RASHI_LIST[moonRashiIdx] };
}

// Drik-style day summary: which janma nakshatras / rashis the day favours.
// Always returned, so anonymous visitors can find themselves in the list.
function buildBalaSummary(pd) {
  const moonRashiIdx = Math.floor(((pd.moonLon % 360) + 360) % 360 / 30);

  const goodTara = [], badTara = [];
  NAKSHATRA_LIST.forEach((nak, idx) => {
    const t = getTaraBala(idx, pd.nakshatraIdx);
    (t.quality === 'Inauspicious' ? badTara : goodTara).push(nak);
  });

  const goodChandra = [], badChandra = [];
  RASHI_LIST.forEach((rashi, idx) => {
    const c = getChandraBala(idx, moonRashiIdx);
    (c.quality === 'Inauspicious' ? badChandra : goodChandra).push(rashi);
  });

  return {
    moon_rashi: RASHI_LIST[moonRashiIdx],
    day_nakshatra: pd.nakshatra,
    good_tara_nakshatras: goodTara,
    bad_tara_nakshatras:  badTara,
    good_chandra_rashis:  goodChandra,
    bad_chandra_rashis:   badChandra,
  };
}

// Yoga quality from panchangController categories
const BAD_YOGAS_UNIVERSAL = new Set(['Vishkumbha','Atiganda','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti','Shoola']);
const GOOD_YOGAS_UNIVERSAL = new Set(['Siddha','Shubha','Shukla','Brahma','Indra','Vriddhi','Harshana','Saubhagya','Ayushman','Sadhya','Preeti','Priti']);

function scoreDay(pd, eventType, person = {}) {
  const ev = EVENTS[eventType];
  if (!ev) return null;

  let score = 50; // base
  const factors = [];

  // Tithi (25 points max)
  if (ev.badTithis.includes(pd.tithi)) {
    score -= 25;
    factors.push({ label:'Tithi', value: pd.tithi, quality:'Inauspicious', points:-25, reason: `${pd.tithi} is unfavorable for ${ev.label}` });
  } else if (ev.goodTithis.includes(pd.tithi)) {
    score += 25;
    factors.push({ label:'Tithi', value: pd.tithi, quality:'Auspicious', points:+25, reason: `${pd.tithi} is auspicious for ${ev.label}` });
  } else {
    factors.push({ label:'Tithi', value: pd.tithi, quality:'Neutral', points:0, reason: `${pd.tithi} is neutral for ${ev.label}` });
  }

  // Nakshatra (20 points max)
  if (ev.badNakshatras.includes(pd.nakshatra)) {
    score -= 20;
    factors.push({ label:"Moon's Nakshatra", value: pd.nakshatra, quality:'Inauspicious', points:-20, reason: `Moon in ${pd.nakshatra} is unfavorable for ${ev.label}` });
  } else if (ev.goodNakshatras.includes(pd.nakshatra)) {
    score += 20;
    factors.push({ label:"Moon's Nakshatra", value: pd.nakshatra, quality:'Auspicious', points:+20, reason: `Moon in ${pd.nakshatra} is auspicious for ${ev.label}` });
  } else {
    factors.push({ label:"Moon's Nakshatra", value: pd.nakshatra, quality:'Neutral', points:0, reason: `Moon in ${pd.nakshatra} is neutral for ${ev.label}` });
  }

  // Vara / Day of week (15 points max)
  if (ev.badVaras.includes(pd.vara)) {
    score -= 15;
    factors.push({ label:'Day of Week', value: pd.vara, quality:'Inauspicious', points:-15, reason: `${pd.vara} (ruled by ${pd.varaLord}) is unfavorable for ${ev.label}` });
  } else if (ev.goodVaras.includes(pd.vara)) {
    score += 15;
    factors.push({ label:'Day of Week', value: pd.vara, quality:'Auspicious', points:+15, reason: `${pd.vara} (ruled by ${pd.varaLord}) is auspicious for ${ev.label}` });
  } else {
    factors.push({ label:'Day of Week', value: pd.vara, quality:'Neutral', points:0, reason: `${pd.vara} is neutral for ${ev.label}` });
  }

  // Yoga (10 points max)
  if (ev.badYogas.includes(pd.yoga) || BAD_YOGAS_UNIVERSAL.has(pd.yoga)) {
    score -= 10;
    factors.push({ label:'Panchanga Yoga', value: pd.yoga, quality:'Inauspicious', points:-10, reason: `${pd.yoga} yoga is unfavorable` });
  } else if (ev.goodYogas.includes(pd.yoga) || GOOD_YOGAS_UNIVERSAL.has(pd.yoga)) {
    score += 10;
    factors.push({ label:'Panchanga Yoga', value: pd.yoga, quality:'Auspicious', points:+10, reason: `${pd.yoga} yoga is auspicious` });
  } else {
    factors.push({ label:'Panchanga Yoga', value: pd.yoga, quality:'Neutral', points:0, reason: `${pd.yoga} yoga is neutral` });
  }

  // ── Personal factors (only when the seeker's birth star / sign is known) ──
  const janmaNakIdx   = nakshatraIndex(person.janma_nakshatra);
  const janmaRashiIdx = rashiIndex(person.janma_rashi);
  let personalized = false;

  // Tara Bala (20 points) — the strongest personal filter in classical muhurta
  if (janmaNakIdx >= 0) {
    personalized = true;
    const t = getTaraBala(janmaNakIdx, pd.nakshatraIdx);
    const pts = t.quality === 'Inauspicious' ? -20 : t.quality === 'Mixed' ? -5 : +20;
    score += pts;
    factors.push({
      label: 'Tara Bala', value: `${t.name} Tara (${ordinal(t.count)})`, quality: t.quality, points: pts,
      reason: `Counting from your janma nakshatra ${NAKSHATRA_LIST[janmaNakIdx]} to today's ${pd.nakshatra} gives ${t.name} Tara — ${t.meaning}`,
      personal: true,
    });
  }

  // Chandra Bala (15 points)
  if (janmaRashiIdx >= 0) {
    personalized = true;
    const moonRashiIdx = Math.floor(((pd.moonLon % 360) + 360) % 360 / 30);
    const c = getChandraBala(janmaRashiIdx, moonRashiIdx);
    const pts = c.quality === 'Inauspicious' ? -15 : c.quality === 'Neutral' ? 0 : +15;
    score += pts;
    factors.push({
      label: 'Chandra Bala', value: `Moon in ${ordinal(c.house)} from your rashi`,
      quality: c.quality, points: pts,
      reason: `Moon transits ${c.moonRashi}, the ${ordinal(c.house)} sign from your janma rashi ${RASHI_LIST[janmaRashiIdx]}`,
      personal: true,
    });
  }

  // ── Partner factors (marriage) ──
  // Classical vivah muhurta centres the bride's bala and checks the groom's
  // secondarily, so the partner carries roughly half the weight.
  const pNakIdx   = nakshatraIndex(person.partner_nakshatra);
  const pRashiIdx = rashiIndex(person.partner_rashi);

  if (pNakIdx >= 0) {
    personalized = true;
    const t = getTaraBala(pNakIdx, pd.nakshatraIdx);
    const pts = t.quality === 'Inauspicious' ? -10 : t.quality === 'Mixed' ? -3 : +10;
    score += pts;
    factors.push({
      label: "Partner's Tara Bala", value: `${t.name} Tara (${ordinal(t.count)})`, quality: t.quality, points: pts,
      reason: `From the partner's janma nakshatra ${NAKSHATRA_LIST[pNakIdx]} to today's ${pd.nakshatra} — ${t.meaning}`,
      personal: true, partner: true,
    });
  }

  if (pRashiIdx >= 0) {
    personalized = true;
    const moonRashiIdx = Math.floor(((pd.moonLon % 360) + 360) % 360 / 30);
    const c = getChandraBala(pRashiIdx, moonRashiIdx);
    const pts = c.quality === 'Inauspicious' ? -8 : c.quality === 'Neutral' ? 0 : +8;
    score += pts;
    factors.push({
      label: "Partner's Chandra Bala", value: `Moon in ${ordinal(c.house)} from their rashi`,
      quality: c.quality, points: pts,
      reason: `Moon transits ${c.moonRashi}, the ${ordinal(c.house)} sign from the partner's janma rashi ${RASHI_LIST[pRashiIdx]}`,
      personal: true, partner: true,
    });
  }

  // Normalise against the maximum achievable for this mode. Without this the
  // raw sum saturates (50 + 25+20+15+10 = 120 → clamped to 100) and a rejected
  // Tara Bala would be invisible on an otherwise good day.
  const maxPositive = 70
    + (janmaNakIdx   >= 0 ? 20 : 0) + (janmaRashiIdx >= 0 ? 15 : 0)
    + (pNakIdx       >= 0 ? 10 : 0) + (pRashiIdx     >= 0 ?  8 : 0);
  score = Math.max(0, Math.min(100, Math.round(50 + 50 * ((score - 50) / maxPositive))));

  // Classical practice treats Vipat/Pratyari/Vadha tara and a 4/8/12 Chandra
  // Bala as disqualifying regardless of how good the general panchang is, so
  // surface them explicitly rather than letting the score average them away.
  const warnings = factors
    .filter(f => f.personal && f.quality === 'Inauspicious')
    .map(f => `${f.label}: ${f.value} — traditionally avoided for ${ev.label.split(' (')[0]}`);

  // A rejected tara or Chandra Bala overrides an otherwise excellent panchang:
  // without this cap a Vadha Tara day still reported "Highly Auspicious", and
  // findBestDates (which keeps scores >= 55) would go on recommending it.
  if (warnings.length) score = Math.min(score, warnings.length > 1 ? 25 : 35);

  let verdict, verdictColor;
  if (score >= 75)      { verdict = 'Highly Auspicious'; verdictColor = '#6BCB77'; }
  else if (score >= 55) { verdict = 'Auspicious'; verdictColor = '#74B9FF'; }
  else if (score >= 40) { verdict = 'Neutral / Acceptable'; verdictColor = '#FFD93D'; }
  else if (score >= 25) { verdict = 'Inauspicious'; verdictColor = '#FF9F43'; }
  else                  { verdict = 'Avoid'; verdictColor = '#FF6B6B'; }

  return { score, verdict, verdictColor, factors, personalized, warnings };
}

function getVerdictMessage(score, eventName) {
  if (score >= 75) return {
    level: 'excellent',
    headline: `🌟 YES! Today is HIGHLY AUSPICIOUS for ${eventName}`,
    message: 'Stars are strongly aligned. An excellent day — go ahead with full confidence.',
    color: '#6BCB77',
  };
  if (score >= 55) return {
    level: 'good',
    headline: `✅ YES! Today is a GOOD day for ${eventName}`,
    message: 'Conditions are favourable. You may proceed today.',
    color: '#74B9FF',
  };
  if (score >= 40) return {
    level: 'neutral',
    headline: `⚠️ Today is AVERAGE for ${eventName}`,
    message: 'Not ideal but acceptable. Better dates are available — check below.',
    color: '#FFD93D',
  };
  if (score >= 25) return {
    level: 'bad',
    headline: `❌ NOT RECOMMENDED for ${eventName} today`,
    message: 'Today is inauspicious for this activity. Please use one of the better dates suggested below.',
    color: '#FF9F43',
  };
  return {
    level: 'avoid',
    headline: `🚫 AVOID ${eventName} today`,
    message: 'Highly inauspicious day. Strongly recommended to wait for a better date shown below.',
    color: '#FF6B6B',
  };
}

// rank:'chronological' keeps the original "next N qualifying dates" behaviour.
// rank:'score' scans the whole window, keeps the N strongest, then returns them
// in date order — used by the "find me dates" mode, where the soonest qualifying
// date is rarely the best one in the window.
function findBestDates(eventType, fromDateStr, count = 3, person = {}, opts = {}) {
  const { windowDays = 60, rank = 'chronological', minScore = 55, includeFromDate = false } = opts;
  const results = [];
  const from = new Date(fromDateStr + 'T00:00:00');
  const start = includeFromDate ? 0 : 1;

  for (let i = start; i <= windowDays; i++) {
    if (rank === 'chronological' && results.length >= count) break;
    const d = new Date(from.getTime() + i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    try {
      const pd = getPanchangData(dateStr);
      const scoring = scoreDay(pd, eventType, person);
      if (!scoring || scoring.score < minScore) continue;

      const chog = buildChoghadiya(pd);
      const bestSlot = chog.find(s =>
        ['Amrit','Shubh'].includes(s.name) && !s.isRahu && !s.isYamganda && s.period === 'Day'
      ) || chog.find(s =>
        s.name === 'Labh' && !s.isRahu && !s.isYamganda && s.period === 'Day'
      ) || chog.find(s =>
        s.name === 'Char' && !s.isRahu && !s.isYamganda && s.period === 'Day'
      );

      // Every auspicious daytime window, so the user can pick a workable hour
      // rather than being handed a single slot.
      const slots = chog
        .filter(s => ['Amrit','Shubh','Labh','Char'].includes(s.name) && !s.isRahu && !s.isYamganda && s.period === 'Day')
        .map(s => ({ name: s.name, start: s.start, end: s.end, nature: s.nature }));

      const taraFactor = scoring.factors.find(f => f.label === 'Tara Bala');

      results.push({
        date: dateStr,
        display: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
        score: scoring.score,
        verdict: scoring.verdict,
        verdictColor: scoring.verdictColor,
        bestTime: bestSlot ? `${bestSlot.start} – ${bestSlot.end} (${bestSlot.name} Choghadiya)` : 'Check Choghadiya for best time',
        slots,
        vara: pd.vara,
        nakshatra: pd.nakshatra,
        tithi: pd.tithi,
        yoga: pd.yoga,
        tara: taraFactor ? taraFactor.value : null,
      });
    } catch (_) { /* skip bad dates */ }
  }

  if (rank === 'score') {
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  return results;
}

function minToTime12(m) {
  const h = Math.floor(m / 60) % 24, mn = Math.round(m % 60);
  const a = h >= 12 ? 'PM' : 'AM', h12 = h % 12 || 12;
  return `${h12}:${String(mn).padStart(2,'0')} ${a}`;
}

function buildChoghadiya(pd) {
  const { srMin, ssMin, choghadiyaDay, choghadiyaNight, choghadiyaInfo,
          rahuPart, yamgandaPart, gulikaPart } = pd;
  const slots = [];

  const dayDur  = (ssMin - srMin) / 8;
  const nightDur = (srMin + 1440 - ssMin) / 8;

  for (let i = 0; i < 8; i++) {
    const start = srMin + i * dayDur;
    const end   = start + dayDur;
    const name  = choghadiyaDay[i];
    const info  = choghadiyaInfo[name] || {};
    slots.push({
      period: 'Day', index: i+1, name,
      start: minToTime12(start), end: minToTime12(end),
      nature: info.nature || 'Neutral',
      color:  info.color  || '#gray',
      icon:   info.icon   || '',
      desc:   info.desc   || '',
      isRahu:    rahuPart    === i+1,
      isYamganda:yamgandaPart === i+1,
      isGulika:  gulikaPart   === i+1,
    });
  }
  for (let i = 0; i < 8; i++) {
    const start = ssMin + i * nightDur;
    const end   = start + nightDur;
    const name  = choghadiyaNight[i];
    const info  = choghadiyaInfo[name] || {};
    slots.push({
      period: 'Night', index: i+1, name,
      start: minToTime12(start % 1440), end: minToTime12(end % 1440),
      nature: info.nature || 'Neutral',
      color:  info.color  || '#gray',
      icon:   info.icon   || '',
      desc:   info.desc   || '',
      isRahu: false, isYamganda: false, isGulika: false,
    });
  }
  return slots;
}

function calculate(req, res) {
  try {
    const { date, event_type, janma_nakshatra, janma_rashi, partner_nakshatra, partner_rashi } = req.body;
    if (!date)       return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    if (!event_type) return res.status(400).json({ error: 'event_type is required' });
    if (!EVENTS[event_type]) return res.status(400).json({ error: 'Invalid event_type', valid: Object.keys(EVENTS) });

    if (janma_nakshatra && nakshatraIndex(janma_nakshatra) < 0) {
      return res.status(400).json({ error: 'Invalid janma_nakshatra', valid: NAKSHATRA_LIST });
    }
    if (janma_rashi && rashiIndex(janma_rashi) < 0) {
      return res.status(400).json({ error: 'Invalid janma_rashi', valid: RASHI_LIST });
    }
    if (partner_nakshatra && nakshatraIndex(partner_nakshatra) < 0) {
      return res.status(400).json({ error: 'Invalid partner_nakshatra', valid: NAKSHATRA_LIST });
    }
    if (partner_rashi && rashiIndex(partner_rashi) < 0) {
      return res.status(400).json({ error: 'Invalid partner_rashi', valid: RASHI_LIST });
    }

    const person = { janma_nakshatra, janma_rashi, partner_nakshatra, partner_rashi };
    const pd  = getPanchangData(date);
    const ev  = EVENTS[event_type];
    const scoring = scoreDay(pd, event_type, person);
    const choghadiya = buildChoghadiya(pd);
    const eventName = ev.label.split(' (')[0];
    const verdict = getVerdictMessage(scoring.score, eventName);
    const best_dates = scoring.score < 55
      ? findBestDates(event_type, date, 3, person)
      : findBestDates(event_type, date, 1, person);

    const auspSlots = choghadiya.filter(s =>
      ['Amrit','Shubh','Labh','Char'].includes(s.name) &&
      !s.isRahu && !s.isYamganda &&
      s.period === 'Day'
    );

    res.json({
      date,
      event_type,
      event_label: ev.label,
      event_icon:  ev.icon,
      verdict,
      best_dates,
      panchang: {
        vara:      pd.vara,
        varaLord:  pd.varaLord,
        tithi:     pd.tithi,
        nakshatra: pd.nakshatra,
        yoga:      pd.yoga,
        karana:    pd.karana,
        sunrise:   minToTime12(pd.srMin),
        sunset:    minToTime12(pd.ssMin),
      },
      scoring,
      bala: buildBalaSummary(pd),
      choghadiya,
      best_slots: auspSlots,
      notes: ev.notes,
      event_rules: {
        good_tithis:     ev.goodTithis,
        bad_tithis:      ev.badTithis,
        good_nakshatras: ev.goodNakshatras,
        bad_nakshatras:  ev.badNakshatras,
        good_varas:      ev.goodVaras,
        bad_varas:       ev.badVaras,
      },
    });
  } catch (err) {
    console.error('[muhurta]', err);
    res.status(500).json({ error: err.message || 'Muhurta calculation failed' });
  }
}

// List-first mode: "when should I do this?" rather than "is this date good?".
// Scans a window and returns the strongest dates, each with its auspicious
// daytime windows.
function bestDates(req, res) {
  try {
    const { event_type, from_date, janma_nakshatra, janma_rashi, partner_nakshatra, partner_rashi } = req.body;
    const count  = Math.min(Math.max(parseInt(req.body.count, 10) || 6, 1), 12);
    const months = Math.min(Math.max(parseInt(req.body.months, 10) || 4, 1), 12);

    if (!event_type) return res.status(400).json({ error: 'event_type is required' });
    if (!EVENTS[event_type]) return res.status(400).json({ error: 'Invalid event_type', valid: Object.keys(EVENTS) });
    if (janma_nakshatra && nakshatraIndex(janma_nakshatra) < 0) {
      return res.status(400).json({ error: 'Invalid janma_nakshatra', valid: NAKSHATRA_LIST });
    }
    if (janma_rashi && rashiIndex(janma_rashi) < 0) {
      return res.status(400).json({ error: 'Invalid janma_rashi', valid: RASHI_LIST });
    }
    if (partner_nakshatra && nakshatraIndex(partner_nakshatra) < 0) {
      return res.status(400).json({ error: 'Invalid partner_nakshatra', valid: NAKSHATRA_LIST });
    }
    if (partner_rashi && rashiIndex(partner_rashi) < 0) {
      return res.status(400).json({ error: 'Invalid partner_rashi', valid: RASHI_LIST });
    }

    const from   = from_date || new Date().toISOString().split('T')[0];
    const person = { janma_nakshatra, janma_rashi, partner_nakshatra, partner_rashi };
    const ev     = EVENTS[event_type];

    let dates = findBestDates(event_type, from, count, person, {
      windowDays: months * 30, rank: 'score', includeFromDate: true,
    });

    // Marriage in particular has long barren stretches (Chaturmas, Guru/Shukra
    // asta), and a personalised search rejects two-thirds more days. Rather than
    // return an empty list, widen the window once before giving up.
    let widened = false;
    if (dates.length < count) {
      widened = true;
      dates = findBestDates(event_type, from, count, person, {
        windowDays: 365, rank: 'score', includeFromDate: true,
      });
    }

    res.json({
      event_type,
      event_label: ev.label,
      event_icon:  ev.icon,
      from_date:   from,
      searched_days: widened ? 365 : months * 30,
      personalized: !!(nakshatraIndex(janma_nakshatra) >= 0 || rashiIndex(janma_rashi) >= 0
                    || nakshatraIndex(partner_nakshatra) >= 0 || rashiIndex(partner_rashi) >= 0),
      count: dates.length,
      dates,
      notes: ev.notes,
    });
  } catch (err) {
    console.error('[muhurta:bestDates]', err);
    res.status(500).json({ error: err.message || 'Muhurta date search failed' });
  }
}

function getEventTypes(req, res) {
  const types = Object.entries(EVENTS).map(([key, ev]) => ({
    key, label: ev.label, icon: ev.icon,
  }));
  res.json({
    event_types: types,
    nakshatras: NAKSHATRA_LIST,
    rashis: RASHI_LIST,
  });
}

module.exports = { calculate, bestDates, getEventTypes };
