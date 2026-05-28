'use strict';

// Vedic Astrology Kundali Engine
// Pure mathematical calculations - no AI
// Lahiri Ayanamsha | True Rahu/Ketu | Vimshottari Dasha | Navamsha D-9 | Panchang | Upgrahas

let sweph;
let useSweph = false;
try {
  sweph = require('sweph');
  useSweph = true;
} catch (e) {
  console.warn('[KundaliEngine] sweph not available, using JS fallback');
}

// Swiss Ephemeris constants
const SE_SUN = 0, SE_MOON = 1, SE_MERCURY = 2, SE_VENUS = 3, SE_MARS = 4;
const SE_JUPITER = 5, SE_SATURN = 6, SE_TRUE_NODE = 11;
const SE_FLG_SWIEPH = 2, SE_FLG_SPEED = 256, SE_FLG_SIDEREAL = 64 * 1024;
const SE_SIDM_LAHIRI = 1;

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
  'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

const PLANETS_LIST = [
  { id: SE_SUN,       name: 'Sun',     symbol: '☉' },
  { id: SE_MOON,      name: 'Moon',    symbol: '☽' },
  { id: SE_MARS,      name: 'Mars',    symbol: '♂' },
  { id: SE_MERCURY,   name: 'Mercury', symbol: '☿' },
  { id: SE_JUPITER,   name: 'Jupiter', symbol: '♃' },
  { id: SE_VENUS,     name: 'Venus',   symbol: '♀' },
  { id: SE_SATURN,    name: 'Saturn',  symbol: '♄' },
  { id: SE_TRUE_NODE, name: 'Rahu',    symbol: '☊' },
];

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

const NAKSHATRA_LORDS = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'
];

const DASHA_YEARS = { Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17 };
const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const TOTAL_DASHA_YEARS = 120;
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
const NAKSHATRA_SIZE_MIN = 800; // minutes of arc per nakshatra

const TITHI_NAMES = [
  'Shukla Pratipada','Shukla Dwitiya','Shukla Tritiya','Shukla Chaturthi','Shukla Panchami',
  'Shukla Shashthi','Shukla Saptami','Shukla Ashtami','Shukla Navami','Shukla Dashami',
  'Shukla Ekadashi','Shukla Dwadashi','Shukla Trayodashi','Shukla Chaturdashi','Purnima',
  'Krishna Pratipada','Krishna Dwitiya','Krishna Tritiya','Krishna Chaturthi','Krishna Panchami',
  'Krishna Shashthi','Krishna Saptami','Krishna Ashtami','Krishna Navami','Krishna Dashami',
  'Krishna Ekadashi','Krishna Dwadashi','Krishna Trayodashi','Krishna Chaturdashi','Amavasya'
];

const KARANA_CYCLIC = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];

const YOGA_NAMES = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda',
  'Sukarman','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata',
  'Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva',
  'Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'
];

const VAAR_NAMES = [
  'Ravivar (Sunday)','Somvar (Monday)','Mangalvar (Tuesday)',
  'Budhvar (Wednesday)','Guruvar (Thursday)','Shukravar (Friday)','Shanivar (Saturday)'
];

// Navamsha starting sign for each zodiac sign
// Chara (movable): Aries=0, Cancer=3, Libra=6, Capricorn=9 → start Aries (0)
// Sthira (fixed): Taurus=1, Leo=4, Scorpio=7, Aquarius=10 → start Capricorn (9)
// Dvishvabhava: Gemini=2, Virgo=5, Sagittarius=8, Pisces=11 → start Cancer (3)
const NAVAMSHA_START = [0, 9, 3, 0, 9, 3, 0, 9, 3, 0, 9, 3];

// Exaltation sign index (0 = Aries)
const EXALTATION = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6, Rahu:1, Ketu:7 };
const OWN_SIGNS = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5],
  Jupiter:[8,11], Venus:[1,6], Saturn:[9,10]
};

// Naisargika Bala (natural strength in Virupas)
const NAISARGIKA_BALA = { Sun:60, Moon:51.43, Venus:42.85, Jupiter:34.28, Mercury:25.71, Mars:17.14, Saturn:8.57 };

// Gulika hora index from sunrise for each weekday (0=Sun, 1=Mon...6=Sat)
// Based on the sequence: Saturn's hora position = [4,1,5,2,6,3,0]
const GULIKA_HORA_IDX = [4, 1, 5, 2, 6, 3, 0];

// ─── NAKSHATRA DESCRIPTIONS ─────────────────────────────────────────────────

const NAKSHATRA_DATA = {
  Ashwini:           { traits:['Pioneer','Adventurous','Energetic','Impulsive'], purpose:'To initiate, heal, and lead with speed and courage', swabhav:'You are a natural initiator, swift in action, with healing energy. Born to begin new ventures and inspire others through enthusiasm.' },
  Bharani:           { traits:['Intense','Creative','Sensual','Determined'], purpose:'To transform through discipline, creativity, and embracing life fully', swabhav:'You carry energy of creation and destruction. Born to experience life deeply and transform through disciplined effort.' },
  Krittika:          { traits:['Sharp','Purifying','Decisive','Perfectionistic'], purpose:'To cut through illusion and lead with clarity and inner fire', swabhav:'Sharp intellect and inner fire define you. Born to discern truth from illusion and nurture others with disciplined, purifying nature.' },
  Rohini:            { traits:['Artistic','Magnetic','Sensual','Nurturing'], purpose:'To cultivate beauty, abundance, and emotional depth', swabhav:'You are gifted with charm and magnetic presence. Born to create beauty and build lasting foundations.' },
  Mrigashira:        { traits:['Curious','Gentle','Searching','Adaptable'], purpose:'To seek knowledge, beauty, and spiritual truth through exploration', swabhav:'A restless, seeking spirit defines you. Born to explore, learn, and guide others toward truth.' },
  Ardra:             { traits:['Intense','Transformative','Intellectual','Destructive'], purpose:'To transform through storms and emerge with renewed wisdom', swabhav:"You carry Rudra's storm energy. Born to dismantle the old and create space for new growth." },
  Punarvasu:         { traits:['Generous','Philosophical','Optimistic','Restoring'], purpose:'To restore hope, spread wisdom, and return light after darkness', swabhav:'You carry energy of renewal. Born to restore hope and share wisdom generously.' },
  Pushya:            { traits:['Nurturing','Disciplined','Spiritual','Protective'], purpose:'To nourish, protect, and create structures that sustain others', swabhav:'The most nurturing of all nakshatras. Born to provide nourishment — emotional, material, and spiritual.' },
  Ashlesha:          { traits:['Mystical','Perceptive','Intense','Strategic'], purpose:'To master hidden knowledge and transform through depth of perception', swabhav:'You see what others cannot. Born to understand hidden truths and work with subtle energies.' },
  Magha:             { traits:['Regal','Proud','Traditional','Ancestral'], purpose:'To honor heritage, lead with authority, and connect past wisdom to future vision', swabhav:'You carry dignity of ancestors. Born to lead and be a bridge between lineage and the future.' },
  'Purva Phalguni':  { traits:['Creative','Romantic','Pleasure-seeking','Artistic'], purpose:'To create beauty, enjoy life, and inspire others through joy', swabhav:'You carry the blessing of Venus. Born to celebrate life and inspire joy through your magnetic presence.' },
  'Uttara Phalguni': { traits:['Generous','Service-oriented','Reliable','Cooperative'], purpose:'To serve, unite, and build lasting partnerships grounded in dharma', swabhav:'You carry energy of Aryaman, the divine friend. Born to serve and build genuine partnerships.' },
  Hasta:             { traits:['Skilled','Clever','Healing','Industrious'], purpose:'To manifest healing, craft, and divine service through skillful hands', swabhav:'Your hands carry healing power. Born to create, craft, and heal through practical, skillful work.' },
  Chitra:            { traits:['Creative','Artistic','Independent','Stylish'], purpose:'To create masterworks and express divine beauty in the material world', swabhav:'You carry the artisan spirit of Vishwakarma. Born to create beautiful, impactful works.' },
  Swati:             { traits:['Independent','Diplomatic','Flexible','Wandering'], purpose:'To seek freedom, spread ideas, and create connections across boundaries', swabhav:'Like a blade of grass in wind, you are resilient and adaptable. Born to build bridges between worlds.' },
  Vishakha:          { traits:['Goal-oriented','Intense','Determined','Competitive'], purpose:'To achieve, transform, and lead through unwavering purpose', swabhav:'You carry the fire of Indra and Agni. Born with burning ambition to achieve your divine purpose.' },
  Anuradha:          { traits:['Devoted','Friendly','Spiritually-inclined','Disciplined'], purpose:'To build sacred friendships and walk the path of devotion', swabhav:'Mithra guides you toward sacred friendship and loyalty. Born to build deep bonds.' },
  Jyeshtha:          { traits:['Protective','Leadership','Courageous','Eldest'], purpose:'To protect, lead, and bear responsibility with wisdom and courage', swabhav:'Indra, king of gods, rules your nakshatra. Born to be the protector and leader.' },
  Mula:              { traits:['Investigative','Destructive-creative','Philosophical','Seeking'], purpose:'To uproot and transform, destroying the false to reveal the eternal', swabhav:'Nirrti empowers you. Born to dig to the root of all things, revealing deep truths.' },
  'Purva Ashadha':   { traits:['Invincible','Proud','Philosophical','Expansive'], purpose:'To invigorate, purify, and lead others toward victory', swabhav:'Apah, cosmic waters, flow through you. Born to purify, invigorate, and lead.' },
  'Uttara Ashadha':  { traits:['Principled','Victorious','Leadership','Ethical'], purpose:'To achieve lasting victory through righteousness and universal principles', swabhav:'Vishvadevas bless you with universal principles. Born to achieve victory through ethics.' },
  Shravana:          { traits:['Listening','Learning','Connected','Compassionate'], purpose:'To listen, learn, and connect the teachings of the cosmos with humanity', swabhav:'Vishnu, the sustainer, blesses your path. Born to listen deeply and transmit wisdom.' },
  Dhanishtha:        { traits:['Wealthy','Musical','Generous','Ambitious'], purpose:'To create abundance, inspire through rhythm, and demonstrate cosmic law', swabhav:'Ashta Vasus bless you with rhythm and abundance. Born to manifest wealth and create music.' },
  Shatabhisha:       { traits:['Healing','Independent','Secretive','Scientific'], purpose:'To heal, discover hidden truths, and walk the path of the mystical healer', swabhav:'Varuna guides you. Born to uncover hidden truths and walk the solitary path of the mystic healer.' },
  'Purva Bhadrapada':{ traits:['Intense','Transformative','Philosophical','Spiritual'], purpose:'To transcend the material and serve the higher cosmic order', swabhav:'Aja Ekapad gives you cosmic fire. Born to transcend ordinary life with fierce devotion.' },
  'Uttara Bhadrapada':{ traits:['Wise','Compassionate','Deep','Spiritual'], purpose:'To bring depth, compassion, and cosmic wisdom to those in need', swabhav:'Ahir Budhnya grants profound depth. Born to understand life at its deepest level.' },
  Revati:            { traits:['Nourishing','Creative','Spiritual','Completing'], purpose:'To complete cycles, nourish souls, and guide beings toward liberation', swabhav:'Pushan, cosmic shepherd, guides you. Born to nourish and complete all cycles with love.' }
};

const LAGNA_DATA = {
  Aries:       { traits:['Dynamic','Courageous','Independent','Impulsive'], swabhav:'Your Aries ascendant gives you pioneering spirit and natural leadership — you thrive when blazing new trails.' },
  Taurus:      { traits:['Patient','Reliable','Sensual','Stubborn'], swabhav:'Your Taurus ascendant gives extraordinary persistence and gift for building lasting beauty and security.' },
  Gemini:      { traits:['Adaptable','Communicative','Curious','Restless'], swabhav:'Your Gemini ascendant gives a quick, versatile mind and gift of connecting ideas and people.' },
  Cancer:      { traits:['Intuitive','Nurturing','Emotional','Protective'], swabhav:'Your Cancer ascendant gives deep empathy and gift of creating emotional safety for those around you.' },
  Leo:         { traits:['Generous','Creative','Confident','Dramatic'], swabhav:'Your Leo ascendant gives natural charisma and generous heart — you were born to shine and uplift others.' },
  Virgo:       { traits:['Analytical','Precise','Service-oriented','Critical'], swabhav:'Your Virgo ascendant gives exceptional discernment and drive to serve — you improve everything you touch.' },
  Libra:       { traits:['Harmonious','Diplomatic','Aesthetic','Indecisive'], swabhav:'Your Libra ascendant gives gift for balance and beauty — born to create harmony and lasting partnerships.' },
  Scorpio:     { traits:['Intense','Transformative','Perceptive','Secretive'], swabhav:'Your Scorpio ascendant gives profound depth and power — you transform everything you encounter.' },
  Sagittarius: { traits:['Optimistic','Philosophical','Freedom-loving','Blunt'], swabhav:'Your Sagittarius ascendant gives boundless optimism and love of truth — born to inspire and expand horizons.' },
  Capricorn:   { traits:['Ambitious','Disciplined','Practical','Reserved'], swabhav:'Your Capricorn ascendant gives mountain-climber determination — you build empires through patience.' },
  Aquarius:    { traits:['Innovative','Humanitarian','Independent','Eccentric'], swabhav:'Your Aquarius ascendant gives visionary mind and heart for humanity — born to change the world.' },
  Pisces:      { traits:['Intuitive','Compassionate','Dreamy','Spiritual'], swabhav:'Your Pisces ascendant gives boundless compassion and spiritual depth — born to heal souls.' }
};

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

function norm360(d) { return ((d % 360) + 360) % 360; }

function degToHMS(deg) {
  const h = Math.floor(deg / 15);
  const m = Math.floor((deg / 15 - h) * 60);
  const s = Math.round(((deg / 15 - h) * 60 - m) * 60);
  return `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}

function degToDMS(deg) {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  const s = Math.round(((Math.abs(deg) - d) * 60 - m) * 60);
  return `${d}° ${String(m).padStart(2,'0')}' ${String(s).padStart(2,'0')}"`;
}

function getSignFromDegree(degree) {
  const idx = Math.floor(norm360(degree) / 30);
  return ZODIAC_SIGNS[idx];
}

function getSignIndex(degree) {
  return Math.floor(norm360(degree) / 30);
}

function julianDay(year, month, day, utcHour) {
  if (useSweph) {
    return sweph.julday(year, month, day, utcHour, 1);
  }
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y
          + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn - 0.5 + utcHour / 24;
}

// ─── NAKSHATRA ───────────────────────────────────────────────────────────────

function getNakshatra(degree) {
  const norm = norm360(degree);
  const span = 360 / 27; // 13.333...
  const idx = Math.floor(norm / span);
  const degInNak = norm - idx * span;
  const pada = Math.floor(degInNak / (span / 4)) + 1;
  const remainingDeg = span - degInNak;
  return {
    index: idx,
    name: NAKSHATRA_NAMES[idx] || 'Ashwini',
    lord: NAKSHATRA_LORDS[idx] || 'Ketu',
    pada: Math.min(pada, 4),
    remaining_deg: parseFloat(remainingDeg.toFixed(4)),
    remaining_min: parseFloat((remainingDeg * 60).toFixed(2))
  };
}

// ─── DIVISIONAL CHARTS ──────────────────────────────────────────────────────

function getNavamsha(degree) {
  const norm = norm360(degree);
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const navPart = Math.floor(degInSign * 9 / 30);
  const navSignIdx = (NAVAMSHA_START[signIdx] + navPart) % 12;
  return { sign: ZODIAC_SIGNS[navSignIdx], sign_index: navSignIdx, part: navPart + 1 };
}

function getHora(degree) {
  const norm = norm360(degree);
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const isOddSign = signIdx % 2 === 0; // 0=Aries=odd, 1=Taurus=even
  const isFirstHalf = degInSign < 15;
  let horaSign;
  if (isOddSign) {
    horaSign = isFirstHalf ? 4 : 3; // Leo or Cancer
  } else {
    horaSign = isFirstHalf ? 3 : 4; // Cancer or Leo
  }
  return { sign: ZODIAC_SIGNS[horaSign], sign_index: horaSign, lord: SIGN_LORDS[horaSign] };
}

function getDrekkana(degree) {
  const norm = norm360(degree);
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const part = Math.floor(degInSign / 10); // 0, 1, 2
  const drekSignIdx = (signIdx + part * 4) % 12;
  return { sign: ZODIAC_SIGNS[drekSignIdx], sign_index: drekSignIdx, part: part + 1 };
}

function getDashamsha(degree) {
  const norm = norm360(degree);
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const part = Math.floor(degInSign / 3); // 0-9
  const isOddSign = signIdx % 2 === 0;
  const startSign = isOddSign ? signIdx : (signIdx + 8) % 12;
  const dashSignIdx = (startSign + part) % 12;
  return { sign: ZODIAC_SIGNS[dashSignIdx], sign_index: dashSignIdx, part: part + 1 };
}

function getSaptamsha(degree) {
  const norm = norm360(degree);
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const part = Math.floor(degInSign * 7 / 30);
  const isOddSign = signIdx % 2 === 0;
  const startSign = isOddSign ? signIdx : (signIdx + 6) % 12;
  const septSignIdx = (startSign + part) % 12;
  return { sign: ZODIAC_SIGNS[septSignIdx], sign_index: septSignIdx, part: part + 1 };
}

// ─── PANCHANG ────────────────────────────────────────────────────────────────

function getTithi(sunLon, moonLon) {
  const diff = norm360(moonLon - sunLon);
  const tithiNum = Math.floor(diff / 12); // 0-29
  const withinTithi = diff % 12;
  const paksha = tithiNum < 15 ? 'Shukla' : 'Krishna';
  return {
    number: tithiNum + 1,
    name: TITHI_NAMES[tithiNum],
    paksha,
    completion_pct: parseFloat(((withinTithi / 12) * 100).toFixed(1))
  };
}

function getKarana(sunLon, moonLon) {
  const diff = norm360(moonLon - sunLon);
  const karanaNum = Math.floor(diff / 6); // 0-59
  let name;
  if (karanaNum === 0) {
    name = 'Kinstughna';
  } else if (karanaNum === 57) {
    name = 'Shakuni';
  } else if (karanaNum === 58) {
    name = 'Chatushpada';
  } else if (karanaNum === 59) {
    name = 'Naga';
  } else {
    name = KARANA_CYCLIC[(karanaNum - 1) % 7];
  }
  return { number: karanaNum + 1, name };
}

function getYoga(sunLon, moonLon) {
  const sum = norm360(sunLon + moonLon);
  const yogaNum = Math.floor(sum / (360 / 27)); // 0-26
  return { number: yogaNum + 1, name: YOGA_NAMES[yogaNum] };
}

function getVaar(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  return { number: d.getUTCDay(), name: VAAR_NAMES[d.getUTCDay()] };
}

// ─── UPGRAHAS (SHADOW PLANETS) ───────────────────────────────────────────────

function calcUpgrahas(sunLon, weekdayNum, jd, lat, lng, ayanamsa) {
  const dhuma    = norm360(sunLon + 133.333);
  const vyatipata = norm360(360 - dhuma);
  const paridhi  = norm360(vyatipata + 180);
  const indrachapa = norm360(360 - paridhi);
  const upketu   = norm360(indrachapa + 16.667);

  // Gulika: ASC at Saturn's hora time
  // Sunrise ≈ 6 AM local. Each hora = 12h/8 = 90 min
  const gulikaHoraIdx = GULIKA_HORA_IDX[weekdayNum];
  const gulikaLocalHour = 6 + gulikaHoraIdx * 1.5; // approximate
  // Mandi = hora before Gulika
  const mandiLocalHour = 6 + Math.max(0, gulikaHoraIdx - 1) * 1.5;

  let gulikaLon = norm360(sunLon + 133.333 + 60); // approximate if no houses
  let mandiLon = norm360(gulikaLon - 15);

  if (useSweph) {
    try {
      // Calculate JD for Gulika time (approximate: same day, gulikaLocalHour as local time)
      // We only have UTC JD; approximate: shift JD by (gulikaLocalHour - birthLocalHour)
      // Since we don't have exact birth local hour here, use a reasonable estimate
      // Instead, use the change in ASC: approx 1° per 4 minutes = 15° per hour
      // Gulika lon = birthASC + (gulikaLocalHour - birthLocalHour) * 15 ... but we don't have birthLocalHour
      // Just compute houses at gulikaJD:
      const tzOffset = Math.round(lng / 15 * 2) / 2; // rough offset
      const gulikaUtcHour = gulikaLocalHour - tzOffset;
      const [yr, mo, dy] = [Math.floor((jd - 1721118.5) / 365.25 + 1970), 0, 0]; // approximate; skip
      // Simpler: shift original JD by required hours
      const gulikaJD = jd + (gulikaLocalHour - 12) / 24; // shift from noon
      const gulikaHouses = sweph.houses(gulikaJD, lat, lng, 'W');
      const rawAsc = gulikaHouses.data ? gulikaHouses.data.points[0] : (gulikaHouses.ascmc ? gulikaHouses.ascmc[0] : 0);
      gulikaLon = norm360(rawAsc - ayanamsa);

      const mandiJD = jd + (mandiLocalHour - 12) / 24;
      const mandiHouses = sweph.houses(mandiJD, lat, lng, 'W');
      const rawAscM = mandiHouses.data ? mandiHouses.data.points[0] : (mandiHouses.ascmc ? mandiHouses.ascmc[0] : 0);
      mandiLon = norm360(rawAscM - ayanamsa);
    } catch (e) {
      // use approximate values already set
    }
  }

  const makePoint = (lon) => ({
    degree: parseFloat(lon.toFixed(4)),
    sign: getSignFromDegree(lon),
    sign_index: getSignIndex(lon),
    sign_degree: parseFloat((lon % 30).toFixed(2))
  });

  return {
    Dhuma:      makePoint(dhuma),
    Vyatipata:  makePoint(vyatipata),
    Paridhi:    makePoint(paridhi),
    Indrachapa: makePoint(indrachapa),
    Upketu:     makePoint(upketu),
    Gulika:     makePoint(gulikaLon),
    Mandi:      makePoint(mandiLon)
  };
}

// ─── SIDEREAL TIME OF BIRTH ──────────────────────────────────────────────────

function calcSiderealTime(jd, lng, lmtHour, lmtMin) {
  // GMST at birth (degrees)
  const gmst = norm360(280.46061837 + 360.98564736629 * (jd - J2000));
  // LMST = GMST + observer longitude
  const lmst = norm360(gmst + lng);

  // Convert to h m s
  const lmstH = lmst / 15; // degrees → hours
  const h = Math.floor(lmstH);
  const m = Math.floor((lmstH - h) * 60);
  const s = Math.round(((lmstH - h) * 60 - m) * 60);

  // Traditional step display (from research):
  // interval from LMT noon + 10 sec/hour sidereal acceleration
  const lmtDecimal = lmtHour + lmtMin / 60;
  const intervalFromNoon = lmtDecimal - 12; // hours since local noon
  const accelSec = intervalFromNoon * 10;   // 10 seconds per hour

  return {
    gmst_degrees: parseFloat(gmst.toFixed(6)),
    lmst_degrees: parseFloat(lmst.toFixed(6)),
    lmst_time: `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`,
    interval_from_noon_hrs: parseFloat(intervalFromNoon.toFixed(4)),
    sidereal_acceleration_sec: parseFloat(accelSec.toFixed(2)),
    note: 'LMST used as Sidereal Time at birth moment for Ascendant calculation'
  };
}

// ─── BHAVA BALA (HOUSE STRENGTH) ─────────────────────────────────────────────
// Three components: Bhavadhipati + Bhava Digbala + Bhava Drishti Bala

function calcBhavaBala(planetaryPositions, lagnaSignIdx, shadbala) {
  const BENEFICS  = new Set(['Jupiter','Venus','Moon','Mercury']);
  const MALEFICS  = new Set(['Sun','Mars','Saturn','Rahu','Ketu']);
  // Additional special aspects beyond the universal 7th
  const EXTRA_ASPECTS = {
    Mars:    [90, 210],  // 4th and 8th from Mars
    Jupiter: [120, 240], // 5th and 9th from Jupiter
    Saturn:  [60, 270]   // 3rd and 10th from Saturn
  };

  const result = {};

  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const signIdx = (lagnaSignIdx + houseNum - 1) % 12;
    const lord    = SIGN_LORDS[signIdx];

    // House midpoint (used for Drishti Bala)
    const midpoint = signIdx * 30 + 15; // degrees

    // ── 1. Bhavadhipati Bala: proportional to lord's Shadbala total ──
    const lordTotal = shadbala[lord]?.total || 10;
    const bhavadhipatiBala = parseFloat((lordTotal * 0.5).toFixed(2));

    // ── 2. Bhava Digbala: sign type × house type ──
    const isChara = [0,3,6,9].includes(signIdx);  // movable
    const isSthira = [1,4,7,10].includes(signIdx); // fixed
    // dual = everything else (Gemini,Virgo,Sag,Pisces)
    const isAngular   = [1,4,7,10].includes(houseNum);  // Kendra
    const isSuccedent = [2,5,8,11].includes(houseNum);  // Panapara
    const isCadent    = [3,6,9,12].includes(houseNum);  // Apoklima

    let digBala = 5; // neutral
    if ((isChara && isAngular) || (isSthira && isSuccedent) || (!isChara && !isSthira && isCadent)) {
      digBala = 10; // sign type naturally strong in this house type
    } else if ((isChara && isCadent) || (isSthira && isAngular) || (!isChara && !isSthira && isSuccedent)) {
      digBala = 2;  // weak placement
    }

    // ── 3. Bhava Drishti Bala: net aspect strength on house midpoint ──
    let drishtiScore = 0;
    for (const [pName, pos] of Object.entries(planetaryPositions)) {
      if (pos.degree === undefined) continue;
      const deg = pos.degree;

      // Build all aspect degrees for this planet
      const aspectDegs = [norm360(deg + 180)]; // universal 7th aspect
      (EXTRA_ASPECTS[pName] || []).forEach(off => aspectDegs.push(norm360(deg + off)));

      const isBenefic = BENEFICS.has(pName);
      const isMalefic = MALEFICS.has(pName);

      for (const asDeg of aspectDegs) {
        const diff = Math.abs(norm360(asDeg - midpoint));
        const angDiff = Math.min(diff, 360 - diff);
        if (angDiff <= 15) {       // full aspect (within ½ sign)
          drishtiScore += isBenefic ? 6 : (isMalefic ? -4 : 2);
        } else if (angDiff <= 30) { // partial (within 1 sign)
          drishtiScore += isBenefic ? 2 : (isMalefic ? -1 : 1);
        }
      }
    }
    const bhavaDrishti = parseFloat(Math.max(0, 5 + drishtiScore).toFixed(2));

    const total = parseFloat((bhavadhipatiBala + digBala + bhavaDrishti).toFixed(2));

    result[houseNum] = {
      sign:       ZODIAC_SIGNS[signIdx],
      lord,
      house_type: isAngular ? 'Kendra (Angular)' : isSuccedent ? 'Panapara (Succedent)' : 'Apoklima (Cadent)',
      bhavadhipati: bhavadhipatiBala,
      digbala:      digBala,
      drishti:      bhavaDrishti,
      total,
      strength:     total >= 25 ? 'Strong' : total >= 15 ? 'Medium' : 'Weak'
    };
  }

  return result;
}

// ─── SHADBALA (SIMPLIFIED) ───────────────────────────────────────────────────

function calcShadbala(planetPositions, houseCusps, lagnaSignIdx) {
  const result = {};
  const planetsForBala = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

  for (const pName of planetsForBala) {
    const pos = planetPositions[pName];
    if (!pos) continue;
    const signIdx = pos.sign_index;
    let sthanaBala = 5; // neutral base

    // Sthana Bala
    if (EXALTATION[pName] === signIdx) sthanaBala = 20;
    else if (OWN_SIGNS[pName] && OWN_SIGNS[pName].includes(signIdx)) sthanaBala = 15;
    else if ((EXALTATION[pName] + 6) % 12 === signIdx) sthanaBala = 0; // debilitation

    // Dig Bala (directional strength) — planets prefer certain angular houses
    const digPref = { Sun:9, Moon:3, Mars:9, Mercury:0, Jupiter:0, Venus:3, Saturn:6 }; // house index (0-based)
    const houseNum = ((signIdx - lagnaSignIdx + 12) % 12); // 0-based
    const distFromPref = Math.min(Math.abs(houseNum - digPref[pName]), 12 - Math.abs(houseNum - digPref[pName]));
    const digBala = Math.max(0, 10 - distFromPref * 10 / 6);

    // Naisargika Bala
    const naisargika = NAISARGIKA_BALA[pName] || 0;

    // Chesta Bala (motional) — retrograde planets have more chesta bala
    const chestaBala = pos.retrograde ? 30 : (pos.speed > 0.5 ? 15 : 10);

    const total = parseFloat((sthanaBala + digBala + naisargika * 0.1 + chestaBala * 0.2).toFixed(2));

    result[pName] = {
      sthana: sthanaBala,
      dig: parseFloat(digBala.toFixed(2)),
      naisargika: naisargika,
      chesta: chestaBala,
      total,
      strength: total >= 20 ? 'Strong' : total >= 12 ? 'Medium' : 'Weak'
    };
  }
  return result;
}

// ─── VIMSHOTTARI DASHA ───────────────────────────────────────────────────────

function calcDashas(nakshatra, birthDate) {
  const lord = nakshatra.lord;
  const lordIdx = DASHA_ORDER.indexOf(lord);
  const nakshatraSpanDeg = 360 / 27;

  // Remaining arc in nakshatra = remaining_deg of moon in nakshatra
  const remainingDeg = nakshatra.remaining_deg;
  const completedFrac = 1 - (remainingDeg / nakshatraSpanDeg);

  // Dasha balance: completed fraction of first lord's dasha
  const firstDashaYears = DASHA_YEARS[lord];
  const completedYears = firstDashaYears * completedFrac;

  const dashas = [];
  let cur = new Date(new Date(birthDate).getTime() - completedYears * MS_PER_YEAR);

  for (let i = 0; i < 9; i++) {
    const planet = DASHA_ORDER[(lordIdx + i) % 9];
    const mahaYears = DASHA_YEARS[planet];
    const start = new Date(cur);
    const end = new Date(cur.getTime() + mahaYears * MS_PER_YEAR);

    const antardashas = [];
    let ac = new Date(start);
    for (let j = 0; j < 9; j++) {
      const antarPlanet = DASHA_ORDER[((lordIdx + i) + j) % 9];
      const antarMs = (mahaYears * DASHA_YEARS[antarPlanet] / TOTAL_DASHA_YEARS) * MS_PER_YEAR;
      const aStart = new Date(ac);
      const aEnd = new Date(ac.getTime() + antarMs);
      antardashas.push({
        planet: antarPlanet,
        start: aStart.toISOString().split('T')[0],
        end: aEnd.toISOString().split('T')[0],
        years: parseFloat((mahaYears * DASHA_YEARS[antarPlanet] / TOTAL_DASHA_YEARS).toFixed(2))
      });
      ac = aEnd;
    }

    dashas.push({
      planet, years: mahaYears,
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      antardashas
    });
    cur = end;
  }

  return {
    sequence: dashas,
    balance: {
      planet: lord,
      remaining_years: parseFloat((firstDashaYears - completedYears).toFixed(2)),
      remaining_months: parseFloat(((firstDashaYears - completedYears) * 12).toFixed(1))
    }
  };
}

// ─── JS FALLBACK CALCULATIONS ────────────────────────────────────────────────

const J2000 = 2451545.0;

function getLahiriAyanamsa(jd) {
  const T = (jd - J2000) / 36525;
  return 23.85 + T * 50.3 / 3600; // approximate Lahiri
}

function calcPlanetFallback(jd, planetId) {
  const T = (jd - J2000) / 36525;
  const ayanamsa = getLahiriAyanamsa(jd);
  const meanMotions = {
    [SE_SUN]:       { L0:280.46646,  rate:36000.76983 },
    [SE_MOON]:      { L0:218.3165,   rate:481267.8813 },
    [SE_MERCURY]:   { L0:252.2509,   rate:149472.6674 },
    [SE_VENUS]:     { L0:181.9798,   rate:58517.8157  },
    [SE_MARS]:      { L0:355.433,    rate:19140.2993  },
    [SE_JUPITER]:   { L0:34.351519,  rate:3034.9057   },
    [SE_SATURN]:    { L0:50.077444,  rate:1222.1138   },
    [SE_TRUE_NODE]: { L0:125.04452,  rate:-1934.136261 }
  };
  const m = meanMotions[planetId] || meanMotions[SE_SUN];
  const lon = norm360(m.L0 + m.rate * T - ayanamsa);
  const speed = m.rate / 36525; // degrees per day
  return { longitude: lon, speed };
}

function calcAscFallback(jd, lat, lng) {
  const T = (jd - J2000) / 36525;
  const ayanamsa = getLahiriAyanamsa(jd);
  let GMST = norm360(280.46061837 + 360.98564736629 * (jd - J2000));
  const LMST = norm360(GMST + lng);
  const eps = 23.439 - 0.013 * T;
  const latRad = lat * Math.PI / 180;
  const epsRad = eps * Math.PI / 180;
  const ramcRad = LMST * Math.PI / 180;
  let ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
  );
  let asc = norm360(ascRad * 180 / Math.PI - ayanamsa);
  return { ascendant: asc, ayanamsa };
}

// ─── LMT INFO (display only, calculation handled by sweph) ───────────────────

function calcLMTInfo(stdMeridian, birthLng, hour, min, tzOffset) {
  const lngDiff = birthLng - stdMeridian;
  const lmtCorrMin = lngDiff * 4; // minutes (positive = East = add, negative = West = subtract)
  const birthTotalMin = hour * 60 + min;
  const lmtTotalMin = birthTotalMin + lmtCorrMin;
  const lmtH = Math.floor(((lmtTotalMin % 1440) + 1440) % 1440 / 60);
  const lmtM = Math.floor(((lmtTotalMin % 1440) + 1440) % 1440 % 60);
  return {
    standard_meridian: stdMeridian,
    birth_longitude: parseFloat(birthLng.toFixed(4)),
    longitude_diff: parseFloat(lngDiff.toFixed(4)),
    lmt_correction_min: parseFloat(lmtCorrMin.toFixed(2)),
    lmt_correction_display: `${Math.abs(lmtCorrMin) >= 1 ? Math.floor(Math.abs(lmtCorrMin)) + 'm ' : ''}${Math.round((Math.abs(lmtCorrMin) % 1) * 60)}s ${lmtCorrMin >= 0 ? 'added' : 'subtracted'}`,
    lmt: `${String(lmtH).padStart(2,'0')}:${String(lmtM).padStart(2,'0')}`
  };
}

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────

async function calculateKundali(dob, birth_time, lat, lng, timezone) {
  const [year, month, day] = dob.split('-').map(Number);
  const [hour, min] = (birth_time || '12:00').split(':').map(Number);
  const tzOffset = timezone !== undefined ? parseFloat(timezone) : 5.5;
  const utcHour = hour + min / 60 - tzOffset;
  const jd = julianDay(year, month, day, utcHour);

  // Standard meridian for IST; generalize by rounding timezone to nearest 15° meridian
  const stdMeridian = tzOffset * 15;
  const lmtInfo = calcLMTInfo(stdMeridian, lng, hour, min, tzOffset);
  const vaarData = getVaar(year, month, day);

  let planetaryPositions = {};
  let houseCusps = {};
  let ascDeg;
  let ayanamsaValue;

  if (useSweph) {
    try {
      sweph.set_sid_mode(SE_SIDM_LAHIRI, 0, 0);
      ayanamsaValue = sweph.get_ayanamsa_ut(jd);
      const flagSidereal = SE_FLG_SWIEPH | SE_FLG_SIDEREAL | SE_FLG_SPEED;

      for (const p of PLANETS_LIST) {
        const res = sweph.calc_ut(jd, p.id, flagSidereal);
        const rawDeg = res.data ? res.data[0] : res.longitude;
        const speed  = res.data ? res.data[3] : (res.longitudeSpeed || 0);
        const deg = norm360(rawDeg);
        const signIdx = getSignIndex(deg);
        const nak = getNakshatra(deg);
        planetaryPositions[p.name] = {
          degree: parseFloat(deg.toFixed(4)),
          sign: ZODIAC_SIGNS[signIdx],
          sign_index: signIdx,
          sign_degree: parseFloat((deg % 30).toFixed(4)),
          retrograde: speed < 0,
          speed: parseFloat(speed.toFixed(6)),
          symbol: p.symbol,
          nakshatra: nak.name,
          nakshatra_pada: nak.pada,
          nakshatra_lord: nak.lord
        };
      }

      // Whole Sign houses (W), then apply ayanamsa to tropical cusps
      const hr = sweph.houses(jd, lat, lng, 'W');
      const rawCusps = hr.data ? hr.data.houses : hr.cusps;
      const rawAsc   = hr.data ? hr.data.points[0] : (hr.ascmc ? hr.ascmc[0] : hr.ascendant);
      ascDeg = norm360(rawAsc - ayanamsaValue);

      for (let i = 1; i <= 12; i++) {
        const cDeg = norm360(rawCusps[i-1] - ayanamsaValue);
        const signIdx = getSignIndex(cDeg);
        houseCusps[`H${i}`] = {
          degree: parseFloat(cDeg.toFixed(4)),
          sign: ZODIAC_SIGNS[signIdx],
          sign_index: signIdx
        };
      }
    } catch (e) {
      useSweph = false;
      console.warn('[KundaliEngine] sweph runtime error:', e.message);
    }
  }

  if (!useSweph) {
    ayanamsaValue = getLahiriAyanamsa(jd);
    for (const p of PLANETS_LIST) {
      const res = calcPlanetFallback(jd, p.id);
      const deg = res.longitude;
      const signIdx = getSignIndex(deg);
      const nak = getNakshatra(deg);
      planetaryPositions[p.name] = {
        degree: parseFloat(deg.toFixed(4)),
        sign: ZODIAC_SIGNS[signIdx],
        sign_index: signIdx,
        sign_degree: parseFloat((deg % 30).toFixed(4)),
        retrograde: res.speed < 0,
        speed: parseFloat(res.speed.toFixed(6)),
        symbol: p.symbol,
        nakshatra: nak.name,
        nakshatra_pada: nak.pada,
        nakshatra_lord: nak.lord
      };
    }
    const asc = calcAscFallback(jd, lat, lng);
    ascDeg = asc.ascendant;
    const lagnaSignIdx = getSignIndex(ascDeg);
    for (let i = 0; i < 12; i++) {
      const cIdx = (lagnaSignIdx + i) % 12;
      const cDeg = cIdx * 30 + (ascDeg % 30);
      houseCusps[`H${i+1}`] = {
        degree: parseFloat(norm360(cDeg).toFixed(4)),
        sign: ZODIAC_SIGNS[cIdx],
        sign_index: cIdx
      };
    }
  }

  // Add Ketu (True South Node = Rahu + 180°)
  const rahuDeg = planetaryPositions['Rahu'].degree;
  const ketuDeg = norm360(rahuDeg + 180);
  const ketuSignIdx = getSignIndex(ketuDeg);
  const ketuNak = getNakshatra(ketuDeg);
  planetaryPositions['Ketu'] = {
    degree: parseFloat(ketuDeg.toFixed(4)),
    sign: ZODIAC_SIGNS[ketuSignIdx],
    sign_index: ketuSignIdx,
    sign_degree: parseFloat((ketuDeg % 30).toFixed(4)),
    retrograde: true, // Ketu always retrograde by convention
    speed: planetaryPositions['Rahu'].speed,
    symbol: '☋',
    nakshatra: ketuNak.name,
    nakshatra_pada: ketuNak.pada,
    nakshatra_lord: ketuNak.lord
  };

  // Lagna details
  const lagnaSignIdx = getSignIndex(ascDeg);
  const lagna = ZODIAC_SIGNS[lagnaSignIdx];
  const lagnaData = LAGNA_DATA[lagna] || LAGNA_DATA['Aries'];

  // Moon-based calculations
  const moonDeg = planetaryPositions['Moon'].degree;
  const moonNakshatra = getNakshatra(moonDeg);
  const moonSign = planetaryPositions['Moon'].sign;
  const sunSign = planetaryPositions['Sun'].sign;

  // House planet assignments (Whole Sign: each house = 1 sign)
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  const planetOrder = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  for (const pName of planetOrder) {
    const pos = planetaryPositions[pName];
    if (!pos) continue;
    const houseNum = ((pos.sign_index - lagnaSignIdx + 12) % 12) + 1;
    planetaryPositions[pName].house = houseNum;
    housePlanets[houseNum].push(pName);
  }

  // House lord assignments
  const houseLords = {};
  for (let i = 1; i <= 12; i++) {
    const hSignIdx = (lagnaSignIdx + i - 1) % 12;
    houseLords[i] = SIGN_LORDS[hSignIdx];
  }

  // Divisional charts for all planets
  const divCharts = { navamsha: {}, hora: {}, drekkana: {}, dashamsha: {}, saptamsha: {} };
  for (const pName of planetOrder) {
    const deg = planetaryPositions[pName]?.degree;
    if (deg === undefined) continue;
    divCharts.navamsha[pName]   = getNavamsha(deg);
    divCharts.hora[pName]       = getHora(deg);
    divCharts.drekkana[pName]   = getDrekkana(deg);
    divCharts.dashamsha[pName]  = getDashamsha(deg);
    divCharts.saptamsha[pName]  = getSaptamsha(deg);
  }
  // Navamsha & Saptamsha Lagna
  divCharts.navamsha['Lagna']  = getNavamsha(ascDeg);
  divCharts.saptamsha['Lagna'] = getSaptamsha(ascDeg);

  // Panchang
  const sunLon = planetaryPositions['Sun'].degree;
  const panchang = {
    tithi: getTithi(sunLon, moonDeg),
    karana: getKarana(sunLon, moonDeg),
    yoga: getYoga(sunLon, moonDeg),
    nakshatra: { name: moonNakshatra.name, pada: moonNakshatra.pada, lord: moonNakshatra.lord },
    vaar: vaarData
  };

  // Upgrahas
  const upgrahas = calcUpgrahas(sunLon, vaarData.number, jd, lat, lng, ayanamsaValue);

  // Dasha
  const dashResult = calcDashas(moonNakshatra, dob);

  // Shadbala
  const shadbala = calcShadbala(planetaryPositions, houseCusps, lagnaSignIdx);

  // Bhava Bala (house strength) — requires shadbala first
  const bhavaBala = calcBhavaBala(planetaryPositions, lagnaSignIdx, shadbala);

  // Sidereal Time of Birth
  const lmtHour = hour + lmtInfo.lmt_correction_min / 60;
  const lmtMin  = ((lmtHour % 1) * 60 + 60) % 60;
  const siderealTime = calcSiderealTime(jd, lng, Math.floor(lmtHour), Math.round(lmtMin));

  // Personality
  const nakshatraInfo = NAKSHATRA_DATA[moonNakshatra.name] || {
    traits:['Wise','Intuitive','Purposeful'], purpose:'Dharmic service and inner wisdom',
    swabhav:'You carry deep cosmic purpose guided by inner wisdom.'
  };

  return {
    // Identity
    lagna, lagna_sign_index: lagnaSignIdx,
    lagna_degree: parseFloat(ascDeg.toFixed(4)),
    moon_sign: moonSign, moon_sign_index: planetaryPositions['Moon'].sign_index,
    sun_sign: sunSign, sun_sign_index: planetaryPositions['Sun'].sign_index,
    nakshatra: moonNakshatra.name,
    nakshatra_pada: moonNakshatra.pada,
    nakshatra_lord: moonNakshatra.lord,

    // Positions
    planetary_positions: planetaryPositions,
    house_cusps: houseCusps,
    house_planets: housePlanets,
    house_lords: houseLords,

    // Divisional charts
    divisional_charts: divCharts,

    // Panchang
    panchang,

    // Upgrahas
    upgrahas,

    // Dasha
    dasha_sequence: dashResult.sequence,
    dasha_balance: dashResult.balance,

    // Strength
    shadbala,
    bhava_bala: bhavaBala,

    // Technical info
    sidereal_time: siderealTime,
    ayanamsha: {
      value: parseFloat(ayanamsaValue.toFixed(6)),
      name: 'Lahiri (Chitrapaksha)',
      dms: degToDMS(ayanamsaValue)
    },
    lmt_info: lmtInfo,
    julian_day: parseFloat(jd.toFixed(6)),

    // Personality
    personality_traits: {
      nakshatra_traits: nakshatraInfo.traits,
      lagna_traits: lagnaData.traits,
      combined_traits: [...new Set([...nakshatraInfo.traits, ...lagnaData.traits])].slice(0, 8)
    },
    life_purpose: nakshatraInfo.purpose,
    swabhav: nakshatraInfo.swabhav + ' ' + lagnaData.swabhav
  };
}

// ─── JAIMINI SYSTEM ──────────────────────────────────────────────────────────
function calcJaimini(planetaryPositions, divisionalCharts) {
  try {
    // 1. Chara Karakas: rank Sun/Moon/Mars/Merc/Jupiter/Venus/Saturn by degree within sign (desc)
    //    Rahu/Ketu excluded; use sign_degree field (degree within the sign)
    const KARAKA_PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
    const KARAKA_NAMES   = ['आत्मकारक','अमात्यकारक','भ्राति‌कारक','मातृकारक','पितृकारक','पुत्रकारक','दाराकारक'];
    const KARAKA_EN      = ['Atmakaraka','Amatyakaraka','Bhratrikaraka','Matrikaraka','Pitrikaraka','Putrakaraka','Darakaraka'];

    const ranked = KARAKA_PLANETS
      .filter(p => planetaryPositions[p])
      .map(p => ({
        planet: p,
        deg: planetaryPositions[p].sign_degree ?? (planetaryPositions[p].degree % 30)
      }))
      .sort((a, b) => b.deg - a.deg);

    const charaKarakas = ranked.map((item, i) => ({
      planet:   item.planet,
      degree:   parseFloat(item.deg.toFixed(4)),
      karaka:   KARAKA_EN[i]    || '',
      karaka_hi: KARAKA_NAMES[i] || '',
    }));

    const atmakaraka = charaKarakas[0]?.planet || null;

    // 2. Karakamsha: Navamsha sign of Atmakaraka
    let karakamsha = null;
    if (atmakaraka && divisionalCharts?.navamsha?.[atmakaraka]) {
      karakamsha = divisionalCharts.navamsha[atmakaraka].sign || null;
    }

    // 3. Swamsha: house position of Karakamsha sign from Lagna in Rashi chart
    //    (same sign as Karakamsha but in Rashi chart)
    let swamsha = karakamsha; // Swamsha sign = Karakamsha sign

    // 4. Chara Dasha: Jaimini sign-based dasha
    //    Starting sign = Lagna sign
    //    Odd sign: dasha years = (12 - sign_lord_rashi_degree_in_sign) rounded
    //    Even sign: dasha years = sign_lord_rashi_degree_in_sign rounded
    //    Each sign's dasha in years (1-12), sum = 144 or variable
    //    Simplified standard method:
    //    - For odd signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius): count from sign to sign lord forwards
    //    - For even signs: count backwards
    //    Standard simplified: use fixed Chara Dasha sequence with 12-year cycle

    // Simplified Chara Dasha starting from Lagna sign
    // Dasha periods based on sign lordships and planetary degrees
    const lagnaSignIdx = planetaryPositions['Lagna']
      ? ZODIAC_SIGNS.indexOf(planetaryPositions['Lagna'].sign)
      : null;

    // Compute Chara Dasha years per sign using standard formula
    const charaDashas = [];
    for (let i = 0; i < 12; i++) {
      const signIdx = i;
      const sign = ZODIAC_SIGNS[signIdx];
      const lordPlanet = SIGN_LORDS[signIdx];
      const lordPos = planetaryPositions[lordPlanet];

      let years;
      if (lordPos) {
        const lordSignDeg = lordPos.sign_degree ?? (lordPos.degree % 30);
        const isOddSign = signIdx % 2 === 0; // 0=Aries=odd, 1=Taurus=even (0-indexed)
        if (isOddSign) {
          years = Math.round(lordSignDeg); // simplified
          if (years < 1) years = 1;
          if (years > 12) years = 12;
        } else {
          years = Math.round(30 - lordSignDeg);
          if (years < 1) years = 1;
          if (years > 12) years = 12;
        }
      } else {
        years = 7; // default
      }
      charaDashas.push({ sign, sign_index: signIdx, years, lord: lordPlanet });
    }

    return { charaKarakas, atmakaraka, karakamsha, swamsha, charaDashas };
  } catch (e) {
    console.error('[calcJaimini]', e.message);
    return null;
  }
}

// ─── KP METHOD (KRISHNAMURTHY PADDHATI) ──────────────────────────────────────
function calcKP(planetaryPositions, houseCusps) {
  try {
    // KP Sub-lord table: each nakshatra (13°20') is divided into 9 sub-lords
    // in Vimshottari proportion. Total span = 13°20' = 800' = 800/120 min/year
    const DASHA_SEQUENCE = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
    const DASHA_SPAN = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
    const NAK_SPAN = 800 / 60; // 13.333...° per nakshatra

    // Build KP sub-lord lookup: given a sidereal degree (0-360), return {star_lord, sub_lord, sub_sub_lord}
    function getKPLords(degree) {
      const normDeg = norm360(degree);
      const nakIdx  = Math.floor(normDeg / NAK_SPAN);
      const nakLord = NAKSHATRA_LORDS[nakIdx % 27];
      const posInNak = normDeg - nakIdx * NAK_SPAN; // 0 to 13.333°

      // Find sub-lord
      const nakStartDasha = DASHA_SEQUENCE.indexOf(nakLord);
      let cursor = 0;
      let subLord = nakLord;
      let subSubLord = nakLord;
      for (let i = 0; i < 9; i++) {
        const planet = DASHA_SEQUENCE[(nakStartDasha + i) % 9];
        const subSpan = NAK_SPAN * DASHA_SPAN[planet] / 120;
        if (cursor + subSpan > posInNak) {
          subLord = planet;
          // Sub-sub-lord (level 3)
          const subStartIdx = DASHA_SEQUENCE.indexOf(planet);
          const posInSub = posInNak - cursor;
          let c2 = 0;
          for (let j = 0; j < 9; j++) {
            const p2 = DASHA_SEQUENCE[(subStartIdx + j) % 9];
            const ssSpan = subSpan * DASHA_SPAN[p2] / 120;
            if (c2 + ssSpan > posInSub) { subSubLord = p2; break; }
            c2 += ssSpan;
          }
          break;
        }
        cursor += subSpan;
      }
      return { star_lord: nakLord, sub_lord: subLord, sub_sub_lord: subSubLord };
    }

    // KP data for each planet
    const kpPlanets = {};
    for (const pName of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']) {
      const pos = planetaryPositions[pName];
      if (!pos) continue;
      const lords = getKPLords(pos.degree);
      kpPlanets[pName] = { ...lords, sign: pos.sign, house: pos.house };
    }

    // KP data for house cusps 1-12
    const kpCusps = {};
    for (let h = 1; h <= 12; h++) {
      const cusp = houseCusps?.[`H${h}`];
      if (!cusp) continue;
      const lords = getKPLords(cusp.degree);
      kpCusps[h] = { ...lords, sign: cusp.sign, degree: cusp.degree };
    }

    return { kpPlanets, kpCusps };
  } catch (e) {
    console.error('[calcKP]', e.message);
    return null;
  }
}

// ─── VARSHAPHAL (SOLAR RETURN / TAJIKA) ─────────────────────────────────────
async function calcVarshaphal(natalSunDeg, natalLagnaSignIdx, dob, lat, lng, tzOffset) {
  if (!useSweph) return null;
  try {
    const tz = parseFloat(tzOffset || 5.5);
    const birthYear = parseInt(dob.split('-')[0]);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    sweph.set_sid_mode(SE_SIDM_LAHIRI, 0, 0);

    function getSunLon(jd) {
      const res = sweph.calc_ut(jd, SE_SUN, SE_FLG_SWIEPH | SE_FLG_SPEED | SE_FLG_SIDEREAL);
      if (!res) return null;
      const raw = res.data ? res.data[0] : res.longitude;
      return norm360(raw);
    }

    // Approximate JD of solar return (age years after birth)
    const [by, bm, bd] = dob.split('-').map(Number);
    const birthJD = julianDay(by, bm, bd, 12 - tz);
    const approxJD = birthJD + age * 365.25;

    // Binary search for exact moment Sun equals natal longitude
    let lo = approxJD - 1;
    let hi = approxJD + 1;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const midLon = getSunLon(mid);
      if (midLon === null) break;
      const diff = norm360(midLon - natalSunDeg);
      if ((hi - lo) < 0.000012) break; // ~1 second precision
      if (diff < 180) hi = mid;
      else lo = mid;
    }
    const returnJD = (lo + hi) / 2;

    // Return date/time
    const rv = sweph.revjul(returnJD, 1);
    const localHour = ((rv.hour + tz) % 24 + 24) % 24;
    const lh = Math.floor(localHour);
    const lm = Math.round((localHour % 1) * 60);

    // Varsha Lagna (sidereal ascendant at solar return)
    const ayanamsa = sweph.get_ayanamsa_ut(returnJD);
    const hr = sweph.houses(returnJD, lat, lng, 'W');
    const rawAsc = hr.data ? hr.data.points[0] : (hr.ascmc ? hr.ascmc[0] : hr.ascendant);
    const varshaAscDeg = norm360(rawAsc - ayanamsa);
    const varshaAscSignIdx = getSignIndex(varshaAscDeg);
    const varshaLagna = ZODIAC_SIGNS[varshaAscSignIdx];

    // Planets at solar return
    const flagSid = SE_FLG_SWIEPH | SE_FLG_SIDEREAL | SE_FLG_SPEED;
    const retPlanets = {};
    for (const p of PLANETS_LIST) {
      const res = sweph.calc_ut(returnJD, p.id, flagSid);
      if (!res) continue;
      const raw = res.data ? res.data[0] : res.longitude;
      const spd = res.data ? res.data[3] : 0;
      const deg = norm360(raw);
      const sIdx = getSignIndex(deg);
      retPlanets[p.name] = {
        degree: parseFloat(deg.toFixed(2)),
        sign: ZODIAC_SIGNS[sIdx],
        sign_index: sIdx,
        house: ((sIdx - varshaAscSignIdx + 12) % 12) + 1,
        retrograde: spd < 0,
        nakshatra: getNakshatra(deg).name
      };
    }
    // Ketu = opposite Rahu
    if (retPlanets['Rahu']) {
      const kd = norm360(retPlanets['Rahu'].degree + 180);
      const ks = getSignIndex(kd);
      retPlanets['Ketu'] = {
        degree: parseFloat(kd.toFixed(2)),
        sign: ZODIAC_SIGNS[ks],
        sign_index: ks,
        house: ((ks - varshaAscSignIdx + 12) % 12) + 1,
        retrograde: true,
        nakshatra: getNakshatra(kd).name
      };
    }

    // Muntha: natal lagna + age signs
    const munthaIdx = (natalLagnaSignIdx + age) % 12;
    const munthaSign = ZODIAC_SIGNS[munthaIdx];
    const munthaHouse = ((munthaIdx - varshaAscSignIdx + 12) % 12) + 1;

    // Mudda Dasha: Vimshottari compressed to 365.25 days
    const varshaAscNakIdx = Math.floor(norm360(varshaAscDeg) / (360 / 27));
    const startLord = NAKSHATRA_LORDS[varshaAscNakIdx];
    const MUDDA_SCALE = 365.25 / 120;
    const startIdx = DASHA_ORDER.indexOf(startLord);
    const returnDateUTC = new Date(Date.UTC(rv.year, rv.month - 1, rv.day, Math.floor(rv.hour), Math.round((rv.hour % 1) * 60)));
    const muddaDasha = [];
    let cursor = new Date(returnDateUTC.getTime());
    for (let i = 0; i < 9; i++) {
      const planet = DASHA_ORDER[(startIdx + i) % 9];
      const days = parseFloat((DASHA_YEARS[planet] * MUDDA_SCALE).toFixed(1));
      const end = new Date(cursor.getTime() + days * 86400000);
      muddaDasha.push({ planet, start: cursor.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), days });
      cursor = end;
    }

    return {
      year: currentYear,
      age,
      return_date: `${rv.year}-${String(rv.month).padStart(2,'0')}-${String(rv.day).padStart(2,'0')}`,
      return_time_local: `${String(lh).padStart(2,'0')}:${String(lm).padStart(2,'0')}`,
      varsha_lagna: varshaLagna,
      varsha_lagna_sign_idx: varshaAscSignIdx,
      varsha_lagna_deg: parseFloat(varshaAscDeg.toFixed(2)),
      varsha_lord: SIGN_LORDS[varshaAscSignIdx],
      planets: retPlanets,
      muntha: { sign: munthaSign, sign_index: munthaIdx, house: munthaHouse },
      mudda_dasha: muddaDasha
    };
  } catch (e) {
    console.error('[calcVarshaphal]', e.message);
    return null;
  }
}

module.exports = { calculateKundali, calcVarshaphal, calcJaimini, calcKP, ZODIAC_SIGNS, NAKSHATRA_NAMES, NAKSHATRA_LORDS, DASHA_ORDER, DASHA_YEARS, SIGN_LORDS };
