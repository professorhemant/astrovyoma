const { getGroq } = require('../services/groqClient');
const { Kundali } = require('../models');


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

// Fixed classical correspondences. The model is reliable at chart reasoning but
// hallucinates these lookup facts — it has attributed the same 6-Mukhi Rudraksha
// to Venus in one answer and Mercury in the next, and set Venus gemstones in
// yellow gold (they belong in silver/white metal). Pinning the facts here stops
// the invention; the model still does the per-chart analysis and selection.
const VEDIC_REFERENCE = `AUTHORITATIVE VEDIC CORRESPONDENCES — use these EXACTLY. Do NOT invent or alter gemstone metals, fingers, days, or rudraksha rulers.

GEMSTONE per planet (planet → primary stone → affordable substitute → metal → finger → day):
- Sun → Ruby (Manik) → Red Garnet → gold/copper → ring finger → Sunday
- Moon → Pearl (Moti) → Moonstone → silver → little finger → Monday
- Mars → Red Coral (Moonga) → Carnelian → gold/copper → ring finger → Tuesday
- Mercury → Emerald (Panna) → Green Onyx/Peridot → gold → little finger → Wednesday
- Jupiter → Yellow Sapphire (Pukhraj) → Yellow Topaz/Citrine → gold → index finger → Thursday
- Venus → Diamond (Heera) → White Sapphire/Opal → SILVER or PLATINUM/white gold (never yellow gold) → ring finger → Friday
- Saturn → Blue Sapphire (Neelam) → Amethyst → silver/panchdhatu → middle finger → Saturday
- Rahu → Hessonite (Gomed) → Golden Topaz → silver/panchdhatu → middle finger → Saturday
- Ketu → Cat's Eye (Lehsunia) → — → silver/panchdhatu → ring finger → Tuesday
Energise on the planet's day during its hora; minimum weights ~ Ruby/Pukhraj/Neelam 3–5 ct, Diamond 0.5–1 ct.

RUDRAKSHA per planet (mukhi → ruling planet → deity):
- 1 → Sun → Shiva; 2 → Moon → Ardhanareeshwar; 3 → Mars → Agni; 4 → Mercury → Brahma;
- 5 → Jupiter → Kalagni Shiva (general well-being); 6 → Mars (also Venus) → Kartikeya;
- 7 → Saturn → Mahalakshmi; 8 → Rahu → Ganesha; 9 → Ketu → Durga; 12 → Sun → Surya.
- Gauri-Shankar (joined twin bead) → Shiva-Parvati union → the classic bead for MARRIAGE, love and harmony.

SIGNATURE remedies by problem (prefer these established ones over generic filler):
- Delayed/broken marriage: Katyayani Mantra "Om Katyayani Mahamaye Mahayoginyadhishwari Nandagopasutam Devi Patim Me Kuru Te Namah"; worship Shiva-Parvati / Gauri Puja; 16 Somvar (Monday) vrat; Gauri-Shankar Rudraksha. Women strengthen JUPITER (husband karaka → Yellow Sapphire); men strengthen VENUS (wife karaka → Diamond/White Sapphire). Infer the seeker's gender from the description when possible and emphasise accordingly.
- Career/job/finance: strengthen 10th lord, Saturn, Sun; Hanuman Chalisa; "Om Sham Shanaishcharaya Namah" for Saturn; Aditya Hridayam / Surya Namaskar for Sun; serve/feed workers and the poor.
- Debt & losses: Rin-Mukteshwar / Rin Mochan Mangal Stotra; Kanakadhara Stotram; Lakshmi puja on Fridays.
- Enemies/litigation & obstacles: Bagalamukhi or Hanuman worship; "Om Gam Ganapataye Namaha"; Sundarkand path.
- Children/fertility: Santan Gopal Mantra "Om Devakisut Govind Vasudev Jagatpate, Dehi Me Tanayam Krishna Twamaham Sharanam Gatah"; worship Bala Gopala; strengthen Jupiter (5th-house karaka).
- Health/vitality: Mahamrityunjaya Mantra; strengthen the Lagna lord, Sun (vitality) and Moon (mind).
- Mental peace/anxiety: strengthen Moon; Mahamrityunjaya and Chandra mantra "Om Som Somaya Namah"; wear pearl; Monday Shiva worship.`;

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

${VEDIC_REFERENCE}

${kundaliContext}

Problem Category: ${categoryLabel}
Problem Description: ${problem_description}

Based on the birth chart above, analyze which planets and houses are involved in this problem, then prescribe highly personalized Vedic remedies. You may reason freely about which planets are afflicted and why, but for every gemstone (stone, metal, finger, day), rudraksha (mukhi and its ruling planet) and signature mantra/puja you MUST draw from the AUTHORITATIVE VEDIC CORRESPONDENCES above — never assign a gemstone to the wrong metal or finger, never attribute a rudraksha mukhi to the wrong planet, and always prefer the established signature remedy for the problem over a generic one. Recommend the gemstone/rudraksha of the planet you are actually strengthening for this problem.

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

    const result = await getGroq().chat.completions.create({
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
