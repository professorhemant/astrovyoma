let sweph;
try { sweph = require('sweph'); console.log('[panchang] sweph loaded — high-accuracy ephemeris active'); }
catch { console.warn('[panchang] sweph not available — using Spencer fallback for sunrise'); }

const TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
const TITHI_MEANING = { Pratipada:'Auspicious for starting new ventures',Dwitiya:'Good for marriage, partnership and love',Tritiya:'Excellent for important work and travel',Chaturthi:'Worship Lord Ganesha; avoid new starts',Panchami:'Favorable for education and learning',Shashthi:'Good for overcoming obstacles',Saptami:'Auspicious for Sun worship and prosperity',Ashtami:'Mixed results; avoid major decisions',Navami:'Favorable for Durga worship',Dashami:'Excellent for all auspicious activities',Ekadashi:'Most auspicious — fast, Vishnu worship, spiritual practices',Dwadashi:'Very good for charity and donation',Trayodashi:'Auspicious for love and Shiva worship',Chaturdashi:'Kali worship; avoid major starts',Purnima:'Full Moon — highly significant for rituals',Amavasya:'New Moon — ancestor rituals, introspection' };
const TITHI_DETAILS = {
  Pratipada:   { deity:'Brahma (Creator)',       nature:'Nanda',  type:'Joyful',    goodFor:'New beginnings, creative ventures, worship of Brahma', avoid:'Grief-related activities' },
  Dwitiya:     { deity:'Vidhaata (Fate Lord)',    nature:'Bhadra', type:'Stable',    goodFor:'Long-term investments, construction, stability, travel', avoid:'Hasty or rash decisions' },
  Tritiya:     { deity:'Gauri (Goddess Parvati)', nature:'Jaya',   type:'Victorious',goodFor:'Winning competitions, important tasks, new relationships', avoid:'Arguments and confrontations' },
  Chaturthi:   { deity:'Ganesh (Remover of Obstacles)',nature:'Rikta',type:'Empty', goodFor:'Ganesh worship, removing obstacles, spiritual practice', avoid:'Starting new ventures, auspicious ceremonies' },
  Panchami:    { deity:'Nagas (Serpent Gods)',    nature:'Poorna', type:'Complete',  goodFor:'Education, learning, medicine, snake worship', avoid:'Travel by water, harming snakes' },
  Shashthi:    { deity:'Kartika (God of War)',    nature:'Nanda',  type:'Joyful',   goodFor:'Overcoming enemies, child welfare, courage', avoid:'Cutting hair or nails' },
  Saptami:     { deity:'Surya (Sun God)',         nature:'Bhadra', type:'Stable',   goodFor:'Sun worship, health, vitality, government work', avoid:'Starting journeys westward' },
  Ashtami:     { deity:'Durga (Fierce Goddess)',  nature:'Jaya',   type:'Victorious',goodFor:'Durga worship, courage, transformation, spiritual battles', avoid:'Auspicious ceremonies, marriage' },
  Navami:      { deity:'Durga / Bhairav',         nature:'Rikta',  type:'Empty',    goodFor:'Durga / Navratri worship, healing, protective rituals', avoid:'New beginnings, signing contracts' },
  Dashami:     { deity:'Yama (God of Dharma)',    nature:'Poorna', type:'Complete',  goodFor:'All auspicious activities, dharmic work, donations', avoid:'Negative intentions' },
  Ekadashi:    { deity:'Vishnu (Preserver)',      nature:'Nanda',  type:'Joyful',   goodFor:'Fasting, Vishnu worship, spiritual practices, reading scriptures', avoid:'Eating rice, non-vegetarian food' },
  Dwadashi:    { deity:'Vishnu (Preserver)',      nature:'Bhadra', type:'Stable',   goodFor:'Charity, donation, Dwadashi Vrat, feeding Brahmins', avoid:'Starting conflicts' },
  Trayodashi:  { deity:'Kama (Love God) / Shiva', nature:'Jaya',  type:'Victorious',goodFor:'Love, romance, Shiva worship (Pradosh Vrat), arts', avoid:'Fasting (except Pradosh)' },
  Chaturdashi:  { deity:'Shiva / Kali',           nature:'Rikta',  type:'Empty',    goodFor:'Kali worship, fire rituals, removing evil, protection', avoid:'Marriage, new ventures, auspicious work' },
  Purnima:     { deity:'Moon (Chandra)',          nature:'Poorna', type:'Complete',  goodFor:'All auspicious activities, full moon rituals, charity, Satyanarayan puja', avoid:'Negative thoughts' },
  Amavasya:    { deity:'Pitrs (Ancestors)',       nature:'Poorna', type:'Transformative',goodFor:'Ancestor rituals (Shraddha), Pitru Tarpan, introspection', avoid:'New ventures, celebrations' },
};
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const NAKSHATRA_DATA = {
  Ashwini:            { ruler:'Ketu',    deity:'Ashwini Kumaras',  symbol:'Horse Head',          goodFor:'Medical treatments, travel, new ventures',        avoid:'Long-term commitments',              element:'Earth' },
  Bharani:            { ruler:'Venus',   deity:'Yama',             symbol:'Yoni (Womb)',          goodFor:'Creative work, agriculture, persistent hard labor',avoid:'Timid or weak acts',                 element:'Earth' },
  Krittika:           { ruler:'Sun',     deity:'Agni (Fire God)',   symbol:'Razor Blade / Flame', goodFor:'Cooking, fire rituals, decisive bold actions',     avoid:'Anger-driven decisions',             element:'Earth' },
  Rohini:             { ruler:'Moon',    deity:'Brahma',           symbol:'Chariot / Bull',       goodFor:'Agriculture, love, arts, business prosperity',     avoid:'Conflict and harsh speech',          element:'Earth' },
  Mrigashira:         { ruler:'Mars',    deity:'Soma (Moon God)',   symbol:'Deer Head',           goodFor:'Travel, searching, gentle artistic pursuits',      avoid:'Fixed or rigid commitments',         element:'Earth' },
  Ardra:              { ruler:'Rahu',    deity:'Rudra (Storm God)', symbol:'Teardrop / Gem',      goodFor:'Intense transformative work, purification',        avoid:'Travel by water, new ventures',      element:'Water' },
  Punarvasu:          { ruler:'Jupiter', deity:'Aditi (Abundance)', symbol:'Quiver of Arrows',    goodFor:'Business, travel, repairs, renewals, optimism',    avoid:'Starting confrontational activities',element:'Water' },
  Pushya:             { ruler:'Saturn',  deity:'Brihaspati',       symbol:'Lotus / Flower',       goodFor:'All auspicious activities — the most auspicious nakshatra',avoid:'Marriage (per tradition)',    element:'Water' },
  Ashlesha:           { ruler:'Mercury', deity:'Nagas (Serpents)',  symbol:'Coiled Serpent',      goodFor:'Occult studies, tantra, kundalini, mantras',       avoid:'Trust-dependent ventures',           element:'Water' },
  Magha:              { ruler:'Ketu',    deity:'Pitrs (Ancestors)', symbol:'Royal Throne',        goodFor:'Ancestor rites, royal activities, honoring elders',avoid:'Humility-centered tasks',            element:'Fire' },
  'Purva Phalguni':   { ruler:'Venus',   deity:'Bhaga (Fortune)',   symbol:'Fig Tree',            goodFor:'Marriage, romance, arts, entertainment, pleasure', avoid:'Hard physical labor',                element:'Fire' },
  'Uttara Phalguni':  { ruler:'Sun',     deity:'Aryaman (Friend)',  symbol:'Fig Tree / Bed',      goodFor:'Contracts, marriage, lasting partnerships',         avoid:'Hasty or impulsive decisions',       element:'Fire' },
  Hasta:              { ruler:'Moon',    deity:'Savitar (Creator)', symbol:'Open Palm / Hand',    goodFor:'Crafts, healing, business negotiations, skill',    avoid:'Secretive or hidden activities',     element:'Fire' },
  Chitra:             { ruler:'Mars',    deity:'Vishwakarma',       symbol:'Bright Pearl / Gem',  goodFor:'Art, architecture, jewelry, adornment, beauty',    avoid:'Dull routine tasks',                 element:'Fire' },
  Swati:              { ruler:'Rahu',    deity:'Vayu (Wind God)',   symbol:'Coral / Sword',       goodFor:'Business, trade, travel, learning, independence',  avoid:'Fixed or rigid plans',               element:'Air' },
  Vishakha:           { ruler:'Jupiter', deity:'Indra-Agni',        symbol:'Triumphal Archway',   goodFor:'Goal-setting, religious work, leadership, purpose',avoid:'Hasty spiritual shortcuts',          element:'Fire' },
  Anuradha:           { ruler:'Saturn',  deity:'Mitra (Friendship)',symbol:'Lotus / Row of Offerings',goodFor:'Friendships, teamwork, spiritual practice, devotion',avoid:'Isolation or selfishness',    element:'Water' },
  Jyeshtha:           { ruler:'Mercury', deity:'Indra (King of Gods)',symbol:'Circular Amulet',  goodFor:'Leadership, protection, courageous acts',          avoid:'Subservience or meekness',           element:'Water' },
  Mula:               { ruler:'Ketu',    deity:'Niritti (Dissolution)',symbol:'Tied Roots / Tail',goodFor:'Research, agriculture, getting to root causes',     avoid:'Starting new auspicious projects',   element:'Fire' },
  'Purva Ashadha':    { ruler:'Venus',   deity:'Apas (Water God)',  symbol:'Elephant Tusk / Fan', goodFor:'Water activities, healing, oratory, debate',       avoid:'Conflicts near water',               element:'Air' },
  'Uttara Ashadha':   { ruler:'Sun',     deity:'Vishwa Devas',      symbol:'Elephant Tusk',       goodFor:'Starting major ventures, leadership, lasting work',avoid:'Half-hearted or incomplete efforts', element:'Earth' },
  Shravana:           { ruler:'Moon',    deity:'Vishnu (Protector)',symbol:'Three Footprints / Ear',goodFor:'Education, spiritual learning, listening, Vishnu worship',avoid:'Speaking without listening', element:'Air' },
  Dhanishtha:         { ruler:'Mars',    deity:'Ashta Vasus',       symbol:'Musical Drum / Flute',goodFor:'Music, arts, property, construction, wealth',       avoid:'Overspending or extravagance',        element:'Ether' },
  Shatabhisha:        { ruler:'Rahu',    deity:'Varuna (Rain God)', symbol:'Empty Circle',        goodFor:'Medicine, astrology, healing, secretive research', avoid:'Public declarations or announcements',element:'Ether' },
  'Purva Bhadrapada': { ruler:'Jupiter', deity:'Aja Ekapada',       symbol:'Sword / Two Front Legs',goodFor:'Spiritual practices, donations, service, sacrifice',avoid:'Material indulgence',            element:'Ether' },
  'Uttara Bhadrapada':{ ruler:'Saturn',  deity:'Ahir Budhyana',     symbol:'Two Back Legs',       goodFor:'Spiritual depth, deep research, introspection',    avoid:'Impatient or impulsive actions',      element:'Ether' },
  Revati:             { ruler:'Mercury', deity:'Pushan (Nurturer)', symbol:'Fish / Drum',         goodFor:'Travel, completion of work, finishing projects',    avoid:'Starting major new work',            element:'Ether' },
};
const YOGA_NAMES = ['Vishkumbha','Preeti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
const KARANA_NAMES = ['Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna'];
const VARA = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const VARA_LORD = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const RAHU_KAAL = { Sunday:'4:30 PM – 6:00 PM',Monday:'7:30 AM – 9:00 AM',Tuesday:'3:00 PM – 4:30 PM',Wednesday:'12:00 PM – 1:30 PM',Thursday:'1:30 PM – 3:00 PM',Friday:'10:30 AM – 12:00 PM',Saturday:'9:00 AM – 10:30 AM' };
const LUCKY_COLORS = { Sunday:'Gold & Orange',Monday:'White & Silver',Tuesday:'Red & Coral',Wednesday:'Green & Lime',Thursday:'Yellow & Cream',Friday:'Pink & White',Saturday:'Blue & Black' };
const LUCKY_NUMBERS = { Sunday:'1, 4',Monday:'2, 7',Tuesday:'9, 3',Wednesday:'5, 6',Thursday:'3, 5',Friday:'6, 9',Saturday:'8, 7' };
const GOOD_WORK = { Sunday:'Government work, leadership, gold purchase',Monday:'Travel, agriculture, emotional healing',Tuesday:'Construction, property, overcoming enemies',Wednesday:'Education, business negotiations, contracts',Thursday:'Religious activities, teaching, charity',Friday:'Marriage, romance, arts, creative projects',Saturday:'Land deals, service activities, spiritual practices' };

// Choghadiya tables
const CHOGHADIYA_DAY = {
  Sunday:    ['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg'],
  Monday:    ['Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit'],
  Tuesday:   ['Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'],
  Wednesday: ['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh'],
  Thursday:  ['Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh'],
  Friday:    ['Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char'],
  Saturday:  ['Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal'],
};
const CHOGHADIYA_NIGHT = {
  Sunday:    ['Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh'],
  Monday:    ['Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char'],
  Tuesday:   ['Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal'],
  Wednesday: ['Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg'],
  Thursday:  ['Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit'],
  Friday:    ['Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog'],
  Saturday:  ['Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh'],
};
const CHOGHADIYA_INFO = {
  Amrit: { nature:'Very Auspicious', color:'#6BCB77', icon:'✨', desc:'Best for all activities — new ventures, important decisions, signing agreements, travel' },
  Shubh: { nature:'Auspicious',      color:'#74B9FF', icon:'🌟', desc:'Favorable for starting work, religious activities, educational pursuits, marriage discussions' },
  Labh:  { nature:'Auspicious',      color:'#FFD93D', icon:'💰', desc:'Excellent for business, financial transactions, loans, investments, gains of all kinds' },
  Char:  { nature:'Auspicious',      color:'#A29BFE', icon:'✈️', desc:'Ideal for travel, movement, changing residence or workplace, vehicle journeys' },
  Rog:   { nature:'Inauspicious',    color:'#FF6B6B', icon:'⚠️', desc:'Avoid new beginnings; medical treatments and routine health checkups are acceptable' },
  Kaal:  { nature:'Inauspicious',    color:'#E17055', icon:'🚫', desc:'Unfavorable for auspicious work; only routine, mundane, or unavoidable tasks are OK' },
  Udveg: { nature:'Inauspicious',    color:'#FD79A8', icon:'❌', desc:'Avoid travel, signing contracts, starting new ventures — this period causes distress' },
};
// Which 1-indexed part of the 8 daytime slots is Rahu Kaal / Yamaganda / Gulika
const RAHU_PART     = { Sunday:8, Monday:2, Tuesday:7, Wednesday:5, Thursday:6, Friday:4, Saturday:3 };
const YAMGANDA_PART = { Sunday:6, Monday:4, Tuesday:2, Wednesday:7, Thursday:5, Friday:3, Saturday:1 };
const GULIKA_PART   = { Sunday:5, Monday:3, Tuesday:1, Wednesday:6, Thursday:4, Friday:2, Saturday:7 };

// Festivals come from the ephemeris now. The table that used to sit here was
// 2025's dates relabelled as 2026 — it put Holi on 14 Mar 2026 and Shivratri on
// 26 Feb 2026, both a year stale, and it disagreed with the events calendar.
const { festivalFor } = require('../services/festivalEngine');

// ─── helpers ─────────────────────────────────────────────────────────────────

const UJJAIN_LAT = 23.1765; // degrees N
const UJJAIN_LON = 75.7885; // degrees E
const LOCATION   = 'Ujjain, Madhya Pradesh, India';

function getSunriseSunsetMin(dateStr) {
  // Try Swiss Ephemeris rise_trans — uses actual solar position + atmospheric refraction
  if (sweph && typeof sweph.rise_trans === 'function') {
    try {
      const midnightIST = new Date(dateStr + 'T00:00:00+05:30');
      const jdStart = 2440587.5 + midnightIST.getTime() / 86400000;
      // [longitude, latitude, elevation_m] — elevation 0 matches traditional horizon
      const geopos  = [UJJAIN_LON, UJJAIN_LAT, 0];
      const atpress = 1013.25; // standard atmosphere (mbar)
      const attemp  = 22.0;   // typical Ujjain temperature (°C)
      const SEFLG_SWIEPH = 2;
      const SE_CALC_RISE = 1;
      const SE_CALC_SET  = 2;

      const riseRes = sweph.rise_trans(jdStart, 0, '', SEFLG_SWIEPH, SE_CALC_RISE, geopos, atpress, attemp);
      const setRes  = sweph.rise_trans(jdStart, 0, '', SEFLG_SWIEPH, SE_CALC_SET,  geopos, atpress, attemp);

      if (riseRes && setRes && !riseRes.error && !setRes.error) {
        const jdToISTMin = (jd) => {
          const d = new Date((jd - 2440587.5) * 86400000);
          return (d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + 330) % 1440;
        };
        const riseJD = Array.isArray(riseRes.data) ? riseRes.data[0] : riseRes.data;
        const setJD  = Array.isArray(setRes.data)  ? setRes.data[0]  : setRes.data;
        return { srMin: Math.round(jdToISTMin(riseJD)), ssMin: Math.round(jdToISTMin(setJD)) };
      }
    } catch (_) { /* fall through to Spencer */ }
  }

  // Spencer formula fallback (~±3 min accuracy)
  const d   = new Date(dateStr + 'T12:00:00+05:30');
  const doy = Math.round((d - new Date(d.getFullYear(), 0, 1)) / 86400000);
  const B   = (2 * Math.PI / 365) * doy;
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
                           - 0.014615 * Math.cos(2*B) - 0.04089  * Math.sin(2*B));
  const decl = 0.006918 - 0.399912 * Math.cos(B) + 0.070257 * Math.sin(B)
             - 0.006758 * Math.cos(2*B) + 0.000907 * Math.sin(2*B)
             - 0.002697 * Math.cos(3*B) + 0.00148  * Math.sin(3*B);
  const lat  = UJJAIN_LAT * Math.PI / 180;
  const cosHA = (Math.sin(-0.01454) - Math.sin(lat) * Math.sin(decl))
               / (Math.cos(lat) * Math.cos(decl));
  const HA = Math.acos(Math.max(-1, Math.min(1, cosHA))) * 180 / Math.PI;
  const solarNoon = 720 - eqTime - 4 * (UJJAIN_LON - 82.5);
  return { srMin: Math.round(solarNoon - HA * 4), ssMin: Math.round(solarNoon + HA * 4) };
}

function minToTime(min) {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function calcAtJD(jd) {
  if (sweph) {
    sweph.set_sid_mode(1, 0, 0);
    const flag = 2 | (64 * 1024) | 256;
    const sun  = sweph.calc_ut(jd, 0, flag);
    const moon = sweph.calc_ut(jd, 1, flag);
    return {
      sunLon:  ((sun.data  ? sun.data[0]  : sun.longitude)  % 360 + 360) % 360,
      moonLon: ((moon.data ? moon.data[0] : moon.longitude) % 360 + 360) % 360,
    };
  }
  const T = (jd - 2451545.0) / 36525;
  const ayanamsa = 23.85 + T * 50.3 / 3600;
  return {
    sunLon:  (((280.46646 + 36000.76983 * T) % 360 + 360) % 360 - ayanamsa + 360) % 360,
    moonLon: (((218.3165  + 481267.8813 * T) % 360 + 360) % 360 - ayanamsa + 360) % 360,
  };
}

function calcCore(dateStr) {
  const d  = new Date(dateStr + 'T06:00:00+05:30');
  const jd = 2440587.5 + d.getTime() / 86400000;
  const { sunLon, moonLon } = calcAtJD(jd);
  const tithiRaw     = ((moonLon - sunLon + 360) % 360) / 12;
  const tithiIndex   = Math.floor(tithiRaw) % 30;
  const nakshatraIdx = Math.floor(moonLon / (360 / 27)) % 27;
  const yogaIndex    = Math.floor(((sunLon + moonLon) % 360) / (360 / 27)) % 27;
  const karanaIndex  = Math.floor(tithiRaw * 2) % 11;
  return { d, jd, sunLon, moonLon, tithiRaw, tithiIndex, nakshatraIdx, yogaIndex, karanaIndex };
}

function calcTimings(sunLon, moonLon, tithiRaw, jd) {
  // Use actual positions 24 h later to get real instantaneous speeds
  const { sunLon: s1, moonLon: m1 } = calcAtJD(jd + 1);
  let mDelta = m1 - moonLon; if (mDelta < 0) mDelta += 360;
  let sDelta = s1 - sunLon;  if (sDelta < 0) sDelta += 360;
  const synodic = Math.max(mDelta - sDelta, 8);   // deg/day, guard minimum
  const moonSpd = Math.max(mDelta, 10);
  const yogaSpd = Math.max(mDelta + sDelta, 11);

  const addHrs = (hrs) => {
    const totalMin = 6 * 60 + Math.round(Math.max(0, hrs) * 60);
    return { time: minToTime(totalMin % (24 * 60)), day: totalMin >= 24 * 60 ? 'Tomorrow' : 'Today' };
  };

  const nakDeg       = 360 / 27;
  const nakshatraRaw = moonLon / nakDeg;
  const yogaRaw      = ((sunLon + moonLon) % 360) / nakDeg;
  const karanaRaw    = tithiRaw * 2;

  return {
    tithiEnds:    addHrs(((1 - (tithiRaw    % 1)) * 12     / synodic) * 24),
    nextTithi:    TITHIS[(Math.floor(tithiRaw) + 1) % 30] || 'Pratipada',
    nakshatraEnds: addHrs(((1 - (nakshatraRaw % 1)) * nakDeg / moonSpd) * 24),
    nextNakshatra: NAKSHATRAS[(Math.floor(nakshatraRaw) + 1) % 27],
    yogaEnds:     addHrs(((1 - (yogaRaw      % 1)) * nakDeg / yogaSpd) * 24),
    nextYoga:     YOGA_NAMES[(Math.floor(yogaRaw) + 1) % 27],
    karanaEnds:   addHrs(((1 - (karanaRaw    % 1)) * 6      / synodic) * 24),
    nextKarana:   KARANA_NAMES[(Math.floor(karanaRaw) + 1) % 11],
  };
}

function tithiFullName(idx) {
  if (idx === 14) return 'Purnima';
  if (idx === 29) return 'Amavasya';
  return (idx < 15 ? 'Shukla' : 'Krishna') + TITHIS[idx];
}

function buildTithiSchedule(startDateStr, count) {
  count = count || 8;
  const STEP_MS  = 20 * 60000; // 20-min steps
  const refMs    = new Date(startDateStr + 'T06:00:00+05:30').getTime();
  const scanFrom = refMs - 3 * 86400000;
  const scanTo   = refMs + (count + 2) * 86400000;

  const fmt = (ms) => ({
    time: new Date(ms).toLocaleTimeString('en-IN', { hour12:true, hour:'numeric', minute:'2-digit', timeZone:'Asia/Kolkata' }),
    date: new Date(ms).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' }),
  });

  const bounds = [];
  let prevIdx = null, prevRaw = null, prevMs = null;

  for (let ms = scanFrom; ms <= scanTo && bounds.length < count + 4; ms += STEP_MS) {
    const jd = 2440587.5 + ms / 86400000;
    const { sunLon, moonLon } = calcAtJD(jd);
    const raw = ((moonLon - sunLon + 360) % 360) / 12;
    const idx = Math.floor(raw) % 30;
    if (prevIdx !== null && idx !== prevIdx) {
      let pRaw = prevRaw, cRaw = raw;
      if (cRaw < pRaw - 15) cRaw += 30;
      const frac = (Math.ceil(pRaw + 1e-9) - pRaw) / Math.max(cRaw - pRaw, 0.001);
      const xMs  = prevMs + frac * STEP_MS;
      const f    = fmt(xMs);
      bounds.push({ ms: xMs, toIdx: idx, time: f.time, date: f.date });
    }
    prevIdx = idx; prevRaw = raw; prevMs = ms;
  }

  // Last boundary ≤ refMs is where current tithi started
  let startB = 0;
  for (let i = 0; i < bounds.length; i++) {
    if (bounds[i].ms <= refMs) startB = i; else break;
  }

  const schedule = [];
  for (let i = startB; i < bounds.length - 1 && schedule.length < count; i++) {
    schedule.push({
      name:      tithiFullName(bounds[i].toIdx),
      startTime: bounds[i].time,
      startDate: bounds[i].date,
      endTime:   bounds[i + 1].time,
      endDate:   bounds[i + 1].date,
    });
  }
  return schedule;
}

// ─── existing endpoint ────────────────────────────────────────────────────────

function getPanchang(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { d, jd, sunLon, moonLon, tithiRaw, tithiIndex, nakshatraIdx, yogaIndex, karanaIndex } = calcCore(dateStr);
    const { srMin, ssMin } = getSunriseSunsetMin(dateStr);

    const tithi      = TITHIS[tithiIndex] || 'Pratipada';
    const tithiPaksha= tithiIndex < 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
    const nakshatra  = NAKSHATRAS[nakshatraIdx];
    const nakshatraPada = Math.floor((moonLon % (360 / 27)) / (360 / 27 / 4)) + 1;
    const yoga       = YOGA_NAMES[yogaIndex];
    const karana     = KARANA_NAMES[karanaIndex];
    const vara       = VARA[d.getDay()];
    const varaLord   = VARA_LORD[d.getDay()];

    const timings = calcTimings(sunLon, moonLon, tithiRaw, jd);
    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      vara, varaLord, tithi, tithiPaksha,
      tithiMeaning: TITHI_MEANING[tithi] || 'A balanced day for steady progress',
      nakshatra, nakshatraPada, yoga, karana,
      sunrise: minToTime(srMin), sunset: minToTime(ssMin),
      rahuKaal: RAHU_KAAL[vara],
      abhijit: '11:48 AM – 12:36 PM',
      luckyColor: LUCKY_COLORS[vara], luckyNumber: LUCKY_NUMBERS[vara], goodFor: GOOD_WORK[vara],
      moonDegree: moonLon.toFixed(2), sunDegree: sunLon.toFixed(2),
      ...timings,
    });
  } catch (err) {
    console.error('getPanchang error:', err);
    res.status(500).json({ error: 'Failed to calculate Panchang' });
  }
}

// ─── Today's Tithi ────────────────────────────────────────────────────────────

function getTodayTithi(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { d, jd, sunLon, moonLon, tithiRaw, tithiIndex } = calcCore(dateStr);
    const tithi    = TITHIS[tithiIndex];
    const paksha   = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
    const tithiNum = tithiIndex < 15 ? tithiIndex + 1 : tithiIndex - 14;
    const vara     = VARA[d.getDay()];
    const details  = TITHI_DETAILS[tithi] || TITHI_DETAILS['Pratipada'];
    const { tithiEnds, nextTithi } = calcTimings(sunLon, moonLon, tithiRaw, jd);
    const tithiChart = buildTithiSchedule(dateStr, 8);
    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      tithi, paksha, tithiNum,
      tithiPaksha: `${paksha} — ${tithi} (${tithiNum})`,
      ...details,
      meaning: TITHI_MEANING[tithi] || 'A balanced day for steady progress',
      vara, varaLord: VARA_LORD[d.getDay()],
      tithiEnds, nextTithi, tithiChart,
      location: LOCATION,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Tithi' });
  }
}

// ─── Today's Nakshatra ────────────────────────────────────────────────────────

function getTodayNakshatra(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { d, jd, sunLon, moonLon, tithiRaw, nakshatraIdx } = calcCore(dateStr);
    const nakshatra = NAKSHATRAS[nakshatraIdx];
    const pada      = Math.floor((moonLon % (360 / 27)) / (360 / 27 / 4)) + 1;
    const info      = NAKSHATRA_DATA[nakshatra] || {};
    const vara      = VARA[d.getDay()];
    const { nakshatraEnds, nextNakshatra } = calcTimings(sunLon, moonLon, tithiRaw, jd);
    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      nakshatra, pada, nakshatraNum: nakshatraIdx + 1,
      moonDegree: moonLon.toFixed(2),
      ...info,
      vara, varaLord: VARA_LORD[d.getDay()],
      nakshatraEnds, nextNakshatra,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Nakshatra' });
  }
}

// ─── Today's Choghadiya ───────────────────────────────────────────────────────

function getTodayChoghadiya(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { d } = calcCore(dateStr);
    const vara = VARA[d.getDay()];
    const { srMin, ssMin } = getSunriseSunsetMin(dateStr);
    const nightEndMin = srMin + 24 * 60; // next day sunrise (approx)

    const daySlotLen   = (ssMin - srMin) / 8;
    const nightSlotLen = (nightEndMin - ssMin) / 8;

    const daySlots = CHOGHADIYA_DAY[vara].map((name, i) => ({
      name,
      start: minToTime(srMin + i * daySlotLen),
      end:   minToTime(srMin + (i + 1) * daySlotLen),
      startMin: srMin + i * daySlotLen,
      endMin:   srMin + (i + 1) * daySlotLen,
      ...CHOGHADIYA_INFO[name],
    }));

    const nightSlots = CHOGHADIYA_NIGHT[vara].map((name, i) => ({
      name,
      start: minToTime(ssMin + i * nightSlotLen),
      end:   minToTime(ssMin + (i + 1) * nightSlotLen),
      startMin: ssMin + i * nightSlotLen,
      endMin:   ssMin + (i + 1) * nightSlotLen,
      ...CHOGHADIYA_INFO[name],
    }));

    // current time in minutes from midnight (IST)
    const now = new Date();
    const istOffsetMin = 330; // +5:30
    const nowMin = ((now.getUTCHours() * 60 + now.getUTCMinutes()) + istOffsetMin) % (24 * 60);

    const findCurrent = (slots) => slots.findIndex(s => nowMin >= s.startMin && nowMin < s.endMin);

    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      vara, sunrise: minToTime(srMin), sunset: minToTime(ssMin),
      daySlots, nightSlots,
      currentDaySlotIdx:   findCurrent(daySlots),
      currentNightSlotIdx: findCurrent(nightSlots),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Choghadiya' });
  }
}

// ─── Today's Rahu Kaal ────────────────────────────────────────────────────────

function getTodayRahuKaal(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { d } = calcCore(dateStr);
    const vara = VARA[d.getDay()];
    const { srMin, ssMin } = getSunriseSunsetMin(dateStr);
    const slotLen = (ssMin - srMin) / 8;

    const slot = (part) => {
      const s = srMin + (part - 1) * slotLen;
      return `${minToTime(s)} – ${minToTime(s + slotLen)}`;
    };

    const rahuPart   = RAHU_PART[vara];
    const yamPart    = YAMGANDA_PART[vara];
    const gulikaPart = GULIKA_PART[vara];

    const rahuStart   = srMin + (rahuPart - 1) * slotLen;
    const now = new Date();
    const istOffsetMin = 330;
    const nowMin = ((now.getUTCHours() * 60 + now.getUTCMinutes()) + istOffsetMin) % (24 * 60);
    const isRahuActive = nowMin >= rahuStart && nowMin < rahuStart + slotLen;

    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      vara, varaLord: VARA_LORD[d.getDay()],
      sunrise: minToTime(srMin), sunset: minToTime(ssMin),
      rahuKaal:   slot(rahuPart),
      yamaganda:  slot(yamPart),
      gulika:     slot(gulikaPart),
      rahuPart, yamPart, gulikaPart,
      isRahuActive,
      rahuStartMin: rahuStart,
      rahuEndMin:   rahuStart + slotLen,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Rahu Kaal' });
  }
}

// ─── Today's Shubhamuhurat ────────────────────────────────────────────────────

function getTodayShubhamuhurat(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { d, tithiIndex, nakshatraIdx } = calcCore(dateStr);
    const vara = VARA[d.getDay()];
    const { srMin, ssMin } = getSunriseSunsetMin(dateStr);
    const midday = (srMin + ssMin) / 2;

    const brahma   = `${minToTime(srMin - 96)} – ${minToTime(srMin - 48)}`;
    const pratah   = `${minToTime(srMin - 24)} – ${minToTime(srMin + 24)}`;
    const abhijit  = `${minToTime(midday - 24)} – ${minToTime(midday + 24)}`;
    const vijaya   = `${minToTime(ssMin - 96)} – ${minToTime(ssMin - 48)}`;
    const godhuli  = `${minToTime(ssMin - 12)} – ${minToTime(ssMin + 12)}`;
    const nisitha  = `${minToTime(720 + 12)} – ${minToTime(720 + 48)}`; // around midnight

    // Sarvartha Siddhi Yoga: special vara+nakshatra combos
    const SARVARTHA = {
      Sunday:    ['Hasta','Mula','Ashwini','Pushya'],
      Monday:    ['Rohini','Mrigashira','Punarvasu','Shatabhisha'],
      Tuesday:   ['Ashwini','Krittika','Uttara Phalguni','Vishakha','Anuradha'],
      Wednesday: ['Rohini','Hasta','Mrigashira','Punarvasu','Pushya','Revati'],
      Thursday:  ['Revati','Hasta','Pushya','Ashwini','Punarvasu','Uttara Bhadrapada'],
      Friday:    ['Rohini','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada','Punarvasu'],
      Saturday:  ['Rohini','Swati','Shatabhisha','Revati'],
    };
    const todayNakshatra = NAKSHATRAS[nakshatraIdx];
    const isSarvarthaSiddhi = (SARVARTHA[vara] || []).includes(todayNakshatra);

    // Amrit Siddhi Yoga combos
    const AMRIT_SIDDHI = {
      Sunday:'Hasta', Monday:'Mrigashira', Tuesday:'Ashwini', Wednesday:'Anuradha',
      Thursday:'Pushya', Friday:'Revati', Saturday:'Rohini',
    };
    const isAmritSiddhi = AMRIT_SIDDHI[vara] === todayNakshatra;

    // Rahu Kaal to avoid
    const rahuPart  = RAHU_PART[vara];
    const slotLen   = (ssMin - srMin) / 8;
    const rahuStart = srMin + (rahuPart - 1) * slotLen;
    const rahuTime  = `${minToTime(rahuStart)} – ${minToTime(rahuStart + slotLen)}`;

    const ACTIVITY_MUHURTA = {
      Marriage:  vara === 'Monday' || vara === 'Wednesday' || vara === 'Thursday' || vara === 'Friday' ? abhijit : null,
      Business:  vara === 'Wednesday' || vara === 'Thursday' ? abhijit : vijaya,
      Travel:    vara === 'Wednesday' || vara === 'Monday' ? pratah : abhijit,
      Education: vara === 'Wednesday' || vara === 'Thursday' ? abhijit : pratah,
      Property:  vara === 'Wednesday' || vara === 'Saturday' ? abhijit : vijaya,
      Medicine:  pratah,
    };

    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      vara, varaLord: VARA_LORD[d.getDay()],
      brahma, pratah, abhijit, vijaya, godhuli, nisitha,
      isSarvarthaSiddhi, isAmritSiddhi, todayNakshatra,
      rahuKaal: rahuTime,
      activities: ACTIVITY_MUHURTA,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Shubhamuhurat' });
  }
}

// ─── Panchang Calendar ────────────────────────────────────────────────────────

function getPanchangCalendar(req, res) {
  try {
    const year  = parseInt(req.query.year  || new Date().getFullYear());
    const month = parseInt(req.query.month || new Date().getMonth() + 1); // 1-indexed
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(month).padStart(2,'0');
      const dd = String(day).padStart(2,'0');
      const dateStr = `${year}-${mm}-${dd}`;
      try {
        const { d, tithiIndex, nakshatraIdx } = calcCore(dateStr);
        const tithi     = TITHIS[tithiIndex];
        const nakshatra = NAKSHATRAS[nakshatraIdx];
        const vara      = VARA[d.getDay()];
        const paksha    = tithiIndex < 15 ? 'S' : 'K'; // Shukla/Krishna
        const tithiNum  = tithiIndex < 15 ? tithiIndex + 1 : tithiIndex - 14;
        const festivalName = festivalFor(dateStr);
        const tithiNature  = TITHI_DETAILS[tithi]?.nature || 'Bhadra';
        const isAuspicious = !['Chaturthi','Navami','Chaturdashi'].includes(tithi) && tithiNature !== 'Rikta';
        days.push({ date:dateStr, day, vara, tithi, tithiNum, paksha, nakshatra, festival:festivalName, isAuspicious });
      } catch (_) {
        days.push({ date:dateStr, day, vara:'', tithi:'', tithiNum:0, paksha:'S', nakshatra:'', festival:null, isAuspicious:false });
      }
    }
    const firstDayOfWeek = new Date(`${year}-${String(month).padStart(2,'0')}-01`).getDay();
    res.json({ year, month, monthName: new Date(year, month-1, 1).toLocaleString('en-IN',{month:'long'}), firstDayOfWeek, days });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Calendar' });
  }
}

// Shared helpers for muhurtaController (no duplication)
function getPanchangData(dateStr) {
  const core = calcCore(dateStr);
  const { srMin, ssMin } = getSunriseSunsetMin(dateStr);
  const { d, tithiIndex, nakshatraIdx, yogaIndex, karanaIndex, sunLon, moonLon } = core;
  return {
    dateStr,
    vara:        VARA[d.getDay()],
    varaLord:    VARA_LORD[d.getDay()],
    dayIndex:    d.getDay(),
    tithi:       TITHIS[tithiIndex],
    tithiIndex,
    tithiDetail: TITHI_DETAILS[TITHIS[tithiIndex]] || {},
    nakshatra:   NAKSHATRAS[nakshatraIdx],
    nakshatraIdx,
    nakshatraData: NAKSHATRA_DATA[NAKSHATRAS[nakshatraIdx]] || {},
    yoga:        YOGA_NAMES[yogaIndex],
    yogaIndex,
    karana:      KARANA_NAMES[karanaIndex],
    srMin, ssMin,
    sunLon, moonLon,
    choghadiyaDay:   CHOGHADIYA_DAY[VARA[d.getDay()]]   || [],
    choghadiyaNight: CHOGHADIYA_NIGHT[VARA[d.getDay()]] || [],
    rahuPart:    RAHU_PART[VARA[d.getDay()]],
    yamgandaPart:YAMGANDA_PART[VARA[d.getDay()]],
    gulikaPart:  GULIKA_PART[VARA[d.getDay()]],
    choghadiyaInfo: CHOGHADIYA_INFO,
  };
}

module.exports = { getPanchang, getTodayTithi, getTodayNakshatra, getTodayChoghadiya, getTodayRahuKaal, getTodayShubhamuhurat, getPanchangCalendar, getPanchangData };
