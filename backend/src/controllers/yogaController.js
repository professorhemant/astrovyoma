'use strict';

const { calculateKundali } = require('../services/kundaliEngine');

const ZODIAC = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
                    'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

// Exaltation sign index (0=Aries)
const EXALT = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 };
// Debilitation sign index
const DEBIL = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0 };
// Own signs for Pancha Mahapurusha planets
const OWN   = { Mars:[0,7], Mercury:[2,5], Jupiter:[8,11], Venus:[1,6], Saturn:[9,10] };

// Normalise a planet record into a consistent shape
function get(pp, name) {
  const raw = pp[name];
  if (!raw) return null;
  return { ...raw, name, longitude: raw.degree };  // longitude = ecliptic degree
}

function inK(h)  { return [1,4,7,10].includes(h); }
function inT(h)  { return [1,5,9].includes(h); }
function inKT(h) { return inK(h) || inT(h); }
function inD(h)  { return [6,8,12].includes(h); }

function isOwn(pl)    { return OWN[pl.name]?.includes(pl.sign_index) ?? false; }
function isExalt(pl)  { return EXALT[pl.name] === pl.sign_index; }
function isDebil(pl)  { return DEBIL[pl.name] === pl.sign_index; }
function isStrong(pl) { return isOwn(pl) || isExalt(pl); }

function houseFromRef(target, ref) { return ((target - ref + 12) % 12) + 1; }

function analyse(req, res) {
  const { dob, birth_time, lat, lng, timezone, name } = req.body;
  if (!dob) return res.status(400).json({ error: 'Date of birth is required' });

  calculateKundali(dob, birth_time || '12:00', lat ?? 22.57, lng ?? 88.36, timezone ?? 5.5)
    .then(chart => {
      const pp    = chart.planetary_positions;    // object keyed by planet name
      const lords = chart.house_lords;            // object keyed by '1'–'12'
      const yogas = [];

      const sun  = get(pp,'Sun'),   moon = get(pp,'Moon'),
            mars = get(pp,'Mars'),  merc = get(pp,'Mercury'),
            jup  = get(pp,'Jupiter'), ven = get(pp,'Venus'),
            sat  = get(pp,'Saturn'),  rahu = get(pp,'Rahu'),
            ketu = get(pp,'Ketu');

      function add(yName, cat, strength, desc, effects, remedies = []) {
        yogas.push({ name:yName, category:cat, strength, description:desc, effects, remedies });
      }

      // ── PANCHA MAHAPURUSHA ──────────────────────────────────────────────────
      if (mars && isStrong(mars) && inK(mars.house))
        add('Ruchaka Yoga','Pancha Mahapurusha','Very Strong',
          `Mars is in ${ZODIAC[mars.sign_index]} (own/exaltation sign) in the ${mars.house}th house (Kendra).`,
          'Exceptional physical strength, courage, and leadership. Distinction in military, police, sports, or surgery. Strong sense of justice and willpower.',
          ['Chant "Om Angarakaya Namah" 108× on Tuesdays','Wear Red Coral after astrological consultation']);

      if (merc && isStrong(merc) && inK(merc.house))
        add('Bhadra Yoga','Pancha Mahapurusha','Very Strong',
          `Mercury is in ${ZODIAC[merc.sign_index]} (own/exaltation sign) in the ${merc.house}th house (Kendra).`,
          'Exceptional intellect, eloquence, and business acumen. Success in writing, law, accounting, IT, or diplomacy.',
          ['Chant "Om Budhaya Namah" 108× on Wednesdays','Wear Emerald after consultation']);

      if (jup && isStrong(jup) && inK(jup.house))
        add('Hamsa Yoga','Pancha Mahapurusha','Very Strong',
          `Jupiter is in ${ZODIAC[jup.sign_index]} (own/exaltation sign) in the ${jup.house}th house (Kendra).`,
          'Wisdom, spiritual authority, prosperity, and benevolence. Success in philosophy, teaching, religion, law, or medicine.',
          ['Chant "Om Guruve Namah" 108× on Thursdays','Wear Yellow Sapphire after consultation']);

      if (ven && isStrong(ven) && inK(ven.house))
        add('Malavya Yoga','Pancha Mahapurusha','Very Strong',
          `Venus is in ${ZODIAC[ven.sign_index]} (own/exaltation sign) in the ${ven.house}th house (Kendra).`,
          'Great beauty, artistic talent, romantic success, and material comfort. Success in entertainment, fashion, hospitality, or arts.',
          ['Chant "Om Shukraya Namah" 108× on Fridays','Wear Diamond or White Sapphire after consultation']);

      if (sat && isStrong(sat) && inK(sat.house))
        add('Sasha Yoga','Pancha Mahapurusha','Very Strong',
          `Saturn is in ${ZODIAC[sat.sign_index]} (own/exaltation sign) in the ${sat.house}th house (Kendra).`,
          'Discipline, political power, organizational authority, and longevity. Leadership in administration, politics, or social reform through persistent effort.',
          ['Chant "Om Shanishcharaya Namah" 108× on Saturdays','Wear Blue Sapphire only after expert consultation']);

      // ── RAJA YOGAS ─────────────────────────────────────────────────────────
      if (jup && moon) {
        const jupFromMoon = houseFromRef(jup.house, moon.house);
        if (inK(jupFromMoon))
          add('Gaja Kesari Yoga','Raja Yoga','Strong',
            `Jupiter is in the ${jupFromMoon}th position from Moon (Kendra from Moon).`,
            'Intelligence, wisdom, fame, and social respect. Generous, helpful, and respected in society. Success in law, education, or public life.',
            ['Offer yellow flowers to Brihaspati on Thursdays','Recite Vishnu Sahasranama regularly']);
      }

      if (sun && merc && sun.house === merc.house) {
        const diff = Math.abs((sun.longitude - merc.longitude + 360) % 360);
        const orb  = diff > 180 ? 360 - diff : diff;
        add('Budhaditya Yoga','Raja Yoga', orb < 10 ? 'Strong' : 'Moderate',
          `Sun and Mercury are conjunct in the ${sun.house}th house (${ZODIAC[sun.sign_index]}).`,
          'Sharp intellect, excellent communication, government or political success. Combines solar authority with Mercurial intelligence.',
          ['Respect father figures','Donate books to students on Wednesdays']);
      }

      if (jup && mars && jup.house === mars.house)
        add('Guru-Mangal Yoga','Raja Yoga','Strong',
          `Jupiter and Mars are conjunct in the ${jup.house}th house.`,
          'Righteous courage and dharmic action. Success in law, ethical leadership, or purposeful entrepreneurship.',
          ['Perform Hanuman Puja on Tuesdays','Donate to soldiers\' welfare on Thursdays']);

      if (lords) {
        const l9n  = lords['9'],  l10n = lords['10'];
        const l9p  = l9n  ? get(pp, l9n)  : null;
        const l10p = l10n ? get(pp, l10n) : null;
        if (l9p && l10p) {
          const diff = Math.abs(l9p.house - l10p.house);
          if (l9p.house === l10p.house || diff === 3 || diff === 6 || diff === 9)
            add('Dharma-Karma Adhipati Yoga','Raja Yoga','Strong',
              `Lords of 9th (${l9n}) and 10th (${l10n}) are conjunct or in mutual trine/kendra aspect.`,
              'Career aligned with dharma. Success through righteous action in law, teaching, medicine, or spiritual leadership.',
              ['Perform charitable acts regularly','Choose work aligned with higher purpose']);
        }

        // Vipareeta Raja Yoga
        [['6','6'],['8','8'],['12','12']].forEach(([hNum, hKey]) => {
          const lord = lords[hNum];
          if (!lord) return;
          const lp = get(pp, lord);
          if (lp && inD(lp.house) && lp.house !== parseInt(hNum))
            add('Vipareeta Raja Yoga','Raja Yoga','Moderate',
              `Lord of ${hNum}th house (${lord}) is placed in a Dusthana (6/8/12) house.`,
              'Success comes unexpectedly, often after opponents\' downfall. Difficult circumstances convert into victories.',
              ['Trust the process during difficult periods','Practice patience and inner discipline']);
        });
      }

      // ── DHANA YOGAS ────────────────────────────────────────────────────────
      if (moon && mars && moon.house === mars.house)
        add('Chandra-Mangal Yoga','Dhana Yoga','Strong',
          `Moon and Mars are conjunct in the ${moon.house}th house.`,
          'Strong earning ability in trade, real estate, or food industry. Independent spirit and emotional drive for financial gains.',
          ['Worship Goddess Lakshmi on Fridays','Donate food on Mondays']);

      if (lords) {
        const l9n = lords['9'];
        const l9p = l9n ? get(pp, l9n) : null;
        if (l9p && isStrong(l9p) && inKT(l9p.house))
          add('Lakshmi Yoga','Dhana Yoga','Strong',
            `Lord of 9th house (${l9n}) is in its own/exaltation sign in a Kendra or Trikona.`,
            'Great wealth, fortune, and blessings of Goddess Lakshmi. Prosperity and lasting financial success.',
            ['Worship Goddess Lakshmi every Friday','Donate to temples on Fridays']);
      }

      // ── SPECIAL YOGAS ──────────────────────────────────────────────────────
      if (merc && jup && ven && inKT(merc.house) && inKT(jup.house) && inKT(ven.house))
        add('Saraswati Yoga','Special Yoga','Strong',
          `Mercury (house ${merc.house}), Jupiter (house ${jup.house}), and Venus (house ${ven.house}) are all in Kendra or Trikona houses.`,
          'Exceptional artistic, literary, and intellectual gifts. Blessings of Goddess Saraswati — mastery in arts, music, writing, or academia.',
          ['Worship Goddess Saraswati on Wednesdays','Recite Saraswati Vandana daily']);

      // ── DOSHA YOGAS ────────────────────────────────────────────────────────
      if (rahu && ketu) {
        const mainPlanets = [sun,moon,mars,merc,jup,ven,sat].filter(Boolean);
        const rahuLon = rahu.longitude;
        const span    = ((( (rahu.longitude + 180) % 360 ) - rahuLon + 360) % 360);
        const inArc   = (lon) => ((lon - rahuLon + 360) % 360) <= span;
        if (mainPlanets.length >= 5 && (
          mainPlanets.every(pl => inArc(pl.longitude)) ||
          mainPlanets.every(pl => !inArc(pl.longitude))
        ))
          add('Kaal Sarp Yoga','Dosha','Challenging',
            'All seven planets are hemmed between Rahu and Ketu.',
            'Recurring obstacles, delays, and unexpected reversals. Also grants deep focus, occult abilities, and potential for extraordinary achievement after overcoming challenges.',
            ['Perform Kaal Sarp Puja at Trimbakeshwar','Chant "Om Namah Shivaya" 108× daily','Feed serpents on Nag Panchami','Donate black sesame on Saturdays']);
      }

      if (sun && rahu && sun.house === rahu.house)
        add('Surya Grahan Yoga','Dosha','Moderate',
          `Sun and Rahu are conjunct in the ${sun.house}th house.`,
          'Confusion around identity, authority, and career path. Extreme ambition. With effort turns into powerful achievement.',
          ['Offer water to Sun daily (Surya Arghya)','Chant Aditya Hridayam','Donate to father figures']);

      if (moon && rahu && moon.house === rahu.house)
        add('Chandra Grahan Yoga','Dosha','Moderate',
          `Moon and Rahu are conjunct in the ${moon.house}th house.`,
          'Mental restlessness, vivid imagination, emotional extremes. High creative potential and psychic sensitivity.',
          ['Worship Goddess Durga on Mondays','Meditate regularly','Chant "Om Chandraya Namah"']);

      if (sun && ketu && sun.house === ketu.house)
        add('Surya-Ketu Yoga','Special Yoga','Moderate',
          `Sun and Ketu are conjunct in the ${sun.house}th house.`,
          'Spiritual inclination, past-life karmic patterns around identity. Detachment from worldly recognition. Can indicate spiritual authority and moksha-oriented life purpose.',
          ['Practice self-inquiry and meditation','Worship Lord Ganesha','Donate to orphanages']);

      const hasPitraTrigger = (sun && sun.house === 9) || (rahu && rahu.house === 9) ||
                              (sat && sat.house === 9) || (sun && rahu && sun.house === rahu.house);
      if (hasPitraTrigger)
        add('Pitra Dosha','Dosha','Moderate',
          'Sun, Rahu, or Saturn is in the 9th house, or Sun–Rahu conjunction — indicating ancestral karmic debt.',
          'Obstacles from unsatisfied ancestral karma. Father relationship may be complex. Pitru Tarpan brings significant relief.',
          ['Perform Pitru Tarpan on every Amavasya','Offer Shraddha during Pitru Paksha','Chant Gayatri Mantra 108× at sunrise','Donate food to Brahmins on Amavasya']);

      // ── NEECHA BHANGA RAJA YOGA ────────────────────────────────────────────
      for (const [pName, debSign] of Object.entries(DEBIL)) {
        const pl = get(pp, pName);
        if (!pl || pl.sign_index !== debSign) continue;
        const debLordName = SIGN_LORDS[debSign];
        const dlp = get(pp, debLordName);
        if (dlp && inKT(dlp.house)) {
          add('Neecha Bhanga Raja Yoga','Special Yoga','Strong',
            `${pName} is debilitated in ${ZODIAC[debSign]}, but cancelled by ${debLordName} in Kendra/Trikona (house ${dlp.house}).`,
            `Initial struggles in ${pName}'s significations are overcome, leading to exceptional achievement. Late-blooming success and remarkable resilience.`,
            [`Work consciously on ${pName}'s significations`,'Patience and persistence are key — success comes after initial challenges']);
        }
      }

      const counts = { 'Pancha Mahapurusha':0,'Raja Yoga':0,'Dhana Yoga':0,'Special Yoga':0,'Dosha':0 };
      yogas.forEach(y => { if (counts[y.category] !== undefined) counts[y.category]++; });

      res.json({
        name: name || null, dob,
        lagna:      ZODIAC[chart.lagna_sign_index],
        moon_sign:  chart.moon_sign,
        yogas,
        summary: {
          total:        yogas.length,
          auspicious:   yogas.filter(y => y.category !== 'Dosha').length,
          doshas:       yogas.filter(y => y.category === 'Dosha').length,
          by_category:  counts,
        },
      });
    })
    .catch(err => {
      console.error('[yoga]', err);
      res.status(500).json({ error: err.message || 'Yoga analysis failed' });
    });
}

module.exports = { analyse };
