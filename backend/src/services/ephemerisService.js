let sweph;
let useSweph = false;

try {
  sweph = require('sweph');
  useSweph = true;
} catch (e) {
  console.warn('sweph not available, using JS fallback astronomy calculations');
}

const SE_SUN = 0, SE_MOON = 1, SE_MERCURY = 2, SE_VENUS = 3, SE_MARS = 4;
const SE_JUPITER = 5, SE_SATURN = 6, SE_MEAN_NODE = 11;
const SE_FLG_SWIEPH = 2, SE_FLG_SPEED = 256, SE_FLG_SIDEREAL = 64 * 1024;
const SE_SIDM_LAHIRI = 1;

const PLANETS = [
  { id: SE_SUN, name: 'Sun', symbol: '☉' },
  { id: SE_MOON, name: 'Moon', symbol: '☽' },
  { id: SE_MARS, name: 'Mars', symbol: '♂' },
  { id: SE_MERCURY, name: 'Mercury', symbol: '☿' },
  { id: SE_JUPITER, name: 'Jupiter', symbol: '♃' },
  { id: SE_VENUS, name: 'Venus', symbol: '♀' },
  { id: SE_SATURN, name: 'Saturn', symbol: '♄' },
  { id: SE_MEAN_NODE, name: 'Rahu', symbol: '☊' },
];

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const NAKSHATRA_NAMES = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

const NAKSHATRA_DATA = {
  Ashwini: { traits: ['Pioneer','Adventurous','Energetic','Impulsive'], purpose: 'To initiate, heal, and lead with speed and courage', swabhav: 'You are a natural initiator, swift in action, with healing energy. You were born to begin new ventures and inspire others through your enthusiasm.' },
  Bharani: { traits: ['Intense','Creative','Sensual','Determined'], purpose: 'To transform through discipline, creativity, and embracing life fully', swabhav: 'You carry the energy of creation and destruction. You were born to experience life deeply, create beauty, and transform through disciplined effort.' },
  Krittika: { traits: ['Sharp','Purifying','Decisive','Perfectionistic'], purpose: 'To cut through illusion and lead with clarity and inner fire', swabhav: 'Sharp intellect and inner fire define you. You were born to discern truth from illusion and nurture others with your disciplined, purifying nature.' },
  Rohini: { traits: ['Artistic','Magnetic','Sensual','Nurturing'], purpose: 'To cultivate beauty, abundance, and emotional depth', swabhav: 'You are gifted with charm and a magnetic presence. You were born to create beauty, build lasting foundations, and nurture those you love.' },
  Mrigashira: { traits: ['Curious','Gentle','Searching','Adaptable'], purpose: 'To seek knowledge, beauty, and spiritual truth through exploration', swabhav: 'A restless, seeking spirit defines you. You were born to explore, learn, and guide others toward truth with your gentle intelligence.' },
  Ardra: { traits: ['Intense','Transformative','Intellectual','Destructive'], purpose: 'To transform through storms and emerge with renewed wisdom', swabhav: "You carry Rudra's storm energy. You were born to dismantle the old and create space for new growth, often through intense personal transformation." },
  Punarvasu: { traits: ['Generous','Philosophical','Optimistic','Restoring'], purpose: 'To restore hope, spread wisdom, and return light after darkness', swabhav: 'You carry the energy of renewal. You were born to restore hope, share wisdom generously, and bring people back from darkness to light.' },
  Pushya: { traits: ['Nurturing','Disciplined','Spiritual','Protective'], purpose: 'To nourish, protect, and create structures that sustain others', swabhav: 'The most nurturing of all nakshatras. You were born to provide nourishment — emotional, material, and spiritual — to your community.' },
  Ashlesha: { traits: ['Mystical','Perceptive','Intense','Strategic'], purpose: 'To master hidden knowledge and transform through depth of perception', swabhav: 'You see what others cannot. You were born to understand hidden truths, work with subtle energies, and transform through deep psychological insight.' },
  Magha: { traits: ['Regal','Proud','Traditional','Ancestral'], purpose: 'To honor heritage, lead with authority, and connect past wisdom to future vision', swabhav: 'You carry the dignity of ancestors. You were born to lead, to honor tradition, and to be a bridge between your lineage and the future.' },
  'Purva Phalguni': { traits: ['Creative','Romantic','Pleasure-seeking','Artistic'], purpose: 'To create beauty, enjoy life, and inspire others through joy', swabhav: 'You carry the blessing of Venus. You were born to celebrate life, create art, and inspire joy in others through your magnetic presence.' },
  'Uttara Phalguni': { traits: ['Generous','Service-oriented','Reliable','Cooperative'], purpose: 'To serve, unite, and build lasting partnerships grounded in dharma', swabhav: 'You carry the energy of Aryaman, the divine friend. You were born to serve others, build genuine partnerships, and uphold dharmic values.' },
  Hasta: { traits: ['Skilled','Clever','Healing','Industrious'], purpose: 'To manifest healing, craft, and divine service through skillful hands', swabhav: 'Your hands carry healing power. You were born to create, craft, and heal — manifesting the divine through practical, skillful work.' },
  Chitra: { traits: ['Creative','Artistic','Independent','Stylish'], purpose: 'To create masterworks and express divine beauty in the material world', swabhav: 'You carry the artisan spirit of Vishwakarma. You were born to create beautiful, impactful works and inspire others with your unique vision.' },
  Swati: { traits: ['Independent','Diplomatic','Flexible','Wandering'], purpose: 'To seek freedom, spread ideas, and create connections across boundaries', swabhav: 'Like a blade of grass in the wind, you are resilient and adaptable. You were born to build bridges between worlds and spread wisdom freely.' },
  Vishakha: { traits: ['Goal-oriented','Intense','Determined','Competitive'], purpose: 'To achieve, transform, and lead through unwavering purpose', swabhav: 'You carry the fire of Indra and Agni. You were born with a burning ambition and the will to achieve your divine purpose despite all obstacles.' },
  Anuradha: { traits: ['Devoted','Friendly','Spiritually-inclined','Disciplined'], purpose: 'To build sacred friendships and walk the path of devotion and discipline', swabhav: 'Mithra guides you toward sacred friendship and loyalty. You were born to build deep bonds, remain devoted to your path, and uplift your community.' },
  Jyeshtha: { traits: ['Protective','Leadership','Courageous','Eldest'], purpose: 'To protect, lead, and bear responsibility with wisdom and courage', swabhav: 'Indra, king of gods, rules your nakshatra. You were born to be the protector and leader, carrying the weight of responsibility with dignity.' },
  Mula: { traits: ['Investigative','Destructive-creative','Philosophical','Seeking'], purpose: 'To uproot and transform, destroying the false to reveal the eternal', swabhav: 'Nirrti, goddess of dissolution, empowers you. You were born to dig to the root of all things, destroying what is false and revealing deep truths.' },
  'Purva Ashadha': { traits: ['Invincible','Proud','Philosophical','Expansive'], purpose: 'To invigorate, purify, and lead others toward victory', swabhav: 'Apah, the cosmic waters, flow through you. You were born to purify, invigorate, and lead — your energy is indomitable and life-giving.' },
  'Uttara Ashadha': { traits: ['Principled','Victorious','Leadership','Ethical'], purpose: 'To achieve lasting victory through righteousness and universal principles', swabhav: 'The Vishvadevas bless you with universal principles. You were born to achieve lasting victory through ethics, righteousness, and broad vision.' },
  Shravana: { traits: ['Listening','Learning','Connected','Compassionate'], purpose: 'To listen, learn, and connect the teachings of the cosmos with humanity', swabhav: 'Vishnu, the sustainer, blesses your path. You were born to listen deeply, learn from all of life, and transmit wisdom to those around you.' },
  Dhanishtha: { traits: ['Wealthy','Musical','Generous','Ambitious'], purpose: 'To create abundance, inspire through rhythm, and demonstrate cosmic law', swabhav: 'The Ashta Vasus bless you with the gift of rhythm and abundance. You were born to manifest wealth, create music, and demonstrate divine law through action.' },
  Shatabhisha: { traits: ['Healing','Independent','Secretive','Scientific'], purpose: 'To heal, discover hidden truths, and walk the path of the mystical healer', swabhav: 'Varuna, lord of cosmic law, guides you. You were born to uncover hidden truths, heal deep wounds, and walk the solitary path of the mystic healer.' },
  'Purva Bhadrapada': { traits: ['Intense','Transformative','Philosophical','Spiritual'], purpose: 'To transcend the material and serve the higher cosmic order', swabhav: 'Aja Ekapad, the one-footed god, gives you cosmic fire. You were born to transcend ordinary life and serve a higher spiritual purpose with fierce devotion.' },
  'Uttara Bhadrapada': { traits: ['Wise','Compassionate','Depth','Spiritual'], purpose: 'To bring depth, compassion, and cosmic wisdom to those in need', swabhav: 'Ahir Budhnya, the serpent of the deep, grants you profound depth. You were born to understand life at its deepest level and guide others with compassion.' },
  Revati: { traits: ['Nourishing','Creative','Spiritual','Completing'], purpose: 'To complete cycles, nourish souls, and guide beings toward liberation', swabhav: 'Pushan, the cosmic shepherd, guides you. You were born to nourish and complete — bringing all beings safely to their destination with love and care.' }
};

const DEFAULT_NAKSHATRA = {
  traits: ['Wise','Intuitive','Purposeful','Spiritual'],
  purpose: 'To walk a path of dharmic service and inner wisdom',
  swabhav: 'You carry deep cosmic purpose. Your life is guided by inner wisdom and a calling to serve others with your unique gifts.'
};

function dateToJulianDay(year, month, day, hour, min, sec) {
  if (useSweph) {
    return sweph.julday(year, month, day, hour + min / 60 + sec / 3600, 1); // 1 = SE_GREG_CAL
  }
  // Fallback Julian Day calculation
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn - 0.5 + (hour + min / 60 + sec / 3600) / 24;
}

function getSignFromDegree(degree) {
  return ZODIAC_SIGNS[Math.floor(((degree % 360) + 360) % 360 / 30)];
}

function getNakshatraFromMoon(moonDegree) {
  const normalized = ((moonDegree % 360) + 360) % 360;
  const nakshatraSize = 360 / 27;
  const idx = Math.floor(normalized / nakshatraSize);
  const pada = Math.floor((normalized % nakshatraSize) / (nakshatraSize / 4)) + 1;
  return {
    name: NAKSHATRA_NAMES[idx] || 'Ashwini',
    lord: NAKSHATRA_LORDS[idx] || 'Ketu',
    pada: Math.min(pada, 4),
    index: idx
  };
}

const TOTAL_DASHA_YEARS = 120; // sum of all 9 planet dasha years
const msPerYear = 365.25 * 24 * 3600 * 1000;

function calculateAntardashas(mahaLordIdx, mahaYears, mahaStart) {
  const antardashas = [];
  let cur = new Date(mahaStart);
  for (let j = 0; j < 9; j++) {
    const antarPlanet = DASHA_ORDER[(mahaLordIdx + j) % 9];
    const antarMs = (mahaYears * DASHA_YEARS[antarPlanet] / TOTAL_DASHA_YEARS) * msPerYear;
    const antarStart = new Date(cur);
    const antarEnd = new Date(cur.getTime() + antarMs);
    antardashas.push({
      planet: antarPlanet,
      start: antarStart.toISOString().split('T')[0],
      end: antarEnd.toISOString().split('T')[0],
    });
    cur = antarEnd;
  }
  return antardashas;
}

function calculateDashas(nakshatra, birthDate, moonDegree) {
  const lord = nakshatra.lord;
  const lordIdx = DASHA_ORDER.indexOf(lord);
  const nakshatraSize = 360 / 27;
  const moonInNakshatra = ((moonDegree % 360) + 360) % 360 - nakshatra.index * nakshatraSize;
  const completedFraction = Math.max(0, Math.min(1, moonInNakshatra / nakshatraSize));
  const completedYears = DASHA_YEARS[lord] * completedFraction;

  const dashas = [];
  let currentDate = new Date(new Date(birthDate).getTime() - completedYears * msPerYear);

  for (let i = 0; i < 9; i++) {
    const dashaPlanet = DASHA_ORDER[(lordIdx + i) % 9];
    const mahaYears = DASHA_YEARS[dashaPlanet];
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate.getTime() + mahaYears * msPerYear);
    const antardashas = calculateAntardashas((lordIdx + i) % 9, mahaYears, startDate);
    dashas.push({
      planet: dashaPlanet,
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      years: mahaYears,
      antardashas,
    });
    currentDate = endDate;
  }
  return dashas;
}

// Pure JS fallback planetary positions (simplified but functional for demo)
function calcPlanetFallback(jd, planetId) {
  // Simplified mean motion calculations (approximate)
  const J2000 = 2451545.0;
  const T = (jd - J2000) / 36525;
  const LAHIRI_AYANAMSA = 23.85 + (T * 50.3 / 3600); // approximate

  const meanMotions = {
    [SE_SUN]: { L0: 280.46646, rate: 36000.76983 },
    [SE_MOON]: { L0: 218.3165, rate: 481267.8813 },
    [SE_MERCURY]: { L0: 252.2509, rate: 149472.6674 },
    [SE_VENUS]: { L0: 181.9798, rate: 58517.8157 },
    [SE_MARS]: { L0: 355.433, rate: 19140.2993 },
    [SE_JUPITER]: { L0: 34.351519, rate: 3034.9057 },
    [SE_SATURN]: { L0: 50.077444, rate: 1222.1138 },
    [SE_MEAN_NODE]: { L0: 125.04452, rate: -1934.136261 }
  };

  const motion = meanMotions[planetId] || meanMotions[SE_SUN];
  let longitude = motion.L0 + motion.rate * T;
  longitude = ((longitude % 360) + 360) % 360;

  // Apply ayanamsa for sidereal
  longitude = ((longitude - LAHIRI_AYANAMSA) % 360 + 360) % 360;

  return { longitude, speed: motion.rate / 36525 };
}

function calcHousesFallback(jd, lat, lng) {
  const J2000 = 2451545.0;
  const T = (jd - J2000) / 36525;
  const LAHIRI_AYANAMSA = 23.85 + (T * 50.3 / 3600);

  // Sidereal time
  let GMST = 280.46061837 + 360.98564736629 * (jd - J2000);
  GMST = ((GMST % 360) + 360) % 360;
  const LST = ((GMST + lng) % 360 + 360) % 360;

  // Ascendant calculation (simplified)
  const latRad = lat * Math.PI / 180;
  const RAMC = LST;
  const eps = 23.439 - 0.013 * T; // obliquity
  const epsRad = eps * Math.PI / 180;
  const ramcRad = RAMC * Math.PI / 180;

  let ascRad = Math.atan2(Math.cos(ramcRad), -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad)));
  let asc = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;
  asc = ((asc - LAHIRI_AYANAMSA) % 360 + 360) % 360;

  const cusps = { 1: asc };
  for (let i = 2; i <= 12; i++) {
    cusps[i] = ((asc + (i - 1) * 30) % 360 + 360) % 360;
  }

  return { cusps, ascendant: asc };
}

function getLagnaTraits(lagna) {
  const traits = {
    Aries: { traits: ['Dynamic','Courageous','Independent','Impulsive'], swabhav: 'Your Aries ascendant gives you a pioneering spirit and natural leadership — you thrive when blazing new trails.' },
    Taurus: { traits: ['Patient','Reliable','Sensual','Stubborn'], swabhav: 'Your Taurus ascendant gives you extraordinary persistence and a gift for building lasting beauty and security.' },
    Gemini: { traits: ['Adaptable','Communicative','Curious','Restless'], swabhav: 'Your Gemini ascendant gives you a quick, versatile mind and the gift of connecting ideas and people effortlessly.' },
    Cancer: { traits: ['Intuitive','Nurturing','Emotional','Protective'], swabhav: 'Your Cancer ascendant gives you deep empathy and the gift of creating emotional safety for those around you.' },
    Leo: { traits: ['Generous','Creative','Confident','Dramatic'], swabhav: 'Your Leo ascendant gives you natural charisma and a generous heart — you were born to shine and uplift others.' },
    Virgo: { traits: ['Analytical','Precise','Service-oriented','Critical'], swabhav: 'Your Virgo ascendant gives you exceptional discernment and a drive to serve — you improve everything you touch.' },
    Libra: { traits: ['Harmonious','Diplomatic','Aesthetic','Indecisive'], swabhav: 'Your Libra ascendant gives you a gift for balance and beauty — you were born to create harmony and lasting partnerships.' },
    Scorpio: { traits: ['Intense','Transformative','Perceptive','Secretive'], swabhav: 'Your Scorpio ascendant gives you profound depth and power — you transform everything you encounter.' },
    Sagittarius: { traits: ['Optimistic','Philosophical','Freedom-loving','Blunt'], swabhav: 'Your Sagittarius ascendant gives you boundless optimism and a love of truth — you were born to inspire and expand horizons.' },
    Capricorn: { traits: ['Ambitious','Disciplined','Practical','Reserved'], swabhav: 'Your Capricorn ascendant gives you mountain-climber determination — you build empires through patience and disciplined effort.' },
    Aquarius: { traits: ['Innovative','Humanitarian','Independent','Eccentric'], swabhav: 'Your Aquarius ascendant gives you a visionary mind and a heart for humanity — you were born to change the world.' },
    Pisces: { traits: ['Intuitive','Compassionate','Dreamy','Spiritual'], swabhav: 'Your Pisces ascendant gives you boundless compassion and spiritual depth — you were born to dissolve boundaries and heal souls.' }
  };
  return traits[lagna] || { traits: ['Spiritual','Wise','Purposeful'], swabhav: 'You carry deep cosmic purpose.' };
}

async function calculateKundali(dob, birth_time, lat, lng, timezone) {
  try {
    const [year, month, day] = dob.split('-').map(Number);
    const [hour, min] = (birth_time || '12:00').split(':').map(Number);
    const tzOffset = timezone !== undefined ? parseFloat(timezone) : 5.5;
    const utcHour = hour - tzOffset;

    const jd = dateToJulianDay(year, month, day, utcHour, min, 0);

    let planetaryPositions = {};
    let houseCusps = {};
    let ascDeg;

    if (useSweph) {
      try {
        sweph.set_sid_mode(SE_SIDM_LAHIRI, 0, 0);
        // Get ayanamsa for this JD to apply to house cusps
        const ayanamsa = sweph.get_ayanamsa_ut(jd);
        const flagSidereal = SE_FLG_SWIEPH | SE_FLG_SIDEREAL | SE_FLG_SPEED;

        for (const planet of PLANETS) {
          const result = sweph.calc_ut(jd, planet.id, flagSidereal);
          // sweph npm returns { data: [lon, lat, dist, speed, ...], flag, error }
          const rawDeg = result.data ? result.data[0] : result.longitude;
          const speed  = result.data ? result.data[3] : (result.longitudeSpeed ?? 0);
          const degree = ((rawDeg % 360) + 360) % 360;
          planetaryPositions[planet.name] = {
            degree: parseFloat(degree.toFixed(4)),
            sign: getSignFromDegree(degree),
            sign_degree: parseFloat((degree % 30).toFixed(2)),
            retrograde: speed < 0,
            symbol: planet.symbol
          };
        }

        // Use Whole Sign houses (standard for Vedic astrology)
        const housesResult = sweph.houses(jd, lat, lng, 'W');
        // sweph npm returns { data: { houses: [...], points: [...] } }
        const rawCusps = housesResult.data ? housesResult.data.houses : housesResult.cusps;
        const rawAsc   = housesResult.data ? housesResult.data.points[0] : (housesResult.ascmc ? housesResult.ascmc[0] : housesResult.ascendant);

        // Apply ayanamsa to tropical house cusps to get sidereal
        for (let i = 1; i <= 12; i++) {
          const tropDeg = rawCusps[i - 1];
          const cuspDeg = (((tropDeg - ayanamsa) % 360) + 360) % 360;
          houseCusps[`H${i}`] = { degree: parseFloat(cuspDeg.toFixed(2)), sign: getSignFromDegree(cuspDeg) };
        }
        ascDeg = (((rawAsc - ayanamsa) % 360) + 360) % 360;
      } catch (swephErr) {
        useSweph = false;
        console.warn('sweph runtime error, falling back to JS calculations:', swephErr.message);
      }
    }

    if (!useSweph) {
      for (const planet of PLANETS) {
        const result = calcPlanetFallback(jd, planet.id);
        const degree = result.longitude;
        planetaryPositions[planet.name] = {
          degree: parseFloat(degree.toFixed(2)),
          sign: getSignFromDegree(degree),
          sign_degree: parseFloat((degree % 30).toFixed(2)),
          retrograde: result.speed < 0,
          symbol: planet.symbol
        };
      }

      const houses = calcHousesFallback(jd, lat, lng);
      for (let i = 1; i <= 12; i++) {
        const cuspDeg = houses.cusps[i];
        houseCusps[`H${i}`] = { degree: parseFloat(cuspDeg.toFixed(2)), sign: getSignFromDegree(cuspDeg) };
      }
      ascDeg = houses.ascendant;
    }

    // Add Ketu
    const rahuDeg = planetaryPositions['Rahu'].degree;
    const ketuDeg = ((rahuDeg + 180) % 360 + 360) % 360;
    planetaryPositions['Ketu'] = {
      degree: parseFloat(ketuDeg.toFixed(2)),
      sign: getSignFromDegree(ketuDeg),
      sign_degree: parseFloat((ketuDeg % 30).toFixed(2)),
      retrograde: false,
      symbol: '☋'
    };

    const lagna = getSignFromDegree(ascDeg);
    const moonDegree = planetaryPositions['Moon'].degree;
    const nakshatra = getNakshatraFromMoon(moonDegree);
    const moonSign = planetaryPositions['Moon'].sign;
    const sunSign = planetaryPositions['Sun'].sign;
    const dashaSequence = calculateDashas(nakshatra, dob, moonDegree);
    const nakshatraInfo = NAKSHATRA_DATA[nakshatra.name] || DEFAULT_NAKSHATRA;
    const lagnaTraits = getLagnaTraits(lagna);

    return {
      planetary_positions: planetaryPositions,
      house_cusps: houseCusps,
      nakshatra: nakshatra.name,
      nakshatra_pada: nakshatra.pada,
      nakshatra_lord: nakshatra.lord,
      lagna,
      lagna_degree: parseFloat(ascDeg.toFixed(4)),
      moon_sign: moonSign,
      sun_sign: sunSign,
      dasha_sequence: dashaSequence,
      personality_traits: {
        nakshatra_traits: nakshatraInfo.traits,
        lagna_traits: lagnaTraits.traits,
        combined_traits: [...new Set([...nakshatraInfo.traits, ...lagnaTraits.traits])].slice(0, 6)
      },
      life_purpose: nakshatraInfo.purpose,
      swabhav: nakshatraInfo.swabhav + ' ' + lagnaTraits.swabhav
    };
  } catch (err) {
    console.error('Ephemeris calculation error:', err);
    throw new Error('Failed to calculate birth chart: ' + err.message);
  }
}

module.exports = { calculateKundali, ZODIAC_SIGNS, NAKSHATRA_NAMES };
