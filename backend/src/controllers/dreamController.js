'use strict';
const { chatCompletion } = require('../services/groqClient');


const ZODIAC_DASHA = {
  Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon',
  Leo:'Sun', Virgo:'Mercury', Libra:'Venus', Scorpio:'Mars',
  Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter'
};

const SYSTEM_PROMPT = `You are AstroVyoma's Dream Interpreter — a scholar of Vedic Svapna Shastra (the ancient science of dream interpretation). You blend classical Svapna Shastra texts (like Brihat Samhita and Atharva Veda references), Jungian archetypes, and spiritual psychology.

When given a dream description, respond ONLY with valid JSON in this exact structure:
{
  "summary": "1-2 sentence poetic summary of the dream's essence",
  "symbols": [
    { "symbol": "symbol name", "vedic_meaning": "Vedic/spiritual significance", "psychological": "psychological archetype" }
  ],
  "overall_theme": "The core theme/archetype at play",
  "spiritual_message": "2-3 sentences on the deeper spiritual or karmic message",
  "emotional_tone": "The emotional quality of the dream (e.g., anxious, prophetic, healing, warning, auspicious)",
  "auspiciousness": "Auspicious / Neutral / Inauspicious — with brief reason",
  "planetary_influence": "Which planet's energy dominates this dream and why",
  "practical_guidance": "2-3 concrete steps the dreamer can take based on this dream",
  "remedies": ["remedy 1", "remedy 2", "remedy 3"],
  "affirmation": "A short Sanskrit-inspired affirmation for the dreamer"
}

Identify 3-6 symbols. Keep each field concise. Respond with ONLY the JSON, no markdown fences.`;

exports.interpret = async (req, res) => {
  try {
    const { dream_text, name, zodiac_sign, mood } = req.body;
    if (!dream_text || dream_text.trim().length < 10) {
      return res.status(400).json({ error: 'Please describe your dream in at least a few words.' });
    }

    const context = [
      name ? `Dreamer's name: ${name}` : null,
      zodiac_sign ? `Zodiac sign: ${zodiac_sign} (ruling planet: ${ZODIAC_DASHA[zodiac_sign] || 'unknown'})` : null,
      mood ? `Mood upon waking: ${mood}` : null,
    ].filter(Boolean).join('\n');

    const userMessage = `${context ? context + '\n\n' : ''}Dream description:\n${dream_text.trim()}`;

    const response = await chatCompletion({
      json: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      // The reply is ten fields deep and the model's reasoning shares this
      // budget, so it is set well clear of what the answer alone needs. A
      // truncated reply here is unparseable JSON, not a short reading.
      max_tokens: 2000,
      temperature: 0.75
    });

    let raw = response.choices[0].message.content.trim();
    // Strip markdown fences if present
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

    let interpretation;
    try {
      interpretation = JSON.parse(raw);
    } catch {
      // Return as free-text fallback
      return res.json({ raw_response: raw, parse_error: true });
    }

    res.json({ name: name || 'Seeker', zodiac_sign: zodiac_sign || null, interpretation });
  } catch (err) {
    console.error('[dreamController.interpret]', err);
    res.status(500).json({ error: 'Dream interpretation failed. Please try again.' });
  }
};
