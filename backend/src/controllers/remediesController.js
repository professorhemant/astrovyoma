const Groq = require('groq-sdk');
const { Kundali } = require('../models');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CATEGORIES = {
  career: 'Career & Finance',
  love: 'Love & Marriage',
  health: 'Health & Vitality',
  education: 'Education & Learning',
  legal: 'Legal Disputes & Justice',
  family: 'Family Harmony & Peace',
  mental: 'Mental Peace & Anxiety',
  debt: 'Debt Relief & Losses',
  enemies: 'Enemies & Obstacles',
  children: 'Children & Fertility'
};

async function getRemedies(req, res) {
  try {
    const { problem_category, problem_description } = req.body;
    if (!problem_category || !problem_description) {
      return res.status(400).json({ error: 'problem_category and problem_description are required' });
    }

    let kundaliContext = 'No birth chart available — provide general Vedic remedies.';
    let hasKundali = false;

    try {
      const kundali = req.user ? await Kundali.findOne({ where: { user_id: req.user.id } }) : null;
      if (kundali) {
        hasKundali = true;
        const p = kundali.planetary_positions || {};
        const dashas = kundali.dasha_sequence || [];
        const now = new Date();
        const currentDasha = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
        const currentAntar = currentDasha?.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);

        kundaliContext = `
Seeker's Birth Chart (Vedic/Sidereal):
- Lagna (Ascendant): ${kundali.lagna}
- Moon Sign (Rashi): ${kundali.moon_sign}
- Sun Sign: ${kundali.sun_sign}
- Birth Nakshatra: ${kundali.nakshatra} Pada ${kundali.nakshatra_pada} (Lord: ${kundali.nakshatra_lord})
- Sun: ${p.Sun?.sign || '?'} (House ${p.Sun?.house || '?'})
- Moon: ${p.Moon?.sign || '?'} (House ${p.Moon?.house || '?'})
- Mars: ${p.Mars?.sign || '?'} (House ${p.Mars?.house || '?'})
- Mercury: ${p.Mercury?.sign || '?'} (House ${p.Mercury?.house || '?'})
- Jupiter: ${p.Jupiter?.sign || '?'} (House ${p.Jupiter?.house || '?'})
- Venus: ${p.Venus?.sign || '?'} (House ${p.Venus?.house || '?'})
- Saturn: ${p.Saturn?.sign || '?'} (House ${p.Saturn?.house || '?'})
- Rahu: ${p.Rahu?.sign || '?'} (House ${p.Rahu?.house || '?'})
- Ketu: ${p.Ketu?.sign || '?'} (House ${p.Ketu?.house || '?'})
- Current Mahadasha: ${currentDasha?.planet || 'Unknown'} (ends ${currentDasha?.end?.substring(0, 10) || '?'})
- Current Antardasha: ${currentAntar?.planet || 'Unknown'}
- Life Purpose: ${kundali.life_purpose || 'Not determined'}`;
      }
    } catch {}

    const categoryLabel = CATEGORIES[problem_category] || problem_category;

    const prompt = `You are an expert Vedic astrologer and Jyotishi analyzing a seeker's birth chart to prescribe personalized remedies.

${kundaliContext}

Problem Category: ${categoryLabel}
Problem Description: ${problem_description}

Based on the birth chart above, analyze which planets and houses are involved in this problem and provide highly personalized Vedic remedies.

Respond ONLY with valid JSON in this exact structure (no extra text before or after):
{
  "root_cause": "2-3 sentences explaining the astrological root cause — which planets, houses, and dashas are involved",
  "afflicted_planets": ["Planet1", "Planet2"],
  "mantras": [
    { "mantra": "Sanskrit mantra text", "deity": "Deity name", "count": "108 times daily / every Tuesday / etc", "benefit": "one line benefit" },
    { "mantra": "second mantra", "deity": "Deity", "count": "chanting frequency", "benefit": "benefit" }
  ],
  "gemstone": {
    "primary": "Gemstone name",
    "substitute": "Affordable substitute",
    "metal": "Gold / Silver / Panchdhatu",
    "finger": "Which finger to wear",
    "day_time": "Day and time to wear",
    "weight": "Minimum carat weight"
  },
  "fasting": "Which day to fast and what to observe",
  "charity": "What to donate, to whom, and on which day",
  "puja": "Specific puja/ritual to perform with details",
  "rudraksha": "Which Mukhi Rudraksha and why",
  "dos": ["Do this 1", "Do this 2", "Do this 3"],
  "donts": ["Avoid this 1", "Avoid this 2"],
  "yantra": "Which yantra to install and where",
  "color_therapy": "Lucky colors to wear and colors to avoid",
  "affirmation": "A short powerful Vedic affirmation or Sanskrit shloka with meaning"
}`;

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7
    });
    const rawText = result.choices[0].message.content.trim();
    let remedies;
    try {
      // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
      const stripped = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
      const jsonMatch = stripped.match(/\{[\s\S]*\}/);
      remedies = JSON.parse(jsonMatch ? jsonMatch[0] : stripped);
    } catch (parseErr) {
      console.error('Remedy parse error. Raw response:\n', rawText);
      return res.status(500).json({ error: 'Failed to parse remedy response' });
    }

    res.json({ remedies, hasKundali, category: categoryLabel });
  } catch (err) {
    console.error('getRemedies error:', err);
    res.status(500).json({ error: 'Failed to generate remedies' });
  }
}

module.exports = { getRemedies };
