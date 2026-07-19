// Question decomposition router.
//
// The chatbot used to dump a flat chart summary into the prompt and hope the LLM
// picked the right factors. This module does the picking deterministically:
// a question is classified into astrological domains, and each domain declares
// exactly which houses, karakas, divisional chart and dasha periods matter.
// The LLM then interprets a small, relevant slice instead of the whole chart.

const { ZODIAC_SIGNS, SIGN_LORDS, DASHA_ORDER } = require('./kundaliEngine');

// ─── DIGNITY ─────────────────────────────────────────────────────────────────
// Sign indices: 0 = Aries … 11 = Pisces.
// Rahu/Ketu are deliberately absent — classical sources disagree on their
// exaltation, so we report placement for the nodes without asserting dignity.
const DIGNITY = {
  Sun:     { exalted: 0,  debilitated: 6,  own: [4] },
  Moon:    { exalted: 1,  debilitated: 7,  own: [3] },
  Mars:    { exalted: 9,  debilitated: 3,  own: [0, 7] },
  Mercury: { exalted: 5,  debilitated: 11, own: [2, 5] },
  Jupiter: { exalted: 3,  debilitated: 9,  own: [8, 11] },
  Venus:   { exalted: 11, debilitated: 5,  own: [1, 6] },
  Saturn:  { exalted: 6,  debilitated: 0,  own: [9, 10] },
};

function getDignity(planet, signIndex) {
  const d = DIGNITY[planet];
  if (!d || signIndex == null) return null;
  if (signIndex === d.exalted) return 'exalted';
  if (signIndex === d.debilitated) return 'debilitated';
  if (d.own.includes(signIndex)) return 'own sign';
  return 'neutral';
}

// ─── DOMAIN TAXONOMY ─────────────────────────────────────────────────────────
// `varga` must name a chart the engine actually builds:
// navamsha (D-9), hora (D-2), drekkana (D-3), dashamsha (D-10), saptamsha (D-7).
// Domains whose classical varga we don't compute (D-4, D-24, D-30) use null and
// are judged from the rasi chart rather than silently reading the wrong varga.
const DOMAINS = {
  career: {
    label: 'Career & Profession',
    houses: [10, 6, 2, 11],
    karakas: ['Sun', 'Saturn', 'Mercury'],
    varga: 'dashamsha',
    vargaLabel: 'D-10 Dashamsha (career)',
    keywords: ['career', 'job', 'profession', 'work', 'promotion', 'business', 'office',
      'salary', 'employment', 'boss', 'appraisal', 'resign', 'startup', 'naukri', 'kaam',
      'vyapar', 'interview', 'transfer', 'sack', 'fired', 'layoff'],
  },
  marriage: {
    label: 'Marriage & Relationships',
    houses: [7, 2, 4, 11],
    karakas: ['Venus', 'Jupiter'],
    varga: 'navamsha',
    vargaLabel: 'D-9 Navamsha (marriage & dharma)',
    keywords: ['marriage', 'marry', 'wife', 'husband', 'spouse', 'partner', 'love',
      'relationship', 'girlfriend', 'boyfriend', 'divorce', 'separation', 'engagement',
      'shaadi', 'vivah', 'patni', 'pati', 'romance', 'affair', 'breakup', 'compatibility'],
  },
  wealth: {
    label: 'Wealth & Finance',
    houses: [2, 11, 5, 9],
    karakas: ['Jupiter', 'Venus', 'Mercury'],
    varga: 'hora',
    vargaLabel: 'D-2 Hora (wealth)',
    keywords: ['wealth', 'money', 'finance', 'income', 'debt', 'loan', 'rich', 'savings',
      'investment', 'profit', 'loss', 'gain', 'dhan', 'paisa', 'property value',
      'stock', 'earning', 'poverty', 'bankrupt'],
  },
  children: {
    label: 'Children & Progeny',
    houses: [5, 9, 2],
    karakas: ['Jupiter'],
    varga: 'saptamsha',
    vargaLabel: 'D-7 Saptamsha (progeny)',
    keywords: ['child', 'children', 'son', 'daughter', 'pregnancy', 'conceive', 'progeny',
      'baby', 'santan', 'putra', 'fertility', 'ivf', 'adoption'],
  },
  siblings: {
    label: 'Siblings & Courage',
    houses: [3, 11, 6],
    karakas: ['Mars'],
    varga: 'drekkana',
    vargaLabel: 'D-3 Drekkana (siblings)',
    keywords: ['sibling', 'brother', 'sister', 'bhai', 'behan', 'courage', 'valour'],
  },
  health: {
    label: 'Health & Vitality',
    houses: [1, 6, 8, 12],
    karakas: ['Sun', 'Saturn', 'Mars'],
    varga: null,
    vargaLabel: null,
    keywords: ['health', 'illness', 'disease', 'sick', 'surgery', 'hospital', 'body',
      'pain', 'chronic', 'recovery', 'medical', 'swasthya', 'bimari', 'accident',
      'injury', 'operation', 'diagnosis'],
  },
  education: {
    label: 'Education & Learning',
    houses: [4, 5, 9, 2],
    karakas: ['Mercury', 'Jupiter'],
    varga: 'navamsha',
    vargaLabel: 'D-9 Navamsha (higher learning)',
    keywords: ['education', 'study', 'studies', 'exam', 'college', 'university', 'degree',
      'school', 'admission', 'shiksha', 'padhai', 'course', 'phd', 'research', 'result'],
  },
  property: {
    label: 'Property, Vehicle & Home',
    houses: [4, 2, 11],
    karakas: ['Mars', 'Venus', 'Saturn'],
    varga: null,
    vargaLabel: null,
    keywords: ['property', 'house', 'home', 'land', 'flat', 'vehicle', 'car', 'plot',
      'real estate', 'makan', 'zameen', 'rent', 'construction', 'mortgage'],
  },
  spirituality: {
    label: 'Spirituality & Dharma',
    houses: [9, 12, 5, 8],
    karakas: ['Jupiter', 'Ketu', 'Saturn'],
    varga: 'navamsha',
    vargaLabel: 'D-9 Navamsha (dharma)',
    keywords: ['spiritual', 'moksha', 'meditation', 'guru', 'dharma', 'temple', 'mantra',
      'devotion', 'sadhana', 'bhakti', 'enlightenment', 'karma', 'past life', 'puja'],
  },
  travel: {
    label: 'Travel & Foreign Settlement',
    houses: [3, 9, 12, 7],
    karakas: ['Rahu', 'Moon'],
    varga: null,
    vargaLabel: null,
    keywords: ['travel', 'foreign', 'abroad', 'visa', 'immigration', 'settle', 'relocate',
      'overseas', 'videsh', 'yatra', 'migration', 'green card', 'pr'],
  },
  litigation: {
    label: 'Conflict, Litigation & Obstacles',
    houses: [6, 8, 12],
    karakas: ['Mars', 'Saturn'],
    varga: null,
    vargaLabel: null,
    keywords: ['court', 'case', 'litigation', 'lawsuit', 'enemy', 'dispute', 'legal',
      'police', 'fir', 'mukadma', 'conflict', 'fight', 'obstacle', 'rival'],
  },
  general: {
    label: 'General Life Direction',
    houses: [1, 10, 7, 4],
    karakas: ['Sun', 'Moon'],
    varga: null,
    vargaLabel: null,
    keywords: [],
  },
};

// Questions asking *when* need dasha timing; questions asking *whether* need strength.
const TIMING_KEYWORDS = ['when', 'time', 'timing', 'how long', 'until', 'soon', 'period',
  'year', 'month', 'date', 'kab', 'samay', 'duration', 'age'];

// ─── CLASSIFICATION ──────────────────────────────────────────────────────────

// Keywords must match whole words. Substring matching silently mis-routes:
// "career" contains "car" (property) and "improve" contains "pr" (travel), so a
// plain includes() sent every career question to three domains at once.
function toWordRegex(kw) {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

const KEYWORD_PATTERNS = Object.fromEntries(
  Object.entries(DOMAINS).map(([key, cfg]) => [
    key,
    cfg.keywords.map(kw => ({ kw, re: toWordRegex(kw) })),
  ])
);

const TIMING_PATTERNS = TIMING_KEYWORDS.map(toWordRegex);

function classifyQuestion(question) {
  const q = String(question || '').toLowerCase();
  const scored = [];

  for (const key of Object.keys(DOMAINS)) {
    if (key === 'general') continue;
    let score = 0;
    for (const { kw, re } of KEYWORD_PATTERNS[key]) {
      if (!re.test(q)) continue;
      // Multi-word keywords are far less likely to collide by accident.
      score += kw.includes(' ') ? 3 : 2;
    }
    if (score > 0) scored.push({ domain: key, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // Keep the leader plus anything close to it — "will marriage affect my career?"
  // is legitimately two domains and should be analysed as both.
  const top = scored.filter(s => s.score >= scored[0]?.score * 0.6).slice(0, 2);

  return {
    domains: top.length ? top.map(s => s.domain) : ['general'],
    isTimingQuestion: TIMING_PATTERNS.some(re => re.test(q)),
    matched: top.length > 0,
  };
}

// ─── DASHA HELPERS ───────────────────────────────────────────────────────────

function getCurrentDasha(kundali, onDate = new Date()) {
  const seq = kundali?.dasha_sequence || [];
  const t = onDate.getTime();

  for (const maha of seq) {
    if (t < new Date(maha.start).getTime() || t >= new Date(maha.end).getTime()) continue;
    const antar = (maha.antardashas || []).find(a =>
      t >= new Date(a.start).getTime() && t < new Date(a.end).getTime());
    return { maha, antar };
  }
  return { maha: null, antar: null };
}

// Planets that "activate" a domain: its karakas, the lords of its houses, and
// any planet actually sitting in those houses. A dasha of such a planet is when
// the domain's events tend to fire.
function getActivatingPlanets(kundali, domainKey) {
  const cfg = DOMAINS[domainKey];
  const activators = new Set(cfg.karakas);

  for (const h of cfg.houses) {
    const lord = kundali.house_lords?.[h];
    if (lord) activators.add(lord);
    for (const p of kundali.house_planets?.[h] || []) activators.add(p);
  }
  // Only Vimshottari lords can own a dasha period.
  return [...activators].filter(p => DASHA_ORDER.includes(p));
}

function findRelevantPeriods(kundali, domainKey, fromDate = new Date(), years = 8) {
  const activators = new Set(getActivatingPlanets(kundali, domainKey));
  const from = fromDate.getTime();
  const until = from + years * 365.25 * 24 * 3600 * 1000;
  const hits = [];

  for (const maha of kundali.dasha_sequence || []) {
    if (new Date(maha.end).getTime() < from) continue;
    if (new Date(maha.start).getTime() > until) break;

    for (const antar of maha.antardashas || []) {
      const aStart = new Date(antar.start).getTime();
      const aEnd = new Date(antar.end).getTime();
      if (aEnd < from || aStart > until) continue;

      const mahaHit = activators.has(maha.planet);
      const antarHit = activators.has(antar.planet);
      if (!mahaHit && !antarHit) continue;

      hits.push({
        period: `${maha.planet}/${antar.planet}`,
        start: antar.start,
        end: antar.end,
        years: antar.years,
        // Both lords relevant is a materially stronger signal than one.
        strength: mahaHit && antarHit ? 'strong' : 'moderate',
      });
    }
  }
  return hits.slice(0, 6);
}

// ─── DOMAIN ANALYSIS ─────────────────────────────────────────────────────────

function describePlanet(kundali, planet) {
  const pos = kundali.planetary_positions?.[planet];
  if (!pos) return null;
  const dignity = getDignity(planet, pos.sign_index);
  return {
    planet,
    sign: pos.sign,
    house: pos.house,
    degree: pos.sign_degree,
    nakshatra: pos.nakshatra,
    retrograde: !!pos.retrograde,
    dignity,
  };
}

function analyzeDomain(kundali, domainKey) {
  const cfg = DOMAINS[domainKey];

  const houses = cfg.houses.map(h => {
    const signIdx = (kundali.lagna_sign_index + h - 1) % 12;
    const lord = kundali.house_lords?.[h] || SIGN_LORDS[signIdx];
    return {
      house: h,
      sign: ZODIAC_SIGNS[signIdx],
      occupants: kundali.house_planets?.[h] || [],
      lord,
      lordPlacement: describePlanet(kundali, lord),
      strength: kundali.bhava_bala?.[h]?.total ?? kundali.bhava_bala?.[h] ?? null,
    };
  });

  const karakas = cfg.karakas.map(p => describePlanet(kundali, p)).filter(Boolean);

  // Varga positions only for the planets this domain actually cares about.
  let varga = null;
  if (cfg.varga && kundali.divisional_charts?.[cfg.varga]) {
    const chart = kundali.divisional_charts[cfg.varga];
    const of = [...new Set([...cfg.karakas, ...houses.map(h => h.lord)])];
    varga = {
      name: cfg.vargaLabel,
      positions: of
        .filter(p => chart[p])
        .map(p => ({ planet: p, sign: chart[p].sign })),
    };
  }

  return { domain: domainKey, label: cfg.label, houses, karakas, varga };
}

// ─── CONTEXT ASSEMBLY ────────────────────────────────────────────────────────

function fmtPlanet(p) {
  if (!p) return 'not available';
  const bits = [`${p.planet} in ${p.sign}`];
  if (p.house) bits.push(`house ${p.house}`);
  if (p.dignity && p.dignity !== 'neutral') bits.push(p.dignity);
  if (p.retrograde) bits.push('retrograde');
  return bits.join(', ');
}

function renderDomain(analysis) {
  const lines = [`### ${analysis.label}`];

  lines.push('Governing houses:');
  for (const h of analysis.houses) {
    const occ = h.occupants.length ? h.occupants.join(', ') : 'empty';
    let line = `- House ${h.house} (${h.sign}) — occupants: ${occ}; lord ${h.lord} → ${fmtPlanet(h.lordPlacement)}`;
    if (h.strength != null) line += `; bhava bala ${Number(h.strength).toFixed(1)}`;
    lines.push(line);
  }

  lines.push('Significators (karakas):');
  for (const k of analysis.karakas) lines.push(`- ${fmtPlanet(k)}`);

  if (analysis.varga && analysis.varga.positions.length) {
    lines.push(`${analysis.varga.name}:`);
    for (const v of analysis.varga.positions) lines.push(`- ${v.planet} in ${v.sign}`);
  }

  return lines.join('\n');
}

function buildFocusedContext(kundali, question, onDate = new Date()) {
  if (!kundali) {
    return {
      context: 'The user has not provided their birth details yet. Encourage them to generate their free Kundali for personalised guidance.',
      routing: null,
    };
  }

  const cls = classifyQuestion(question);
  const analyses = cls.domains.map(d => analyzeDomain(kundali, d));
  const { maha, antar } = getCurrentDasha(kundali, onDate);

  const sections = [];

  sections.push(`BIRTH CHART — CORE
- Lagna (Ascendant): ${kundali.lagna}
- Moon sign: ${kundali.moon_sign} | Sun sign: ${kundali.sun_sign}
- Nakshatra: ${kundali.nakshatra} pada ${kundali.nakshatra_pada} (lord ${kundali.nakshatra_lord})`);

  if (maha) {
    sections.push(`CURRENT DASHA
- Mahadasha: ${maha.planet} (${maha.start} → ${maha.end})
- Antardasha: ${antar ? `${antar.planet} (${antar.start} → ${antar.end})` : 'not resolved'}`);
  }

  sections.push(`QUESTION ROUTED TO: ${analyses.map(a => a.label).join(' + ')}
Analyse using the factors below. They were selected for this question — do not
substitute unrelated houses or planets.`);

  for (const a of analyses) sections.push(renderDomain(a));

  if (cls.isTimingQuestion) {
    for (const a of analyses) {
      const periods = findRelevantPeriods(kundali, a.domain, onDate);
      if (!periods.length) continue;
      sections.push(`TIMING WINDOWS — ${a.label}
Dasha periods ahead whose lords activate this area:
${periods.map(p => `- ${p.period}: ${p.start} → ${p.end} (${p.years} yrs, ${p.strength})`).join('\n')}`);
    }
  }

  return {
    context: sections.join('\n\n'),
    routing: {
      domains: cls.domains,
      labels: analyses.map(a => a.label),
      isTimingQuestion: cls.isTimingQuestion,
      matchedKeywords: cls.matched,
    },
  };
}

module.exports = {
  classifyQuestion,
  analyzeDomain,
  getCurrentDasha,
  getActivatingPlanets,
  findRelevantPeriods,
  buildFocusedContext,
  getDignity,
  DOMAINS,
};
