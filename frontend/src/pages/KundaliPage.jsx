import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin, Clock, Calendar, ChevronRight, ChevronLeft, Loader,
  Download, FileText, BookOpen, Star, Sun, Moon, ChevronDown, Sparkles, Bookmark
} from 'lucide-react';
import NorthIndianChart from '../components/NorthIndianChart';
import SouthIndianChart from '../components/SouthIndianChart';
import SwastikBorder from '../components/SwastikBorder';
import { kundali as kundaliApi, reportHistory as historyApi } from '../api';
import BirthPlacePicker from '../components/BirthPlacePicker';
import { useAuth } from '../context/AuthContext';
import { LAGNA_PHAL, NAKSHATRA_PHAL, MAHADASHA_PHAL, KAAL_SARP_TYPES } from '../data/kundaliInterpretations';

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

// 27 Nakshatras — 4 Padas = 108 Namkaran sounds (En + Devanagari)
const NAK_TABLE = [
  { name:'Ashwini',          nameHi:'अश्विनी',         lord:'Ketu',    pada:[{en:'Chu',hi:'चु'},{en:'Che',hi:'चे'},{en:'Cho',hi:'चो'},{en:'La',hi:'ला'}] },
  { name:'Bharani',          nameHi:'भरणी',            lord:'Venus',   pada:[{en:'Li',hi:'ली'},{en:'Lu',hi:'लू'},{en:'Le',hi:'ले'},{en:'Lo',hi:'लो'}] },
  { name:'Krittika',         nameHi:'कृत्तिका',         lord:'Sun',     pada:[{en:'A',hi:'अ'},{en:'I',hi:'इ'},{en:'U',hi:'उ'},{en:'E',hi:'ए'}] },
  { name:'Rohini',           nameHi:'रोहिणी',           lord:'Moon',    pada:[{en:'O',hi:'ओ'},{en:'Va',hi:'वा'},{en:'Vi',hi:'वि'},{en:'Vu',hi:'वु'}] },
  { name:'Mrigashira',       nameHi:'मृगशिरा',          lord:'Mars',    pada:[{en:'Ve',hi:'वे'},{en:'Vo',hi:'वो'},{en:'Ka',hi:'का'},{en:'Ki',hi:'कि'}] },
  { name:'Ardra',            nameHi:'आर्द्रा',           lord:'Rahu',    pada:[{en:'Ku',hi:'कु'},{en:'Gha',hi:'घ'},{en:'Ing',hi:'ङ'},{en:'Cha',hi:'छ'}] },
  { name:'Punarvasu',        nameHi:'पुनर्वसु',          lord:'Jupiter', pada:[{en:'Ke',hi:'के'},{en:'Ko',hi:'को'},{en:'Ha',hi:'हा'},{en:'Hi',hi:'हि'}] },
  { name:'Pushya',           nameHi:'पुष्य',            lord:'Saturn',  pada:[{en:'Hu',hi:'हु'},{en:'He',hi:'हे'},{en:'Ho',hi:'हो'},{en:'Da',hi:'ड'}] },
  { name:'Ashlesha',         nameHi:'आश्लेषा',          lord:'Mercury', pada:[{en:'Di',hi:'डि'},{en:'Du',hi:'डु'},{en:'De',hi:'डे'},{en:'Do',hi:'डो'}] },
  { name:'Magha',            nameHi:'मघा',              lord:'Ketu',    pada:[{en:'Ma',hi:'मा'},{en:'Mi',hi:'मि'},{en:'Mu',hi:'मु'},{en:'Me',hi:'मे'}] },
  { name:'PurvaPhalguni',    nameHi:'पूर्वा फाल्गुनी',   lord:'Venus',   pada:[{en:'Mo',hi:'मो'},{en:'Ta',hi:'ट'},{en:'Ti',hi:'टि'},{en:'Tu',hi:'टु'}] },
  { name:'UttaraPhalguni',   nameHi:'उत्तरा फाल्गुनी',   lord:'Sun',     pada:[{en:'Te',hi:'टे'},{en:'To',hi:'टो'},{en:'Pa',hi:'पा'},{en:'Pi',hi:'पि'}] },
  { name:'Hasta',            nameHi:'हस्त',             lord:'Moon',    pada:[{en:'Pu',hi:'पु'},{en:'Sha',hi:'ष'},{en:'Na',hi:'ण'},{en:'Tha',hi:'ठ'}] },
  { name:'Chitra',           nameHi:'चित्रा',            lord:'Mars',    pada:[{en:'Pe',hi:'पे'},{en:'Po',hi:'पो'},{en:'Ra',hi:'र'},{en:'Ri',hi:'रि'}] },
  { name:'Swati',            nameHi:'स्वाति',            lord:'Rahu',    pada:[{en:'Ru',hi:'रु'},{en:'Re',hi:'रे'},{en:'Ro',hi:'रो'},{en:'Ta',hi:'त'}] },
  { name:'Vishakha',         nameHi:'विशाखा',            lord:'Jupiter', pada:[{en:'Ti',hi:'ति'},{en:'Tu',hi:'तु'},{en:'Te',hi:'ते'},{en:'To',hi:'तो'}] },
  { name:'Anuradha',         nameHi:'अनुराधा',           lord:'Saturn',  pada:[{en:'Na',hi:'न'},{en:'Ni',hi:'नि'},{en:'Nu',hi:'नु'},{en:'Ne',hi:'ने'}] },
  { name:'Jyeshtha',         nameHi:'ज्येष्ठा',           lord:'Mercury', pada:[{en:'No',hi:'नो'},{en:'Ya',hi:'य'},{en:'Yi',hi:'यि'},{en:'Yu',hi:'यु'}] },
  { name:'Mula',             nameHi:'मूल',              lord:'Ketu',    pada:[{en:'Ye',hi:'ये'},{en:'Yo',hi:'यो'},{en:'Bha',hi:'भ'},{en:'Bhi',hi:'भि'}] },
  { name:'PurvaAshadha',     nameHi:'पूर्वाषाढा',        lord:'Venus',   pada:[{en:'Bhu',hi:'भु'},{en:'Dha',hi:'ध'},{en:'Pha',hi:'फ'},{en:'Dha',hi:'ढ'}] },
  { name:'UttaraAshadha',    nameHi:'उत्तराषाढा',        lord:'Sun',     pada:[{en:'Bhe',hi:'भे'},{en:'Bho',hi:'भो'},{en:'Ja',hi:'ज'},{en:'Ji',hi:'जि'}] },
  { name:'Shravana',         nameHi:'श्रवण',             lord:'Moon',    pada:[{en:'Ju',hi:'जु'},{en:'Je',hi:'जे'},{en:'Jo',hi:'जो'},{en:'Gha',hi:'घ'}] },
  { name:'Dhanishtha',       nameHi:'धनिष्ठा',           lord:'Mars',    pada:[{en:'Ga',hi:'ग'},{en:'Gi',hi:'गि'},{en:'Gu',hi:'गु'},{en:'Ge',hi:'गे'}] },
  { name:'Shatabhisha',      nameHi:'शतभिषा',            lord:'Rahu',    pada:[{en:'Go',hi:'गो'},{en:'Sa',hi:'स'},{en:'Si',hi:'सि'},{en:'Su',hi:'सु'}] },
  { name:'PurvaBhadrapada',  nameHi:'पूर्व भाद्रपद',     lord:'Jupiter', pada:[{en:'Se',hi:'से'},{en:'So',hi:'सो'},{en:'Da',hi:'द'},{en:'Di',hi:'दि'}] },
  { name:'UttaraBhadrapada', nameHi:'उत्तर भाद्रपद',     lord:'Saturn',  pada:[{en:'Du',hi:'दु'},{en:'Tha',hi:'थ'},{en:'Jha',hi:'झ'},{en:'Da',hi:'द'}] },
  { name:'Revati',           nameHi:'रेवती',             lord:'Mercury', pada:[{en:'De',hi:'दे'},{en:'Do',hi:'दो'},{en:'Cha',hi:'च'},{en:'Chi',hi:'चि'}] },
];
const PLANET_SYMBOLS = { Sun:'☀️', Moon:'🌙', Mars:'♂️', Mercury:'☿', Jupiter:'♃', Venus:'♀️', Saturn:'♄', Rahu:'☊', Ketu:'☋' };
const PLANET_COLORS = { Sun:'text-orange-400', Moon:'text-blue-300', Mars:'text-red-400', Mercury:'text-emerald-400', Jupiter:'text-yellow-400', Venus:'text-pink-400', Saturn:'text-violet-400', Rahu:'text-purple-400', Ketu:'text-slate-200' };

// --- ASHTAKAVARGA COMPUTATION -------------------------------------------------

const ASHTAK_RULES = {
  Sun:     { Sun:[1,2,4,7,8,9,10,11], Moon:[3,6,10,11],       Mars:[1,2,4,7,8,9,10,11], Mercury:[3,5,6,9,10,11,12],    Jupiter:[5,6,9,11],        Venus:[6,7,12],              Saturn:[1,2,4,7,8,9,10,11], Lagna:[3,4,6,10,11,12] },
  Moon:    { Sun:[3,6,7,8,10,11],     Moon:[1,3,6,7,10,11],   Mars:[2,3,5,6,9,10,11],   Mercury:[1,3,4,5,7,8,10,11],  Jupiter:[1,4,7,8,10,11,12], Venus:[3,4,5,7,9,10,11],     Saturn:[3,5,6,11],          Lagna:[3,6,10,11] },
  Mars:    { Sun:[3,5,6,10,11],       Moon:[3,6,11],           Mars:[1,2,4,7,8,10,11],   Mercury:[3,5,6,11],           Jupiter:[6,10,11,12],       Venus:[6,8,11,12],           Saturn:[1,4,7,8,9,10,11],   Lagna:[1,2,4,7,8,10,11] },
  Mercury: { Sun:[5,6,9,11,12],       Moon:[2,4,6,8,10,11],   Mars:[1,2,4,7,8,9,10,11], Mercury:[1,3,5,6,9,10,11,12], Jupiter:[6,8,11,12],        Venus:[1,2,3,4,5,8,9,11],   Saturn:[1,2,4,7,8,9,10,11], Lagna:[1,2,4,6,8,10,11] },
  Jupiter: { Sun:[1,2,3,4,7,8,9,10,11], Moon:[2,5,7,9,11],   Mars:[1,2,4,7,8,10,11],   Mercury:[1,2,4,5,6,9,10,11], Jupiter:[1,2,3,4,7,8,10,11], Venus:[2,5,6,9,10,11],      Saturn:[3,5,6,12],          Lagna:[1,2,4,5,6,7,9,10,11] },
  Venus:   { Sun:[8,11,12],           Moon:[1,2,3,4,5,8,9,11,12], Mars:[3,4,6,9,11,12], Mercury:[3,5,6,9,11],         Jupiter:[5,8,9,10,11],      Venus:[1,2,3,4,5,8,9,10,11], Saturn:[3,4,5,8,9,10,11],  Lagna:[1,2,3,4,5,8,9,11] },
  Saturn:  { Sun:[1,2,4,7,8,10,11],  Moon:[3,6,11],           Mars:[3,5,6,10,11,12],    Mercury:[6,8,9,10,11,12],     Jupiter:[5,6,11,12],        Venus:[6,11,12],             Saturn:[3,5,6,11],          Lagna:[1,3,4,6,10,11] },
};

const ASHTAK_PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

function computeAshtakavarga(pp, lagna) {
  const lagnaIdx = SIGN_INDEX[lagna];
  if (lagnaIdx === undefined) return null;
  const pidx = {};
  for (const p of ASHTAK_PLANETS) {
    const si = SIGN_INDEX[pp[p]?.sign];
    if (si !== undefined) pidx[p] = si;
  }
  const bhinna = {};
  for (const planet of ASHTAK_PLANETS) {
    const scores = new Array(12).fill(0);
    for (const [ref, houses] of Object.entries(ASHTAK_RULES[planet])) {
      const ri = ref === 'Lagna' ? lagnaIdx : pidx[ref];
      if (ri === undefined) continue;
      for (let s = 0; s < 12; s++) {
        if (houses.includes(((s - ri + 12) % 12) + 1)) scores[s]++;
      }
    }
    bhinna[planet] = scores;
  }
  const sarva = new Array(12).fill(0);
  for (const sc of Object.values(bhinna)) sc.forEach((v, i) => { sarva[i] += v; });
  return { bhinna, sarva };
}

// --- HELPERS ------------------------------------------------------------------

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- SIGN HELPERS -------------------------------------------------------------

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_INDEX = Object.fromEntries(SIGNS.map((s,i)=>[s,i]));

function signOffset(sign, offset) {
  const idx = SIGN_INDEX[sign];
  if (idx === undefined) return null;
  return SIGNS[(idx + offset + 12) % 12];
}

// --- ACCORDION ----------------------------------------------------------------

function AccordionSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-cosmic overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gold-500/5 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl leading-none">{icon}</span>
          <span className="font-serif text-gold-400 text-lg">{title}</span>
        </span>
        <ChevronDown className={`w-5 h-5 text-gold-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gold-600/15">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS -----------------------------------------------------------

function TimePicker({ value, onChange }) {
  const toparts = v => {
    if (!v) return { h: '12', m: '00', ap: 'AM' };
    const [hh, mm] = v.split(':').map(Number);
    const ap = hh >= 12 ? 'PM' : 'AM';
    return { h: hh === 0 ? '12' : hh > 12 ? String(hh-12) : String(hh), m: String(mm).padStart(2,'0'), ap };
  };
  const { h, m, ap } = toparts(value);
  const emit = (hour, min, ampm) => {
    let hh = parseInt(hour);
    if (ampm === 'AM' && hh === 12) hh = 0;
    if (ampm === 'PM' && hh !== 12) hh += 12;
    onChange(`${String(hh).padStart(2,'0')}:${min}`);
  };
  const hours = Array.from({length:12},(_,i)=>String(i+1));
  const minutes = Array.from({length:60},(_,i)=>String(i).padStart(2,'0'));
  const sel = "bg-transparent text-gray-200 focus:outline-none text-lg font-semibold text-center cursor-pointer appearance-none";
  return (
    <div className="flex items-center gap-2 bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 focus-within:border-gold-500 transition-colors">
      <Clock className="w-5 h-5 text-gray-300 flex-shrink-0" />
      <div className="flex items-center gap-1 flex-1">
        <select value={h} onChange={e=>emit(e.target.value,m,ap)} className={sel} style={{width:44}}>
          {hours.map(hr=><option key={hr} value={hr} className="bg-cosmic-900">{hr}</option>)}
        </select>
        <span className="text-gold-500 font-bold text-xl">:</span>
        <select value={m} onChange={e=>emit(h,e.target.value,ap)} className={sel} style={{width:44}}>
          {minutes.map(mn=><option key={mn} value={mn} className="bg-cosmic-900">{mn}</option>)}
        </select>
      </div>
      <div className="flex rounded-lg overflow-hidden border border-gold-600/30 flex-shrink-0">
        {['AM','PM'].map(period=>(
          <button key={period} type="button" onClick={()=>emit(h,m,period)}
            className={`px-3 py-1.5 text-sm font-semibold transition-all ${ap===period?'bg-gold-500 text-cosmic-950':'text-gray-200 hover:text-gold-400'}`}>
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}

function DashaTimeline({ dashas }) {
  const now = new Date();
  const [expanded, setExpanded] = useState(() => {
    const idx = dashas.findIndex(d => new Date(d.start) <= now && new Date(d.end) >= now);
    return idx >= 0 ? idx : 0;
  });
  const earliest = new Date(dashas[0]?.start || now);
  const latest = new Date(dashas[dashas.length-1]?.end || now);
  const totalSpan = latest - earliest;

  return (
    <div className="space-y-1">
      {dashas.map((d, idx) => {
        const start = new Date(d.start), end = new Date(d.end);
        const width = ((end-start)/totalSpan)*100;
        const left = ((start-earliest)/totalSpan)*100;
        const isCurrent = now >= start && now <= end;
        const isExpanded = expanded === idx;
        return (
          <div key={d.planet}>
            <button onClick={()=>setExpanded(isExpanded ? -1 : idx)}
              className={`w-full flex items-center gap-3 text-sm rounded-lg px-2 py-1.5 transition-colors ${isExpanded?'bg-gold-500/10':'hover:bg-cosmic-800/60'}`}>
              <span className={`w-24 text-right font-semibold flex-shrink-0 ${isCurrent?'text-gold-400':'text-gray-300'}`}>
                {d.planet} {isCurrent?'★':''}
              </span>
              <div className="flex-1 h-5 bg-cosmic-800 rounded-full relative overflow-hidden">
                <div className={`absolute top-0 h-full rounded-full ${isCurrent?'bg-gradient-to-r from-gold-600 to-gold-400':'bg-indigo-900/80'}`}
                  style={{left:`${left}%`,width:`${width}%`}} />
                {isCurrent && <div className="absolute inset-0 flex items-center justify-center text-cosmic-950 text-[10px] font-bold z-10">Active</div>}
              </div>
              <span className="text-gray-200 w-24 text-left flex-shrink-0 text-xs">{d.start.slice(0,4)} — {d.end.slice(0,4)}</span>
              <span className={`text-gray-200 transition-transform flex-shrink-0 ${isExpanded?'rotate-180':''}`}>▾</span>
            </button>
            <AnimatePresence>
              {isExpanded && d.antardashas && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
                  <div className="ml-6 mt-1 mb-3 space-y-1 border-l-2 border-gold-600/30 pl-4">
                    {d.antardashas.map(a => {
                      const aStart = new Date(a.start), aEnd = new Date(a.end);
                      const isCurA = now >= aStart && now <= aEnd;
                      const aSpan = end-start;
                      return (
                        <div key={a.planet} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 ${isCurA?'bg-gold-500/15 border border-gold-500/30':'hover:bg-cosmic-800/40'}`}>
                          <span className={`w-28 text-right flex-shrink-0 font-medium ${isCurA?'text-gold-300':'text-gray-200'}`}>{d.planet}/{a.planet}</span>
                          <div className="flex-1 h-3 bg-cosmic-800 rounded-full relative overflow-hidden">
                            <div className={`absolute top-0 h-full rounded-full ${isCurA?'bg-gold-500/70':'bg-indigo-800/70'}`}
                              style={{left:`${((aStart-start)/aSpan)*100}%`,width:`${((aEnd-aStart)/aSpan)*100}%`}} />
                          </div>
                          <span className={`w-36 flex-shrink-0 text-xs ${isCurA?'text-gold-400':'text-gray-300'}`}>
                            {a.start.slice(0,7)} — {a.end.slice(0,7)} {isCurA&&'★ Now'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active?'bg-gold-500 text-cosmic-950':'text-gray-200 hover:text-gold-400 hover:bg-cosmic-800/60'}`}>
      {children}
    </button>
  );
}

// --- KUNDALI RESULTS VIEW -----------------------------------------------------

function KundaliResult({ kundali, chart, birthInfo, userName }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('chart');
  const [pdfLoading, setPdfLoading] = useState(null);
  const [namkaran, setNamkaran] = useState(null);
  const [namkaranLoading, setNamkaranLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  async function fetchNamkaran() {
    setNamkaranLoading(true);
    try {
      const r = await kundaliApi.getNamkaran();
      setNamkaran(r.data);
    } catch { toast.error('Could not load Namkaran data'); }
    finally { setNamkaranLoading(false); }
  }

  const data = chart || kundali;
  const pp = data.planetary_positions || {};
  const dashas = data.dasha_sequence || [];
  const panchang = data.panchang || {};
  const upgrahas = data.upgrahas || {};
  const dc = data.divisional_charts || {};
  const shadbala = data.shadbala || {};
  const bhavaBala = data.bhava_bala || {};
  const siderealTime = data.sidereal_time || {};
  const now = new Date();
  const currentDasha = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
  const currentAntar = currentDasha?.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);

  async function handlePDF(type) {
    setPdfLoading(type);
    try {
      let res;
      if (type === 'summary')        res = await kundaliApi.downloadSummaryPDF();
      else if (type === 'detailed')  res = await kundaliApi.downloadDetailedPDF();
      else if (type === 'summary-hi') res = await kundaliApi.downloadSummaryPDFHindi();
      else                            res = await kundaliApi.downloadDetailedPDFHindi();

      const labelMap = { summary: 'Summary', detailed: 'Detailed', 'summary-hi': 'संक्षिप्त (हिंदी)', 'detailed-hi': 'विस्तृत (हिंदी)' };
      downloadBlob(res.data, `kundali-${type}-${data.dob || 'chart'}.pdf`);
      toast.success(`${labelMap[type]} Kundali PDF downloaded!`);
    } catch {
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-24">

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-8">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Vedic Birth Chart — Jyotisha</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-2">{userName}'s Kundali</h1>
          <p className="text-gray-200 text-sm">
            {kundali.dob || data.dob} — {kundali.birth_time || data.birth_time || '—'} — {kundali.birth_place || data.birth_place || '—'}
          </p>
          <p className="text-gray-300 text-xs mt-1">Swiss Ephemeris — Lahiri Ayanamsha: {data.ayanamsha?.dms || '—'} — True Nodes</p>
        </motion.div>

        {/* PDF Download Buttons */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="mb-8 space-y-3">
          {/* English PDFs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={()=>handlePDF('summary')} disabled={!!pdfLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-cosmic-950 font-semibold rounded-xl hover:bg-gold-400 transition-all disabled:opacity-60">
              {pdfLoading==='summary' ? <Loader className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4"/>}
              Summary Kundali PDF
            </button>
            <button onClick={()=>handlePDF('detailed')} disabled={!!pdfLoading}
              className="flex items-center gap-2 px-6 py-3 bg-transparent border border-gold-500 text-gold-400 font-semibold rounded-xl hover:bg-gold-500/10 transition-all disabled:opacity-60">
              {pdfLoading==='detailed' ? <Loader className="w-4 h-4 animate-spin"/> : <BookOpen className="w-4 h-4"/>}
              Detailed Kundali PDF
            </button>
          </div>
          {/* Hindi PDFs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={()=>handlePDF('summary-hi')} disabled={!!pdfLoading}
              className="flex items-center gap-2 px-6 py-3 bg-saffron-600/80 text-white font-semibold rounded-xl hover:bg-saffron-500 transition-all disabled:opacity-60"
              style={{backgroundColor: 'rgba(220,100,30,0.85)'}}>
              {pdfLoading==='summary-hi' ? <Loader className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4"/>}
              संक्षिप्त कुंडली PDF (हिंदी)
            </button>
            <button onClick={()=>handlePDF('detailed-hi')} disabled={!!pdfLoading}
              className="flex items-center gap-2 px-6 py-3 bg-transparent font-semibold rounded-xl transition-all disabled:opacity-60"
              style={{border: '1px solid rgba(220,100,30,0.8)', color: 'rgba(240,150,60,1)'}}>
              {pdfLoading==='detailed-hi' ? <Loader className="w-4 h-4 animate-spin"/> : <BookOpen className="w-4 h-4"/>}
              विस्तृत कुंडली PDF (हिंदी)
            </button>
          </div>
          {/* Save to History */}
          {user && (
            <div className="flex justify-center">
              <button onClick={async () => {
                if (saved) return;
                setSaving(true);
                try {
                  const d = chart || kundali;
                  await historyApi.save({
                    type: 'kundali',
                    title: `${userName}'s Kundali — ${d.dob || kundali.dob}`,
                    meta: {
                      dob: d.dob || kundali.dob,
                      birth_place: d.birth_place || kundali.birth_place,
                      lagna: d.lagna || kundali.lagna,
                      moon_sign: d.moon_sign || kundali.moon_sign,
                      nakshatra: d.nakshatra || kundali.nakshatra,
                      nakshatra_lord: d.nakshatra_lord || kundali.nakshatra_lord,
                    },
                  });
                  setSaved(true);
                  toast.success('Kundali saved to History!');
                } catch { toast.error('Could not save to history'); }
                finally { setSaving(false); }
              }} disabled={saving || saved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-emerald-400' : ''}`} />
                {saved ? 'Saved to History' : saving ? 'Saving…' : 'Save to History'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Talk to AI Banner */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="mb-8">
          <div className="relative overflow-hidden rounded-2xl px-6 py-5"
            style={{ background: 'linear-gradient(135deg, #2e0e62 0%, #18094a 45%, #0d1848 100%)', border: '1px solid rgba(201,168,76,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {/* decorative stars */}
            {[3,17,31,45,63,79,91].map(v => (
              <div key={v} className="absolute rounded-full bg-white"
                style={{ left:`${(v*1.3+7)%95}%`, top:`${(v*2.1+11)%85}%`, width:'2px', height:'2px', opacity: 0.35 }} />
            ))}
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 35%, rgba(201,168,76,0.25) 0%, rgba(60,10,120,0.6) 100%)', border: '2px solid rgba(201,168,76,0.55)' }}>
                <motion.span className="text-gold-400 text-2xl"
                  animate={{ rotate: [0,12,-12,0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>🔮</motion.span>
              </div>
              {/* Text */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-serif text-gold-400 text-lg font-semibold leading-tight">
                  AI से पूछें जो चाहें — ज्योतिष, जीवन, भविष्य
                </h3>
                <p className="text-gray-300 text-sm mt-0.5">
                  अपने ज्योतिष की गहराई में जाएं — Vedic AI powered by Claude
                </p>
              </div>
              {/* CTA */}
              <Link to="/chat"
                className="flex-shrink-0 flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8D060 100%)', color: '#12093A', boxShadow: '0 4px 18px rgba(201,168,76,0.35)' }}>
                <Sparkles className="w-4 h-4" />
                Talk to AI
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Core Placements + Panchang strip */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {[
            ['Lagna','Ascendant',data.lagna],
            ['Rashi','Moon Sign',data.moon_sign],
            ['Sun','Sun Sign',data.sun_sign],
            ['Nakshatra','Birth Star',`${data.nakshatra||'—'} P${data.nakshatra_pada||'—'}`],
            ['Tithi','Lunar Day',panchang.tithi?.name?.replace('Shukla ','Sh. ')?.replace('Krishna ','Kr. ')||'—'],
            ['Yoga','Yoga',panchang.yoga?.name||'—'],
            ['Karana','Karana',panchang.karana?.name||'—'],
            ['Vaar','Weekday',panchang.vaar?.name?.split(' ')[0]||'—'],
          ].map(([key, label, val]) => (
            <div key={key} className="card-cosmic p-3 text-center">
              <div className="text-gray-300 text-[10px] uppercase tracking-wider mb-1">{label}</div>
              <div className="text-gold-400 font-semibold text-sm leading-tight">{val || '—'}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['chart','Kundali Charts'],['planets','Planets & Houses'],['dasha','Dasha Timeline'],['navamsha','Navamsha (D-9)'],['upgrahas','Upgrahas'],['strength','Shadbala'],['bhavabala','Bhava Bala'],['namkaran','Namkaran Sanskar']].map(([t,l])=>(
            <TabButton key={t} active={tab===t} onClick={()=>{ setTab(t); if(t==='namkaran' && !namkaran) fetchNamkaran(); }}>{l}</TabButton>
          ))}
        </div>

        {/* TAB: Birth Chart */}
        {tab === 'chart' && (
          <motion.div key="chart" initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
            {/* 4 Kundali Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chandra Kundali */}
              <div className="card-cosmic p-5 flex flex-col items-center gap-3">
                <h3 className="font-serif text-gold-400 text-base self-start">Chandra Kundali (Moon Chart)</h3>
                <SouthIndianChart planetaryPositions={pp} lagna={data.moon_sign} size={300} />
                <p className="text-gray-300 text-xs text-center">Moon as Lagna — {data.moon_sign} rises</p>
              </div>
              {/* Chalit Kundali */}
              <div className="card-cosmic p-5 flex flex-col items-center gap-3">
                <h3 className="font-serif text-gold-400 text-base self-start">Chalit Kundali (Bhava Chart)</h3>
                <SouthIndianChart
                  planetaryPositions={Object.fromEntries(
                    Object.entries(pp).map(([planet, pos]) => {
                      const diff = ((pos.degree - data.lagna_degree + 360 + 15) % 360);
                      const chHouse = Math.floor(diff / 30) + 1;
                      const chSignIdx = (data.lagna_sign_index + chHouse - 1) % 12;
                      return [planet, { sign: SIGNS[chSignIdx], sign_index: chSignIdx, retrograde: pos.retrograde }];
                    })
                  )}
                  lagna={data.lagna}
                  size={300}
                />
                <p className="text-gray-300 text-xs text-center">Equal Bhava houses — planets placed by ±15° cusp rule</p>
              </div>
              {/* Navamsha Kundali */}
              <div className="card-cosmic p-5 flex flex-col items-center gap-3">
                <h3 className="font-serif text-gold-400 text-base self-start">Navamsha Kundali (D-9)</h3>
                {dc.navamsha ? (
                  <>
                    <SouthIndianChart
                      planetaryPositions={Object.fromEntries(
                        Object.entries(dc.navamsha).filter(([k]) => k !== 'Lagna').map(([k, v]) => [k, { sign: v.sign, sign_index: v.sign_index, retrograde: false }])
                      )}
                      lagna={dc.navamsha.Lagna?.sign || data.lagna}
                      size={300}
                    />
                    <p className="text-gray-300 text-xs text-center">D-9 — Dharma, Marriage & Soul · Lagna: {dc.navamsha.Lagna?.sign || '—'}</p>
                  </>
                ) : <p className="text-gray-300 text-sm">Data not available</p>}
              </div>
              {/* Saptamsha Kundali */}
              <div className="card-cosmic p-5 flex flex-col items-center gap-3">
                <h3 className="font-serif text-gold-400 text-base self-start">Saptamsha Kundali (D-7)</h3>
                {dc.saptamsha ? (
                  <>
                    <SouthIndianChart
                      planetaryPositions={Object.fromEntries(
                        Object.entries(dc.saptamsha).filter(([k]) => k !== 'Lagna').map(([k, v]) => [k, { sign: v.sign, sign_index: v.sign_index, retrograde: false }])
                      )}
                      lagna={dc.saptamsha.Lagna?.sign || data.lagna}
                      size={300}
                    />
                    <p className="text-gray-300 text-xs text-center">D-7 — Children & Progeny · Lagna: {dc.saptamsha.Lagna?.sign || '—'}</p>
                  </>
                ) : <p className="text-gray-300 text-sm">Data not available</p>}
              </div>
            </div>
            {/* Dasha + Personality */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {/* Current Dasha */}
                {currentDasha && (
                  <div className="card-cosmic p-5 border border-gold-600/30">
                    <h3 className="font-serif text-gold-400 text-lg mb-3">Current Dasha Period</h3>
                    <div className="bg-gold-500/10 rounded-xl p-3 mb-3">
                      <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Mahadasha (Major)</p>
                      <p className="text-gold-300 text-xl font-semibold">{currentDasha.planet} Dasha</p>
                      <p className="text-gray-300 text-xs">{currentDasha.start} — {currentDasha.end} — {currentDasha.years} years</p>
                    </div>
                    {currentAntar && (
                      <div className="bg-cosmic-900/60 rounded-xl p-3 border border-gold-600/20">
                        <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Antardasha (Sub-Period)</p>
                        <p className="text-gold-200 text-lg font-semibold">{currentDasha.planet}/{currentAntar.planet}</p>
                        <p className="text-gray-300 text-xs">{currentAntar.start} — {currentAntar.end}</p>
                      </div>
                    )}
                    {data.dasha_balance && (
                      <p className="text-gray-300 text-xs mt-3 border-t border-gold-600/10 pt-3">
                        Dasha Balance at Birth: <span className="text-gold-500">{data.dasha_balance.planet}</span> — {data.dasha_balance.remaining_years} yrs remaining
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {/* Personality */}
                <div className="card-cosmic p-5">
                  <h3 className="font-serif text-gold-400 text-lg mb-3">Nature & Traits</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(data.personality_traits?.combined_traits || []).map(t=>(
                      <span key={t} className="px-3 py-1 rounded-full text-xs bg-gold-600/15 text-gold-400 border border-gold-600/20">{t}</span>
                    ))}
                  </div>
                  <p className="text-gold-300 text-sm font-medium mb-1">{data.life_purpose}</p>
                  <p className="text-gray-200 text-xs leading-relaxed">{data.swabhav}</p>
                </div>
                {/* LMT Info */}
                {data.lmt_info && (
                  <div className="card-cosmic p-4">
                    <h3 className="text-gold-400 font-medium text-sm mb-2">LMT & Sidereal Time Calculations</h3>
                    <div className="text-xs space-y-1.5 text-gray-200">
                      <p className="text-gray-300 uppercase tracking-wider text-[10px] mb-1">Local Mean Time</p>
                      <div className="flex justify-between"><span>Standard Meridian</span><span className="text-gray-300">{data.lmt_info.standard_meridian}° E</span></div>
                      <div className="flex justify-between"><span>Birth Longitude</span><span className="text-gray-300">{data.lmt_info.birth_longitude}° E</span></div>
                      <div className="flex justify-between"><span>LMT Correction</span><span className="text-gold-400">{data.lmt_info.lmt_correction_display}</span></div>
                      <div className="flex justify-between"><span>Local Mean Time</span><span className="text-gold-400 font-medium">{data.lmt_info.lmt}</span></div>
                      {siderealTime.lmst_time && (<>
                        <p className="text-gray-300 uppercase tracking-wider text-[10px] mt-2 mb-1 pt-2 border-t border-gold-600/10">Sidereal Time at Birth</p>
                        <div className="flex justify-between"><span>Interval from LMT Noon</span><span className="text-gray-300">{siderealTime.interval_from_noon_hrs} hrs</span></div>
                        <div className="flex justify-between"><span>Sidereal Acceleration</span><span className="text-gray-300">+{siderealTime.sidereal_acceleration_sec}s (10s/hr)</span></div>
                        <div className="flex justify-between"><span>LMST at Birth</span><span className="text-gold-400 font-medium">{siderealTime.lmst_time}</span></div>
                      </>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Planets & Houses */}
        {tab === 'planets' && (
          <motion.div key="planets" initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
            <div className="card-cosmic p-6">
              <h3 className="font-serif text-gold-400 text-xl mb-4">Graha Sthiti — Planetary Positions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-300 text-xs uppercase border-b border-gold-600/10">
                      {['Planet','Sign','House','Longitude','Deg in Sign','Nakshatra','Pada','Lord','Status'].map(h=>(
                        <th key={h} className="text-left pb-2 pr-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PLANET_ORDER.filter(n=>pp[n]).map((name,i)=>(
                      <tr key={name} className={`border-b border-gold-600/5 ${i%2===0?'bg-cosmic-900/20':''}`}>
                        <td className="py-2 pr-3">
                          <span className={`mr-1 ${PLANET_COLORS[name]}`}>{PLANET_SYMBOLS[name]}</span>
                          <span className="text-gray-200">{name}</span>
                        </td>
                        <td className="py-2 pr-3 text-gold-400">{pp[name].sign}</td>
                        <td className="py-2 pr-3 text-gray-300">{pp[name].house || '—'}</td>
                        <td className="py-2 pr-3 text-gray-200 tabular-nums">{parseFloat(pp[name].degree).toFixed(4)}°</td>
                        <td className="py-2 pr-3 text-gray-200 tabular-nums">{parseFloat(pp[name].sign_degree).toFixed(2)}°</td>
                        <td className="py-2 pr-3 text-gray-300 text-xs">{pp[name].nakshatra||'—'}</td>
                        <td className="py-2 pr-3 text-gray-200">{pp[name].nakshatra_pada||'—'}</td>
                        <td className="py-2 pr-3 text-gray-200 text-xs">{pp[name].nakshatra_lord||'—'}</td>
                        <td className="py-2">{pp[name].retrograde
                          ? <span className="text-orange-400 text-xs">Retrograde (R)</span>
                          : <span className="text-emerald-400 text-xs">Direct</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-cosmic p-6">
              <h3 className="font-serif text-gold-400 text-xl mb-4">Bhava — House Details (Whole Sign)</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {Array.from({length:12},(_,i)=>i+1).map(h=>{
                  const hSignIdx = (data.lagna_sign_index + h - 1) % 12;
                  const hSign = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][hSignIdx];
                  const hPlanets = (data.house_planets?.[h] || []);
                  const hLord = data.house_lords?.[h] || '—';
                  return (
                    <div key={h} className={`flex items-start gap-3 p-3 rounded-xl ${hPlanets.length>0?'bg-gold-500/5 border border-gold-600/20':'bg-cosmic-900/30'}`}>
                      <div className="w-8 h-8 rounded-lg bg-cosmic-800 flex items-center justify-center text-gold-400 font-bold text-sm flex-shrink-0">{h}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gold-400 text-sm font-medium">{hSign}</span>
                          <span className="text-gray-300 text-xs">Lord: {hLord}</span>
                        </div>
                        {hPlanets.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hPlanets.map(p=>(
                              <span key={p} className={`text-xs px-2 py-0.5 rounded-full bg-cosmic-800 ${PLANET_COLORS[p]}`}>
                                {PLANET_SYMBOLS[p]} {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Dasha Timeline */}
        {tab === 'dasha' && (
          <motion.div key="dasha" initial={{opacity:0}} animate={{opacity:1}} className="card-cosmic p-6">
            <h3 className="font-serif text-gold-400 text-xl mb-1">Vimshottari Dasha — 120-Year Life Timeline</h3>
            <p className="text-gray-300 text-xs mb-2">Click any Mahadasha to expand Antardasha sub-periods</p>
            {data.dasha_balance && (
              <div className="mb-4 p-3 rounded-xl bg-gold-500/5 border border-gold-600/20 text-xs text-gray-200">
                Dasha Balance at Birth — <span className="text-gold-400 font-medium">{data.dasha_balance.planet}</span>: {data.dasha_balance.remaining_years} years remaining ({data.dasha_balance.remaining_months} months)
              </div>
            )}
            {dashas.length > 0 ? <DashaTimeline dashas={dashas} /> : <p className="text-gray-300 text-sm">Dasha data not available</p>}
          </motion.div>
        )}

        {/* TAB: Navamsha */}
        {tab === 'navamsha' && (
          <motion.div key="navamsha" initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
            <div className="card-cosmic p-6">
              <h3 className="font-serif text-gold-400 text-xl mb-2">Navamsha (D-9) — Marriage, Dharma & Inner Soul</h3>
              <p className="text-gray-300 text-xs mb-4">Each 30° sign divided into 9 parts — 3°20'. Chara signs → Aries, Fixed → Capricorn, Dual → Cancer.</p>
              {dc.navamsha && (
                <div>
                  <div className="mb-6 flex flex-col items-center">
                    <SouthIndianChart
                      planetaryPositions={Object.fromEntries(
                        Object.entries(dc.navamsha).filter(([k])=>k!=='Lagna').map(([k,v])=>[k,{...v,sign_index:v.sign_index,retrograde:false}])
                      )}
                      lagna={dc.navamsha['Lagna']?.sign || data.lagna}
                      size={320}
                    />
                    <p className="text-gray-300 text-xs mt-2 text-center">Navamsha Lagna: {dc.navamsha['Lagna']?.sign || '—'}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-300 text-xs uppercase border-b border-gold-600/10">
                          <th className="text-left pb-2">Planet</th>
                          <th className="text-left pb-2">D-1 Sign</th>
                          <th className="text-left pb-2">Navamsha Sign (D-9)</th>
                          <th className="text-left pb-2">Part</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...PLANET_ORDER,'Lagna'].filter(n=>dc.navamsha[n]).map((name,i)=>(
                          <tr key={name} className={`border-b border-gold-600/5 ${i%2===0?'bg-cosmic-900/20':''}`}>
                            <td className="py-2 text-gray-200">{name==='Lagna'?'Lagna (Asc)':name}</td>
                            <td className="py-2 text-gray-200">{name==='Lagna'?data.lagna:pp[name]?.sign||'—'}</td>
                            <td className="py-2 text-gold-400 font-medium">{dc.navamsha[name].sign}</td>
                            <td className="py-2 text-gray-300">{dc.navamsha[name].part}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {[
              ['Hora (D-2) — Wealth & Finances','Each sign divided into 2 — 15°. Odd signs: Sun(Leo)/Moon(Can). Even: Moon(Can)/Sun(Leo).','hora'],
              ['Drekkana (D-3) — Siblings & Courage','3 — 10° per sign. 1st=own, 2nd=5th from it, 3rd=9th from it.','drekkana'],
              ['Dashamsha (D-10) — Career & Profession','10 — 3° per sign. Odd→own sign start, Even→9th sign start.','dashamsha'],
            ].map(([title,desc,key])=>(
              <div key={key} className="card-cosmic p-6">
                <h3 className="font-serif text-gold-400 text-lg mb-1">{title}</h3>
                <p className="text-gray-300 text-xs mb-4">{desc}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-300 text-xs uppercase border-b border-gold-600/10">
                        <th className="text-left pb-2">Planet</th>
                        <th className="text-left pb-2">D-1 Sign</th>
                        <th className="text-left pb-2">Divisional Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLANET_ORDER.filter(n=>dc[key]?.[n]).map((name,i)=>(
                        <tr key={name} className={`border-b border-gold-600/5 ${i%2===0?'bg-cosmic-900/20':''}`}>
                          <td className="py-2 text-gray-200">{name}</td>
                          <td className="py-2 text-gray-200">{pp[name]?.sign||'—'}</td>
                          <td className="py-2 text-gold-400">{dc[key][name].sign}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB: Upgrahas */}
        {tab === 'upgrahas' && (
          <motion.div key="upgrahas" initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
            <div className="card-cosmic p-6">
              <h3 className="font-serif text-gold-400 text-xl mb-2">Upgrahas — Shadow Planets & Tertiary Points</h3>
              <p className="text-gray-300 text-xs mb-4">
                Dhuma = Sun + 133°20' — Vyatipata = 360° - Dhuma — Paridhi = Vyatipata + 180° — Indrachapa = 360° - Paridhi — Upketu = Indrachapa + 16°40'
                <br/>Gulika & Mandi = Ascendant at Saturn's hora during birth day
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(upgrahas).map(([name, uData]) => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-cosmic-900/40 border border-gold-600/10">
                    <div className="w-20 text-gold-400 font-medium text-sm">{name}</div>
                    <div className="flex-1">
                      <span className="text-gray-200 text-sm">{uData.sign}</span>
                      <span className="text-gray-300 text-xs ml-2">{parseFloat(uData.sign_degree||0).toFixed(2)}°</span>
                    </div>
                    <div className="text-gray-300 text-xs tabular-nums">{parseFloat(uData.degree||0).toFixed(2)}° abs</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Bhava Bala */}
        {tab === 'bhavabala' && (
          <motion.div key="bhavabala" initial={{opacity:0}} animate={{opacity:1}} className="card-cosmic p-6">
            <h3 className="font-serif text-gold-400 text-xl mb-2">Bhava Bala — House Strength</h3>
            <p className="text-gray-300 text-xs mb-1">
              <span className="text-gold-500">Bhavadhipati Bala</span> (lord's Shadbala — 0.5) +{' '}
              <span className="text-gold-500">Bhava Digbala</span> (sign type — house type: Chara→Kendra, Sthira→Panapara, Dual→Apoklima) +{' '}
              <span className="text-gold-500">Bhava Drishti Bala</span> (net benefic/malefic aspects on house midpoint)
            </p>
            <p className="text-gray-300 text-xs mb-4">Benefic aspects: +6 (full) / +2 (partial) — Malefic aspects: -4 (full) / -1 (partial) — Mars 4th & 8th, Jupiter 5th & 9th, Saturn 3rd & 10th (special)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-300 text-xs uppercase border-b border-gold-600/10">
                    {['House','Sign','Lord','House Type','Bhavadhipati','Dig Bala','Drishti Bala','Total','Strength'].map(h=>(
                      <th key={h} className="text-left pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bhavaBala).map(([hNum, bb], i) => (
                    <tr key={hNum} className={`border-b border-gold-600/5 ${i%2===0?'bg-cosmic-900/20':''}`}>
                      <td className="py-2 pr-3">
                        <span className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-cosmic-800 text-gold-400 font-bold text-xs">{hNum}</span>
                      </td>
                      <td className="py-2 pr-3 text-gold-400">{bb.sign}</td>
                      <td className="py-2 pr-3 text-gray-300">{bb.lord}</td>
                      <td className="py-2 pr-3 text-gray-300 text-xs">{bb.house_type}</td>
                      <td className="py-2 pr-3 text-gray-300 tabular-nums">{bb.bhavadhipati}</td>
                      <td className="py-2 pr-3 text-gray-300 tabular-nums">{bb.digbala}</td>
                      <td className="py-2 pr-3 text-gray-300 tabular-nums">{bb.drishti}</td>
                      <td className="py-2 pr-3 text-gold-400 font-semibold tabular-nums">{bb.total}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${bb.strength==='Strong'?'bg-emerald-500/20 text-emerald-400':bb.strength==='Medium'?'bg-gold-500/20 text-gold-400':'bg-red-500/20 text-red-400'}`}>
                          {bb.strength}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB: Shadbala */}
        {tab === 'strength' && (
          <motion.div key="strength" initial={{opacity:0}} animate={{opacity:1}} className="card-cosmic p-6">
            <h3 className="font-serif text-gold-400 text-xl mb-2">Shadbala — Six-Fold Planetary Strength</h3>
            <p className="text-gray-300 text-xs mb-4">
              Sthana Bala (positional) + Dig Bala (directional) + Naisargika (natural luminosity) + Chesta Bala (motional speed/retrograde)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-300 text-xs uppercase border-b border-gold-600/10">
                    {['Planet','Sthana','Dig Bala','Naisargika','Chesta','Total Score','Strength'].map(h=>(
                      <th key={h} className="text-left pb-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map((name,i)=>{
                    const sb = shadbala[name];
                    if (!sb) return null;
                    return (
                      <tr key={name} className={`border-b border-gold-600/5 ${i%2===0?'bg-cosmic-900/20':''}`}>
                        <td className="py-2 pr-4 text-gray-200">{name}</td>
                        <td className="py-2 pr-4 text-gray-200">{sb.sthana}</td>
                        <td className="py-2 pr-4 text-gray-200">{sb.dig}</td>
                        <td className="py-2 pr-4 text-gray-200">{sb.naisargika}</td>
                        <td className="py-2 pr-4 text-gray-200">{sb.chesta}</td>
                        <td className="py-2 pr-4 text-gold-400 font-semibold">{sb.total}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sb.strength==='Strong'?'bg-emerald-500/20 text-emerald-400':sb.strength==='Medium'?'bg-gold-500/20 text-gold-400':'bg-red-500/20 text-red-400'}`}>
                            {sb.strength}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB: Namkaran Sanskar */}
        {tab === 'namkaran' && (
          <motion.div key="namkaran" initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
            {namkaranLoading && (
              <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-gold-400"/></div>
            )}
            {!namkaranLoading && namkaran && (() => {
              const nm = namkaran.namkaran;
              const GANA_COLOR = { Deva: 'text-blue-300', Manushya: 'text-amber-300', Rakshasa: 'text-red-300' };
              const ELEM_COLOR = { Fire: 'text-orange-400', Earth: 'text-yellow-600', Air: 'text-cyan-400', Water: 'text-blue-400' };
              return (
                <>
                  {/* Hero letter card */}
                  <div className="card-cosmic p-8 text-center border border-gold-500/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-600/5 via-transparent to-purple-600/5 pointer-events-none"/>
                    <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-2">नामकरण संस्कार — Namkaran Sanskar</p>
                    <p className="text-gray-300 text-sm mb-6">Starting letter of the name — based on Janma Nakshatra Pada</p>

                    {/* The two letters — English & Hindi — side by side */}
                    <div className="flex items-center justify-center gap-10 mb-6">
                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-2xl bg-gold-500/10 border-2 border-gold-500/60 flex items-center justify-center mb-3"
                          style={{boxShadow:'0 0 32px rgba(201,168,76,0.25)'}}>
                          <span className="text-gold-300 font-serif" style={{fontSize:'3.5rem',lineHeight:1}}>{nm.letter.en}</span>
                        </div>
                        <p className="text-gray-300 text-xs uppercase tracking-widest">English</p>
                        <p className="text-gray-200 text-xs mt-1 italic">"{nm.letter.sound}"</p>
                      </div>

                      <div className="w-px h-24 bg-gold-600/30"/>

                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-2xl bg-purple-500/10 border-2 border-purple-400/50 flex items-center justify-center mb-3"
                          style={{boxShadow:'0 0 32px rgba(139,92,246,0.2)'}}>
                          <span className="text-purple-200" style={{fontSize:'3.5rem',lineHeight:1,fontFamily:'Nirmala UI, Mangal, sans-serif'}}>{nm.letter.hi}</span>
                        </div>
                        <p className="text-gray-300 text-xs uppercase tracking-widest">नाम का</p>
                        <p className="text-gray-300 text-xs mt-1">आरंभिक अक्षर</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500/10 border border-gold-500/30">
                      <span className="text-gold-400 text-sm font-medium">{nm.nakshatraHi} नक्षत्र</span>
                      <span className="text-gold-600">—</span>
                      <span className="text-gold-400 text-sm font-medium">{nm.pada}{'th' === '1th' ? 'st' : nm.pada === 1 ? 'st' : nm.pada === 2 ? 'nd' : nm.pada === 3 ? 'rd' : 'th'} Pada</span>
                    </div>
                  </div>

                  {/* Nakshatra info + All 4 Padas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Nakshatra Details */}
                    <div className="card-cosmic p-6">
                      <h3 className="font-serif text-gold-400 text-lg mb-4">जन्म नक्षत्र — Birth Star Details</h3>
                      <div className="space-y-3">
                        {[
                          ['Nakshatra (नक्षत्र)', `${nm.nakshatra} — ${nm.nakshatraHi}`],
                          ['Nakshatra Lord (स्वामी)', `${nm.lord} — ${nm.lordHi}`],
                          ['Presiding Deity (देवता)', `${nm.deity} — ${nm.deityHi}`],
                          ['Element (तत्व)', `${nm.element} — ${nm.elementHi}`],
                          ['Gana (गण)', `${nm.gana} — ${nm.ganaHi}`],
                          ['Symbol (प्रतीक)', nm.symbol],
                          ['Pada (पाद)', `${nm.pada} of 4`],
                          ['Moon Sign (चंद्र राशि)', namkaran.moon_sign],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between items-start gap-4 py-1.5 border-b border-gold-600/10">
                            <span className="text-gray-300 text-xs">{label}</span>
                            <span className="text-gray-200 text-xs text-right font-medium">{val || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* All 4 Padas */}
                    <div className="card-cosmic p-6">
                      <h3 className="font-serif text-gold-400 text-lg mb-1">सभी पाद — All 4 Padas</h3>
                      <p className="text-gray-300 text-xs mb-4">Name may start with any sound from the correct pada</p>
                      <div className="space-y-3">
                        {nm.allPadas.map((pd, i) => {
                          const isActive = (i + 1) === nm.pada;
                          return (
                            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-gold-500/15 border border-gold-500/50' : 'bg-cosmic-900/40 border border-gold-600/10'}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive ? 'bg-gold-500 text-cosmic-950' : 'bg-cosmic-800 text-gray-300'}`}>
                                {i + 1}
                              </div>
                              <div className="flex items-center gap-4 flex-1">
                                <span className={`font-serif text-2xl ${isActive ? 'text-gold-300' : 'text-gray-400'}`}>{pd.en}</span>
                                <span className={`text-2xl ${isActive ? 'text-purple-300' : 'text-gray-500'}`} style={{fontFamily:'Nirmala UI, Mangal, sans-serif'}}>{pd.hi}</span>
                                <span className={`text-xs flex-1 ${isActive ? 'text-gray-200 italic' : 'text-gray-400 italic'}`}>{pd.sound}</span>
                              </div>
                              {isActive && <span className="text-gold-400 text-xs font-bold px-2 py-0.5 rounded-full bg-gold-500/20">✦ Yours</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="card-cosmic p-6 border border-gold-600/20">
                    <h3 className="font-serif text-gold-400 text-lg mb-3">वैदिक नामकरण — The Vedic Naming System</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-cosmic-900/50 rounded-xl p-4">
                        <div className="text-gold-400 font-semibold mb-2 text-xs uppercase tracking-wider">Step 1 — Janma Nakshatra</div>
                        <p className="text-gray-200 text-xs leading-relaxed">The Moon's exact longitude at birth determines the <span className="text-gold-400">Janma Nakshatra</span> (birth star). The zodiac has 27 nakshatras, each spanning 13°20'.</p>
                      </div>
                      <div className="bg-cosmic-900/50 rounded-xl p-4">
                        <div className="text-gold-400 font-semibold mb-2 text-xs uppercase tracking-wider">Step 2 — Pada (Quarter)</div>
                        <p className="text-gray-200 text-xs leading-relaxed">Each nakshatra is divided into <span className="text-gold-400">4 padas</span> of 3°20' each — giving 108 padas total, one for each bead of a mala. Your Moon falls in Pada <span className="text-gold-400">{nm.pada}</span>.</p>
                      </div>
                      <div className="bg-cosmic-900/50 rounded-xl p-4">
                        <div className="text-gold-400 font-semibold mb-2 text-xs uppercase tracking-wider">Step 3 — Naamaakshara</div>
                        <p className="text-gray-200 text-xs leading-relaxed">Each pada has a <span className="text-gold-400">Pada Swar</span> (phonetic syllable). The child's name is traditionally begun with this syllable — <span className="text-gold-400 font-bold">"{nm.letter.en}" ({nm.letter.hi})</span> in your case.</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-gold-500/5 border border-gold-600/20">
                      <p className="text-gray-200 text-xs leading-relaxed">
                        <span className="text-gold-400 font-semibold">Shubh Muhurta for Namkaran:</span> Traditionally performed on the <span className="text-gold-400">10th or 11th day</span> after birth, or on the <span className="text-gold-400">101st day</span>. Choose an auspicious weekday (Monday, Wednesday, Thursday, Friday), a Shukla Paksha tithi (2nd—12th), and avoid the Janma Nakshatra, Janma Tithi, and Janma Vara. Pushya nakshatra days are especially auspicious.
                      </p>
                    </div>
                  </div>

                  {/* 108 Padas Reference Table */}
                  <div className="card-cosmic p-6">
                    <h3 className="font-serif text-gold-400 text-lg mb-1">108 नक्षत्र पाद — Complete Reference Table</h3>
                    <p className="text-gray-300 text-xs mb-4">All 27 nakshatras — 4 padas = 108 Vedic name sounds</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gold-600/20 text-gray-300 uppercase tracking-wider">
                            <th className="text-left pb-2 pr-3">#</th>
                            <th className="text-left pb-2 pr-3">Nakshatra</th>
                            <th className="text-left pb-2 pr-3">नक्षत्र</th>
                            <th className="text-left pb-2 pr-3">Lord</th>
                            <th className="text-center pb-2 px-2">P1 (En/??)</th>
                            <th className="text-center pb-2 px-2">P2 (En/??)</th>
                            <th className="text-center pb-2 px-2">P3 (En/??)</th>
                            <th className="text-center pb-2 px-2">P4 (En/??)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {NAK_TABLE.map((row, i) => {
                            const isMyNak = row.name === nm.nakshatra;
                            return (
                              <tr key={row.name}
                                className={`border-b border-gold-600/5 ${isMyNak ? 'bg-gold-500/10' : i%2===0 ? 'bg-cosmic-900/20' : ''}`}>
                                <td className="py-2 pr-3 text-gray-400">{i+1}</td>
                                <td className="py-2 pr-3 text-gray-200">{row.name}</td>
                                <td className="py-2 pr-3 text-gray-300" style={{fontFamily:'Nirmala UI, Mangal, sans-serif'}}>{row.nameHi}</td>
                                <td className="py-2 pr-3 text-gray-300">{row.lord}</td>
                                {row.pada.map((pd, pi) => {
                                  const isActivePada = isMyNak && (pi + 1) === nm.pada;
                                  return (
                                    <td key={pi} className={`py-2 px-2 text-center ${isActivePada ? 'text-gold-300 font-bold' : 'text-gray-300'}`}>
                                      <span className="font-semibold">{pd.en}</span>
                                      <span className="text-gray-500 mx-0.5">/</span>
                                      <span style={{fontFamily:'Nirmala UI, Mangal, sans-serif'}}>{pd.hi}</span>
                                      {isActivePada && <span className="ml-1 text-gold-500">?</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
            {!namkaranLoading && !namkaran && (
              <div className="card-cosmic p-10 text-center">
                <p className="text-gold-400 font-serif text-lg mb-2">Namkaran Data Not Loaded</p>
                <p className="text-gray-300 text-sm mb-4">Click the button below to fetch your Namkaran letter</p>
                <button onClick={fetchNamkaran} className="px-6 py-2 bg-gold-500 text-cosmic-950 font-semibold rounded-xl hover:bg-gold-400 transition-all">
                  Load Namkaran Sanskar
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* --- COMPREHENSIVE KUNDALI REPORT -------------------------------- */}
        <ComprehensiveReport data={data} kundali={kundali} dashas={dashas} currentDasha={currentDasha} pp={pp} panchang={panchang} />

        {/* CTA */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="text-center mt-10">
          <p className="text-gray-200 mb-4">Want deeper insights into your chart?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={()=>navigate('/astrologers')} className="btn-gold px-8 py-3">Talk to an Astrologer ?</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- COMPREHENSIVE REPORT -----------------------------------------------------

function ComprehensiveReport({ data, kundali, dashas, currentDasha, pp, panchang }) {
  const NOW = new Date();
  const lagna = data.lagna || '';
  const moonSign = data.moon_sign || '';
  const nakshatra = data.nakshatra || '';
  const lagnaInfo = LAGNA_PHAL[lagna] || null;
  const nakInfo = NAKSHATRA_PHAL[nakshatra] || null;
  const currentMahaInfo = currentDasha ? MAHADASHA_PHAL[currentDasha.planet] : null;
  const currentAntar = currentDasha?.antardashas?.find(a => new Date(a.start) <= NOW && new Date(a.end) >= NOW);
  const ashtak = computeAshtakavarga(pp, lagna);

  // --- Mangal Dosha ---
  const marsSign = pp['Mars']?.sign;
  const marsHouse = pp['Mars']?.house;
  const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
  const mangalFromLagna = marsHouse ? MANGAL_HOUSES.includes(Number(marsHouse)) : false;
  const moonSignIdx = SIGN_INDEX[moonSign];
  const marsSignIdx = SIGN_INDEX[marsSign];
  let mangalFromMoon = false;
  if (moonSignIdx !== undefined && marsSignIdx !== undefined) {
    const diff = ((marsSignIdx - moonSignIdx + 12) % 12) + 1;
    mangalFromMoon = MANGAL_HOUSES.includes(diff);
  }
  const hasMangalDosha = mangalFromLagna || mangalFromMoon;

  // --- Sade Sati ---
  const saturnSign = pp['Saturn']?.sign;
  const saturnSignIdx = SIGN_INDEX[saturnSign];
  let sadeSatiPhase = 'Not Running';
  if (moonSignIdx !== undefined && saturnSignIdx !== undefined) {
    const rel = (saturnSignIdx - moonSignIdx + 12) % 12;
    if (rel === 11) sadeSatiPhase = 'Uday (Rising) Phase';
    else if (rel === 0) sadeSatiPhase = 'Shikhar (Peak) Phase';
    else if (rel === 1) sadeSatiPhase = 'Ast (Setting) Phase';
  }

  // --- Kaal Sarp Dosha ---
  const rahuHouse = pp['Rahu']?.house;
  const ketuHouse = pp['Ketu']?.house;
  const rahuDeg = parseFloat(pp['Rahu']?.degree || 0);
  const ketuDeg = parseFloat(pp['Ketu']?.degree || 0);
  let kaalSarp = false;
  let kaalSarpType = null;
  if (rahuHouse && ketuHouse) {
    const planetDegrees = PLANET_ORDER.filter(n => n !== 'Rahu' && n !== 'Ketu' && pp[n])
      .map(n => parseFloat(pp[n].degree));
    const minD = Math.min(rahuDeg, ketuDeg);
    const maxD = Math.max(rahuDeg, ketuDeg);
    const span = maxD - minD;
    if (span <= 180) {
      kaalSarp = planetDegrees.every(d => d >= minD && d <= maxD);
    } else {
      kaalSarp = planetDegrees.every(d => d <= minD || d >= maxD);
    }
    if (kaalSarp) {
      kaalSarpType = KAAL_SARP_TYPES[Number(rahuHouse)] || KAAL_SARP_TYPES[1];
    }
  }

  // --- Saturn transit relative to Moon ---
  const saturnTransitRel = (moonSignIdx !== undefined && saturnSignIdx !== undefined)
    ? (saturnSignIdx - moonSignIdx + 12) % 12 : null;
  const SATURN_TRANSIT_TEXT = [
    'Saturn transiting your own Moon sign (1st from Moon) can bring physical challenges, health concerns, and a general sense of heaviness or restriction. This is a period calling for patience, careful lifestyle management, and deep introspection about your foundations.',
    'Saturn moving through the 2nd sign from your Moon affects finances, speech, and family. This is a period for careful financial planning, measured communication, and attending to family obligations with patience and discipline.',
    'Saturn in the 3rd from Moon is generally favorable. Courage, persistence, and your ability to work hard on long-term projects are highlighted. Sibling relationships may require patience, but overall you make steady progress.',
    'Saturn transiting the 4th from Moon brings challenges to domestic life, property matters, and inner emotional peace. Home renovations, family responsibilities, and a need for inner restructuring are characteristic of this transit.',
    'Saturn in the 5th from Moon can bring delays or difficulties with children, creativity, and speculative ventures. This is a period for disciplined creative practice rather than risk-taking, and for thoughtful attention to children\'s needs.',
    'Saturn moving through the 6th from Moon is generally beneficial — it gives you the discipline to overcome obstacles, improve health through routine, and handle responsibilities with systematic efficiency. Service-oriented work flourishes.',
    'Saturn transiting the 7th from Moon (Kantaka Shani) tests partnerships and marriage. Relationships built on genuine commitment deepen, while those lacking authentic foundation may face challenges. Patience and honest communication are essential.',
    'Saturn in the 8th from Moon brings transformation through difficulty. Financial restructuring, health transformations, and confronting deep psychological patterns are characteristic. This transit ultimately builds inner strength and wisdom.',
    'Saturn transiting the 9th from Moon can challenge luck, fortune, and relationships with teachers and father figures. Long-held beliefs are tested and refined. Dedicated spiritual practice sustains you through this period.',
    'Saturn moving through the 10th from Moon (Ashtama Shani) from the career angle can bring professional challenges, changes in status, and the need for redirection. Work with integrity and persistence; lasting restructuring is happening.',
    'Saturn in the 11th from Moon is one of its most beneficial transit positions — gains accumulate, social networks strengthen, and long-term goals begin yielding results. Persistent, patient efforts receive their rewards.',
    'Saturn transiting the 12th from Moon begins the Sade Sati\'s Uday phase. Increased expenses, a desire for solitude and retreat, and spiritual stirring are characteristic. Use this period for inner preparation and spiritual investment.',
  ];
  const saturnTransitInterpretation = saturnTransitRel !== null ? SATURN_TRANSIT_TEXT[saturnTransitRel] : 'Saturn transit calculation requires complete planetary data.';

  // Jupiter transit
  const jupiterSign = pp['Jupiter']?.sign;
  const jupiterSignIdx = SIGN_INDEX[jupiterSign];
  const jupiterTransitRel = (moonSignIdx !== undefined && jupiterSignIdx !== undefined)
    ? (jupiterSignIdx - moonSignIdx + 12) % 12 : null;
  const JUPITER_TRANSIT_TEXT = [
    'Jupiter transiting your Moon sign brings a year of expansion, optimism, and genuine opportunities. New beginnings, travel, educational pursuits, and spiritual growth are all supported. This is one of the most auspicious transit positions for overall well-being.',
    'Jupiter in the 2nd from Moon increases wealth, improves family harmony, and brings eloquence and abundance in speech. Financial opportunities arise and family relationships become more generous and supportive.',
    'Jupiter moving through the 3rd from Moon is generally less favorable. Excessive mental activity, some challenges with siblings, and a need for more self-discipline in communication are characteristic. Focus on internal development.',
    'Jupiter in the 4th from Moon brings blessings to home, property, and mother. Real estate opportunities, domestic happiness, and a deepened sense of security and rootedness are supported during this transit.',
    'Jupiter transiting the 5th from Moon is highly auspicious for children, creative projects, education, and romance. Speculative investments receive some support. Intelligence and creative expression flourish with Jupiter\'s blessings.',
    'Jupiter in the 6th from Moon can bring health improvements and help you overcome obstacles and competitors. Service-oriented work and health-focused disciplines receive support, though this position requires vigilance about overconfidence.',
    'Jupiter transiting the 7th from Moon is auspicious for marriage, partnerships, and all one-on-one relationships. Meeting a life partner, deepening existing marriage, and forming beneficial professional partnerships are all supported.',
    'Jupiter moving through the 8th from Moon can bring both gifts and challenges through transformation, inheritance, and occult knowledge. Financial windfalls from unexpected sources are possible alongside periods of deep inner change.',
    'Jupiter in the 9th from Moon is one of the most auspicious transit positions — luck, divine blessings, higher learning, travel, and spiritual growth are all powerfully supported. Teachers, gurus, and fortunate opportunities flow toward you.',
    'Jupiter transiting the 10th from Moon supports career advancement, professional recognition, and the achievement of status. Your reputation expands, and meaningful professional opportunities arrive. This is an excellent time for launches.',
    'Jupiter in the 11th from Moon brings gains — financial, social, and professional. Friend circles expand, long-held goals come to fruition, and elder siblings may play a supportive role. Network expansion yields meaningful results.',
    'Jupiter transiting the 12th from Moon encourages spiritual retreat, inner development, and connection with foreign or distant places. Generosity and charitable giving are spiritually rewarding. Rest and retreat are productive, not wasteful.',
  ];
  const jupiterTransitInterpretation = jupiterTransitRel !== null ? JUPITER_TRANSIT_TEXT[jupiterTransitRel] : 'Jupiter transit calculation requires complete planetary data.';

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
      <div className="section-divider-gold mb-8"><span>✦ Comprehensive Kundali Report ✦</span></div>

      {/* A. Personal Details Table */}
      <AccordionSection title="Personal Details & Panchang" icon="📅" defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Date of Birth', kundali.dob || data.dob || '—'],
                ['Time of Birth', kundali.birth_time || data.birth_time || '—'],
                ['Birth Place', kundali.birth_place || data.birth_place || '—'],
                ['Timezone', data.lmt_info ? `UTC+${data.lmt_info.birth_timezone || '—'}` : '—'],
                ['Lagna (Ascendant)', lagna || '—'],
                ['Rashi (Moon Sign)', moonSign || '—'],
                ['Sun Sign', data.sun_sign || '—'],
                ['Nakshatra', `${nakshatra || '—'} Pada ${data.nakshatra_pada || '—'}`],
                ['Nakshatra Lord', data.nakshatra_lord || pp['Moon']?.nakshatra_lord || '—'],
                ['Lagna Lord', data.lagna_lord || '—'],
                ['Ayanamsha (Lahiri)', data.ayanamsha?.dms || '—'],
                ['Julian Day', data.julian_day ? parseFloat(data.julian_day).toFixed(4) : '—'],
                ['Sunrise', data.sunrise || '—'],
                ['Sunset', data.sunset || '—'],
                ['Tithi', panchang.tithi?.name || '—'],
                ['Yoga', panchang.yoga?.name || '—'],
                ['Karana', panchang.karana?.name || '—'],
                ['Vaar (Weekday)', panchang.vaar?.name || '—'],
                ['Current Mahadasha', currentDasha ? `${currentDasha.planet} (${currentDasha.start?.slice(0,4)} — ${currentDasha.end?.slice(0,4)})` : '—'],
                ['Current Antardasha', currentAntar ? `${currentDasha.planet}/${currentAntar.planet}` : '—'],
                ['Dasha Balance at Birth', data.dasha_balance ? `${data.dasha_balance.planet} — ${data.dasha_balance.remaining_years} yrs` : '—'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-gold-600/8">
                  <td className="py-2 pr-4 text-gray-300 text-xs uppercase tracking-wider w-48 flex-shrink-0">{k}</td>
                  <td className="py-2 text-gray-200 text-sm">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      {/* B. Planetary Positions Table */}
      <AccordionSection title="Planetary Positions (Graha Sthiti)" icon="🪐">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-300 text-xs uppercase border-b border-gold-600/15">
                {['Planet', 'Sign (Rashi)', 'Degrees', 'Nakshatra', 'Pada', 'Retrograde'].map(h => (
                  <th key={h} className="text-left pb-2 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLANET_ORDER.filter(n => pp[n]).map((name, i) => (
                <tr key={name} className={`border-b border-gold-600/5 ${i % 2 === 0 ? 'bg-cosmic-900/20' : ''}`}>
                  <td className="py-2 pr-3">
                    <span className={`mr-1 ${PLANET_COLORS[name]}`}>{PLANET_SYMBOLS[name]}</span>
                    <span className="text-gray-200">{name}</span>
                  </td>
                  <td className="py-2 pr-3 text-gold-400">{pp[name].sign}</td>
                  <td className="py-2 pr-3 text-gray-200 tabular-nums">{parseFloat(pp[name].sign_degree || 0).toFixed(2)}°</td>
                  <td className="py-2 pr-3 text-gray-300 text-xs">{pp[name].nakshatra || '—'}</td>
                  <td className="py-2 pr-3 text-gray-200">{pp[name].nakshatra_pada || '—'}</td>
                  <td className="py-2">
                    {pp[name].retrograde
                      ? <span className="text-orange-400 text-xs">R</span>
                      : <span className="text-emerald-400 text-xs">Direct</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionSection>

      {/* C. Lagna Phal */}
      <AccordionSection title={`Lagna Phal — ${lagna} Ascendant Analysis`} icon="🌟">
        {lagnaInfo ? (
          <div className="space-y-4">
            <div>
              <p className="text-gold-400 font-semibold text-sm mb-1">Physical Appearance</p>
              <p className="text-gray-200 text-sm leading-relaxed">{lagnaInfo.appearance}</p>
            </div>
            <div>
              <p className="text-gold-400 font-semibold text-sm mb-1">Personality & Character</p>
              <p className="text-gray-200 text-sm leading-relaxed">{lagnaInfo.personality}</p>
            </div>
            <div>
              <p className="text-gold-400 font-semibold text-sm mb-1">Nature & Tendencies</p>
              <p className="text-gray-200 text-sm leading-relaxed">{lagnaInfo.nature}</p>
            </div>
            <div>
              <p className="text-gold-400 font-semibold text-sm mb-1">Health Tendencies</p>
              <p className="text-gray-200 text-sm leading-relaxed">{lagnaInfo.health}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-sm">Lagna interpretation not available for: {lagna}</p>
        )}
      </AccordionSection>

      {/* D. Nakshatra Phal */}
      <AccordionSection title={`Nakshatra Phal — ${nakshatra} Birth Star Analysis`} icon="⭐">
        {nakInfo ? (
          <div className="space-y-4">
            {[
              ['Nature & Character', nakInfo.nature],
              ['Career & Income', nakInfo.career],
              ['Education', nakInfo.education],
              ['Family Life', nakInfo.family],
              ['Health', nakInfo.health],
            ].map(([label, text]) => (
              <div key={label}>
                <p className="text-gold-400 font-semibold text-sm mb-1">{label}</p>
                <p className="text-gray-200 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-sm">Nakshatra interpretation not available for: {nakshatra}</p>
        )}
      </AccordionSection>

      {/* E. Vistrit Bhavishhyaphal */}
      <AccordionSection title="Vistrit Bhavishhyaphal — Detailed Life Reading" icon="🔮">
        <VistritBhavishhyaphal lagna={lagna} moonSign={moonSign} lagnaInfo={lagnaInfo} />
      </AccordionSection>

      {/* F. Mangal Dosha */}
      <AccordionSection title="Mangal Dosha Analysis" icon="⚔️">
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${hasMangalDosha ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
            {hasMangalDosha ? '⚔️ Mangal Dosha Present' : '✓ No Mangal Dosha'}
          </div>
          {marsHouse && (
            <p className="text-gray-300 text-xs">Mars is placed in House <span className="text-gold-400">{marsHouse}</span> ({marsSign}).
              {mangalFromLagna ? ' This house (from Lagna) is a Mangal Dosha house.' : ' This house is not a classical Mangal Dosha house from Lagna.'}
              {mangalFromMoon ? ' From Moon sign, Mars falls in a Mangal Dosha position.' : ''}
            </p>
          )}
          <div>
            <p className="text-gold-400 font-semibold text-sm mb-2">About Mangal Dosha</p>
            <p className="text-gray-200 text-sm leading-relaxed">Mangal Dosha (also called Kuja Dosha) occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Lagna (Ascendant) or Moon sign. Mars is the planet of energy, assertion, and sometimes aggression. When placed in these sensitive houses, it can create friction or intensity in marital and partnership areas. Classical texts consider both the Lagna and Moon chart. The 7th house represents marriage directly; the 2nd affects family; the 4th, domestic peace; the 8th, longevity; the 12th, bedroom life; and the 1st, the self.</p>
          </div>
          {hasMangalDosha && (
            <div>
              <p className="text-gold-400 font-semibold text-sm mb-2">Traditional Remedies</p>
              <div className="space-y-2 text-sm text-gray-200">
                <p className="font-medium text-gray-300">Pre-Marriage Remedies:</p>
                <ul className="space-y-1 pl-4">
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Kumbh Vivah — a symbolic marriage to a peepal tree, pot (kumbh), or Vishnu idol before the actual marriage.</li>
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Vishnu Sahasranama recitation every Tuesday for 40 consecutive days.</li>
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Offering red flowers, red lentils (masoor dal), and jaggery to Lord Hanuman on Tuesdays.</li>
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Recitation of the Hanuman Chalisa 108 times on Tuesdays.</li>
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Wearing a red coral (moonga) gemstone set in gold or copper on the ring finger after proper astrological consultation.</li>
                </ul>
                <p className="font-medium text-gray-300 mt-3">Post-Marriage Remedies:</p>
                <ul className="space-y-1 pl-4">
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Recite the Mangal Stotram together on Tuesdays.</li>
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Offer food and service to Hanuman temple together as a couple on Tuesdays.</li>
                  <li className="before:content-['◆'] before:text-gold-600 before:mr-2">Practice channeling Mars energy positively through shared physical exercise, adventure, or creative challenges as a couple.</li>
                </ul>
                <p className="text-xs text-gray-300 mt-3 italic">Note: Mangal Dosha cancels when both partners have it, when Mars is in its own sign or exaltation, or when benefic aspects on Mars are strong. Consult a qualified Vedic astrologer for a complete assessment.</p>
              </div>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* G. Sade Sati */}
      <AccordionSection title="Sade Sati Report" icon="🪐">
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${sadeSatiPhase !== 'Not Running' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
            {sadeSatiPhase !== 'Not Running' ? `🪐 Sade Sati Running — ${sadeSatiPhase}` : '✓ Sade Sati Not Currently Running'}
          </div>
          {saturnSign && moonSign && (
            <p className="text-gray-300 text-xs">Saturn is currently in <span className="text-gold-400">{saturnSign}</span>. Your Moon sign is <span className="text-gold-400">{moonSign}</span>.</p>
          )}
          <div>
            <p className="text-gold-400 font-semibold text-sm mb-2">About Sade Sati</p>
            <p className="text-gray-200 text-sm leading-relaxed">Sade Sati ("seven and a half") refers to the seven-and-a-half year period when Saturn transits through three consecutive signs — the 12th sign from, the exact Moon sign, and the 2nd sign from the birth Moon. Each phase lasts approximately two and a half years as Saturn moves slowly through each sign. This is considered one of the most significant transit periods in Vedic astrology, associated with Saturn's testing of the soul through challenges, responsibilities, and spiritual maturation. The three phases — Uday (rising), Shikhar (peak), and Ast (setting) — each have distinct qualities and lessons.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { phase: 'Uday (Rising) Phase', desc: 'Saturn transiting the 12th sign from Moon. Increased expenses, tendency toward withdrawal, desires for travel or spiritual retreat. Inner preparation and spiritual investment yield great dividends. Let go of what no longer serves you.' },
              { phase: 'Shikhar (Peak) Phase', desc: 'Saturn transiting the exact Moon sign. Maximum intensity of challenges — health, career, relationships, and mental peace may all be tested. Patience, humility, and devoted spiritual practice are the keys. The greatest growth often comes from this phase.' },
              { phase: 'Ast (Setting) Phase', desc: 'Saturn transiting the 2nd sign from Moon. Challenges begin to ease, though financial prudence remains important. A sense of lightening and renewed possibility returns. The wisdom earned in the previous phases begins to yield its fruit.' },
            ].map(({ phase, desc }) => (
              <div key={phase} className={`p-4 rounded-xl border ${sadeSatiPhase.includes(phase.split(' ')[0]) ? 'bg-violet-500/10 border-violet-500/30' : 'bg-cosmic-900/40 border-gold-600/10'}`}>
                <p className="text-gold-400 font-semibold text-xs mb-2">{phase}</p>
                <p className="text-gray-200 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-gold-400 font-semibold text-sm mb-2">Sade Sati Remedies</p>
            <p className="text-gray-200 text-sm leading-relaxed">Offer mustard oil and sesame seeds (til) to Lord Shani at a Shani temple on Saturdays. Recite the Shani Chalisa or Shani Stotra regularly. Serve the poor, elderly, and disabled — Saturn blesses those who serve selflessly. Wear blue sapphire (neelam) only after consultation with a qualified astrologer. Worship Hanuman on Saturdays, as Hanuman is considered a protector against Saturn's malefic effects. Practice contentment, patience, and non-attachment — these are Saturn's greatest teachings and, when embraced, transform his difficult transits into periods of profound wisdom.</p>
          </div>
        </div>
      </AccordionSection>

      {/* H. Kaal Sarp Dosha */}
      <AccordionSection title="Kaal Sarp Dosha Analysis" icon="🐍">
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${kaalSarp ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
            {kaalSarp
              ? `🐍 Kaal Sarp Dosha Present — ${kaalSarpType?.name || 'Type Unknown'}`
              : '✓ Chart is Free from Kaal Sarp Dosha'}
          </div>
          {kaalSarp && kaalSarpType && (
            <div className="p-4 bg-gold-500/5 border border-gold-500/20 rounded-xl">
              <p className="text-gold-400 font-semibold text-sm mb-1">{kaalSarpType.name}</p>
              <p className="text-gray-200 text-sm">{kaalSarpType.description}</p>
            </div>
          )}
          <div>
            <p className="text-gold-400 font-semibold text-sm mb-2">About Kaal Sarp Dosha</p>
            <p className="text-gray-200 text-sm leading-relaxed">Kaal Sarp Dosha occurs when all seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are hemmed between the shadow planets Rahu and Ketu. The word "Kaal" means time (or death) and "Sarp" means serpent — the chart is said to be within the coils of the serpent of time. There are 12 types of Kaal Sarp Dosha, named after different serpents, corresponding to which house Rahu occupies. This configuration is associated with recurring obstacles, feelings of unfulfillment despite effort, karmic pressures from past lifetimes, and at times extraordinary focus and worldly achievement driven by the intense channeling of energy that the dosha creates. Many great leaders, artists, and spiritual figures have had Kaal Sarp Dosha in their charts.</p>
            <p className="text-gray-200 text-sm leading-relaxed mt-3">Traditional remedies include performing the Kaal Sarp Dosha puja at Trimbakeshwar (Nashik), Ujjain, or other significant Shiva temples. Reciting the Panchakshara mantra (Om Namah Shivaya) 108 times daily, offering milk to a Shivalinga, and performing Nag Puja on Nag Panchami are also recommended. Wearing a silver snake ring on the little finger after proper ritual consecration provides some protection.</p>
          </div>
        </div>
      </AccordionSection>

      {/* I. Mahadasha Phal */}
      <AccordionSection title="Current Mahadasha Phal — Life Period Reading" icon="🔮">
        {currentDasha ? (
          <div className="space-y-4">
            <div className="p-4 bg-gold-500/8 border border-gold-500/25 rounded-xl">
              <p className="text-gold-300 text-lg font-semibold">{currentDasha.planet} Mahadasha</p>
              <p className="text-gray-300 text-xs">{currentDasha.start} — {currentDasha.end} — {currentDasha.years} years</p>
              {currentAntar && (
                <p className="text-gray-200 text-xs mt-1">Current Antardasha: <span className="text-gold-400">{currentDasha.planet}/{currentAntar.planet}</span> ({currentAntar.start?.slice(0,7)} — {currentAntar.end?.slice(0,7)})</p>
              )}
            </div>
            {currentMahaInfo ? (
              <div className="space-y-4">
                {[
                  ['Career & Professional Life', currentMahaInfo.career],
                  ['Health & Well-being', currentMahaInfo.health],
                  ['Relationships & Family', currentMahaInfo.relationships],
                  ['Spirituality & Inner Growth', currentMahaInfo.spirituality],
                ].map(([label, text]) => (
                  <div key={label}>
                    <p className="text-gold-400 font-semibold text-sm mb-1">{label}</p>
                    <p className="text-gray-200 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-sm">Detailed interpretation for {currentDasha.planet} Mahadasha is being prepared.</p>
            )}
            {currentDasha.antardashas && currentDasha.antardashas.length > 0 && (
              <div>
                <p className="text-gold-400 font-semibold text-sm mb-3">Upcoming Antardasha Periods</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-300 uppercase border-b border-gold-600/15">
                        <th className="text-left pb-2 pr-3">Mahadasha/Antardasha</th>
                        <th className="text-left pb-2 pr-3">Start</th>
                        <th className="text-left pb-2 pr-3">End</th>
                        <th className="text-left pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDasha.antardashas.slice(0, 9).map(a => {
                        const aStart = new Date(a.start);
                        const aEnd = new Date(a.end);
                        const isCur = NOW >= aStart && NOW <= aEnd;
                        const isPast = aEnd < NOW;
                        return (
                          <tr key={a.planet} className={`border-b border-gold-600/5 ${isCur ? 'bg-gold-500/10' : ''}`}>
                            <td className={`py-1.5 pr-3 ${isCur ? 'text-gold-300 font-semibold' : isPast ? 'text-gray-400' : 'text-gray-200'}`}>{currentDasha.planet}/{a.planet}</td>
                            <td className="py-1.5 pr-3 text-gray-300">{a.start?.slice(0,10)}</td>
                            <td className="py-1.5 pr-3 text-gray-300">{a.end?.slice(0,10)}</td>
                            <td className="py-1.5">
                              {isCur ? <span className="text-gold-400 font-bold">★ Active</span>
                                : isPast ? <span className="text-gray-500">Past</span>
                                : <span className="text-blue-300">Upcoming</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-300 text-sm">Dasha data not available. Please generate your Kundali with a birth date to see Dasha periods.</p>
        )}
      </AccordionSection>

      {/* J. Ashtakavarga */}
      <AccordionSection title="Ashtakavarga (Bhinnashtakavarga + Sarvashtakavarga)" icon="📊">
        <p className="text-gray-300 text-xs mb-3">Benefic points each planet contributes to each sign. Score 5+ is strong (green), 4 is average, 3 or below is weak (red). Sarvashtakavarga total of 28+ in a sign is considered strong; 25 or below is weak.</p>
        {ashtak ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold-600/20">
                  <th className="text-left py-1.5 pr-3 text-gray-300 uppercase tracking-wider w-20 sticky left-0 bg-cosmic-950">Planet</th>
                  {SIGNS.map(s => (
                    <th key={s} className="text-center py-1.5 px-1 text-gray-300 font-normal min-w-[2.2rem]">
                      <span className="block text-[10px] uppercase">{s.slice(0,3)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ASHTAK_PLANETS.map((name, ri) => (
                  <tr key={name} className={`border-b border-gold-600/5 ${ri % 2 === 0 ? 'bg-cosmic-900/20' : ''}`}>
                    <td className="py-1.5 pr-3 sticky left-0 bg-inherit">
                      <span className={`${PLANET_COLORS[name]} mr-1`}>{PLANET_SYMBOLS[name]}</span>
                      <span className="text-gray-300">{name.slice(0,3)}</span>
                    </td>
                    {ashtak.bhinna[name].map((score, si) => (
                      <td key={si} className={`py-1.5 px-1 text-center font-semibold tabular-nums
                        ${score >= 5 ? 'text-emerald-400' : score <= 2 ? 'text-red-400' : score === 4 ? 'text-gold-400' : 'text-gray-300'}`}>
                        {score}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-gold-600/30 bg-gold-500/8">
                  <td className="py-2 pr-3 text-gold-400 font-bold sticky left-0 bg-cosmic-900/60">Sarva</td>
                  {ashtak.sarva.map((score, si) => (
                    <td key={si} className={`py-2 px-1 text-center font-bold tabular-nums
                      ${score >= 28 ? 'text-emerald-400' : score <= 25 ? 'text-red-400' : 'text-gold-300'}`}>
                      {score}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Ashtakavarga requires complete planetary position data.</p>
        )}
        {ashtak && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {SIGNS.map((sign, i) => {
              const total = ashtak.sarva[i];
              const strength = total >= 30 ? 'Excellent' : total >= 28 ? 'Strong' : total >= 25 ? 'Average' : 'Weak';
              const color = total >= 30 ? 'text-emerald-400' : total >= 28 ? 'text-gold-400' : total >= 25 ? 'text-gray-300' : 'text-red-400';
              return (
                <div key={sign} className="p-2 bg-cosmic-900/30 rounded-lg border border-gold-600/10 text-center">
                  <p className="text-gray-300 text-[10px] uppercase tracking-wider">{sign}</p>
                  <p className={`font-bold text-sm ${color}`}>{total}</p>
                  <p className={`text-[10px] ${color}`}>{strength}</p>
                </div>
              );
            })}
          </div>
        )}
      </AccordionSection>

      {/* K. Gochar Phal */}
      <AccordionSection title="Gochar Phal — Current Transit Effects" icon="🌍">
        <p className="text-gray-300 text-xs mb-4">Based on current planetary positions and your birth Moon sign ({moonSign}), as of {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        <div className="space-y-5">
          <div>
            <p className="text-gold-400 font-semibold text-sm mb-2">🪐 Saturn Transit Effect</p>
            <p className="text-gray-200 text-sm leading-relaxed">{saturnTransitInterpretation}</p>
            {saturnSign && <p className="text-gray-400 text-xs mt-1">Saturn is currently in <span className="text-gold-400">{saturnSign}</span>.</p>}
          </div>
          <div className="border-t border-gold-600/10 pt-4">
            <p className="text-gold-400 font-semibold text-sm mb-2">♃ Jupiter Transit Effect</p>
            <p className="text-gray-200 text-sm leading-relaxed">{jupiterTransitInterpretation}</p>
            {jupiterSign && <p className="text-gray-400 text-xs mt-1">Jupiter is currently in <span className="text-gold-400">{jupiterSign}</span>.</p>}
          </div>
          <div className="border-t border-gold-600/10 pt-4">
            <p className="text-gold-400 font-semibold text-sm mb-2">☊/☋ Rahu-Ketu Transit Effect</p>
            <p className="text-gray-200 text-sm leading-relaxed">
              Rahu is currently in <span className="text-gold-400">{pp['Rahu']?.sign || '—'}</span> and Ketu in <span className="text-gold-400">{pp['Ketu']?.sign || '—'}</span>. The Rahu-Ketu axis activates the houses they transit, creating areas of intense focus, ambition, and karmic reckoning. The Rahu-transited house brings worldly desire, ambition, and often confusion or obsession. The Ketu-transited house brings detachment, spiritual insight, and sometimes loss or release. Working consciously with both — pursuing Rahu's domain with Ketu's spiritual detachment — allows you to navigate this axis with wisdom. Rahu-Ketu transits shift approximately every 18 months, so their effects are significant but temporary.
            </p>
          </div>
        </div>
      </AccordionSection>
    </motion.div>
  );
}

// --- VISTRIT BHAVISHHYAPHAL ----------------------------------------------------

function VistritBhavishhyaphal({ lagna, moonSign, lagnaInfo }) {
  const SWABHAV = {
    Aries: 'Your character is marked by boldness, directness, and an unquenchable pioneering spirit. You think independently and act decisively. At your core, you are a warrior — not necessarily in the physical sense, but in the sense of someone who confronts challenges head-on rather than avoiding them. You have strong opinions and the courage to voice them, though learning the art of strategic patience will serve you well in navigating complex social situations.',
    Taurus: 'Your character is rooted in reliability, sensory richness, and a deep appreciation for the beautiful and the enduring. You build slowly, deliberately, and with great care — and what you build tends to last. Loyalty is your greatest character trait: you do not abandon those you love, and you expect the same in return. Your patient, methodical nature makes you an anchor for those around you.',
    Gemini: 'Your character is defined by curiosity, versatility, and a mind that is always in motion. You are naturally gifted at communication in all its forms — speaking, writing, listening, and connecting disparate ideas into original insights. You adapt to changing circumstances with remarkable ease. Your playful intelligence makes you enormously entertaining company, and your genuine interest in others\' perspectives makes you an excellent collaborator.',
    Cancer: 'Your character runs deep — you feel everything profoundly, remember everything emotionally, and protect those you love with fierce devotion. You are the great nurturer of the zodiac, always sensing what others need and moving intuitively to provide it. Your emotional intelligence is extraordinary; you read rooms, people, and situations with uncanny accuracy. The key to your character is that everything you do comes from the heart.',
    Leo: 'Your character shines with natural authority, generous warmth, and a genuine desire to uplift those around you. You are at your best when you are center stage — not from vanity, but because your natural radiance inspires others. You have a powerful sense of personal dignity and will not compromise your self-respect for anyone. Your loyalty to those you love is fierce and unwavering.',
    Virgo: 'Your character is defined by precision, service, and an exacting intelligence that misses nothing. You are the person others call when something needs to be done correctly — and done completely. Your mind is a finely calibrated instrument that analyzes, categorizes, and improves everything it encounters. At your best, you are a healer, a craftsperson, and a devoted friend whose practical care changes lives.',
    Libra: 'Your character is one of the most genuinely social in the zodiac. You are the great harmonizer — always sensing imbalance and working skillfully to restore equilibrium. Your sense of justice is finely developed, and you are genuinely troubled by unfairness in any form. You have a gift for seeing all sides of any situation, which makes you an exceptional mediator, diplomat, and advisor.',
    Scorpio: 'Your character runs deeper than almost anyone suspects. What you project externally is merely the surface — beneath is a profound, passionate, and incredibly powerful individual who rarely reveals their true depth to more than a trusted few. Your emotional intelligence is matched only by your strategic intelligence. You understand power, human motivation, and hidden dynamics in a way few signs do.',
    Sagittarius: 'Your character is defined by philosophical breadth, irrepressible optimism, and a love of freedom that is almost physical in its intensity. You believe in something larger than yourself — whether that is a philosophy, a cause, a spiritual tradition, or the simple miracle of life itself. Your enthusiasm for ideas, for travel, for exploring the unknown horizon is genuinely infectious.',
    Capricorn: 'Your character is defined by discipline, ambition, and the rare quality of truly long-term thinking. While others chase immediate gratification, you are building something designed to last generations. Your sense of responsibility runs deep — you take your obligations seriously and deliver on your commitments consistently. Beneath your composed exterior is a dry wit and deep warmth that emerge in the company of those you truly trust.',
    Aquarius: 'Your character is genuinely unique. You think in ways others have not thought, see possibilities others cannot see, and care about the welfare of people you have never met. Your humanitarian instincts are real rather than performative. You are the visionary, the innovator, the reformer — and you are completely comfortable being the one who sees things differently from the crowd.',
    Pisces: 'Your character is the most compassionate and spiritually permeable of all. You literally feel the joys and sorrows of those around you — your empathy is not conceptual but visceral. This makes you an extraordinary healer, artist, and companion, but requires strong energetic boundaries to prevent absorbing suffering that is not yours to carry. Your imagination and spiritual depth are your superpowers.',
  };

  const FORTUNE = {
    Aries: 'Fortune comes to you through bold initiative and the willingness to act when others hesitate. Your greatest financial opportunities arrive suddenly and require quick, decisive action. The first house and Mars connections to the 11th and 2nd houses determine your wealth trajectory. Real estate, entrepreneurship, and competitive industries are where your fortune-building potential shines.',
    Taurus: 'Venus blesses Taurus Lagna with natural magnetism toward wealth and abundance. Your fortune builds slowly, steadily, and enduringly — you are not a get-rich-quick person, but a build-lasting-wealth person. Agriculture, arts, luxury goods, banking, and beauty industries are natural wealth channels. You tend to accumulate comforts and resources throughout life with quiet but consistent progress.',
    Gemini: 'Fortune comes through your communication gifts, commercial intelligence, and the extraordinary breadth of your connections. You often earn through multiple streams simultaneously — the dual nature of Gemini means variety in income. Writing, media, trade, technology, and education are your natural wealth channels. Your ability to quickly identify and capitalize on new opportunities is your greatest financial asset.',
    Cancer: 'Fortune flows through emotional intelligence, caregiving, and the development of deep, loyal relationships. The Moon\'s connection to the 2nd and 11th houses determines your wealth cycle. Real estate, hospitality, food, mother-related businesses, and caregiving industries support your prosperity. Your intuitive business sense — trusting your gut in financial matters — often proves remarkably accurate.',
    Leo: 'Fortune comes through leadership, creative expression, and the genuine respect you command. The Sun\'s power in your chart supports government connections, creative industries, and entrepreneurial ventures. You attract wealth through your authority and magnetism rather than through routine. Gold, luxury items, and ventures tied to self-expression and creativity are your natural wealth domains.',
    Virgo: 'Fortune comes through service, precision, and the development of specialized expertise. You are at your financial best when you have mastered a skill or field to a degree that makes you truly indispensable. Healthcare, accounting, writing, editing, agriculture, and analytical fields are natural wealth generators. Your financial intelligence is exceptionally practical and oriented toward genuine value.',
    Libra: 'Fortune comes through partnership, aesthetic sensibility, and your extraordinary ability to create harmonious agreements between parties. The 2nd and 11th house positions of Venus and Saturn determine your wealth cycle. Law, arts, luxury industries, relationship counseling, fashion, and design are natural wealth channels. Joint ventures and business partnerships often produce significant prosperity.',
    Scorpio: 'Fortune comes through depth, transformation, and your penetrating understanding of hidden value. The 8th house connection means potential windfalls through inheritance, joint resources, investment, and research. You have a natural talent for identifying undervalued assets and transforming them. Research, investigation, medicine, psychology, and occult sciences are natural financial domains.',
    Sagittarius: 'Jupiter as Lagna lord blesses Sagittarius with genuine good fortune. Wealth tends to come through education, philosophy, international connections, and expansion into new territories. You have a natural luck about you that others notice — but this luck responds to the quality of your philosophical outlook. Faith, optimism, and genuine generosity tend to magnetize abundance back toward you.',
    Capricorn: 'Fortune comes through patient, disciplined effort and the building of genuine expertise and reputation over time. Saturn rewards consistent effort with lasting material security. Real estate, government, mining, agriculture, construction, and industries with long timelines are natural wealth channels. The later years of your life tend to be your most prosperous — Saturn\'s rewards are enduring.',
    Aquarius: 'Fortune comes through innovation, community connections, and your ability to recognize future trends before they materialize. Technology, humanitarian enterprises, group ventures, and unconventional industries support your prosperity. Your network is your greatest asset — the quality and breadth of your connections directly determines your financial flow.',
    Pisces: 'Fortune comes through creative vision, spiritual wisdom, and service that transcends the transactional. Jupiter blesses with genuine abundance, though Pisces Lagna natives often need to develop the practical earth-element habits of financial management. Arts, spirituality, foreign connections, healthcare, and creative industries are natural wealth channels. Charitable giving, counterintuitively, tends to increase rather than diminish financial flow.',
  };

  const LIFESTYLE = {
    Aries: 'You live at a fast pace — always moving, always initiating, always charging toward the next horizon. Your lifestyle is active, spontaneous, and oriented around freedom of movement and action. You thrive in environments that allow you to make quick decisions and see immediate results. Routine can feel stifling; you prefer to create structure through discipline rather than habit.',
    Taurus: 'You live with a deep appreciation for quality, comfort, and the pleasures of the senses. Your home is your sanctuary — beautifully appointed and sensually nourishing. You move through life at a deliberate pace, savoring each experience rather than rushing through it. Regular routines, good food, beauty in your environment, and physical comfort are non-negotiable aspects of your well-being.',
    Gemini: 'You live with remarkable variety, social richness, and a perpetual flow of information, conversation, and connection. Your lifestyle is mentally active and socially engaged. You prefer urban environments with abundant cultural stimulation and tend to have several ongoing projects at once. Restlessness is your companion — you are most yourself when you are learning, communicating, and connecting.',
    Cancer: 'You live with a deep orientation toward home, family, and emotional security. Your lifestyle is fundamentally private and domestic, even if your public role is significant. You invest heavily in creating nurturing, beautiful home environments that function as sanctuaries. Seasonal rhythms, family rituals, and the emotional quality of your relationships define the texture of your daily life.',
    Leo: 'You live with a natural flair for the dramatic, the generous, and the celebratory. Your lifestyle is warm, socially rich, and oriented toward creative expression. You love to entertain, to share the good things of life, and to create experiences that others remember. Quality over quantity defines your aesthetic — you prefer one genuinely beautiful thing over a dozen mediocre ones.',
    Virgo: 'You live with remarkable attention to detail, cleanliness, and the systematic organization of your environment and time. Your lifestyle is structured and disciplined, with specific daily routines that support your health and productivity. Service to others is woven into the fabric of your daily life — you feel most yourself when you are useful. Health practices, good nutrition, and a clean, orderly home are foundational.',
    Libra: 'You live with an orientation toward beauty, balance, and the quality of your relationships. Your lifestyle is social, aesthetically refined, and relational — you genuinely do not thrive in isolation. You surround yourself with beautiful things and create harmonious environments wherever you live. Partnership and shared decision-making are central to how you operate in the world.',
    Scorpio: 'You live with tremendous intensity and depth. Your lifestyle may appear controlled and composed from the outside, but internally your experience of life is profoundly passionate and emotionally charged. You are highly selective about who you allow close — your inner circle is small, trusted, and deeply chosen. Privacy is essential to your well-being.',
    Sagittarius: 'You live with a love of freedom, adventure, and the constant expansion of your horizons. Your lifestyle includes significant travel, study, philosophical exploration, and connection with people from diverse backgrounds and cultures. You are restless in confined circumstances and instinctively orient toward open spaces — literal and metaphorical.',
    Capricorn: 'You live with purpose, discipline, and a steady accumulation of achievement and responsibility. Your lifestyle is structured and goal-oriented, with a clear hierarchy of priorities. Social life tends to be quality over quantity — you prefer a small circle of genuinely significant relationships over a large network of superficial ones. Your home and professional environments reflect your high standards.',
    Aquarius: 'You live with remarkable individuality and social breadth. Your lifestyle defies conventional categories — you simultaneously value deep solitude and vibrant community. You are drawn to progressive environments, diverse friend circles, and communities oriented around shared ideals. Technology and modern systems support your lifestyle preferences.',
    Pisces: 'You live with a natural fluidity that crosses between the visible and invisible worlds. Your lifestyle is less structured than most — you need significant unscheduled time for creative flow, spiritual practice, and inner renewal. Beauty, music, and spiritual environments nourish you deeply. You are most yourself near water, in creative spaces, or in the company of deeply authentic individuals.',
  };

  const CAREER = {
    Aries: 'Professional life is characterized by leadership, initiative, and the drive to be first. You are built for pioneering roles where you can blaze trails rather than follow established paths. Entrepreneurship, military, sports, surgery, engineering, and management are natural professional domains. Your best career moments come when you have genuine authority and independence. Reporting to others indefinitely creates frustration — you need your own domain to manage.',
    Taurus: 'Professional life is characterized by steady building, aesthetic sensibility, and financial intelligence. You are excellent at managing resources — both financial and material — and creating lasting value. Banking, real estate, arts, agriculture, luxury goods, music, and management are natural professional domains. You are a highly dependable professional who rarely fails to deliver on commitments.',
    Gemini: 'Professional life is characterized by intellectual versatility, communication excellence, and the ability to connect diverse people, ideas, and markets. Writing, teaching, sales, media, technology, logistics, and consulting are natural professional domains. You often excel in roles that require managing multiple streams of information or clients simultaneously. Your networking skills are among your greatest professional assets.',
    Cancer: 'Professional life is characterized by emotional intelligence, intuitive leadership, and the ability to create nurturing environments that bring out the best in others. Healthcare, hospitality, food industry, real estate, counseling, and roles involving the care of others are natural professional domains. Your intuitive sense of what people need makes you exceptionally effective in client-facing and management roles.',
    Leo: 'Professional life is characterized by natural leadership, creative expression, and the ability to inspire. You function best in prominent roles with real authority and visibility. Management, creative industries, entertainment, politics, entrepreneurship, education, and public-facing professions suit you well. You attract attention and recognition professionally, often rising to leadership positions with apparent ease.',
    Virgo: 'Professional life is characterized by meticulous work, specialized expertise, and genuine service orientation. You are at your professional best when you have mastered a specific domain and are applying that mastery to genuinely help others. Healthcare, accounting, editing, writing, research, analysis, and technical fields are natural professional domains. Quality of work matters more to you than recognition.',
    Libra: 'Professional life is characterized by collaboration, diplomacy, aesthetic contribution, and the ability to navigate complex interpersonal dynamics with grace. Law, design, counseling, arts, diplomacy, human resources, and partnership-based businesses are natural professional domains. You excel in roles that require balancing multiple stakeholder interests while maintaining harmony.',
    Scorpio: 'Professional life is characterized by investigative depth, strategic intelligence, and the ability to work with hidden or sensitive information. Research, medicine, psychology, investigation, occult sciences, finance, and intelligence work are natural professional domains. You are exceptionally effective in roles involving transformation, crisis management, and the uncovering of hidden truths.',
    Sagittarius: 'Professional life is characterized by philosophical depth, enthusiasm for knowledge, and natural teaching ability. Education, law, publishing, philosophy, travel, international business, and spiritual guidance are natural professional domains. You are at your professional best when your work involves expanding horizons — your own and others\'. Your optimism and vision inspire those around you.',
    Capricorn: 'Professional life is characterized by ambition, discipline, and the systematic pursuit of significant achievement over long time horizons. Management, government, real estate, mining, agriculture, construction, administration, and any field requiring long-term strategic thinking suit you well. You are the natural executive and senior administrator — reliable, competent, and worthy of significant responsibility.',
    Aquarius: 'Professional life is characterized by innovation, community impact, and the pursuit of genuinely new solutions to old problems. Technology, social enterprise, humanitarian work, scientific research, aviation, and fields at the intersection of tradition and innovation are natural professional domains. You are at your best when working for something larger than personal gain.',
    Pisces: 'Professional life is characterized by creative vision, compassionate service, and the ability to bring spiritual sensitivity to whatever domain you enter. Arts, music, healthcare, spiritual work, filmmaking, photography, and social work are natural professional domains. You are at your professional best when your work has genuine meaning and when you have creative freedom to explore.',
  };

  const HEALTH = {
    Aries: 'Physically robust with strong recuperative powers, you nonetheless need to guard against impulsiveness that leads to accidents and injuries, particularly to the head and face. Fevers, headaches, and inflammatory conditions respond to your constitution. Regular vigorous exercise is genuinely essential for your well-being — without it, your Mars energy becomes restless and potentially destructive. A diet emphasizing cooling foods — cucumber, coconut, leafy greens — balances your naturally hot constitution. Learn to rest before you are exhausted, not after.',
    Taurus: 'Your constitution is generally sturdy and resistant, with good natural immunity and excellent recuperative capacity. The primary vulnerabilities are the throat and thyroid area, and a tendency toward weight gain through overindulgence in the foods and pleasures you love. Regular physical movement — nature walks, gentle yoga, swimming — keeps your naturally slightly sedentary tendencies healthy. A clean diet with ample fresh vegetables and limited sweet or heavy foods maintains your natural vitality.',
    Gemini: 'Your health is closely linked to your nervous system and mental state. Anxiety, nervous exhaustion, and respiratory conditions are your primary areas of vulnerability. The lungs, arms, and shoulders may need particular attention. Adequate sleep — often a challenge given your naturally busy mind — is genuinely medicinal for you. Mindfulness practices, consistent daily routine, and time in nature provide grounding for your mercurial constitution.',
    Cancer: 'Your health is deeply connected to your emotional state — stress, worry, and emotional upheaval directly manifest in the digestive system, immune function, and overall vitality. The stomach and chest are your primary physical vulnerabilities. Nourishing, regular meals, adequate emotional expression, and strong supportive relationships are your best medicine. Water-based therapies — swimming, baths, beach time — are deeply restorative.',
    Leo: 'Your constitution is generally vital and energetic, with natural stamina and recuperative power. The heart and spine are your primary areas of vulnerability — cardiovascular health deserves regular monitoring, and back health is supported by regular movement and good posture. Your emotional state directly impacts your physical health: find regular outlets for creative expression, and protect your sense of dignity, as wounded pride can manifest physically.',
    Virgo: 'Your constitution is sensitive and precise — you often sense imbalances in your body before they become clinically apparent. The digestive system is your primary vulnerability: food sensitivities, IBS-type conditions, and digestive irregularity are common. A clean, disciplined diet removes a significant proportion of your health concerns. Anxiety and hypochondria can create psychosomatic symptoms — genuine mindfulness practice helps distinguish real from imagined health concerns.',
    Libra: 'Your constitution is naturally oriented toward balance, and when your life is genuinely balanced — work and rest, social engagement and solitude, giving and receiving — your health flourishes. The kidneys and lower back are primary vulnerability areas: adequate hydration and core-strengthening exercise support kidney function. Relationship stress and unresolved conflict manifest physically with particular speed for Libra Lagna natives.',
    Scorpio: 'Your constitution is intense and possesses remarkable self-healing capacity, particularly when you engage in regular emotional processing and detoxification. The reproductive system, excretory organs, and areas of transformation (surgery recovery, disease reversal) are highlighted. Deep psychological work — therapy, shadow work, honest self-inquiry — directly supports physical health. Avoid emotional suppression, as it is your primary health risk.',
    Sagittarius: 'Your constitution is generally robust, energetic, and self-healing. The hips, thighs, and liver are primary vulnerability areas — excessive indulgence in rich foods, alcohol, or physical overexertion can tax these areas. Regular outdoor exercise — hiking, riding, team sports — channels your naturally high energy constructively. A genuinely optimistic worldview is your most powerful immune-system support.',
    Capricorn: 'Your constitution is lean, durable, and built for the long haul. The knees, bones, joints, teeth, and skin are primary vulnerability areas — these deserve regular, disciplined maintenance rather than crisis management. Cold conditions can aggravate your Saturn constitution: warmth, oil massage (abhyanga), and foods with warming qualities support well-being. Overwork is your primary health risk — Saturn rewards those who include disciplined rest in their regimen.',
    Aquarius: 'Your constitution is somewhat irregular — you may be in excellent health for long periods and then experience sudden or unusual health events. The ankles, calves, circulatory system, and nervous system are primary vulnerability areas. Consistent daily routine — which may run against your naturally restless nature — creates the stability your constitution requires. Social engagement and purposeful work are genuinely health-protective for Aquarius Lagna natives.',
    Pisces: 'Your constitution is sensitive and fluid — you absorb environmental and emotional energies easily. The feet, lymphatic system, and immune function are primary vulnerability areas. Strong energetic boundaries — both in terms of what environments you frequent and which relationships you allow close — directly protect your physical health. Clean water intake, avoiding environmental toxins, and regular spiritual practice are your best preventive medicine.',
  };

  const BUSINESS = {
    Aries: 'Entrepreneurial potential is high — you are a natural founder with the courage to start, the energy to build, and the drive to compete. Your businesses succeed through boldness, speed to market, and your willingness to take calculated risks that more cautious competitors avoid. You thrive as the primary decision-maker rather than as part of a committee. Short to medium-term ventures suit you better than extremely long-horizon enterprises.',
    Taurus: 'Business potential is steady and substantial. You build ventures with the same patience and thoroughness you apply to everything — slowly but with exceptional solidity. Beauty, luxury, agriculture, real estate, and food-related businesses align naturally with your sensibilities. You have an excellent instinct for quality and value, and your businesses tend to develop loyal customer bases through the consistent delivery of genuine worth.',
    Gemini: 'Business potential is diverse and commercially savvy. You naturally generate multiple revenue streams and have an exceptional instinct for identifying new markets and opportunities. Communication-based businesses — media, consulting, education, technology — align naturally with your gifts. Your network is your greatest business asset. Partnership ventures succeed particularly well when you choose partners who provide the groundedness and follow-through that complements your ideas.',
    Cancer: 'Business potential lies in emotional intelligence and intuitive understanding of what people need and want — even before they can articulate it. Food, hospitality, childcare, real estate, and businesses serving families or communities align naturally with your gifts. Your business decisions are often intuitive rather than purely analytical, and your intuition tends to be remarkably reliable.',
    Leo: 'Business potential is naturally suited to ownership, leadership, and brand-building. You have exceptional instincts for positioning, presentation, and creating enterprises that command respect and loyalty. Creative industries, entertainment, luxury, and education are natural business domains. Your ability to attract talented people and inspire them is your greatest business asset. The Leo entrepreneur builds an empire rather than a small business.',
    Virgo: 'Business potential lies in specialized expertise and the ability to provide meticulous, high-quality service that genuinely solves problems. Healthcare consulting, precision manufacturing, accounting, editing, and technical service businesses align naturally with your gifts. You are most comfortable building a reputation for excellence in a specific niche rather than pursuing broad diversification.',
    Libra: 'Business potential is strongest in partnership-based ventures, aesthetic industries, and businesses that require exceptional interpersonal skill. Law firms, design studios, marriage and relationship services, luxury retail, and consulting businesses align naturally with your gifts. Your business partnerships tend to be productive when you choose partners who complement your strengths and share your commitment to quality.',
    Scorpio: 'Business potential lies in research, transformation, and the willingness to work in areas others find difficult or uncomfortable. Investment, finance, research-based businesses, medical practices, investigative services, and transformation-oriented businesses align naturally with your gifts. You have an exceptional instinct for identifying undervalued opportunities and turning them into significant assets.',
    Sagittarius: 'Business potential is strong in education, publishing, international trade, philosophy, spiritual products and services, and any enterprise with an expansive, growth-oriented vision. Your optimism and philosophical breadth create businesses with genuine cultural impact. Joint ventures with international or cross-cultural dimensions particularly suit your expansive nature.',
    Capricorn: 'Business potential is genuinely excellent for long-term, institution-building enterprises. You create businesses designed to outlast you — with systems, governance, and quality standards that operate independently of any single individual. Real estate, manufacturing, government contracting, agriculture, and financial services align naturally with your disciplined, long-horizon business approach.',
    Aquarius: 'Business potential is strongest in innovative, technology-driven, or socially-oriented enterprises that fill gaps others have not yet recognized. Social enterprises, technology businesses, community-based ventures, and industries at the intersection of innovation and human welfare align naturally with your visionary nature. You are most effective when your business genuinely serves a community or causes you believe in.',
    Pisces: 'Business potential is strongest when your enterprise has genuine meaning and allows for creative flow and spiritual contribution. Arts businesses, healing practices, creative agencies, spiritual retreat centers, and enterprises serving the most vulnerable in society align naturally with your gifts. Financial management requires either learning discipline or hiring excellent support — your creative and spiritual strengths are best expressed when practical details are handled by those suited to them.',
  };

  const getText = (obj, sign) => obj[sign] || `${sign} interpretation is being prepared for this section.`;

  return (
    <div className="space-y-5">
      {[
        ['Swabhav — Character & Personality', getText(SWABHAV, lagna)],
        ['Saubhagya — Fortune & Prosperity', getText(FORTUNE, lagna)],
        ['Jeevan Shaili — Lifestyle', getText(LIFESTYLE, moonSign || lagna)],
        ['Rojgar — Career & Professional Life', getText(CAREER, lagna)],
        ['Vyavsay — Business Potential', getText(BUSINESS, lagna)],
        ['Swasthya — Health Tendencies', getText(HEALTH, lagna)],
      ].map(([label, text]) => (
        <div key={label} className="border-b border-gold-600/10 pb-4 last:border-0">
          <p className="text-gold-400 font-semibold text-sm mb-2">{label}</p>
          <p className="text-gray-200 text-sm leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  );
}

// --- MAIN PAGE ----------------------------------------------------------------

export default function KundaliPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingKundali, setExistingKundali] = useState(null);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ name:'', gender:'', dob:'', birth_time:'', birth_place:'', lat:null, lng:null, timezone:null });

  useEffect(() => {
    if (user) kundaliApi.getMyKundali().then(r => setExistingKundali(r.data)).catch(()=>{});
  }, [user]);

  function useMyLocation() {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude:lat, longitude:lng } = pos.coords;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const d = await r.json();
        const city = d.address?.city || d.address?.town || d.address?.village || 'My Location';
        setGeoSearch(city);
        setForm(f=>({...f,birth_place:city,lat,lng,timezone:5.5}));
        toast.success('Location detected!');
      } catch {
        setForm(f=>({...f,lat,lng,timezone:5.5,birth_place:'Current Location'}));
        setGeoSearch('Current Location');
        toast.success('Location detected!');
      }
    }, ()=>toast.error('Could not get location'));
  }

  async function handleGenerate() {
    if (!form.dob) return toast.error('Date of birth is required');
    if (!user) return toast.error('Please login to generate your Kundali');
    setLoading(true);
    try {
      const r = await kundaliApi.generate({
        name:form.name, dob:form.dob, birth_time:form.birth_time||'12:00',
        birth_place:form.birth_place, lat:form.lat, lng:form.lng, timezone:form.timezone
      });
      setResult({ kundali:r.data.kundali, chart:r.data.chart, birthInfo:r.data.birth_info });
      setStep(4);
      toast.success('Your Kundali has been generated! ✦');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate Kundali');
    } finally { setLoading(false); }
  }

  // Show result if generated or if existing kundali loaded
  if (step === 4 && result) {
    return (
      <KundaliResult
        kundali={result.kundali}
        chart={result.chart}
        birthInfo={result.birthInfo}
        userName={form.name || result.kundali?.person_name || user?.name || 'Your'}
      />
    );
  }

  // Offer to view existing kundali
  if (existingKundali && step === 1) {
    // Still allow regenerating
  }

  const canStep1 = form.name && form.dob;
  const canStep2 = form.birth_place || (form.lat && form.lng);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-xl mx-auto px-4 pt-32 pb-24">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-8">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Free Vedic Birth Chart</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400">Generate Your Kundali</h1>
          <p className="text-gray-200 mt-2 text-sm">Swiss Ephemeris — Lahiri Ayanamsha — True Nodes — No AI</p>
        </motion.div>

        {existingKundali && step === 1 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-6 p-4 rounded-xl bg-gold-500/10 border border-gold-600/30 text-sm text-center">
            <p className="text-gold-400 font-medium mb-2">You have a saved Kundali ({existingKundali.dob})</p>
            <button
              onClick={()=>{ setResult({kundali:existingKundali,chart:existingKundali,birthInfo:{dob:existingKundali.dob,birth_time:existingKundali.birth_time,birth_place:existingKundali.birth_place,lat:existingKundali.birth_lat,lng:existingKundali.birth_lng,timezone:existingKundali.birth_timezone}}); setStep(4); }}
              className="btn-gold px-6 py-2 text-sm">
              View Saved Kundali →
            </button>
            <p className="text-gray-300 text-xs mt-2">Or fill the form below to generate a new one</p>
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3].map(s=>(
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step===s?'bg-gold-400 text-cosmic-950':step>s?'bg-gold-600/40 text-gold-400':'bg-cosmic-800 text-gray-300'}`}>{s}</div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="card-cosmic p-8 space-y-5">
              <h2 className="font-serif text-gold-400 text-xl">Personal Details</h2>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Your Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Enter your full name"
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Date of Birth *</label>
                <div className="flex items-center bg-cosmic-900 border border-gold-600/20 rounded-xl focus-within:border-gold-500 transition-colors">
                  <span className="pl-4 pr-3 text-gray-300"><Calendar className="w-5 h-5" /></span>
                  <input type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} max={new Date().toISOString().split('T')[0]}
                    className="flex-1 bg-transparent py-3 pr-4 text-gray-200 focus:outline-none text-sm [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">
                  Time of Birth <span className="text-gold-600 text-xs">(essential for Lagna accuracy)</span>
                </label>
                <TimePicker value={form.birth_time} onChange={val=>setForm(f=>({...f,birth_time:val}))} />
              </div>
              <div>
                <label className="text-gray-200 text-sm block mb-1.5">Gender</label>
                <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}
                  className="w-full bg-cosmic-900 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-sm">
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Non-binary</option>
                </select>
              </div>
              <button onClick={()=>canStep1?setStep(2):toast.error('Please fill name and date of birth')}
                className="btn-gold w-full py-3 flex items-center justify-center gap-2">
                Next: Birth Location <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="card-cosmic p-8 space-y-5">
              <h2 className="font-serif text-gold-400 text-xl">Birth Location</h2>
              <BirthPlacePicker
                label="Birth City / Place"
                value={form.birth_place}
                onChange={p => setForm(f=>({...f, birth_place:p.place, lat:p.lat, lng:p.lng, timezone:p.timezone}))}
              />
              <button onClick={useMyLocation} className="btn-outline-gold w-full py-2.5 text-sm flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4"/> Use My Current Location
              </button>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="btn-outline-gold flex-1 py-3 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4"/> Back</button>
                <button onClick={()=>canStep2?setStep(3):toast.error('Please enter birth place')} className="btn-gold flex-1 py-3 flex items-center justify-center gap-2">Next <ChevronRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="card-cosmic p-8 space-y-5">
              <h2 className="font-serif text-gold-400 text-xl">Confirm & Generate</h2>
              <div className="bg-cosmic-900/60 rounded-xl p-5 space-y-3 text-sm">
                {[['Name',form.name||'—'],['Date of Birth',form.dob],['Time of Birth',form.birth_time||'12:00 (approximate)'],['Birth Place',form.birth_place||'Coordinates only'],['Coordinates',form.lat?`${form.lat.toFixed(4)}° N, ${form.lng?.toFixed(4)}° E`:'—'],['Timezone',form.timezone!==null?`UTC+${form.timezone}`:'Auto-detected']].map(([k,v])=>(
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-300">{k}</span>
                    <span className="text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-cosmic-900/40 rounded-xl p-4 text-xs text-gray-300 space-y-1">
                <p>◆ Lahiri Ayanamsha (Chitrapaksha)</p>
                <p>◆ True Rahu/Ketu (not Mean Nodes)</p>
                <p>◆ Navamsha (D-9), Hora, Drekkana, Dashamsha</p>
                <p>◆ Panchang: Tithi, Karana, Yoga, Vaar</p>
                <p>◆ Upgrahas: Dhuma, Mandi, Gulika & more</p>
                <p>◆ Vimshottari Dasha with balance at birth</p>
              </div>
              {!user && (
                <div className="bg-gold-600/10 border border-gold-600/30 rounded-xl p-4 text-sm">
                  <p className="text-gold-400 font-medium mb-1">Login required to save your Kundali</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>navigate('/login')} className="btn-outline-gold flex-1 py-2 text-xs">Login</button>
                    <button onClick={()=>navigate('/register')} className="btn-gold flex-1 py-2 text-xs">Sign Up Free</button>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-outline-gold flex-1 py-3 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4"/> Back</button>
                <button onClick={handleGenerate} disabled={loading||!user}
                  className="btn-gold flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><Loader className="w-4 h-4 animate-spin"/> Calculating...</> : <>Generate Kundali →</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
