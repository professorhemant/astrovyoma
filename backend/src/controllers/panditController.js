const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Astrologer } = require('../models');
const earningsService = require('../services/earningsService');

async function panditLogin(req, res) {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) return res.status(400).json({ error: 'Phone and PIN required' });

    const normalised = phone.replace(/\D/g, '').slice(-10);

    // Previously this was findOne({ where: { is_verified: true } }) — it took an
    // arbitrary verified astrologer and then checked whether *that* row's phone
    // matched. With one verified pandit it happened to work; with two it would
    // authenticate only whichever row the database returned first and lock
    // everyone else out. Resolve the account by the phone that was supplied.
    const candidates = await Astrologer.findAll({
      where: { is_verified: true },
      attributes: ['id', 'display_name', 'photo_url', 'is_online', 'phone', 'pin_hash', 'free_minutes', 'price_per_min']
    });

    const astrologer = candidates.find(a =>
      a.phone && a.phone.replace(/\D/g, '').slice(-10) === normalised
    );

    if (!astrologer) return res.status(401).json({ error: 'Invalid phone or PIN' });

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

// An astrologer's own earnings. Reads only their own rows — the token carries
// the astrologer id, and nothing in the request can point it at anybody else.
async function getEarnings(req, res) {
  try {
    res.json(await earningsService.summaryFor(req.pandit.panditId));
  } catch (err) {
    console.error('getEarnings error:', err);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
}

module.exports = { panditLogin, toggleStatus, getStatus, getEarnings };
