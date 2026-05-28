'use strict';

const { calculateKundali } = require('../services/kundaliEngine');

const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

// ── Helpers ────────────────────────────────────────────────────────────────────
const houseOf = (signIdx, lagnaIdx) => ((signIdx - lagnaIdx + 12) % 12) + 1;

const ANGULAR  = new Set([1,4,7,10]);
const TRINE    = new Set([5,9]);
const GAINFUL  = new Set([1,2,3,4,5,7,9,10,11]);
const DUSTHANA = new Set([6,8,12]);

function placementTier(house) {
  if (ANGULAR.has(house))       return 'angular';
  if (TRINE.has(house))         return 'trine';
  if (GAINFUL.has(house))       return 'gainful';
  if (DUSTHANA.has(house))      return 'dusthana';
  return 'neutral';
}

function scoreFromTier(tier) {
  return { angular:1.2, trine:1.5, gainful:0.8, dusthana:-1.0, neutral:0.2 }[tier] || 0;
}

const BENEFICS = new Set(['Jupiter','Venus','Moon','Mercury']);
const MALEFICS = new Set(['Saturn','Mars','Sun','Rahu','Ketu']);

function planetInHouse(pp, lagnaIdx) {
  const map = {};
  for (const [name, pos] of Object.entries(pp)) {
    const h = houseOf(pos.sign_index, lagnaIdx);
    if (!map[h]) map[h] = [];
    map[h].push(name);
  }
  return map;
}

// ── Career insights ────────────────────────────────────────────────────────────
const CAREER_DASHA = {
  Sun:     'Government, authority, leadership, and public-sector roles are strongly supported in this period. Pursue promotions and positions of responsibility with confidence.',
  Moon:    'Public-facing roles, hospitality, real estate, and emotional intelligence-based careers thrive. Working with the public or from home can be highly productive.',
  Mars:    'Technical fields, engineering, defence, real estate, sports, and management gain momentum. Take bold career initiatives — this period rewards courage.',
  Mercury: 'Business, communication, IT, writing, accounting, and advisory roles are highlighted. Expand your professional network and launch communication-led ventures.',
  Jupiter: 'Teaching, law, advisory roles, finance, and wisdom-based professions are favoured. A mentor or guide may open significant career opportunities for you.',
  Venus:   'Creative arts, entertainment, luxury industries, hospitality, and design flourish. Personal charm and aesthetic talent become professional assets.',
  Saturn:  'Service, discipline, and persistent effort are the themes. Career moves slowly but surely — hard work now lays the foundation for lasting authority.',
  Rahu:    'Technology, foreign work, unconventional careers, and mass media receive a major boost. Break industry norms — innovation is your competitive edge.',
  Ketu:    'Research, spiritual work, and technical niche fields are highlighted. Detachment from career ego actually opens unexpected opportunities.',
};

const CAREER_10TH_PLANET = {
  Sun:     'The Sun\'s presence in the 10th house confers natural leadership ability and government favour. Authority positions and public recognition come readily to you.',
  Moon:    'The Moon in the 10th house brings fame through public-facing work. You thrive in roles that require emotional intelligence and social connection.',
  Mars:    'Mars energises the 10th house with drive, competitiveness, and executive ability. Technical, managerial, and entrepreneurial roles are your strength.',
  Mercury: 'Mercury in the 10th creates a sharp business mind. Communication-driven careers — writing, IT, consulting — are powerfully highlighted.',
  Jupiter: 'Jupiter in the 10th is highly auspicious — wisdom-based professions like teaching, law, and finance are your domain. Reputation and respect grow naturally.',
  Venus:   'Venus in the 10th house brings career success through creativity, aesthetics, and charm. Arts, entertainment, and luxury industries suit you perfectly.',
  Saturn:  'Saturn in the 10th creates a slow but certain rise to authority. Government service, institutional leadership, and management are favoured.',
  Rahu:    'Rahu in the 10th drives you toward unconventional, high-visibility careers. Technology, media, and international fields bring fame and recognition.',
  Ketu:    'Ketu in the 10th house suggests a karmic career path — past-life expertise surfaces in this life through research, spirituality, or technical mastery.',
};

function analyseCareer(pp, lagnaIdx, dasha) {
  const houseMap = planetInHouse(pp, lagnaIdx);
  const tenthSignIdx = (lagnaIdx + 9) % 12;
  const tenthLord    = SIGN_LORDS[tenthSignIdx];
  const tlHouse      = houseOf(pp[tenthLord]?.sign_index ?? lagnaIdx, lagnaIdx);
  const tlTier       = placementTier(tlHouse);

  const sunHouse  = houseOf(pp.Sun.sign_index, lagnaIdx);
  const satHouse  = houseOf(pp.Saturn.sign_index, lagnaIdx);
  const jupHouse  = houseOf(pp.Jupiter.sign_index, lagnaIdx);
  const mercHouse = houseOf(pp.Mercury.sign_index, lagnaIdx);

  let score = 5.0;
  score += scoreFromTier(tlTier) * 1.5;
  if ([1,4,7,10].includes(sunHouse)) score += 0.7;
  if ([5,9].includes(jupHouse))      score += 0.8;
  if (DUSTHANA.has(satHouse))        score -= 0.6;
  if (GAINFUL.has(mercHouse))        score += 0.5;

  const tenthOccupants = houseMap[10] || [];
  tenthOccupants.forEach(p => {
    score += BENEFICS.has(p) ? 0.6 : -0.3;
  });

  score = Math.min(9.4, Math.max(2.5, parseFloat(score.toFixed(1))));

  const strengths = [], challenges = [];

  if (!DUSTHANA.has(tlHouse)) {
    strengths.push(`Your ${tenthLord} (10th lord) in the ${tlHouse}th house supports steady career advancement and professional recognition.`);
  } else {
    challenges.push(`The 10th lord ${tenthLord} is in the ${tlHouse}th house — career progress requires extra effort and strategic patience.`);
  }

  tenthOccupants.forEach(p => {
    if (CAREER_10TH_PLANET[p]) {
      BENEFICS.has(p) ? strengths.push(CAREER_10TH_PLANET[p]) : challenges.push(CAREER_10TH_PLANET[p]);
    }
  });

  if ([4,5,9].includes(sunHouse)) strengths.push('The Sun\'s position supports you in authority roles and government-linked careers. Your natural confidence commands professional respect.');
  else if (DUSTHANA.has(sunHouse)) challenges.push('The Sun\'s placement suggests you may face friction with authority figures — building respectful professional relationships is key.');

  if ([2,9,10,11].includes(jupHouse)) strengths.push('Jupiter\'s position promises long-term career expansion through knowledge, wisdom, and ethical professional conduct.');
  else if (DUSTHANA.has(jupHouse))    challenges.push('Jupiter\'s placement requires you to avoid over-promising professionally — disciplined, realistic goals yield better results.');

  if (GAINFUL.has(mercHouse)) strengths.push('Mercury\'s strong position enhances your business acumen, communication skills, and professional networking ability.');

  if (DUSTHANA.has(satHouse)) challenges.push('Saturn\'s position creates career delays and obstacles requiring consistent effort — but Saturn ultimately rewards those who persist.');

  return {
    score,
    label: scoreLabel(score),
    summary: `Your career sector shows ${scoreLabel(score).toLowerCase()} planetary support. ${tenthOccupants.length > 0 ? `The ${tenthOccupants.join(' and ')} in your 10th house make your professional character distinctive.` : `Your 10th lord ${tenthLord} shapes your professional destiny from the ${tlHouse}th house.`}`,
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 3),
    currentPeriod: {
      planet: dasha,
      insight: CAREER_DASHA[dasha] || 'This period brings steady career opportunities requiring focused application of your skills.',
    },
    remedies: [
      'Face east while working or studying — enhances career-related Sun energy.',
      'Donate wheat and copper on Sundays to strengthen the Sun (career authority).',
      'Worship Lord Ganesha on Wednesdays and recite his mantra before important professional meetings.',
      'Keep your office desk clean and clutter-free — the northwest corner is ideal for a career vision board.',
    ],
  };
}

// ── Love insights ──────────────────────────────────────────────────────────────
const LOVE_DASHA = {
  Sun:     'This period can create some ego tension in close relationships. The key is conscious humility — step back from needing to be right, and your bond deepens significantly.',
  Moon:    'Emotionally rich and deeply connecting period for love. Intuition guides you to the right person or deepens an existing bond. Family harmony is highlighted.',
  Mars:    'Passionate and intensely romantic period. New attractions are powerful and physical. Channel Mars energy into courage in love — express your feelings boldly.',
  Mercury: 'Witty, communicative, and playful connections define this period. Intellectual compatibility becomes the greatest turn-on. Writing and talking strengthen bonds.',
  Jupiter: 'The most auspicious period for marriage and lasting love. A wise, generous partner may arrive, or an existing relationship reaches a new level of depth.',
  Venus:   'Venus\'s own Dasha is the most romantically potent period. Love, beauty, pleasure, and deep partnership are the defining themes. Marriage is strongly favoured.',
  Saturn:  'Serious, committed, and karmic relationships deepen in this period. Casual connections fall away. A lasting, dependable love is being built — trust the process.',
  Rahu:    'Unusual, intense, and unconventional attractions are possible. Foreign or karmic connections are highlighted. Exercise discernment in new romantic encounters.',
  Ketu:    'A period of detachment from superficial love. Spiritual depth in relationships is cultivated. Focus on inner completeness rather than seeking externally.',
};

const LOVE_7TH_PLANET = {
  Sun:     'The Sun in your 7th house brings a strong, confident partner — but ego dynamics need regular attention. Mutual respect is the cornerstone of your relationship.',
  Moon:    'The Moon in the 7th brings an emotionally sensitive, nurturing partner. Your relationship thrives on emotional attunement and open communication.',
  Mars:    'Mars in the 7th creates a passionate, energetic partner — but arguments can be intense. Channelling that fire into shared projects transforms conflict into creation.',
  Mercury: 'Mercury in the 7th attracts an intelligent, witty, communicative partner. Intellectual connection and good conversation are the lifeblood of your relationship.',
  Jupiter: 'Jupiter in the 7th is one of the best placements for marriage — a wise, generous, spiritually-minded partner who elevates your life in every dimension.',
  Venus:   'Venus in its relationship house creates a deeply loving, beautiful, and harmonious partnership. Marriage is highlighted as a source of joy and refinement.',
  Saturn:  'Saturn in the 7th brings a serious, reliable, and often older partner. The relationship deepens slowly but builds into one of exceptional loyalty and stability.',
  Rahu:    'Rahu in the 7th attracts unconventional, foreign, or karmic partnerships. The relationship is transformative and intense — approach with mindful awareness.',
  Ketu:    'Ketu in the 7th brings a spiritually connected but sometimes detached partnership. Past-life bonds create deep recognition but require conscious nurturing.',
};

function analyseLove(pp, lagnaIdx, dasha) {
  const houseMap    = planetInHouse(pp, lagnaIdx);
  const sevthSignIdx = (lagnaIdx + 6) % 12;
  const seventhLord  = SIGN_LORDS[sevthSignIdx];
  const slHouse      = houseOf(pp[seventhLord]?.sign_index ?? lagnaIdx, lagnaIdx);
  const slTier       = placementTier(slHouse);
  const fifthSignIdx = (lagnaIdx + 4) % 12;
  const fifthLord    = SIGN_LORDS[fifthSignIdx];
  const flHouse      = houseOf(pp[fifthLord]?.sign_index ?? lagnaIdx, lagnaIdx);

  const venusHouse = houseOf(pp.Venus.sign_index, lagnaIdx);
  const moonHouse  = houseOf(pp.Moon.sign_index, lagnaIdx);

  let score = 5.0;
  score += scoreFromTier(slTier) * 1.4;
  if (GAINFUL.has(venusHouse)) score += 0.9;
  if ([1,5,7,9].includes(moonHouse)) score += 0.6;
  if (GAINFUL.has(flHouse))    score += 0.5;

  const seventhOccupants = houseMap[7] || [];
  seventhOccupants.forEach(p => { score += BENEFICS.has(p) ? 0.7 : -0.3; });

  score = Math.min(9.4, Math.max(2.5, parseFloat(score.toFixed(1))));

  const strengths = [], challenges = [];

  if (!DUSTHANA.has(slHouse)) {
    strengths.push(`Your 7th lord ${seventhLord} in the ${slHouse}th house supports fulfilling, lasting partnerships and a harmonious marriage.`);
  } else {
    challenges.push(`The 7th lord ${seventhLord} in the ${slHouse}th house indicates that relationships require conscious effort, patience, and clear communication to flourish.`);
  }

  seventhOccupants.forEach(p => {
    if (LOVE_7TH_PLANET[p]) {
      BENEFICS.has(p) ? strengths.push(LOVE_7TH_PLANET[p]) : challenges.push(LOVE_7TH_PLANET[p]);
    }
  });

  if ([1,2,5,7,11].includes(venusHouse)) strengths.push('Venus is well-placed and active in your chart — love, beauty, and romantic fulfilment are natural themes in your life.');
  else if (DUSTHANA.has(venusHouse))     challenges.push('Venus\'s position suggests past disappointments in love. Healing those patterns and cultivating self-love first transforms your relationships.');

  if ([4,5,7,11].includes(moonHouse)) strengths.push('The Moon\'s favourable placement gives you deep emotional intelligence — your capacity for genuine empathy and nurturing is a powerful relationship asset.');

  if (GAINFUL.has(flHouse)) strengths.push('Your 5th house lord\'s strong placement indicates romance, love affairs, and the possibility of a deeply romantic courtship before settling down.');
  else if (DUSTHANA.has(flHouse)) challenges.push('The 5th lord\'s placement suggests romance may require more patience. Trust that the right connection arrives at the right time.');

  return {
    score,
    label: scoreLabel(score),
    summary: `Your love and relationship sector is ${scoreLabel(score).toLowerCase()}. ${seventhOccupants.length > 0 ? `The ${seventhOccupants.join(' and ')} in your 7th house creates a distinctive relationship dynamic.` : `Your 7th lord ${seventhLord} shapes your partnership karma from the ${slHouse}th house.`}`,
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 3),
    currentPeriod: {
      planet: dasha,
      insight: LOVE_DASHA[dasha] || 'The current period brings steady developments in love and partnership — patience and open-heartedness are your keys.',
    },
    remedies: [
      'Recite the Shukra (Venus) mantra "Om Shum Shukraya Namaha" 108 times on Fridays.',
      'Donate white sweets, white flowers, or white cloth to young girls on Fridays.',
      'Offer a pair of white doves or feed white pigeons near a temple on Fridays.',
      'Keep a Rose Quartz crystal in the southwest corner of your bedroom to invite love energy.',
    ],
  };
}

// ── Finance insights ───────────────────────────────────────────────────────────
const FINANCE_DASHA = {
  Sun:     'Government contracts, authority-backed income, and father\'s support are financial highlights. Avoid speculative investments — stable, structured growth is favoured.',
  Moon:    'Public business, real estate, and emotionally-connected ventures are financially active. Income may fluctuate but overall trending upward. Save consistently.',
  Mars:    'Income through technical skills, real estate, or courageous ventures picks up pace. Avoid impulsive financial decisions — channel Mars into planned investments.',
  Mercury: 'Business, trade, writing, IT, and communication-based income is highlighted. Networking and clever business moves produce financial gains. Track all accounts carefully.',
  Jupiter: 'One of the most auspicious Dasha periods for wealth accumulation. Long-term investments, advisory income, and unexpected financial blessings are indicated.',
  Venus:   'Arts, luxury, entertainment, and aesthetic ventures produce strong financial returns. A significant financial gain through a partner or artistic work is likely.',
  Saturn:  'Disciplined, patient saving and investment yield slow but certain financial growth. Avoid shortcuts — Saturn rewards rigorous financial discipline handsomely.',
  Rahu:    'Foreign income, technology ventures, and unconventional financial sources are active. Significant gains possible but speculative risks must be carefully managed.',
  Ketu:    'Detachment from money paradoxically attracts it. Spiritual or technical income sources are highlighted. Avoid over-accumulation — give generously to keep flow.',
};

function analyseFinance(pp, lagnaIdx, dasha) {
  const houseMap = planetInHouse(pp, lagnaIdx);
  const secSignIdx = (lagnaIdx + 1) % 12;
  const eleventhSignIdx = (lagnaIdx + 10) % 12;
  const secondLord  = SIGN_LORDS[secSignIdx];
  const eleventhLord = SIGN_LORDS[eleventhSignIdx];
  const slHouse  = houseOf(pp[secondLord]?.sign_index  ?? lagnaIdx, lagnaIdx);
  const elHouse  = houseOf(pp[eleventhLord]?.sign_index ?? lagnaIdx, lagnaIdx);
  const jupHouse = houseOf(pp.Jupiter.sign_index, lagnaIdx);
  const venHouse = houseOf(pp.Venus.sign_index, lagnaIdx);
  const eighthSignIdx = (lagnaIdx + 7) % 12;
  const eighthLord    = SIGN_LORDS[eighthSignIdx];
  const eightLordHouse = houseOf(pp[eighthLord]?.sign_index ?? lagnaIdx, lagnaIdx);

  let score = 5.0;
  score += scoreFromTier(placementTier(slHouse))  * 1.2;
  score += scoreFromTier(placementTier(elHouse))  * 1.2;
  if ([1,2,5,9,11].includes(jupHouse)) score += 0.9;
  if ([1,2,5,7,11].includes(venHouse)) score += 0.6;
  const eleventhOccupants = houseMap[11] || [];
  eleventhOccupants.forEach(p => { score += BENEFICS.has(p) ? 0.5 : -0.2; });
  const secondOccupants = houseMap[2] || [];
  secondOccupants.forEach(p => { score += BENEFICS.has(p) ? 0.5 : -0.3; });

  // Dhan yoga: 2nd and 11th lords connected (aspecting each other or same house)
  const dhanYoga = slHouse === elHouse || slHouse === eleventhSignIdx+1 || elHouse === secSignIdx+1;

  score = Math.min(9.4, Math.max(2.5, parseFloat(score.toFixed(1))));

  const strengths = [], challenges = [];

  if (dhanYoga) strengths.push('Your chart contains a Dhan Yoga — the 2nd and 11th lords are linked, indicating a strong potential for wealth accumulation over your lifetime.');

  if (GAINFUL.has(slHouse))  strengths.push(`Your 2nd lord ${secondLord} in the ${slHouse}th house supports accumulated savings, family wealth, and financial stability.`);
  else challenges.push(`The 2nd lord ${secondLord} in the ${slHouse}th house suggests family finances need careful management and protection.`);

  if (GAINFUL.has(elHouse))  strengths.push(`Your 11th lord ${eleventhLord} in the ${elHouse}th house amplifies income potential and gains from multiple sources.`);
  else challenges.push(`The 11th lord ${eleventhLord} in the ${elHouse}th house can cause income fluctuations — diversifying income sources is strongly recommended.`);

  if ([1,2,5,9,11].includes(jupHouse)) strengths.push('Jupiter\'s favourable position is a powerful financial blessing — long-term wealth, wise investments, and unexpected financial windfalls are indicated.');
  else if (DUSTHANA.has(jupHouse)) challenges.push('Jupiter\'s position suggests over-generosity or poor financial advice may be a risk. Seek qualified financial guidance and set clear budgets.');

  if ([2,11].includes(eightLordHouse)) strengths.push('The 8th lord\'s placement hints at inheritance, insurance, or unexpected lump-sum gains arriving at key life junctures.');

  secondOccupants.forEach(p => {
    if (BENEFICS.has(p)) strengths.push(`${p} in the 2nd house strengthens your capacity for wealth accumulation, business income, and family financial security.`);
    else challenges.push(`${p} in the 2nd house can create financial instability or impulsive spending — disciplined budgeting and saving habits are essential.`);
  });

  return {
    score,
    label: scoreLabel(score),
    summary: `Your finance sector is ${scoreLabel(score).toLowerCase()}. ${dhanYoga ? 'A Dhan Yoga in your chart creates long-term wealth-building potential.' : `Your financial potential is shaped by the ${secondLord} (2nd lord) and ${eleventhLord} (11th lord) in your chart.`}`,
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 3),
    currentPeriod: {
      planet: dasha,
      insight: FINANCE_DASHA[dasha] || 'Current period brings moderate financial activity — prudent savings and measured investments will consolidate your position.',
    },
    remedies: [
      'Keep your locker or wallet in the north direction — governed by Kubera, the lord of wealth.',
      'Recite Lakshmi mantra "Om Shreem Mahalakshmiyei Namaha" 108 times on Fridays.',
      'Donate yellow sweets or food to Brahmins on Thursdays to strengthen Jupiter (abundance planet).',
      'Never keep an empty wallet — always keep a note of currency and a copper coin inside.',
    ],
  };
}

// ── Health insights ────────────────────────────────────────────────────────────
const HEALTH_DASHA = {
  Sun:     'Vitality is highlighted — this period strengthens constitution. However, guard against heat-related ailments, eye strain, and blood pressure. Rest adequately.',
  Moon:    'Emotional and mental health are most active areas. Guard against anxiety, water retention, and digestive sensitivity. Regular meditation is deeply beneficial.',
  Mars:    'Physical energy is very high but accident and inflammatory risks are elevated. Avoid reckless physical activities. Channelling Mars into regular exercise is protective.',
  Mercury: 'Nervous system sensitivity is heightened. Avoid mental overload and information overwhelm. Regular breathing exercises and light yoga calm Mercury\'s restlessness.',
  Jupiter: 'Generally a health-protecting period. The main risk is overindulgence in food and luxury — maintain disciplined diet and regular exercise for best results.',
  Venus:   'Kidney, reproductive health, and blood sugar need attention. A beautiful, balanced lifestyle is both the desire and the prescription during Venus Dasha.',
  Saturn:  'Chronic, long-term health conditions may surface. Joints, bones, and teeth need care. Disciplined lifestyle and regular check-ups are Saturn\'s prescription.',
  Rahu:    'Mysterious or hard-to-diagnose ailments are possible. Stress-related conditions and psychosomatic symptoms need attention. Avoid harmful substances.',
  Ketu:    'Sudden, acute ailments that resolve quickly are Ketu\'s pattern. Spiritual practices and fasting help. Hospitals and ashrams are healing environments now.',
};

function analyseHealth(pp, lagnaIdx, dasha) {
  const lagnaLord    = SIGN_LORDS[lagnaIdx];
  const llHouse      = houseOf(pp[lagnaLord]?.sign_index ?? lagnaIdx, lagnaIdx);
  const llTier       = placementTier(llHouse);
  const sixthSignIdx = (lagnaIdx + 5) % 12;
  const sixthLord    = SIGN_LORDS[sixthSignIdx];
  const slHouse      = houseOf(pp[sixthLord]?.sign_index ?? lagnaIdx, lagnaIdx);
  const eighthSignIdx = (lagnaIdx + 7) % 12;
  const eighthLord    = SIGN_LORDS[eighthSignIdx];
  const eLordHouse    = houseOf(pp[eighthLord]?.sign_index ?? lagnaIdx, lagnaIdx);
  const sunHouse  = houseOf(pp.Sun.sign_index, lagnaIdx);
  const moonHouse = houseOf(pp.Moon.sign_index, lagnaIdx);
  const marsHouse = houseOf(pp.Mars.sign_index, lagnaIdx);
  const satHouse  = houseOf(pp.Saturn.sign_index, lagnaIdx);
  const houseMap  = planetInHouse(pp, lagnaIdx);

  let score = 6.0; // health starts slightly higher baseline
  score += scoreFromTier(llTier) * 1.3;
  if (GAINFUL.has(sunHouse))  score += 0.7;
  if (GAINFUL.has(moonHouse)) score += 0.5;
  if (DUSTHANA.has(slHouse))  score -= 0.4; // 6th lord in bad house is actually good (avoids health issues)
  else score -= 0.5; // 6th lord well-placed can strengthen disease
  if ([6,8,12].includes(eLordHouse)) score -= 0.6;
  if (DUSTHANA.has(satHouse)) score -= 0.5;
  if (DUSTHANA.has(marsHouse)) score -= 0.4;

  const lagnaOccupants = houseMap[1] || [];
  lagnaOccupants.forEach(p => { score += BENEFICS.has(p) ? 0.5 : -0.4; });

  score = Math.min(9.4, Math.max(2.5, parseFloat(score.toFixed(1))));

  const strengths = [], challenges = [];

  if (!DUSTHANA.has(llHouse)) {
    strengths.push(`Your Lagna lord ${lagnaLord} in the ${llHouse}th house provides a strong physical constitution and natural resilience throughout life.`);
  } else {
    challenges.push(`The Lagna lord ${lagnaLord} in the ${llHouse}th house indicates that health requires ongoing attention and proactive lifestyle management.`);
  }

  if ([1,4,5,9,10,11].includes(sunHouse)) strengths.push('The Sun\'s favourable placement provides strong vital energy, good immunity, and a naturally robust constitution.');
  else if (DUSTHANA.has(sunHouse)) challenges.push('The Sun\'s position suggests that vital energy can fluctuate — rest, sunlight exposure, and Surya Namaskar are protective practices.');

  if ([1,4,7,10].includes(moonHouse)) strengths.push('The Moon\'s angular position provides strong mental and emotional health. Your emotional resilience is a genuine health asset.');
  else if (DUSTHANA.has(moonHouse)) challenges.push('Moon\'s position indicates emotional health needs regular nurturing through meditation, good sleep, and a calm daily routine.');

  if ([1,6].includes(marsHouse)) strengths.push('Mars\' placement gives you strong physical energy, stamina, and recovery ability. You bounce back from illness quickly.');
  else if (DUSTHANA.has(marsHouse)) challenges.push('Mars\' placement suggests inflammatory conditions, accidents, or surgical risks. Physical caution and regular check-ups are recommended.');

  if (DUSTHANA.has(satHouse)) challenges.push('Saturn\'s position may create chronic conditions, particularly affecting bones, joints, and teeth over time. Regular health screening is valuable.');
  else strengths.push('Saturn\'s placement supports long life and structural health — bones, joints, and longevity are well-supported by this position.');

  lagnaOccupants.forEach(p => {
    if (BENEFICS.has(p)) strengths.push(`${p} in the Lagna (1st house) enhances your physical vitality, positive appearance, and overall health.`);
    else challenges.push(`${p} in the Lagna (1st house) may create health sensitivities unique to that planet — monitor and maintain proactively.`);
  });

  const SIGN_BODY_PARTS = ['Head & Brain','Face & Throat','Chest & Shoulders','Chest & Stomach','Heart & Spine','Intestines & Skin','Kidneys & Loins','Reproductive System','Hips & Thighs','Knees & Bones','Calves & Circulation','Feet & Immune System'];
  const lagnaBodyPart   = SIGN_BODY_PARTS[lagnaIdx];

  return {
    score,
    label: scoreLabel(score),
    summary: `Your health sector is ${scoreLabel(score).toLowerCase()}. As a ${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][lagnaIdx]} Lagna, your most sensitive physical zone is the ${lagnaBodyPart} — give it proactive attention and care.`,
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 3),
    currentPeriod: {
      planet: dasha,
      insight: HEALTH_DASHA[dasha] || 'Maintain steady, balanced health habits during this period — consistency is more powerful than intensity.',
    },
    remedies: [
      'Practice Surya Namaskar every morning facing east — 12 rounds energise the entire system.',
      'Eat meals at consistent times and avoid eating after sunset — aligns with Ayurvedic health principles.',
      'Meditate for 20 minutes daily — the single most powerful health practice for the mind-body system.',
      'Keep a copper vessel of water overnight and drink it on an empty stomach every morning.',
    ],
  };
}

// ── Score label ────────────────────────────────────────────────────────────────
function scoreLabel(score) {
  if (score >= 8.0) return 'Excellent';
  if (score >= 6.5) return 'Good';
  if (score >= 5.0) return 'Average';
  return 'Needs Attention';
}

// ── Controller ─────────────────────────────────────────────────────────────────
async function generate(req, res) {
  try {
    const { dob, tob, lat, lng } = req.body;
    if (!dob || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'dob, lat, lng are required' });
    }

    const chart = await calculateKundali(dob, tob || '12:00', parseFloat(lat), parseFloat(lng), 5.5);
    const pp        = chart.planetary_positions;
    const lagnaIdx  = chart.lagna_sign_index;

    // Current Mahadasha planet
    const currentDasha = chart.dasha_sequence?.[0]?.planet || 'Jupiter';

    const domains = {
      career:  analyseCareer(pp, lagnaIdx, currentDasha),
      love:    analyseLove(pp, lagnaIdx, currentDasha),
      finance: analyseFinance(pp, lagnaIdx, currentDasha),
      health:  analyseHealth(pp, lagnaIdx, currentDasha),
    };

    res.json({
      lagna:     chart.lagna,
      moonSign:  chart.moon_sign,
      sunSign:   chart.sun_sign,
      nakshatra: chart.nakshatra,
      currentDasha,
      dashaBalance: chart.dasha_balance,
      domains,
    });
  } catch (err) {
    console.error('[DomainReport]', err.message);
    res.status(400).json({ error: err.message || 'Report generation failed' });
  }
}

module.exports = { generate };
