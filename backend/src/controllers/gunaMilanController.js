'use strict';

const { calculateKundali, NAKSHATRA_NAMES } = require('../services/kundaliEngine');

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

// ── Nakshatra primary Moon-sign mapping (canonical, 0-indexed) ─────────────────
// Based on which rashi each nakshatra primarily falls in for matching purposes
const NAK_SIGN = [
  0,0,1,1,2,2,2,3,3,4,4,5,5,5,6,6,7,7,8,8,8,9,9,10,10,11,11
];

// ── Nadi ───────────────────────────────────────────────────────────────────────
// Aadi(0), Madhya(1), Antya(2)
const NADI = [
  0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,0,1,0,1,2,2
];
const NADI_NAMES = ['Aadi (Vata)','Madhya (Pitta)','Antya (Kapha)'];

// ── Gana ───────────────────────────────────────────────────────────────────────
// Dev(0), Manav(1), Rakshasa(2)
const GANA = [
  0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0
];
const GANA_NAMES = ['Dev (Divine)','Manav (Human)','Rakshasa (Demon)'];

// ── Yoni (animal + gender) ────────────────────────────────────────────────────
const YONI = [
  {a:'Horse',g:'M'},{a:'Elephant',g:'M'},{a:'Sheep',g:'F'},{a:'Serpent',g:'M'},
  {a:'Serpent',g:'F'},{a:'Dog',g:'F'},{a:'Cat',g:'F'},{a:'Sheep',g:'M'},
  {a:'Cat',g:'M'},{a:'Rat',g:'M'},{a:'Rat',g:'F'},{a:'Bull',g:'M'},
  {a:'Buffalo',g:'F'},{a:'Tiger',g:'F'},{a:'Buffalo',g:'M'},{a:'Tiger',g:'M'},
  {a:'Deer',g:'F'},{a:'Deer',g:'M'},{a:'Dog',g:'M'},{a:'Monkey',g:'F'},
  {a:'Mongoose',g:'M'},{a:'Monkey',g:'M'},{a:'Lion',g:'F'},{a:'Horse',g:'F'},
  {a:'Lion',g:'M'},{a:'Bull',g:'F'},{a:'Elephant',g:'F'}
];

// Yoni compat: missing pairs default to 2 (neutral)
const YONI_ENEMY = new Set([
  'Cat-Rat','Rat-Cat','Bull-Tiger','Tiger-Bull',
  'Dog-Deer','Deer-Dog','Serpent-Mongoose','Mongoose-Serpent',
]);
const YONI_SEMI = new Set(['Horse-Lion','Lion-Horse']);
const YONI_FRIENDLY = new Set([
  'Horse-Elephant','Elephant-Horse','Sheep-Deer','Deer-Sheep',
  'Monkey-Sheep','Sheep-Monkey','Bull-Buffalo','Buffalo-Bull',
]);

function yoniScore(n1, n2) {
  const y1 = YONI[n1], y2 = YONI[n2];
  if (y1.a === y2.a) return 4;
  const pair = `${y1.a}-${y2.a}`;
  if (YONI_ENEMY.has(pair))   return 0;
  if (YONI_SEMI.has(pair))    return 1;
  if (YONI_FRIENDLY.has(pair)) return 3;
  return 2;
}

// ── Varna ─────────────────────────────────────────────────────────────────────
// Shudra=1, Vaishya=2, Kshatriya=3, Brahmin=4
const VARNA_RANK  = [3,2,1,4, 3,2,1,4, 3,2,1,4];
const VARNA_LABEL = { 1:'Shudra', 2:'Vaishya', 3:'Kshatriya', 4:'Brahmin' };

function varnaScore(m1, m2) {
  // Traditional: person1 (boy/partner A) varna should be >= person2
  return VARNA_RANK[m1] >= VARNA_RANK[m2] ? 1 : 0;
}

// ── Vasya ─────────────────────────────────────────────────────────────────────
const VASYA = ['Chatushpada','Chatushpada','Manav','Jalchar','Vanachara','Manav',
               'Manav','Keeta','Chatushpada','Chatushpada','Manav','Jalchar'];

function vasyaScore(m1, m2) {
  const v1 = VASYA[m1], v2 = VASYA[m2];
  if (v1 === v2) return 2;
  if ((v1 === 'Manav' && v2 === 'Chatushpada') || (v1 === 'Chatushpada' && v2 === 'Manav')) return 1;
  return 0;
}

// ── Tara ──────────────────────────────────────────────────────────────────────
const BAD_TARAS = new Set([3, 5, 7]);

function taraScore(n1, n2) {
  const diff1 = ((n2 - n1 + 27) % 27) + 1;
  const diff2 = ((n1 - n2 + 27) % 27) + 1;
  const t1 = ((diff1 - 1) % 9) + 1;
  const t2 = ((diff2 - 1) % 9) + 1;
  const good1 = !BAD_TARAS.has(t1);
  const good2 = !BAD_TARAS.has(t2);
  if (good1 && good2) return 3;
  if (!good1 && !good2) return 0;
  return 1.5;
}

// ── Graha Maitri ──────────────────────────────────────────────────────────────
// F=2, N=1, E=0 (used to compute combined score)
const FRIENDSHIP = {
  Sun:     { Moon:'F', Mars:'F', Jupiter:'F', Mercury:'N', Venus:'E', Saturn:'E' },
  Moon:    { Sun:'F', Mercury:'F', Mars:'N', Jupiter:'N', Venus:'N', Saturn:'N' },
  Mars:    { Sun:'F', Moon:'F', Jupiter:'F', Mercury:'E', Venus:'N', Saturn:'N' },
  Mercury: { Sun:'F', Venus:'F', Mars:'N', Jupiter:'N', Saturn:'N', Moon:'E' },
  Jupiter: { Sun:'F', Moon:'F', Mars:'F', Saturn:'N', Mercury:'E', Venus:'E' },
  Venus:   { Mercury:'F', Saturn:'F', Mars:'N', Jupiter:'N', Sun:'E', Moon:'E' },
  Saturn:  { Mercury:'F', Venus:'F', Jupiter:'N', Sun:'E', Moon:'E', Mars:'E' },
};

function grahaMaitriScore(m1, m2) {
  const lord1 = SIGN_LORDS[m1];
  const lord2 = SIGN_LORDS[m2];
  if (lord1 === lord2) return 5;
  const r1 = FRIENDSHIP[lord1]?.[lord2] ?? 'N';
  const r2 = FRIENDSHIP[lord2]?.[lord1] ?? 'N';
  const fCount = (r1==='F'?1:0) + (r2==='F'?1:0);
  const eCount = (r1==='E'?1:0) + (r2==='E'?1:0);
  if (fCount===2 && eCount===0) return 5;
  if (fCount===1 && eCount===0) return 4;
  if (fCount===0 && eCount===0) return 3;
  if (fCount===1 && eCount===1) return 2;
  if (fCount===0 && eCount===1) return 1;
  return 0;
}

// ── Gana ──────────────────────────────────────────────────────────────────────
function ganaScore(n1, n2) {
  const g1 = GANA[n1], g2 = GANA[n2];
  if (g1 === g2) return 6;
  const pair = [g1, g2].sort().join('-');
  if (pair === '0-1') return 5; // Dev + Manav
  if (pair === '0-2') return 1; // Dev + Rakshasa
  return 0;                     // Manav + Rakshasa
}

// ── Bhakoot ───────────────────────────────────────────────────────────────────
function bhakootScore(m1, m2) {
  if (m1 === m2) return 7;
  const diff1 = ((m2 - m1 + 12) % 12) + 1;
  const diff2 = ((m1 - m2 + 12) % 12) + 1;
  const bad = [[2,12],[6,8]];
  for (const [a,b] of bad) {
    if ((diff1===a && diff2===b) || (diff1===b && diff2===a)) return 0;
  }
  return 7;
}

// ── Nadi ──────────────────────────────────────────────────────────────────────
function nadiScore(n1, n2) {
  return NADI[n1] === NADI[n2] ? 0 : 8;
}

// ── Verdict helpers ───────────────────────────────────────────────────────────
function getVerdict(total) {
  if (total >= 32) return { label:'Excellent Match', color:'#22c55e', emoji:'💚', tier:'excellent' };
  if (total >= 27) return { label:'Very Good Match', color:'#84cc16', emoji:'💚', tier:'verygood' };
  if (total >= 21) return { label:'Good Match',      color:'#f59e0b', emoji:'💛', tier:'good' };
  if (total >= 18) return { label:'Average Match',   color:'#f97316', emoji:'🧡', tier:'average' };
  return { label:'Challenging Match', color:'#ef4444', emoji:'❤️‍🔥', tier:'challenging' };
}

const TIER_TEXTS = {
  excellent:   'A rare cosmic blessing. This pairing carries deep karmic resonance formed over many lifetimes. Both partners will experience profound mutual growth, shared dharma, and lasting harmony. Marriage is highly auspicious.',
  verygood:    'A highly compatible match with strong foundations. The couple shares natural understanding and will build a fulfilling life together. Minor differences can be resolved through open communication.',
  good:        'A good match with solid compatibility in most areas. Some koots require conscious effort, but the relationship has strong positive potential. Vedic remedies for lower-scoring koots will strengthen the bond.',
  average:     'Moderate compatibility requiring mutual effort and understanding. This does not prevent a happy relationship — but both partners must be committed to working through differences. Consult an astrologer for guidance.',
  challenging: 'This match presents karmic challenges. Marriage is possible with strong commitment, but professional astrological guidance is recommended before proceeding.',
};

// ── Doshas ───────────────────────────────────────────────────────────────────
function getDoshas(koots, n1, n2, m1, m2) {
  const doshas = [];
  const nadiKoot  = koots.find(k => k.id === 'nadi');
  const bhakootKt = koots.find(k => k.id === 'bhakoot');
  const ganaKoot  = koots.find(k => k.id === 'gana');

  if (nadiKoot.scored === 0) {
    const cancelled = (n1 === n2); // same nakshatra cancels nadi dosha
    doshas.push({
      name: 'Nadi Dosha',
      severity: 'High',
      present: !cancelled,
      cancelled,
      cancellationReason: cancelled ? 'Same nakshatra cancels Nadi Dosha' : null,
      effect: 'May affect health and progeny. The most significant compatibility dosha.',
      remedy: 'Perform Nadi Dosha Nivaran Puja. Consult a Vedic astrologer before marriage.',
    });
  }

  if (bhakootKt.scored === 0) {
    const lord1 = SIGN_LORDS[m1], lord2 = SIGN_LORDS[m2];
    const sameLord = lord1 === lord2;
    const sameGana = GANA[n1] === GANA[n2];
    const cancelled = sameLord || sameGana;
    doshas.push({
      name: 'Bhakoot Dosha',
      severity: 'Medium',
      present: !cancelled,
      cancelled,
      cancellationReason: cancelled
        ? (sameLord ? 'Same rashi lord cancels Bhakoot Dosha' : 'Same gana cancels Bhakoot Dosha')
        : null,
      effect: 'May affect financial prosperity, family happiness, and career success.',
      remedy: 'Perform Graha Shanti Puja for the Moon. Wear compatible gemstones.',
    });
  }

  if (ganaKoot.scored <= 1) {
    const g1 = GANA[n1], g2 = GANA[n2];
    const ganaNames = [GANA_NAMES[g1], GANA_NAMES[g2]];
    doshas.push({
      name: 'Gana Dosha',
      severity: ganaKoot.scored === 0 ? 'Medium' : 'Low',
      present: true,
      cancelled: false,
      cancellationReason: null,
      effect: `Temperament difference (${ganaNames[0]} + ${ganaNames[1]}) may create friction over time.`,
      remedy: 'Mutual tolerance and regular spiritual practice together can mitigate this.',
    });
  }

  return doshas;
}

// ── Resolve person data ───────────────────────────────────────────────────────
async function resolvePerson(p) {
  if (p.dob && p.lat !== undefined && p.lng !== undefined) {
    const chart = await calculateKundali(p.dob, p.tob || '12:00', parseFloat(p.lat), parseFloat(p.lng), 5.5);
    const nidx = NAKSHATRA_NAMES.indexOf(chart.nakshatra);
    return {
      nakshatraIndex: nidx < 0 ? 0 : nidx,
      moonSignIndex:  chart.moon_sign_index,
      nakshatra:      chart.nakshatra,
      moonSign:       chart.moon_sign,
      lagna:          chart.lagna,
      sunSign:        chart.sun_sign,
      nakshatraPada:  chart.nakshatra_pada,
    };
  }

  // Manual entry
  const nidx = (p.nakshatraIndex !== undefined)
    ? parseInt(p.nakshatraIndex)
    : NAKSHATRA_NAMES.indexOf(p.nakshatra);
  if (nidx < 0 || nidx > 26) throw new Error('Invalid nakshatra');

  const midx = (p.moonSignIndex !== undefined)
    ? parseInt(p.moonSignIndex)
    : NAK_SIGN[nidx];

  return {
    nakshatraIndex: nidx,
    moonSignIndex:  midx,
    nakshatra:      NAKSHATRA_NAMES[nidx],
    moonSign:       SIGNS[midx],
    lagna:          null,
    sunSign:        null,
    nakshatraPada:  null,
  };
}

// ── Main controller ───────────────────────────────────────────────────────────
async function calculate(req, res) {
  try {
    const { person1, person2 } = req.body;
    if (!person1 || !person2) {
      return res.status(400).json({ error: 'person1 and person2 are required' });
    }

    const [p1, p2] = await Promise.all([
      resolvePerson(person1).catch(e => { throw new Error('Person 1: ' + e.message); }),
      resolvePerson(person2).catch(e => { throw new Error('Person 2: ' + e.message); }),
    ]);

    const n1 = p1.nakshatraIndex, n2 = p2.nakshatraIndex;
    const m1 = p1.moonSignIndex,  m2 = p2.moonSignIndex;

    const kootResults = [
      { id:'varna',       name:'Varna',        max:1, scored:varnaScore(m1,m2),         desc:'Spiritual & ego compatibility', detail:`${VARNA_LABEL[VARNA_RANK[m1]]} + ${VARNA_LABEL[VARNA_RANK[m2]]}` },
      { id:'vasya',       name:'Vasya',         max:2, scored:vasyaScore(m1,m2),         desc:'Mutual control & attraction',   detail:`${VASYA[m1]} + ${VASYA[m2]}` },
      { id:'tara',        name:'Tara',          max:3, scored:taraScore(n1,n2),          desc:'Birth star & health',           detail:`Star ${((n2-n1+27)%27)+1} from ${p1.nakshatra}` },
      { id:'yoni',        name:'Yoni',          max:4, scored:yoniScore(n1,n2),          desc:'Temperament & physical',        detail:`${YONI[n1].a}(${YONI[n1].g}) + ${YONI[n2].a}(${YONI[n2].g})` },
      { id:'graha',       name:'Graha Maitri',  max:5, scored:grahaMaitriScore(m1,m2),   desc:'Intellectual affection',        detail:`${SIGN_LORDS[m1]} + ${SIGN_LORDS[m2]}` },
      { id:'gana',        name:'Gana',          max:6, scored:ganaScore(n1,n2),          desc:'Temperament & behaviour',       detail:`${GANA_NAMES[GANA[n1]]} + ${GANA_NAMES[GANA[n2]]}` },
      { id:'bhakoot',     name:'Bhakoot',       max:7, scored:bhakootScore(m1,m2),       desc:'Love, family & career',         detail:`${p1.moonSign}(${m1+1}) → ${p2.moonSign}(${m2+1})` },
      { id:'nadi',        name:'Nadi',          max:8, scored:nadiScore(n1,n2),          desc:'Health & progeny',              detail:`${NADI_NAMES[NADI[n1]]} + ${NADI_NAMES[NADI[n2]]}` },
    ];

    const total = kootResults.reduce((s, k) => s + k.scored, 0);
    const verdict = getVerdict(total);
    const doshas  = getDoshas(kootResults, n1, n2, m1, m2);

    res.json({
      person1: p1,
      person2: p2,
      koots:   kootResults,
      total,
      maxTotal: 36,
      percentage: Math.round((total / 36) * 100),
      verdict,
      verdictText: TIER_TEXTS[verdict.tier],
      doshas,
    });
  } catch (err) {
    console.error('[GunaMilan]', err.message);
    res.status(400).json({ error: err.message || 'Calculation failed' });
  }
}

module.exports = { calculate };
