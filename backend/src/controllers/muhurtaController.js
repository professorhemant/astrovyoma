'use strict';

const { getPanchangData } = require('./panchangController');

// ── Event-type rules ──────────────────────────────────────────────────────────
// good/bad tithis (by name), good/bad nakshatras, good/bad varas, good yogas

const EVENTS = {
  marriage: {
    label: 'Marriage (Vivah)',
    icon: '💍',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Trayodashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Navami','Chaturdashi','Amavasya','Pratipada'],
    goodNakshatras: ['Rohini','Mrigashira','Magha','Uttara Phalguni','Hasta','Swati','Anuradha','Mula','Uttara Ashadha','Uttara Bhadrapada','Revati'],
    badNakshatras:  ['Bharani','Krittika','Ardra','Ashlesha','Jyeshtha','Vishakha'],
    goodVaras:      ['Monday','Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Indra','Vriddhi','Dhruva'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'The Uttara nakshatras (Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) are traditionally considered most auspicious for marriage.',
  },
  business: {
    label: 'Business Start (Vyapar Arambh)',
    icon: '💼',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Trayodashi'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Shravana','Dhanishtha','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Magha','Jyeshtha','Mula','Shatabhisha'],
    goodVaras:      ['Wednesday','Thursday','Friday'],
    badVaras:       ['Saturday','Tuesday'],
    goodYogas:      ['Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vriddhi'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Wednesday (Mercury\'s day) is the most auspicious for starting any business or financial venture.',
  },
  travel: {
    label: 'Journey / Travel (Yatra)',
    icon: '✈️',
    goodTithis:     ['Dwitiya','Tritiya','Saptami','Dashami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya','Navami'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Hasta','Chitra','Swati','Shravana','Dhanishtha','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Jyeshtha','Mula'],
    goodVaras:      ['Monday','Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Vriddhi','Ayushman'],
    badYogas:       ['Vishkumbha','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Travel on Char Choghadiya is traditionally considered best. Avoid Rahu Kaal for departure.',
  },
  griha_pravesh: {
    label: 'House Entry (Griha Pravesh)',
    icon: '🏠',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Trayodashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Navami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Rohini','Mrigashira','Pushya','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada','Revati','Dhanishtha','Shravana','Anuradha'],
    badNakshatras:  ['Bharani','Krittika','Ardra','Ashlesha','Jyeshtha','Mula','Shatabhisha'],
    goodVaras:      ['Monday','Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday','Sunday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Vriddhi','Dhruva'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Fixed nakshatras (Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) are ideal for Griha Pravesh — they indicate permanence and stability.',
  },
  vehicle: {
    label: 'Vehicle Purchase (Vahan Kharid)',
    icon: '🚗',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Hasta','Chitra','Swati','Shravana','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Magha','Jyeshtha','Mula'],
    goodVaras:      ['Wednesday','Thursday','Friday'],
    badVaras:       ['Saturday','Tuesday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Vriddhi','Ayushman'],
    badYogas:       ['Vishkumbha','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Vaidhriti'],
    notes: 'Ashwini nakshatra (ruled by Ashwini Kumaras, the divine physicians) is especially auspicious for vehicles.',
  },
  surgery: {
    label: 'Surgery / Medical Procedure',
    icon: '🏥',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya','Purnima'],
    goodNakshatras: ['Ashwini','Mrigashira','Hasta','Ashlesha','Jyeshtha','Mula'],
    badNakshatras:  ['Rohini','Ardra','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada'],
    goodVaras:      ['Tuesday','Saturday'],
    badVaras:       ['Monday','Thursday'],
    goodYogas:      ['Siddha','Shubha','Harshana','Vriddhi'],
    badYogas:       ['Vishkumbha','Shoola','Ganda','Vyaghata','Parigha','Vaidhriti'],
    notes: 'Unlike most activities, Tuesdays and Saturdays are preferred for surgery. Avoid operating on the body part ruled by the current Moon sign.',
  },
  education: {
    label: 'Education Start (Vidyarambha)',
    icon: '📚',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Ashwini','Rohini','Mrigashira','Punarvasu','Pushya','Uttara Phalguni','Hasta','Chitra','Swati','Shravana','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Magha','Jyeshtha','Mula','Shatabhisha'],
    goodVaras:      ['Wednesday','Thursday','Friday'],
    badVaras:       ['Tuesday','Saturday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Vriddhi','Saubhagya'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vaidhriti'],
    notes: 'Wednesday (Mercury\'s day) is the most auspicious for starting studies, exams, or academic pursuits.',
  },
  investment: {
    label: 'Investment / Property Purchase',
    icon: '💰',
    goodTithis:     ['Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Dwadashi','Purnima'],
    badTithis:      ['Chaturthi','Ashtami','Chaturdashi','Amavasya'],
    goodNakshatras: ['Rohini','Mrigashira','Punarvasu','Pushya','Uttara Phalguni','Hasta','Swati','Uttara Ashadha','Dhanishtha','Uttara Bhadrapada','Revati'],
    badNakshatras:  ['Bharani','Ardra','Ashlesha','Jyeshtha','Mula'],
    goodVaras:      ['Thursday','Friday','Wednesday'],
    badVaras:       ['Saturday','Tuesday'],
    goodYogas:      ['Siddha','Shubha','Shukla','Brahma','Indra','Vriddhi','Dhruva'],
    badYogas:       ['Vishkumbha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    notes: 'Dhruva (Fixed) nakshatras are especially good for property purchases — they indicate permanence and long-term stability.',
  },
};

// Yoga quality from panchangController categories
const BAD_YOGAS_UNIVERSAL = new Set(['Vishkumbha','Atiganda','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti','Shoola']);
const GOOD_YOGAS_UNIVERSAL = new Set(['Siddha','Shubha','Shukla','Brahma','Indra','Vriddhi','Harshana','Saubhagya','Ayushman','Sadhya','Preeti','Priti']);

function scoreDay(pd, eventType) {
  const ev = EVENTS[eventType];
  if (!ev) return null;

  let score = 50; // base
  const factors = [];

  // Tithi (25 points max)
  if (ev.badTithis.includes(pd.tithi)) {
    score -= 25;
    factors.push({ label:'Tithi', value: pd.tithi, quality:'Inauspicious', points:-25, reason: `${pd.tithi} is unfavorable for ${ev.label}` });
  } else if (ev.goodTithis.includes(pd.tithi)) {
    score += 25;
    factors.push({ label:'Tithi', value: pd.tithi, quality:'Auspicious', points:+25, reason: `${pd.tithi} is auspicious for ${ev.label}` });
  } else {
    factors.push({ label:'Tithi', value: pd.tithi, quality:'Neutral', points:0, reason: `${pd.tithi} is neutral for ${ev.label}` });
  }

  // Nakshatra (20 points max)
  if (ev.badNakshatras.includes(pd.nakshatra)) {
    score -= 20;
    factors.push({ label:"Moon's Nakshatra", value: pd.nakshatra, quality:'Inauspicious', points:-20, reason: `Moon in ${pd.nakshatra} is unfavorable for ${ev.label}` });
  } else if (ev.goodNakshatras.includes(pd.nakshatra)) {
    score += 20;
    factors.push({ label:"Moon's Nakshatra", value: pd.nakshatra, quality:'Auspicious', points:+20, reason: `Moon in ${pd.nakshatra} is auspicious for ${ev.label}` });
  } else {
    factors.push({ label:"Moon's Nakshatra", value: pd.nakshatra, quality:'Neutral', points:0, reason: `Moon in ${pd.nakshatra} is neutral for ${ev.label}` });
  }

  // Vara / Day of week (15 points max)
  if (ev.badVaras.includes(pd.vara)) {
    score -= 15;
    factors.push({ label:'Day of Week', value: pd.vara, quality:'Inauspicious', points:-15, reason: `${pd.vara} (ruled by ${pd.varaLord}) is unfavorable for ${ev.label}` });
  } else if (ev.goodVaras.includes(pd.vara)) {
    score += 15;
    factors.push({ label:'Day of Week', value: pd.vara, quality:'Auspicious', points:+15, reason: `${pd.vara} (ruled by ${pd.varaLord}) is auspicious for ${ev.label}` });
  } else {
    factors.push({ label:'Day of Week', value: pd.vara, quality:'Neutral', points:0, reason: `${pd.vara} is neutral for ${ev.label}` });
  }

  // Yoga (10 points max)
  if (ev.badYogas.includes(pd.yoga) || BAD_YOGAS_UNIVERSAL.has(pd.yoga)) {
    score -= 10;
    factors.push({ label:'Panchanga Yoga', value: pd.yoga, quality:'Inauspicious', points:-10, reason: `${pd.yoga} yoga is unfavorable` });
  } else if (ev.goodYogas.includes(pd.yoga) || GOOD_YOGAS_UNIVERSAL.has(pd.yoga)) {
    score += 10;
    factors.push({ label:'Panchanga Yoga', value: pd.yoga, quality:'Auspicious', points:+10, reason: `${pd.yoga} yoga is auspicious` });
  } else {
    factors.push({ label:'Panchanga Yoga', value: pd.yoga, quality:'Neutral', points:0, reason: `${pd.yoga} yoga is neutral` });
  }

  score = Math.max(0, Math.min(100, score));

  let verdict, verdictColor;
  if (score >= 75)      { verdict = 'Highly Auspicious'; verdictColor = '#6BCB77'; }
  else if (score >= 55) { verdict = 'Auspicious'; verdictColor = '#74B9FF'; }
  else if (score >= 40) { verdict = 'Neutral / Acceptable'; verdictColor = '#FFD93D'; }
  else if (score >= 25) { verdict = 'Inauspicious'; verdictColor = '#FF9F43'; }
  else                  { verdict = 'Avoid'; verdictColor = '#FF6B6B'; }

  return { score, verdict, verdictColor, factors };
}

function getVerdictMessage(score, eventName) {
  if (score >= 75) return {
    level: 'excellent',
    headline: `🌟 YES! Today is HIGHLY AUSPICIOUS for ${eventName}`,
    message: 'Stars are strongly aligned. An excellent day — go ahead with full confidence.',
    color: '#6BCB77',
  };
  if (score >= 55) return {
    level: 'good',
    headline: `✅ YES! Today is a GOOD day for ${eventName}`,
    message: 'Conditions are favourable. You may proceed today.',
    color: '#74B9FF',
  };
  if (score >= 40) return {
    level: 'neutral',
    headline: `⚠️ Today is AVERAGE for ${eventName}`,
    message: 'Not ideal but acceptable. Better dates are available — check below.',
    color: '#FFD93D',
  };
  if (score >= 25) return {
    level: 'bad',
    headline: `❌ NOT RECOMMENDED for ${eventName} today`,
    message: 'Today is inauspicious for this activity. Please use one of the better dates suggested below.',
    color: '#FF9F43',
  };
  return {
    level: 'avoid',
    headline: `🚫 AVOID ${eventName} today`,
    message: 'Highly inauspicious day. Strongly recommended to wait for a better date shown below.',
    color: '#FF6B6B',
  };
}

function findBestDates(eventType, fromDateStr, count = 3) {
  const results = [];
  const from = new Date(fromDateStr + 'T00:00:00');

  for (let i = 1; i <= 60 && results.length < count; i++) {
    const d = new Date(from.getTime() + i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    try {
      const pd = getPanchangData(dateStr);
      const scoring = scoreDay(pd, eventType);
      if (!scoring || scoring.score < 55) continue;

      const chog = buildChoghadiya(pd);
      const bestSlot = chog.find(s =>
        ['Amrit','Shubh'].includes(s.name) && !s.isRahu && !s.isYamganda && s.period === 'Day'
      ) || chog.find(s =>
        s.name === 'Labh' && !s.isRahu && !s.isYamganda && s.period === 'Day'
      ) || chog.find(s =>
        s.name === 'Char' && !s.isRahu && !s.isYamganda && s.period === 'Day'
      );

      results.push({
        date: dateStr,
        display: d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
        score: scoring.score,
        verdict: scoring.verdict,
        verdictColor: scoring.verdictColor,
        bestTime: bestSlot ? `${bestSlot.start} – ${bestSlot.end} (${bestSlot.name} Choghadiya)` : 'Check Choghadiya for best time',
        vara: pd.vara,
        nakshatra: pd.nakshatra,
        tithi: pd.tithi,
        yoga: pd.yoga,
      });
    } catch (_) { /* skip bad dates */ }
  }
  return results;
}

function minToTime12(m) {
  const h = Math.floor(m / 60) % 24, mn = Math.round(m % 60);
  const a = h >= 12 ? 'PM' : 'AM', h12 = h % 12 || 12;
  return `${h12}:${String(mn).padStart(2,'0')} ${a}`;
}

function buildChoghadiya(pd) {
  const { srMin, ssMin, choghadiyaDay, choghadiyaNight, choghadiyaInfo,
          rahuPart, yamgandaPart, gulikaPart } = pd;
  const slots = [];

  const dayDur  = (ssMin - srMin) / 8;
  const nightDur = (srMin + 1440 - ssMin) / 8;

  for (let i = 0; i < 8; i++) {
    const start = srMin + i * dayDur;
    const end   = start + dayDur;
    const name  = choghadiyaDay[i];
    const info  = choghadiyaInfo[name] || {};
    slots.push({
      period: 'Day', index: i+1, name,
      start: minToTime12(start), end: minToTime12(end),
      nature: info.nature || 'Neutral',
      color:  info.color  || '#gray',
      icon:   info.icon   || '',
      desc:   info.desc   || '',
      isRahu:    rahuPart    === i+1,
      isYamganda:yamgandaPart === i+1,
      isGulika:  gulikaPart   === i+1,
    });
  }
  for (let i = 0; i < 8; i++) {
    const start = ssMin + i * nightDur;
    const end   = start + nightDur;
    const name  = choghadiyaNight[i];
    const info  = choghadiyaInfo[name] || {};
    slots.push({
      period: 'Night', index: i+1, name,
      start: minToTime12(start % 1440), end: minToTime12(end % 1440),
      nature: info.nature || 'Neutral',
      color:  info.color  || '#gray',
      icon:   info.icon   || '',
      desc:   info.desc   || '',
      isRahu: false, isYamganda: false, isGulika: false,
    });
  }
  return slots;
}

function calculate(req, res) {
  try {
    const { date, event_type } = req.body;
    if (!date)       return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    if (!event_type) return res.status(400).json({ error: 'event_type is required' });
    if (!EVENTS[event_type]) return res.status(400).json({ error: 'Invalid event_type', valid: Object.keys(EVENTS) });

    const pd  = getPanchangData(date);
    const ev  = EVENTS[event_type];
    const scoring = scoreDay(pd, event_type);
    const choghadiya = buildChoghadiya(pd);
    const eventName = ev.label.split(' (')[0];
    const verdict = getVerdictMessage(scoring.score, eventName);
    const best_dates = scoring.score < 55 ? findBestDates(event_type, date, 3) : findBestDates(event_type, date, 1);

    const auspSlots = choghadiya.filter(s =>
      ['Amrit','Shubh','Labh','Char'].includes(s.name) &&
      !s.isRahu && !s.isYamganda &&
      s.period === 'Day'
    );

    res.json({
      date,
      event_type,
      event_label: ev.label,
      event_icon:  ev.icon,
      verdict,
      best_dates,
      panchang: {
        vara:      pd.vara,
        varaLord:  pd.varaLord,
        tithi:     pd.tithi,
        nakshatra: pd.nakshatra,
        yoga:      pd.yoga,
        karana:    pd.karana,
        sunrise:   minToTime12(pd.srMin),
        sunset:    minToTime12(pd.ssMin),
      },
      scoring,
      choghadiya,
      best_slots: auspSlots,
      notes: ev.notes,
      event_rules: {
        good_tithis:     ev.goodTithis,
        bad_tithis:      ev.badTithis,
        good_nakshatras: ev.goodNakshatras,
        bad_nakshatras:  ev.badNakshatras,
        good_varas:      ev.goodVaras,
        bad_varas:       ev.badVaras,
      },
    });
  } catch (err) {
    console.error('[muhurta]', err);
    res.status(500).json({ error: err.message || 'Muhurta calculation failed' });
  }
}

function getEventTypes(req, res) {
  const types = Object.entries(EVENTS).map(([key, ev]) => ({
    key, label: ev.label, icon: ev.icon,
  }));
  res.json({ event_types: types });
}

module.exports = { calculate, getEventTypes };
