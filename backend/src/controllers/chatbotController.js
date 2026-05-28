const { getAstrologyChatResponse, getPanditJiResponse } = require('../services/chatbotService');
const { Kundali } = require('../models');

const conversationStore = new Map();

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });

    const userId = req.user.id;
    if (!conversationStore.has(userId)) conversationStore.set(userId, []);
    const history = conversationStore.get(userId);

    const kundaliData = kundali ? {
      sun_sign: kundali.sun_sign,
      moon_sign: kundali.moon_sign,
      lagna: kundali.lagna,
      nakshatra: kundali.nakshatra,
      nakshatra_pada: kundali.nakshatra_pada,
      planetary_positions: kundali.planetary_positions,
      dasha_sequence: kundali.dasha_sequence,
      life_purpose: kundali.life_purpose,
      swabhav: kundali.swabhav
    } : null;

    const response = await getAstrologyChatResponse(message, kundaliData, history);

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response });
    if (history.length > 20) history.splice(0, 2);

    res.json({ response, has_kundali: !!kundali });
  } catch (err) {
    console.error('chatbot error:', err);
    res.status(500).json({ error: 'Failed to get response: ' + (err.message || 'Unknown error') });
  }
}

async function clearHistory(req, res) {
  conversationStore.delete(req.user.id);
  res.json({ success: true });
}

const panditStore = new Map();

async function panditChat(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    const userId = req.user.id;
    if (!panditStore.has(userId)) panditStore.set(userId, []);
    const history = panditStore.get(userId);

    const kundaliData = kundali ? {
      sun_sign: kundali.sun_sign,
      moon_sign: kundali.moon_sign,
      lagna: kundali.lagna,
      nakshatra: kundali.nakshatra,
      nakshatra_pada: kundali.nakshatra_pada,
      planetary_positions: kundali.planetary_positions,
      dasha_sequence: kundali.dasha_sequence,
      life_purpose: kundali.life_purpose,
      swabhav: kundali.swabhav
    } : null;

    const response = await getPanditJiResponse(message, kundaliData, history);

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response });
    if (history.length > 20) history.splice(0, 2);

    res.json({ response, has_kundali: !!kundali });
  } catch (err) {
    console.error('pandit chat error:', err);
    res.status(500).json({ error: 'Failed to get response: ' + (err.message || 'Unknown error') });
  }
}

async function clearPanditHistory(req, res) {
  panditStore.delete(req.user.id);
  res.json({ success: true });
}

module.exports = { chat, clearHistory, panditChat, clearPanditHistory };
