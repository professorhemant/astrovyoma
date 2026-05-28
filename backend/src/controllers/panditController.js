const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Astrologer } = require('../models');

async function panditLogin(req, res) {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) return res.status(400).json({ error: 'Phone and PIN required' });

    const normalised = phone.replace(/\D/g, '');
    const astrologer = await Astrologer.findOne({
      where: { is_verified: true },
      attributes: ['id', 'display_name', 'photo_url', 'is_online', 'phone', 'pin_hash', 'free_minutes', 'price_per_min']
    });

    // Match by last 10 digits of stored phone
    const match = astrologer && astrologer.phone &&
      astrologer.phone.replace(/\D/g, '').endsWith(normalised.slice(-10));

    if (!match) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const pinOk = await bcrypt.compare(pin, astrologer.pin_hash || '');
    if (!pinOk) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const token = jwt.sign(
      { panditId: astrologer.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      pandit: {
        id: astrologer.id,
        display_name: astrologer.display_name,
        photo_url: astrologer.photo_url,
        is_online: astrologer.is_online,
        price_per_min: astrologer.price_per_min,
        free_minutes: astrologer.free_minutes,
      }
    });
  } catch (err) {
    console.error('panditLogin error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function toggleStatus(req, res) {
  try {
    const { panditId } = req.pandit;
    const { is_online } = req.body;
    await Astrologer.update({ is_online }, { where: { id: panditId } });
    res.json({ success: true, is_online });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
}

async function getStatus(req, res) {
  try {
    const a = await Astrologer.findByPk(req.pandit.panditId, {
      attributes: ['id', 'display_name', 'photo_url', 'is_online', 'price_per_min', 'free_minutes']
    });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
}

module.exports = { panditLogin, toggleStatus, getStatus };
