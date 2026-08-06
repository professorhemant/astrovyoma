// Hindu festival + planetary event calendar, computed from the ephemeris.
//
// The previous implementation was a hand-typed table of dates that ran out on
// 2026-05-29, and a second table in panchangController that disagreed with it.
// Festival dates are a function of the Moon's elongation from the Sun, so they
// are computable — this derives them instead, and never expires.
//
// Conventions:
//   Ayanamsha   Lahiri (Chitrapaksha), matching kundaliEngine and panchang.
//   Month       Amanta (month ends at Amavasya). The lunation is named for the
//               rashi the Sun enters during it: Mesha -> Chaitra, and so on.
//               Purnimanta names are carried alongside for display, since North
//               Indian usage names the Krishna paksha for the following month.
//   Day         A tithi belongs to the day it is running at sunrise (Ujjain).
//               This is the standard rule; the handful of festivals fixed by
//               nishita (midnight) or pradosh (dusk) instead are marked below.
//   Reference   Ujjain, the traditional prime meridian for Indian almanacs.

let sweph = null;
try { sweph = require('sweph'); console.log('[festivals] sweph loaded — computing from ephemeris'); }
catch (_) { console.warn('[festivals] sweph unavailable — falling back to analytic positions'); }

const UJJAIN_LAT = 23.1765;
const UJJAIN_LON = 75.7885;

const SE_SUN = 0, SE_MOON = 1;
const PLANETS = [
  { id: 2, name: 'Mercury' },
  { id: 3, name: 'Venus'   },
  { id: 4, name: 'Mars'    },
  { id: 5, name: 'Jupiter' },
  { id: 6, name: 'Saturn'  },
];

// Amanta order. Index is used by the rule table below.
const MONTHS = ['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
                'Ashwin','Kartika','Margashirsha','Pausha','Magha','Phalguna'];

const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// Sankranti names — the Sun's entry into each sidereal sign.
const SANKRANTI = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
                   'Tula','Vrischika','Dhanu','Makar','Kumbha','Meena'];

// ─── ephemeris ───────────────────────────────────────────────────────────────

function jdFromUTC(ms) { return 2440587.5 + ms / 86400000; }
function utcFromJD(jd) { return new Date((jd - 2440587.5) * 86400000); }

// Sidereal longitude in degrees.
function lon(jd, body) {
  if (sweph) {
    sweph.set_sid_mode(1, 0, 0);            // SE_SIDM_LAHIRI
    const flag = 2 | (64 * 1024) | 256;     // SWIEPH | SIDEREAL | SPEED
    const r = sweph.calc_ut(jd, body, flag);
    const v = r.data ? r.data[0] : r.longitude;
    return ((v % 360) + 360) % 360;
  }
  // Analytic fallback — good to a few arcminutes for Sun/Moon, enough to keep
  // the calendar approximately right if the native module is missing.
  const T = (jd - 2451545.0) / 36525;
  const ayanamsa = 23.85 + T * 50.3 / 3600;
  const trop = body === SE_MOON
    ? 218.3165 + 481267.8813 * T
    : 280.46646 + 36000.76983 * T;
  return (((trop % 360) + 360) % 360 - ayanamsa + 360) % 360;
}

function lonSpeed(jd, body) {
  if (sweph) {
    sweph.set_sid_mode(1, 0, 0);
    const flag = 2 | (64 * 1024) | 256;
    const r = sweph.calc_ut(jd, body, flag);
    if (r.data && r.data.length > 3) return r.data[3];
  }
  const a = lon(jd - 0.5, body), b = lon(jd + 0.5, body);
  let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360;
  return d;
}

// Moon's elongation from the Sun, 0-360. Tithi = floor(elongation / 12).
function elongation(jd) {
  return ((lon(jd, SE_MOON) - lon(jd, SE_SUN)) % 360 + 360) % 360;
}

// ─── sunrise ─────────────────────────────────────────────────────────────────

// Sunrise at Ujjain as a JD (UT). Swiss Ephemeris where available, Spencer's
// formula otherwise (~3 min, which only matters for a tithi turning over within
// those 3 minutes).
function sunriseJD(dateStr) {
  if (sweph && typeof sweph.rise_trans === 'function') {
    try {
      const jdStart = jdFromUTC(new Date(dateStr + 'T00:00:00+05:30').getTime());
      const r = sweph.rise_trans(jdStart, SE_SUN, '', 2, 1, [UJJAIN_LON, UJJAIN_LAT, 0], 1013.25, 22.0);
      if (r && !r.error) {
        const jd = Array.isArray(r.data) ? r.data[0] : r.data;
        if (typeof jd === 'number' && isFinite(jd)) return jd;
      }
    } catch (_) { /* fall through */ }
  }
  const d   = new Date(dateStr + 'T12:00:00+05:30');
  const doy = Math.round((d - new Date(d.getFullYear(), 0, 1)) / 86400000);
  const B   = (2 * Math.PI / 365) * doy;
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
                           - 0.014615 * Math.cos(2*B) - 0.04089 * Math.sin(2*B));
  const decl = 0.006918 - 0.399912 * Math.cos(B) + 0.070257 * Math.sin(B)
             - 0.006758 * Math.cos(2*B) + 0.000907 * Math.sin(2*B)
             - 0.002697 * Math.cos(3*B) + 0.00148 * Math.sin(3*B);
  const lat = UJJAIN_LAT * Math.PI / 180;
  const cosHA = (Math.sin(-0.01454) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
  const HA = Math.acos(Math.max(-1, Math.min(1, cosHA))) * 180 / Math.PI;
  const solarNoonMin = 720 - eqTime - 4 * (UJJAIN_LON - 82.5);   // IST minutes
  const riseMin = solarNoonMin - HA * 4;
  return jdFromUTC(new Date(dateStr + 'T00:00:00+05:30').getTime() + riseMin * 60000);
}

// ─── root finding ────────────────────────────────────────────────────────────

// JDs in [jd0, jd1) where the Moon's elongation crosses `target` degrees.
function findElongationCrossings(jd0, jd1, target) {
  const out = [];
  const step = 0.25;
  const rel = (jd) => {
    let v = elongation(jd) - target;
    if (v > 180) v -= 360;
    if (v < -180) v += 360;
    return v;
  };
  let prevJD = jd0, prevV = rel(jd0);
  for (let jd = jd0 + step; jd <= jd1; jd += step) {
    const v = rel(jd);
    // Elongation increases monotonically, so only catch negative -> positive.
    if (prevV < 0 && v >= 0) {
      let lo = prevJD, hi = jd;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (rel(mid) < 0) lo = mid; else hi = mid;
      }
      out.push((lo + hi) / 2);
    }
    prevJD = jd; prevV = v;
  }
  return out;
}

// JDs in [jd0, jd1) where the Sun enters a new sidereal sign, with sign index.
function findSankrantis(jd0, jd1) {
  const out = [];
  let prev = Math.floor(lon(jd0, SE_SUN) / 30);
  for (let jd = jd0 + 0.5; jd <= jd1; jd += 0.5) {
    const cur = Math.floor(lon(jd, SE_SUN) / 30);
    if (cur !== prev) {
      let lo = jd - 0.5, hi = jd;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (Math.floor(lon(mid, SE_SUN) / 30) === prev) lo = mid; else hi = mid;
      }
      out.push({ jd: (lo + hi) / 2, sign: cur });
    }
    prev = cur;
  }
  return out;
}

// ─── calendar scaffolding ────────────────────────────────────────────────────

function istDateStr(jd) {
  const d = utcFromJD(jd + 330 / 1440);   // shift to IST before slicing
  return d.toISOString().slice(0, 10);
}

function eachDay(year) {
  const days = [];
  const d = new Date(Date.UTC(year, 0, 1));
  while (d.getUTCFullYear() === year) {
    days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

// Build the lunar months overlapping the year, each named by the sankranti that
// falls inside it. A lunation containing no sankranti is an adhika (leap) month
// and carries no festivals.
function buildLunarMonths(year) {
  const jd0 = jdFromUTC(Date.UTC(year - 1, 10, 1));   // start early enough to
  const jd1 = jdFromUTC(Date.UTC(year + 1, 2, 1));    // bracket the whole year
  const newMoons = findElongationCrossings(jd0, jd1, 0);
  const sankrantis = findSankrantis(jd0, jd1);

  const months = [];
  for (let i = 0; i < newMoons.length - 1; i++) {
    const start = newMoons[i], end = newMoons[i + 1];
    const inside = sankrantis.filter(s => s.jd >= start && s.jd < end);
    if (inside.length === 0) {
      months.push({ start, end, index: null, adhika: true, name: 'Adhika' });
    } else {
      // Sun entering Mesha (0) names the month Chaitra (0).
      const index = inside[0].sign;
      months.push({ start, end, index, adhika: false, name: MONTHS[index] });
    }
  }
  return months;
}

// ─── festival rules ──────────────────────────────────────────────────────────
//
// m: Amanta month index. p: 'S' shukla / 'K' krishna. t: tithi 1-15
// (S15 = Purnima, K15 = Amavasya). ref: which moment fixes the day.
//   'sunrise' (default) — the tithi running at sunrise
//   'nishita'           — the tithi covering midnight
//   'pradosh'           — the tithi running at dusk
// offset: days to shift (Holika Dahan is the eve of the Holi purnima).

const FESTIVAL_RULES = [
  // ── Chaitra ──
  { m:0, p:'S', t:1,  title:'Gudi Padwa / Ugadi',       desc:'Hindu New Year for Maharashtra, Karnataka, Andhra Pradesh and Telangana. Chaitra Shukla Pratipada — a new Vikram Samvat begins.' },
  { m:0, p:'S', t:1,  title:'Chaitra Navratri Begins',  desc:'Nine sacred nights of Goddess Durga in spring. Fasting and Devi puja through to Ram Navami.' },
  { m:0, p:'S', t:3,  title:'Gauri / Gangaur Tritiya',  desc:'Worship of Gauri for marital happiness — especially observed in Rajasthan.' },
  { m:0, p:'S', t:9,  title:'Ram Navami',               desc:'Birth of Lord Ram on Chaitra Shukla Navami. Recite the Ramayana, fast, and visit Ram temples.' },
  { m:0, p:'S', t:13, title:'Mahavir Jayanti',          desc:'Birth of Bhagwan Mahavira, the 24th Tirthankara of Jainism.' },
  { m:0, p:'S', t:15, title:'Hanuman Jayanti',          desc:'Birth of Lord Hanuman on Chaitra Purnima. Recite the Hanuman Chalisa and offer sindoor.' },

  // ── Vaishakha ──
  { m:1, p:'S', t:3,  title:'Akshaya Tritiya',          desc:'One of the most auspicious days of the year — anything begun today is believed never to diminish. Traditional for gold purchase and new ventures.' },
  { m:1, p:'S', t:15, title:'Buddha Purnima',           desc:'Vesak — the birth, enlightenment and passing of Gautama Buddha, all on Vaishakha Purnima.' },
  { m:1, p:'K', t:15, title:'Shani Jayanti',            desc:'Birth of Lord Shani. Offer mustard oil, black sesame and iron; observe Saturn remedies.' },

  // ── Jyeshtha ──
  { m:2, p:'S', t:15, title:'Vat Purnima',              desc:'Married women tie thread around the banyan tree and fast for their husband\'s long life.' },

  // ── Ashadha ──
  { m:3, p:'S', t:2,  title:'Rath Yatra',               desc:'Grand chariot festival of Lord Jagannath at Puri, Odisha — attended by millions.' },
  { m:3, p:'S', t:15, title:'Guru Purnima',             desc:'Vyasa Purnima — the day to honour and worship one\'s spiritual teacher.' },

  // ── Shravana ──
  { m:4, p:'S', t:15, title:'Raksha Bandhan',           desc:'Sisters tie the rakhi on their brothers\' wrists — the sacred bond of protection, on Shravana Purnima.' },
  // Krishna is worshipped at nishita, but the observed day is the one on which
  // Ashtami is running at sunrise — in 2025 nishita alone lands a day early.
  { m:4, p:'K', t:8,  title:'Janmashtami',              desc:'Birth of Lord Krishna, celebrated at midnight with fasting, bhajan and Dahi Handi.' },

  // ── Bhadrapada ──
  { m:5, p:'S', t:4,  title:'Ganesh Chaturthi',         desc:'Ten-day festival for the birth of Lord Ganesha. Clay idols are installed and immersed on Anant Chaturdashi.' },
  { m:5, p:'S', t:14, title:'Anant Chaturdashi',        desc:'Final day of Ganeshotsav — Ganpati Visarjan. Worship of Anant (Vishnu) and the tying of the anant sutra.' },
  { m:5, p:'S', t:15, title:'Pitru Paksha Begins',      desc:'The fortnight of the ancestors opens the day after Bhadrapada Purnima. Offer tarpan and shraddha.' },
  { m:5, p:'K', t:15, title:'Sarva Pitru Amavasya',     desc:'Mahalaya — the last day of Pitru Paksha. Tarpan for all ancestors, whether or not their date of passing is known.' },

  // ── Ashwin ──
  { m:6, p:'S', t:1,  title:'Shardiya Navratri Begins', desc:'The great autumn Navratri — nine nights of Durga worship leading to Dussehra.' },
  { m:6, p:'S', t:8,  title:'Durga Ashtami',            desc:'Mahaashtami — Kanya Pujan and the height of Durga Puja.' },
  { m:6, p:'S', t:9,  title:'Maha Navami',              desc:'Ninth night of Navratri — Siddhidatri puja and havan.' },
  { m:6, p:'S', t:10, title:'Dussehra / Vijayadashami', desc:'Victory of Ram over Ravana and of Durga over Mahishasura. Ravana effigies are burned; new ventures are begun.' },
  { m:6, p:'S', t:15, title:'Sharad Purnima',           desc:'The brightest full moon of the year — kheer is left in the moonlight and taken as prasad.' },
  { m:6, p:'K', t:4,  title:'Karwa Chauth',             desc:'Married women fast from sunrise until moonrise for their husband\'s long life.', ref:'pradosh' },
  { m:6, p:'K', t:13, title:'Dhanteras',                desc:'Worship of Dhanvantari and Lakshmi. Buying metal, gold or utensils today is held to multiply wealth.', ref:'pradosh' },
  { m:6, p:'K', t:14, title:'Naraka Chaturdashi',       desc:'Chhoti Diwali — abhyanga snan before sunrise and lamps against Naraka.' },
  { m:6, p:'K', t:15, title:'Diwali / Lakshmi Puja',    desc:'The festival of lights on Kartika Amavasya. Lakshmi and Ganesh puja at pradosh, lamps through the night.', ref:'pradosh' },

  // ── Kartika ──
  { m:7, p:'S', t:1,  title:'Govardhan Puja',           desc:'Annakut — Krishna lifting Govardhan hill. A mountain of food is offered.' },
  { m:7, p:'S', t:2,  title:'Bhai Dooj',                desc:'Sisters apply tilak and pray for their brothers\' long life — the closing day of Diwali.' },
  // Dated by Sandhya Arghya, offered to the setting sun on Shashthi. The
  // four-day observance runs Nahay Khay, Kharna, Sandhya Arghya, Usha Arghya;
  // this is the third and principal day.
  { m:7, p:'S', t:6,  title:'Chhath Puja (Sandhya Arghya)', desc:'Principal day of the four-day Chhath — arghya offered to the setting sun, with Usha Arghya to the rising sun the next morning.', ref:'pradosh' },
  { m:7, p:'S', t:11, title:'Devutthana Ekadashi',      desc:'Vishnu wakes from his four-month cosmic sleep. The wedding season reopens; Tulsi Vivah is performed.' },
  { m:7, p:'S', t:15, title:'Kartik Purnima / Dev Diwali', desc:'Dev Diwali — the gods\' festival of lights. Lamps are floated on the Ganga at Varanasi. Guru Nanak Jayanti falls on this day.' },

  // ── Margashirsha ──
  { m:8, p:'S', t:5,  title:'Vivah Panchami',           desc:'Anniversary of the wedding of Ram and Sita, celebrated at Janakpur and Ayodhya.' },
  { m:8, p:'S', t:11, title:'Gita Jayanti',             desc:'The day Krishna spoke the Bhagavad Gita to Arjuna at Kurukshetra.' },

  // ── Pausha ──
  { m:9, p:'S', t:15, title:'Paush Purnima',            desc:'Opening full moon of the Magh Mela — a holy dip at Prayagraj begins the month-long Kalpavas.' },

  // ── Magha ──
  { m:10, p:'S', t:5,  title:'Vasant Panchami',         desc:'Saraswati Puja — worship of the goddess of learning and the arts. Yellow is worn; spring begins.' },
  { m:10, p:'S', t:15, title:'Magha Purnima',           desc:'Highly meritorious bathing day at the Sangam, closing the Kalpavas.' },
  { m:10, p:'K', t:14, title:'Maha Shivratri',          desc:'The great night of Shiva — fasting, all-night vigil, and abhishek through the four prahars.', ref:'nishita' },

  // ── Phalguna ──
  { m:11, p:'S', t:15, title:'Holika Dahan',            desc:'The bonfire on the eve of Holi — the burning of Holika marks devotion triumphing over evil.', ref:'pradosh' },
  // Holi is the morning after the Holika bonfire, so it hangs off the same
  // pradosh anchor rather than off the sunrise purnima, which can be a day later.
  { m:11, p:'S', t:15, title:'Holi',                    desc:'The festival of colours on the day after Holika Dahan. Play with colour, forgive, and welcome spring.', ref:'pradosh', offset: 1 },
];

// Ekadashi names, Amanta convention.
const EKADASHI = {
  '0S':'Kamada Ekadashi',      '0K':'Varuthini Ekadashi',
  '1S':'Mohini Ekadashi',      '1K':'Apara Ekadashi',
  '2S':'Nirjala Ekadashi',     '2K':'Yogini Ekadashi',
  '3S':'Devshayani Ekadashi',  '3K':'Kamika Ekadashi',
  '4S':'Shravana Putrada Ekadashi', '4K':'Aja Ekadashi',
  '5S':'Parivartini Ekadashi', '5K':'Indira Ekadashi',
  '6S':'Papankusha Ekadashi',  '6K':'Rama Ekadashi',
  '7S':'Devutthana Ekadashi',  '7K':'Utpanna Ekadashi',
  '8S':'Mokshada Ekadashi',    '8K':'Saphala Ekadashi',
  '9S':'Pausha Putrada Ekadashi', '9K':'Shattila Ekadashi',
  '10S':'Jaya Ekadashi',       '10K':'Vijaya Ekadashi',
  '11S':'Amalaki Ekadashi',    '11K':'Papmochani Ekadashi',
};

// Fixed Gregorian observances the lunar calendar has nothing to say about.
const FIXED = [
  { md:'01-01', title:'New Year\'s Day',      desc:'Gregorian New Year.' },
  { md:'01-26', title:'Republic Day',         desc:'India\'s Constitution came into force in 1950.' },
  { md:'08-15', title:'Independence Day',     desc:'India\'s independence, 1947.' },
  { md:'10-02', title:'Gandhi Jayanti',       desc:'Birth of Mahatma Gandhi, 1869.' },
  { md:'12-25', title:'Christmas',            desc:'Birth of Jesus Christ.' },
];

// ─── the tithi grid ──────────────────────────────────────────────────────────

// The three reference instants of each day, as JDs. Which one fixes a given
// festival depends on its rule.
function buildDayGrid(year) {
  return eachDay(year).map(dateStr => ({
    dateStr,
    srJD:   sunriseJD(dateStr),
    duskJD: jdFromUTC(new Date(dateStr + 'T18:30:00+05:30').getTime()),
    midJD:  jdFromUTC(new Date(dateStr + 'T24:00:00+05:30').getTime()),
  }));
}

// tithi index 0-29 for a (paksha, number) rule
function tithiIndex(p, t) { return p === 'S' ? t - 1 : 14 + t; }

// Elongation rises monotonically from 0 to 360 across a lunation, so the
// instant a tithi begins is a plain bisection.
function bisectElongation(lo, hi, targetDeg) {
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (elongation(mid) < targetDeg) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function tithiStartJD(mo, want) {
  if (want === 0) return mo.start;                       // the new moon itself
  return bisectElongation(mo.start, mo.end - 0.001, want * 12);
}

// The date a tithi belongs to, by the reference instant its festival uses.
//
// A tithi shorter than a day can slip between two consecutive reference
// instants and touch neither — a kshaya tithi. Scanning the day grid for a
// match then finds nothing, so the observance falls on the day the tithi
// opens. Chaitra Shukla Pratipada 2026 is exactly this case: it begins after
// sunrise on 19 Mar and ends before sunrise on 20 Mar, and Gudi Padwa is
// nonetheless kept on the 19th.
function resolveTithiDate(mo, want, ref, days) {
  const start = tithiStartJD(mo, want);
  const end   = want === 29 ? mo.end : tithiStartJD(mo, want + 1);
  const key   = ref === 'nishita' ? 'midJD' : ref === 'pradosh' ? 'duskJD' : 'srJD';
  const hit = days.find(d => d[key] >= start && d[key] < end);
  return hit ? hit.dateStr : istDateStr(start);
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── generation ──────────────────────────────────────────────────────────────

function generate(year) {
  const events = [];
  const push = (date, title, type, desc, extra) => {
    if (!date || !date.startsWith(String(year))) return;
    events.push({ date, title, type, desc, ...(extra || {}) });
  };

  const months = buildLunarMonths(year);
  const days   = buildDayGrid(year);

  // ── festivals ──
  for (const mo of months) {
    if (mo.adhika || mo.index === null) continue;

    for (const rule of FESTIVAL_RULES) {
      if (rule.m !== mo.index) continue;
      const want = tithiIndex(rule.p, rule.t);
      const base = resolveTithiDate(mo, want, rule.ref, days);
      push(rule.offset ? shiftDate(base, rule.offset) : base, rule.title, 'festival', rule.desc);
    }

    // ── purnima / amavasya / ekadashi for this lunation ──
    push(resolveTithiDate(mo, 14, 'sunrise', days), `${mo.name} Purnima`, 'purnima',
      `Full moon of ${mo.name} — fasting, charity and a holy dip are held especially meritorious.`);

    push(resolveTithiDate(mo, 29, 'sunrise', days), `${mo.name} Amavasya`, 'amavasya',
      `New moon of ${mo.name} — tarpan for the ancestors, charity and fasting.`);

    for (const p of ['S', 'K']) {
      const name = EKADASHI[`${mo.index}${p}`];
      if (!name) continue;
      push(resolveTithiDate(mo, tithiIndex(p, 11), 'sunrise', days), name, 'ekadashi',
        `${p === 'S' ? 'Shukla' : 'Krishna'} paksha Ekadashi of ${mo.name} — fast from grains and beans, and keep vigil for Vishnu.`);
    }
  }

  // ── sankrantis (solar transits) ──
  const yStart = jdFromUTC(Date.UTC(year, 0, 1));
  const yEnd   = jdFromUTC(Date.UTC(year + 1, 0, 1));
  for (const s of findSankrantis(yStart, yEnd)) {
    const date = istDateStr(s.jd);
    const nm = SANKRANTI[s.sign];
    if (s.sign === 9) {
      push(date, 'Makar Sankranti', 'festival',
        'The Sun enters Capricorn and begins its northward journey. Harvest festival — til-gur, kite flying and a holy dip.');
      push(date, 'Uttarayana Begins', 'transit',
        'The Sun turns north. The most auspicious half of the year for sacraments and spiritual work.', { planet: 'Sun' });
    } else if (s.sign === 3) {
      push(date, 'Dakshinayana Begins', 'transit',
        'The Sun turns south, opening the half of the year given to ancestral and inward practice.', { planet: 'Sun' });
    }
    push(date, `${nm} Sankranti`, 'transit',
      `The Sun enters sidereal ${RASHIS[s.sign]}. The day of a sankranti is auspicious for charity and bathing.`, { planet: 'Sun' });
  }

  // ── retrogrades ──
  for (const p of PLANETS) {
    let prev = lonSpeed(yStart - 5, p.id);
    for (let jd = yStart - 4; jd <= yEnd + 5; jd += 1) {
      const cur = lonSpeed(jd, p.id);
      if (prev >= 0 && cur < 0) {
        push(istDateStr(jd), `${p.name} Retrograde`, 'retrograde-start',
          `${p.name} turns retrograde in sidereal ${RASHIS[Math.floor(lon(jd, p.id) / 30)]}. Review and revisit rather than launch what ${p.name} governs.`,
          { planet: p.name });
      } else if (prev < 0 && cur >= 0) {
        push(istDateStr(jd), `${p.name} Direct`, 'retrograde-end',
          `${p.name} stations direct in sidereal ${RASHIS[Math.floor(lon(jd, p.id) / 30)]}. Matters it governs resume their forward course.`,
          { planet: p.name });
      }
      prev = cur;
    }
  }

  // ── eclipses ──
  events.push(...findEclipses(year));

  // ── fixed-date observances ──
  for (const f of FIXED) push(`${year}-${f.md}`, f.title, 'festival', f.desc);

  return dedupe(events);
}

function findEclipses(year) {
  if (!sweph) return [];
  const out = [];
  const start = jdFromUTC(Date.UTC(year, 0, 1));
  const end   = jdFromUTC(Date.UTC(year + 1, 0, 1));

  const kind = (flags, solar) => {
    // Swiss Ephemeris eclipse type bits
    const TOTAL = 4, ANNULAR = 8, PARTIAL = 16, PENUMBRAL = 64;
    if (flags & TOTAL)     return 'Total';
    if (flags & ANNULAR)   return 'Annular';
    if (flags & PENUMBRAL) return 'Penumbral';
    if (flags & PARTIAL)   return 'Partial';
    return solar ? 'Solar' : 'Lunar';
  };

  // r.error carries a non-fatal notice when the .se1 files are absent and the
  // Moshier theory is used instead — which is this project's normal mode. Judge
  // the call by whether it returned a usable time, not by that string.
  const usable = (r) => r && Array.isArray(r.data) && isFinite(r.data[0]) && r.data[0] > 0;

  try {
    let jd = start;
    for (let i = 0; i < 12 && jd < end; i++) {
      const r = sweph.sol_eclipse_when_glob(jd, 2, 0, false);
      if (!usable(r)) break;
      const max = r.data[0];
      if (max >= end) break;
      if (max >= start) {
        out.push({
          date: istDateStr(max),
          title: `${kind(r.flag, true)} Solar Eclipse`,
          type: 'eclipse',
          desc: `Surya Grahan on Amavasya. Traditionally: avoid eating during the eclipse, keep a fast, and bathe and give charity afterwards.`,
        });
      }
      jd = max + 1;
    }
  } catch (_) { /* eclipse search unavailable */ }

  try {
    let jd = start;
    for (let i = 0; i < 12 && jd < end; i++) {
      const r = sweph.lun_eclipse_when(jd, 2, 0, false);
      if (!usable(r)) break;
      const max = r.data[0];
      if (max >= end) break;
      if (max >= start) {
        out.push({
          date: istDateStr(max),
          title: `${kind(r.flag, false)} Lunar Eclipse`,
          type: 'eclipse',
          desc: `Chandra Grahan on Purnima. Traditionally: avoid eating during the eclipse, and bathe and give charity once it ends.`,
        });
      }
      jd = max + 1;
    }
  } catch (_) { /* eclipse search unavailable */ }

  return out;
}

// Same title on the same day can arrive from two rules (Purnima festivals
// especially). Keep the first.
function dedupe(events) {
  const seen = new Set();
  return events.filter(e => {
    const k = `${e.date}|${e.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

// ─── cache ───────────────────────────────────────────────────────────────────
//
// A year takes a few hundred ms of ephemeris work. Compute once, keep it.

const cache = new Map();

function getYear(year) {
  if (!cache.has(year)) cache.set(year, generate(year));
  return cache.get(year);
}

// Festival name for a single date, for the panchang calendar. Replaces the
// hand-typed FESTIVALS_2026 table that had drifted a year out of date.
function festivalFor(dateStr) {
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (!Number.isFinite(year)) return null;
  const hit = getYear(year).find(e => e.date === dateStr && e.type === 'festival');
  return hit ? hit.title : null;
}

module.exports = { getYear, festivalFor, generate, buildLunarMonths, MONTHS };
