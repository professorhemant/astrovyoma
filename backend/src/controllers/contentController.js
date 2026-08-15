// CRUD for every editable list on the site, driven by config/contentSchema.js.
// One controller serves all of them, so making something editable does not mean
// writing another one of these.

const { ContentItem } = require('../models');
const { LISTS, schemaForClient } = require('../config/contentSchema');
const settingsService = require('../services/settingsService');
const { applyLang, langFrom } = require('../services/langOverlay');

function listDef(key) {
  return Object.prototype.hasOwnProperty.call(LISTS, key) ? LISTS[key] : null;
}

// Rows are stored as the fields that existed when they were saved. Adding a
// field to a schema later would otherwise leave every existing row missing it —
// blank in the editor and absent on the page — so the declared defaults fill the
// gaps on read.
// `row_id` is the row's own database id and is written last, so a list that
// declares a field of its own called `id` — Subscription Plans has one, so does
// the shop — cannot overwrite the handle the admin needs to address the row.
// Editing a plan used to fail for exactly that reason: the admin asked the
// server to update the plan called "gold" and there is no row with that id.
function parse(item, def) {
  let data = {};
  try { data = JSON.parse(item.data); } catch { /* corrupt row — show it empty rather than 500 */ }
  const withDefaults = {};
  for (const field of def?.fields || []) {
    if (data[field.key] === undefined && field.default !== undefined) withDefaults[field.key] = field.default;
  }
  return {
    id: item.id, sort_order: item.sort_order, is_active: item.is_active,
    ...withDefaults, ...data,
    row_id: item.id,
  };
}

// Keep only fields the schema declares, and coerce them to the declared type.
// Stops a stray key from the client becoming permanent site content.
function sanitise(def, body) {
  const out = {};
  for (const field of def.fields) {
    let v = body[field.key];
    if (v === undefined) {
      if (field.default !== undefined) v = field.default;
      else continue;
    }
    if (field.type === 'number') {
      const n = Number(v);
      v = Number.isFinite(n) ? n : (field.default ?? 0);
      if (typeof field.min === 'number') v = Math.max(field.min, v);
      if (typeof field.max === 'number') v = Math.min(field.max, v);
    } else if (field.type === 'boolean') {
      v = v === true || v === 'true';
    } else {
      v = v == null ? '' : String(v);
    }
    out[field.key] = v;
  }
  return out;
}

function missingRequired(def, data) {
  return def.fields
    .filter(f => f.required && (data[f.key] === undefined || String(data[f.key]).trim() === ''))
    .map(f => f.label);
}

// ─── schema ──────────────────────────────────────────────────────────────────

exports.getSchema = (req, res) => {
  res.json(schemaForClient());
};

// ─── read ────────────────────────────────────────────────────────────────────

async function fetchList(key, { activeOnly, lang = 'en' }) {
  const where = { list_key: key };
  if (activeOnly) where.is_active = true;
  const rows = await ContentItem.findAll({
    where,
    order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
  });
  return rows.map(r => applyLang(parse(r, listDef(key)), lang));
}

exports.adminList = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });
    res.json({ key: req.params.listKey, label: def.label, items: await fetchList(req.params.listKey, { activeOnly: false }) });
  } catch (err) {
    console.error('[content] adminList', err);
    res.status(500).json({ error: 'Failed to load content' });
  }
};

// Public feed the site renders from. Active items only.
exports.publicList = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });
    res.json({ items: await fetchList(req.params.listKey, { activeOnly: true, lang: langFrom(req) }) });
  } catch (err) {
    console.error('[content] publicList', err);
    res.status(500).json({ error: 'Failed to load content' });
  }
};

// Everything the homepage needs in one request, so it is not firing a call per
// list on first paint.
exports.publicBundle = async (req, res) => {
  try {
    const keys = String(req.query.keys || '').split(',').map(s => s.trim()).filter(Boolean);
    const wanted = keys.length ? keys.filter(k => listDef(k)) : Object.keys(LISTS);
    const out = {};
    const lang = langFrom(req);
    await Promise.all(wanted.map(async k => { out[k] = await fetchList(k, { activeOnly: true, lang }); }));
    res.json({ lists: out, settings: await settingsService.getPublicSettings() });
  } catch (err) {
    console.error('[content] publicBundle', err);
    res.status(500).json({ error: 'Failed to load content' });
  }
};

exports.publicSettings = async (req, res) => {
  try {
    res.json({ settings: await settingsService.getPublicSettings() });
  } catch (err) {
    console.error('[content] publicSettings', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

// ─── write ───────────────────────────────────────────────────────────────────

exports.create = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });

    const data = sanitise(def, req.body || {});
    const missing = missingRequired(def, data);
    if (missing.length) return res.status(400).json({ error: `Please fill in: ${missing.join(', ')}` });

    // New rows go to the end.
    const max = await ContentItem.max('sort_order', { where: { list_key: req.params.listKey } });
    const item = await ContentItem.create({
      list_key: req.params.listKey,
      sort_order: (Number.isFinite(max) ? max : -1) + 1,
      is_active: req.body?.is_active !== false,
      data: JSON.stringify(data),
    });
    res.status(201).json(parse(item, def));
  } catch (err) {
    console.error('[content] create', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

exports.update = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });

    const item = await ContentItem.findOne({ where: { id: req.params.id, list_key: req.params.listKey } });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Merge over what is stored so a partial save — the is_active toggle, say —
    // does not wipe the fields it did not send.
    let existing = {};
    try { existing = JSON.parse(item.data); } catch { /* start clean */ }
    const data = sanitise(def, { ...existing, ...(req.body || {}) });

    const missing = missingRequired(def, data);
    if (missing.length) return res.status(400).json({ error: `Please fill in: ${missing.join(', ')}` });

    item.data = JSON.stringify(data);
    if (typeof req.body?.is_active === 'boolean') item.is_active = req.body.is_active;
    await item.save();
    res.json(parse(item, def));
  } catch (err) {
    console.error('[content] update', err);
    res.status(500).json({ error: 'Failed to save item' });
  }
};

exports.remove = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });
    const n = await ContentItem.destroy({ where: { id: req.params.id, list_key: req.params.listKey } });
    if (!n) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[content] remove', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Takes the full ordered list of ids. Simpler for the client than up/down deltas
// and it cannot drift out of step with what is on screen.
exports.reorder = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });

    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
    if (!ids) return res.status(400).json({ error: 'ids array required' });

    await Promise.all(ids.map((id, i) =>
      ContentItem.update({ sort_order: i }, { where: { id, list_key: req.params.listKey } })
    ));
    res.json({ items: await fetchList(req.params.listKey, { activeOnly: false }) });
  } catch (err) {
    console.error('[content] reorder', err);
    res.status(500).json({ error: 'Failed to reorder' });
  }
};

// Puts a list back to the defaults declared in the schema. The escape hatch for
// "I have edited this into a mess and want to start again".
exports.reset = async (req, res) => {
  try {
    const def = listDef(req.params.listKey);
    if (!def) return res.status(404).json({ error: 'Unknown list' });

    await ContentItem.destroy({ where: { list_key: req.params.listKey } });
    await seedList(req.params.listKey, def, { force: true });
    res.json({ items: await fetchList(req.params.listKey, { activeOnly: false }) });
  } catch (err) {
    console.error('[content] reset', err);
    res.status(500).json({ error: 'Failed to reset' });
  }
};

// ─── seeding ─────────────────────────────────────────────────────────────────

async function seedList(key, def, { force = false } = {}) {
  if (!def.seed?.length) return 0;
  if (!force) {
    const existing = await ContentItem.count({ where: { list_key: key } });
    if (existing > 0) return 0;
  }
  await ContentItem.bulkCreate(def.seed.map((data, i) => ({
    list_key: key,
    sort_order: i,
    is_active: true,
    data: JSON.stringify(data),
  })));
  return def.seed.length;
}

// "Is it empty? then fill it" is not safe against two boots at once — both can
// read empty before either writes, and the list seeds twice. One instance makes
// that unlikely, but a deploy that briefly overlaps old and new containers is
// exactly the case that breaks it, and it did happen locally when two dev
// servers were up together: eight headings became forty.
//
// Rather than lock, clean up after: identical rows in the same list are removed,
// keeping the earliest. Seed rows are identical by construction, so this catches
// a double seed while leaving genuine edits — which will differ — alone.
async function dedupeList(key) {
  const rows = await ContentItem.findAll({
    where: { list_key: key },
    order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
  });
  const seen = new Set();
  const doomed = [];
  for (const row of rows) {
    if (seen.has(row.data)) doomed.push(row.id);
    else seen.add(row.data);
  }
  if (doomed.length) {
    await ContentItem.destroy({ where: { id: doomed } });
    console.warn(`[content] removed ${doomed.length} duplicate row(s) from ${key}`);
  }
  return doomed.length;
}

// Seeding only ever fills an empty list, which is right — it must not undo the
// admin's edits. But it leaves a gap: when a field is added to a schema that
// already has rows in the wild, those rows never receive its default. For the
// shop's product artwork that would have meant the drawings shipped and the
// live shop kept showing the category emoji for ever, because its 29 rows were
// seeded the day before the pictures existed.
//
// So: for the named fields only, a row that is still empty takes the value from
// the seed entry it matches.
//
// `ours` widens that by one step. Artwork we ship can also be *replaced* by
// artwork we ship — a drawing swapped for a photograph, say — and without this
// the shop would keep the drawing for ever because the field was not empty. The
// test is deliberately narrow: only a value we recognise as our own is
// overwritten. Anything uploaded from the admin lives under a different path
// and is never touched.
async function backfill(listKey, matchField, fields, ours = () => false) {
  const def = listDef(listKey);
  if (!def?.seed?.length) return 0;
  const rows = await ContentItem.findAll({ where: { list_key: listKey } });
  let touched = 0;
  for (const row of rows) {
    let data;
    try { data = JSON.parse(row.data); } catch { continue; }
    const seed = def.seed.find(s => s[matchField] === data[matchField]);
    if (!seed) continue;
    let changed = false;
    for (const f of fields) {
      if (!seed[f] || data[f] === seed[f]) continue;
      if (!data[f] || ours(data[f])) { data[f] = seed[f]; changed = true; }
    }
    if (changed) {
      row.data = JSON.stringify(data);
      await row.save();
      touched++;
    }
  }
  return touched;
}

// Called once at boot. Fills each list with the content the site already shipped
// with, so switching a page over to the database changes nothing visually until
// the admin edits something.
async function seedContent() {
  let total = 0;
  for (const [key, def] of Object.entries(LISTS)) {
    try {
      total += await seedList(key, def);
      await dedupeList(key);
    } catch (err) {
      console.error(`[content] seed ${key} failed:`, err.message);
    }
  }
  if (total) console.log(`[content] seeded ${total} default item(s)`);

  try {
    // Anything under /products/ is a drawing or photograph that shipped with the
    // site. An admin upload lands under /uploads/ and is left alone.
    const filled = await backfill('mall_products', 'id', ['image'],
      (v) => typeof v === 'string' && v.startsWith('/products/'));
    if (filled) console.log(`[content] updated artwork on ${filled} product(s)`);
  } catch (err) {
    console.error('[content] product artwork backfill failed:', err.message);
  }

  try {
    // Same again for the articles, which were seeded before they had banners.
    // Seeding only fills an empty list, so without this the eight already in
    // production would never see the drawings.
    const filled = await backfill('blog_posts', 'slug', ['image'],
      (v) => typeof v === 'string' && v.startsWith('/blog/'));
    if (filled) console.log(`[content] updated artwork on ${filled} article(s)`);
  } catch (err) {
    console.error('[content] article artwork backfill failed:', err.message);
  }
}

module.exports.seedContent = seedContent;
