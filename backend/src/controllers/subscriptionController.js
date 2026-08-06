const crypto  = require('crypto');
const { User, Subscription } = require('../models');
const { getRazorpay } = require('../services/razorpay');

const PLANS = {
  silver: {
    id: 'silver', name: 'Silver', price: 99, yearlyPrice: 999,
    color: '#94a3b8', icon: '🌙',
    features: [
      'All free tools (unlimited)',
      'Extended horoscope — weekly, monthly, yearly',
      'Nakshatra & Dasha analysis',
      'Full Panchang calendar',
      'Gochara (transit) reports',
      'Guna Milan — full 36-point analysis',
      'Lal Kitab & Vastu guide',
      'Life Domain Reports',
      'Festival & Planetary Calendar',
      '10 AI chatbot messages/day',
    ],
    notIncluded: ['PDF downloads', 'Consultations', 'Priority support'],
  },
  gold: {
    id: 'gold', name: 'Gold', price: 299, yearlyPrice: 2999,
    color: '#e8c547', icon: '⭐',
    popular: true,
    features: [
      'Everything in Silver',
      'Kundali PDF (English + Hindi)',
      'Detailed birth chart PDF',
      '30-min consultation credit/month',
      'Unlimited AI chatbot',
      'Mangal Dosha + Sade Sati deep reports',
      'Tarot reading (unlimited)',
      'Numerology full report',
      'Domain Reports with detailed remedies',
      'Priority email support',
    ],
    notIncluded: ['Unlimited consultations'],
  },
  platinum: {
    id: 'platinum', name: 'Platinum', price: 599, yearlyPrice: 5999,
    color: '#a78bfa', icon: '💎',
    features: [
      'Everything in Gold',
      'Unlimited consultation minutes/month',
      'Yearly + 5-year forecast PDF',
      'KP Astrology report',
      'Personalized remedy kit suggestions',
      'Dedicated astrologer assignment',
      'WhatsApp support',
      'Early access to new features',
      'Family plan — 2 kundali profiles',
    ],
    notIncluded: [],
  },
};

const FREE_PLAN = {
  id: 'free', name: 'Free', price: 0, yearlyPrice: 0,
  color: '#6b7280', icon: '✨',
  features: [
    'Kundali generation (birth chart)',
    'Daily horoscope for all 12 signs',
    'Today\'s Panchang',
    'Sade Sati calculator',
    'Mangal Dosha checker',
    'Basic Tarot reading',
    'Vastu guide (static)',
    '5 AI chatbot messages/day',
  ],
  notIncluded: ['PDF downloads', 'Extended horoscope', 'Consultations'],
};

// Plans are editable under Site Content -> Subscription Plans. The constants
// above stay as the fallback so pricing never renders empty if the lookup fails.
//
// The admin edits features as one-per-line text; the page wants arrays.
const { ContentItem } = require('../models');

function planFromRow(row) {
  let d = {};
  try { d = JSON.parse(row.data); } catch { return null; }
  if (!d.id) return null;
  const lines = (s) => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  return {
    id: d.id,
    name: d.name || d.id,
    price: Number(d.price) || 0,
    yearlyPrice: Number(d.yearlyPrice) || 0,
    color: d.color || '#c9a84c',
    icon: d.icon || '✨',
    ...(d.popular ? { popular: true } : {}),
    features: lines(d.features),
    notIncluded: lines(d.notIncluded),
  };
}

async function loadPlans() {
  try {
    const rows = await ContentItem.findAll({
      where: { list_key: 'plans', is_active: true },
      order: [['sort_order', 'ASC']],
    });
    const plans = rows.map(planFromRow).filter(Boolean);
    if (plans.length) return plans;
  } catch (err) {
    console.error('[subscriptions] plan lookup failed, using built-in plans:', err.message);
  }
  return [FREE_PLAN, PLANS.silver, PLANS.gold, PLANS.platinum];
}

exports.getPlans = async (req, res) => {
  try {
    res.json({ plans: await loadPlans() });
  } catch (err) {
    console.error('getPlans error:', err);
    res.json({ plans: [FREE_PLAN, PLANS.silver, PLANS.gold, PLANS.platinum] });
  }
};

// Checkout must price against the same source the page displayed, or an admin
// changing a price would leave customers charged the old one.
async function findPlanForCheckout(planId) {
  const plans = await loadPlans();
  return plans.find(p => p.id === planId && p.id !== 'free') || PLANS[planId] || null;
}

exports.createOrder = async (req, res) => {
  try {
    const { planId, billing } = req.body; // billing: 'monthly' | 'yearly'
    const plan = await findPlanForCheckout(planId);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    const amount = billing === 'yearly' ? plan.yearlyPrice : plan.price;
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount:   amount * 100, // paise
      currency: 'INR',
      receipt:  `sub_${req.user.id}_${Date.now()}`,
      notes:    { user_id: req.user.id, plan: planId, billing }
    });

    const durationMonths = billing === 'yearly' ? 12 : 1;
    await Subscription.create({
      user_id:           req.user.id,
      plan:              planId,
      amount,
      duration_months:   durationMonths,
      razorpay_order_id: order.id,
      status:            'pending'
    });

    res.json({
      order_id:  order.id,
      amount:    order.amount,
      currency:  order.currency,
      key:       process.env.RAZORPAY_KEY_ID,
      plan_name: plan.name,
    });
  } catch (err) {
    if (err.message === 'Razorpay credentials not configured') {
      return res.status(503).json({ error: 'Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ error: 'Payment gateway not configured' });

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    const sub = await Subscription.findOne({ where: { razorpay_order_id, user_id: req.user.id } });
    if (!sub) return res.status(404).json({ error: 'Subscription record not found' });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + sub.duration_months);

    await sub.update({
      razorpay_payment_id,
      razorpay_signature,
      status:     'active',
      expires_at: expiresAt
    });

    await User.update(
      { subscription_plan: sub.plan, subscription_expires_at: expiresAt },
      { where: { id: req.user.id } }
    );

    res.json({ success: true, plan: sub.plan, expires_at: expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMy = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['subscription_plan', 'subscription_expires_at']
    });

    const planId   = user?.subscription_plan || 'free';
    const planMeta = planId === 'free' ? FREE_PLAN : (PLANS[planId] || FREE_PLAN);
    const expiresAt = user?.subscription_expires_at;
    const isActive  = planId === 'free' || (expiresAt && new Date(expiresAt) > new Date());

    res.json({
      plan:       planId,
      plan_name:  planMeta.name,
      expires_at: expiresAt,
      is_active:  isActive,
      features:   planMeta.features,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
