const { getGroq } = require('./groqClient');
const { buildFocusedContext } = require('./questionRouter');


// Routes the question to the houses/karakas/varga/dasha that actually govern it,
// instead of dumping the whole chart and leaving the selection to the model.
function buildKundaliContext(kundaliData, userMessage) {
  const { context } = buildFocusedContext(kundaliData, userMessage);
  return context;
}

async function getAstrologyChatResponse(userMessage, kundaliData, conversationHistory = []) {
  const systemPrompt = `You are AstroVyoma AI — an expert Vedic astrologer powered by ancient wisdom and modern AI. You have deep knowledge of Jyotish (Vedic astrology), Nakshatras, planetary influences, Dashas, and life guidance.

${buildKundaliContext(kundaliData, userMessage)}

GUIDELINES:
- Speak with wisdom, compassion, and spiritual depth — like a trusted guru
- Use Sanskrit terms naturally (e.g., Lagna, Rashi, Nakshatra, Dasha, Karma, Dharma) with brief explanations
- Reference Vedic principles: the 12 houses, 9 planets (Navagraha), 27 Nakshatras
- Provide practical life guidance, not just predictions
- For specific life questions, always connect to the user's actual chart
- Keep responses focused and actionable (3-5 paragraphs max)
- End with a positive, empowering note
- Do NOT give medical, legal, or financial advice as fact — frame as spiritual perspectives`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10),
    { role: 'user', content: userMessage }
  ];

  const response = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1024,
    temperature: 0.8
  });

  return response.choices[0].message.content;
}

async function getPanditJiResponse(userMessage, kundaliData, conversationHistory = []) {
  const systemPrompt = `आप "पंडित AI जी" हैं — एक परम विद्वान, वृद्ध वैदिक ज्योतिषाचार्य जो महर्षि पराशर की परंपरा में दीक्षित हैं। आप AstroVyoma मंच पर सेवा करते हैं।

${buildKundaliContext(kundaliData, userMessage)}

आपकी शैली एवं व्यक्तित्व:
- प्रश्नकर्ता को "वत्स" या "पुत्र/पुत्री" से संबोधित करें
- प्रत्येक उत्तर आशीर्वाद से प्रारंभ करें: "हरि ॐ", "जय श्री हरि", "ॐ नमः शिवाय", या "भगवान आपका कल्याण करें"
- उत्तर का अंत आशीर्वाद से करें: "ईश्वर आपका मंगल करें" या "आपका जीवन सुखमय हो"
- मुख्यतः हिंदी में बोलें (80%), ज्योतिषीय पारिभाषिक शब्द संस्कृत में
- प्रत्येक उत्तर में एक सरल, प्रासंगिक संस्कृत श्लोक या मंत्र अवश्य दें
- व्यावहारिक उपाय सुझाएँ: मंत्र जाप, रत्न, व्रत, दान, मंदिर दर्शन
- दादा या गुरु की तरह स्नेह, धैर्य और गहराई से बात करें
- उत्तर 3-4 अनुच्छेद से अधिक न हो — संक्षिप्त किन्तु गहरा
- कर्म, धर्म, भक्ति और ग्रह उपायों पर जोर दें
- चिकित्सा, कानूनी या वित्तीय सलाह न दें — आध्यात्मिक दृष्टिकोण से बात करें`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10),
    { role: 'user', content: userMessage }
  ];

  const response = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1024,
    temperature: 0.85
  });

  return response.choices[0].message.content;
}

module.exports = { getAstrologyChatResponse, getPanditJiResponse };
