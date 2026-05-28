const crypto  = require('crypto');
const Razorpay = require('razorpay');
const { User, Subscription } = require('../models');

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

function getRazorpay() {
  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error('Razorpay credentials not configured');
  return new Razorpay({ key_id, key_secret });
}

exports.getPlans = (req, res) => {
  res.json({ plans: [FREE_PLAN, PLANS.silver, PLANS.gold, PLANS.platinum] });
};

exports.createOrder = async (req, res) => {
  try {
    const { planId, billing } = req.body; // billing: 'monthly' | 'yearly'
    const plan = PLANS[planId];
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
