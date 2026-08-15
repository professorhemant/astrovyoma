const HOROSCOPE_DATA = {
  Aries: [
    { day: 0, text: "Mars energizes your ambitions today, Aries. A bold new opportunity knocks — trust your instincts. Financial matters align favorably, and relationships bloom with honest communication. The Sun in your sector of action brings vitality. Lucky color: Red. Lucky number: 9." },
    { day: 1, text: "Your pioneering spirit finds fertile ground today. Venus graces your relationships, smoothing misunderstandings. A creative project receives unexpected support. Avoid impulsive decisions after 3 PM. Meditate on your goals tonight. Lucky color: Coral. Lucky number: 1." },
    { day: 2, text: "Mercury sharpens your mind and tongue. Contracts signed today carry lasting power. A colleague brings surprising wisdom — listen well. Your health benefits from outdoor activities. An old friendship reignites. Lucky color: Orange. Lucky number: 3." },
    { day: 3, text: "Jupiter expands your horizons, Aries. A long-held dream inches closer to reality. Be patient in financial dealings — the timing isn't quite right yet. Romance sparkles after sunset. Your Lagna lord Mars connects with Saturn for disciplined progress. Lucky color: Gold. Lucky number: 6." },
    { day: 4, text: "The Moon transits your sign, heightening emotions and intuition. Trust gut feelings in business. Family harmony requires your gentle attention. A spiritual insight arrives unexpectedly. Your nakshatra lord sends blessings of clarity. Lucky color: White. Lucky number: 2." },
    { day: 5, text: "Saturn's steady influence rewards your hard work today. Property matters move forward. Health: focus on your spine and head. A mentor figure offers invaluable guidance. Evening brings romantic possibility. Lucky color: Blue. Lucky number: 8." },
    { day: 6, text: "A powerful weekend configuration lifts your energy. Rahu in your chart signals an unconventional path to success. Embrace change rather than resist it. Community activities bring unexpected joy and connection. Lucky color: Purple. Lucky number: 4." }
  ],
  Taurus: [
    { day: 0, text: "Venus, your ruling planet, showers blessings on your creative pursuits. Financial matters improve steadily — patience is rewarded. A romantic gesture speaks louder than words today. Indulge in beauty and comfort thoughtfully. Lucky color: Green. Lucky number: 6." },
    { day: 1, text: "The Moon in your second house highlights family wealth and values. A practical solution to a long-standing problem emerges. Avoid overindulgence in food. Your artistic talents attract positive attention. Lucky color: Pink. Lucky number: 2." },
    { day: 2, text: "Mercury activates your communication sector. Express long-held feelings with confidence. A business negotiation reaches a positive conclusion. Travel brings unexpected inspiration. Your persistence pays off in all areas. Lucky color: Turquoise. Lucky number: 5." },
    { day: 3, text: "Jupiter blesses your financial house, Taurus. Investments made now carry long-term promise. A partnership proves more valuable than initially thought. Take time to appreciate simple pleasures — they nourish your soul. Lucky color: Gold. Lucky number: 3." },
    { day: 4, text: "Mars activates your drive and determination. A physical challenge reveals your inner strength. Career advancement comes through steady effort. Avoid confrontations — diplomacy is your greatest tool today. Lucky color: Brown. Lucky number: 9." },
    { day: 5, text: "The Sun illuminates your path with clarity. Spiritual practices bring unusual peace. A long-awaited resolution arrives in relationships. Your grounded nature is your greatest gift and is recognized by others today. Lucky color: Yellow. Lucky number: 1." },
    { day: 6, text: "Saturn rewards your consistent efforts with material progress. Property and home matters align favorably. A conversation with an elder brings surprising wisdom. Take rest — your body needs it to sustain your ambitions. Lucky color: Black. Lucky number: 8." }
  ],
  Gemini: [
    { day: 0, text: "Mercury, your ruler, brings brilliant ideas and sharp communication. Two exciting opportunities arrive — choose the one aligned with your deeper purpose. Sibling relationships warm. Short travels prove fruitful. Lucky color: Yellow. Lucky number: 5." },
    { day: 1, text: "Your mind races with possibilities today. Channel this energy into one focused project. Venus brings warmth to your social sphere — a new friendship carries long-term meaning. Evening: perfect for writing or creative expression. Lucky color: Light Blue. Lucky number: 7." },
    { day: 2, text: "Jupiter expands your network in unexpected ways. A chance meeting leads to significant opportunity. Financial clarity arrives after a period of confusion. Trust the cosmic timeline — your Dasha supports growth now. Lucky color: Orange. Lucky number: 3." },
    { day: 3, text: "The Moon heightens your already keen intuition. Listen to what isn't being said in relationships. Career: a bold idea impresses those in authority. Evening meditation reveals a key insight about your life path. Lucky color: Silver. Lucky number: 2." },
    { day: 4, text: "Mars energizes your ambitions and brings a competitive edge. Channel it productively rather than into arguments. Health: focus on your lungs and arms. A creative collaboration bears impressive fruit. Lucky color: Red. Lucky number: 9." },
    { day: 5, text: "Venus in your sign creates a magnetic aura. Romantic connections intensify. Financial negotiations favor you. Your ability to see multiple perspectives solves a team conflict beautifully. Lucky color: Green. Lucky number: 6." },
    { day: 6, text: "Saturn brings discipline to your scattered energy. Complete what you've started before beginning anew. A philosophical conversation shifts your perspective profoundly. Your Nakshatra lord blesses consistent effort. Lucky color: Blue. Lucky number: 8." }
  ],
  Cancer: [
    { day: 0, text: "The Moon, your ruler, fills you with emotional depth and psychic sensitivity. Trust your feelings — they are rarely wrong. Home and family matters resolve harmoniously. A creative project reveals your true soul purpose. Lucky color: White. Lucky number: 2." },
    { day: 1, text: "Jupiter in your chart expands domestic happiness. A family member needs your nurturing wisdom. Financial matters require careful attention — review expenses. Your intuition about a business matter proves accurate. Lucky color: Silver. Lucky number: 4." },
    { day: 2, text: "Venus brings beauty and harmony to your day. A romantic gesture creates lasting memory. Career: your emotional intelligence navigates a sensitive situation brilliantly. Honor your need for solitude in the evening. Lucky color: Pearl White. Lucky number: 7." },
    { day: 3, text: "The Sun activates your spiritual sector. A dream carries prophetic significance — journal it. Community service brings unexpected joy. Your natural empathy heals a wounded relationship. Lucky color: Orange. Lucky number: 1." },
    { day: 4, text: "Mercury sharpens your usually intuitive mind with analytical precision. A problem yields to logical examination. Contracts and communications require attention to detail. Old memories surface with healing purpose. Lucky color: Yellow. Lucky number: 5." },
    { day: 5, text: "Mars activates your protective instincts. Stand firm in your values without aggression. Financial opportunity arises through family connection. Evening brings the emotional nourishment your soul craves. Lucky color: Red. Lucky number: 9." },
    { day: 6, text: "Saturn teaches the importance of emotional boundaries. Healthy detachment brings clarity in a complex relationship. Your persistent care for others begins to return as blessings. A long-term goal takes a meaningful step forward. Lucky color: Blue. Lucky number: 8." }
  ],
  Leo: [
    { day: 0, text: "The Sun blazes in your sector of creativity and self-expression. Your natural leadership shines brightly — step forward with confidence. Romance ignites with passionate intensity. Creative projects receive the recognition they deserve. Lucky color: Gold. Lucky number: 1." },
    { day: 1, text: "Jupiter magnifies your generosity and charm. A charitable act returns unexpected blessings. Career advancement comes through authentic self-expression. Your regal presence commands respect in any gathering today. Lucky color: Orange. Lucky number: 3." },
    { day: 2, text: "Venus adds sweetness to your already warm heart. A creative collaboration becomes something truly special. Financial gains through your unique talents. Love relationships deepen with heartfelt communication. Lucky color: Amber. Lucky number: 6." },
    { day: 3, text: "Mercury brings witty brilliance to your communications. A presentation or speech lands powerfully. Business matters benefit from your natural persuasion. Guard against pride obscuring important feedback. Lucky color: Yellow. Lucky number: 5." },
    { day: 4, text: "The Moon illuminates your subconscious desires. A recurring dream holds the key to a waking dilemma. Family harmony requires your generous spirit. Spiritual practice replenishes your considerable energy. Lucky color: White. Lucky number: 2." },
    { day: 5, text: "Mars fires your ambitions to new heights. A competitive situation tests your mettle — you emerge victorious. Health: your heart and spine need gentle care. Evening: celebrate your recent victories with loved ones. Lucky color: Red. Lucky number: 9." },
    { day: 6, text: "Saturn grounds your leonine fire with productive discipline. Long-term projects make steady, satisfying progress. A mentor's words carry unusual weight today. Your legacy is built one courageous, disciplined day at a time. Lucky color: Blue. Lucky number: 8." }
  ],
  Virgo: [
    { day: 0, text: "Mercury, your ruler, brings crystalline clarity of mind. A complex problem yields to your systematic analysis. Health improvements come from small, consistent changes. A colleague recognizes your invaluable contributions. Lucky color: Green. Lucky number: 5." },
    { day: 1, text: "Jupiter blesses your health and service sector. A healing modality you discover today brings lasting benefit. Your practical wisdom helps someone in genuine need. Avoid perfectionism — done is better than perfect. Lucky color: Brown. Lucky number: 3." },
    { day: 2, text: "Venus softens your analytical nature with warmth and grace. A relationship benefits from lowered defenses. Financial planning proves more rewarding than expected. Your attention to detail creates a beautiful outcome. Lucky color: Blue-Green. Lucky number: 6." },
    { day: 3, text: "The Sun illuminates your financial sector. Review your income streams with Virgo precision. A small investment now yields disproportionate returns later. Your ability to see what others miss is your greatest superpower. Lucky color: Yellow. Lucky number: 1." },
    { day: 4, text: "The Moon activates your emotional intelligence. Let your heart guide where your mind has been circling. Family communication benefits from your careful, thoughtful words. A creative project surprises you with its resonance. Lucky color: White. Lucky number: 2." },
    { day: 5, text: "Mars energizes your physical body — channel it into productive exercise or hands-on work. A technical challenge yields to your methodical approach. Avoid micromanaging others. Your health sector is activated positively. Lucky color: Red. Lucky number: 9." },
    { day: 6, text: "Saturn rewards your diligent service with long-deserved recognition. Career: a position of greater responsibility approaches. Relationships: your reliability becomes someone's anchor. Your Nakshatra lord sends blessings of discernment. Lucky color: Indigo. Lucky number: 8." }
  ],
  Libra: [
    { day: 0, text: "Venus, your ruling planet, creates perfect harmony in relationships and aesthetics. A creative project reaches beautiful completion. Legal matters resolve in your favor. Balance in all things is your mantra and your gift today. Lucky color: Pink. Lucky number: 6." },
    { day: 1, text: "Jupiter expands your social world magnificently. A new connection carries significant potential. Financial partnership proves more lucrative than expected. Your natural diplomacy resolves what others considered impossible. Lucky color: Blue. Lucky number: 3." },
    { day: 2, text: "Mercury activates your already excellent communication gifts. An important negotiation concludes favorably. Creative writing or artistic expression brings recognition. Guard against indecision — trust your first instinct. Lucky color: Lavender. Lucky number: 5." },
    { day: 3, text: "The Sun highlights your purpose and reputation. A public moment showcases your natural grace. Career advancement through your unique ability to bridge opposing views. Evening: invest in self-care and beauty. Lucky color: Gold. Lucky number: 1." },
    { day: 4, text: "Mars introduces welcome urgency to your typically deliberate nature. A decision long delayed must now be made. Health: your kidneys and lower back benefit from gentle yoga. Romantic spark ignites unexpectedly. Lucky color: Red. Lucky number: 9." },
    { day: 5, text: "The Moon in your sign amplifies your sensitivity to atmospheric energies. Your intuition about others is unusually accurate. A creative collaboration begins with tremendous promise. Prioritize inner peace over outer approval today. Lucky color: Silver. Lucky number: 2." },
    { day: 6, text: "Saturn strengthens your foundations in relationships and career. A commitment made today carries enduring value. Your fairness in a difficult situation earns lasting respect. The cosmic scales tip in your favor. Lucky color: Dark Blue. Lucky number: 8." }
  ],
  Scorpio: [
    { day: 0, text: "Mars and Ketu intensify your already powerful perception. Hidden truths surface in relationships — handle them with your characteristic depth and grace. A transformation long in process reaches its climactic moment. Your personal power is at its peak. Lucky color: Deep Red. Lucky number: 9." },
    { day: 1, text: "Jupiter illuminates your hidden sector with spiritual insight. A meditation or dream reveals profound guidance. Financial matters involving shared resources align favorably. Your ability to see beneath the surface saves a situation. Lucky color: Maroon. Lucky number: 3." },
    { day: 2, text: "Venus softens your intensity, bringing surprising sweetness to relationships. A past hurt releases its grip — forgiveness liberates you powerfully. Creative and sexual energy flows abundantly. A financial opportunity emerges from unexpected depth. Lucky color: Burgundy. Lucky number: 6." },
    { day: 3, text: "Mercury brings your investigative powers to razor sharpness. Research yields extraordinary results. A mystery that has troubled you reveals its solution. Communication with someone from your past carries healing purpose. Lucky color: Teal. Lucky number: 5." },
    { day: 4, text: "The Sun activates your joint resources and transformation sector. An inheritance or shared financial matter moves forward. Your resilience in the face of challenge inspires those around you. The phoenix energy of your sign rises within you now. Lucky color: Orange. Lucky number: 1." },
    { day: 5, text: "The Moon deepens your emotional landscape to oceanic proportions. Process feelings through creative expression rather than silence. A family member needs your unique healing presence. Psychic sensitivity is exceptionally heightened tonight. Lucky color: Black. Lucky number: 2." },
    { day: 6, text: "Saturn in your chart rewards your extraordinary capacity for discipline and transformation. Career: a position of strategic power approaches. Your patience in mastering what others abandon is your defining strength. Trust the process of metamorphosis. Lucky color: Deep Purple. Lucky number: 8." }
  ],
  Sagittarius: [
    { day: 0, text: "Jupiter, your ruling planet, opens doors to wisdom and abundance. A philosophical insight transforms how you see your life path. Travel — actual or mental — brings breakthrough understanding. Your optimism is not naive; it is prophetic. Lucky color: Purple. Lucky number: 3." },
    { day: 1, text: "The Sun energizes your already abundant fire. Teaching, publishing, or sharing your wisdom creates positive ripple effects. A foreign connection brings important opportunity. Guard against overpromising — your enthusiasm can outpace delivery. Lucky color: Gold. Lucky number: 1." },
    { day: 2, text: "Mercury brings precision to your visionary mind. Document your ideas — they are unusually valuable today. A legal or educational matter resolves in your favor. Your broad perspective solves what narrow thinking cannot. Lucky color: Yellow. Lucky number: 5." },
    { day: 3, text: "Venus brings beauty to your philosophical world. An art form or spiritual practice opens your heart. A romantic connection shares your deeper values. Financial matters benefit from your natural optimism backed by practical planning. Lucky color: Violet. Lucky number: 6." },
    { day: 4, text: "Mars activates your adventure sector. A physical challenge tests and strengthens your remarkable spirit. Career: bold action opens a door that patience alone could not. Your arrow of intention flies true today. Lucky color: Red. Lucky number: 9." },
    { day: 5, text: "The Moon invites you to honor emotional needs alongside intellectual adventures. A family member needs your warmth and wisdom. Spiritual practice deepens your connection to cosmic purpose. Your Nakshatra carries the blessing of the stars tonight. Lucky color: Silver. Lucky number: 2." },
    { day: 6, text: "Saturn grounds your expansion in practical wisdom. A long-term educational or philosophical project reaches a milestone. Your hard-won wisdom becomes someone else's liberation. The teacher in you rises to its highest expression. Lucky color: Blue. Lucky number: 8." }
  ],
  Capricorn: [
    { day: 0, text: "Saturn, your ruler, rewards patient effort with concrete achievement. A career milestone arrives, hard-earned and meaningful. Financial discipline creates lasting wealth. Your steady, mountain-climbing nature reaches a summit worthy of celebration. Lucky color: Black. Lucky number: 8." },
    { day: 1, text: "Jupiter briefly softens Saturn's discipline with unexpected grace. A relationship surprises you with warmth. A professional recognition arrives for work done in quiet dedication. Allow yourself to receive — you have earned this. Lucky color: Navy Blue. Lucky number: 3." },
    { day: 2, text: "Mercury activates your strategic planning mind. A business strategy crystallizes with unusual clarity. Legal documents require careful review — your attention to detail protects your interests. Authority figures respond positively to your measured approach. Lucky color: Dark Green. Lucky number: 5." },
    { day: 3, text: "Venus warms your reserved exterior, allowing authentic connection. A long-guarded feeling finds safe expression. Creative endeavors benefit from your natural discipline and craft. The most beautiful things you build last generations. Lucky color: Brown. Lucky number: 6." },
    { day: 4, text: "The Sun illuminates your public sector. Your competence and integrity earn important recognition. Career advancement is indicated by the current planetary alignment. A leadership role suits you perfectly — step into it with confidence. Lucky color: Yellow. Lucky number: 1." },
    { day: 5, text: "The Moon activates your emotional foundations. Family heritage carries important keys to your present situation. A property or home matter reaches favorable resolution. Your ancestors' strength flows through you in moments of challenge. Lucky color: White. Lucky number: 2." },
    { day: 6, text: "Mars energizes your ambitions with productive fire. A project that seemed stalled breaks through its obstacle. Health: knees and joints benefit from gentle movement. Your persistence in the face of difficulty is legendary and is noticed today. Lucky color: Red. Lucky number: 9." }
  ],
  Aquarius: [
    { day: 0, text: "Saturn and Rahu combine to make you an unstoppable visionary. A humanitarian idea finds powerful support. Technology or innovation opens unexpected doors. Your unique perspective on a social problem creates meaningful change. Lucky color: Electric Blue. Lucky number: 4." },
    { day: 1, text: "Jupiter expands your humanitarian vision magnificently. A community initiative gains the momentum needed for real impact. Friendships deepen through shared ideals. Your ability to see the future is your most valuable gift. Lucky color: Sky Blue. Lucky number: 3." },
    { day: 2, text: "Mercury electrifies your already innovative mind. A technological solution emerges with elegant simplicity. Group communication leads to unexpected harmony. An eccentric idea deserves serious consideration — it is ahead of its time. Lucky color: Turquoise. Lucky number: 5." },
    { day: 3, text: "Venus adds warmth to your sometimes detached manner. A friendship deepens into something more meaningful. Creative work with social purpose receives recognition. Allow yourself to be emotionally present — your heart has wisdom your mind is still discovering. Lucky color: Lavender. Lucky number: 6." },
    { day: 4, text: "The Sun highlights your social network and future vision. An important ally emerges from an unexpected direction. Career: your innovative approach disrupts in the most positive sense. The Age of Aquarius flows through you as an instrument of change. Lucky color: Gold. Lucky number: 1." },
    { day: 5, text: "The Moon connects you to the collective emotional field. Your empathy for humanity expresses through practical service. A solitary practice replenishes your considerable energy. Your dreams tonight carry messages from the collective unconscious. Lucky color: Silver. Lucky number: 2." },
    { day: 6, text: "Saturn grounds your visions in actionable reality. A long-term innovative project reaches a definitive stage. Your disciplined eccentricity is your greatest professional asset. The future you envision is being built, one systematic step at a time. Lucky color: Indigo. Lucky number: 8." }
  ],
  Pisces: [
    { day: 0, text: "Jupiter and Neptune fill your consciousness with spiritual depth and creative vision. A dream carries profound prophetic content — write it down. Creative or spiritual work reaches transcendent expression. Your compassion heals a wounded heart today. Lucky color: Sea Green. Lucky number: 7." },
    { day: 1, text: "The Moon amplifies your already extraordinary intuition. Trust feelings that defy rational explanation — they are your Piscean superpower. A creative project channels higher inspiration. A spiritual practice opens a door long closed. Lucky color: Purple. Lucky number: 2." },
    { day: 2, text: "Mercury grounds your visionary nature in communicable form. Express your spiritual insights in ways others can receive. A creative writing or artistic project reaches important completion. Your compassionate communication heals a misunderstanding. Lucky color: Turquoise. Lucky number: 5." },
    { day: 3, text: "Venus in your sector of creativity creates conditions for inspired artistic expression. A romantic connection has soulmate resonance — pay attention. Financial matters through creative or spiritual work align favorably. Beauty serves as your portal to the divine today. Lucky color: Ocean Blue. Lucky number: 6." },
    { day: 4, text: "Jupiter, your traditional ruler, blesses your spiritual and philosophical pursuits. A teacher or guru figure appears with transformative wisdom. Long-distance connections carry important spiritual messages. Your faith — in life, in yourself, in the cosmos — is fully justified. Lucky color: Violet. Lucky number: 3." },
    { day: 5, text: "The Sun illuminates your hidden sector, bringing subconscious material into conscious awareness. Journaling or dream work yields extraordinary insight. Solitude is not loneliness today — it is sacred communion with your deepest self. Lucky color: Gold. Lucky number: 1." },
    { day: 6, text: "Saturn grounds your oceanic soul in necessary form. A spiritual discipline practiced consistently yields remarkable transformation. Your boundaries, once established with love, become your greatest freedom. The cosmic ocean flows through you with purposeful tides. Lucky color: Deep Blue. Lucky number: 8." }
  ]
};

const { getLuckyForSign } = require('./luckyController');
const { HOROSCOPE_HINDI } = require('../data/horoscopeHindi');
const { langFrom } = require('../services/langOverlay');

// The same day's reading in the language asked for. Hindi falls back to English
// rather than going blank if a sign is ever missing a day.
function textFor(sign, day, lang) {
  if (lang === 'hi') {
    const hi = HOROSCOPE_HINDI[sign]?.[day];
    if (hi) return hi;
  }
  return HOROSCOPE_DATA[sign][day].text;
}

function getDailyHoroscope(req, res) {
  const { sign } = req.params;
  if (!HOROSCOPE_DATA[sign]) {
    return res.status(400).json({ error: 'Invalid zodiac sign', validSigns: Object.keys(HOROSCOPE_DATA) });
  }
  const dayOfWeek = new Date().getDay();
  const text = textFor(sign, dayOfWeek, langFrom(req));
  // The page shows the lucky colour and number from luckyController in their own
  // panel, so the trailing line is trimmed off the prose in both languages.
  const overview = text
    .replace(/\s*Lucky color: [^.]+\.\s*Lucky number: \d+\.?\s*$/i, '')
    .replace(/\s*शुभ रंग: [^।]+।\s*शुभ अंक: [^।]+।\s*$/, '')
    .trim();
  const { luckyColor, luckyColorHex, luckyNumber } = getLuckyForSign(sign);
  res.json({
    sign,
    date: new Date().toISOString().split('T')[0],
    horoscope: text,
    overview,
    luckyColor,
    luckyColorHex,
    luckyNumber,
  });
}

function getAllDailyHoroscopes(req, res) {
  const dayOfWeek = new Date().getDay();
  const lang = langFrom(req);
  const result = {};
  for (const sign of Object.keys(HOROSCOPE_DATA)) {
    result[sign] = textFor(sign, dayOfWeek, lang);
  }
  res.json({ date: new Date().toISOString().split('T')[0], horoscopes: result });
}

module.exports = { getDailyHoroscope, getAllDailyHoroscopes };
