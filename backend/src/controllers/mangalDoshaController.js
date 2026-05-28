'use strict';

const { calculateKundali } = require('../services/kundaliEngine');

// ── Dosha houses (1-based) ─────────────────────────────────────────────────────
const DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

// ── Zodiac reference ───────────────────────────────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// ── House-by-house effect text ─────────────────────────────────────────────────
const HOUSE_EFFECTS = {
  1: {
    title: 'Mars in 1st House (Lagna)',
    effect: 'Mars in the Ascendant makes the native aggressive, impulsive, and prone to physical conflicts. The partner may face health challenges due to the native\'s fiery temperament. However, it also gives strong physical vitality and leadership.',
    intensity: 6,
    marriage_impact: 'Moderate — temperament issues may strain the relationship. Counseling and patience help.'
  },
  2: {
    title: 'Mars in 2nd House',
    effect: 'Mars in the 2nd house affects family life, speech, and financial stability. Harsh speech and financial disputes can create friction in marriage. The native may unintentionally hurt family members with cutting words.',
    intensity: 7,
    marriage_impact: 'Moderate-High — financial conflicts and harsh communication require conscious effort to manage.'
  },
  4: {
    title: 'Mars in 4th House',
    effect: 'Mars in the 4th house disturbs domestic peace and the mother\'s health. Marital home may face unrest, disputes over property, or frequent relocations. The partner and home life are directly affected.',
    intensity: 7,
    marriage_impact: 'High — domestic harmony is disrupted. Grounding practices and a stable home base are advised.'
  },
  7: {
    title: 'Mars in 7th House',
    effect: 'The 7th house is the house of marriage. Mars here is the strongest Mangal Dosha placement — it directly impacts the spouse, creating conflicts, domination, and in severe cases, separation or widowhood in classical texts.',
    intensity: 9,
    marriage_impact: 'Very High — direct impact on marriage partner. Partner\'s longevity and temperament are affected. Matching with a Manglik partner is strongly advised.'
  },
  8: {
    title: 'Mars in 8th House',
    effect: 'The 8th house governs the spouse\'s longevity (Mangalyasthana). Mars here classically indicates risks to the partner\'s lifespan. It can also create obstacles, sudden accidents, and hidden challenges in married life.',
    intensity: 9,
    marriage_impact: 'Very High — the most feared placement. Partner matching and specific remedies are highly recommended.'
  },
  12: {
    title: 'Mars in 12th House',
    effect: 'Mars in the 12th house affects bed pleasures, conjugal happiness, and expenditure. It can create dissatisfaction in physical intimacy, sleeping disorders, and financial losses through the partner or hidden enemies.',
    intensity: 6,
    marriage_impact: 'Moderate — conjugal life and shared finances are affected. Spiritual sadhana and open communication help.'
  }
};

// ── Cancellation conditions ────────────────────────────────────────────────────
function getCancellations(pp, lagnaIdx, marsHouseFromLagna) {
  const mars    = pp['Mars'];
  const moon    = pp['Moon'];
  const venus   = pp['Venus'];
  const jupiter = pp['Jupiter'];
  const saturn  = pp['Saturn'];
  const sun     = pp['Sun'];

  const marsSign = mars.sign_index;
  const cancels  = [];

  // 1. Mars in own sign (Aries=0 or Scorpio=7)
  if (marsSign === 0 || marsSign === 7) {
    cancels.push({ rule: 'Mars in Own Sign', detail: `Mars in ${SIGNS[marsSign]} (own sign) neutralises the dosha — the planet's energy is directed constructively.` });
  }

  // 2. Mars exalted (Capricorn=9)
  if (marsSign === 9) {
    cancels.push({ rule: 'Mars Exalted', detail: 'Mars in Capricorn (exaltation) converts the dosha energy into discipline, ambition, and constructive drive.' });
  }

  // 3. Lagna is Aries or Scorpio (Mars rules these — neutralised)
  if (lagnaIdx === 0 || lagnaIdx === 7) {
    cancels.push({ rule: 'Mars-Ruled Lagna', detail: `Lagna is ${SIGNS[lagnaIdx]}, ruled by Mars. The native naturally channels Martian energy — dosha is neutralised.` });
  }

  // 4. Mars in 7th house in Gemini or Virgo (Mercury signs — analytical softening)
  if (marsHouseFromLagna === 7 && (marsSign === 2 || marsSign === 5)) {
    cancels.push({ rule: 'Mars in 7th in Mercury Sign', detail: `Mars in 7th in ${SIGNS[marsSign]} (ruled by Mercury) softens its aggressive influence — dosha is greatly reduced.` });
  }

  // 5. Mars in 8th in Jupiter's signs (Sagittarius=8 or Pisces=11)
  if (marsHouseFromLagna === 8 && (marsSign === 8 || marsSign === 11)) {
    cancels.push({ rule: 'Mars in 8th in Jupiter Sign', detail: `Mars in 8th in ${SIGNS[marsSign]} (ruled by Jupiter, a benefic) substantially reduces the 8th-house dosha.` });
  }

  // 6. Mars in 12th in Venus signs (Taurus=1 or Libra=6)
  if (marsHouseFromLagna === 12 && (marsSign === 1 || marsSign === 6)) {
    cancels.push({ rule: 'Mars in 12th in Venus Sign', detail: `Mars in 12th in ${SIGNS[marsSign]} (ruled by Venus) reduces the conjugal-life affliction — dosha partially cancelled.` });
  }

  // 7. Jupiter conjunct Mars (within same sign)
  if (jupiter && jupiter.sign_index === marsSign) {
    cancels.push({ rule: 'Jupiter Conjunct Mars', detail: 'Jupiter in the same sign as Mars acts as a divine protector, neutralising the malefic effects through wisdom and benevolence.' });
  }

  // 8. Jupiter in 7th house (aspects marriage)
  const jupiterHouse = ((jupiter.sign_index - lagnaIdx + 12) % 12) + 1;
  if (jupiterHouse === 7) {
    cancels.push({ rule: 'Jupiter Aspects 7th House', detail: 'Jupiter\'s 7th-house placement aspects and protects marriage — significantly reduces Mangal Dosha effects.' });
  }

  // 9. Venus in Lagna (very auspicious for marriage)
  if (venus && ((venus.sign_index - lagnaIdx + 12) % 12) + 1 === 1) {
    cancels.push({ rule: 'Venus in Lagna', detail: 'Venus in the 1st house blesses the native with charm and marital happiness — this is a powerful cancellation of Mangal Dosha.' });
  }

  // 10. Moon in Aries or Scorpio (Mars signs — reduces moon-chart dosha)
  if (moon && (moon.sign_index === 0 || moon.sign_index === 7)) {
    cancels.push({ rule: 'Moon in Mars Sign', detail: `Moon in ${SIGNS[moon.sign_index]} (Mars sign) reduces the dosha calculated from the Moon chart.` });
  }

  // 11. Saturn conjunct Mars (malefic cancels malefic)
  if (saturn && saturn.sign_index === marsSign) {
    cancels.push({ rule: 'Saturn Conjunct Mars', detail: 'Saturn\'s conjunction with Mars neutralises the Martian aggression through restriction and karmic balance.' });
  }

  // 12. Mars in Leo (Sun-ruled Lagna) with Leo Lagna
  if (lagnaIdx === 4 && marsHouseFromLagna === 1) {
    cancels.push({ rule: 'Mars in Leo with Leo Lagna', detail: 'Mars in the 1st house in Leo (Sun-ruled) gives royal energy — the Sun-Mars combination is powerful and reduces marital affliction.' });
  }

  return cancels;
}

// ── Calculate Mangal Dosha from a reference sign ───────────────────────────────
function calcDoshaFromRef(marsSignIdx, refSignIdx, refLabel) {
  const house = ((marsSignIdx - refSignIdx + 12) % 12) + 1;
  const active = DOSHA_HOUSES.has(house);
  return {
    reference: refLabel,
    house_of_mars: house,
    active,
    sign: SIGNS[refSignIdx],
    details: active ? HOUSE_EFFECTS[house] : null
  };
}

// ── Severity label ─────────────────────────────────────────────────────────────
function getSeverity(score, cancels) {
  const effective = Math.max(0, score - cancels.length * 1.5);
  if (effective >= 7)     return { label: 'High (Uchcha Mangal Dosha)', color: '#ef4444', percent: Math.min(100, Math.round(effective * 11)) };
  if (effective >= 4)     return { label: 'Moderate (Madhyam Mangal Dosha)', color: '#f97316', percent: Math.round(effective * 9) };
  if (effective >= 1)     return { label: 'Mild (Alpa Mangal Dosha)', color: '#eab308', percent: Math.round(effective * 8) };
  return { label: 'No Mangal Dosha / Cancelled', color: '#22c55e', percent: 0 };
}

// ── Compatibility advice ───────────────────────────────────────────────────────
const COMPATIBILITY_ADVICE = {
  high: {
    partner: 'Strong Manglik',
    title: 'Partner should be a Strong Manglik (7th/8th house Mars)',
    detail: 'Classical Vedic texts state that when two Mangliks marry, their doshas cancel each other out. A partner with Mars in 7th or 8th house from their Lagna, Moon, or Venus is ideal.',
    alternatives: ['Perform Kumbh Vivah (symbolic marriage to a pot/tree) before the human marriage', 'Conduct Mangal Shanti puja by a qualified priest', 'Daily Hanuman Chalisa recitation for 40 days before marriage']
  },
  moderate: {
    partner: 'Any Manglik',
    title: 'Partner should ideally have Mangal Dosha',
    detail: 'A partner with Mangal Dosha from any chart (Lagna, Moon, or Venus) can balance the energy. Alternatively, a partner with strong Jupiter in their chart provides protection.',
    alternatives: ['Book a Mangal Graha Puja before wedding', 'Avoid Tuesday wedding dates', 'Wear red coral (moonga) in gold or copper after consulting a jyotishi']
  },
  mild: {
    partner: 'Any (with awareness)',
    title: 'Matching not strictly necessary, but awareness helps',
    detail: 'Mild Mangal Dosha can be managed through remedies and conscious communication. Non-Manglik partners with strong Jupiter, Moon, or Venus in their charts are suitable.',
    alternatives: ['Offer red flowers to Lord Hanuman on Tuesdays', 'Recite Mangal Stotra regularly', 'Keep communication open with your partner about temperament']
  },
  none: {
    partner: 'Any',
    title: 'No Mangal Dosha — Full Compatibility Freedom',
    detail: 'You are not Manglik. There are no restrictions on partner selection from a Mangal Dosha standpoint. Focus on other compatibility factors like Ashtakoot Guna Milan.',
    alternatives: []
  }
};

// ── Famous Manglik personalities ───────────────────────────────────────────────
const FAMOUS_MANGLIKS = [
  { name: 'Aishwarya Rai Bachchan', detail: 'Performed Kumbh Vivah before marrying Abhishek — a strong advocate of the remedy' },
  { name: 'Amitabh Bachchan', detail: 'One of the most successful Mangliks — married to non-Manglik Jaya Bachchan, used remedies' },
  { name: 'Bipasha Basu', detail: 'Both she and Karan Singh Grover are Manglik — a classic cancellation match' },
  { name: 'Katrina Kaif', detail: 'Known Manglik — remedies performed before major life milestones' }
];

// ── Remedies ───────────────────────────────────────────────────────────────────
const REMEDIES = [
  { title: 'Kumbh Vivah', desc: 'A symbolic marriage to a banana tree, peepal tree, or clay pot before the human marriage. This ritual is said to absorb the negative karmic energy of the dosha.', priority: 'High', timing: 'Before Marriage' },
  { title: 'Mangal Puja / Shanti', desc: 'A dedicated puja to appease Mars (Mangal Graha), ideally on a Tuesday. A qualified Vedic priest performs the ritual with specific mantras, red flowers, and prasad.', priority: 'High', timing: 'Any Tuesday' },
  { title: 'Hanuman Chalisa', desc: 'Daily recitation of the Hanuman Chalisa, especially on Tuesdays. Hanuman is considered the ruling deity who controls Mars energy and transforms it into strength.', priority: 'High', timing: 'Daily (especially Tuesday)' },
  { title: 'Mangal Beej Mantra', desc: '"Om Kraam Kreem Kraum Sah Bhaumaya Namah" — chant 108 times daily, ideally facing south, using red sandalwood mala.', priority: 'Medium', timing: 'Daily at sunrise' },
  { title: 'Red Coral (Moonga)', desc: 'Wearing natural red coral in gold or copper ring on the ring finger of the right hand, on a Tuesday after puja. Consult a qualified jyotishi before wearing gemstones.', priority: 'Medium', timing: 'After consultation' },
  { title: 'Donate on Tuesdays', desc: 'Donate red lentils (masoor dal), jaggery, red cloth, or sweets to needy people or temples on Tuesday. Feeding animals (especially monkeys) is also highly recommended.', priority: 'Medium', timing: 'Every Tuesday' },
  { title: 'Fasting on Tuesdays', desc: 'Observe a fast on Tuesdays. Eat only once, avoiding non-vegetarian food, alcohol, and onion-garlic. Break the fast by eating red-colored food or sweets.', priority: 'Medium', timing: 'Every Tuesday' },
  { title: 'Mangal Yantra', desc: 'Place a consecrated Mangal Yantra in your home\'s south corner (Mars direction). Worship it with red flowers, red sandalwood paste, and a ghee lamp on Tuesdays.', priority: 'Low', timing: 'Install on a Tuesday' },
  { title: 'Visit Mangalnath Temple', desc: 'Visit the famous Mangalnath Temple in Ujjain (considered the birthplace of Mangal Graha) or any local Hanuman temple on Tuesdays for special Mars pacification.', priority: 'Low', timing: 'Auspicious Tuesday' },
  { title: 'Book Shani-Mangal Puja', desc: 'Some astrologers recommend a combined Shani-Mangal puja when both planets cause afflictions. This is best done during Mars Dasha/Antardasha.', priority: 'Low', timing: 'During Mars Dasha' }
];

// ── Main controller ────────────────────────────────────────────────────────────
async function calculate(req, res) {
  try {
    const { dob, tob, lat, lng, city } = req.body;
    if (!dob || !tob || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'dob, tob, lat, lng are required' });
    }

    const kundali = await calculateKundali(dob, tob, parseFloat(lat), parseFloat(lng), 5.5);
    const pp        = kundali.planetary_positions;
    const lagnaIdx  = kundali.lagna_sign_index;
    const marsIdx   = pp['Mars'].sign_index;
    const moonIdx   = pp['Moon'].sign_index;
    const venusIdx  = pp['Venus'].sign_index;

    // Mars house from each reference
    const fromLagna  = calcDoshaFromRef(marsIdx, lagnaIdx,  'Lagna (Ascendant)');
    const fromMoon   = calcDoshaFromRef(marsIdx, moonIdx,   'Moon (Chandra)');
    const fromVenus  = calcDoshaFromRef(marsIdx, venusIdx,  'Venus (Shukra)');

    const marsHouseFromLagna = fromLagna.house_of_mars;

    // Is Manglik?
    const isManglik = fromLagna.active || fromMoon.active || fromVenus.active;

    // Cancellations
    const cancellations = getCancellations(pp, lagnaIdx, marsHouseFromLagna);
    const isCancelled   = isManglik && cancellations.length > 0;

    // Severity score
    let rawScore = 0;
    if (fromLagna.active) rawScore += fromLagna.details.intensity;
    if (fromMoon.active)  rawScore += Math.round(fromMoon.details.intensity * 0.6);  // Moon = 60% weight
    if (fromVenus.active) rawScore += Math.round(fromVenus.details.intensity * 0.5); // Venus = 50% weight

    const severity = getSeverity(rawScore, cancellations);
    const severityKey = severity.label.startsWith('High') ? 'high'
                      : severity.label.startsWith('Moderate') ? 'moderate'
                      : severity.label.startsWith('Mild') ? 'mild' : 'none';

    // Key birth data for display
    const birthData = {
      lagna:       kundali.lagna,
      lagna_index: lagnaIdx,
      moon_sign:   kundali.moon_sign,
      mars_sign:   pp['Mars'].sign,
      mars_sign_index: marsIdx,
      mars_degree: pp['Mars'].degree,
      mars_retrograde: pp['Mars'].retrograde || false,
      venus_sign:  pp['Venus'].sign,
      jupiter_sign: pp['Jupiter'].sign
    };

    // Navamsha Mars check
    const navMars = kundali.divisional_charts?.navamsha?.Mars;
    let navamshaNote = null;
    if (navMars) {
      const navIdx = navMars.sign_index ?? navMars.index;
      if (navIdx === 0 || navIdx === 7) {
        navamshaNote = `Mars is in ${SIGNS[navIdx]} in Navamsha (D-9) — its own sign — which reduces the dosha's intensity in the married life chart.`;
      } else if (navIdx === 9) {
        navamshaNote = 'Mars is exalted in Capricorn in the Navamsha (D-9) chart, further reducing the dosha\'s impact on marriage.';
      }
    }

    return res.json({
      isManglik,
      isCancelled,
      severity,
      severityKey,
      birthData,
      analysis: {
        fromLagna,
        fromMoon,
        fromVenus
      },
      cancellations,
      navamshaNote,
      compatibilityAdvice: COMPATIBILITY_ADVICE[severityKey],
      remedies: isManglik ? REMEDIES : [],
      famousMangliks: FAMOUS_MANGLIKS,
      summary: isManglik
        ? isCancelled
          ? `You have Mangal Dosha (Mars in ${marsHouseFromLagna}th house from Lagna), but ${cancellations.length} cancellation${cancellations.length > 1 ? 's' : ''} significantly reduce its impact. The dosha is partially or fully neutralised.`
          : `You have ${severity.label}. Mars is placed in the ${marsHouseFromLagna}th house from Lagna${fromMoon.active ? ', and also causes dosha from the Moon chart' : ''}${fromVenus.active ? ' and Venus chart' : ''}. Remedies and partner matching are advised.`
        : 'You do not have Mangal Dosha. Mars is not placed in any of the dosha-causing houses (1, 2, 4, 7, 8, 12) from your Lagna, Moon, or Venus. You have complete freedom in partner selection from this standpoint.'
    });

  } catch (err) {
    console.error('[MangalDosha]', err);
    res.status(500).json({ error: 'Calculation failed', details: err.message });
  }
}

module.exports = { calculate };
