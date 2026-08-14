const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Astrologer, Consultation, User, Appointment } = require('../models');
const availability = require('../services/availabilityService');
const { validateContact } = require('../services/contactService');
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
    // email and phone travel with the status so the portal can ask for
    // whichever is missing. Approval used to drop the address the astrologer
    // applied with, so most existing accounts have only a number.
    const a = await Astrologer.findByPk(req.pandit.panditId, {
      attributes: ['id', 'display_name', 'photo_url', 'is_online', 'price_per_min', 'free_minutes', 'email', 'phone']
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

// ─── contact details ─────────────────────────────────────────────────────────

// The astrologer filling in what her record is missing.
//
// Same rule as the seeker's version: it only adds. Her phone is what she signs
// in with, so changing it here would be changing her login, and that belongs
// with the admin rather than in a prompt she is trying to get past.
async function setContact(req, res) {
  try {
    const a = await Astrologer.findByPk(req.pandit.panditId);
    if (!a) return res.status(404).json({ error: 'Astrologer not found' });

    const patch = {};
    if (!a.email && req.body.email !== undefined) patch.email = req.body.email;
    if (!a.phone && req.body.phone !== undefined) patch.phone = req.body.phone;
    if (!Object.keys(patch).length) {
      return res.status(400).json({ error: 'Nothing to add — those details are already on your account.' });
    }

    const check = validateContact(patch, { require: false });
    if (!check.ok) return res.status(400).json({ error: check.errors.join(' ') });

    if (check.value.phone) {
      const taken = await Astrologer.findOne({ where: { phone: check.value.phone } });
      if (taken && taken.id !== a.id) {
        return res.status(409).json({ error: 'Another astrologer already uses that mobile number.' });
      }
    }

    await a.update(check.value);
    res.json({ id: a.id, display_name: a.display_name, email: a.email, phone: a.phone });
  } catch (err) {
    console.error('setContact error:', err);
    res.status(500).json({ error: 'Could not save your details' });
  }
}

// ─── working hours ───────────────────────────────────────────────────────────

// Her own hours, filled in for every weekday so the screen has something to
// show rather than having to know what an unset day means.
async function getAvailability(req, res) {
  try {
    const astrologer = await Astrologer.findByPk(req.pandit.panditId);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });
    res.json(availability.forEditing(astrologer.availability));
  } catch (err) {
    console.error('getAvailability error:', err);
    res.status(500).json({ error: 'Could not load your hours' });
  }
}

async function setAvailability(req, res) {
  try {
    const astrologer = await Astrologer.findByPk(req.pandit.panditId);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

    const cleaned = availability.fromEditing(req.body);
    await astrologer.update({ availability: JSON.stringify(cleaned) });

    // Answered in the editing shape, so the screen re-renders from what was
    // actually stored rather than from what it hoped had been stored.
    res.json(availability.forEditing(cleaned));
  } catch (err) {
    console.error('setAvailability error:', err);
    res.status(500).json({ error: 'Could not save your hours' });
  }
}

// ─── who has booked her ──────────────────────────────────────────────────────

// Appointments were being taken and the astrologer had no way to see one. This
// is the list: what is still to come first, because that is what she has to
// plan around, and a short tail of what has been.
async function getAppointments(req, res) {
  try {
    const rows = await Appointment.findAll({
      where: { astrologer_id: req.pandit.panditId, status: { [Op.ne]: 'cancelled' } },
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }],
      order: [['scheduled_at', 'ASC']],
      limit: 200,
    });

    const now = Date.now();
    const shape = (a) => ({
      id: a.id,
      scheduled_at: a.scheduled_at,
      duration_mins: a.duration_mins,
      mode: a.mode,
      status: a.status,
      amount: a.amount,
      concern_category: a.concern_category,
      concern_notes: a.concern_notes,
      // A seeker's name and nothing more. She needs to know who is coming; she
      // does not need their account.
      seeker: a.user?.name || 'A seeker',
    });

    const upcoming = rows.filter(a => new Date(a.scheduled_at).getTime() >= now).map(shape);
    const past     = rows.filter(a => new Date(a.scheduled_at).getTime() <  now).reverse().slice(0, 10).map(shape);

    res.json({ upcoming, past });
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ error: 'Could not load your appointments' });
  }
}

module.exports = {
  panditLogin, toggleStatus, getStatus, getEarnings,
  getIncomingCalls, acceptCall, declineCall, endCall,
  getAvailability, setAvailability, getAppointments, setContact,
};
