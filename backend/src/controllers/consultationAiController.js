const Groq = require('groq-sdk');
const { Consultation, Astrologer, Kundali } = require('../models');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const histories = new Map(); // consultationId -> messages[]

async function aiReply(req, res) {
  try {
    const { id } = req.params;
    const { message, astrologer_name, astrologer_specialties } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const consultation = await Consultation.findOne({ where: { id, user_id: req.user.id } });
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

    // Load user kundali for context
    let kundaliContext = '';
    try {
      const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
      if (kundali) {
        const p = kundali.planetary_positions || {};
        const dashas = (kundali.dasha_sequence || []);
        const now = new Date();
        const currentDasha = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
        const currentAntar = currentDasha?.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);
        kundaliContext = `
Seeker's Birth Chart:
- Lagna (Ascendant): ${kundali.lagna}
- Moon Sign (Rashi): ${kundali.moon_sign}
- Sun Sign: ${kundali.sun_sign}
- Nakshatra: ${kundali.nakshatra} Pada ${kundali.nakshatra_pada} (Lord: ${kundali.nakshatra_lord})
- Key Planets: Sun in ${p.Sun?.sign}, Moon in ${p.Moon?.sign}, Mars in ${p.Mars?.sign}, Jupiter in ${p.Jupiter?.sign}, Saturn in ${p.Saturn?.sign}
- Current Mahadasha: ${currentDasha?.planet || 'Unknown'} (${currentDasha?.start?.substring(0,4)} - ${currentDasha?.end?.substring(0,4)})
- Current Antardasha: ${currentDasha?.planet}/${currentAntar?.planet || ''}
- Life Purpose: ${kundali.life_purpose || ''}`;
      }
    } catch {}

    const systemPrompt = `You are ${astrologer_name || 'a wise Vedic astrologer'}, a deeply experienced Jyotishi with mastery in ${(astrologer_specialties || []).join(', ') || 'Vedic astrology'}.

You speak with warmth, wisdom, and spiritual depth — like a trusted guide. Your responses:
- Are 2-4 sentences, conversational and personal
- Reference specific planets, dashas, or nakshatras from the seeker's chart when relevant
- Offer genuine insight, not vague generalities
- Occasionally use Sanskrit terms with brief explanations
- End with a practical suggestion or empowering thought
- Never claim to predict exact future events with certainty — guide probabilities and cosmic influences
${kundaliContext ? '\n' + kundaliContext : ''}`;

    const historyKey = `${id}_${req.user.id}`;
    if (!histories.has(historyKey)) histories.set(historyKey, []);
    const history = histories.get(historyKey);

    if (history.length > 20) history.splice(0, 2);

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.8
    });
    const reply = result.choices[0].message.content;

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (err) {
    console.error('aiReply error:', err);
    res.status(500).json({ error: 'AI reply failed', reply: 'The cosmic energies are intense right now. Please share your question again and I will guide you.' });
  }
}

async function getMyConsultations(req, res) {
  try {
    const { Consultation, Astrologer, Review } = require('../models');
    const consultations = await Consultation.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Astrologer, as: 'astrologer', attributes: ['display_name', 'photo_url', 'specialties'] },
        { model: Review, as: 'review', attributes: ['rating', 'comment'], required: false }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });
    res.json(consultations);
  } catch (err) {
    console.error('getMyConsultations error:', err);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
}

module.exports = { aiReply, getMyConsultations };
