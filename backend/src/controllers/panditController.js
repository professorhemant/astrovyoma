const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Astrologer, Consultation, User } = require('../models');
const earningsService = require('../services/earningsService');
const { generateToken } = require('../services/agoraService');
const { finalizeConsultation, expireIfRungOut, RING_TIMEOUT_MS } = require('./consultationController');

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

// ── Incoming calls ───────────────────────────────────────────────────────────
// The portal polls this while the astrologer is online. Polling rather than a
// socket because the app has no socket layer, and adding one to ring a phone
// would be a larger change than the feature warrants; a few seconds of latency
// on an incoming call is acceptable, a new always-on transport is not.
async function getIncomingCalls(req, res) {
  try {
    // Close anything that rang out before offering the rest. The caller's own
    // polling does the same, so this is a convenience rather than the only
    // place it can happen.
    const stale = await Consultation.findAll({
      where: { astrologer_id: req.pandit.panditId, status: 'ringing' },
    });
    for (const c of stale) await expireIfRungOut(c);

    const ringing = await Consultation.findAll({
      where: { astrologer_id: req.pandit.panditId, status: 'ringing' },
      order: [['started_at', 'ASC']],
    });

    const withSeeker = await Promise.all(ringing.map(async (c) => {
      const seeker = await User.findByPk(c.user_id, { attributes: ['name'] });
      return {
        id: c.id,
        mode: c.mode,
        concern_category: c.concern_category,
        seeker_name: seeker?.name || 'A seeker',
        started_at: c.started_at,
        rings_out_at: new Date(new Date(c.started_at).getTime() + RING_TIMEOUT_MS),
      };
    }));

    // The in-call one, so a portal that was reloaded mid-call finds its way back.
    const active = await Consultation.findOne({
      where: { astrologer_id: req.pandit.panditId, status: 'active' },
    });

    res.json({ incoming: withSeeker, active_id: active ? active.id : null });
  } catch (err) {
    console.error('getIncomingCalls error:', err);
    res.status(500).json({ error: 'Failed to check for calls' });
  }
}

// Accepting hands back a token for the same channel the seeker is sitting in.
// It does not set connected_at: that is still stamped when the seeker's browser
// actually sees this astrologer publish audio. Accepting a call and failing to
// get a microphone open should not start anybody's meter.
async function acceptCall(req, res) {
  try {
    const c = await Consultation.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Call not found' });
    if (c.astrologer_id !== req.pandit.panditId) return res.status(403).json({ error: 'Not your call' });
    if (c.status === 'missed') return res.status(410).json({ error: 'That call rang out.' });
    if (c.status !== 'ringing' && c.status !== 'active') {
      return res.status(410).json({ error: 'That call has already ended.' });
    }

    const { configured, token, appId } = generateToken(c.agora_channel, 0);
    if (!configured) return res.status(503).json({ error: 'Calling is unavailable right now.' });

    if (c.status === 'ringing') await c.update({ status: 'active' });

    const seeker = await User.findByPk(c.user_id, { attributes: ['name'] });
    res.json({
      consultation_id: c.id,
      mode: c.mode,
      seeker_name: seeker?.name || 'A seeker',
      agora: { token, appId, channel: c.agora_channel },
    });
  } catch (err) {
    console.error('acceptCall error:', err);
    res.status(500).json({ error: 'Failed to accept the call' });
  }
}

async function declineCall(req, res) {
  try {
    const c = await Consultation.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Call not found' });
    if (c.astrologer_id !== req.pandit.panditId) return res.status(403).json({ error: 'Not your call' });
    if (c.status !== 'ringing') return res.status(410).json({ error: 'That call is no longer ringing.' });

    // Nothing connected, so nothing is billed — declining costs the seeker
    // nothing and pays the astrologer nothing.
    await c.update({ status: 'declined', ended_at: new Date(), ended_by: 'astrologer' });
    res.json({ success: true });
  } catch (err) {
    console.error('declineCall error:', err);
    res.status(500).json({ error: 'Failed to decline the call' });
  }
}

// The astrologer hanging up settles the consultation through exactly the same
// path as the seeker hanging up, so the bill cannot differ by who pressed first.
async function endCall(req, res) {
  try {
    const c = await Consultation.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Call not found' });
    if (c.astrologer_id !== req.pandit.panditId) return res.status(403).json({ error: 'Not your call' });
    if (c.status === 'completed') return res.json({ success: true, already_ended: true });

    const r = await finalizeConsultation(c, 'astrologer');
    res.json({ success: true, duration_mins: r.durationMins, total_cost: r.totalCost, paid: r.paid });
  } catch (err) {
    console.error('endCall error:', err);
    res.status(500).json({ error: 'Failed to end the call' });
  }
}

module.exports = { panditLogin, toggleStatus, getStatus, getEarnings, getIncomingCalls, acceptCall, declineCall, endCall };
