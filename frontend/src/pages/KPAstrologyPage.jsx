import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollDatePicker from '../components/ScrollDatePicker';
import toast from 'react-hot-toast';
import { ChevronDown, MapPin, Clock } from 'lucide-react';
import { kpAstrology, geocode, reportHistory } from '../api';
import { useAuth } from '../context/AuthContext';
import { Bookmark } from 'lucide-react';

const TABS = ['KP Report', 'Cuspal Sub-Lords', 'Planetary Lords', 'Significators', 'Event Query'];

const EVENT_OPTIONS = [
  { value: 'marriage',     label: '💍 Marriage' },
  { value: 'career',       label: '💼 Career / Job' },
  { value: 'finance',      label: '💰 Finance / Wealth' },
  { value: 'health',       label: '🏥 Health' },
  { value: 'education',    label: '🎓 Education' },
  { value: 'travel',       label: '✈️ Travel / Foreign' },
  { value: 'property',     label: '🏠 Property / House' },
  { value: 'children',     label: '👶 Children' },
  { value: 'spirituality', label: '🙏 Spirituality / Moksha' },
];

const PLANET_COLOR = {
  Sun:'text-amber-400', Moon:'text-sky-300', Mars:'text-red-400',
  Mercury:'text-green-400', Jupiter:'text-yellow-300', Venus:'text-pink-400',
  Saturn:'text-purple-400', Rahu:'text-teal-400', Ketu:'text-orange-400'
};

function PlanetBadge({ name }) {
  return <span className={`font-medium ${PLANET_COLOR[name] || 'text-gray-300'}`}>{name}</span>;
}

// ── KP Report Tab ───────────────────────────────────────────────────────────
const SIGN_NATURE = {
  Aries:       { traits: 'courageous, impulsive, and pioneering',              element: 'Fire'  },
  Taurus:      { traits: 'patient, practical, and determined',                 element: 'Earth' },
  Gemini:      { traits: 'intellectual, communicative, and adaptable',         element: 'Air'   },
  Cancer:      { traits: 'sensitive, nurturing, and home-loving',              element: 'Water' },
  Leo:         { traits: 'creative, generous, and leadership-oriented',        element: 'Fire'  },
  Virgo:       { traits: 'meticulous, service-oriented, and health-conscious', element: 'Earth' },
  Libra:       { traits: 'diplomatic, balanced, and partnership-oriented',     element: 'Air'   },
  Scorpio:     { traits: 'investigative, transformative, and deeply perceptive', element: 'Water' },
  Sagittarius: { traits: 'optimistic, freedom-loving, and wisdom-seeking',    element: 'Fire'  },
  Capricorn:   { traits: 'disciplined, structured, and achievement-oriented', element: 'Earth' },
  Aquarius:    { traits: 'humanitarian, independent, and forward-thinking',   element: 'Air'   },
  Pisces:      { traits: 'compassionate, intuitive, and spiritually inclined', element: 'Water' },
};

const ELEMENT_DESC = {
  Fire:  'enthusiasm, initiative, and a bold approach to life',
  Earth: 'practicality, stability, and a grounded perspective',
  Air:   'mental agility, social intelligence, and versatility',
  Water: 'emotional depth, intuition, and empathetic understanding',
};

const NAKSHATRA_QUALITY = {
  'Ashwini':'swift, healing, and pioneering','Bharani':'transformative and persistent',
  'Krittika':'sharp, purifying, and determined','Rohini':'fertile, nurturing, and materialistic',
  'Mrigashira':'curious, searching, and gentle','Ardra':'intense and research-oriented',
  'Punarvasu':'nurturing and philosophical','Pushya':'nourishing and spiritually inclined',
  'Ashlesha':'serpentine and perceptive','Magha':'royal and authoritative',
  'Purva Phalguni':'creative and romantic','Uttara Phalguni':'service-oriented and social',
  'Hasta':'skilled and resourceful','Chitra':'creative and multi-talented',
  'Swati':'independent and business-minded','Vishakha':'goal-oriented and determined',
  'Anuradha':'devoted and friendly','Jyeshtha':'wise and leadership-oriented',
  'Mula':'investigative and philosophical','Purva Ashadha':'optimistic and invincible',
  'Uttara Ashadha':'responsible, ethical, and universally victorious',
  'Shravana':'listening, learning, and connecting','Dhanishtha':'musical and prosperous',
  'Shatabhisha':'healing, independent, and mysterious','Purva Bhadrapada':'intense and dualistic',
  'Uttara Bhadrapada':'wise, compassionate, and disciplined','Revati':'nurturing and protective',
};

const DASHA_DESC = {
  Sun:     'authority, government work, and self-expression. Confidence and recognition are highlighted.',
  Moon:    'emotions, home life, and mental peace. Travel and mother\'s influence are key themes.',
  Mars:    'energy, property dealings, and ambition. Physical drive is high — channel it constructively.',
  Mercury: 'intellect, business, writing, and communication. Education and trade flourish.',
  Jupiter: 'expansion, wisdom, and spiritual growth. One of the most beneficial dasha periods.',
  Venus:   'relationships, luxury, and creative pursuits. Comfort and enjoyment are favored.',
  Saturn:  'discipline and hard work. Challenging but rewards consistent effort with lasting results.',
  Rahu:    'sudden changes, foreign connections, and unconventional opportunities. Stay grounded.',
  Ketu:    'spirituality and detachment. Material pursuits feel unfulfilling — a period of inner growth.',
};

const AREA_CONFIG = [
  { domain:'career',     icon:'💼', label:'Career & Profession',      primaryHouse:10, favorable:[10,6,11], avoid:[8,12],
    pos:'Career houses (10, 6, 11) are well signified — professional growth and recognition are strongly supported.',
    neg:'Career houses are under challenging influence — obstacles and delays may arise. Consistent effort during the right dasha will break through.',
    mix:'Career shows a mixed picture — opportunities exist but obstacles too. Patience and timing are critical.' },
  { domain:'marriage',   icon:'💍', label:'Marriage & Relationships',  primaryHouse:7,  favorable:[7,2,11], avoid:[6,8,12],
    pos:'The 7th house sub-lord signifies partnership houses well — harmonious marriage and lasting relationships are indicated.',
    neg:'The 7th house sub-lord signifies challenging houses (6, 8, or 12) — delays or friction in relationships are possible. Patience and communication are essential.',
    mix:'Relationships show both promise and complexity. Marriage is indicated but may need careful partner selection and adjustments.' },
  { domain:'wealth',     icon:'💰', label:'Wealth & Finance',          primaryHouse:2,  favorable:[2,11,9], avoid:[6,8,12],
    pos:'Wealth houses (2, 11) are strongly signified — financial gains through multiple sources are indicated. Investments in favorable dasha periods will grow well.',
    neg:'The 2nd house sub-lord signifies loss or expenditure houses — unnecessary outflow of money is possible. Avoid risky investments and maintain strict financial discipline.',
    mix:'Finances are moderate — income is indicated but so are expenditures. Systematic saving and avoiding speculation are important.' },
  { domain:'health',     icon:'🏥', label:'Health & Vitality',         primaryHouse:1,  favorable:[1,11],   avoid:[6,8,12],
    pos:'The Ascendant sub-lord supports good health and physical vitality. The chart indicates a strong constitution with good recovery ability.',
    neg:'The Ascendant sub-lord points to some health concerns — preventive care is important. Be especially cautious during 6th or 8th house dasha periods.',
    mix:'Health is generally manageable but not without periodic concerns. A healthy lifestyle and regular checkups are advisable.' },
  { domain:'education',  icon:'🎓', label:'Education & Learning',      primaryHouse:5,  favorable:[4,5,9],  avoid:[8,12],
    pos:'Education houses (4, 5, 9) are well supported — higher education, certifications, and intellectual achievements are strongly indicated.',
    neg:'Educational matters may face interruptions or delays. Practical, focused fields of study and consistent effort will overcome obstacles.',
    mix:'Education is supported but requires focused effort. Success comes through steady preparation rather than last-minute work.' },
];

function ReportTab({ data }) {
  const { lagna, moon_sign, nakshatra, nakshatra_lord, ruling_planets,
          kp_cusps = {}, significators = {}, current_dasha, current_antardasha } = data;

  const isSignificatorOf = (planet, house) =>
    (significators[house]?.planets || []).includes(planet);

  const getVerdict = ({ favorable, avoid, primaryHouse }) => {
    const cusp = kp_cusps[primaryHouse] || {};
    const sl = cusp.sub_lord;
    if (!sl) return 'neutral';
    const pos = favorable.some(h => isSignificatorOf(sl, h));
    const neg = avoid.some(h => isSignificatorOf(sl, h));
    if (pos && !neg) return 'positive';
    if (neg && !pos) return 'negative';
    return 'mixed';
  };

  const areaVerdicts = AREA_CONFIG.map(a => ({ ...a, verdict: getVerdict(a) }));
  const posCount = areaVerdicts.filter(a => a.verdict === 'positive').length;
  const negCount = areaVerdicts.filter(a => a.verdict === 'negative').length;
  const overallGood = posCount >= negCount;

  const lagnaInfo = SIGN_NATURE[lagna] || { traits: 'distinctive qualities', element: 'Air' };
  const nakDesc = NAKSHATRA_QUALITY[nakshatra] || 'distinctive';
  const dashaName = current_dasha?.planet || current_dasha || '';
  const antarName = current_antardasha?.planet || current_antardasha || '';

  const h1c = kp_cusps[1] || {};
  const h7c = kp_cusps[7] || {};
  const h10c = kp_cusps[10] || {};

  return (
    <div className="space-y-5 text-sm">

      {/* Overall Verdict */}
      <div className={`rounded-xl p-5 border-l-4 ${overallGood ? 'border-emerald-400 bg-emerald-400/5' : 'border-amber-400 bg-amber-400/5'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{overallGood ? '✨' : '⚡'}</span>
          <h3 className={`font-serif text-base font-semibold ${overallGood ? 'text-emerald-400' : 'text-amber-400'}`}>
            {overallGood ? 'Overall Favorable Chart — Positive Outlook' : 'Chart Needs Effort — Growth Through Discipline'}
          </h3>
        </div>
        <p className="text-cosmic-300 leading-relaxed text-sm">
          Your <strong className="text-cosmic-100">{lagna}</strong> ascendant with Moon in <strong className="text-cosmic-100">{moon_sign}</strong> and
          birth nakshatra <strong className="text-cosmic-100">{nakshatra}</strong> shapes a {lagnaInfo.traits.split(',')[0]} personality.
          Out of 5 key life areas, <strong className="text-cosmic-100">{posCount} show favorable</strong> indications
          {negCount > 0 && <> and <strong className="text-red-400">{negCount} show challenges</strong></>}.
          {overallGood ? ' Focus on your strong areas while patiently working through the weaker ones.' :
            ' This chart rewards perseverance — the right dasha timing will unlock your potential.'}
        </p>
      </div>

      {/* Personality */}
      <div className="card-cosmic p-5">
        <h3 className="text-gold-400 font-serif text-base mb-3">✦ Personality & Nature</h3>
        <p className="text-cosmic-300 leading-relaxed mb-3">
          With <strong className="text-cosmic-100">{lagna}</strong> as your Ascendant, you are naturally {lagnaInfo.traits}.
          The {lagnaInfo.element} element governing your lagna gives you {ELEMENT_DESC[lagnaInfo.element]}.
          People with this ascendant tend to approach life with a {lagnaInfo.element === 'Fire' ? 'bold and proactive' : lagnaInfo.element === 'Earth' ? 'steady and methodical' : lagnaInfo.element === 'Air' ? 'thoughtful and communicative' : 'feeling-first and perceptive'} mindset.
        </p>
        <p className="text-cosmic-300 leading-relaxed">
          Your Moon in <strong className="text-cosmic-100">{moon_sign}</strong> governs your emotional world and subconscious reactions.
          Born in <strong className="text-cosmic-100">{nakshatra}</strong> nakshatra (ruled by <strong className="text-cosmic-100">{nakshatra_lord}</strong>),
          you carry the qualities of being {nakDesc}. This nakshatra strongly colors your instincts, habits, and inner motivations.
        </p>
      </div>

      {/* Ruling Planets */}
      {ruling_planets?.length > 0 && (
        <div className="card-cosmic p-5">
          <h3 className="text-gold-400 font-serif text-base mb-3">✦ Your Ruling Planets</h3>
          <p className="text-cosmic-300 leading-relaxed mb-3">
            In KP Astrology, the ruling planets at birth are your most powerful lifetime influences. Your ruling planets are{' '}
            {ruling_planets.map((rp, i) => (
              <span key={rp.planet}>
                <strong className={PLANET_COLOR[rp.planet] || 'text-cosmic-100'}>{rp.planet}</strong> ({rp.role}){i < ruling_planets.length - 1 ? ', ' : ''}
              </span>
            ))}.
          </p>
          <p className="text-cosmic-400 text-xs leading-relaxed">
            Activities, decisions, and timings that align with these planets tend to give the best results.
            When these planets operate as Mahadasha or Antardasha lords, expect significant and defining life events.
          </p>
        </div>
      )}

      {/* Current Dasha */}
      {dashaName && (
        <div className="card-cosmic p-5">
          <h3 className="text-gold-400 font-serif text-base mb-3">✦ Current Life Period</h3>
          <p className="text-cosmic-300 leading-relaxed">
            You are currently running the{' '}
            <strong className={PLANET_COLOR[dashaName] || 'text-cosmic-100'}>{dashaName} Mahadasha</strong>
            {antarName && <> with <strong className={PLANET_COLOR[antarName] || 'text-cosmic-100'}>{antarName} Antardasha</strong></>}.
            {DASHA_DESC[dashaName] && ` This period is associated with ${DASHA_DESC[dashaName]}`}
          </p>
          {antarName && DASHA_DESC[antarName] && (
            <p className="text-cosmic-400 text-xs leading-relaxed mt-2">
              The sub-period under <strong className={PLANET_COLOR[antarName] || 'text-cosmic-100'}>{antarName}</strong> additionally
              brings themes of {DASHA_DESC[antarName].split('.')[0].toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {/* Life Areas */}
      <div className="card-cosmic p-5">
        <h3 className="text-gold-400 font-serif text-base mb-4">✦ Life Areas — Positive or Challenging?</h3>
        <div className="space-y-3">
          {areaVerdicts.map(({ icon, label, verdict, pos, neg, mix, primaryHouse }) => {
            const cusp = kp_cusps[primaryHouse] || {};
            return (
              <div key={label} className={`rounded-lg p-4 border ${
                verdict === 'positive' ? 'border-emerald-500/30 bg-emerald-400/5' :
                verdict === 'negative' ? 'border-red-500/30 bg-red-400/5' :
                'border-gold-500/20 bg-cosmic-900/40'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{icon}</span>
                  <span className="font-medium text-cosmic-100">{label}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                    verdict === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                    verdict === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-gold-500/10 text-gold-400'
                  }`}>
                    {verdict === 'positive' ? '✓ Favorable' : verdict === 'negative' ? '✗ Challenging' : '~ Mixed'}
                  </span>
                </div>
                <p className="text-cosmic-400 text-xs leading-relaxed">
                  {verdict === 'positive' ? pos : verdict === 'negative' ? neg : mix}
                </p>
                {cusp.sub_lord && (
                  <p className="text-cosmic-600 text-xs mt-1.5">
                    H{primaryHouse} sub-lord: <PlanetBadge name={cusp.sub_lord} /> · star lord: <PlanetBadge name={cusp.star_lord} />
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Observations */}
      <div className="card-cosmic p-5">
        <h3 className="text-gold-400 font-serif text-base mb-4">✦ Key KP Observations</h3>
        <div className="space-y-3 text-xs leading-relaxed">

          {/* H1 */}
          {h1c.sub_lord && (
            <p className="text-cosmic-300">
              <strong className="text-cosmic-100">Self & Body (H1):</strong>{' '}
              {isSignificatorOf(h1c.sub_lord, 1)
                ? <><strong className={PLANET_COLOR[h1c.sub_lord]}>{h1c.sub_lord}</strong> as H1 sub-lord signifies the Ascendant — your physical constitution and overall life prospects are strengthened.</>
                : <><strong className={PLANET_COLOR[h1c.sub_lord]}>{h1c.sub_lord}</strong> as H1 sub-lord does not primarily signify the Ascendant — the body and personality may face periodic uncertainty or health concerns.</>}
            </p>
          )}

          {/* H7 */}
          {h7c.sub_lord && (
            <p className="text-cosmic-300">
              <strong className="text-cosmic-100">Partnerships (H7):</strong>{' '}
              {isSignificatorOf(h7c.sub_lord, 7) && !isSignificatorOf(h7c.sub_lord, 6) && !isSignificatorOf(h7c.sub_lord, 12)
                ? <><strong className={PLANET_COLOR[h7c.sub_lord]}>{h7c.sub_lord}</strong> as H7 sub-lord gives strong partnership prospects — marriage and business relationships are well supported.</>
                : (isSignificatorOf(h7c.sub_lord, 6) || isSignificatorOf(h7c.sub_lord, 12))
                  ? <><strong className={PLANET_COLOR[h7c.sub_lord]}>{h7c.sub_lord}</strong> as H7 sub-lord signifies challenging houses — relationships may face friction or delays. Patience and clear communication are key.</>
                  : <><strong className={PLANET_COLOR[h7c.sub_lord]}>{h7c.sub_lord}</strong> as H7 sub-lord shows moderate partnership prospects — relationships are possible but may need time to stabilize.</>}
            </p>
          )}

          {/* H10 */}
          {h10c.sub_lord && (
            <p className="text-cosmic-300">
              <strong className="text-cosmic-100">Career (H10):</strong>{' '}
              {isSignificatorOf(h10c.sub_lord, 10) && isSignificatorOf(h10c.sub_lord, 11)
                ? <><strong className={PLANET_COLOR[h10c.sub_lord]}>{h10c.sub_lord}</strong> as H10 sub-lord signifies both career (H10) and gains (H11) — excellent for professional success and financial rewards from your work.</>
                : isSignificatorOf(h10c.sub_lord, 10)
                  ? <><strong className={PLANET_COLOR[h10c.sub_lord]}>{h10c.sub_lord}</strong> as H10 sub-lord signifies career — professional growth and recognition are supported, though financial gains may need separate attention.</>
                  : <><strong className={PLANET_COLOR[h10c.sub_lord]}>{h10c.sub_lord}</strong> as H10 sub-lord does not strongly signify career — focus on skill development and avoid impulsive professional decisions.</>}
            </p>
          )}

        </div>
      </div>

      <p className="text-xs text-cosmic-700 text-center px-2">
        This report is based on KP Astrology cuspal sub-lord theory, significators, and ruling planets. For precise timing consult a KP astrologer.
      </p>
    </div>
  );
}

// ── Cuspal Sub-Lords Tab ────────────────────────────────────────────────────
function CuspalTab({ kpCusps }) {
  const HOUSE_SIGNIF = ['Self / Body','Wealth','Siblings','Home','Children / Intellect','Health / Service',
    'Spouse','Longevity / Obstacles','Luck / Dharma','Career','Gains','Liberation'];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold-600/20">
            {['House','Significance','Sign','Star Lord','Sub Lord','Sub-Sub Lord'].map(h => (
              <th key={h} className="text-left py-2 px-3 text-gold-500 font-medium text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({length:12},(_,i)=>i+1).map(h => {
            const c = kpCusps[h] || {};
            return (
              <tr key={h} className="border-b border-gold-600/10 hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-3">
                  <span className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold inline-flex items-center justify-center">{h}</span>
                </td>
                <td className="py-2.5 px-3 text-cosmic-400 text-xs">{HOUSE_SIGNIF[h-1]}</td>
                <td className="py-2.5 px-3 text-cosmic-300">{c.sign || '—'}</td>
                <td className="py-2.5 px-3"><PlanetBadge name={c.star_lord} /></td>
                <td className="py-2.5 px-3"><PlanetBadge name={c.sub_lord} /></td>
                <td className="py-2.5 px-3 text-cosmic-400"><PlanetBadge name={c.sub_sub_lord} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-cosmic-600 mt-3 px-1">Sub-lords determined by Vimshottari proportions within each nakshatra (13°20' span).</p>
    </div>
  );
}

// ── Planetary Lords Tab ─────────────────────────────────────────────────────
function PlanetaryTab({ kpPlanets, planetaryPositions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold-600/20">
            {['Planet','Sign','House','Nakshatra','Star Lord','Sub Lord','Sub-Sub Lord'].map(h => (
              <th key={h} className="text-left py-2 px-3 text-gold-500 font-medium text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'].map(p => {
            const kp  = kpPlanets[p] || {};
            const pos = planetaryPositions[p] || {};
            return (
              <tr key={p} className="border-b border-gold-600/10 hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-3">
                  <PlanetBadge name={p} />
                  {pos.retrograde && <span className="text-xs text-purple-400 ml-1">(R)</span>}
                </td>
                <td className="py-2.5 px-3 text-cosmic-300">{pos.sign || kp.sign || '—'}</td>
                <td className="py-2.5 px-3 text-cosmic-400">H{pos.house || '—'}</td>
                <td className="py-2.5 px-3 text-cosmic-400 text-xs">{pos.nakshatra || '—'}</td>
                <td className="py-2.5 px-3"><PlanetBadge name={kp.star_lord} /></td>
                <td className="py-2.5 px-3"><PlanetBadge name={kp.sub_lord} /></td>
                <td className="py-2.5 px-3 text-cosmic-500 text-xs"><PlanetBadge name={kp.sub_sub_lord} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Significators Tab ────────────────────────────────────────────────────────
function SignificatorsTab({ significators, houseLords, housePlanets }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="space-y-2">
      {Array.from({length:12},(_,i)=>i+1).map(h => {
        const sig = significators[h] || {};
        const planets = sig.planets || [];
        const isOpen = expanded === h;
        return (
          <div key={h} className="border border-gold-600/10 rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(isOpen ? null : h)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold inline-flex items-center justify-center">{h}</span>
                <span className="text-sm text-cosmic-200">
                  <span className="text-cosmic-500 text-xs mr-2">Lord: </span>
                  <PlanetBadge name={houseLords[h]} />
                </span>
                <span className="text-xs text-cosmic-600">
                  {(housePlanets[h] || []).length > 0 ? `Occupied by: ${(housePlanets[h]||[]).join(', ')}` : 'Empty'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                  {planets.slice(0,5).map(p => (
                    <span key={p} className={`text-xs ${PLANET_COLOR[p]||'text-gray-400'}`}>{p}</span>
                  ))}
                  {planets.length > 5 && <span className="text-xs text-cosmic-600">+{planets.length-5}</span>}
                </div>
                <ChevronDown className={`w-4 h-4 text-cosmic-500 transition-transform ${isOpen?'rotate-180':''}`} />
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
                  exit={{height:0,opacity:0}} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2 border-t border-gold-600/10 pt-3">
                    {Object.entries(sig.details || {}).map(([planet, reasons]) => (
                      <div key={planet} className="flex gap-3">
                        <PlanetBadge name={planet} />
                        <span className="text-xs text-cosmic-500">{reasons.join(' · ')}</span>
                      </div>
                    ))}
                    {Object.keys(sig.details || {}).length === 0 && (
                      <p className="text-xs text-cosmic-600">No significators for this house.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <p className="text-xs text-cosmic-600 pt-2 px-1">
        Significators: L1 = Occupants · L2 = House Lord · L3 = In star of occupants · L4 = In star of lord
      </p>
    </div>
  );
}

// ── Event Query Tab ──────────────────────────────────────────────────────────
function EventTab({ data, onQuery, querying }) {
  const [event, setEvent] = useState('');
  const ea = data?.event_analysis;

  return (
    <div className="space-y-6">
      <div className="card-cosmic p-5">
        <h3 className="text-gold-400 font-serif text-base mb-3">Select a Life Event to Analyze</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {EVENT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setEvent(opt.value)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all text-left ${
                event === opt.value ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'border border-cosmic-700 text-cosmic-400 hover:border-gold-600/30 hover:text-cosmic-300'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={() => onQuery(event)} disabled={!event || querying}
          className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50 w-full">
          {querying ? '✦ Analysing…' : 'Analyse with KP'}
        </button>
      </div>

      {ea && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
          {/* Promise */}
          <div className={`card-cosmic p-4 border-l-4 ${ea.promise.includes('well') ? 'border-emerald-500' : 'border-amber-500'}`}>
            <p className="text-sm font-medium text-cosmic-100">{ea.promise}</p>
            <p className="text-xs text-cosmic-500 mt-1">Relevant houses: {ea.houses.desc}</p>
          </div>

          {/* Timing */}
          <div className="card-cosmic p-4">
            <h4 className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">Dasha Timing Analysis</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-cosmic-900 rounded-lg p-3">
                <p className="text-xs text-cosmic-500 mb-1">Current Mahadasha</p>
                <PlanetBadge name={ea.current_dasha} />
                {ea.dasha_supports && <span className="ml-2 text-xs text-emerald-400">✓ signifies event</span>}
              </div>
              <div className="bg-cosmic-900 rounded-lg p-3">
                <p className="text-xs text-cosmic-500 mb-1">Current Antardasha</p>
                <PlanetBadge name={ea.current_antardasha} />
                {ea.antardasha_supports && <span className="ml-2 text-xs text-emerald-400">✓ signifies event</span>}
              </div>
            </div>
            <p className="text-sm text-cosmic-300">{ea.timing_verdict}</p>
          </div>

          {/* Ruling Planets Match */}
          {ea.ruling_planets_match?.length > 0 && (
            <div className="card-cosmic p-4">
              <h4 className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">Ruling Planets Matching Event</h4>
              <div className="flex flex-wrap gap-2">
                {ea.ruling_planets_match.map(rp => (
                  <span key={rp.planet} className="bg-gold-500/10 border border-gold-500/20 rounded-full px-3 py-1 text-xs">
                    <PlanetBadge name={rp.planet} /> <span className="text-cosmic-500">({rp.role})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* House Significators */}
          <div className="card-cosmic p-4">
            <h4 className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">Key House Significators</h4>
            <div className="space-y-2">
              {ea.houses.primary.map(h => (
                <div key={h} className="flex items-center gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold inline-flex items-center justify-center">{h}</span>
                  <div className="flex flex-wrap gap-1">
                    {(ea.house_wise_significators[h]?.planets || []).map(p => (
                      <span key={p} className={`text-xs ${PLANET_COLOR[p]||'text-gray-400'}`}>{p}</span>
                    ))}
                    {!ea.house_wise_significators[h]?.planets?.length && <span className="text-xs text-cosmic-600">none</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function KPAstrologyPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name:'', dob:'', birth_time:'12:00', place:'', lat:'', lng:'', timezone:'5.5', timezone_id:'', timezone_abbr:'' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [places, setPlaces] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(0);
  const [querying, setQuerying] = useState(false);
  const [placeConfirmed, setPlaceConfirmed] = useState(false);
  const debounceRef = useRef(null);

  // Auto-search as user types (400ms debounce)
  useEffect(() => {
    if (placeConfirmed) return;
    const q = form.place.trim();
    if (q.length < 3) { setPlaces([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await geocode.search(q);
        setPlaces(res.data || []);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [form.place, placeConfirmed]);

  const selectPlace = (p) => {
    setForm(f => ({
      ...f,
      place: p.short_name || p.display_name,
      lat: p.lat,
      lng: p.lng,
      timezone: p.timezone,
      timezone_id: p.timezone_id || '',
      timezone_abbr: p.timezone_abbr || '',
    }));
    setPlaces([]);
    setPlaceConfirmed(true);
  };

  const clearPlace = () => {
    setForm(f => ({ ...f, place:'', lat:'', lng:'', timezone:'5.5', timezone_id:'', timezone_abbr:'' }));
    setPlaceConfirmed(false);
    setPlaces([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dob || !form.lat || !form.lng) return toast.error('Fill all required fields');
    setLoading(true);
    setData(null);
    try {
      const res = await kpAstrology.analyse({
        name: form.name, dob: form.dob, birth_time: form.birth_time,
        lat: parseFloat(form.lat), lng: parseFloat(form.lng), timezone: parseFloat(form.timezone)
      });
      setData(res.data);
      setTab(0);
      setSaved(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const handleEventQuery = async (event) => {
    if (!event || !data) return;
    setQuerying(true);
    try {
      const res = await kpAstrology.analyse({
        name: form.name, dob: form.dob, birth_time: form.birth_time,
        lat: parseFloat(form.lat), lng: parseFloat(form.lng),
        timezone: parseFloat(form.timezone), event
      });
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Event query failed');
    } finally { setQuerying(false); }
  };

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-10">
          <div className="text-5xl mb-3">🔯</div>
          <h1 className="font-serif text-3xl text-gold-400 mb-2">KP Astrology</h1>
          <p className="text-cosmic-400 text-sm max-w-lg mx-auto">
            Krishnamurti Paddhati — precise astrology using Cuspal Sub-Lords, Significators, and Ruling Planets
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card-cosmic p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-cosmic-400 mb-1 block">Name (optional)</label>
                <input className="input-cosmic w-full" placeholder="Full name"
                  value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div>
                <label className="text-xs text-cosmic-400 mb-1 block">Date of Birth *</label>
                <ScrollDatePicker value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} />
              </div>
              <div>
                <label className="text-xs text-cosmic-400 mb-1 block">Time of Birth *</label>
                <input type="time" className="input-cosmic w-full" required
                  value={form.birth_time} onChange={e => setForm(f=>({...f,birth_time:e.target.value}))} />
              </div>
            </div>

            {/* Birth Place — auto-search */}
            <div>
              <label className="text-xs text-cosmic-400 mb-1 block">Birth Place *</label>
              <div className="relative">
                <input
                  className="input-cosmic w-full pr-8"
                  placeholder="Type city or town name…"
                  value={form.place}
                  onChange={e => { setPlaceConfirmed(false); setForm(f=>({...f, place:e.target.value, lat:'', lng:'', timezone_id:'', timezone_abbr:''})); }}
                  autoComplete="off"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 text-xs animate-pulse">…</span>
                )}
                {placeConfirmed && (
                  <button type="button" onClick={clearPlace}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-500 hover:text-red-400 text-xs transition-colors">✕</button>
                )}
              </div>

              {/* Dropdown suggestions */}
              {places.length > 0 && (
                <div className="mt-1 bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden shadow-xl z-20 relative">
                  {places.slice(0,6).map((p,i) => (
                    <button key={i} type="button" onClick={() => selectPlace(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5 border-b border-gold-600/10 last:border-0 transition-colors">
                      <p className="text-sm text-cosmic-200">{p.short_name || p.display_name.split(',').slice(0,3).join(',')}</p>
                      <p className="text-xs text-cosmic-600 truncate">{p.display_name}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Confirmed: show lat/lng + timezone badge */}
              {placeConfirmed && form.lat && (
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 text-xs bg-cosmic-900/60 border border-gold-600/15 rounded-full px-3 py-1 text-cosmic-300">
                    <MapPin className="w-3 h-3 text-gold-500" />
                    {parseFloat(form.lat).toFixed(4)}°N, {parseFloat(form.lng).toFixed(4)}°E
                  </span>
                  <span className="flex items-center gap-1.5 text-xs bg-cosmic-900/60 border border-gold-600/15 rounded-full px-3 py-1 text-cosmic-300">
                    <Clock className="w-3 h-3 text-gold-500" />
                    {form.timezone_abbr && `${form.timezone_abbr} · `}UTC {parseFloat(form.timezone) >= 0 ? '+' : ''}{form.timezone}
                  </span>
                </div>
              )}
            </div>

            {/* Timezone — auto-filled, editable override */}
            <div>
              <label className="text-xs text-cosmic-400 mb-1 block">
                Timezone (UTC offset)
                {form.timezone_id && <span className="ml-2 text-gold-500/70">auto-detected from place</span>}
              </label>
              <input type="number" step="0.5" min="-12" max="14" className="input-cosmic w-full"
                value={form.timezone} onChange={e => setForm(f=>({...f,timezone:e.target.value}))} /></div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? '✦ Computing KP Chart…' : '✦ Generate KP Chart'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {data && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            {/* Identity bar */}
            <div className="card-cosmic p-4 mb-6 flex flex-wrap gap-4 text-sm items-center">
              <span className="text-gold-400 font-serif text-base">{data.name}</span>
              <span className="text-cosmic-400">Lagna: <span className="text-cosmic-200">{data.lagna}</span></span>
              <span className="text-cosmic-400">Moon: <span className="text-cosmic-200">{data.moon_sign}</span></span>
              <span className="text-cosmic-400">Nakshatra: <span className="text-cosmic-200">{data.nakshatra}</span></span>
              {data.current_dasha && (
                <span className="text-cosmic-400">Dasha: <PlanetBadge name={data.current_dasha.planet} /></span>
              )}
              {user && (
                <button onClick={async () => {
                  if (saved) return;
                  setSaving(true);
                  try {
                    await reportHistory.save({
                      type: 'kp',
                      title: `${data.name || form.name || 'KP Chart'} — ${data.lagna} Lagna`,
                      meta: { dob: form.dob, birth_place: form.place, lagna: data.lagna, moon_sign: data.moon_sign, nakshatra: data.nakshatra, nakshatra_lord: data.nakshatra_lord },
                    });
                    setSaved(true);
                    toast.success('KP Chart saved to History!');
                  } catch { toast.error('Could not save to history'); }
                  finally { setSaving(false); }
                }} disabled={saving || saved}
                  className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                  {saved ? 'Saved to History' : saving ? 'Saving…' : 'Save to History'}
                </button>
              )}
            </div>

            {/* Ruling planets */}
            <div className="card-cosmic p-4 mb-6">
              <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-3">Ruling Planets (at birth)</h3>
              <div className="flex flex-wrap gap-3">
                {(data.ruling_planets || []).map(rp => (
                  <div key={rp.planet} className="bg-cosmic-900 rounded-lg px-3 py-2 text-center">
                    <PlanetBadge name={rp.planet} />
                    <p className="text-xs text-cosmic-600 mt-0.5">{rp.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-cosmic-900 rounded-xl p-1 border border-gold-500/10 mb-6 overflow-x-auto">
              {TABS.map((t,i) => (
                <button key={t} onClick={() => setTab(i)}
                  className={`flex-1 min-w-max py-2.5 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab===i?'bg-gold-500/20 text-gold-400':'text-cosmic-500 hover:text-cosmic-300'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="card-cosmic p-5">
              {tab === 0 && <ReportTab data={data} />}
              {tab === 1 && <CuspalTab kpCusps={data.kp_cusps} />}
              {tab === 2 && <PlanetaryTab kpPlanets={data.kp_planets} planetaryPositions={data.planetary_positions} />}
              {tab === 3 && <SignificatorsTab significators={data.significators} houseLords={data.house_lords} housePlanets={data.house_planets} />}
              {tab === 4 && <EventTab data={data} onQuery={handleEventQuery} querying={querying} />}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
