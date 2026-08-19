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

function hasActiveSubscription(user) {
  if (!user) return false;
  const plan = user.subscription_plan;
  if (!plan || plan === 'free') return false;
  const expires = user.subscription_expires_at;
  if (!expires) return false;
  return new Date(expires) > new Date();
}

// A hard gate, for endpoints that should not answer at all without a plan.
//
// Dreams deliberately does not use this: it answers everyone and varies what it
// returns, because the free half — the watch of the night, the symbol and its
// verdict — is what convinces somebody the paid half is worth having. Use this
// where there is no meaningful free version of the answer.
function requireSubscription(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to use this feature.', code: 'auth_required' });
  }
  if (!hasActiveSubscription(req.user)) {
    return res.status(402).json({
      error: 'This feature is part of a subscription plan.',
      code: 'subscription_required',
    });
  }
  next();
}

module.exports = requireSubscription;
module.exports.hasActiveSubscription = hasActiveSubscription;
