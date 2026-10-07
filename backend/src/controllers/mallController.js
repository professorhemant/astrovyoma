// The Astro Mall, served from the mall_products, mall_categories and
// mall_purposes content lists.
//
// The shop used to be a 480-line array in this file with no admin routes at all,
// which meant a price change was a code change. It is now rows like every other
// piece of editable content, seeded on first boot with what the shop already
// sold.

const crypto = require('crypto');
const { ContentItem, MallOrder } = require('../models');
const { getRazorpay } = require('../services/razorpay');
const { sendRevenueAlert } = require('../services/otpService');
const { applyLang, langFrom } = require('../services/langOverlay');

const commas = (v) => String(v || '').split(',').map(s => s.trim()).filter(Boolean);
const lines  = (v) => String(v || '').split('\n').map(s => s.trim()).filter(Boolean);

// Lists that the admin types as text come back out as the arrays the shop
// front-end already expects, so nothing downstream had to learn a new shape.
function parseProduct(row, lang) {
  let d = {};
  try { d = JSON.parse(row.data); } catch { /* corrupt row — skip its fields */ }
  d = applyLang(d, lang);
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

function parseMeta(row, lang) {
  let d = {};
  try { d = JSON.parse(row.data); } catch { /* corrupt row — skip its fields */ }
  d = applyLang(d, lang);
  return { key: d.key || '', label: d.label || '', icon: d.icon || '', color: d.color || '', desc: d.desc || '' };
}

async function rows(listKey) {
  return ContentItem.findAll({
    where: { list_key: listKey, is_active: true },
    order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
  });
}

async function allProducts(lang) {
  return (await rows('mall_products')).map(r => parseProduct(r, lang)).filter(p => p.name);
}

async function getProducts(req, res) {
  try {
    let list = await allProducts(langFrom(req));
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
    const list = await allProducts(langFrom(req));
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
      allProducts(langFrom(req)), rows('mall_categories'), rows('mall_purposes'),
    ]);
    res.json({
      categories: cats.map(r => parseMeta(r, langFrom(req))).filter(c => c.key).map(c => ({
        ...c, count: products.filter(p => p.category === c.key).length,
      })),
      purposes: purposes.map(r => parseMeta(r, langFrom(req))).filter(c => c.key).map(c => ({
        ...c, count: products.filter(p => p.purposes.includes(c.key)).length,
      })),
    });
  } catch (err) {
    console.error('[mall] getCategories', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

async function createOrder(req, res) {
  try {
    const { items, customerName, customerPhone, deliveryAddress } = req.body;
    if (!items?.length || !customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
    if (amount <= 0) return res.status(400).json({ error: 'Invalid order amount' });

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(amount) * 100,
      currency: 'INR',
      receipt:  `mall_${req.user?.id || 'guest'}_${Date.now()}`,
      notes:    { user_id: String(req.user?.id || ''), kind: 'mall_order' },
    });

    await MallOrder.create({
      user_id:          req.user?.id || null,
      customer_name:    customerName,
      customer_phone:   customerPhone,
      delivery_address: deliveryAddress,
      items,
      amount,
      razorpay_order_id: rzpOrder.id,
      status: 'pending',
    });

    res.json({
      order_id: rzpOrder.id,
      amount:   rzpOrder.amount,
      currency: rzpOrder.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    if (err.message === 'Razorpay credentials not configured') {
      return res.status(503).json({ error: 'Payment gateway not configured.' });
    }
    console.error('[mall] createOrder', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

async function verifyOrder(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details missing' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ error: 'Payment gateway not configured' });

    const digest = crypto.createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf = Buffer.from(String(razorpay_signature));
    const digBuf = Buffer.from(digest);
    if (sigBuf.length !== digBuf.length || !crypto.timingSafeEqual(sigBuf, digBuf)) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    const order = await MallOrder.findOne({ where: { razorpay_order_id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update({ razorpay_payment_id, status: 'paid' });

    sendRevenueAlert({
      kind:      'mall',
      userName:  order.customer_name,
      userPhone: order.customer_phone,
      amount:    Number(order.amount),
      plan:      `${order.items.length} item(s) — ${order.items.map(i => i.name).join(', ')}`,
      billing:   `Ship to: ${order.delivery_address}`,
      paymentId: razorpay_payment_id,
    }).catch(err => console.error('[revenue-alert] mall email failed:', err.message));

    res.json({ success: true });
  } catch (err) {
    console.error('[mall] verifyOrder', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await MallOrder.findAll({
      where: { user_id: req.user.id, status: 'paid' },
      order: [['created_at', 'DESC']],
      limit: 20,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function getAdminOrders(req, res) {
  try {
    const orders = await MallOrder.findAll({
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

module.exports = { getProducts, getProductById, getCategories, createOrder, verifyOrder, getMyOrders, getAdminOrders };
