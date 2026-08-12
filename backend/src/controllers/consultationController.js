const { v4: uuidv4 } = require('uuid');
const { Consultation, Message, Astrologer, User } = require('../models');
const { generateToken, isConfigured: agoraConfigured } = require('../services/agoraService');
const { deductPerMinute } = require('../services/walletService');
const { recordConsultationEarning } = require('../services/earningsService');

// How long a call rings before nobody is coming. Long enough to reach a phone in
// another room, short enough that a caller is not left hanging.
const RING_TIMEOUT_MS = 60 * 1000;

// Closes a call that rang out, and returns whether it did.
//
// This has to be reachable from the *caller's* polling as well as the
// astrologer's. It was originally only applied when the astrologer's portal
// polled — so an astrologer who never opened the portal at all was the one case
// where it could not fire, which is precisely the case it exists for. A caller
// then watched "Waiting to join…" indefinitely.
async function expireIfRungOut(consultation) {
  if (consultation.status !== 'ringing') return false;
  const startedAt = new Date(consultation.started_at).getTime();
  if (Date.now() - startedAt < RING_TIMEOUT_MS) return false;
  await consultation.update({ status: 'missed', ended_at: new Date() });
  return true;
}

async function startConsultation(req, res) {
  try {
    const { astrologer_id, mode, concern_category } = req.body;
    if (!astrologer_id || !mode) return res.status(400).json({ error: 'astrologer_id and mode are required' });

    const astrologer = await Astrologer.findByPk(astrologer_id);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

    // Chat stays withdrawn. It had an AI answering in the astrologer's name,
    // and the Pandit Portal still has no inbox to replace that with. Voice and
    // video are back now that the portal can actually receive them.
    if (mode === 'chat') {
      return res.status(410).json({
        error: 'Chat consultations are not available. Try a voice or video call, or ask AstroVyoma AI free at /chat.',
        mode_unavailable: 'chat',
      });
    }
    if (mode !== 'audio' && mode !== 'video') {
      return res.status(400).json({ error: 'mode must be audio or video' });
    }

    // Refuse a voice/video consultation when Agora is not configured, BEFORE
    // creating the record. Creating it would set started_at and status active,
    // and endConsultation bills duration x price_per_min — so the user would be
    // charged for a call that could never connect.
    const needsRtc = mode === 'video' || mode === 'audio';
    if (needsRtc && !agoraConfigured()) {
      return res.status(503).json({
        error: 'Voice and video calls are temporarily unavailable. Please try again shortly.',
        mode_unavailable: mode,
      });
    }

    // An offline astrologer cannot pick up. A seeker called one on 2026-08-12,
    // sat on "Waiting for her to join...", hung up after 31 seconds and was
    // charged a full minute — she was never going to answer.
    if (!astrologer.is_online) {
      return res.status(409).json({
        error: `${astrologer.display_name} is offline right now. Book an appointment, or pick an astrologer showing as available.`,
        astrologer_offline: true,
      });
    }

    // Free minutes are a first-time trial with this astrologer, not a standing
    // allowance — otherwise "2 Min Free" is an unlimited supply of free
    // two-minute calls. One prior consultation with them uses it up.
    const perMin = parseFloat(astrologer.price_per_min) || 0;
    const freeMinutes = Number(astrologer.free_minutes) || 0;
    const priorCount = await Consultation.count({
      where: { user_id: req.user.id, astrologer_id },
    });
    const trialApplies = freeMinutes > 0 && priorCount === 0;

    // And refuse when the wallet cannot cover the first billable minute, rather
    // than discovering it at the end — endConsultation completes the session
    // either way, so an unfunded call is work the astrologer never gets paid for.
    if (!trialApplies && perMin > 0) {
      const seeker = await User.findByPk(req.user.id);
      if (parseFloat(seeker?.wallet_balance || 0) < perMin) {
        return res.status(402).json({
          error: `You need at least ₹${perMin} in your wallet to start this consultation.`,
          required: perMin,
          balance: parseFloat(seeker?.wallet_balance || 0),
        });
      }
    }

    const channelName = `consult_${uuidv4().replace(/-/g, '')}`;
    const { token, appId } = generateToken(channelName, 0);

    const consultation = await Consultation.create({
      user_id: req.user.id,
      astrologer_id,
      mode,
      concern_category: concern_category || 'general',
      status: 'ringing',
      agora_channel: channelName,
      started_at: new Date(),
      // Recorded on the row so the trial is decided once, at the start, and the
      // seeker cannot be billed differently from what they were told.
      is_free_trial: trialApplies,
    });

    res.status(201).json({
      consultation,
      free_minutes: trialApplies ? freeMinutes : 0,
      agora: { token, appId, channel: channelName }
    });
  } catch (err) {
    console.error('startConsultation error:', err);
    res.status(500).json({ error: 'Failed to start consultation' });
  }
}


// Closes a consultation and settles it. Both ends of the call reach this — the
// seeker's End button and the astrologer's — so hanging up from either side
// bills identically instead of via two drifting copies.
async function finalizeConsultation(consultation, endedBy) {
  const endTime = new Date();

  // Bill from the moment the astrologer joined, never from started_at.
  // started_at is stamped when the record is created — before the seeker has
  // even opened the call screen — so a call that never connected used to bill a
  // full minute of wall-clock waiting. No connection means no consultation
  // happened and nothing is owed.
  const connectedAt = consultation.connected_at ? new Date(consultation.connected_at) : null;
  const durationMins = connectedAt
    ? Math.max(1, Math.ceil((endTime - connectedAt) / 60000))
    : 0;

  const astrologer = await Astrologer.findByPk(consultation.astrologer_id);
  const costPerMin = astrologer ? parseFloat(astrologer.price_per_min) : 30;

  // A trial discounts its free minutes off the bill; it does not make the whole
  // session free.
  const freeMins = consultation.is_free_trial ? (Number(astrologer?.free_minutes) || 0) : 0;
  const billableMins = Math.max(0, durationMins - freeMins);
  const totalCost = billableMins * costPerMin;

  let paid = false;
  if (totalCost > 0) {
    const debit = await deductPerMinute(consultation.user_id, consultation.astrologer_id, totalCost);
    paid = debit?.success === true;
    if (!paid) {
      console.error(`[billing] consultation ${consultation.id} completed unpaid: ${debit?.reason || 'debit failed'}`);
    }
  }

  await consultation.update({
    status: 'completed',
    ended_at: endTime,
    ended_by: endedBy,
    duration_mins: durationMins,
    total_cost: totalCost,
  });

  if (paid) {
    try {
      await recordConsultationEarning({
        consultationId: consultation.id,
        astrologerId:   consultation.astrologer_id,
        userId:         consultation.user_id,
        grossAmount:    totalCost,
        durationMins:   billableMins,
      });
    } catch (err) {
      // The seeker has already been debited. Failing the request now would be
      // worse than a missing earnings row, which can be reconciled from the
      // consultation itself.
      console.error('[earnings] failed to record consultation', consultation.id, err.message);
    }
  }

  return { durationMins, freeMins, billableMins, totalCost, paid };
}

async function endConsultation(req, res) {
  try {
    const consultation = await Consultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    if (consultation.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const r = await finalizeConsultation(consultation, 'seeker');

    res.json({
      consultation,
      duration_mins: r.durationMins,
      free_mins_applied: r.freeMins,
      billable_mins: r.billableMins,
      total_cost: r.totalCost,
      paid: r.paid,
    });
  } catch (err) {
    console.error('endConsultation error:', err);
    res.status(500).json({ error: 'Failed to end consultation' });
  }
}

async function getMessages(req, res) {
  try {
    const consultation = await Consultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    if (consultation.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const messages = await Message.findAll({
      where: { consultation_id: req.params.id },
      order: [['created_at', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

async function sendMessage(req, res) {
  try {
    const { content, message_type = 'text' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const consultation = await Consultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    if (consultation.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const message = await Message.create({
      consultation_id: req.params.id,
      sender_type: 'user',
      sender_id: req.user.id,
      content,
      message_type
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}

// Called by the seeker's call screen the first time the astrologer publishes
// audio or video — that is the only moment we know the two are actually
// together. The seeker's own join does not count: in the incident that prompted
// this, the seeker joined an empty channel and waited alone.
//
// Idempotent: the client fires it on every publish event, and only the first
// one counts, so a camera turning on mid-call cannot restart the clock.
// The seeker's call screen polls this while it waits, so a call that was
// declined or rang out says so instead of showing "Connecting…" forever.
async function getConsultationStatus(req, res) {
  try {
    const c = await Consultation.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Consultation not found' });
    if (c.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await expireIfRungOut(c);

    res.json({
      id: c.id,
      status: c.status,
      connected_at: c.connected_at,
      ended_at: c.ended_at,
      ended_by: c.ended_by,
      duration_mins: c.duration_mins,
      total_cost: c.total_cost,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read status' });
  }
}

async function markConnected(req, res) {
  try {
    const consultation = await Consultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    if (consultation.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    if (!consultation.connected_at) {
      await consultation.update({ connected_at: new Date() });
    }
    res.json({ connected_at: consultation.connected_at });
  } catch (err) {
    console.error('markConnected error:', err);
    res.status(500).json({ error: 'Failed to mark connected' });
  }
}

module.exports = { startConsultation, endConsultation, markConnected, getConsultationStatus, getMessages, sendMessage, finalizeConsultation, expireIfRungOut, RING_TIMEOUT_MS };
