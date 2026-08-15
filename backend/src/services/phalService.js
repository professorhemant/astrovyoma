// The readable half of a kundali, in the language the reader asked for.
//
// The chart itself has no language — a degree is a degree — but everything
// written *about* it does, and that prose is what most people actually come to
// read. The Hindi for it has existed since the Hindi PDF was built
// (services/hindiContent.js, and it is authored rather than translated), but it
// could only ever be reached by downloading a PDF. Nothing on the site could
// show a word of it.
//
// This assembles those blocks into one shape the page can render, so the page
// does not need to know which language it is holding.
//
// Two rules govern what comes out:
//
//   Nothing is invented. Where Hindi exists for a section it is used; where it
//   does not, the field is simply absent and the page falls back to its own
//   English. A half-Hindi report is honest. Machine-translated astrology is not,
//   and this is a domain where a confidently wrong sentence about somebody's
//   marriage or health is worse than an English one.
//
//   Hindi is not a subset. The Hindi lagna reading carries seventeen fields
//   where the English carries four — body, nature, strengths, challenges,
//   dharma, health, character, fortune, way of life, work, business, interests,
//   love, wealth, education. A Hindi reader gets more, not less, so the extras
//   are passed through under `more` rather than thrown away to match English.

const H = require('./hindiContent');
const { NAKSHATRA_DOMAINS_HINDI } = require('../data/nakshatraDomainsHindi');

// The four the English page already lays out, mapped onto their Hindi
// counterparts, and everything else offered underneath.
const LAGNA_MAIN = {
  appearance:  'sharir',
  personality: 'svabhav',
  nature:      'charitra',
  health:      'swasthya',
};

const LAGNA_MORE = [
  ['bal',          'बल — शक्तियाँ'],
  ['chunauti',     'चुनौतियाँ'],
  ['dharma',       'धर्म व स्वभावगत प्रवृत्ति'],
  ['saubhagya',    'सौभाग्य'],
  ['jeevan_shaili','जीवन शैली'],
  ['rozgar',       'रोज़गार'],
  ['vyavsay',      'व्यवसाय'],
  ['ruchi',        'रुचियाँ'],
  ['prem',         'प्रेम व दाम्पत्य'],
  ['vitta',        'वित्त'],
  ['shiksha',      'शिक्षा'],
];

const clean = (o) => {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null && v !== '') out[k] = v;
  return Object.keys(out).length ? out : undefined;
};

function hindiPhal(chart) {
  const lagna     = chart.lagna?.sign || chart.lagna;
  const moonSign  = chart.moon_sign;
  const sunSign   = chart.sun_sign;
  const nakshatra = chart.nakshatra;
  const dashaPlanet = chart.dasha_balance?.planet
    || chart.vimshottari_dasha?.find(d => d.current)?.planet
    || chart.current_mahadasha?.planet;

  const L = H.LAGNA_HINDI[lagna];
  const D = dashaPlanet ? H.DASHA_HINDI[dashaPlanet] : null;

  return clean({
    lang: 'hi',

    lagna: L && clean({
      title:       L.title,
      rashi:       L.rashi,
      // Headings for the four the English page lays out. Without these the
      // section printed Hindi paragraphs under English headings, while the
      // extra readings below carried Hindi headings — one section, two
      // conventions.
      headings: {
        appearance:  'शरीर व स्वरूप',
        personality: 'स्वभाव व व्यक्तित्व',
        nature:      'चरित्र व प्रवृत्ति',
        health:      'स्वास्थ्य',
      },
      appearance:  L[LAGNA_MAIN.appearance],
      personality: L[LAGNA_MAIN.personality],
      nature:      L[LAGNA_MAIN.nature],
      health:      L[LAGNA_MAIN.health],
      more: LAGNA_MORE
        .map(([key, label]) => (L[key] ? { label, text: L[key] } : null))
        .filter(Boolean),
    }),

    // Character from the Hindi that shipped with the site; career, education and
    // family from data/nakshatraDomainsHindi.js, which was written to fill the
    // gap where a Hindi report used to fall back to English mid-page.
    nakshatra: clean({
      headings: {
        nature:    'स्वभाव व चरित्र',
        career:    'रोज़गार व आजीविका',
        education: 'शिक्षा',
        family:    'पारिवारिक जीवन',
      },
      nature:    H.NAKSHATRA_HINDI[nakshatra],
      career:    NAKSHATRA_DOMAINS_HINDI[nakshatra]?.rozgar,
      education: NAKSHATRA_DOMAINS_HINDI[nakshatra]?.shiksha,
      family:    NAKSHATRA_DOMAINS_HINDI[nakshatra]?.parivar,
    }),

    // The dasha reading, plus the three domain readings that happen to be
    // keyed by the same planet.
    dasha: D && clean({
      planet:    dashaPlanet,
      title:     D.nama,
      reading:   D.reading,
      career:    H.PLANET_CAREER_HINDI[dashaPlanet],
      wealth:    H.PLANET_VITTA_HINDI[dashaPlanet],
      education: H.PLANET_VIDYA_HINDI[dashaPlanet],
    }),

    moon: clean({ reading: H.MOON_HINDI[moonSign], domains: H.MOON_DOMAIN_HINDI[moonSign] }),
    sun:  H.SUN_HINDI[sunSign] ? { reading: H.SUN_HINDI[sunSign] } : undefined,

    // Whether these apply is the chart's business, decided on the page as it
    // already is; both sides are sent so it can say either.
    kaal_sarp:    clean({ ...H.KALSARP_HINDI }),
    sade_sati:    clean({ ...H.SADE_SATI_HINDI }),
    mangal_dosha: clean({ ...H.MANGAL_DOSHA_HINDI }),

    labels: H.LABELS_HINDI,
  });
}

// English needs nothing assembled: the page has always carried its own, and
// returning undefined keeps that path byte-for-byte what it was.
function getPhal(chart, lang) {
  if (lang !== 'hi') return undefined;
  try {
    return hindiPhal(chart);
  } catch (err) {
    console.error('[phal] hindi assembly failed:', err.message);
    return undefined;
  }
}

module.exports = { getPhal };
