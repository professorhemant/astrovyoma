'use strict';

// Today's Lucky Info — pure deterministic rotation, no AI, no DB
// Changes daily using date-based seed

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// Static sign data
const SIGN_META = {
  Aries:       { symbol:'♈', element:'Fire',  ruler:'Mars',    stone:'Red Coral',     metal:'Copper',   deity:'Lord Hanuman', mantra:'Om Angarakaya Namah', yantra:'Mangal Yantra' },
  Taurus:      { symbol:'♉', element:'Earth', ruler:'Venus',   stone:'Diamond',       metal:'Silver',   deity:'Goddess Lakshmi', mantra:'Om Shukraya Namah', yantra:'Shukra Yantra' },
  Gemini:      { symbol:'♊', element:'Air',   ruler:'Mercury', stone:'Emerald',       metal:'Bronze',   deity:'Lord Vishnu', mantra:'Om Budhaya Namah', yantra:'Budh Yantra' },
  Cancer:      { symbol:'♋', element:'Water', ruler:'Moon',    stone:'Pearl',         metal:'Silver',   deity:'Goddess Durga', mantra:'Om Chandraya Namah', yantra:'Chandra Yantra' },
  Leo:         { symbol:'♌', element:'Fire',  ruler:'Sun',     stone:'Ruby',          metal:'Gold',     deity:'Lord Surya', mantra:'Om Suryaya Namah', yantra:'Surya Yantra' },
  Virgo:       { symbol:'♍', element:'Earth', ruler:'Mercury', stone:'Emerald',       metal:'Bronze',   deity:'Goddess Saraswati', mantra:'Om Budhaya Namah', yantra:'Budh Yantra' },
  Libra:       { symbol:'♎', element:'Air',   ruler:'Venus',   stone:'Diamond',       metal:'Silver',   deity:'Goddess Lakshmi', mantra:'Om Shukraya Namah', yantra:'Shukra Yantra' },
  Scorpio:     { symbol:'♏', element:'Water', ruler:'Mars',    stone:'Red Coral',     metal:'Copper',   deity:'Lord Shiva', mantra:'Om Angarakaya Namah', yantra:'Mangal Yantra' },
  Sagittarius: { symbol:'♐', element:'Fire',  ruler:'Jupiter', stone:'Yellow Sapphire', metal:'Gold',  deity:'Lord Brihaspati', mantra:'Om Guruve Namah', yantra:'Guru Yantra' },
  Capricorn:   { symbol:'♑', element:'Earth', ruler:'Saturn',  stone:'Blue Sapphire', metal:'Iron',     deity:'Lord Shani', mantra:'Om Shanishcharaya Namah', yantra:'Shani Yantra' },
  Aquarius:    { symbol:'♒', element:'Air',   ruler:'Saturn',  stone:'Blue Sapphire', metal:'Iron',     deity:'Lord Shani', mantra:'Om Shanishcharaya Namah', yantra:'Shani Yantra' },
  Pisces:      { symbol:'♓', element:'Water', ruler:'Jupiter', stone:'Yellow Sapphire', metal:'Gold',  deity:'Lord Vishnu', mantra:'Om Guruve Namah', yantra:'Guru Yantra' },
};

// Rotating pools — seeded by (dayOfYear * signIndex) % length
const COLORS = {
  Aries:       ['Red','Crimson','Scarlet','Orange','Gold','Coral','Maroon','Copper'],
  Taurus:      ['Green','Emerald','Pink','White','Ivory','Sage','Rose Gold','Mint'],
  Gemini:      ['Yellow','Lime','Turquoise','Sky Blue','Silver','Light Green','Lavender','Cyan'],
  Cancer:      ['White','Silver','Pearl','Pale Blue','Cream','Sea Green','Lavender','Moonlight'],
  Leo:         ['Gold','Orange','Yellow','Amber','Crimson','Royal Blue','Bronze','Honey'],
  Virgo:       ['Green','Navy','Olive','Grey','Teal','Forest Green','Dark Blue','Sage'],
  Libra:       ['Pink','Light Blue','White','Lavender','Peach','Rose','Sky Blue','Ivory'],
  Scorpio:     ['Deep Red','Maroon','Black','Dark Purple','Burgundy','Indigo','Magenta','Crimson'],
  Sagittarius: ['Purple','Violet','Yellow','Gold','Royal Blue','Turquoise','Cobalt','Plum'],
  Capricorn:   ['Black','Dark Blue','Brown','Grey','Navy','Charcoal','Olive','Dark Green'],
  Aquarius:    ['Electric Blue','Turquoise','Violet','Silver','Cyan','Sky Blue','Indigo','Teal'],
  Pisces:      ['Sea Green','Aqua','Lavender','Purple','White','Sky Blue','Ocean Blue','Seafoam'],
};

const NUMBERS = {
  Aries:       [9,1,8,3,6,5,2,7],
  Taurus:      [6,2,9,5,1,4,7,3],
  Gemini:      [5,3,7,1,9,2,6,4],
  Cancer:      [2,7,4,1,9,6,3,5],
  Leo:         [1,3,5,9,6,2,8,4],
  Virgo:       [5,3,6,2,8,1,7,4],
  Libra:       [6,1,5,9,2,7,3,4],
  Scorpio:     [9,4,1,8,6,2,7,3],
  Sagittarius: [3,9,6,1,7,5,2,8],
  Capricorn:   [8,1,6,9,4,2,5,7],
  Aquarius:    [4,8,2,6,1,9,5,7],
  Pisces:      [7,3,9,6,2,5,1,8],
};

const DIRECTIONS = ['North','North-East','East','South-East','South','South-West','West','North-West'];
const LUCKY_HOURS = ['6:00–8:00 AM','8:00–10:00 AM','10:00 AM–12:00 PM','12:00–2:00 PM','2:00–4:00 PM','4:00–6:00 PM','6:00–8:00 PM','8:00–10:00 PM'];
const LUCKY_DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const LUCKY_WORDS = {
  Aries:       ['Courage','Initiate','Bold','Lead','Victory','Passion','Power','Drive'],
  Taurus:      ['Abundance','Persist','Value','Secure','Prosper','Nurture','Bloom','Steadfast'],
  Gemini:      ['Connect','Explore','Adapt','Communicate','Discover','Learn','Share','Spark'],
  Cancer:      ['Nurture','Intuit','Protect','Cherish','Reflect','Heal','Trust','Home'],
  Leo:         ['Shine','Create','Lead','Inspire','Express','Radiate','Flourish','Command'],
  Virgo:       ['Refine','Serve','Analyse','Perfect','Heal','Discern','Improve','Craft'],
  Libra:       ['Balance','Harmonise','Collaborate','Beautify','Justice','Connect','Grace','Equalise'],
  Scorpio:     ['Transform','Penetrate','Regenerate','Investigate','Empower','Reveal','Depth','Rise'],
  Sagittarius: ['Expand','Explore','Wisdom','Journey','Freedom','Teach','Vision','Grow'],
  Capricorn:   ['Build','Achieve','Discipline','Endure','Ascend','Structure','Legacy','Persist'],
  Aquarius:    ['Innovate','Liberate','Unite','Envision','Pioneer','Disrupt','Humanity','Future'],
  Pisces:      ['Imagine','Transcend','Compassion','Heal','Dream','Surrender','Flow','Grace'],
};

const AFFIRMATIONS = {
  Aries:       ['I act with confidence and create my destiny today.', 'My bold energy attracts the success I deserve.', 'I lead with courage and inspire those around me.', 'Today I channel my fire into purposeful action.', 'I am a pioneer — my path is uniquely mine.', 'My instincts are sharp; I trust them completely.', 'I embrace challenge as the path to my greatness.', 'I am energised, focused, and unstoppable today.'],
  Taurus:      ['I am grounded in abundance and attract prosperity.', 'My patience today builds the foundation for lasting success.', 'I am worthy of beauty, comfort, and material wellbeing.', 'I persist steadily toward my most meaningful goals.', 'My reliable nature is my greatest professional strength.', 'I nurture myself and others with generous, loving care.', 'I am in perfect alignment with wealth and wellness.', 'My steady effort today creates tomorrow\'s abundance.'],
  Gemini:      ['My curiosity today opens doors I haven\'t yet imagined.', 'I communicate my ideas with clarity and persuasive brilliance.', 'I adapt to every situation with grace and intelligence.', 'My versatile mind is my most powerful professional asset.', 'I learn something valuable from everyone I meet today.', 'My ideas flow freely and land with powerful impact.', 'I embrace change as the catalyst for my best growth.', 'I connect meaningfully with the world through authentic expression.'],
  Cancer:      ['My intuition is a precise and reliable compass today.', 'I nurture myself with the same care I give others.', 'My emotional depth is a gift that creates profound connection.', 'I trust the cosmic timing of everything in my life.', 'I create safety and love wherever I go today.', 'My empathy is a superpower that heals and transforms.', 'I am supported, protected, and guided by higher forces.', 'My sensitivity is a strength that reveals hidden truths.'],
  Leo:         ['I shine brightly and inspire everyone I encounter today.', 'My creative self-expression attracts exactly the right recognition.', 'I lead with generous, warm, and authentic confidence.', 'My natural charisma opens every door I approach today.', 'I am worthy of the spotlight I was born to occupy.', 'My heart\'s generosity multiplies every good thing in my life.', 'I express my unique gifts boldly and without reservation.', 'I am the Sun of my own life — radiant and vital.'],
  Virgo:       ['My attention to detail today creates extraordinary results.', 'I serve with excellence and receive in equal measure.', 'My analytical mind solves what others cannot even see.', 'I refine my craft today with focused, loving attention.', 'My practical wisdom creates real, lasting value in the world.', 'I am healthy, disciplined, and fully aligned with my purpose.', 'My standards of excellence inspire and elevate everyone around me.', 'I transform complexity into elegant, workable simplicity today.'],
  Libra:       ['I create harmony and beauty wherever I move today.', 'My natural diplomacy resolves what force could never achieve.', 'I attract balanced, reciprocal, and fulfilling relationships.', 'My aesthetic sense is a professional and personal superpower.', 'I make fair, clear decisions with grace and confidence.', 'I am in beautiful balance across all areas of my life.', 'My partnerships thrive because I invest in them genuinely.', 'I bring elegance and fairness to every interaction today.'],
  Scorpio:     ['I transform challenge into power through focused intention.', 'My depth of perception reveals what others cannot access.', 'I release what no longer serves me with courage and grace.', 'My emotional intelligence is a rare and powerful gift today.', 'I embrace transformation as the path to my highest self.', 'My resilience today becomes tomorrow\'s extraordinary strength.', 'I investigate, understand, and master every challenge I face.', 'I rise from every depth stronger, wiser, and more powerful.'],
  Sagittarius: ['I expand my world with joyful curiosity and boldness today.', 'My optimism is prophetic — I attract what I envision.', 'I share my wisdom generously and receive abundance in return.', 'My adventurous spirit opens doors to extraordinary opportunities.', 'I am on a purposeful journey toward my highest potential.', 'My enthusiasm ignites inspiration in everyone around me today.', 'I trust the universe to guide my arrow to its mark.', 'I learn, grow, and evolve with joyful, purposeful momentum.'],
  Capricorn:   ['I build my legacy one focused, disciplined day at a time.', 'My steady effort today creates lasting, meaningful achievements.', 'I climb toward my goals with patience, power, and purpose.', 'My reliability and integrity are my most valuable professional assets.', 'I structure my ambitions with wisdom and long-term vision.', 'I deserve the success that my consistent effort earns.', 'My practical mastery transforms vision into tangible, enduring reality.', 'I ascend steadily and arrive exactly where I am meant to be.'],
  Aquarius:    ['I envision a better world and take action to create it.', 'My unique perspective is the solution the world has been waiting for.', 'I innovate fearlessly and inspire those brave enough to follow.', 'My humanitarian heart guides my most impactful work today.', 'I connect meaningfully with a community that shares my vision.', 'My revolutionary thinking is both ahead of its time and right on time.', 'I liberate myself and others from unnecessary limitation today.', 'I am a beacon of innovation, freedom, and compassionate intelligence.'],
  Pisces:      ['My imagination today creates the reality of tomorrow.', 'I trust the flow of life to carry me exactly where I belong.', 'My compassion and empathy heal everything they touch today.', 'I channel divine creativity through my uniquely gifted hands.', 'I am aligned with the deepest wisdom of the cosmos.', 'My spiritual sensitivity is a rare and precious gift today.', 'I dream boldly and materialise those dreams with loving patience.', 'I dissolve all separation and connect with the universal love within me.'],
};

// Vedic-inspired lucky animal for each day modulo
const LUCKY_ANIMALS = ['Elephant','Peacock','Cow','Horse','Swan','Lion','Tiger','Eagle','Deer','Tortoise','Parrot','Fish'];

// Colour hex for display
const COLOR_HEX = {
  Red:'#EF4444', Crimson:'#DC143C', Scarlet:'#FF2400', Orange:'#F97316', Gold:'#C9A84C',
  Coral:'#FF7F7F', Maroon:'#7F0000', Copper:'#B87333', Green:'#22C55E', Emerald:'#10B981',
  Pink:'#EC4899', White:'#F9FAFB', Ivory:'#FFFFF0', Sage:'#8FAF7E', 'Rose Gold':'#B76E79',
  Mint:'#98FF98', Yellow:'#EAB308', Lime:'#84CC16', Turquoise:'#14B8A6', 'Sky Blue':'#87CEEB',
  Silver:'#94A3B8', 'Light Green':'#86EFAC', Lavender:'#C4B5FD', Cyan:'#22D3EE',
  'Pale Blue':'#AEC6CF', Cream:'#FFFDD0', 'Sea Green':'#2E8B57', Moonlight:'#E8E8D0',
  Amber:'#F59E0B', 'Royal Blue':'#4169E1', Bronze:'#CD7F32', Honey:'#FFD700',
  Navy:'#1E3A8A', Olive:'#808000', Grey:'#6B7280', Teal:'#0D9488', 'Forest Green':'#228B22',
  'Dark Blue':'#00008B', 'Light Blue':'#ADD8E6', Peach:'#FFCBA4', Rose:'#FF007F',
  'Deep Red':'#8B0000', 'Dark Purple':'#301934', Black:'#1F2937', Burgundy:'#800020',
  Indigo:'#4F46E5', Magenta:'#FF00FF', Purple:'#A855F7', Violet:'#7C3AED',
  'Electric Blue':'#7DF9FF', 'Sky Blue2':'#7DD3FC', 'Aqua':'#00FFFF', 'Ocean Blue':'#006994',
  Seafoam:'#9FE2BF', Charcoal:'#36454F', 'Dark Green':'#006400',
};

function getHex(colorName) {
  return COLOR_HEX[colorName] || '#C9A84C';
}

function dateSeed(date, offset) {
  const d = new Date(date);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return (dayOfYear * 7 + offset * 31) % 100000;
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

async function getToday(req, res) {
  try {
    const { sign } = req.params;
    const capSign = sign.charAt(0).toUpperCase() + sign.slice(1);
    if (!SIGN_META[capSign]) return res.status(400).json({ error: 'Invalid sign', validSigns: SIGNS });

    const today = new Date().toISOString().split('T')[0];
    const meta  = SIGN_META[capSign];
    const signIdx = SIGNS.indexOf(capSign);

    const s1 = dateSeed(today, signIdx);
    const s2 = dateSeed(today, signIdx + 13);
    const s3 = dateSeed(today, signIdx + 27);
    const s4 = dateSeed(today, signIdx + 41);
    const s5 = dateSeed(today, signIdx + 53);
    const s6 = dateSeed(today, signIdx + 67);
    const s7 = dateSeed(today, signIdx + 79);

    const luckyColor     = pick(COLORS[capSign],   s1);
    const luckyNumber    = pick(NUMBERS[capSign],  s2);
    const luckyDirection = pick(DIRECTIONS,        s3);
    const luckyHour      = pick(LUCKY_HOURS,       s4);
    const luckyDay       = pick(LUCKY_DAYS,        s5);
    const luckyWord      = pick(LUCKY_WORDS[capSign], s6);
    const affirmation    = pick(AFFIRMATIONS[capSign], s7);
    const luckyAnimal    = pick(LUCKY_ANIMALS,     s1 + s2);

    res.json({
      sign: capSign,
      date: today,
      symbol: meta.symbol,
      element: meta.element,
      ruler: meta.ruler,
      luckyColor, luckyColorHex: getHex(luckyColor),
      luckyNumber,
      luckyDirection,
      luckyHour,
      luckyDay,
      luckyWord,
      affirmation,
      luckyAnimal,
      luckyStone: meta.stone,
      luckyMetal: meta.metal,
      deity: meta.deity,
      mantra: meta.mantra,
    });
  } catch (err) {
    console.error('[Lucky]', err);
    res.status(500).json({ error: 'Failed to generate lucky info' });
  }
}

async function getAllToday(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const results = {};
    for (const sign of SIGNS) {
      const meta  = SIGN_META[sign];
      const signIdx = SIGNS.indexOf(sign);
      const s1 = dateSeed(today, signIdx);
      const s2 = dateSeed(today, signIdx + 13);
      results[sign] = {
        symbol:        meta.symbol,
        luckyColor:    pick(COLORS[sign], s1),
        luckyColorHex: getHex(pick(COLORS[sign], s1)),
        luckyNumber:   pick(NUMBERS[sign], s2),
        luckyStone:    meta.stone,
      };
    }
    res.json({ date: today, signs: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
}

function getLuckyForSign(sign) {
  const capSign = sign.charAt(0).toUpperCase() + sign.slice(1);
  if (!SIGN_META[capSign]) return { luckyColor: 'Gold', luckyNumber: 7 };
  const today = new Date().toISOString().split('T')[0];
  const signIdx = SIGNS.indexOf(capSign);
  const s1 = dateSeed(today, signIdx);
  const s2 = dateSeed(today, signIdx + 13);
  return {
    luckyColor:    pick(COLORS[capSign], s1),
    luckyColorHex: getHex(pick(COLORS[capSign], s1)),
    luckyNumber:   pick(NUMBERS[capSign], s2),
  };
}

module.exports = { getToday, getAllToday, getLuckyForSign };
