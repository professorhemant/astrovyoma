import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Direction data ─────────────────────────────────────────────────────────────
const DIRECTIONS = [
  {
    dir: 'North', short: 'N', symbol: '↑', angle: 0,
    lord: 'Kubera', planet: 'Mercury', element: 'Water',
    color: '#22c55e', colorName: 'Green & Blue',
    bestFor: ['Home office / study', 'Locker & financial safe', 'Cash register / business area'],
    avoid:   ['Heavy storage', 'Bedroom', 'Toilet'],
    tip: 'Keep the north wall lean and clutter-free. A clean north zone attracts wealth and prosperity. Add a water feature or aquarium here.',
    remedy: 'Place a Kuber Yantra or green plants on the north wall.',
  },
  {
    dir: 'Northeast', short: 'NE', symbol: '↗', angle: 45,
    lord: 'Shiva (Ishana)', planet: 'Jupiter', element: 'Water',
    color: '#f59e0b', colorName: 'White & Light Yellow',
    bestFor: ['Puja / prayer room', 'Meditation corner', 'Study room'],
    avoid:   ['Toilet / bathroom', 'Kitchen', 'Bedroom', 'Heavy storage'],
    tip: 'The most sacred corner of the home. Keep it clean, open, and well-lit. Never place a toilet or kitchen here — it is considered the most severe Vastu dosha.',
    remedy: 'Place a copper Kalash with water, light incense and a diya here daily.',
  },
  {
    dir: 'East', short: 'E', symbol: '→', angle: 90,
    lord: 'Indra', planet: 'Sun', element: 'Air',
    color: '#f97316', colorName: 'White & Light',
    bestFor: ['Main entrance / door', 'Living room', 'Windows & balcony'],
    avoid:   ['Blocking with high walls', 'Heavy furniture near east wall'],
    tip: 'The east faces the rising sun — most auspicious direction for the main entrance. Ensure morning sunlight enters freely. Windows on the east bring vitality and health.',
    remedy: 'Place a solar symbol (Surya yantra) near the east entrance.',
  },
  {
    dir: 'Southeast', short: 'SE', symbol: '↘', angle: 135,
    lord: 'Agni (Fire)', planet: 'Venus', element: 'Fire',
    color: '#ef4444', colorName: 'Orange, Red & Pink',
    bestFor: ['Kitchen', 'Electrical equipment', 'Generator / UPS'],
    avoid:   ['Bedroom (causes arguments)', 'Puja room', 'Study'],
    tip: 'The fire zone — ideal for the kitchen. The cooking fire aligns with the southeast\'s fire energy. Electrical appliances placed here run more efficiently and reliably.',
    remedy: 'If kitchen is elsewhere, place a lit diya or a red triangle yantra in the SE corner.',
  },
  {
    dir: 'South', short: 'S', symbol: '↓', angle: 180,
    lord: 'Yama', planet: 'Mars', element: 'Earth',
    color: '#dc2626', colorName: 'Red & Pink',
    bestFor: ['Master bedroom', 'Heavy storage', 'Storeroom'],
    avoid:   ['Main entrance', 'Study for children', 'Puja room'],
    tip: 'Sleep with your head pointing south and feet north for deep, restful sleep and good health. The south is associated with stability and rest. A south entrance can bring challenges — compensate with bright lighting and a Swastik symbol.',
    remedy: 'Hang a brass Swastik with Om symbol on the south wall to neutralize Yama\'s energy.',
  },
  {
    dir: 'Southwest', short: 'SW', symbol: '↙', angle: 225,
    lord: 'Nairutya', planet: 'Rahu', element: 'Earth',
    color: '#92400e', colorName: 'Yellow & Brown',
    bestFor: ['Master bedroom', 'Heaviest furniture', 'Head of family\'s room'],
    avoid:   ['Main door', 'Puja room', 'Guest room', 'Kitchen'],
    tip: 'The heaviest, most stable corner — load it down. The head of the household should sleep here. Never keep this corner empty or light. A toilet here is a major dosha.',
    remedy: 'Place heavy furniture, boulders, or a large plant in the SW to anchor this corner.',
  },
  {
    dir: 'West', short: 'W', symbol: '←', angle: 270,
    lord: 'Varuna', planet: 'Saturn', element: 'Air',
    color: '#6366f1', colorName: 'Blue & Grey',
    bestFor: ['Children\'s bedroom', 'Study room', 'Dining area'],
    avoid:   ['Master bedroom (for couple)', 'Puja room on this wall alone'],
    tip: 'Saturn\'s disciplined energy makes the west ideal for children\'s rooms and study. Children sleeping or studying here tend to be focused and academically inclined.',
    remedy: 'Place a globe or world map in the west corner to enhance children\'s academic performance.',
  },
  {
    dir: 'Northwest', short: 'NW', symbol: '↖', angle: 315,
    lord: 'Vayu', planet: 'Moon', element: 'Air',
    color: '#8b5cf6', colorName: 'White & Silver',
    bestFor: ['Guest bedroom', 'Storage room', 'Bathroom / toilet'],
    avoid:   ['Master bedroom', 'Main entrance'],
    tip: 'The air zone governed by the Moon promotes movement and change. Guests placed here naturally feel inclined to leave after their stay — ideal for short-term guests. Don\'t place permanent beds here.',
    remedy: 'Hang wind chimes in the NW to harness Vayu energy and keep energy circulating.',
  },
];

// ── Room data ─────────────────────────────────────────────────────────────────
const ROOMS = [
  {
    name: 'Main Entrance', icon: '🚪',
    bestDirection: 'East or North',
    color: '#f97316',
    dos: [
      'Face east or north — most auspicious directions for wealth and health',
      'Keep the entrance well-lit, clean, and welcoming',
      'Place a nameplate, Swastik or OM symbol near the door',
      'Main door should open inward, clockwise',
      'Keep a welcome mat (red or green) outside',
      'Ensure the door opens fully — partial opening blocks opportunities',
    ],
    donts: [
      'Avoid south or southwest entrance if possible',
      'No broken door or squeaky hinges — fix immediately',
      'Do not place shoe rack right at the threshold',
      'Avoid a mirror directly facing the entrance',
      'No staircase facing the front door',
    ],
  },
  {
    name: 'Living Room', icon: '🛋️',
    bestDirection: 'East or North',
    color: '#22c55e',
    dos: [
      'Place heavy furniture (sofa, bookshelf) in south or west',
      'Sit facing north or east while entertaining guests',
      'Use warm, bright colors — cream, beige, light green',
      'Place family photos on south or west walls',
      'Keep northeast corner open, clean, and well-lit',
      'Electronic devices (TV) on southeast wall',
    ],
    donts: [
      'Avoid dark, heavy colors like black or dark red on north/east walls',
      'No beams or low ceilings — use false ceiling if present',
      'Avoid placing a mirror on the south wall',
      'No clutter or broken items anywhere',
    ],
  },
  {
    name: 'Kitchen', icon: '🍳',
    bestDirection: 'Southeast (Ideal) or Northwest',
    color: '#ef4444',
    dos: [
      'Cook facing east — most auspicious; second best is facing north',
      'Gas stove in southeast corner of kitchen',
      'Store water in northeast corner of kitchen',
      'Keep the kitchen clean and ventilated',
      'Use warm colors — yellow, orange, red',
      'Refrigerator in southwest or northwest',
    ],
    donts: [
      'Avoid kitchen in northeast — major Vastu dosha',
      'Never place stove directly under a window',
      'Sink and stove should not be side by side (water and fire conflict)',
      'No toilets above or below the kitchen',
      'Avoid cooking facing south or west',
    ],
  },
  {
    name: 'Master Bedroom', icon: '🛏️',
    bestDirection: 'Southwest',
    color: '#8b5cf6',
    dos: [
      'Sleep with head pointing south — best for deep sleep and health',
      'Bed in southwest corner of the room',
      'Use earthy tones — beige, cream, light brown',
      'Mirror on north or east wall only (never facing bed)',
      'Place a bedroom in south, west, or southwest zone of home',
      'Heavy wardrobe on south or west walls',
    ],
    donts: [
      'Never sleep with head pointing north (magnetic interference)',
      'No mirror facing the sleeping person',
      'Avoid bedroom in northeast — affects health and relationships',
      'No electronic devices (TV, phone) near the bed during sleep',
      'No water feature in bedroom',
      'Avoid irregular shaped rooms for bedroom',
    ],
  },
  {
    name: 'Children\'s Room', icon: '🧒',
    bestDirection: 'West or Northwest',
    color: '#06b6d4',
    dos: [
      'Study table facing east or north — improves focus and learning',
      'Bed with head towards east or south',
      'Use light, cheerful colors — yellow, green, light blue',
      'Place study in west zone — Saturn promotes discipline',
      'Keep the room organized and clutter-free',
      'Good natural light from east side',
    ],
    donts: [
      'No heavy, dark colors in children\'s rooms',
      'Avoid southwest bedroom for children — too heavy and grounding',
      'No violent or dark imagery on walls',
      'Avoid beams over the study table or bed',
    ],
  },
  {
    name: 'Puja / Prayer Room', icon: '🪔',
    bestDirection: 'Northeast (Best) or East',
    color: '#f59e0b',
    dos: [
      'Place idols and pictures on east or west wall (face east when praying)',
      'Use white, yellow, or light colors',
      'Keep northeast open and elevated for the altar',
      'Light a diya daily; use fresh flowers',
      'Keep it clean, fragrant, and energetically pure',
      'Copper Kalash with holy water in the puja room',
    ],
    donts: [
      'Avoid puja room under a staircase or toilet',
      'No puja room in bedroom or kitchen if possible',
      'Do not place idols facing south',
      'Avoid broken or chipped idols',
      'Never store old/unused items in the puja room',
    ],
  },
  {
    name: 'Study / Home Office', icon: '📚',
    bestDirection: 'North or East',
    color: '#3b82f6',
    dos: [
      'Work or study facing north (wealth energy) or east (creativity)',
      'Place study/office in north, northeast, or east zone',
      'Bookshelf on west or south walls',
      'Use green plants to improve concentration and air quality',
      'Good natural light from east windows',
      'Keep desk clean and organized — paper clutter blocks opportunities',
    ],
    donts: [
      'Avoid southwest facing desk (leads to confusion and obstacles)',
      'No bathroom or toilet near the study wall',
      'Avoid sitting under beams or low ceilings',
      'No portrait of negative imagery behind the work chair',
    ],
  },
  {
    name: 'Bathroom / Toilet', icon: '🚿',
    bestDirection: 'Northwest or West',
    color: '#64748b',
    dos: [
      'Place bathrooms in northwest or west zones',
      'Keep the bathroom door closed at all times',
      'Use light colors — white, cream, light blue',
      'Ensure good ventilation — stagnant air = stagnant energy',
      'Keep it clean, leak-free, and well-lit',
      'Salt in a bowl in the bathroom absorbs negative energy',
    ],
    donts: [
      'Never place bathroom in northeast — most severe Vastu dosha',
      'Avoid bathroom directly adjacent to or above puja room',
      'No dripping taps — represents financial drain',
      'Avoid mirrors on south wall of bathroom',
      'No bathroom directly above the kitchen',
    ],
  },
];

// ── Dosha data ────────────────────────────────────────────────────────────────
const DOSHAS = [
  {
    title: 'Main Door in South or Southwest',
    severity: 'High',
    effect: 'Financial losses, health problems, obstacles in career and relationship.',
    remedies: [
      'Place a brass Swastik or OM symbol on the door',
      'Hang a Vastu pyramid above the entrance',
      'Use a bright red welcome mat outside',
      'Install bright white lighting on both sides of the door',
      'Keep a tulsi (holy basil) plant at the entrance',
    ],
  },
  {
    title: 'Kitchen in Northeast',
    severity: 'High',
    effect: 'Financial problems, mental stress, health issues for the head of family.',
    remedies: [
      'Place a Vastu pyramid in the northeast corner of kitchen',
      'Keep a bowl of sea salt (uncovered) and change weekly',
      'Hang a picture of Lord Ganesha on the kitchen wall',
      'Use copper utensils prominently in this kitchen',
      'Energize the SE corner of home with a lit diya',
    ],
  },
  {
    title: 'Toilet / Bathroom in Northeast',
    severity: 'High',
    effect: 'Most severe Vastu dosha — affects all aspects of life including health, wealth, relationships.',
    remedies: [
      'Keep the bathroom door shut always; door should be solid, not glass',
      'Place a bowl of sea salt inside — change every week',
      'Burn camphor inside daily for 15–20 minutes',
      'Place a Vastu pyramid or crystal ball inside',
      'Install bright lighting and ensure there are no leaks',
    ],
  },
  {
    title: 'Bedroom in Northeast',
    severity: 'Medium',
    effect: 'Disturbed sleep, health problems, relationship discord, lack of peace of mind.',
    remedies: [
      'Place green plants in the northeast corner of the room',
      'Sleep with head towards south and feet north',
      'Use light, calming colors — avoid dark shades',
      'Place a crystal bowl with water and floating flowers',
      'Keep the northeast area of the room clear of clutter',
    ],
  },
  {
    title: 'Beam or Low Ceiling Over Bed or Work Desk',
    severity: 'Medium',
    effect: 'Headaches, stress, anxiety, obstacles, pressure at work or in relationships.',
    remedies: [
      'Install a false ceiling to hide the beam',
      'Hang two bamboo flutes (at 45° angle) on the beam with red ribbon',
      'Move the bed or desk away from directly under the beam',
      'Place a crystal ball below the beam to deflect heavy energy',
    ],
  },
  {
    title: 'Clutter in Northeast or Center of Home',
    severity: 'Medium',
    effect: 'Blocked opportunities, mental fog, financial stagnation, family conflicts.',
    remedies: [
      'Immediate decluttering — donate or discard unused items',
      'Add a water feature (fountain or aquarium) in the northeast',
      'Place a bowl of fresh flowers or plants in the NE',
      'Regular smudging with dhoop, incense, or camphor smoke',
      'Keep the Brahmasthan (center) completely free — no columns here',
    ],
  },
  {
    title: 'Staircase in Center (Brahmasthan)',
    severity: 'High',
    effect: 'Heart-related issues, decision-making problems, family instability.',
    remedies: [
      'Hang bright lighting throughout the staircase',
      'Place green plants at bottom and top of stairs',
      'Use light, uplifting colors on staircase walls',
      'Place a Vastu pyramid under the staircase landing',
      'Burn camphor in the central area daily',
    ],
  },
  {
    title: 'Broken or Cracked Mirror',
    severity: 'Medium',
    effect: 'Bad luck, accidents, relationship problems, negative energy multiplication.',
    remedies: [
      'Remove and discard the broken mirror immediately',
      'Do not use broken mirrors even temporarily',
      'Replace with a clean, clear mirror of appropriate size',
      'After replacing, burn camphor in that room',
    ],
  },
  {
    title: 'Water Leakage (Taps, Pipes, Toilets)',
    severity: 'Medium',
    effect: 'Financial drain, unexpected expenses, instability in income.',
    remedies: [
      'Fix all leaks immediately — no delay',
      'A dripping tap in the north represents leaking wealth',
      'After repairs, place a copper coin near the repaired area',
      'Regularly check all plumbing to prevent recurring leaks',
    ],
  },
  {
    title: 'Dark or Poorly Lit Entrance',
    severity: 'Low',
    effect: 'Opportunities miss the home, lack of positive energy flow, low vitality.',
    remedies: [
      'Install bright LED lights (warm white) on both sides of entrance',
      'Place mirror to reflect more light into the space',
      'Use light colors (white/cream/yellow) near the entrance',
      'Add a fragrant plant like jasmine near the door',
    ],
  },
];

// ── Direction compass component ───────────────────────────────────────────────
function DirectionCard({ d, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`rounded-2xl p-4 border text-center transition-all ${
        selected
          ? 'border-opacity-60 scale-105 shadow-lg'
          : 'border-gold-600/15 bg-cosmic-900/40 hover:border-gold-500/30'
      }`}
      style={selected ? { borderColor: d.color + '80', background: d.color + '15', boxShadow: `0 0 24px ${d.color}20` } : {}}>
      <div className="text-3xl mb-1" style={{ color: d.color }}>{d.symbol}</div>
      <div className="font-semibold text-gray-100 text-sm">{d.dir}</div>
      <div className="text-gray-500 text-xs mt-0.5">{d.planet}</div>
    </button>
  );
}

function DirectionDetail({ d }) {
  return (
    <motion.div key={d.dir} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      className="card-cosmic rounded-2xl p-6 border-2" style={{ borderColor: d.color + '40' }}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border"
          style={{ background: d.color + '20', borderColor: d.color + '40', color: d.color }}>
          {d.symbol}
        </div>
        <div>
          <h3 className="font-serif text-2xl text-gold-400">{d.dir}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { label:'Lord', val: d.lord },
              { label:'Planet', val: d.planet },
              { label:'Element', val: d.element },
              { label:'Colors', val: d.colorName },
            ].map(({ label, val }) => (
              <span key={label} className="text-xs px-2 py-0.5 rounded-full bg-cosmic-800 border border-white/8 text-gray-400">
                {label}: <span className="text-gray-200">{val}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400 text-xs uppercase tracking-wider mb-2 font-semibold">✓ Best For</p>
          <ul className="space-y-1">
            {d.bestFor.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-xs uppercase tracking-wider mb-2 font-semibold">✗ Avoid</p>
          <ul className="space-y-1">
            {d.avoid.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl bg-gold-500/5 border border-gold-600/15 p-4">
        <p className="text-gold-400 text-xs uppercase tracking-wider mb-1">✦ Vastu Tip</p>
        <p className="text-gray-300 text-sm leading-relaxed">{d.tip}</p>
      </div>
      <p className="text-gray-500 text-xs mt-3 italic">Remedy: {d.remedy}</p>
    </motion.div>
  );
}

function RoomCard({ room }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-cosmic rounded-2xl border border-gold-600/15 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-5 text-left flex items-center gap-4">
        <span className="text-3xl flex-shrink-0">{room.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-100">{room.name}</p>
          <p className="text-xs mt-0.5" style={{ color: room.color }}>
            Best: {room.bestDirection}
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}>
            <div className="px-5 pb-5 border-t border-white/5 pt-4 grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-green-400 text-xs uppercase tracking-wider mb-2 font-semibold">✓ Do's</p>
                <ul className="space-y-1.5">
                  {room.dos.map((d, i) => (
                    <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-red-400 text-xs uppercase tracking-wider mb-2 font-semibold">✗ Don'ts</p>
                <ul className="space-y-1.5">
                  {room.donts.map((d, i) => (
                    <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoshaItem({ dosha }) {
  const [open, setOpen] = useState(false);
  const severityColor = dosha.severity === 'High' ? '#ef4444' : dosha.severity === 'Medium' ? '#f97316' : '#f59e0b';
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: severityColor + '30', background: severityColor + '05' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-5 text-left flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-100 text-sm">⚠ {dosha.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
              style={{ color: severityColor, borderColor: severityColor + '50', background: severityColor + '15' }}>
              {dosha.severity} Severity
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-1 line-clamp-1">{dosha.effect}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}>
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
              <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-3">
                <p className="text-red-300 text-xs font-semibold mb-1">Effect</p>
                <p className="text-gray-300 text-sm">{dosha.effect}</p>
              </div>
              <div>
                <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">✦ Remedies</p>
                <ul className="space-y-1.5">
                  {dosha.remedies.map((r, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-gold-500 mt-0.5 flex-shrink-0">{i+1}.</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = ['Directions', 'Room Guide', 'Doshas & Remedies'];

export default function VastuPage() {
  const [tab, setTab] = useState(0);
  const [selectedDir, setSelectedDir] = useState(DIRECTIONS[0]);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Ancient Spatial Science</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            वास्तु शास्त्र
          </h1>
          <p className="text-gray-300 text-xl mb-1">Vastu Shastra Guide</p>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            The Vedic science of harmonious living — aligning your home with cosmic energies for health, wealth, and happiness
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          className="flex gap-1 bg-cosmic-800/50 rounded-xl p-1 mb-8 max-w-lg mx-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === i
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}>
              {t}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* ── Directions ── */}
          {tab === 0 && (
            <motion.div key="dir" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <p className="text-gray-400 text-sm text-center mb-6">
                Click any direction to see its Vastu significance, best uses, and remedies
              </p>

              {/* Compass-style 8-direction grid */}
              <div className="grid grid-cols-4 md:grid-cols-4 gap-2 mb-8 max-w-lg mx-auto">
                {/* Row 1: NW, N, NE + blank */}
                {[6,7,0,null,3,null,null,null,4,null,null,null,5,2,1,null].map((idx, gi) =>
                  idx !== null ? (
                    <DirectionCard key={DIRECTIONS[idx].dir} d={DIRECTIONS[idx]}
                      selected={selectedDir.dir === DIRECTIONS[idx].dir}
                      onClick={() => setSelectedDir(DIRECTIONS[idx])} />
                  ) : (
                    gi === 3 ? (
                      <div key={`blank-${gi}`} className="rounded-2xl border border-gold-600/10 bg-cosmic-900/20 flex items-center justify-center">
                        <span className="text-gold-400/30 text-2xl font-serif">✦</span>
                      </div>
                    ) : (
                      <div key={`blank-${gi}`} />
                    )
                  )
                )}
              </div>

              {/* Actually, let me use a simpler 8-button grid with compass labels */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {DIRECTIONS.map(d => (
                  <DirectionCard key={d.dir} d={d}
                    selected={selectedDir.dir === d.dir}
                    onClick={() => setSelectedDir(d)} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <DirectionDetail key={selectedDir.dir} d={selectedDir} />
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Room Guide ── */}
          {tab === 1 && (
            <motion.div key="rooms" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-3">
              <p className="text-gray-400 text-sm text-center mb-4">
                Expand any room for detailed Vastu guidelines and best practices
              </p>
              {ROOMS.map(room => <RoomCard key={room.name} room={room} />)}
            </motion.div>
          )}

          {/* ── Doshas & Remedies ── */}
          {tab === 2 && (
            <motion.div key="doshas" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <p className="text-gray-400 text-sm text-center mb-6">
                Common Vastu doshas, their effects, and traditional remedies
              </p>
              <div className="space-y-3">
                {DOSHAS.map(d => <DoshaItem key={d.title} dosha={d} />)}
              </div>

              {/* CTA */}
              <div className="mt-8 rounded-2xl bg-gold-500/5 border border-gold-600/20 p-6 text-center">
                <p className="text-gold-400 font-serif text-lg mb-2">Need a Personalised Vastu Consultation?</p>
                <p className="text-gray-400 text-sm mb-4">
                  Our expert astrologers and Vastu consultants can analyse your floor plan, birth details, and home orientation for a comprehensive report.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/vastu-pooja"
                    className="inline-block btn-gold px-8 py-3 text-sm font-semibold">
                    🏠 Book Vastu Puja →
                  </Link>
                  <Link to="/astrologers"
                    className="inline-block border border-gold-500/40 text-gold-400 px-8 py-3 rounded-xl text-sm font-semibold hover:bg-gold-500/10 transition-colors">
                    Consult a Vastu Expert
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer cross-links */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-gold-600/10">
          <Link to="/remedies"
            className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
            🌿 Vedic Remedies
          </Link>
          <Link to="/panchang"
            className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
            📅 Shubh Muhurat
          </Link>
          <Link to="/vastu-pooja"
            className="flex-1 text-center py-3 rounded-xl border border-gold-600/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all">
            🏠 Book Vastu Puja
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
