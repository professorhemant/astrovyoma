const { Op } = require('sequelize');

function makeSlug(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\b(pt|pandit|dr|shri|acharya|jyotishi?|astrologer)\b\.?\s*/gi, '')
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'astrologer';
}

async function generateUniqueSlug(Astrologer, displayName, excludeId = null) {
  const base = makeSlug(displayName);
  let slug = base, n = 2;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Astrologer.findOne({ where });
    if (!existing) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

module.exports = { makeSlug, generateUniqueSlug };
