// The Crystal Guide — /crystals and /crystals/<slug>.
//
// The 17 stones used to be a literal array in this file, which meant every
// correction to a mantra, and every picture, was a code change and a deploy.
// They are rows now, seeded from src/data/crystals.js and edited under Site
// Content → Crystal Guide, and this file's job is to turn those rows back into
// the shape the two pages already expect.
//
// Two shapes have to be reconciled on the way through. The stored row keeps
// lists as typing — signs comma-separated, benefits and cautions one per line,
// which is what an editor can actually work with — while the pages want arrays.
// And the data has always had two names for one idea, howToWear on a gemstone
// and howToUse on a healing crystal; the admin shows one box, and both names go
// out so neither page has to change.

const { ContentItem } = require('../models');
const { CRYSTALS } = require('../data/crystals');

const lines = (v) => String(v ?? '').split('\n').map(s => s.trim()).filter(Boolean);
const commas = (v) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean);

function fromRow(row) {
  let d = {};
  try { d = JSON.parse(row.data); } catch { return null; }
  if (!d.slug || !d.name) return null;
  const how = d.howToWear || d.howToUse || '';
  return {
    ...d,
    signs:    Array.isArray(d.signs) ? d.signs : commas(d.signs),
    benefits: Array.isArray(d.benefits) ? d.benefits : lines(d.benefits),
    cautions: Array.isArray(d.cautions) ? d.cautions : lines(d.cautions),
    howToWear: how,
    howToUse: how,
    // Empty means "no link to the shop", and the pages test for a value.
    mallProductId: d.mallProductId || null,
    uparatna: d.uparatna || null,
    image: d.image || null,
  };
}

// Whatever the admin has, or what the site shipped with if the list has been
// emptied. Hidden rows are left out, which is how a stone is taken off the
// guide without losing what was written about it.
async function load() {
  try {
    const rows = await ContentItem.findAll({
      where: { list_key: 'crystals', is_active: true },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
    const parsed = rows.map(fromRow).filter(Boolean);
    if (parsed.length) return parsed;
  } catch (err) {
    // A guide that renders yesterday's stones beats a guide that 500s.
    console.error('[crystals] falling back to the shipped list:', err.message);
  }
  return CRYSTALS.map(c => ({ ...c, howToUse: c.howToWear || c.howToUse, image: null }));
}

exports.listCrystals = async (req, res) => {
  try {
    const CRYSTALS = await load();
    const { type, planet, sign, search } = req.query;
    let results = CRYSTALS;

    if (type && type !== 'all') results = results.filter(c => c.type === type);
    if (planet) results = results.filter(c => c.planet.toLowerCase() === planet.toLowerCase());
    if (sign)   results = results.filter(c => c.signs.some(s => s.toLowerCase() === sign.toLowerCase()) || c.signs.includes('All Signs'));
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.hindiName.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.planet.toLowerCase().includes(q)
      );
    }

    const planets = [...new Set(CRYSTALS.map(c => c.planet))].sort();
    const summary = results.map(c => ({
      slug:c.slug, name:c.name, hindiName:c.hindiName, type:c.type,
      planet:c.planet, signs:c.signs, element:c.element, chakra:c.chakra,
      color:c.color, colorName:c.colorName, icon:c.icon, hardness:c.hardness,
      priceRange:c.priceRange, shortDesc:c.shortDesc, mallProductId:c.mallProductId,
      image:c.image,
    }));

    res.json({ crystals: summary, total: results.length, planets });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCrystal = async (req, res) => {
  try {
    const CRYSTALS = await load();
    const crystal = CRYSTALS.find(c => c.slug === req.params.slug);
    if (!crystal) return res.status(404).json({ error: 'Crystal not found' });

    const related = CRYSTALS
      .filter(c => c.slug !== crystal.slug && (c.planet === crystal.planet || c.chakra === crystal.chakra || c.element === crystal.element))
      .slice(0, 4)
      .map(c => ({ slug:c.slug, name:c.name, hindiName:c.hindiName, icon:c.icon, image:c.image, planet:c.planet, color:c.color, shortDesc:c.shortDesc, type:c.type }));

    res.json({ crystal, related });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
