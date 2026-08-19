'use strict';

const { chatCompletion } = require('../services/groqClient');
const { readDreamTiming } = require('../services/swapnaShastra');
const { matchSymbols, SOURCE_LABEL, VERDICT_LABEL } = require('../data/swapnaSymbols');
const { hasActiveSubscription } = require('../middleware/requireSubscription');
const { remedyReference } = require('../data/vedicRemedies');
const { Kundali } = require('../models');

// Reading a dream, in three layers that fail independently.
//
//   1. The watch of the night and the date its result is due. Arithmetic
//      against real sunrise and sunset. Cannot be wrong in an interesting way,
//      cannot cost anything, and works signed out.
//   2. The symbols, their verdict and the text each verdict comes from. Looked
//      up, not generated — see data/swapnaSymbols.js for why that matters.
//   3. The reading itself, written by the model against layers 1 and 2, plus
//      the dreamer's own chart where there is one.
//
// The first two are what a visitor gets for nothing, and they are deliberately
// the parts that are checkable. The third is the subscription. Somebody who
// arrives from a search for what a snake means gets a real answer with a real
// citation and a real date, and can see exactly what they are not being shown.

const DEFAULT_PLACE = { lat: 23.1765, lon: 75.7885, tzMin: 330, label: 'Ujjain, Madhya Pradesh, India' };

const MOODS = ['peaceful', 'anxious', 'confused', 'excited', 'scared', 'melancholic', 'joyful', 'strange'];

function placeFrom(body) {
  const lat = parseFloat(body.lat);
  const lon = parseFloat(body.lon);
  const tzMin = parseInt(body.tz_min, 10);
  if (Number.isNaN(lat) || Number.isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return DEFAULT_PLACE;
  return { lat, lon, tzMin: Number.isNaN(tzMin) ? 330 : tzMin, label: body.place || 'your location' };
}

function langFrom(req) {
  const raw = String(req.body?.lang || req.query?.lang || req.headers['x-lang'] || 'en').toLowerCase();
  return raw === 'hi' ? 'hi' : 'en';
}

// The chart context, and the reason this feature is worth paying for.
//
// Every other dream tool reads the dream alone. This one can say which
// mahadasha the dreamer is running while they dream it — VedAstro's
// interpreter, the closest thing on the market, does not even ask for a birth
// chart. Absent or unparseable chart data is not an error; the reading simply
// loses this paragraph.
async function chartContextFor(userId) {
  if (!userId) return null;
  try {
    const k = await Kundali.findOne({ where: { user_id: userId } });
    if (!k) return null;
    const now = new Date();
    const dashas = k.dasha_sequence || [];
    const maha = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
    const antar = maha?.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);
    return {
      moon_sign: k.moon_sign,
      lagna: k.lagna,
      nakshatra: k.nakshatra,
      nakshatra_lord: k.nakshatra_lord,
      mahadasha: maha?.planet || null,
      antardasha: antar?.planet || null,
      mahadasha_ends: maha?.end ? String(maha.end).slice(0, 10) : null,
    };
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = {
  en: `You are AstroVyoma's dream interpreter, trained in Vedic Svapna Shastra and familiar with Jungian symbolism.

You will be given: the dream, the watch of the night it fell in, and — where they were recognised — symbols already looked up in the classical texts with their verdicts and sources.

Rules you must not break:
- The verdicts you are given are settled. Never overturn one, never soften an "Inauspicious" into a "Neutral", and never invent a verdict for a symbol you were not given.
- Never predict death, serious illness, or a date of misfortune. If the dream is frightening, say what it reflects and what would help, and stop there.
- Never diagnose. If the dreamer describes repeated distressing dreams, add one warm sentence suggesting they talk to somebody they trust or a professional — never clinical, never alarming.
- Where a classical reading contradicts the popular one, say so plainly. That contradiction is interesting and the reader deserves it.
- Every remedy must come from the reference block below. Do not invent a day, a donation item, or a mantra, and never pair an offering with a planet's day other than its own — that is the one detail a reader will actually go and act on.

Reply with ONLY valid JSON:
{
  "summary": "2 sentences on what this dream is doing",
  "reading": "3-4 sentences of the actual interpretation, weaving the symbols together",
  "chart_note": "If chart details were supplied, 2 sentences tying the dream to their running dasha or Moon. Otherwise an empty string.",
  "life_area": "career | relationships | health | wealth | family | spiritual",
  "guidance": "2 concrete things the dreamer can do",
  "remedies": ["remedy 1", "remedy 2", "remedy 3"],
  "affirmation": "one short line the dreamer can hold on to"
}

${remedyReference('en')}`,

  hi: `आप AstroVyoma के स्वप्न-विश्लेषक हैं, वैदिक स्वप्न शास्त्र में प्रशिक्षित और युंग के प्रतीक-शास्त्र से परिचित।

आपको मिलेगा: सपना, वह किस पहर में आया, और जहाँ पहचाने गए वहाँ शास्त्रों में देखे गए प्रतीक, उनका फल और स्रोत।

जो नियम आप नहीं तोड़ेंगे:
- दिए गए फल (शुभ/अशुभ) अंतिम हैं। उन्हें कभी न बदलें, "अशुभ" को नरम करके "सामान्य" न बनाएँ, और जो प्रतीक नहीं दिया गया उसका फल स्वयं न गढ़ें।
- मृत्यु, गंभीर बीमारी, या किसी अनिष्ट की तारीख़ की भविष्यवाणी कभी न करें। सपना डरावना हो तो बताएँ कि वह क्या दर्शाता है और क्या करने से राहत मिलेगी — उससे आगे नहीं।
- रोग-निदान न करें। यदि बार-बार डरावने सपनों की बात हो, तो एक आत्मीय वाक्य जोड़ें कि किसी अपने से या किसी जानकार से बात कर लें — डराए बिना, चिकित्सकीय भाषा के बिना।
- जहाँ शास्त्र का अर्थ लोक-मान्यता से उलट हो, वहाँ साफ़-साफ़ कहें। यही बात सबसे दिलचस्प है।
- हर उपाय नीचे दिए संदर्भ से ही लें। दिन, दान की वस्तु या मंत्र स्वयं न गढ़ें, और किसी वस्तु को उसके ग्रह के दिन के अलावा किसी और दिन से न जोड़ें — पाठक असल में यही करने जाता है।

भाषा सरल, बोलचाल की हिंदी हो — भारी संस्कृतनिष्ठ शब्दावली बिल्कुल नहीं।

केवल वैध JSON में उत्तर दें:
{
  "summary": "यह सपना क्या कर रहा है — 2 वाक्य",
  "reading": "असली व्याख्या, प्रतीकों को जोड़ते हुए — 3-4 वाक्य",
  "chart_note": "यदि कुंडली की जानकारी दी गई है तो सपने को उनकी चल रही दशा या चंद्रमा से जोड़ते 2 वाक्य। वरना खाली string।",
  "life_area": "career | relationships | health | wealth | family | spiritual",
  "guidance": "2 ठोस बातें जो स्वप्नदर्शी कर सकता है",
  "remedies": ["उपाय 1", "उपाय 2", "उपाय 3"],
  "affirmation": "एक छोटी पंक्ति जिसे स्वप्नदर्शी थामे रख सके"
}

${remedyReference('hi')}`,
};

exports.interpret = async (req, res) => {
  try {
    const lang = langFrom(req);
    const {
      dream_text, dream_date, dream_time, mood,
      fell_asleep_again, later_dream_same_night, is_recurring,
    } = req.body || {};

    if (!dream_text || String(dream_text).trim().length < 10) {
      return res.status(400).json({
        error: lang === 'hi'
          ? 'अपना सपना थोड़ा विस्तार से लिखें।'
          : 'Please describe your dream in at least a few words.',
      });
    }

    const text = String(dream_text).trim().slice(0, 4000);
    const place = placeFrom(req.body || {});

    // ── Layer 1: the watch of the night ───────────────────────────────────
    const today = new Date();
    const fallbackDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const timing = readDreamTiming(
      dream_date || fallbackDate,
      dream_time || '04:00',
      place,
      { fellAsleepAgain: !!fell_asleep_again, laterDreamSameNight: !!later_dream_same_night },
    );

    // ── Layer 2: the symbols, looked up ───────────────────────────────────
    const matched = matchSymbols(text);
    const symbols = matched.map(s => ({
      key: s.key,
      name: s[lang],
      verdict: s.verdict,
      verdict_label: VERDICT_LABEL[s.verdict][lang],
      source: s.source,
      source_label: SOURCE_LABEL[s.source][lang],
      vedic: s.vedic[lang],
      jungian: s.jungian[lang],
      planet: s.planet,
      theme: s.theme,
    }));

    const subscribed = hasActiveSubscription(req.user);

    // Signed out, or signed in without a plan: the checkable half, and an
    // honest statement of what is behind the plan. No model call is made at
    // all, which is also what keeps this endpoint cheap under search traffic.
    if (!subscribed) {
      return res.json({
        lang,
        timing,
        symbols,
        interpretation: null,
        chart: null,
        locked: true,
        locked_reason: req.user ? 'subscription_required' : 'auth_required',
      });
    }

    // ── Layer 3: the reading ──────────────────────────────────────────────
    const chart = await chartContextFor(req.user.id);

    const groundTruth = symbols.length
      ? symbols.map(s =>
          `- ${s.name} — ${s.verdict_label} (${s.source_label}). ${lang === 'hi' ? 'शास्त्र' : 'Classical'}: ${s.vedic} | ${lang === 'hi' ? 'मनोविज्ञान' : 'Psychological'}: ${s.jungian}`
        ).join('\n')
      : (lang === 'hi' ? '(कोई ज्ञात प्रतीक नहीं मिला — सामान्य समझ से पढ़ें, कोई फल न गढ़ें।)'
                       : '(No known symbol matched — read it generally, and do not invent a verdict.)');

    const timingLine = timing.isDaytime
      ? (lang === 'hi' ? 'यह दिन का सपना है; शास्त्र इसे फलदायी नहीं मानते।' : 'A daytime dream; the texts do not hold these as fruitful.')
      : `${timing.label[lang]} — ${timing.fruition[lang]}${timing.nullified ? (lang === 'hi' ? ' (किन्तु यह निष्फल हो गया)' : ' (but this one is nullified)') : ''}`;

    const chartLine = chart
      ? `${lang === 'hi' ? 'कुंडली' : 'Chart'}: ${lang === 'hi' ? 'चंद्र राशि' : 'Moon sign'} ${chart.moon_sign || '—'}, ${lang === 'hi' ? 'लग्न' : 'Lagna'} ${chart.lagna || '—'}, ${lang === 'hi' ? 'नक्षत्र' : 'Nakshatra'} ${chart.nakshatra || '—'}, ${lang === 'hi' ? 'महादशा' : 'Mahadasha'} ${chart.mahadasha || '—'}${chart.antardasha ? ` / ${chart.antardasha}` : ''}`
      : (lang === 'hi' ? '(कुंडली उपलब्ध नहीं — chart_note खाली छोड़ें।)' : '(No chart on file — leave chart_note empty.)');

    const userMessage = [
      `${lang === 'hi' ? 'सपना' : 'Dream'}: ${text}`,
      `${lang === 'hi' ? 'समय' : 'Timing'}: ${timingLine}`,
      mood && MOODS.includes(String(mood).toLowerCase()) ? `${lang === 'hi' ? 'जागने पर मन' : 'Mood on waking'}: ${mood}` : null,
      is_recurring ? (lang === 'hi' ? 'यह सपना बार-बार आता है।' : 'This dream recurs.') : null,
      `${lang === 'hi' ? 'शास्त्र में देखे गए प्रतीक' : 'Symbols already looked up'}:\n${groundTruth}`,
      chartLine,
    ].filter(Boolean).join('\n\n');

    const response = await chatCompletion({
      json: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT[lang] },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.75,
    });

    let interpretation = null;
    try {
      interpretation = JSON.parse(response.choices[0].message.content.trim());
    } catch {
      // The looked-up half is still correct and still worth returning; only the
      // narration is missing, and the page has a shape for that.
      interpretation = null;
    }

    res.json({ lang, timing, symbols, interpretation, chart, locked: false });
  } catch (err) {
    console.error('[dreamController.interpret]', err);
    res.status(500).json({ error: 'Dream interpretation failed. Please try again.' });
  }
};
