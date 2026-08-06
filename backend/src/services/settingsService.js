// Reads and writes site settings against the database, with an in-process cache
// so the hot paths that consult them (commission, free minutes) are not doing a
// query per request.
//
// The cache is per-process. Railway may run more than one instance, so a write
// on one would not invalidate another's cache — hence the short TTL rather than
// caching forever. Settings change rarely; a few seconds of staleness is fine,
// silently serving defaults after a restart was not.

const { SiteSetting } = require('../models');
const { SETTING_FIELDS, defaultSettings } = require('../config/contentSchema');

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

// The handful of settings the public site needs. Never send commission or
// anything else operational to an unauthenticated caller.
async function getPublicSettings() {
  const s = await getSettings();
  return {
    maintenanceMode: s.maintenanceMode,
    announcement: s.announcementActive ? s.announcement : '',
    announcementActive: s.announcementActive,
    platformPhone: s.platformPhone,
    platformEmail: s.platformEmail,
    platformWhatsApp: s.platformWhatsApp,
    siteTagline: s.siteTagline,
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
  };
}

module.exports = { getSettings, updateSettings, getPublicSettings };
