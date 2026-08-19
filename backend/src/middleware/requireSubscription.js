'use strict';

// Who counts as a subscriber.
//
// The plan and its expiry have been written to the user row since Razorpay
// verification was built, but nothing has ever read them as a gate — Dreams is
// the first paid feature on the site. Both halves of the question live here so
// the next one does not invent its own answer.
//
// A lapsed subscription is not a subscription. `subscription_plan` keeps its
// last value after expiry rather than resetting to 'free', so checking the plan
// name alone would let a plan that ran out in March through in August.

// The plans are cumulative — Gold is "everything in Silver", Platinum is
// "everything in Gold" — so a gate is a floor rather than a list. Ranking them
// here means a feature says which tier it starts at and gets every tier above
// it for free, which is what the pricing page already promises the reader.
const TIER = { free: 0, silver: 1, gold: 2, platinum: 3 };

function hasActiveSubscription(user, minPlan = 'silver') {
  if (!user) return false;
  const plan = user.subscription_plan;
  if (!plan || plan === 'free') return false;
  const expires = user.subscription_expires_at;
  if (!expires) return false;
  if (new Date(expires) <= new Date()) return false;
  return (TIER[plan] ?? 0) >= (TIER[minPlan] ?? 1);
}

// A hard gate, for endpoints that should not answer at all without a plan.
//
// Dreams deliberately does not use this: it answers everyone and varies what it
// returns, because the free half — the watch of the night, the symbol and its
// verdict — is what convinces somebody the paid half is worth having. Use this
// where there is no meaningful free version of the answer.
function requireSubscription(minPlan = 'silver') {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Please sign in to use this feature.', code: 'auth_required' });
    }
    if (!hasActiveSubscription(req.user, minPlan)) {
      return res.status(402).json({
        error: 'This feature is part of a subscription plan.',
        code: 'subscription_required',
        required_plan: minPlan,
      });
    }
    next();
  };
}

module.exports = requireSubscription;
module.exports.hasActiveSubscription = hasActiveSubscription;
module.exports.TIER = TIER;
