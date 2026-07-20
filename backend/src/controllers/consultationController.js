const { v4: uuidv4 } = require('uuid');
const { Consultation, Message, Astrologer, User } = require('../models');
const { generateToken, isConfigured: agoraConfigured } = require('../services/agoraService');
const { deductPerMinute } = require('../services/walletService');

async function startConsultation(req, res) {
  try {
    const { astrologer_id, mode, concern_category } = req.body;
    if (!astrologer_id || !mode) return res.status(400).json({ error: 'astrologer_id and mode are required' });

    const astrologer = await Astrologer.findByPk(astrologer_id);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

    // Refuse a voice/video consultation when Agora is not configured, BEFORE
    // creating the record. Creating it would set started_at and status active,
    // and endConsultation bills duration x price_per_min — so the user would be
    // charged for a call that could never connect. Chat needs no Agora and is
    // unaffected.
    const needsRtc = mode === 'video' || mode === 'audio';
    if (needsRtc && !agoraConfigured()) {
      return res.status(503).json({
        error: 'Voice and video calls are temporarily unavailable. Please use chat instead.',
        mode_unavailable: mode,
        chat_available: true,
      });
    }

    const channelName = `consult_${uuidv4().replace(/-/g, '')}`;
    const { token, appId } = generateToken(channelName, 0);

    const consultation = await Consultation.create({
      user_id: req.user.id,
      astrologer_id,
      mode,
      concern_category: concern_category || 'general',
      status: 'active',
      agora_channel: channelName,
      started_at: new Date()
    });

    res.status(201).json({
      consultation,
      agora: { token, appId, channel: channelName }
    });
  } catch (err) {
    console.error('startConsultation error:', err);
    res.status(500).json({ error: 'Failed to start consultation' });
  }
}

async function endConsultation(req, res) {
  try {
    const consultation = await Consultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    if (consultation.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const endTime = new Date();
    const startTime = new Date(consultation.started_at);
    const durationMins = Math.max(1, Math.ceil((endTime - startTime) / 60000));

    const astrologer = await Astrologer.findByPk(consultation.astrologer_id);
    const costPerMin = astrologer ? parseFloat(astrologer.price_per_min) : 30;
    const totalCost = durationMins * costPerMin;

    if (!consultation.is_free_trial) {
      await deductPerMinute(req.user.id, consultation.astrologer_id, totalCost);
    }

    await consultation.update({
      status: 'completed',
      ended_at: endTime,
      duration_mins: durationMins,
      total_cost: totalCost
    });

    res.json({ consultation, duration_mins: durationMins, total_cost: totalCost });
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

module.exports = { startConsultation, endConsultation, getMessages, sendMessage };
