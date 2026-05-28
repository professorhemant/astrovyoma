'use strict';

// Chaldean letter chart (1-8; 9 is sacred, unassigned)
const CHALDEAN = {
  A:1,I:1,J:1,Q:1,Y:1,
  B:2,K:2,R:2,
  C:3,G:3,L:3,S:3,
  D:4,M:4,T:4,
  E:5,H:5,N:5,X:5,
  U:6,V:6,W:6,
  O:7,Z:7,
  F:8,P:8,
};

const MASTER = [11, 22, 33];

function digitSum(n) {
  return String(Math.abs(parseInt(n))).split('').reduce((a, d) => a + (+d), 0);
}

function reduce(n) {
  let v = parseInt(n);
  if (MASTER.includes(v)) return v;
  while (v > 9) {
    v = digitSum(v);
    if (MASTER.includes(v)) return v;
  }
  return v;
}

function calcPsychic(dd) {
  const day = parseInt(dd, 10);
  const sum = digitSum(day);
  return reduce(sum);
}

function calcDestiny(dob) {
  const digits = dob.replace(/-/g, '').split('').reduce((a, d) => a + (+d), 0);
  return reduce(digits);
}

function calcNameNumber(name) {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  const breakdown = [];
  for (const ch of upper) {
    const val = CHALDEAN[ch] || 0;
    breakdown.push({ letter: ch, value: val });
    sum += val;
  }
  return { compound: sum, single: reduce(sum), breakdown };
}

function calcLoShu(dob) {
  const [yyyy, mm, dd] = dob.split('-');
  const allDigits = (dd + mm + yyyy).split('').map(Number);
  const counts = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  for (const d of allDigits) {
    if (d >= 1 && d <= 9) counts[d]++;
  }
  const has = n => counts[n] > 0;

  const formations = [];
  if ([4,9,2].every(has)) formations.push({ name:'Mental Plane', numbers:[4,9,2], type:'row', desc:'Exceptional intellect, sharp memory, and strong analytical ability. You think rationally and communicate thoughts with precision.' });
  if ([3,5,7].every(has)) formations.push({ name:'Emotional Plane', numbers:[3,5,7], type:'row', desc:'Deep emotional intelligence and strong intuition. You feel intensely and your gut instincts are almost always correct.' });
  if ([8,1,6].every(has)) formations.push({ name:'Practical Plane (Arrow of Abundance)', numbers:[8,1,6], type:'row', desc:'Tremendous practical ability leading to material success. You naturally build wealth and achieve tangible results.' });
  if ([4,3,8].every(has)) formations.push({ name:'Thought Column', numbers:[4,3,8], type:'col', desc:'Outstanding ability to generate and develop ideas. You are an original thinker with rare creative and innovative capacity.' });
  if ([9,5,1].every(has)) formations.push({ name:'Will Column', numbers:[9,5,1], type:'col', desc:'Extraordinary willpower and determination. Once you set your mind on a goal, virtually nothing can stop you.' });
  if ([2,7,6].every(has)) formations.push({ name:'Action Column', numbers:[2,7,6], type:'col', desc:'Strong ability to execute plans and honor commitments. You complete what you start and follow through with consistency.' });
  if ([4,5,6].every(has)) formations.push({ name:'Raj Yog — Golden Arrow', numbers:[4,5,6], type:'yog', rarity:'Only 2–3% of people carry this formation', desc:'EXTREMELY RARE. Blesses the native with immense fame, fortune, and name recognition. A mark of extraordinary worldly success, public recognition, and material abundance.' });
  if ([2,5,8].every(has)) formations.push({ name:'Rajat Yog — Silver Arrow', numbers:[2,5,8], type:'yog', rarity:'Only 5–7% of people carry this formation', desc:'Multiple property benefits and significant financial gains. Some ups and downs but overall remarkable material prosperity and stability throughout life.' });

  const missing = Object.keys(counts).map(Number).filter(k => counts[k] === 0);
  const present = Object.keys(counts).map(Number).filter(k => counts[k] > 0);
  return { counts, formations, missing, present };
}

function calcPersonalYear(dob) {
  const currentYear = new Date().getFullYear();
  const [, mm, dd] = dob.split('-');
  const sum = dd.split('').reduce((a,d)=>a+(+d),0)
    + mm.split('').reduce((a,d)=>a+(+d),0)
    + String(currentYear).split('').reduce((a,d)=>a+(+d),0);
  return reduce(sum);
}

// Planetary friendship-based compatibility
const COMPAT = {
  1: { friends:[1,2,3,9], enemies:[4,6,7] },
  2: { friends:[1,2,5],   enemies:[7] },
  3: { friends:[1,2,3,9], enemies:[4,6,7] },
  4: { friends:[4,5,6,8], enemies:[3,7,9] },
  5: { friends:[1,4,5,6], enemies:[3,7,9] },
  6: { friends:[4,5,6,8], enemies:[] },
  7: { friends:[3,6,7,9], enemies:[1,4,5] },
  8: { friends:[4,5,6,8], enemies:[1,2,9] },
  9: { friends:[1,2,3,6,7,9], enemies:[4] },
};

function getCompatibility(a, b) {
  const base = (n) => MASTER.includes(n) ? reduce(digitSum(n)) : n;
  const ba = base(a), bb = base(b);
  const row = COMPAT[ba];
  if (!row) return 'neutral';
  if (row.friends.includes(bb)) return 'friendly';
  if (row.enemies.includes(bb)) return 'challenging';
  return 'neutral';
}

const MISSING_MEANINGS = {
  1: { short:'Low confidence', desc:'Tendency to seek validation. Develop individuality and self-assertion.' },
  2: { short:'Emotional impatience', desc:'Poor listening skills. Developing empathy and cooperation is the key lesson.' },
  3: { short:'Creative blocks', desc:'Shyness or difficulty in self-expression. Memory and communication skills need conscious cultivation.' },
  4: { short:'Disorganized', desc:'Practical and organizational skills are underdeveloped. Building systems and routines is essential.' },
  5: { short:'Rigidity', desc:'Difficulty accepting change. Flexibility and inner strength are your growth lessons.' },
  6: { short:'Home worries', desc:'Struggles with domestic responsibility or excessive worry about home and family.' },
  7: { short:'Impulsive', desc:'Tendency to act without planning. Developing patience and spiritual depth is needed.' },
  8: { short:'Financial challenges', desc:'Money management and business acumen need development. Financial discipline is a key karmic lesson.' },
  9: { short:'Limited ambition', desc:'May lack broader humanitarian vision. Developing compassion and wider life goals is the path forward.' },
};

const NUMBER_DATA = {
  1: {
    planet:'Sun', planetHi:'सूर्य', symbol:'☀️', colorHex:'#F59E0B',
    gemstone:'Ruby', gemstoneHi:'माणिक', luckyDay:'Sunday', luckyDayHi:'रविवार',
    luckyColors:['Gold','Orange','Yellow'], element:'Fire',
    psychicTitle:'The Leader',
    psychicDesc:'Born with natural authority and creative power, you are a pioneer. The Sun makes you fiercely independent — you lead by example and shine where others hesitate. You have strong willpower and achieve through self-effort. Your challenge is tempering ego and learning that true leadership includes humility.',
    destinyDesc:'Your life mission is to develop individuality, inspire leadership, and forge new paths. Careers in management, politics, entrepreneurship, and creative arts align with your destiny. Overcome dependency and find your unique voice.',
    keywords:['Leadership','Independence','Creativity','Ambition','Courage'],
    strengths:['Natural authority','Original thinker','Self-reliant','Decisive','Pioneer spirit'],
    challenges:['Ego','Stubbornness','Domination','Impatience','Self-centeredness'],
    career:['CEO / Management','Politics / Administration','Entrepreneur','Military / Leadership','Artist / Creator'],
  },
  2: {
    planet:'Moon', planetHi:'चंद्रमा', symbol:'🌙', colorHex:'#94A3B8',
    gemstone:'Pearl', gemstoneHi:'मोती', luckyDay:'Monday', luckyDayHi:'सोमवार',
    luckyColors:['White','Cream','Silver'], element:'Water',
    psychicTitle:'The Diplomat',
    psychicDesc:'Gifted with deep sensitivity and emotional intelligence, you sense what others feel before words are spoken. The Moon makes you intuitive, artistic, and drawn toward harmony. You excel in partnerships and bring peace to any room. Your challenge is overcoming mood swings, self-doubt, and the tendency to take on others\' emotions.',
    destinyDesc:'Your life mission is to bring cooperation, healing, and emotional balance to the world. You thrive in partnerships and are often the quiet power behind great endeavors. Developing emotional resilience and trusting your powerful intuition is your journey.',
    keywords:['Diplomacy','Intuition','Sensitivity','Cooperation','Harmony'],
    strengths:['Empathetic','Diplomatic','Artistic','Intuitive','Nurturing'],
    challenges:['Moodiness','Indecision','Over-sensitivity','Dependency','Timidity'],
    career:['Counselor / Therapist','Nurse / Healer','Artist / Musician','Mediator','Psychologist'],
  },
  3: {
    planet:'Jupiter', planetHi:'गुरु (बृहस्पति)', symbol:'♃', colorHex:'#EAB308',
    gemstone:'Yellow Sapphire', gemstoneHi:'पुखराज', luckyDay:'Thursday', luckyDayHi:'गुरुवार',
    luckyColors:['Yellow','Golden','Cream'], element:'Ether / Akasha',
    psychicTitle:'The Creator',
    psychicDesc:"Blessed with Jupiter's abundant energy, you are optimistic, expressive, and creatively gifted. You have a magnetic personality and natural talent for art, writing, speaking, or music. Good fortune follows you, and your enthusiasm is infectious. Challenge: You may scatter your energy across too many interests without completing any of them.",
    destinyDesc:'Your life mission is to inspire, create, and uplift humanity through the gifts of expression and wisdom. The world needs your optimism. You are destined for public recognition and creative success.',
    keywords:['Creativity','Optimism','Expression','Abundance','Wisdom'],
    strengths:['Charismatic','Creative','Optimistic','Communicative','Lucky'],
    challenges:['Scattered energy','Over-optimism','Superficiality','Extravagance','Pride'],
    career:['Artist / Writer','Teacher / Professor','Entertainer / Actor','Philosopher','Public Speaker'],
  },
  4: {
    planet:'Rahu', planetHi:'राहु', symbol:'☊', colorHex:'#6B7280',
    gemstone:'Hessonite (Gomed)', gemstoneHi:'गोमेद', luckyDay:'Saturday', luckyDayHi:'शनिवार',
    luckyColors:['Blue','Grey','Electric Blue'], element:'Air',
    psychicTitle:'The Builder',
    psychicDesc:'Rahu gives you revolutionary thinking, extraordinary discipline, and unconventional methods. You build lasting structures and challenge conventional norms. You are often misunderstood because you think differently from the crowd. Your work ethic is unmatched. Challenge: Sudden disruptions, unexpected obstacles, and resistance from others are woven into your path.',
    destinyDesc:'Your life mission is to build solid foundations and bring about systemic change. You are destined to create things that endure — businesses, institutions, or social reforms. Patience through obstacles is your karmic test.',
    keywords:['Discipline','Structure','Persistence','Innovation','Reliability'],
    strengths:['Hardworking','Systematic','Loyal','Practical','Revolutionary thinker'],
    challenges:['Stubbornness','Rigidity','Opposition','Unexpected reversals','Delays'],
    career:['Engineer / Architect','Scientist / Researcher','Social Reformer','Entrepreneur','Computer Science / Technology'],
  },
  5: {
    planet:'Mercury', planetHi:'बुध', symbol:'☿', colorHex:'#22C55E',
    gemstone:'Emerald', gemstoneHi:'पन्ना', luckyDay:'Wednesday', luckyDayHi:'बुधवार',
    luckyColors:['Green','Light Blue','Multi-color'], element:'Earth',
    psychicTitle:'The Free Spirit',
    psychicDesc:'Mercury grants you lightning intellect, adaptability, and a deep love for freedom. You are multi-talented, quick-witted, and easily bored by routine. Travel, communication, and variety are the essence of your life. Your intuition and business sense are exceptionally sharp. Challenge: Restlessness and the inability to commit can scatter your vast potential.',
    destinyDesc:'Your life mission is to explore, communicate, and bridge worlds — connecting people, ideas, and cultures. You are destined to be a versatile force for change. Your journey involves embracing the adventure of life while developing focus.',
    keywords:['Versatility','Freedom','Communication','Intelligence','Adventure'],
    strengths:['Quick learner','Adaptable','Communicative','Multi-talented','Business-minded'],
    challenges:['Restlessness','Inconsistency','Scattered focus','Risk-taking','Impatience'],
    career:['Business / Commerce','Media / Journalism','Travel / Tourism','Sales / Marketing','Technology / IT'],
  },
  6: {
    planet:'Venus', planetHi:'शुक्र', symbol:'♀', colorHex:'#EC4899',
    gemstone:'Diamond', gemstoneHi:'हीरा', luckyDay:'Friday', luckyDayHi:'शुक्रवार',
    luckyColors:['Pink','Pastel Blue','White'], element:'Water',
    psychicTitle:'The Nurturer',
    psychicDesc:"Venus blesses you with love, beauty, and magnetic charm. You are the nurturer — responsible, loving, and devoted to home, family, and art. People are naturally drawn to your warmth. You have a refined aesthetic sense and romance is central to your life. Challenge: You may sacrifice your own needs excessively for others, and struggle with possessiveness.",
    destinyDesc:'Your life mission is to serve, heal, and beautify the world around you. You are a natural caretaker destined to create harmony and love in your environment. Learning to receive as gracefully as you give is your sacred journey.',
    keywords:['Love','Beauty','Harmony','Responsibility','Service'],
    strengths:['Loving','Reliable','Artistic','Charming','Responsible'],
    challenges:['Self-sacrifice','Possessiveness','Idealism','Excessive worry','Codependency'],
    career:['Doctor / Healer','Interior Designer / Artist','Social Worker','Teacher','Beautician / Fashion'],
  },
  7: {
    planet:'Ketu', planetHi:'केतु', symbol:'☋', colorHex:'#7C3AED',
    gemstone:"Cat's Eye (Lehsunia)", gemstoneHi:'लहसुनिया', luckyDay:'Monday', luckyDayHi:'सोमवार',
    luckyColors:['Purple','Violet','Grey'], element:'Fire / Spiritual',
    psychicTitle:'The Seeker',
    psychicDesc:'Ketu makes you deeply spiritual, analytical, and introspective. You are the searcher of hidden truths — philosophy, mysticism, science, and metaphysics captivate you. You have profound wisdom and psychic sensitivity. Others find you mysterious, but those who know you cherish your depth. Challenge: Isolation, material world detachment, and secretive tendencies.',
    destinyDesc:'Your life mission is to seek truth and share wisdom with humanity. You are destined for spiritual mastery or pioneering intellectual work. Your journey involves balancing the inner world with outer responsibilities.',
    keywords:['Spirituality','Wisdom','Introspection','Mysticism','Analysis'],
    strengths:['Deep thinker','Spiritual insight','Highly intuitive','Analytical','Independent'],
    challenges:['Isolation','Aloofness','Secrecy','Skepticism','Material difficulties'],
    career:['Researcher / Scientist','Philosopher','Astrologer / Spiritualist','Healer / Yogi','Academic'],
  },
  8: {
    planet:'Saturn', planetHi:'शनि', symbol:'♄', colorHex:'#334155',
    gemstone:'Blue Sapphire', gemstoneHi:'नीलम', luckyDay:'Saturday', luckyDayHi:'शनिवार',
    luckyColors:['Black','Dark Blue','Dark Brown'], element:'Air',
    psychicTitle:'The Achiever',
    psychicDesc:"Saturn makes you one of the most powerful and ambitious personalities in numerology. You are built for authority, material mastery, and large-scale achievement. Your life has a distinctly karmic quality — great tests precede great triumphs. You think strategically, act methodically, and never surrender. Challenge: The material world can become an obsession, and long karmic delays will severely test your faith.",
    destinyDesc:"Your life mission is to master the material world and create enduring legacy. Power, wealth, and authority are your karmic rewards — but only after serious tests and trials. You are destined for positions of great influence and societal impact.",
    keywords:['Power','Ambition','Karma','Success','Material mastery'],
    strengths:['Strategic','Disciplined','Authoritative','Resilient','Goal-oriented'],
    challenges:['Materialism','Workaholism','Ruthlessness','Karmic delays','Hardheadedness'],
    career:['Business Tycoon','Finance / Banking','Law / Justice','Politics','Real Estate / Construction'],
  },
  9: {
    planet:'Mars', planetHi:'मंगल', symbol:'♂', colorHex:'#EF4444',
    gemstone:'Red Coral', gemstoneHi:'मूंगा', luckyDay:'Tuesday', luckyDayHi:'मंगलवार',
    luckyColors:['Red','Crimson','Gold'], element:'Fire',
    psychicTitle:'The Humanitarian',
    psychicDesc:'Mars gives you boundless energy, courage, and a deep humanitarian heart. 9 is the number of completion and universal love. You feel the suffering of others acutely and are driven to serve. Your life is rich with intense experiences that forge wisdom. You are courageous, idealistic, and capable of great sacrifice for a higher cause. Challenge: Emotional turbulence, intensity, and difficulty letting go of the past.',
    destinyDesc:'Your life mission is to serve humanity and complete karmic cycles. You are destined to leave a profound mark on many lives through your compassion, courage, and creative power. Releasing attachment and embracing the universal is your sacred path.',
    keywords:['Compassion','Courage','Idealism','Service','Universal love'],
    strengths:['Courageous','Compassionate','Creative','Idealistic','Generous'],
    challenges:['Emotional extremes','Impulsiveness','Martyrdom','Attachment to past','Scattered energy'],
    career:['Doctor / Surgeon','Artist / Creative','Activist / Reformer','Military / Defense','Spiritual Leader'],
  },
  11: {
    planet:'Moon / Sun (Master)', planetHi:'चंद्र / सूर्य (मास्टर)', symbol:'✨', colorHex:'#E5E7EB',
    gemstone:'Pearl + Ruby', gemstoneHi:'मोती + माणिक', luckyDay:'Monday / Sunday', luckyDayHi:'सोमवार / रविवार',
    luckyColors:['Silver','White','Gold'], element:'Spiritual Light',
    psychicTitle:'The Illuminator',
    psychicDesc:"Master Number 11 is the most intuitive number in numerology — the psychic antenna of the universe. You are an old soul with extraordinary sensitivity and visionary gifts. You often sense things before they happen. The double 1s create intense internal tension between leadership and sensitivity — mastering this duality is your greatest challenge and your greatest superpower.",
    destinyDesc:"You carry a high spiritual mission as an Illuminator — to awaken, inspire, and uplift consciousness in others. You may become a visionary spiritual teacher, transformative artist, revolutionary inventor, or inspired healer. You are here to light the way for others.",
    keywords:['Intuition','Inspiration','Vision','Spiritual power','Illumination'],
    strengths:['Psychic sensitivity','Visionary','Inspiring','Spiritual depth','Creative genius'],
    challenges:['Nervous anxiety','Self-doubt','Overwhelm','Impracticality','Sensitivity overload'],
    career:['Spiritual Teacher','Healer / Counselor','Artist / Visionary','Psychologist','Inventor'],
    isMaster: true,
  },
  22: {
    planet:'Saturn / Moon (Master)', planetHi:'शनि / चंद्र (मास्टर)', symbol:'✨✨', colorHex:'#1D4ED8',
    gemstone:'Blue Sapphire + Pearl', gemstoneHi:'नीलम + मोती', luckyDay:'Saturday', luckyDayHi:'शनिवार',
    luckyColors:['Dark Blue','Black','Silver'], element:'Universal Force',
    psychicTitle:'The Master Builder',
    psychicDesc:"Master Number 22 is the most powerful number in numerology — the Master Builder. You carry the visionary insight of 11 combined with the practical power of 4, giving you the rare ability to manifest grand dreams into tangible reality. You are meant to build enduring institutions, systems, and structures that benefit humanity on a massive scale.",
    destinyDesc:"Your life mission is nothing less than transforming the world through practical vision. You are destined to build something truly great — a business empire, a social movement, or a spiritual institution that outlasts you. This number carries enormous responsibility and extraordinary potential.",
    keywords:['Vision','Power','Master building','Universal service','Legacy'],
    strengths:['Visionary','Highly practical','Powerful','Systematic','Globally minded'],
    challenges:['Enormous inner pressure','Perfectionism','Fear of failure','Overwork','Control issues'],
    career:['World Leader / Statesman','Architect of Systems','Diplomat','Global Business Builder','Humanitarian Organizer'],
    isMaster: true,
  },
  33: {
    planet:'Jupiter / Venus (Master)', planetHi:'गुरु / शुक्र (मास्टर)', symbol:'✨✨✨', colorHex:'#D97706',
    gemstone:'Yellow Sapphire + Diamond', gemstoneHi:'पुखराज + हीरा', luckyDay:'Thursday / Friday', luckyDayHi:'गुरुवार / शुक्रवार',
    luckyColors:['Gold','Pink','Cream'], element:'Cosmic Love',
    psychicTitle:'The Master Teacher',
    psychicDesc:"Master Number 33 is the rarest and highest vibration — the Master Teacher. It combines the creativity of 3 with the mastery of 11 and 22. You embody selfless service, divine love, and the highest wisdom. Your presence alone heals and inspires. This extraordinarily rare birth number is carried by souls with a profoundly elevated spiritual mission.",
    destinyDesc:"Your life mission is the highest form of service — to be a divine channel of love and wisdom for humanity. You are a master teacher destined to guide countless souls toward their highest potential through your unconditional love, unwavering compassion, and sacred wisdom.",
    keywords:['Selfless service','Divine love','Wisdom','Healing','Highest compassion'],
    strengths:['Unconditional love','Healing presence','Profound wisdom','Inspiring','Selfless'],
    challenges:['Martyrdom','Absorbing others\' pain','Extreme idealism','Burnout','Self-neglect'],
    career:['Spiritual Guru / Teacher','Humanitarian Leader','Divine Healer','Sacred Artist','Global Servant'],
    isMaster: true,
  },
};

const PERSONAL_YEAR_MEANINGS = {
  1:  { title:'Year of New Beginnings', desc:'A powerful year for fresh starts, new ventures, and bold decisions. Plant seeds now — what you initiate this year will shape the next 9-year cycle. Take charge and step into leadership.' },
  2:  { title:'Year of Partnership', desc:'Focus on relationships, diplomacy, and patience. This is a year to collaborate rather than act alone. Emotional bonds deepen. Avoid rushing — quiet progress is being made behind the scenes.' },
  3:  { title:'Year of Creativity & Joy', desc:'Expression, socializing, and creative projects come alive. Your charm is at its peak. Romance, art, and communication flourish. Be careful of scattering your energy — focus the creative fire.' },
  4:  { title:'Year of Foundation Building', desc:'Hard work, discipline, and laying solid groundwork. Not glamorous, but deeply important. Build systems, pay off debts, strengthen health. The effort you put in now pays dividends for years.' },
  5:  { title:'Year of Change & Freedom', desc:'Expect the unexpected — change, movement, and liberation define this year. Travel, career shifts, and new experiences arrive. Embrace flexibility. Resist clinging to what no longer serves you.' },
  6:  { title:'Year of Responsibility & Love', desc:'Home, family, relationships, and service take center stage. A year to give and receive love deeply. Healing of family issues is possible. Avoid taking on more responsibility than you can handle.' },
  7:  { title:'Year of Inner Reflection', desc:'A deeply introspective year for spiritual growth, research, and self-discovery. Step back from the world and go inward. Major insights come in solitude. Avoid major financial decisions — this is a year to think, not act.' },
  8:  { title:'Year of Power & Achievement', desc:'Material success, career advancement, and financial opportunities arrive. Your ambitions gain momentum. Take calculated risks and step into your authority. The karma of past efforts is being returned.' },
  9:  { title:'Year of Completion & Release', desc:'The final year of the cycle — a time of endings, letting go, and completion. Release what no longer serves: old relationships, habits, patterns. Make space for the new cycle beginning next year. Be generous — what you give now returns multiplied.' },
  11: { title:'Year of Illumination (Master)', desc:'An intensely spiritual and intuitive year. Visions, synchronicities, and psychic impressions are heightened. You may be called to inspire or teach others. Trust your intuition completely — it is supernaturally accurate this year.' },
  22: { title:'Year of Master Building (Master)', desc:'A rare year of extraordinary power to manifest large-scale dreams. What you build now can last for decades. Think globally, act practically. This year carries enormous responsibility — use it wisely.' },
};

const PLANET_THEMES = {
  1: { planet:'Sun', icon:'☀️', color:'#F59E0B', themes:['authority and recognition', 'new beginnings and bold action', 'personal power and self-expression'] },
  2: { planet:'Moon', icon:'🌙', color:'#94A3B8', themes:['emotional healing and relationships', 'intuition and hidden matters', 'peace and domestic harmony'] },
  3: { planet:'Jupiter', icon:'♃', color:'#EAB308', themes:['prosperity and abundance', 'wisdom and higher learning', 'auspicious new ventures and expansion'] },
  4: { planet:'Rahu', icon:'☊', color:'#6B7280', themes:['sudden transformation and change', 'unconventional paths to success', 'karmic debts and past life patterns'] },
  5: { planet:'Mercury', icon:'☿', color:'#22C55E', themes:['communication and important agreements', 'travel and exciting opportunities', 'business, finance, and intellectual pursuits'] },
  6: { planet:'Venus', icon:'♀', color:'#EC4899', themes:['love, romance, and deep relationships', 'artistic expression and beauty', 'luxury, comfort, and material pleasures'] },
  7: { planet:'Ketu', icon:'☋', color:'#7C3AED', themes:['spiritual growth and inner transformation', 'releasing old karmic patterns', 'hidden knowledge and mystical revelation'] },
  8: { planet:'Saturn', icon:'♄', color:'#334155', themes:['career advancement and ambitions', 'karmic justice and accountability', 'long-term stability and material security'] },
  9: { planet:'Mars', icon:'♂', color:'#EF4444', themes:['courage and bold decisive action', 'overcoming obstacles and challenges', 'vitality, health, and passionate energy'] },
};

function calculate(req, res) {
  try {
    const { name, dob } = req.body;
    if (!dob) return res.status(400).json({ error: 'Date of birth is required' });

    const dobParts = dob.split('-');
    if (dobParts.length !== 3) return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });

    const [yyyy, mm, dd] = dobParts;
    if (!yyyy || !mm || !dd) return res.status(400).json({ error: 'Invalid date' });

    const psychicNum   = calcPsychic(dd);
    const destinyNum   = calcDestiny(dob);
    const nameResult   = name ? calcNameNumber(name) : null;
    const loShu        = calcLoShu(dob);
    const personalYearNum = calcPersonalYear(dob);

    const compatPD = getCompatibility(psychicNum, destinyNum);
    const compatPN = nameResult ? getCompatibility(psychicNum, nameResult.single) : null;
    const compatDN = nameResult ? getCompatibility(destinyNum, nameResult.single) : null;

    const missingMeanings = loShu.missing.map(n => ({ number: n, ...MISSING_MEANINGS[n] }));

    res.json({
      dob,
      name: name || null,
      psychic: {
        number: psychicNum,
        rawDay: parseInt(dd, 10),
        data: NUMBER_DATA[psychicNum],
      },
      destiny: {
        number: destinyNum,
        data: NUMBER_DATA[destinyNum],
      },
      nameNumber: nameResult ? {
        compound: nameResult.compound,
        single:   nameResult.single,
        breakdown: nameResult.breakdown,
        data: NUMBER_DATA[nameResult.single],
      } : null,
      loShu: {
        counts: loShu.counts,
        formations: loShu.formations,
        missing: loShu.missing,
        present: loShu.present,
        missingMeanings,
      },
      personalYear: {
        number: personalYearNum,
        year: new Date().getFullYear(),
        ...PERSONAL_YEAR_MEANINGS[personalYearNum],
      },
      compatibility: {
        psychicDestiny: compatPD,
        psychicName:    compatPN,
        destinyName:    compatDN,
      },
      planetThemes: PLANET_THEMES,
    });
  } catch (err) {
    console.error('numerology calculate error:', err);
    res.status(500).json({ error: err.message || 'Calculation failed' });
  }
}

module.exports = { calculate };
