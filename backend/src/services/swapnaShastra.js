'use strict';

// When a dream is due to come true.
//
// This is the one part of dream interpretation that is arithmetic rather than
// narration, and it is the part no other dream site does. The classical rule is
// that a dream's timing is fixed by *which watch of the night it fell in* — the
// same dream at 9 PM and at 4 AM carry different deadlines. From the Agni
// Purana's svapna-adhyaya (ch. 229), and repeated in the Brahmavaivarta:
//
//   first quarter  → within one year
//   second quarter → within six months
//   third quarter  → within three months
//   fourth quarter → within a fortnight
//   at dawn        → within ten days
//
// So the reader gets a date, not an adjective. No model is asked for any of
// this; a language model would invent a plausible-sounding window and be wrong
// in a way nobody could check.
//
// Everything here is computed against real sunrise and sunset for the dreamer's
// own place, which is why it borrows the panchang's Swiss Ephemeris rather than
// assuming a 6 AM sunrise. A night in Srinagar in December is not a night in
// Kanyakumari in June, and the quarters move with it.

const { getSunriseSunsetMin } = require('../controllers/panchangController');

// A muhurta is 48 minutes. The texts treat dawn as its own moment, distinct
// from the fourth watch that runs up to it, so the last muhurta before sunrise
// is pulled out and given the ten-day reading. Brahma Muhurta proper is the two
// muhurtas before sunrise — the whole of it sits inside the fourth watch, and
// its latter half is this dawn window.
const MUHURTA_MIN = 48;
const BRAHMA_MUHURTA_MIN = 96;

// months/days are what gets added to the dream's own date to produce the
// deadline. Kept as data so the rule is legible next to the citation above.
const FRUITION = [
  { key: 'first',  months: 12, en: 'within one year',    hi: 'एक वर्ष के भीतर' },
  { key: 'second', months: 6,  en: 'within six months',  hi: 'छह महीने के भीतर' },
  { key: 'third',  months: 3,  en: 'within three months',hi: 'तीन महीने के भीतर' },
  { key: 'fourth', days: 15,   en: 'within a fortnight', hi: 'पंद्रह दिन के भीतर' },
  { key: 'dawn',   days: 10,   en: 'within ten days',    hi: 'दस दिन के भीतर' },
];

const YAMA_LABEL = {
  first:  { en: 'First watch of the night',  hi: 'रात का पहला पहर' },
  second: { en: 'Second watch of the night', hi: 'रात का दूसरा पहर' },
  third:  { en: 'Third watch of the night',  hi: 'रात का तीसरा पहर' },
  fourth: { en: 'Fourth watch of the night', hi: 'रात का चौथा पहर' },
  dawn:   { en: 'Dawn',                      hi: 'उषाकाल (भोर)' },
  day:    { en: 'Daytime',                   hi: 'दिन का समय' },
};

const MIN_PER_DAY = 1440;

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

// Reads a wall-clock local date and time as the dreamer typed them.
//
// Deliberately not `new Date(iso)`: the dream happened at 4 AM *where the
// dreamer was*, and parsing that through the server's timezone would slide it
// into a different watch of the night — which is the whole quantity being
// measured. Only the numbers on their clock matter here.
function parseLocal(dateStr, timeStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const [hh, mm] = String(timeStr).split(':').map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return { dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, minutes: hh * 60 + mm };
}

/**
 * Works out which watch of the night a dream fell in, and when its result is due.
 *
 * @param {string} dreamDate  local calendar date the dreamer woke on, YYYY-MM-DD
 * @param {string} dreamTime  local clock time of the dream, HH:MM
 * @param {object} place      { lat, lon, tzMin, label } — the panchang's shape
 * @param {object} opts       { fellAsleepAgain, laterDreamSameNight }
 */
function readDreamTiming(dreamDate, dreamTime, place, opts = {}) {
  const parsed = parseLocal(dreamDate, dreamTime);
  if (!parsed) return null;

  const { dateStr, minutes } = parsed;

  // A dream at 2 AM belongs to the night that began at the *previous* evening's
  // sunset. Getting this backwards would file every small-hours dream — the
  // prophetic ones — under the wrong night and the wrong deadline.
  const { srMin } = getSunriseSunsetMin(dateStr, place);
  const beforeSunrise = minutes < srMin;
  const nightStartDate = beforeSunrise ? shiftDate(dateStr, -1) : dateStr;

  const { ssMin: sunsetMin } = getSunriseSunsetMin(nightStartDate, place);
  const { srMin: nextSunriseMin } = getSunriseSunsetMin(shiftDate(nightStartDate, 1), place);

  // Minutes elapsed since that sunset, counting through midnight.
  const nightLength = (nextSunriseMin + MIN_PER_DAY) - sunsetMin;
  const sinceSunset = beforeSunrise
    ? (minutes + MIN_PER_DAY) - sunsetMin
    : minutes - sunsetMin;

  // Between sunrise and sunset — not a night dream at all.
  if (sinceSunset < 0 || sinceSunset > nightLength) {
    return {
      yama: 'day',
      yamaNumber: null,
      label: YAMA_LABEL.day,
      isDaytime: true,
      isBrahmaMuhurta: false,
      nullified: false,
      fruition: null,
      dueDate: null,
      nightOf: dateStr,
      sunrise: minToClock(nextSunriseMin),
      sunset: minToClock(sunsetMin),
    };
  }

  const minutesToSunrise = nightLength - sinceSunset;
  const isDawn = minutesToSunrise <= MUHURTA_MIN;
  const quarter = Math.min(3, Math.floor((sinceSunset / nightLength) * 4));
  const band = isDawn ? FRUITION[4] : FRUITION[quarter];

  // Two rules from the same chapter that decide whether the deadline stands.
  //
  // Sleeping again cancels the dream — which is also why "go back to sleep" is
  // the first remedy prescribed for a frightening one. And where several dreams
  // come in one night, it is the last that gives the result, so an earlier one
  // is spent.
  const nullified = !!(opts.fellAsleepAgain || opts.laterDreamSameNight);
  const nullifiedBy = opts.fellAsleepAgain ? 'slept_again'
    : opts.laterDreamSameNight ? 'later_dream'
    : null;

  return {
    yama: band.key,
    yamaNumber: isDawn ? 4 : quarter + 1,
    label: YAMA_LABEL[band.key],
    isDaytime: false,
    isBrahmaMuhurta: minutesToSunrise <= BRAHMA_MUHURTA_MIN,
    nullified,
    nullifiedBy,
    fruition: { en: band.en, hi: band.hi },
    dueDate: nullified ? null : addWindow(dateStr, band),
    nightOf: nightStartDate,
    sunrise: minToClock(nextSunriseMin),
    sunset: minToClock(sunsetMin),
  };
}

function addWindow(dateStr, band) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (band.months) dt.setUTCMonth(dt.getUTCMonth() + band.months);
  if (band.days) dt.setUTCDate(dt.getUTCDate() + band.days);
  return dt.toISOString().slice(0, 10);
}

function minToClock(min) {
  const m = ((Math.round(min) % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${ampm}`;
}

module.exports = { readDreamTiming, FRUITION, YAMA_LABEL, ymd };
