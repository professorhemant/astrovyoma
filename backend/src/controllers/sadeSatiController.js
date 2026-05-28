'use strict';

const { calculateKundali } = require('../services/kundaliEngine');

// ── Pure math helpers (same fallback as kundaliEngine, no dep needed) ─────────
const J2000 = 2451545.0;
function norm360(x) { return ((x % 360) + 360) % 360; }
function julDay(y, m, d) {
  const a = Math.floor((14-m)/12), yr = y+4800-a, mo = m+12*a-3;
  return d + Math.floor((153*mo+2)/5) + 365*yr + Math.floor(yr/4)
    - Math.floor(yr/100) + Math.floor(yr/400) - 32045;
}
function getSaturnLon(y, m, d) {
  const jd = julDay(y, m, d) + 0.5;
  const T = (jd - J2000) / 36525;
  const ayanamsa = 23.85 + T * 50.3 / 3600;
  return norm360(50.077444 + 1222.1138 * T - ayanamsa);
}
function getSaturnSign(y, m, d) { return Math.floor(getSaturnLon(y, m, d) / 30); }

// Convert Julian Day Number back to Gregorian calendar date
function jdToDate(jd) {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const dd = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * dd / 4);
  const mp = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * mp + 2) / 5) + 1,
    m: mp + 3 - 12 * Math.floor(mp / 10),
    y: 100 * b + dd - 4800 + Math.floor(mp / 10),
  };
}

// ── Pre-compute Saturn Rashi transitions 1940 → 2075 (every 15 days) ─────────
const SATURN_TRANSITIONS = (() => {
  const trans = [];
  let prev = -1;
  let y = 1940, m = 1, d = 1;
  const endJD = julDay(2075, 1, 1);
  while (julDay(y, m, d) < endJD) {
    const sign = getSaturnSign(y, m, d);
    if (sign !== prev) {
      if (trans.length) trans[trans.length-1].end = { y, m, d };
      trans.push({ start: { y, m, d }, end: null, sign });
      prev = sign;
    }
    // advance 15 days using correct JD → Gregorian conversion
    const next = jdToDate(julDay(y, m, d) + 15);
    y = next.y; m = next.m; d = next.d;
  }
  if (trans.length) trans[trans.length-1].end = { y: 2075, m: 1, d: 1 };
  return trans;
})();

// ── Static data ────────────────────────────────────────────────────────────────
const RASHI = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या',
                  'तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
const RASHI_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
                     'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

const INTENSITY = [8, 5, 6, 9, 8, 5, 4, 9, 7, 3, 3, 6]; // 0=Aries…11=Pisces

const SIGN_EFFECTS = {
  0:  { summary:'Career disruptions, unexpected expenses, health vigilance for self and parents. Mars-Saturn conflict creates tension, but great spiritual growth is possible.',
        phase1:'Expenses rise, foreign travel or relocation likely. Spiritual inclinations deepen. Sleep disturbances possible.',
        phase2:'Career upheaval and authority conflicts at peak. Test of willpower and self-assertion. Major transformation if embraced consciously.',
        phase3:'Gradual stabilization. Financial matters improve. Hard lessons become wisdom.' },
  1:  { summary:'Relationship adjustments, financial restructuring, health vigilance. Moderate due to Venus-Saturn friendship.',
        phase1:'Property matters and domestic expenses increase. Family dynamics shift.',
        phase2:'Business partnerships tested. Throat and throat-related health issues. Income restructuring.',
        phase3:'Venus-Saturn cooperation brings slow but steady financial recovery.' },
  2:  { summary:'Mental stress, communication challenges, sibling tensions, career changes. Mercury-Saturn interaction creates anxiety.',
        phase1:'Travel disruptions, communication confusion. Chest and respiratory vigilance.',
        phase2:'Work environment pressures peak. Intellectual restlessness. Siblings may need support.',
        phase3:'Mental clarity returns. New career direction solidifies.' },
  3:  { summary:'One of the most intense Sade Satis. Family disputes, mother\'s health, property litigation, emotional turbulence.',
        phase1:'Foreign stays or isolation. Expenses on hidden matters. Feet and digestion watchfulness.',
        phase2:'Most challenging phase. Family disputes, real estate problems, career instability. Deep emotional cleansing.',
        phase3:'Emotional healing begins. Property matters resolve. Career stabilizes.' },
  4:  { summary:'Challenges to ego, authority conflicts, career setbacks, father\'s health. Sun-Saturn enmity intensifies this cycle.',
        phase1:'Political and social status pressures. Heart and spine health vigilance.',
        phase2:'Ego tests at peak. Authority conflicts and career challenges. Hidden strengths emerge through adversity.',
        phase3:'Gradual return of recognition. New identity forms from transformed ego.' },
  5:  { summary:'Moderate impact. Health vigilance, work pressures, intestinal health. Saturn is somewhat comfortable in Mercury-ruled signs.',
        phase1:'Work overload begins. Debt management needed. Service-sector challenges.',
        phase2:'Health issues may peak, especially digestion. Demanding work period. Saturn rewards diligence.',
        phase3:'Health improves. Work recognition arrives. Financial recovery gains pace.' },
  6:  { summary:'Mildest Sade Sati — Saturn is exalted in Libra. Relationship restructuring, legal matters, balanced transformation.',
        phase1:'Partnership reviews. Hospitalization risk minimal. Spiritual practices beneficial.',
        phase2:'Despite exaltation, legal matters and partnership tests occur. But outcomes are more just and balanced.',
        phase3:'Relationships stabilize on new honest foundations. Social reputation recovers.' },
  7:  { summary:'Very intense. Secret enemies, accidents, chronic health issues, inheritance disputes. Saturn and Mars are enemies.',
        phase1:'Mysterious expenses, hidden opponents active. Occult experiences increase.',
        phase2:'Most challenging phase — accidents, surgeries, or major health events possible. Profound spiritual depth emerges.',
        phase3:'Recovery after storm. Occult and research abilities peak. Transformation complete.' },
  8:  { summary:'Loss of status, long journeys, philosophical questioning, guru-related challenges. Jupiter-Saturn are natural adversaries.',
        phase1:'Long travels, foreign connections shift. Higher education disruptions.',
        phase2:'Status and philosophical beliefs severely tested. Religious disillusionment possible but truth-seeking deepens.',
        phase3:'New wisdom integrated. Status slowly rebuilds on more authentic foundations.' },
  9:  { summary:'Milder impact — own sign. Career solidification through hard work, structural life changes, karmic debts repaid.',
        phase1:'Professional review begins. Old structures show cracks. Preparation for transformation.',
        phase2:'Demanding but productive. Saturn in own sign rewards discipline with career achievements.',
        phase3:'Harvest of efforts. Career peaks after sustained discipline.' },
  10: { summary:'Mildest possible — own sign. Social network transformation, humanitarian work, old associations released.',
        phase1:'Community and friendship realignments begin. Long-term goals reviewed.',
        phase2:'Social world restructures. Old friendships may end; truer connections form.',
        phase3:'New social network built on authentic values. Progressive goals clarify.' },
  11: { summary:'Emotional turbulence, spiritual awakening, hidden matters surface, ashram or hospital stays possible.',
        phase1:'Expenses and losses begin. Hidden enemies may surface. Feet health vigilance.',
        phase2:'Isolation and introspection peak. Spiritual transformation at its deepest. Surrender brings liberation.',
        phase3:'Spiritual insights integrate into daily life. Recovery and renewal.' },
};

const PHASE_GENERAL = {
  1: {
    name:'Rising Phase (Pehla Saadhesaati)',
    desc:'Saturn transits the sign just before your Moon sign (12th house from Moon). Increased expenses, mental restlessness, possible foreign travel or change of residence. Sleep issues and a pull toward spiritual practices are common. Focus on health and avoid rash financial decisions.',
    color:'orange',
  },
  2: {
    name:'Peak Phase (Madhya Saadhesaati)',
    desc:"Saturn is directly on your natal Moon sign. This is the most intense and transformative phase. Major life tests arrive — in career, relationships, or health. Delays and obstacles may feel overwhelming. However, this phase contains the deepest growth potential. Those who work with Saturn's discipline emerge profoundly transformed.",
    color:'red',
  },
  3: {
    name:'Setting Phase (Teesra Saadhesaati)',
    desc:'Saturn has moved past your Moon sign into the next sign (2nd from Moon). The storm is passing. Recovery begins — finances stabilize, health improves, relationships settle. The lessons of the past 5 years start integrating as wisdom. Early setting can still have challenges but the arc is upward.',
    color:'amber',
  },
};

const REMEDIES = [
  { icon:'🛕', text:'Visit Shani temple every Saturday. Offer mustard oil, black sesame seeds (kali til), and black cloth.' },
  { icon:'🪔', text:'Light a mustard oil (sarson ka tel) lamp under a Peepal tree on Saturday evenings, facing west.' },
  { icon:'📿', text:'Chant "ॐ शं शनैश्चराय नमः" (Om Sham Shanaishcharaya Namah) 108 times daily.' },
  { icon:'🐦', text:'Feed crows (Saturn\'s vehicle), black dogs, and the poor — especially on Saturdays.' },
  { icon:'🫘', text:'Donate black sesame, urad dal (black lentils), mustard oil, black blanket to the needy on Saturdays.' },
  { icon:'📖', text:'Read Shani Chalisa or Hanuman Chalisa every day — Hanuman is considered protective during Sade Sati.' },
  { icon:'💍', text:'Wear an iron ring on the middle finger of your right hand (after proper astrological consultation).' },
  { icon:'🧘', text:'Maintain Saturday fasts — eat only once, avoid non-vegetarian food and alcohol during the transit.' },
  { icon:'💠', text:'Blue Sapphire (Neelam) — consult a qualified astrologer before wearing. When suitable, it greatly mitigates Saturn\'s harshness.' },
  { icon:'🙏', text:'Perform Shani Shanti Puja with a learned priest for deeper karmic relief.' },
];

// ── Helper: find Sade Sati & Dhaiya periods for a given Moon sign ─────────────
function findPeriods(moonIdx) {
  const ssPhaseSigns = [
    { sign: (moonIdx + 11) % 12, phase: 1 },  // 12th from Moon
    { sign: moonIdx,             phase: 2 },  // Moon sign
    { sign: (moonIdx + 1)  % 12, phase: 3 },  // 2nd from Moon
  ];
  const dhaiyaSigns = [(moonIdx + 3) % 12, (moonIdx + 7) % 12]; // 4th & 8th

  // Group contiguous SS transitions into Sade Sati cycles
  const ssRaw = SATURN_TRANSITIONS.filter(t => ssPhaseSigns.some(p => p.sign === t.sign))
    .map(t => ({
      ...t,
      phase: ssPhaseSigns.find(p => p.sign === t.sign)?.phase,
    }));

  // Merge into complete Sade Sati cycles (groups of ~3 consecutive phase periods)
  const cycles = [];
  let current = null;
  for (const seg of ssRaw) {
    if (!current) {
      current = { start: seg.start, end: seg.end, phases: [seg], phase: seg.phase };
    } else {
      // Check if this segment is a continuation (starts within 1 year of previous end)
      const prevEndJD = julDay(current.end.y, current.end.m, current.end.d);
      const thisStartJD = julDay(seg.start.y, seg.start.m, seg.start.d);
      if (thisStartJD - prevEndJD < 400) {
        current.phases.push(seg);
        current.end = seg.end;
        if (seg.phase === 2) current.peakStart = seg.start;
      } else {
        cycles.push(current);
        current = { start: seg.start, end: seg.end, phases: [seg], phase: seg.phase };
      }
    }
  }
  if (current) cycles.push(current);

  const dhaiyaPeriods = SATURN_TRANSITIONS
    .filter(t => dhaiyaSigns.includes(t.sign))
    .map(t => ({ ...t, type: t.sign === dhaiyaSigns[0] ? 'Dhaiya (4th)' : 'Dhaiya (8th)' }));

  return { cycles, dhaiyaPeriods };
}

function dateStrFromObj(obj) {
  return `${obj.y}-${String(obj.m).padStart(2,'0')}-${String(obj.d).padStart(2,'0')}`;
}

function yearMonthDiff(startObj, endObj) {
  const months = (endObj.y - startObj.y) * 12 + (endObj.m - startObj.m);
  return { years: Math.floor(months / 12), months: months % 12 };
}

function getCurrentPhase(moonIdx, today) {
  const [ty, tm, td] = today.split('-').map(Number);
  const todayJD = julDay(ty, tm, td);
  const phaseSigns = [
    { sign: (moonIdx + 11) % 12, phase: 1 },
    { sign: moonIdx,             phase: 2 },
    { sign: (moonIdx + 1)  % 12, phase: 3 },
  ];
  const satSign = getSaturnSign(ty, tm, td);
  const match = phaseSigns.find(p => p.sign === satSign);
  if (!match) return null;

  // Find this period's end date from transitions
  const period = SATURN_TRANSITIONS.find(t => {
    const sJD = julDay(t.start.y, t.start.m, t.start.d);
    const eJD = julDay(t.end.y, t.end.m, t.end.d);
    return t.sign === satSign && sJD <= todayJD && todayJD < eJD;
  });
  if (!period) return { phase: match.phase };

  const remaining = yearMonthDiff({ y: ty, m: tm, d: td }, period.end);
  return { phase: match.phase, remaining, periodEnd: dateStrFromObj(period.end) };
}

// ── Controller ────────────────────────────────────────────────────────────────
async function calculate(req, res) {
  try {
    const { dob, birth_time, lat, lng, timezone, name } = req.body;
    if (!dob) return res.status(400).json({ error: 'Date of birth is required' });

    // Get Moon sign
    const lat2  = lat  ?? 22.5726;
    const lng2  = lng  ?? 88.3639;
    const tz2   = timezone ?? 5.5;
    const chart = await calculateKundali(dob, birth_time || '12:00', lat2, lng2, tz2);
    const moonIdx  = chart.moon_sign_index;
    const moonSign = RASHI[moonIdx];
    const moonSignHi = RASHI_HI[moonIdx];

    const today = new Date().toISOString().split('T')[0];
    const currentPhase = getCurrentPhase(moonIdx, today);
    const { cycles, dhaiyaPeriods } = findPeriods(moonIdx);

    // Find current Sade Sati cycle
    const [ty, tm, td] = today.split('-').map(Number);
    const todayJD = julDay(ty, tm, td);
    const activeCycle = cycles.find(c => {
      const sJD = julDay(c.start.y, c.start.m, c.start.d);
      const eJD = julDay(c.end.y, c.end.m, c.end.d);
      return sJD <= todayJD && todayJD < eJD;
    });

    const nextCycle = cycles.find(c => julDay(c.start.y, c.start.m, c.start.d) > todayJD);

    const pastCycles  = cycles.filter(c => julDay(c.end.y, c.end.m, c.end.d) <= todayJD).slice(-2);
    const futureCycles= cycles.filter(c => julDay(c.start.y, c.start.m, c.start.d) > todayJD).slice(0, 2);

    const activeDhaiya = dhaiyaPeriods.find(d => {
      const sJD = julDay(d.start.y, d.start.m, d.start.d);
      const eJD = julDay(d.end.y, d.end.m, d.end.d);
      return sJD <= todayJD && todayJD < eJD;
    });

    res.json({
      dob,
      name: name || null,
      moonSign,
      moonSignHi,
      moonSignIndex: moonIdx,
      moonLord: RASHI_LORDS[moonIdx],
      intensity: INTENSITY[moonIdx],
      signEffects: SIGN_EFFECTS[moonIdx],
      isActive: !!currentPhase,
      currentPhase: currentPhase
        ? { ...currentPhase, ...PHASE_GENERAL[currentPhase.phase] }
        : null,
      activeCycle: activeCycle
        ? { start: dateStrFromObj(activeCycle.start), end: dateStrFromObj(activeCycle.end), phases: activeCycle.phases.map(p => ({ ...p, start: dateStrFromObj(p.start), end: dateStrFromObj(p.end), phaseName: PHASE_GENERAL[p.phase]?.name, color: PHASE_GENERAL[p.phase]?.color })) }
        : null,
      nextSadeSati: nextCycle
        ? { start: dateStrFromObj(nextCycle.start), end: dateStrFromObj(nextCycle.end) }
        : null,
      pastCycles: pastCycles.map(c => ({ start: dateStrFromObj(c.start), end: dateStrFromObj(c.end) })),
      futureCycles: futureCycles.map(c => ({ start: dateStrFromObj(c.start), end: dateStrFromObj(c.end) })),
      dhaiya: activeDhaiya
        ? { type: activeDhaiya.type, sign: RASHI[activeDhaiya.sign], start: dateStrFromObj(activeDhaiya.start), end: dateStrFromObj(activeDhaiya.end) }
        : null,
      currentSaturnSign: RASHI[getSaturnSign(ty, tm, td)],
      currentSaturnLon: getSaturnLon(ty, tm, td).toFixed(2),
      remedies: REMEDIES,
      phaseInfo: PHASE_GENERAL,
    });
  } catch (err) {
    console.error('sadeSati error:', err);
    res.status(500).json({ error: err.message || 'Calculation failed' });
  }
}

module.exports = { calculate };
