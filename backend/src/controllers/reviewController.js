const { Review, Consultation, Astrologer } = require('../models');

async function submitReview(req, res) {
  try {
    const { consultation_id, astrologer_id, rating, comment } = req.body;
    if (!consultation_id || !astrologer_id || !rating) {
      return res.status(400).json({ error: 'consultation_id, astrologer_id and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const consultation = await Consultation.findOne({ where: { id: consultation_id, user_id: req.user.id } });
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

    const existing = await Review.findOne({ where: { consultation_id } });
    if (existing) return res.status(409).json({ error: 'Already reviewed this consultation' });

    const review = await Review.create({
      consultation_id,
      user_id: req.user.id,
      astrologer_id,
      rating,
      comment: comment || null
    });

    // Recalculate astrologer average rating
    const allReviews = await Review.findAll({ where: { astrologer_id } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Astrologer.update(
      { rating: parseFloat(avg.toFixed(1)), total_reviews: allReviews.length },
      { where: { id: astrologer_id } }
    );

    res.json({ success: true, review });
  } catch (err) {
    console.error('submitReview error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

module.exports = { submitReview };
