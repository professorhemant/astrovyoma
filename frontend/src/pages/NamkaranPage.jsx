import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollDatePicker from '../components/ScrollDatePicker';
import { Clock, Calendar, Loader, Baby, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { namkaran as namkaranApi, reportHistory as historyApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BirthPlacePicker from '../components/BirthPlacePicker';

// 27 Nakshatras × 4 Padas = 108 Namkaran sounds
const NAK_TABLE = [
  { name:'Ashwini',          nameHi:'अश्विनी',         lord:'Ketu',    pada:[{en:'Chu',hi:'चू'},{en:'Che',hi:'चे'},{en:'Cho',hi:'चो'},{en:'La',hi:'ला'}] },
  { name:'Bharani',          nameHi:'भरणी',            lord:'Venus',   pada:[{en:'Li',hi:'ली'},{en:'Lu',hi:'लू'},{en:'Le',hi:'ले'},{en:'Lo',hi:'लो'}] },
  { name:'Krittika',         nameHi:'कृत्तिका',         lord:'Sun',     pada:[{en:'A',hi:'अ'},{en:'I',hi:'इ'},{en:'U',hi:'उ'},{en:'E',hi:'ए'}] },
  { name:'Rohini',           nameHi:'रोहिणी',           lord:'Moon',    pada:[{en:'O',hi:'ओ'},{en:'Va',hi:'वा'},{en:'Vi',hi:'वि'},{en:'Vu',hi:'वु'}] },
  { name:'Mrigashira',       nameHi:'मृगशिरा',          lord:'Mars',    pada:[{en:'Ve',hi:'वे'},{en:'Vo',hi:'वो'},{en:'Ka',hi:'का'},{en:'Ki',hi:'कि'}] },
  { name:'Ardra',            nameHi:'आर्द्रा',           lord:'Rahu',    pada:[{en:'Ku',hi:'कु'},{en:'Gha',hi:'घ'},{en:'Ing',hi:'ञ'},{en:'Cha',hi:'छ'}] },
  { name:'Punarvasu',        nameHi:'पुनर्वसु',          lord:'Jupiter', pada:[{en:'Ke',hi:'के'},{en:'Ko',hi:'को'},{en:'Ha',hi:'हा'},{en:'Hi',hi:'हि'}] },
  { name:'Pushya',           nameHi:'पुष्य',            lord:'Saturn',  pada:[{en:'Hu',hi:'हु'},{en:'He',hi:'हे'},{en:'Ho',hi:'हो'},{en:'Da',hi:'ड'}] },
  { name:'Ashlesha',         nameHi:'आश्लेषा',          lord:'Mercury', pada:[{en:'Di',hi:'डि'},{en:'Du',hi:'डु'},{en:'De',hi:'डे'},{en:'Do',hi:'डो'}] },
  { name:'Magha',            nameHi:'मघा',              lord:'Ketu',    pada:[{en:'Ma',hi:'मा'},{en:'Mi',hi:'मि'},{en:'Mu',hi:'मु'},{en:'Me',hi:'मे'}] },
  { name:'PurvaPhalguni',    nameHi:'पूर्वाफाल्गुनी',   lord:'Venus',   pada:[{en:'Mo',hi:'मो'},{en:'Ta',hi:'ट'},{en:'Ti',hi:'टि'},{en:'Tu',hi:'टु'}] },
  { name:'UttaraPhalguni',   nameHi:'उत्तराफाल्गुनी',   lord:'Sun',     pada:[{en:'Te',hi:'टे'},{en:'To',hi:'टो'},{en:'Pa',hi:'पा'},{en:'Pi',hi:'पि'}] },
  { name:'Hasta',            nameHi:'हस्त',             lord:'Moon',    pada:[{en:'Pu',hi:'पु'},{en:'Sha',hi:'ष'},{en:'Na',hi:'ण'},{en:'Tha',hi:'ठ'}] },
  { name:'Chitra',           nameHi:'चित्रा',            lord:'Mars',    pada:[{en:'Pe',hi:'पे'},{en:'Po',hi:'पो'},{en:'Ra',hi:'र'},{en:'Ri',hi:'रि'}] },
  { name:'Swati',            nameHi:'स्वाति',            lord:'Rahu',    pada:[{en:'Ru',hi:'रु'},{en:'Re',hi:'रे'},{en:'Ro',hi:'रो'},{en:'Ta',hi:'त'}] },
  { name:'Vishakha',         nameHi:'विशाखा',            lord:'Jupiter', pada:[{en:'Ti',hi:'ति'},{en:'Tu',hi:'तु'},{en:'Te',hi:'ते'},{en:'To',hi:'तो'}] },
  { name:'Anuradha',         nameHi:'अनुराधा',           lord:'Saturn',  pada:[{en:'Na',hi:'न'},{en:'Ni',hi:'नि'},{en:'Nu',hi:'नु'},{en:'Ne',hi:'ने'}] },
  { name:'Jyeshtha',         nameHi:'ज्येष्ठा',           lord:'Mercury', pada:[{en:'No',hi:'नो'},{en:'Ya',hi:'य'},{en:'Yi',hi:'यि'},{en:'Yu',hi:'यु'}] },
  { name:'Mula',             nameHi:'मूल',              lord:'Ketu',    pada:[{en:'Ye',hi:'ये'},{en:'Yo',hi:'यो'},{en:'Bha',hi:'भ'},{en:'Bhi',hi:'भि'}] },
  { name:'PurvaAshadha',     nameHi:'पूर्वाषाढ़ा',        lord:'Venus',   pada:[{en:'Bhu',hi:'भु'},{en:'Dha',hi:'ध'},{en:'Pha',hi:'फ'},{en:'Dha',hi:'ढ'}] },
  { name:'UttaraAshadha',    nameHi:'उत्तराषाढ़ा',        lord:'Sun',     pada:[{en:'Bhe',hi:'भे'},{en:'Bho',hi:'भो'},{en:'Ja',hi:'ज'},{en:'Ji',hi:'जि'}] },
  { name:'Shravana',         nameHi:'श्रवण',             lord:'Moon',    pada:[{en:'Ju',hi:'जु'},{en:'Je',hi:'जे'},{en:'Jo',hi:'जो'},{en:'Gha',hi:'घा'}] },
  { name:'Dhanishtha',       nameHi:'धनिष्ठा',           lord:'Mars',    pada:[{en:'Ga',hi:'ग'},{en:'Gi',hi:'गि'},{en:'Gu',hi:'गु'},{en:'Ge',hi:'गे'}] },
  { name:'Shatabhisha',      nameHi:'शतभिषा',            lord:'Rahu',    pada:[{en:'Go',hi:'गो'},{en:'Sa',hi:'स'},{en:'Si',hi:'सि'},{en:'Su',hi:'सु'}] },
  { name:'PurvaBhadrapada',  nameHi:'पूर्वाभाद्रपद',     lord:'Jupiter', pada:[{en:'Se',hi:'से'},{en:'So',hi:'सो'},{en:'Da',hi:'द'},{en:'Di',hi:'दि'}] },
  { name:'UttaraBhadrapada', nameHi:'उत्तराभाद्रपद',     lord:'Saturn',  pada:[{en:'Du',hi:'दु'},{en:'Tha',hi:'थ'},{en:'Jha',hi:'झ'},{en:'Da',hi:'ञ'}] },
  { name:'Revati',           nameHi:'रेवती',             lord:'Mercury', pada:[{en:'De',hi:'दे'},{en:'Do',hi:'दो'},{en:'Cha',hi:'च'},{en:'Chi',hi:'चि'}] },
];

const ORDINAL = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

export default function NamkaranPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ baby_name: '', dob: '', birth_time: '', birth_place: '', lat: null, lng: null, timezone: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.dob) return toast.error('Please enter the date of birth');
    if (!form.birth_place) return toast.error('Please enter the birth place');

    if (!user) { toast.error('Please login to use Namkaran calculator'); navigate('/login'); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await namkaranApi.calculate({
        baby_name:   form.baby_name,
        dob:         form.dob,
        birth_time:  form.birth_time || null,
        birth_place: form.birth_place,
        lat:         form.lat,
        lng:         form.lng,
        timezone:    form.timezone,
      });
      setResult(res.data);
      setSaved(false);
      setTimeout(() => document.getElementById('namkaran-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to calculate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nm = result?.namkaran;
  const [saving, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-24">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3">Vedic Naming Ceremony</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 40px rgba(201,168,76,0.4)' }}>
            नामकरण संस्कार
          </h1>
          <p className="text-gray-300 text-lg mb-2">Namkaran Sanskar — Find the Sacred Name Letter</p>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Enter the baby's date, time, and place of birth. The Moon's nakshatra at birth determines
            the auspicious starting letter of the name — as per Vedic Jyotisha tradition.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-cosmic p-8 mb-8 border border-gold-600/20">
          <h2 className="font-serif text-gold-400 text-xl mb-6 flex items-center gap-2">
            <Baby className="w-5 h-5" /> शिशु का जन्म विवरण — Baby's Birth Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Baby Name (optional) */}
            <div>
              <label className="block text-gray-300 text-sm mb-1.5">Baby's Name <span className="text-gray-500 text-xs">(optional — for display)</span></label>
              <input
                type="text"
                placeholder="e.g. Aarav, Diya, or leave blank"
                value={form.baby_name}
                onChange={e => setForm(f => ({ ...f, baby_name: e.target.value }))}
                className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Date of Birth */}
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" /> Date of Birth <span className="text-red-400">*</span>
                </label>
                <ScrollDatePicker value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} />
              </div>

              {/* Time of Birth */}
              <div>
                <label className="block text-gray-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-500" /> Time of Birth
                  <span className="text-gray-500 text-xs ml-1">(recommended for accuracy)</span>
                </label>
                <input
                  type="time"
                  value={form.birth_time}
                  onChange={e => setForm(f => ({ ...f, birth_time: e.target.value }))}
                  className="w-full bg-cosmic-900/80 border border-gold-600/20 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500/50 transition-all"
                />
              </div>
            </div>

            {/* Birth Place */}
            <BirthPlacePicker
              label="Birth Place"
              required
              placeholder="Type city, hospital, or town..."
              value={form.birth_place || ''}
              onChange={p => setForm(f => ({ ...f, birth_place: p.place, lat: p.lat, lng: p.lng, timezone: p.timezone }))}
            />

            <p className="text-gray-400 text-xs bg-cosmic-900/50 rounded-xl p-3 border border-gold-600/10">
              <span className="text-gold-400 font-medium">Note:</span> If exact birth time is unknown, the Moon nakshatra calculated from midnight will be used.
              For best accuracy, provide the exact time of birth.
            </p>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gold-500 text-cosmic-950 font-bold text-lg rounded-xl hover:bg-gold-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 24px rgba(201,168,76,0.3)' }}>
              {loading ? <><Loader className="w-5 h-5 animate-spin" /> Calculating Nakshatra...</> : '✦ Find Namkaran Letter — नामाक्षर खोजें'}
            </button>
          </form>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && nm && (
            <motion.div id="namkaran-result"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6">

              {/* Hero Result Card */}
              <div className="card-cosmic border border-gold-500/50 overflow-hidden relative"
                style={{ boxShadow: '0 0 48px rgba(201,168,76,0.15)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-gold-600/8 via-transparent to-purple-600/8 pointer-events-none" />

                {/* Baby name + birth info */}
                <div className="px-8 pt-8 text-center">
                  {result.baby_name && (
                    <p className="text-gold-300 font-serif text-2xl mb-1">{result.baby_name}</p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {result.dob}{result.birth_time ? ` at ${result.birth_time}` : ''}{result.birth_place ? ` • ${result.birth_place.split(',')[0]}` : ''}
                  </p>
                  <div className="mt-3 mb-6 h-px bg-gradient-to-r from-transparent via-gold-600/40 to-transparent" />
                </div>

                {/* The two letters */}
                <div className="flex items-center justify-center gap-8 md:gap-16 pb-8 px-8">
                  {/* English */}
                  <div className="flex flex-col items-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">English</p>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gold-500/10 border-2 border-gold-500/60 flex items-center justify-center"
                      style={{ boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
                      <span className="text-gold-300 font-serif" style={{ fontSize: '4rem', lineHeight: 1 }}>{nm.letter.en}</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-3 italic">"{nm.letter.sound}"</p>
                  </div>

                  {/* Divider */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold-600/40 to-transparent" />
                    <div className="w-2 h-2 rounded-full bg-gold-600/40" />
                    <div className="w-px h-16 bg-gradient-to-b from-gold-600/40 via-transparent to-transparent" />
                  </div>

                  {/* Hindi */}
                  <div className="flex flex-col items-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">हिंदी</p>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-purple-500/10 border-2 border-purple-400/50 flex items-center justify-center"
                      style={{ boxShadow: '0 0 40px rgba(139,92,246,0.25)', fontFamily: 'Nirmala UI, Mangal, Arial Unicode MS, sans-serif' }}>
                      <span className="text-purple-200" style={{ fontSize: '4rem', lineHeight: 1 }}>{nm.letter.hi}</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-3">देवनागरी लिपि</p>
                  </div>
                </div>

                {/* Nakshatra badge */}
                <div className="flex flex-col items-center gap-4 pb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gold-500/10 border border-gold-500/30">
                    <span className="text-gold-400 font-medium">{nm.nakshatraHi}</span>
                    <span className="text-gold-600">·</span>
                    <span className="text-gray-300 text-sm">{nm.nakshatra} Nakshatra</span>
                    <span className="text-gold-600">·</span>
                    <span className="text-gold-400 font-medium">{ORDINAL(nm.pada)} Pada</span>
                    <span className="text-gold-600">·</span>
                    <span className="text-gray-300 text-sm">Lord: {nm.lord} ({nm.lordHi})</span>
                  </div>
                  {user && (
                    <button onClick={async () => {
                      if (saved) return;
                      setSaving(true);
                      try {
                        const babyLabel = result.baby_name || 'Baby';
                        await historyApi.save({
                          type: 'namkaran',
                          title: `${babyLabel} — ${nm.nakshatra} Nakshatra Namkaran`,
                          meta: { dob: form.dob, birth_place: form.birth_place, nakshatra: nm.nakshatra, pada: nm.pada, letter_en: nm.letter?.en, letter_hi: nm.letter?.hi, lord: nm.lord },
                        });
                        setSaved(true);
                        toast.success('Namkaran saved to History!');
                      } catch { toast.error('Could not save to history'); }
                      finally { setSaving(false); }
                    }} disabled={saving || saved}
                      className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'} disabled:opacity-60`}>
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-400' : ''}`} />
                      {saved ? 'Saved to History' : saving ? 'Saving…' : 'Save to History'}
                    </button>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nakshatra info */}
                <div className="card-cosmic p-6">
                  <h3 className="font-serif text-gold-400 text-lg mb-4">जन्म नक्षत्र विवरण</h3>
                  <div className="space-y-2.5">
                    {[
                      ['Nakshatra (नक्षत्र)', `${nm.nakshatra} — ${nm.nakshatraHi}`],
                      ['Pada (चरण)', `${ORDINAL(nm.pada)} of 4`],
                      ['Nakshatra Lord (स्वामी)', `${nm.lord} — ${nm.lordHi}`],
                      ['Presiding Deity (देवता)', `${nm.deity} — ${nm.deityHi}`],
                      ['Element (तत्व)', `${nm.element} — ${nm.elementHi}`],
                      ['Gana (गण)', `${nm.gana} — ${nm.ganaHi}`],
                      ['Symbol (प्रतीक)', nm.symbol],
                      ['Moon Sign (चन्द्र राशि)', result.moon_sign || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center py-1.5 border-b border-gold-600/10">
                        <span className="text-gray-400 text-xs">{label}</span>
                        <span className="text-gray-200 text-xs font-medium text-right ml-4">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All 4 padas */}
                <div className="card-cosmic p-6">
                  <h3 className="font-serif text-gold-400 text-lg mb-1">चारों चरण — All 4 Padas</h3>
                  <p className="text-gray-400 text-xs mb-4">Name can start with any letter from the correct pada</p>
                  <div className="space-y-3">
                    {nm.allPadas.map((pd, i) => {
                      const isActive = (i + 1) === nm.pada;
                      return (
                        <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${isActive ? 'bg-gold-500/15 border border-gold-500/50' : 'bg-cosmic-900/40 border border-gold-600/10'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isActive ? 'bg-gold-500 text-cosmic-950' : 'bg-cosmic-800 text-gray-400'}`}>
                            {i + 1}
                          </div>
                          <span className={`font-serif text-3xl w-12 ${isActive ? 'text-gold-300' : 'text-gray-400'}`}>{pd.en}</span>
                          <span className={`text-3xl w-12 ${isActive ? 'text-purple-300' : 'text-gray-500'}`}
                            style={{ fontFamily: 'Nirmala UI, Mangal, Arial Unicode MS, sans-serif' }}>{pd.hi}</span>
                          <span className={`text-xs flex-1 italic ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>{pd.sound}</span>
                          {isActive && (
                            <span className="text-gold-400 text-xs font-bold px-2.5 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 whitespace-nowrap">
                              ✓ Namkaran
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Muhurta + Tradition box */}
              <div className="card-cosmic p-6 border border-gold-600/20">
                <h3 className="font-serif text-gold-400 text-lg mb-4">नामकरण संस्कार — Ceremony Guidance</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-cosmic-900/50 rounded-xl p-4">
                    <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">Vedic System</p>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      The zodiac has <span className="text-gold-400">27 Nakshatras</span>, each split into <span className="text-gold-400">4 Padas</span>
                      = 108 sacred sounds. The Moon's exact position at birth determines the child's Janma Nakshatra and Pada,
                      which gives the <span className="text-gold-400">Naamaakshara</span> — the starting syllable of the name.
                    </p>
                  </div>
                  <div className="bg-cosmic-900/50 rounded-xl p-4">
                    <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">Auspicious Timing</p>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      Traditionally on the <span className="text-gold-400">10th or 11th day</span> after birth, or the <span className="text-gold-400">101st day</span>.
                      Choose <span className="text-gold-400">Monday, Wednesday, Thursday or Friday</span>.
                      Shukla Paksha Tithis (2nd–12th) are preferred.
                      <span className="text-gold-400"> Pushya Nakshatra</span> days are especially auspicious.
                    </p>
                  </div>
                  <div className="bg-cosmic-900/50 rounded-xl p-4">
                    <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">What to Avoid</p>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      Avoid the child's <span className="text-gold-400">Janma Tithi</span> (birth lunar day),
                      <span className="text-gold-400"> Janma Nakshatra</span> (<span className="text-gold-400">{nm.nakshatra}</span>),
                      and <span className="text-gold-400">Janma Vara</span> (birth weekday).
                      Also avoid Ashtami, Chaturdashi, Amavasya, and Purnima.
                    </p>
                  </div>
                </div>
              </div>

              {/* 108 Reference Table */}
              <div className="card-cosmic p-6">
                <h3 className="font-serif text-gold-400 text-lg mb-1">सम्पूर्ण 108 नामाक्षर — Complete Reference</h3>
                <p className="text-gray-400 text-xs mb-4">All 27 nakshatras × 4 padas — your baby's row is highlighted</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gold-600/20 text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="text-left pb-2 pr-3">#</th>
                        <th className="text-left pb-2 pr-3">Nakshatra</th>
                        <th className="text-left pb-2 pr-3 hidden sm:table-cell">नक्षत्र</th>
                        <th className="text-left pb-2 pr-3 hidden sm:table-cell">Lord</th>
                        <th className="text-center pb-2 px-2">Pada 1</th>
                        <th className="text-center pb-2 px-2">Pada 2</th>
                        <th className="text-center pb-2 px-2">Pada 3</th>
                        <th className="text-center pb-2 px-2">Pada 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {NAK_TABLE.map((row, i) => {
                        const isMyNak = row.name === nm.nakshatra;
                        return (
                          <tr key={row.name}
                            className={`border-b border-gold-600/5 ${isMyNak ? 'bg-gold-500/12' : i % 2 === 0 ? 'bg-cosmic-900/20' : ''}`}>
                            <td className="py-2 pr-2 text-gray-500">{i + 1}</td>
                            <td className={`py-2 pr-3 ${isMyNak ? 'text-gold-300 font-semibold' : 'text-gray-300'}`}>{row.name}</td>
                            <td className="py-2 pr-3 hidden sm:table-cell text-gray-400" style={{ fontFamily: 'Nirmala UI, Mangal, sans-serif' }}>{row.nameHi}</td>
                            <td className="py-2 pr-3 hidden sm:table-cell text-gray-400">{row.lord}</td>
                            {row.pada.map((pd, pi) => {
                              const isActivePada = isMyNak && (pi + 1) === nm.pada;
                              return (
                                <td key={pi} className={`py-2 px-2 text-center ${isActivePada ? 'text-gold-300 font-bold' : isMyNak ? 'text-gray-200' : 'text-gray-400'}`}>
                                  <span className="font-semibold">{pd.en}</span>
                                  <span className="text-gray-600 mx-0.5">/</span>
                                  <span style={{ fontFamily: 'Nirmala UI, Mangal, sans-serif' }}>{pd.hi}</span>
                                  {isActivePada && <span className="ml-0.5 text-gold-500">★</span>}
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

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
