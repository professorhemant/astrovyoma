'use strict';

// Per-route limiter for endpoints that spend money on the AI provider.
//
// The global limiter (200 requests / 15 min per IP) is sized for ordinary page
// traffic. Applied to an AI endpoint it permits ~800 calls an hour from a single
// IP — enough to drain a day's token quota in under an hour, which takes down
// every AI feature for real users, not just the abuser.
//
// Anonymous callers get a small allowance so the free-trial funnel still works;
// signed-in users get a larger one, keyed to the account rather than the IP so a
// shared network (office, campus, mobile carrier NAT) doesn't throttle everyone
// together.

const rateLimit = require('express-rate-limit');

const ANON_PER_HOUR = Number(process.env.AI_RATE_LIMIT_ANON) || 5;
const USER_PER_HOUR = Number(process.env.AI_RATE_LIMIT_USER) || 30;

// An IPv6 client is typically handed a whole /64, so keying on the full address
// lets one machine rotate through effectively unlimited keys. Collapse to the
// first four hextets. IPv4 is used as-is.
function ipKey(req) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!ip.includes(':')) return ip;
  return ip.split(':').slice(0, 4).join(':') + '::/64';
}

const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => (req.user ? USER_PER_HOUR : ANON_PER_HOUR),
  // Signed-in users are counted per account; everyone else per IP subnet.
  keyGenerator: (req) => (req.user ? `u:${req.user.id}` : `ip:${ipKey(req)}`),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const signedIn = !!req.user;
    res.status(429).json({
      error: signedIn
        ? 'You have reached the hourly limit for AI readings. Please try again later.'
        : 'Free limit reached. Please sign in to continue — signed-in users get a higher limit.',
      retry: true,
      requires_login: !signedIn,
      limit: signedIn ? USER_PER_HOUR : ANON_PER_HOUR,
      window: '1 hour',
    });
  },
});

module.exports = aiRateLimit;
