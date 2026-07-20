const { getAstrologyChatResponse, getPanditJiResponse } = require('../services/chatbotService');
const { Kundali, AiChatMessage } = require('../models');

// History is persisted rather than held in a module-scope Map. The Map was
// wiped by every Railway restart (i.e. every deploy), so the assistant forgot
// the conversation mid-thread, and a second instance would have kept its own
// separate copy.
const HISTORY_TURNS = 20;

async function loadHistory(userId, scope) {
  const rows = await AiChatMessage.findAll({
    where: { user_id: userId, scope },
    order: [['created_at', 'DESC']],
    limit: HISTORY_TURNS,
    attributes: ['role', 'content'],
  });
  return rows.reverse().map(r => ({ role: r.role, content: r.content }));
}

// Best-effort: a storage failure must not cost the user the reply they just got.
async function saveTurn(userId, scope, message, response) {
  try {
    await AiChatMessage.bulkCreate([
      { user_id: userId, scope, role: 'user', content: message },
      { user_id: userId, scope, role: 'assistant', content: response },
    ]);
  } catch (e) {
    console.error(`chat history persist failed (${scope}):`, e.message);
  }
}

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });

    const userId = req.user.id;
    const history = await loadHistory(userId, 'chatbot');

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
    await saveTurn(userId, 'chatbot', message, response);

    res.json({ response, has_kundali: !!kundali });
  } catch (err) {
    console.error('chatbot error:', err);
    res.status(500).json({ error: 'Failed to get response: ' + (err.message || 'Unknown error') });
  }
}

async function clearHistory(req, res) {
  await AiChatMessage.destroy({ where: { user_id: req.user.id, scope: 'chatbot' } });
  res.json({ success: true });
}

async function panditChat(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    const userId = req.user.id;
    const history = await loadHistory(userId, 'pandit');

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
    await saveTurn(userId, 'pandit', message, response);

    res.json({ response, has_kundali: !!kundali });
  } catch (err) {
    console.error('pandit chat error:', err);
    res.status(500).json({ error: 'Failed to get response: ' + (err.message || 'Unknown error') });
  }
}

async function clearPanditHistory(req, res) {
  await AiChatMessage.destroy({ where: { user_id: req.user.id, scope: 'pandit' } });
  res.json({ success: true });
}

module.exports = { chat, clearHistory, panditChat, clearPanditHistory };
