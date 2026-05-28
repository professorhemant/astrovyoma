'use strict';
const { calculateKundali, calcKP, SIGN_LORDS } = require('../services/kundaliEngine');

const ALL_PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const DAY_LORDS   = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

const EVENT_HOUSES = {
  marriage:  { primary:[7,2,11], secondary:[1,5,8],   desc:'7th (spouse), 2nd (family), 11th (fulfillment)' },
  career:    { primary:[10,6,11], secondary:[2,3],     desc:'10th (career), 6th (service), 11th (gains)' },
  finance:   { primary:[2,11,5], secondary:[6,8,10],  desc:'2nd (wealth), 11th (income), 5th (investments)' },
  health:    { primary:[1,6,8], secondary:[12,5],     desc:'1st (body), 6th (disease), 8th (longevity)' },
  education: { primary:[4,9,5], secondary:[3,11],     desc:'4th/9th (learning), 5th (intellect)' },
  travel:    { primary:[3,9,12], secondary:[7,11],    desc:'3rd (short trips), 9th (long travel), 12th (foreign)' },
  property:  { primary:[4,11,2], secondary:[12,3],    desc:'4th (property), 11th (gains), 2nd (assets)' },
  children:  { primary:[5,11,2], secondary:[7,1],     desc:'5th (children), 11th (fulfillment)' },
  spirituality: { primary:[9,12,8], secondary:[1,4],  desc:'9th (dharma), 12th (liberation), 8th (occult)' },
};

function calcSignificators(planetaryPositions, housePlanets, houseLords) {
  const result = {};
  for (let h = 1; h <= 12; h++) {
    const sigMap = {};
    const addSig = (p, reason) => {
      if (!p) return;
      sigMap[p] = sigMap[p] || [];
      sigMap[p].push(reason);
    };

    // L1: Occupants
    (housePlanets[h] || []).forEach(p => addSig(p, `Occupant of H${h}`));

    // L2: House lord
    const hLord = houseLords[h];
    addSig(hLord, `Lord of H${h}`);

    // L3: Planets in star of occupants
    for (const occ of (housePlanets[h] || [])) {
      ALL_PLANETS.forEach(p => {
        if (planetaryPositions[p]?.nakshatra_lord === occ) addSig(p, `Star of ${occ} (occ H${h})`);
      });
    }

    // L4: Planets in star of house lord
    if (hLord) {
      ALL_PLANETS.forEach(p => {
        if (planetaryPositions[p]?.nakshatra_lord === hLord) addSig(p, `Star of ${hLord} (lord H${h})`);
      });
    }

    result[h] = { planets: Object.keys(sigMap), details: sigMap };
  }
  return result;
}

exports.analyse = async (req, res) => {
  try {
    const { dob, birth_time, lat, lng, timezone, name, event } = req.body;
    if (!dob || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'dob, lat, lng required' });
    }

    const kundali = await calculateKundali(dob, birth_time, lat, lng, timezone);
    const kpData  = calcKP(kundali.planetary_positions, kundali.house_cusps);
    const significators = calcSignificators(
      kundali.planetary_positions, kundali.house_planets, kundali.house_lords
    );

    // Ruling planets
    const today = new Date();
    const dayLord      = DAY_LORDS[today.getDay()];
    const lagnaLord    = SIGN_LORDS[kundali.lagna_sign_index];
    const lagnaStarLord = kpData?.kpCusps?.[1]?.star_lord || '';
    const moonLord     = SIGN_LORDS[kundali.moon_sign_index];
    const moonStarLord = kundali.nakshatra_lord || '';

    const seen = new Set();
    const rulingPlanets = [
      { planet: dayLord,       role: 'Day Lord' },
      { planet: lagnaLord,     role: 'Lagna Lord' },
      { planet: lagnaStarLord, role: 'Lagna Star Lord (H1 cusp)' },
      { planet: moonLord,      role: 'Moon Sign Lord' },
      { planet: moonStarLord,  role: 'Moon Star Lord' },
    ].filter(r => r.planet && !seen.has(r.planet) && seen.add(r.planet));

    // Current running dasha + antardasha
    const currentDasha = kundali.dasha_sequence?.find(d =>
      new Date(d.start) <= today && new Date(d.end) >= today
    );
    const currentAntardasha = currentDasha?.antardashas?.find(a =>
      new Date(a.start) <= today && new Date(a.end) >= today
    );

    // Event analysis
    let eventAnalysis = null;
    if (event && EVENT_HOUSES[event]) {
      const eh = EVENT_HOUSES[event];
      const allH = [...eh.primary, ...eh.secondary];

      const eventSigs = new Set();
      const hwSigs = {};
      allH.forEach(h => {
        hwSigs[h] = significators[h];
        (significators[h]?.planets || []).forEach(p => eventSigs.add(p));
      });

      const primarySigs = new Set();
      eh.primary.forEach(h => (significators[h]?.planets || []).forEach(p => primarySigs.add(p)));

      const rpMatch = rulingPlanets.filter(rp => eventSigs.has(rp.planet));
      const dashaOk = currentDasha && eventSigs.has(currentDasha.planet);
      const antarOk = currentAntardasha && eventSigs.has(currentAntardasha.planet);

      eventAnalysis = {
        event,
        houses: eh,
        house_wise_significators: hwSigs,
        all_significators: [...eventSigs],
        ruling_planets_match: rpMatch,
        promise: primarySigs.size >= 2
          ? 'Event appears well-promised in the natal chart'
          : 'Event shows limited promise — check Sub-Lord of relevant cusps',
        current_dasha: currentDasha?.planet,
        current_antardasha: currentAntardasha?.planet,
        dasha_supports: dashaOk,
        antardasha_supports: antarOk,
        timing_verdict: (dashaOk && antarOk)
          ? `Both Mahadasha (${currentDasha.planet}) and Antardasha (${currentAntardasha.planet}) signify the event — favorable period`
          : dashaOk
            ? `Mahadasha of ${currentDasha.planet} supports this — wait for a favorable Antardasha`
            : 'Current dasha period does not primarily signify this event — timing may shift',
      };
    }

    res.json({
      name: name || 'Native',
      dob,
      birth_time,
      lagna: kundali.lagna,
      lagna_sign_index: kundali.lagna_sign_index,
      moon_sign: kundali.moon_sign,
      nakshatra: kundali.nakshatra,
      nakshatra_lord: kundali.nakshatra_lord,
      ayanamsha: kundali.ayanamsha,
      planetary_positions: kundali.planetary_positions,
      house_planets: kundali.house_planets,
      house_lords: kundali.house_lords,
      kp_planets: kpData?.kpPlanets || {},
      kp_cusps: kpData?.kpCusps || {},
      significators,
      ruling_planets: rulingPlanets,
      current_dasha: currentDasha || null,
      current_antardasha: currentAntardasha || null,
      event_analysis: eventAnalysis,
    });
  } catch (err) {
    console.error('[kpController.analyse]', err);
    res.status(500).json({ error: 'KP analysis failed', details: err.message });
  }
};
