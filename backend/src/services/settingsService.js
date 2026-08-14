// Reads and writes site settings against the database, with an in-process cache
// so the hot paths that consult them (commission, free minutes) are not doing a
// query per request.
//
// The cache is per-process. Railway may run more than one instance, so a write
// on one would not invalidate another's cache — hence the short TTL rather than
// caching forever. Settings change rarely; a few seconds of staleness is fine,
// silently serving defaults after a restart was not.

const { SiteSetting } = require('../models');
const { SETTING_FIELDS, SETTINGS_GROUPS, defaultSettings } = require('../config/contentSchema');

const TTL_MS = 15_000;

let cache = null;
let cachedAt = 0;

function coerce(field, raw) {
  if (!field) return raw;
  switch (field.type) {
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) ? n : field.default;
    }
    case 'boolean':
      return raw === true || raw === 'true' || raw === 1 || raw === '1';
    default:
      return raw == null ? field.default : String(raw);
  }
}

async function getSettings({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cachedAt < TTL_MS) return cache;

  const merged = defaultSettings();
  try {
    const rows = await SiteSetting.findAll();
    for (const row of rows) {
      if (!(row.key in SETTING_FIELDS)) continue;   // ignore keys no longer in the schema
      let parsed;
      try { parsed = JSON.parse(row.value); } catch { parsed = row.value; }
      merged[row.key] = coerce(SETTING_FIELDS[row.key], parsed);
    }
  } catch (err) {
    // A settings read must never take the site down — fall back to defaults.
    console.error('[settings] read failed, using defaults:', err.message);
    return merged;
  }

  cache = merged;
  cachedAt = Date.now();
  return merged;
}

async function updateSettings(patch) {
  const applied = {};
  for (const [key, raw] of Object.entries(patch || {})) {
    const field = SETTING_FIELDS[key];
    if (!field) continue;                            // silently drop unknown keys

    let value = coerce(field, raw);
    if (field.type === 'number') {
      if (typeof field.min === 'number') value = Math.max(field.min, value);
      if (typeof field.max === 'number') value = Math.min(field.max, value);
    }

    await SiteSetting.upsert({ key, value: JSON.stringify(value) });
    applied[key] = value;
  }
  cache = null;                                      // force a re-read
  return getSettings({ fresh: true });
}

// Which settings an unauthenticated caller may see.
//
// This used to be a hand-written list of keys, which meant every new editable
// line of wording needed remembering here too — and forgetting shipped a field
// the admin could edit and the site would never show. It is now taken from the
// schema: a group marked `public` is readable by the site, and one that is not —
// Business Settings, which holds our commission — never leaves the server.
const PUBLIC_KEYS = SETTINGS_GROUPS
  .filter(g => g.public)
  .flatMap(g => g.fields.map(f => f.key));

// What we tell astrologers they keep, worked out from what we actually keep.
//
// This used to be a second number typed by hand into Astrologer Kit — Wording,
// which meant the site could advertise 60% while the commission said 45. The
// figure is now derived, so the page cannot contradict the ledger: change the
// commission and every published percentage moves with it.
//
// Business Settings stays private, but the astrologer's share does not — it is
// printed on the Join page and in the kit already, and an astrologer is
// entitled to know it before applying.
function astrologerShare(s) {
  const commission = Math.min(100, Math.max(0, Number(s.commissionPercent) || 0));
  return Math.round(100 - commission);
}

async function getPublicSettings() {
  const s = await getSettings();
  const out = {};
  for (const key of PUBLIC_KEYS) out[key] = s[key];
  // The banner is only news when it is switched on.
  out.announcement = s.announcementActive ? s.announcement : '';

  const share = astrologerShare(s);
  out.astrologerSharePercent = share;
  out.platformSharePercent   = 100 - share;
  out.obEarnShare            = `${share}%`;   // the kit's headline figure
  return out;
}

module.exports = { getSettings, updateSettings, getPublicSettings, astrologerShare };
