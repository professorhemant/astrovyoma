// The Astro Mall, served from the mall_products, mall_categories and
// mall_purposes content lists.
//
// The shop used to be a 480-line array in this file with no admin routes at all,
// which meant a price change was a code change. It is now rows like every other
// piece of editable content, seeded on first boot with what the shop already
// sold.

const { ContentItem } = require('../models');

const commas = (v) => String(v || '').split(',').map(s => s.trim()).filter(Boolean);
const lines  = (v) => String(v || '').split('\n').map(s => s.trim()).filter(Boolean);

// Lists that the admin types as text come back out as the arrays the shop
// front-end already expects, so nothing downstream had to learn a new shape.
function parseProduct(row) {
  let d = {};
  try { d = JSON.parse(row.data); } catch { /* corrupt row — skip its fields */ }
  return {
    ...d,
    id: d.id || row.id,
    name: d.name || '',
    category: d.category || '',
    purposes: commas(d.purposes),
    zodiac: commas(d.zodiac),
    tags: commas(d.tags).map(t => t.toLowerCase()),
    benefits: lines(d.benefits),
    price: Number(d.price) || 0,
    originalPrice: Number(d.originalPrice) || 0,
    rating: Number(d.rating) || 0,
    reviewCount: Number(d.reviewCount) || 0,
    isInStock: d.isInStock !== false,
    isBestseller: d.isBestseller === true,
    isFeatured: d.isFeatured === true,
    shortDesc: d.shortDesc || '',
    description: d.description || '',
    image: d.image || '',
  };
}

function parseMeta(row) {
  let d = {};
  try { d = JSON.parse(row.data); } catch { /* corrupt row — skip its fields */ }
  return { key: d.key || '', label: d.label || '', icon: d.icon || '', color: d.color || '', desc: d.desc || '' };
}

async function rows(listKey) {
  return ContentItem.findAll({
    where: { list_key: listKey, is_active: true },
    order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
  });
}

async function allProducts() {
  return (await rows('mall_products')).map(parseProduct).filter(p => p.name);
}

async function getProducts(req, res) {
  try {
    let list = await allProducts();
    const { category, purpose, sort, search, featured, bestseller } = req.query;

    if (category)   list = list.filter(p => p.category === category);
    if (purpose)    list = list.filter(p => p.purposes.includes(purpose));
    if (featured === 'true')   list = list.filter(p => p.isFeatured);
    if (bestseller === 'true') list = list.filter(p => p.isBestseller);
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }

    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') list.sort((a, b) => b.reviewCount - a.reviewCount);
    else list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));

    res.json({ products: list, total: list.length });
  } catch (err) {
    console.error('[mall] getProducts', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function getProductById(req, res) {
  try {
    const list = await allProducts();
    const product = list.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const related = list
      .filter(p => p.id !== product.id && (p.category === product.category || p.purposes.some(pu => product.purposes.includes(pu))))
      .slice(0, 4);

    res.json({ product, related });
  } catch (err) {
    console.error('[mall] getProductById', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

async function getCategories(req, res) {
  try {
    const [products, cats, purposes] = await Promise.all([
      allProducts(), rows('mall_categories'), rows('mall_purposes'),
    ]);
    res.json({
      categories: cats.map(parseMeta).filter(c => c.key).map(c => ({
        ...c, count: products.filter(p => p.category === c.key).length,
      })),
      purposes: purposes.map(parseMeta).filter(c => c.key).map(c => ({
        ...c, count: products.filter(p => p.purposes.includes(c.key)).length,
      })),
    });
  } catch (err) {
    console.error('[mall] getCategories', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

module.exports = { getProducts, getProductById, getCategories };
