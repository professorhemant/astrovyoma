'use strict';

const Razorpay = require('razorpay');

// Shared Razorpay client factory. Throws a well-known message so callers can
// map it to a 503 rather than leaking a 500 when the keys simply aren't set.
function getRazorpay() {
  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id === 'your_razorpay_key') {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({ key_id, key_secret });
}

module.exports = { getRazorpay };
