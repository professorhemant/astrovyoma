const { chatCompletion } = require('../services/groqClient');

const CARD_INFO = {
  0:  { name: 'The Fool',           nameHi: 'मूर्ख',            ruler: 'Uranus',              meaning: 'new beginnings, freedom, innocence' },
  1:  { name: 'The Magician',       nameHi: 'जादूगर',            ruler: 'Mercury',             meaning: 'willpower, skill, manifestation' },
  2:  { name: 'The High Priestess', nameHi: 'प्रधान पुजारिन',   ruler: 'Moon',                meaning: 'intuition, mystery, inner wisdom' },
  3:  { name: 'The Empress',        nameHi: 'महारानी',           ruler: 'Venus',               meaning: 'abundance, fertility, nurturing' },
  4:  { name: 'The Emperor',        nameHi: 'सम्राट',            ruler: 'Aries/Mars',          meaning: 'authority, structure, leadership' },
  5:  { name: 'The Hierophant',     nameHi: 'धर्मगुरु',          ruler: 'Taurus/Venus',        meaning: 'tradition, spiritual guidance, conformity' },
  6:  { name: 'The Lovers',         nameHi: 'प्रेमी',            ruler: 'Gemini/Mercury',      meaning: 'love, harmony, choices, union' },
  7:  { name: 'The Chariot',        nameHi: 'रथ',                ruler: 'Cancer/Moon',         meaning: 'victory, willpower, control, triumph' },
  8:  { name: 'Strength',           nameHi: 'शक्ति',             ruler: 'Leo/Sun',             meaning: 'inner strength, courage, compassion' },
  9:  { name: 'The Hermit',         nameHi: 'साधु',              ruler: 'Virgo/Mercury',       meaning: 'introspection, solitude, guidance' },
  10: { name: 'Wheel of Fortune',   nameHi: 'भाग्यचक्र',         ruler: 'Jupiter',             meaning: 'destiny, cycles, turning point' },
  11: { name: 'Justice',            nameHi: 'न्याय',             ruler: 'Libra/Venus',         meaning: 'fairness, truth, cause and effect' },
  12: { name: 'The Hanged Man',     nameHi: 'उल्टा लटका',        ruler: 'Neptune',             meaning: 'surrender, new perspective, waiting' },
  13: { name: 'Death',              nameHi: 'मृत्यु',            ruler: 'Scorpio/Pluto',       meaning: 'transformation, ending, transition' },
  14: { name: 'Temperance',         nameHi: 'संतुलन',            ruler: 'Sagittarius/Jupiter', meaning: 'balance, patience, moderation' },
  15: { name: 'The Devil',          nameHi: 'शैतान',             ruler: 'Capricorn/Saturn',    meaning: 'bondage, materialism, shadow self' },
  16: { name: 'The Tower',          nameHi: 'मीनार',             ruler: 'Mars',                meaning: 'sudden change, upheaval, revelation' },
  17: { name: 'The Star',           nameHi: 'तारा',              ruler: 'Aquarius/Uranus',     meaning: 'hope, renewal, inspiration, serenity' },
  18: { name: 'The Moon',           nameHi: 'चंद्रमा',           ruler: 'Pisces/Neptune',      meaning: 'illusion, fear, subconscious, dreams' },
  19: { name: 'The Sun',            nameHi: 'सूर्य',             ruler: 'Sun',                 meaning: 'joy, success, vitality, positivity' },
  20: { name: 'Judgement',          nameHi: 'निर्णय',            ruler: 'Pluto',               meaning: 'rebirth, awakening, absolution, calling' },
  21: { name: 'The World',          nameHi: 'संसार',             ruler: 'Saturn',              meaning: 'completion, integration, accomplishment' },
};

const SPREAD_LABELS = {
  hi: {
    single: ['आज का संदेश'],
    three:  ['भूतकाल', 'वर्तमान', 'भविष्य'],
    five:   ['स्थिति', 'चुनौती', 'अवचेतन', 'सलाह', 'परिणाम'],
  },
  en: {
    single: ['Today\'s Message'],
    three:  ['Past', 'Present', 'Future'],
    five:   ['Situation', 'Challenge', 'Subconscious', 'Advice', 'Outcome'],
  },
};

async function getTarotReading(req, res) {
  try {
    const { cards, spreadType = 'single', question, kundaliContext, lang = 'hi' } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'cards array is required' });
    }

    const isEnglish = lang === 'en';
    const labels = (SPREAD_LABELS[lang] || SPREAD_LABELS.hi)[spreadType] || SPREAD_LABELS[lang].single;

    const cardLines = cards.map((c, i) => {
      const info = CARD_INFO[c.id] || { name: 'Unknown', nameHi: '', ruler: '', meaning: '' };
      const pos = labels[i] || `Card ${i + 1}`;
      const orientation = c.reversed ? 'REVERSED' : 'UPRIGHT';
      const cardName = isEnglish ? info.name : `${info.nameHi} (${info.name})`;
      return `• ${pos}: ${cardName} — ${orientation}\n  Ruler: ${info.ruler}, Core meaning: ${info.meaning}`;
    }).join('\n\n');

    let kundaliLine = '';
    if (kundaliContext) {
      const { lagna, moonSign, sunSign, currentDasha } = kundaliContext;
      kundaliLine = `\nSeeker's Vedic chart: Lagna=${lagna || 'unknown'}, Moon=${moonSign || 'unknown'}, Sun=${sunSign || 'unknown'}, Dasha=${currentDasha || 'unknown'}`;
    }

    const questionLine = question ? `\nSeeker's Question: "${question}"` : '';

    let systemPrompt, userPrompt;

    if (isEnglish) {
      systemPrompt = 'You are a master Vedic tarot reader blending Golden Dawn Tarot wisdom with Jyotish (Vedic astrology). Respond in clear, poetic English. Be warm, mystical, and insightful. Include astrological depth.';
      userPrompt = `Spread: ${spreadType.toUpperCase()} (${labels.join(' → ')})${questionLine}${kundaliLine}

Cards drawn:
${cardLines}

Provide a flowing tarot reading in English (3-5 paragraphs, 200-300 words):
- Interpret each card in its position and their relationship
- Include the ruling planet's Vedic significance
- Give practical, empowering guidance
- End with an inspiring cosmic message`;
    } else {
      systemPrompt = 'आप एक महान Vedic तारो गुरु हैं जो Golden Dawn परंपरा और Jyotish को मिलाते हैं। हिंदी में उत्तर दें। रहस्यमय, गर्मजोशी से भरे और गहन अंतर्दृष्टि के साथ।';
      userPrompt = `स्प्रेड: ${spreadType.toUpperCase()} (${labels.join(' → ')})${questionLine}${kundaliLine}

खींचे गए कार्ड:
${cardLines}

हिंदी में एक प्रवाहमय तारो पठन दें (3-5 अनुच्छेद, 200-300 शब्द):
- प्रत्येक कार्ड की उसकी स्थिति में व्याख्या करें और उनका परस्पर संबंध बताएं
- शासक ग्रह का Vedic महत्व शामिल करें
- एक छोटा Sanskrit श्लोक जोड़ें
- व्यावहारिक और शक्तिशाली मार्गदर्शन दें
- एक प्रेरणादायक आशीर्वाद के साथ समाप्त करें`;
    }

    const completion = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 900,
      temperature: 0.85,
    });

    const reading = completion.choices[0]?.message?.content
      || (isEnglish ? 'Reading unavailable. Please try again.' : 'तारो पठन में त्रुटि आई। कृपया पुनः प्रयास करें।');

    res.json({ reading, cardsUsed: cards.length, spreadType, lang });
  } catch (err) {
    console.error('Tarot reading error:', err);
    res.status(500).json({ error: 'Reading failed. Please try again.' });
  }
}

module.exports = { getTarotReading };
