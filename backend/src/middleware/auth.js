const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'wallet_balance', 'onboarding_complete',
        // Carried on every request so a gated feature can read the tier without
        // a second query. Dreams is the first to need it.
        'subscription_plan', 'subscription_expires_at']
    });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'wallet_balance', 'onboarding_complete',
        // Carried on every request so a gated feature can read the tier without
        // a second query. Dreams is the first to need it.
        'subscription_plan', 'subscription_expires_at']
    });
    if (user) req.user = user;
  } catch {}
  next();
}

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
