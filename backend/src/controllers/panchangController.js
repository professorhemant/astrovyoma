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
// The fixed RAHU_KAAL weekday table that used to sit here is gone — see
// dayDivisions below. It was written for a day running 6 AM to 6 PM, so it was
// only ever right at the equinoxes.
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

// The day's eight parts and its fifteen muhurtas, measured from the sunrise and
// sunset this date actually has.
//
// The Panchang page used to answer both from fixed tables instead: a weekday
// lookup of Rahu Kaal written for a 6 AM to 6 PM day, and Abhijit as the
// literal string '11:48 AM – 12:36 PM'. Neither moved with the season, so the
// page contradicted the sunrise printed two cards above it and disagreed with
// /today-rahu-kaal, which had always computed it properly.
//
// Abhijit is the eighth of the day's fifteen muhurtas — the one straddling
// solar midday — so it is a fifteenth of the daylight long, not a fixed 48
// minutes. Both are defined here so every page reads the same clock.
function dayDivisions(srMin, ssMin, vara) {
  const dayLen  = ssMin - srMin;
  const slotLen = dayLen / 8;
  const span = (startMin, endMin) => ({
    startMin, endMin, text: `${minToTime(startMin)} – ${minToTime(endMin)}`,
  });
  const part = (n) => span(srMin + (n - 1) * slotLen, srMin + n * slotLen);

  const midday = (srMin + ssMin) / 2;
  const half   = dayLen / 30;

  return {
    dayLen, slotLen, midday,
    abhijit:   span(midday - half, midday + half),
    rahu:      part(RAHU_PART[vara]),
    yamaganda: part(YAMGANDA_PART[vara]),
    gulika:    part(GULIKA_PART[vara]),
  };
}

// Why the two cards can name the same minutes, said on the page rather than
// left for the reader to spot.
//
// This is not a bug in the arithmetic: Friday's Rahu Kaal is the fourth of the
// eight parts, which ends exactly at solar midday, and Abhijit always straddles
// midday — so on every Friday of the year the last half of Abhijit's first half
// falls inside Rahu Kaal. Wednesday's Rahu Kaal is the fifth part, which starts
// at midday, and overlaps the same way. Abhijit is anyway held not to apply on
// a Wednesday, which is the older and more important caveat, so it is said
// first.
function abhijitCaveat(vara, abhijit, rahu) {
  if (vara === 'Wednesday') {
    return 'Abhijit is not observed on a Wednesday — the tradition sets it aside on this weekday, so use another muhurta today.';
  }
  const from = Math.max(abhijit.startMin, rahu.startMin);
  const to   = Math.min(abhijit.endMin,   rahu.endMin);
  if (to <= from) return null;
  return `Rahu Kaal runs across the first part of this window. If you want Abhijit clear of it, begin after ${minToTime(to)}.`;
}

// Festivals come from the ephemeris now. The table that used to sit here was
// 2025's dates relabelled as 2026 — it put Holi on 14 Mar 2026 and Shivratri on
// 26 Feb 2026, both a year stale, and it disagreed with the events calendar.
const { festivalFor } = require('../services/festivalEngine');

// ─── helpers ─────────────────────────────────────────────────────────────────

// Ujjain is where the panchang is worked out when the visitor has not said
// where they are. It is the traditional zero meridian of Indian astronomy, so
// it is a defensible default rather than an arbitrary one — but it is only a
// default. Rahu Kaal is the fourth of the eight parts of *your* daylight, and
// today those eight parts start an hour apart in Kolkata and Mumbai, so a
// single hardcoded city was wrong for almost everybody reading it.
const DEFAULT_PLACE = {
  lat: 23.1765,
  lon: 75.7885,
  tzMin: 330,
  label: 'Ujjain, Madhya Pradesh, India',
  isDefault: true,
};

// Where to compute for, from the query string. Anything missing or out of
// range falls back to the default rather than erroring: a panchang that shows
// the wrong city is recoverable, one that shows an error is not.
function placeFrom(req) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) ||
      Math.abs(lat) > 90 || Math.abs(lon) > 180) return DEFAULT_PLACE;

  // tz arrives as hours east of UTC, the same units /geocode/search returns.
  const tzHours = parseFloat(req.query.tz);
  const tzMin = Number.isFinite(tzHours) && Math.abs(tzHours) <= 14
    ? Math.round(tzHours * 60)
    : 330;

  const label = String(req.query.place || '').slice(0, 120).trim();
  return { lat, lon, tzMin, label: label || `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`, isDefault: false };
}

// How a place is described back to the caller, so the page can name the city
// its numbers belong to instead of leaving the reader to assume.
const placeInfo = (place) => ({
  label: place.label,
  lat: place.lat,
  lon: place.lon,
  tz: place.tzMin / 60,
  isDefault: !!place.isDefault,
});

// Minutes east of UTC as an ISO offset, e.g. 330 -> '+05:30'.
function tzSuffix(tzMin) {
  const sign = tzMin < 0 ? '-' : '+';
  const abs  = Math.abs(tzMin);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2,'0')}:${String(abs % 60).padStart(2,'0')}`;
}

const wrapDay = (min) => ((min % 1440) + 1440) % 1440;

// The clock time right now where the visitor is, for the "you are in this slot
// now" highlights. Was +05:30 wherever the reader happened to be.
const nowMinAt = (place) => {
  const now = new Date();
  return wrapDay(now.getUTCHours() * 60 + now.getUTCMinutes() + place.tzMin);
};

// Local midnight on this date, at this place, as a Julian day.
const localMidnightJD = (dateStr, place) =>
  2440587.5 + new Date(`${dateStr}T00:00:00${tzSuffix(place.tzMin)}`).getTime() / 86400000;

function getSunriseSunsetMin(dateStr, place = DEFAULT_PLACE) {
  // Try Swiss Ephemeris rise_trans — uses actual solar position + atmospheric refraction
  if (sweph && typeof sweph.rise_trans === 'function') {
    try {
      const jdStart = localMidnightJD(dateStr, place);
      // [longitude, latitude, elevation_m] — elevation 0 matches traditional horizon
      const geopos  = [place.lon, place.lat, 0];
      const atpress = 1013.25; // standard atmosphere (mbar)
      const attemp  = 22.0;   // typical temperature (°C)
      const SEFLG_SWIEPH = 2;
      const SE_CALC_RISE = 1;
      const SE_CALC_SET  = 2;

      const riseRes = sweph.rise_trans(jdStart, 0, '', SEFLG_SWIEPH, SE_CALC_RISE, geopos, atpress, attemp);
      const setRes  = sweph.rise_trans(jdStart, 0, '', SEFLG_SWIEPH, SE_CALC_SET,  geopos, atpress, attemp);

      if (riseRes && setRes && !riseRes.error && !setRes.error) {
        const jdToLocalMin = (jd) => {
          const d = new Date((jd - 2440587.5) * 86400000);
          return wrapDay(d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + place.tzMin);
        };
        const riseJD = Array.isArray(riseRes.data) ? riseRes.data[0] : riseRes.data;
        const setJD  = Array.isArray(setRes.data)  ? setRes.data[0]  : setRes.data;
        const srMin = Math.round(jdToLocalMin(riseJD));
        const ssMin = Math.round(jdToLocalMin(setJD));
        // Inside the Arctic and Antarctic circles the Sun can fail to rise or
        // set at all, and the eight parts of the day stop meaning anything.
        // Only accept a day that runs forwards.
        if (ssMin > srMin) return { srMin, ssMin };
      }
    } catch (_) { /* fall through to Spencer */ }
  }

  // Spencer formula fallback (~±3 min accuracy)
  const d   = new Date(dateStr + 'T12:00:00Z');
  const doy = Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000);
  const B   = (2 * Math.PI / 365) * doy;
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
                           - 0.014615 * Math.cos(2*B) - 0.04089  * Math.sin(2*B));
  const decl = 0.006918 - 0.399912 * Math.cos(B) + 0.070257 * Math.sin(B)
             - 0.006758 * Math.cos(2*B) + 0.000907 * Math.sin(2*B)
             - 0.002697 * Math.cos(3*B) + 0.00148  * Math.sin(3*B);
  const lat  = place.lat * Math.PI / 180;
  const cosHA = (Math.sin(-0.01454) - Math.sin(lat) * Math.sin(decl))
               / (Math.cos(lat) * Math.cos(decl));
  // A latitude with no sunrise on this date clamps to a 12-hour day rather
  // than returning NaN and taking every downstream time with it.
  const HA = Math.acos(Math.max(-1, Math.min(1, cosHA))) * 180 / Math.PI || 90;
  // The clock a place keeps runs off its timezone's standard meridian, which
  // is 15° per hour of offset — 82.5°E for IST.
  const solarNoon = 720 - eqTime - 4 * (place.lon - place.tzMin / 4);
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

// The five limbs, read at sunrise.
//
// A panchang states the tithi, nakshatra, yoga and karana that are running
// *at sunrise* — that is what "today's nakshatra" means, and it is why a limb
// can be named for a day it ends early in. This used to read them at a fixed
// 06:00 IST, which is a fair approximation of sunrise at Ujjain and nowhere
// else: at Kolkata sunrise is 5:13 and at Mumbai 6:19, so the reference
// instant was out by up to an hour, and the Moon covers a third of a degree in
// that time. Now it is the day's actual sunrise at the place being asked
// about, so the limbs and the timings below are read off the same moment.
//
// `d` is a plain noon-UTC anchor for the date, used only for the weekday and
// for formatting. Deriving it from local midnight instead would land on the
// previous day once the server clock is UTC.
//
// It must be read with the UTC getters — `getUTCDay()`, and `timeZone:'UTC'`
// when formatting. `getDay()` reads the *server's* clock, and at UTC+12 noon
// UTC is already midnight tomorrow, so the vara came out a day late and took
// Rahu Kaal, the Choghadiya table and the lucky colour with it.
function calcCore(dateStr, place = DEFAULT_PLACE) {
  const d = new Date(dateStr + 'T12:00:00Z');
  const { srMin, ssMin } = getSunriseSunsetMin(dateStr, place);
  const jd = localMidnightJD(dateStr, place) + srMin / 1440;
  const { sunLon, moonLon } = calcAtJD(jd);
  const tithiRaw     = ((moonLon - sunLon + 360) % 360) / 12;
  const tithiIndex   = Math.floor(tithiRaw) % 30;
  const nakshatraIdx = Math.floor(moonLon / (360 / 27)) % 27;
  const yogaIndex    = Math.floor(((sunLon + moonLon) % 360) / (360 / 27)) % 27;
  const karanaIndex  = Math.floor(tithiRaw * 2) % 11;
  return { d, jd, srMin, ssMin, sunLon, moonLon, tithiRaw, tithiIndex, nakshatraIdx, yogaIndex, karanaIndex };
}

// `baseMin` is the clock time the positions were read at — sunrise — so that
// "ends in 6.2 hours" becomes a time on the same clock the rest of the page
// prints. It was hardcoded to 6 AM alongside the old reference instant.
function calcTimings(sunLon, moonLon, tithiRaw, jd, baseMin = 360) {
  // Use actual positions 24 h later to get real instantaneous speeds
  const { sunLon: s1, moonLon: m1 } = calcAtJD(jd + 1);
  let mDelta = m1 - moonLon; if (mDelta < 0) mDelta += 360;
  let sDelta = s1 - sunLon;  if (sDelta < 0) sDelta += 360;
  const synodic = Math.max(mDelta - sDelta, 8);   // deg/day, guard minimum
  const moonSpd = Math.max(mDelta, 10);
  const yogaSpd = Math.max(mDelta + sDelta, 11);

  const addHrs = (hrs) => {
    const totalMin = Math.round(baseMin) + Math.round(Math.max(0, hrs) * 60);
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

function buildTithiSchedule(startDateStr, count, place = DEFAULT_PLACE) {
  count = count || 8;
  const STEP_MS  = 20 * 60000; // 20-min steps
  const refMs    = new Date(`${startDateStr}T06:00:00${tzSuffix(place.tzMin)}`).getTime();
  const scanFrom = refMs - 3 * 86400000;
  const scanTo   = refMs + (count + 2) * 86400000;

  // A tithi changes at one instant everywhere; only the clock it is read off
  // differs. Shift into the place's offset and format as UTC, which works for
  // any offset without needing an IANA zone name.
  const fmt = (ms) => {
    const local = new Date(ms + place.tzMin * 60000);
    return {
      time: local.toLocaleTimeString('en-IN', { hour12:true, hour:'numeric', minute:'2-digit', timeZone:'UTC' }),
      date: local.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric', timeZone:'UTC' }),
    };
  };

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
    const place = placeFrom(req);
    const { d, jd, srMin, ssMin, sunLon, moonLon, tithiRaw, tithiIndex, nakshatraIdx, yogaIndex, karanaIndex } = calcCore(dateStr, place);

    const tithi      = TITHIS[tithiIndex] || 'Pratipada';
    const tithiPaksha= tithiIndex < 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
    const nakshatra  = NAKSHATRAS[nakshatraIdx];
    const nakshatraPada = Math.floor((moonLon % (360 / 27)) / (360 / 27 / 4)) + 1;
    const yoga       = YOGA_NAMES[yogaIndex];
    const karana     = KARANA_NAMES[karanaIndex];
    const vara       = VARA[d.getUTCDay()];
    const varaLord   = VARA_LORD[d.getUTCDay()];

    const timings = calcTimings(sunLon, moonLon, tithiRaw, jd, srMin);
    const div = dayDivisions(srMin, ssMin, vara);
    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }),
      vara, varaLord, tithi, tithiPaksha,
      tithiMeaning: TITHI_MEANING[tithi] || 'A balanced day for steady progress',
      nakshatra, nakshatraPada, yoga, karana,
      sunrise: minToTime(srMin), sunset: minToTime(ssMin),
      rahuKaal: div.rahu.text,
      abhijit:  div.abhijit.text,
      abhijitNote: abhijitCaveat(vara, div.abhijit, div.rahu),
      luckyColor: LUCKY_COLORS[vara], luckyNumber: LUCKY_NUMBERS[vara], goodFor: GOOD_WORK[vara],
      moonDegree: moonLon.toFixed(2), sunDegree: sunLon.toFixed(2),
      place: placeInfo(place),
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
    const place = placeFrom(req);
    const { d, jd, srMin, sunLon, moonLon, tithiRaw, tithiIndex } = calcCore(dateStr, place);
    const tithi    = TITHIS[tithiIndex];
    const paksha   = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
    const tithiNum = tithiIndex < 15 ? tithiIndex + 1 : tithiIndex - 14;
    const vara     = VARA[d.getUTCDay()];
    const details  = TITHI_DETAILS[tithi] || TITHI_DETAILS['Pratipada'];
    const { tithiEnds, nextTithi } = calcTimings(sunLon, moonLon, tithiRaw, jd, srMin);
    const tithiChart = buildTithiSchedule(dateStr, 8, place);
    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }),
      tithi, paksha, tithiNum,
      tithiPaksha: `${paksha} — ${tithi} (${tithiNum})`,
      ...details,
      meaning: TITHI_MEANING[tithi] || 'A balanced day for steady progress',
      vara, varaLord: VARA_LORD[d.getUTCDay()],
      tithiEnds, nextTithi, tithiChart,
      location: place.label,
      place: placeInfo(place),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Tithi' });
  }
}

// ─── Today's Nakshatra ────────────────────────────────────────────────────────

function getTodayNakshatra(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const place = placeFrom(req);
    const { d, jd, srMin, sunLon, moonLon, tithiRaw, nakshatraIdx } = calcCore(dateStr, place);
    const nakshatra = NAKSHATRAS[nakshatraIdx];
    const pada      = Math.floor((moonLon % (360 / 27)) / (360 / 27 / 4)) + 1;
    const info      = NAKSHATRA_DATA[nakshatra] || {};
    const vara      = VARA[d.getUTCDay()];
    const { nakshatraEnds, nextNakshatra } = calcTimings(sunLon, moonLon, tithiRaw, jd, srMin);
    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }),
      nakshatra, pada, nakshatraNum: nakshatraIdx + 1,
      moonDegree: moonLon.toFixed(2),
      ...info,
      vara, varaLord: VARA_LORD[d.getUTCDay()],
      nakshatraEnds, nextNakshatra,
      place: placeInfo(place),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Nakshatra' });
  }
}

// ─── Today's Choghadiya ───────────────────────────────────────────────────────

function getTodayChoghadiya(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const place = placeFrom(req);
    const { d, srMin, ssMin } = calcCore(dateStr, place);
    const vara = VARA[d.getUTCDay()];
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

    const nowMin = nowMinAt(place);
    const findCurrent = (slots) => slots.findIndex(s => nowMin >= s.startMin && nowMin < s.endMin);

    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }),
      vara, sunrise: minToTime(srMin), sunset: minToTime(ssMin),
      daySlots, nightSlots,
      currentDaySlotIdx:   findCurrent(daySlots),
      currentNightSlotIdx: findCurrent(nightSlots),
      place: placeInfo(place),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Choghadiya' });
  }
}

// ─── Today's Rahu Kaal ────────────────────────────────────────────────────────

function getTodayRahuKaal(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const place = placeFrom(req);
    const { d, srMin, ssMin } = calcCore(dateStr, place);
    const vara = VARA[d.getUTCDay()];
    const div = dayDivisions(srMin, ssMin, vara);

    const nowMin = nowMinAt(place);
    const isRahuActive = nowMin >= div.rahu.startMin && nowMin < div.rahu.endMin;

    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }),
      vara, varaLord: VARA_LORD[d.getUTCDay()],
      sunrise: minToTime(srMin), sunset: minToTime(ssMin),
      rahuKaal:   div.rahu.text,
      yamaganda:  div.yamaganda.text,
      gulika:     div.gulika.text,
      rahuPart: RAHU_PART[vara], yamPart: YAMGANDA_PART[vara], gulikaPart: GULIKA_PART[vara],
      isRahuActive,
      rahuStartMin: div.rahu.startMin,
      rahuEndMin:   div.rahu.endMin,
      place: placeInfo(place),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Rahu Kaal' });
  }
}

// ─── Today's Shubhamuhurat ────────────────────────────────────────────────────

function getTodayShubhamuhurat(req, res) {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const place = placeFrom(req);
    const { d, srMin, ssMin, tithiIndex, nakshatraIdx } = calcCore(dateStr, place);
    const vara = VARA[d.getUTCDay()];
    const div = dayDivisions(srMin, ssMin, vara);

    const brahma   = `${minToTime(srMin - 96)} – ${minToTime(srMin - 48)}`;
    const pratah   = `${minToTime(srMin - 24)} – ${minToTime(srMin + 24)}`;
    const abhijit  = div.abhijit.text;
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
    const rahuTime = div.rahu.text;

    const ACTIVITY_MUHURTA = {
      Marriage:  vara === 'Monday' || vara === 'Wednesday' || vara === 'Thursday' || vara === 'Friday' ? abhijit : null,
      Business:  vara === 'Wednesday' || vara === 'Thursday' ? abhijit : vijaya,
      Travel:    vara === 'Wednesday' || vara === 'Monday' ? pratah : abhijit,
      Education: vara === 'Wednesday' || vara === 'Thursday' ? abhijit : pratah,
      Property:  vara === 'Wednesday' || vara === 'Saturday' ? abhijit : vijaya,
      Medicine:  pratah,
    };

    res.json({
      date: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }),
      vara, varaLord: VARA_LORD[d.getUTCDay()],
      brahma, pratah, abhijit, vijaya, godhuli, nisitha,
      isSarvarthaSiddhi, isAmritSiddhi, todayNakshatra,
      abhijitNote: abhijitCaveat(vara, div.abhijit, div.rahu),
      rahuKaal: rahuTime,
      activities: ACTIVITY_MUHURTA,
      place: placeInfo(place),
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
    const place = placeFrom(req);
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(month).padStart(2,'0');
      const dd = String(day).padStart(2,'0');
      const dateStr = `${year}-${mm}-${dd}`;
      try {
        const { d, tithiIndex, nakshatraIdx } = calcCore(dateStr, place);
        const tithi     = TITHIS[tithiIndex];
        const nakshatra = NAKSHATRAS[nakshatraIdx];
        const vara      = VARA[d.getUTCDay()];
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
    const firstDayOfWeek = new Date(`${year}-${String(month).padStart(2,'0')}-01`).getUTCDay();
    res.json({ year, month, monthName: new Date(year, month-1, 1).toLocaleString('en-IN',{month:'long'}), firstDayOfWeek, days, place: placeInfo(place) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate Calendar' });
  }
}

// Shared helpers for muhurtaController (no duplication)
function getPanchangData(dateStr, place = DEFAULT_PLACE) {
  const core = calcCore(dateStr, place);
  const { d, srMin, ssMin, tithiIndex, nakshatraIdx, yogaIndex, karanaIndex, sunLon, moonLon } = core;
  return {
    dateStr,
    vara:        VARA[d.getUTCDay()],
    varaLord:    VARA_LORD[d.getUTCDay()],
    dayIndex:    d.getUTCDay(),
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
    choghadiyaDay:   CHOGHADIYA_DAY[VARA[d.getUTCDay()]]   || [],
    choghadiyaNight: CHOGHADIYA_NIGHT[VARA[d.getUTCDay()]] || [],
    rahuPart:    RAHU_PART[VARA[d.getUTCDay()]],
    yamgandaPart:YAMGANDA_PART[VARA[d.getUTCDay()]],
    gulikaPart:  GULIKA_PART[VARA[d.getUTCDay()]],
    choghadiyaInfo: CHOGHADIYA_INFO,
  };
}

module.exports = { getPanchang, getTodayTithi, getTodayNakshatra, getTodayChoghadiya, getTodayRahuKaal, getTodayShubhamuhurat, getPanchangCalendar, getPanchangData };
