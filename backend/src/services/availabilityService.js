// When an astrologer actually works.
//
// Until now every astrologer was offered to seekers from 8 AM to 9 PM, seven
// days a week, whether or not that was true — the hours were two constants in
// appointmentController. Someone who reads on weekday evenings had her whole
// Sunday morning on sale, and the first she heard of a booking was when it
// happened.
//
// The shape is deliberately small, because the person editing it is an
// astrologer on a phone, not an administrator: one row per weekday, each either
// closed or a single from–to window, plus a list of specific dates off for
// travel, illness and festivals.
//
//   { days: { "0": null, "1": { from: "09:00", to: "18:00" }, ... },
//     off:  ["2026-08-20", "2026-09-01"] }
//
// A weekday absent from `days` means "same as it has always been", so an
// astrologer who never opens this screen is offered exactly as she was before.

// What everyone was implicitly on before this existed. Changing it changes
// what an astrologer who has never set her hours is offered as, so don't.
const DEFAULT_WINDOW = { from: '08:00', to: '21:00' };

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// "09:30" -> 570. Anything unparseable comes back null so the caller can fall
// back rather than generating slots at NaN o'clock.
function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

function parse(raw) {
  let v = raw;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { v = null; } }
  if (!v || typeof v !== 'object') v = {};
  return {
    days: (v.days && typeof v.days === 'object') ? v.days : {},
    off: Array.isArray(v.off) ? v.off.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)) : [],
  };
}

// Cleaned for storage: a window that is missing, backwards or zero-length is
// stored as a day off rather than as a window that would produce no slots and
// no explanation.
function sanitise(raw) {
  const { days, off } = parse(raw);
  const clean = {};
  for (let d = 0; d < 7; d++) {
    const entry = days[d] ?? days[String(d)];
    if (entry === null) { clean[d] = null; continue; }   // explicitly closed
    if (!entry) continue;                                // unset — inherit the default
    const from = toMinutes(entry.from);
    const to   = toMinutes(entry.to);
    clean[d] = (from === null || to === null || to <= from)
      ? null
      : { from: toHHMM(from), to: toHHMM(to) };
  }
  return { days: clean, off: [...new Set(off)].sort() };
}

// The weekday of a date string, read in UTC.
//
// Noon UTC and getUTCDay(), not getDay(): the server's own clock must not
// decide which day of the week an astrologer is working. Railway runs UTC and a
// laptop does not.
const weekdayOf = (dateStr) => new Date(`${dateStr}T12:00:00Z`).getUTCDay();

// The window an astrologer works on a given date, or null if she does not.
function windowFor(raw, dateStr) {
  const { days, off } = parse(raw);
  if (off.includes(dateStr)) return null;

  const d = weekdayOf(dateStr);
  const entry = days[d] ?? days[String(d)];
  if (entry === null) return null;                 // this weekday is closed
  if (!entry) return { ...DEFAULT_WINDOW };        // never set — as it always was

  const from = toMinutes(entry.from);
  const to   = toMinutes(entry.to);
  if (from === null || to === null || to <= from) return null;
  return { from: toHHMM(from), to: toHHMM(to) };
}

// Filled in for the editing screen, so every weekday has something to show
// rather than the screen having to know what an absent day means.
function forEditing(raw) {
  const { days, off } = parse(raw);
  return {
    days: DAY_NAMES.map((name, d) => {
      const entry = days[d] ?? days[String(d)];
      const open = entry !== null;
      const win  = entry || DEFAULT_WINDOW;
      return {
        day: d,
        name,
        working: open,
        from: open ? (win.from || DEFAULT_WINDOW.from) : DEFAULT_WINDOW.from,
        to:   open ? (win.to   || DEFAULT_WINDOW.to)   : DEFAULT_WINDOW.to,
      };
    }),
    off,
  };
}

// Back from the editing screen's shape into what is stored.
function fromEditing(body) {
  const days = {};
  for (const row of Array.isArray(body?.days) ? body.days : []) {
    const d = Number(row?.day);
    if (!Number.isInteger(d) || d < 0 || d > 6) continue;
    days[d] = row?.working ? { from: row.from, to: row.to } : null;
  }
  return sanitise({ days, off: body?.off });
}

module.exports = {
  DEFAULT_WINDOW, DAY_NAMES,
  toMinutes, toHHMM, parse, sanitise, windowFor, forEditing, fromEditing, weekdayOf,
};
