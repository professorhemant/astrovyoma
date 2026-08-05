const crypto = require('crypto');
const { User, Transaction } = require('../models');
const { creditRecharge } = require('../services/walletService');
const { getRazorpay } = require('../services/razorpay');

// Recharge packs are defined here, not on the client. The wallet buys real
// astrologer minutes, so both the price and the promo bonus have to come from
// the server — a client-supplied amount is a client-supplied balance.
const RECHARGE_PACKS = [
  { amount: 100,  bonus: 0   },
  { amount: 300,  bonus: 30  },
  { amount: 500,  bonus: 75  },
  { amount: 1000, bonus: 200 },
  { amount: 2000, bonus: 500 },
];

function findPack(amount) {
  return RECHARGE_PACKS.find(p => p.amount === Number(amount));
}

async function getBalance(req, res) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['wallet_balance'] });
    res.json({ balance: parseFloat(user.wallet_balance) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
}

function getPacks(req, res) {
  res.json({ packs: RECHARGE_PACKS });
}

// Step 1 — open a Razorpay order for a pack. Nothing is credited here.
async function createRechargeOrder(req, res) {
  try {
    const pack = findPack(req.body.amount);
    if (!pack) return res.status(400).json({ error: 'Invalid recharge amount' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount:   pack.amount * 100, // paise
      currency: 'INR',
      receipt:  `wallet_${req.user.id}_${Date.now()}`,
      notes:    { user_id: String(req.user.id), kind: 'wallet_recharge', pack: String(pack.amount) }
    });

    res.json({
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
      pack,
    });
  } catch (err) {
    if (err.message === 'Razorpay credentials not configured') {
      return res.status(503).json({ error: 'Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.' });
    }
    console.error('createRechargeOrder error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
}

// Step 2 — verify the signature, re-read the order from Razorpay, then credit.
//
// The signature proves the payment ids are genuinely ours, but it says nothing
// about how much was paid, so the amount is taken from the fetched order rather
// than from the request body. The order's notes also have to name this user, or
// one account could redeem another account's payment.
async function verifyRecharge(req, res) {
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

    // timingSafeEqual throws on a length mismatch, so compare lengths first.
    const sigBuf = Buffer.from(String(razorpay_signature));
    const digBuf = Buffer.from(digest);
    if (sigBuf.length !== digBuf.length || !crypto.timingSafeEqual(sigBuf, digBuf)) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (order.notes?.kind !== 'wallet_recharge') {
      return res.status(400).json({ error: 'Order is not a wallet recharge' });
    }
    if (String(order.notes?.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Order does not belong to this account' });
    }
    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Payment not captured yet. Please wait a moment and refresh.' });
    }

    // Trust the order, not the caller: amount_paid is in paise.
    const paid = Number(order.amount_paid) / 100;
    const pack = findPack(paid);
    if (!pack) return res.status(400).json({ error: 'Unrecognised recharge amount' });

    const result = await creditRecharge(req.user.id, {
      paid,
      bonus:       pack.bonus,
      referenceId: razorpay_payment_id,
      description: `Wallet recharge ₹${paid}`,
    });
    if (!result.success) return res.status(400).json({ error: result.reason || 'Recharge failed' });

    res.json({
      success:   true,
      balance:   result.balance,
      credited:  result.duplicate ? 0 : paid + pack.bonus,
      bonus:     pack.bonus,
      duplicate: result.duplicate,
    });
  } catch (err) {
    if (err.message === 'Razorpay credentials not configured') {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }
    console.error('verifyRecharge error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}

// The old endpoint credited whatever amount the request body asked for, with no
// payment behind it. Kept only so a browser running a cached bundle gets a clear
// message instead of a silent failure.
function legacyRecharge(req, res) {
  res.status(410).json({
    error: 'This recharge method has been withdrawn. Please reload the page and recharge again.',
  });
}

async function getTransactions(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Transaction.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ transactions: transactions.rows, total: transactions.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

module.exports = {
  getBalance,
  getPacks,
  createRechargeOrder,
  verifyRecharge,
  legacyRecharge,
  getTransactions,
  RECHARGE_PACKS,
};
