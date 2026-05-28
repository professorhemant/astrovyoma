const { Astrologer, Review } = require('../models');
const { findMatchingAstrologers } = require('../services/matchingService');

async function getAstrologers(req, res) {
  try {
    const { concern, sort, page = 1, limit = 12 } = req.query;
    let astrologers = await findMatchingAstrologers(concern, req.user?.id, parseInt(limit) * parseInt(page));

    if (sort === 'rating') astrologers.sort((a, b) => b.rating - a.rating);
    else if (sort === 'orders') astrologers.sort((a, b) => b.completed_orders - a.completed_orders);
    else if (sort === 'price_asc') astrologers.sort((a, b) => a.price_per_min - b.price_per_min);
    else if (sort === 'price_desc') astrologers.sort((a, b) => b.price_per_min - a.price_per_min);

    // Verified pandits always appear first
    astrologers.sort((a, b) => (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0));

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = astrologers.slice(offset, offset + parseInt(limit));

    res.json({ astrologers: paginated, total: astrologers.length, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getAstrologers error:', err);
    res.status(500).json({ error: 'Failed to fetch astrologers' });
  }
}

async function getAstrologerById(req, res) {
  try {
    const astrologer = await Astrologer.findByPk(req.params.id, {
      include: [{ model: Review, as: 'reviews', limit: 5, order: [['created_at', 'DESC']] }]
    });
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });
    res.json(astrologer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch astrologer' });
  }
}

async function updateOnlineStatus(req, res) {
  try {
    const { is_online } = req.body;
    const astrologer = await Astrologer.findOne({ where: { user_id: req.user.id } });
    if (!astrologer) return res.status(404).json({ error: 'Astrologer profile not found' });
    await astrologer.update({ is_online });
    res.json({ success: true, is_online });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
}

module.exports = { getAstrologers, getAstrologerById, updateOnlineStatus };
