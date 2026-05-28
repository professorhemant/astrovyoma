const { Astrologer } = require('../models');

async function findMatchingAstrologers(concernCategory, userId, limit = 12) {
  const allAvailable = await Astrologer.findAll({
    where: { is_available: true },
    attributes: ['id','display_name','photo_url','bio','specialties','languages',
      'experience_years','price_per_min','rating','total_reviews',
      'completed_orders','response_rate','is_online','is_verified',
      'phone','free_minutes','concern_tags']
  });

  // Filter by concern in JS (concern_tags stored as JSON text in SQLite)
  let filtered = allAvailable;
  if (concernCategory && concernCategory !== 'general') {
    filtered = allAvailable.filter(a => {
      const tags = Array.isArray(a.concern_tags) ? a.concern_tags : [];
      return tags.includes(concernCategory);
    });
    // Fall back to all if no match
    if (filtered.length === 0) filtered = allAvailable;
  }

  // Smart Matching Score
  const scored = filtered.map(a => {
    const ratingScore = (parseFloat(a.rating) / 5) * 35;
    const ordersScore = Math.min(a.completed_orders / 1000, 1) * 25;
    const availabilityScore = a.is_online ? 20 : 10;
    const responseScore = (parseFloat(a.response_rate) / 100) * 10;
    const priceScore = Math.max(0, (1 - parseFloat(a.price_per_min) / 200)) * 10;
    const totalScore = ratingScore + ordersScore + availabilityScore + responseScore + priceScore;
    return { ...a.toJSON(), match_score: Math.round(totalScore) };
  });

  scored.sort((a, b) => {
    if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
    return b.match_score - a.match_score;
  });

  return scored.slice(0, limit);
}

module.exports = { findMatchingAstrologers };
