'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// AstroVyoma Palmistry Engine
// Pure deterministic rule-based Vedic Hast Rekha Shastra + Western palmistry.
// No AI APIs called at runtime. All interpretations are pre-coded.
// ─────────────────────────────────────────────────────────────────────────────

// ── Hand types ───────────────────────────────────────────────────────────────
const HAND_TYPES = {
  earth: {
    label: 'Earth Hand',
    element: 'Earth', planet: 'Saturn / Venus',
    personality: 'You are grounded, practical, and deeply reliable. Your strength lies in consistency and patience — you build things that last. You prefer tangible results over abstract theories and are most comfortable in the physical world. Loyal to the core, people trust you instinctively.',
    career: 'Farming, engineering, construction, finance, medicine, administration',
    strengths: ['Grounded & stable', 'Hardworking', 'Reliable & trustworthy', 'Methodical', 'Physically strong'],
    challenges: ['Resistance to change', 'Can be overly cautious', 'May struggle with emotional expression', 'Prone to stubbornness'],
    lucky: { number: 8, color: 'Dark Blue', direction: 'North', stone: 'Blue Sapphire' },
  },
  air: {
    label: 'Air Hand',
    element: 'Air', planet: 'Mercury / Saturn',
    personality: 'You are an intellectual, a communicator, and a thinker of rare depth. Your mind processes information swiftly and creatively. You thrive in social environments and have a natural gift for language, analysis, and persuasion. You are often ahead of your time in thought.',
    career: 'Writing, journalism, law, teaching, IT, sales, diplomacy, psychology',
    strengths: ['Sharp intellect', 'Excellent communicator', 'Adaptable', 'Socially gifted', 'Creative thinker'],
    challenges: ['Overthinking', 'Emotional detachment', 'Restlessness', 'Scattered energy'],
    lucky: { number: 5, color: 'Green', direction: 'North-East', stone: 'Emerald' },
  },
  fire: {
    label: 'Fire Hand',
    element: 'Fire', planet: 'Mars / Sun',
    personality: 'You are a born leader — energetic, passionate, and driven. You act on instinct and are rarely paralysed by indecision. Your enthusiasm is infectious and you inspire those around you. You have a magnetic personality and are drawn to challenges that others avoid.',
    career: 'Entrepreneurship, military, sports, politics, performance, surgery, management',
    strengths: ['Natural leader', 'High energy', 'Courageous', 'Decisive', 'Charismatic'],
    challenges: ['Impatience', 'Impulsiveness', 'Ego', 'Risk of burnout', 'Can be domineering'],
    lucky: { number: 9, color: 'Red', direction: 'South', stone: 'Red Coral' },
  },
  water: {
    label: 'Water Hand',
    element: 'Water', planet: 'Moon / Jupiter',
    personality: 'You are deeply intuitive, emotionally intelligent, and spiritually sensitive. You feel the world more intensely than most — your empathy is your superpower. Creative, artistic, and perceptive, you often sense things before they happen. You need harmony in your environment to truly flourish.',
    career: 'Arts, music, healing, counselling, poetry, spirituality, nursing, design',
    strengths: ['Highly intuitive', 'Empathetic', 'Artistic', 'Spiritual depth', 'Emotionally intelligent'],
    challenges: ['Over-sensitivity', 'Mood swings', 'Boundary issues', 'Can be withdrawn', 'Prone to anxiety'],
    lucky: { number: 2, color: 'White', direction: 'North-West', stone: 'Pearl' },
  },
};

// ── Life Line ─────────────────────────────────────────────────────────────────
const LIFE_LINE = {
  long_deep:   { quality: 'Long & Deep', meaning: 'Exceptional vitality, robust constitution, and a life rich with energy and experience. You have the physical and mental resilience to weather great challenges and emerge stronger. Longevity and consistent good health are strongly indicated.', score: 5 },
  long_faint:  { quality: 'Long but Faint', meaning: 'A long life path but with periods of fatigue or variable energy levels. You are sensitive to your environment and must pace yourself carefully. Inner strength is present but needs conscious cultivation and adequate rest.', score: 3 },
  short:       { quality: 'Short', meaning: 'This does not indicate a short life — this is a common myth. A short life line indicates that your vitality comes in intense bursts rather than a steady flow. You prefer living fully in shorter, concentrated periods of activity.', score: 3 },
  broken:      { quality: 'Broken', meaning: 'Major life transformations, relocations, or significant changes in circumstances. Each break represents a chapter closing and a new one opening. These breaks often coincide with the most growth-inducing transitions of your life.', score: 2 },
  chained:     { quality: 'Chained', meaning: 'Variable health through certain life periods, often tied to stress and emotional states. You are highly sensitive to environmental and emotional pressures. Consistent health routines and stress management are especially important for you.', score: 2 },
  forked_end:  { quality: 'Forked at End', meaning: 'A powerful indicator of travel, migration, or a significant change of lifestyle in later years. You will likely live in more than one place or reinvent yourself in your second half of life. Dual paths of destiny are open to you.', score: 4 },
  double:      { quality: 'Double (Sister Line)', meaning: 'The rare sister line alongside your life line is a powerful protective mark. It indicates a guardian energy watching over your life — past-life merit, strong ancestral blessings, or a protective spirit. Your resilience is doubled.', score: 5 },
};

// ── Heart Line ────────────────────────────────────────────────────────────────
const HEART_LINE = {
  long_curved:  { quality: 'Long & Curved', meaning: 'A deeply romantic, passionate, and openly expressive heart. You love with your whole being and are not afraid to show it. You attract and give intense emotional connections. Your heart is generous and your capacity for love is exceptional.', score: 5 },
  long_straight:{ quality: 'Long & Straight', meaning: 'You approach love rationally and with measured consideration. You are dependable, steady, and deeply loyal once committed. You may seem reserved at first, but once your heart is given, it is given completely and without reservation.', score: 4 },
  short:        { quality: 'Short', meaning: 'A focused, selective approach to love. You are not easily swept away and are discerning about who receives your emotional investment. When you do commit, the depth of your feeling is surprising even to those who know you well.', score: 3 },
  chained:      { quality: 'Chained', meaning: 'You have experienced emotional turbulence, heartbreak, or uncertainty in relationships. These experiences, while painful, have given you extraordinary emotional depth and wisdom. You are learning to balance vulnerability with self-protection.', score: 2 },
  broken:       { quality: 'Broken', meaning: 'Significant emotional experiences — losses, betrayals, or profound transformations through relationships — have shaped your heart. Each break marks a lesson that has fundamentally changed how you love. You are more resilient than you appear.', score: 2 },
  forked:       { quality: 'Forked (Girdle of Venus)', meaning: 'A deep spiritual and romantic idealism. You seek not just love but a soulmate connection — a union of minds, hearts, and souls. You may have high standards in relationships and are drawn to partners with spiritual or artistic depth.', score: 4 },
  absent:       { quality: 'Faint / Absent', meaning: 'Emotions are processed internally rather than expressed openly. You may appear cool or detached, but your inner emotional world is rich and complex. You express love through actions and loyalty rather than words and displays.', score: 2 },
};

// ── Head Line ─────────────────────────────────────────────────────────────────
const HEAD_LINE = {
  long_straight:{ quality: 'Long & Straight', meaning: 'A precise, logical, and analytical mind of considerable power. You think clearly, communicate with accuracy, and excel in fields requiring systematic reasoning. Your mental discipline is a significant professional asset.', score: 5 },
  long_sloping: { quality: 'Long & Sloping', meaning: 'Your mind beautifully bridges logic and imagination. You have exceptional creative and artistic thinking, combined with enough analytical ability to bring your visions into reality. This is the mark of artists, writers, and visionary thinkers.', score: 5 },
  short:        { quality: 'Short', meaning: 'A quick, decisive, and practical thinker. You instinctively cut to the heart of matters without getting lost in analysis. You trust your gut, act fast, and your first impressions are usually correct.', score: 3 },
  broken:       { quality: 'Broken', meaning: 'Your thinking style changes dramatically at certain life periods — often after major events or insights. You may have experienced a significant shift in worldview or intellectual direction. Mental flexibility is both your challenge and your gift.', score: 2 },
  forked:       { quality: "Forked (Writer's Fork)", meaning: "The rarest and most prized mark of intellectual brilliance — the Writer's Fork. You can hold multiple perspectives simultaneously, argue both sides of any issue, and synthesize seemingly contradictory ideas into unified insights. You are exceptionally gifted at communication.", score: 5 },
  chained:      { quality: 'Chained', meaning: 'Mental energy that fluctuates — periods of sharp clarity alternating with scattered or foggy thinking. You may be prone to indecision or self-doubt at certain times. Regular meditation and mental rest will stabilise your considerable intellectual gifts.', score: 2 },
  absent:       { quality: 'Merged with Life Line', meaning: "Your thinking and your vitality are deeply intertwined — when your energy is high, your mind is sharp; when tired, thinking suffers. You lead with instinct more than analysis. This is the mark of someone who 'thinks with their whole body.'", score: 3 },
};

// ── Fate Line ─────────────────────────────────────────────────────────────────
const FATE_LINE = {
  strong_clear: { quality: 'Strong & Clear', meaning: 'A clear and determined life path with a strong sense of destiny and purpose. You tend to find your calling relatively early and pursue it with consistency. Career success, professional recognition, and a clear sense of mission are strongly favoured.', score: 5 },
  from_life:    { quality: 'Starts from Life Line', meaning: 'Your destiny is built entirely by your own efforts and willpower — no external help, inherited position, or luck drives your success. Every achievement will be hard-won and deeply earned. This self-made quality makes your success all the more remarkable.', score: 4 },
  from_moon:    { quality: 'Starts from Mount of Moon', meaning: "Your destiny is shaped significantly by the public, community, or creative fields. You are likely to achieve success through work that touches many people. Public recognition, fame, or a career in service to others is strongly indicated.", score: 4 },
  broken:       { quality: 'Broken', meaning: 'Your career path has had or will have significant redirections — perhaps multiple careers, periods of uncertainty, or a major pivot mid-life. Each disruption, however uncomfortable, has redirected you toward something more authentic.', score: 2 },
  absent:       { quality: 'Absent / Faint', meaning: "The absence of a clear fate line does not mean lack of destiny. It indicates that your life path is fluid, self-directed, and free from a single fixed track. You carve your own path rather than following one prescribed for you — a mark of the true free spirit.", score: 3 },
  late_start:   { quality: 'Starts Late (mid-palm)', meaning: 'Your strongest and most fulfilling career phase begins after the age of 35. Early life may involve exploration, uncertainty, or service to others\' goals. The second half of your professional life is where your true destiny fully manifests.', score: 3 },
};

// ── Sun Line ──────────────────────────────────────────────────────────────────
const SUN_LINE = {
  present_strong: { quality: 'Present & Strong', meaning: 'The Sun line is the mark of fame, recognition, and brilliance in your chosen field. You have extraordinary potential for public success, artistic achievement, or widespread recognition. Creative gifts, charisma, and a quality of brightness define your public presence.', score: 5 },
  present_faint:  { quality: 'Present but Faint', meaning: 'Creative potential and the capacity for recognition exist, but are not yet fully activated. With conscious cultivation of your talents and consistent effort, the recognition and success indicated can fully manifest. Your light is real — it needs expression.', score: 3 },
  absent:         { quality: 'Absent', meaning: 'Success in your life will come through steady, sustained effort rather than sudden fame or recognition. Your achievements are solid and lasting even without the spotlight. Many of the most genuinely successful people carry no sun line — they build empires quietly.', score: 2 },
  multiple:       { quality: 'Multiple Lines', meaning: 'Multiple areas of talent and potential recognition. You may excel across different creative or professional domains simultaneously. The challenge is choosing which gifts to develop most deeply rather than spreading too thin.', score: 4 },
};

// ── Mounts ───────────────────────────────────────────────────────────────────
const MOUNTS = {
  jupiter: {
    name: 'Mount of Jupiter', planet: 'Jupiter', finger: 'Index finger',
    well_developed:   'Ambition, leadership, and spiritual wisdom are your defining gifts. You have natural authority and command respect without demanding it. Success in law, education, religion, or leadership is strongly indicated.',
    flat:             'Humility and a lack of ego — but guard against undervaluing your own abilities and leadership potential.',
    overdeveloped:    'Strong ambition, but a tendency toward pride, arrogance, or overreach. Channel this powerful energy toward genuine service.',
  },
  saturn: {
    name: 'Mount of Saturn', planet: 'Saturn', finger: 'Middle finger',
    well_developed:   'Exceptional discipline, wisdom through experience, and a deep philosophical nature. You understand life at a profound level and age like fine wine. Careers in law, research, and long-term strategy suit you perfectly.',
    flat:             'A carefree, spontaneous nature that resists heavy responsibility. You prefer freedom over structure.',
    overdeveloped:    'Tendency toward pessimism, isolation, or an overly serious worldview. Balance Saturn\'s depth with Jupiter\'s optimism.',
  },
  apollo: {
    name: 'Mount of Apollo (Sun)', planet: 'Sun', finger: 'Ring finger',
    well_developed:   'Creative brilliance, warmth, and a natural gift for the arts. You radiate positive energy and have exceptional aesthetic sensibility. Fame, artistic success, and public recognition are within your reach.',
    flat:             'Practicality over creativity — you prefer proven methods over artistic expression.',
    overdeveloped:    'Vanity, excessive desire for attention, or impractical idealism. Ground your considerable creative energy in consistent action.',
  },
  mercury: {
    name: 'Mount of Mercury', planet: 'Mercury', finger: 'Little finger',
    well_developed:   'Exceptional communication, business acumen, and quick thinking. You are a natural in commerce, negotiation, and any field requiring the power of persuasion. Wit, charm, and intelligence make you highly effective.',
    flat:             'Reserved communication style and preference for listening over speaking.',
    overdeveloped:    'A tendency toward cunning or cleverness that can shade into manipulation. Use your remarkable gifts for Mercury with integrity.',
  },
  moon: {
    name: 'Mount of Moon', planet: 'Moon', finger: 'Lower outer palm',
    well_developed:   'Rich imagination, strong psychic intuition, and deep creative gifts. You are highly sensitive to atmosphere and have an almost supernatural ability to sense hidden truths. Poetry, music, and spiritual arts call to you.',
    flat:             'A practical, rational orientation with less interest in the imaginative or mystical dimensions of life.',
    overdeveloped:    'An overactive imagination that can shade into fantasy, escapism, or emotional instability. Ground your gifts with regular practical activity.',
  },
  venus: {
    name: 'Mount of Venus', planet: 'Venus', finger: 'Base of thumb',
    well_developed:   'A warm, loving, and deeply sensual nature. You are generous, attractive, and naturally gifted in all matters of love and beauty. You have a strong life force and bring joy wherever you go.',
    flat:             'A more reserved or ascetic nature regarding physical pleasures and romantic expression.',
    overdeveloped:    'An excess of sensuality, passion, or indulgence that can lead to imbalance in relationships or lifestyle. Channel this tremendous life energy constructively.',
  },
  mars_upper: {
    name: 'Mount of Upper Mars', planet: 'Mars (Courage)',
    well_developed:   'Exceptional moral courage, mental resilience, and the ability to endure under pressure. You do not break — you bend and then return stronger.',
    flat:             'A gentle or conflict-averse nature. You prefer negotiation over confrontation.',
    overdeveloped:    'Aggressive tendencies or a combative nature that can create unnecessary opposition.',
  },
};

// ── Thumb ─────────────────────────────────────────────────────────────────────
const THUMB = {
  long_flexible:  'A long, flexible thumb is the classic mark of exceptional intelligence combined with adaptability. You are both a visionary and a realist. High willpower paired with emotional intelligence makes you a natural leader people actually want to follow.',
  long_stiff:     'Powerful, unyielding willpower and determination. Once you set a goal, nothing deters you. The flip side is rigidity — learning to bend without breaking will multiply your effectiveness significantly.',
  short_flexible: 'Quick thinking, social charm, and natural adaptability. You are excellent in fast-changing environments and highly persuasive in communication. Deep focus and follow-through are the qualities to consciously develop.',
  short_stiff:    'Stubborn determination in a compact package. You may appear easygoing but possess remarkable inner resolve. Trust your instincts — they are often more accurate than your analysis.',
  waisted:        'The "waisted" or narrowed thumb indicates exceptional tact and diplomacy. You instinctively know how to approach people and situations. This is a classic mark of skilled negotiators, counsellors, and peacemakers.',
};

// ── Special marks ─────────────────────────────────────────────────────────────
const SPECIAL_MARKS = {
  star_jupiter:    '⭐ Star on Mount of Jupiter: Extraordinary good fortune in authority, leadership, or public life. This is one of the most auspicious marks in all of palmistry.',
  star_apollo:     '⭐ Star on Mount of Apollo: Fame, artistic recognition, and public success at a level beyond what most achieve.',
  cross_saturn:    '✝ Cross on Mount of Saturn: A mark of fate — significant events, both challenging and profound, that fundamentally define your life\'s trajectory.',
  triangle_head:   '△ Triangle on Head Line: Exceptional mental power and scientific or analytical genius. Rare and highly auspicious.',
  ring_solomon:    '💍 Ring of Solomon (around Jupiter mount): The mark of wisdom, teaching ability, and deep understanding of human nature. You are a natural counsellor and guide.',
  girdle_venus:    '🌙 Girdle of Venus (extra curve above heart line): Heightened sensitivity, artistic temperament, and an extraordinarily rich emotional life.',
  mystic_cross:    '✚ Mystic Cross (between head and heart line): Strong psychic abilities, interest in the occult, and a deep connection to metaphysical knowledge.',
  none:            'No special marks detected — your story is written purely in your lines and mounts, which carry their own complete narrative.',
};

// ── Finger length ─────────────────────────────────────────────────────────────
const FINGER_LENGTH = {
  long_index:   'A prominent index finger indicates strong leadership ambition, desire for authority, and confidence in your own judgment.',
  long_middle:  'A long middle finger reflects seriousness, discipline, and a deep sense of responsibility.',
  long_ring:    'A long ring finger (longer than index) is associated with creativity, risk-taking, charisma, and strong aesthetic sense.',
  long_little:  'A long little finger indicates exceptional communication ability, linguistic intelligence, and business aptitude.',
  balanced:     'Well-proportioned fingers reflect a balanced, versatile personality with no single trait dominating — a sign of overall harmony.',
};

// ── Scoring engine ────────────────────────────────────────────────────────────
function computeScores(input) {
  const ll = LIFE_LINE[input.life_line]?.score  || 3;
  const hl = HEART_LINE[input.heart_line]?.score || 3;
  const hd = HEAD_LINE[input.head_line]?.score  || 3;
  const fl = FATE_LINE[input.fate_line]?.score  || 3;
  const sl = SUN_LINE[input.sun_line]?.score    || 2;

  const handBonus = { earth:0, air:1, fire:1, water:0 }[input.hand_type] || 0;
  const sunBonus  = sl;

  return {
    health:      Math.min(10, Math.round(ll * 2)),
    mind:        Math.min(10, Math.round(hd * 2)),
    heart:       Math.min(10, Math.round(hl * 2)),
    career:      Math.min(10, Math.round((fl + handBonus) * 1.5 + sunBonus * 0.5)),
    fame:        Math.min(10, Math.round(sl * 2)),
    overall:     Math.min(10, Math.round((ll + hl + hd + fl + sl + handBonus) / 3)),
  };
}

// ── Vedic lucky elements (deterministic from hand type + dominant mount) ──────
function computeLucky(hand_type, dominant_mount) {
  const base = HAND_TYPES[hand_type]?.lucky || { number: 5, color: 'Green', direction: 'North', stone: 'Emerald' };
  // Mount modifier
  const mountMods = {
    jupiter: { number: 3, color: 'Yellow', stone: 'Yellow Sapphire' },
    saturn:  { number: 8, color: 'Dark Blue', stone: 'Blue Sapphire' },
    apollo:  { number: 1, color: 'Gold', stone: 'Ruby' },
    mercury: { number: 5, color: 'Green', stone: 'Emerald' },
    moon:    { number: 2, color: 'White', stone: 'Pearl' },
    venus:   { number: 6, color: 'Pink', stone: 'Diamond' },
    mars_upper: { number: 9, color: 'Red', stone: 'Red Coral' },
  };
  const mod = dominant_mount ? mountMods[dominant_mount] : null;
  return mod
    ? { ...base, number: mod.number, color: mod.color, stone: mod.stone }
    : base;
}

// ── Main analysis function ────────────────────────────────────────────────────
function buildReading(input) {
  const hand   = HAND_TYPES[input.hand_type];
  const ll     = LIFE_LINE[input.life_line];
  const hl     = HEART_LINE[input.heart_line];
  const hd     = HEAD_LINE[input.head_line];
  const fl     = FATE_LINE[input.fate_line];
  const sl     = SUN_LINE[input.sun_line];
  const thumb  = THUMB[input.thumb] || null;
  const finger = FINGER_LENGTH[input.finger_length] || null;
  const mark   = SPECIAL_MARKS[input.special_mark || 'none'];

  // Build mount readings
  const mountReadings = [];
  if (input.mounts) {
    for (const [key, quality] of Object.entries(input.mounts)) {
      const m = MOUNTS[key];
      if (!m || !quality || quality === 'skip') continue;
      const meaning = m[quality] || m.well_developed;
      mountReadings.push({ mount: m.name, planet: m.planet, quality, meaning });
    }
  }

  const scores  = computeScores(input);
  const lucky   = computeLucky(input.hand_type, input.dominant_mount);

  // Dominant characteristic from scores
  const topScore = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  // Guidance points
  const guidance = [
    `Your ${hand?.element || 'elemental'} hand reveals that your primary life force flows through ${hand?.element === 'Earth' ? 'practical building and material mastery' : hand?.element === 'Air' ? 'intellectual expression and communication' : hand?.element === 'Fire' ? 'passionate leadership and bold action' : 'emotional depth and creative intuition'}.`,
    `Your ${hd?.quality || 'head line'} suggests that your mental approach to decisions will be your greatest asset — trust your ${input.head_line?.includes('straight') ? 'logic' : 'intuition'} when facing crossroads.`,
    `The combination of your ${fl?.quality || 'fate line'} and ${sl?.quality || 'sun line'} indicates that your career destiny ${fl?.score >= 4 ? 'has a clear arc — stay committed to your path' : 'rewards adaptability — do not be afraid to reinvent your professional direction'}.`,
  ];

  // Affirmation based on hand type
  const affirmations = {
    earth: 'I build with patience and I reap with abundance. My steady hands create lasting foundations.',
    air:   'My mind is my greatest instrument. I communicate truth and I connect worlds.',
    fire:  'I lead with courage and I light the way. My passion is my power and my purpose.',
    water: 'I feel deeply and I heal beautifully. My intuition is my compass and my creative gift.',
  };

  return {
    hand_type:          hand?.label || 'Unknown',
    element:            hand?.element,
    planet:             hand?.planet,
    overall_personality:hand?.personality,
    career_indication:  hand?.career,
    strengths:          hand?.strengths || [],
    challenges:         hand?.challenges || [],
    lines: {
      life_line:  ll  ? { quality: ll.quality,  meaning: ll.meaning  } : null,
      heart_line: hl  ? { quality: hl.quality,  meaning: hl.meaning  } : null,
      head_line:  hd  ? { quality: hd.quality,  meaning: hd.meaning  } : null,
      fate_line:  fl  ? { quality: fl.quality,  meaning: fl.meaning  } : null,
      sun_line:   sl  ? { quality: sl.quality,  meaning: sl.meaning  } : null,
    },
    mounts:            mountReadings,
    thumb:             thumb,
    finger_insights:   finger,
    special_mark:      mark,
    scores,
    lucky_elements:    lucky,
    guidance:          guidance.join('\n\n'),
    affirmation:       affirmations[input.hand_type] || 'I walk my path with clarity, courage, and cosmic grace.',
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────
exports.analyse = (req, res) => {
  try {
    const { name, hand_type, life_line, heart_line, head_line, fate_line, sun_line,
            mounts, thumb, finger_length, special_mark, dominant_mount } = req.body;

    if (!hand_type)  return res.status(400).json({ error: 'hand_type is required' });
    if (!life_line)  return res.status(400).json({ error: 'life_line is required'  });
    if (!heart_line) return res.status(400).json({ error: 'heart_line is required' });
    if (!head_line)  return res.status(400).json({ error: 'head_line is required'  });

    const input = { hand_type, life_line, heart_line, head_line,
                    fate_line: fate_line || 'absent',
                    sun_line:  sun_line  || 'absent',
                    mounts: mounts || {}, thumb, finger_length, special_mark, dominant_mount };

    const reading = buildReading(input);

    res.json({ name: name || 'Seeker', type: 'palm', reading });
  } catch (err) {
    console.error('[palmistryController]', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
};

// ── Export option keys (for frontend dropdowns) ───────────────────────────────
exports.getOptions = (_req, res) => {
  res.json({
    // Photo analysis needs a vision model; the UI hides that option when the
    // key isn't configured rather than showing a button that always fails.
    image_analysis_available: !!process.env.GROQ_API_KEY,
    hand_types:    Object.entries(HAND_TYPES).map(([k,v]) => ({ value:k, label:v.label, element:v.element })),
    life_lines:    Object.entries(LIFE_LINE).map(([k,v])  => ({ value:k, label:v.quality })),
    heart_lines:   Object.entries(HEART_LINE).map(([k,v]) => ({ value:k, label:v.quality })),
    head_lines:    Object.entries(HEAD_LINE).map(([k,v])  => ({ value:k, label:v.quality })),
    fate_lines:    Object.entries(FATE_LINE).map(([k,v])  => ({ value:k, label:v.quality })),
    sun_lines:     Object.entries(SUN_LINE).map(([k,v])   => ({ value:k, label:v.quality })),
    thumbs:        Object.entries(THUMB).map(([k,v])      => ({ value:k, label:k.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()) })),
    finger_lengths:Object.entries(FINGER_LENGTH).map(([k,v]) => ({ value:k, label:k.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()) })),
    special_marks: Object.entries(SPECIAL_MARKS).map(([k,v]) => ({ value:k, label:k.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()) })),
    mount_qualities: ['well_developed','flat','overdeveloped'],
    mounts: Object.entries(MOUNTS).map(([k,v]) => ({ value:k, label:v.name })),
  });
};
