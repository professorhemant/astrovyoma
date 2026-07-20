import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Loader, RotateCcw } from 'lucide-react';
import { palmistry as palmistryApi } from '../api';
import SwastikBorder from '../components/SwastikBorder';

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }} className="font-bold">{value}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg,${color}80,${color})` }}
        />
      </div>
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="card-cosmic rounded-xl p-5">
      <h3 className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

// ── Select pill group ─────────────────────────────────────────────────────────
function PillSelect({ options, value, onChange, color = '#C9A84C' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-full border text-xs transition-all font-medium"
            style={{
              borderColor: active ? color : 'rgba(201,168,76,0.2)',
              background:  active ? color + '20' : 'transparent',
              color:       active ? color : '#9ca3af',
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Mount quality row ─────────────────────────────────────────────────────────
function MountRow({ mount, value, onChange }) {
  const opts = [
    { value: 'skip',          label: 'Skip' },
    { value: 'flat',          label: 'Flat' },
    { value: 'well_developed',label: 'Well Developed' },
    { value: 'overdeveloped', label: 'Overdeveloped' },
  ];
  return (
    // Grid rather than flex-wrap: the longer locations (Moon, Venus, Upper Mars)
    // otherwise wrap onto their own line and those rows end up taller than the rest.
    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_10rem] sm:items-center gap-x-3 gap-y-2 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-gray-300 text-xs">{mount.label}</span>
      <PillSelect options={opts} value={value || 'skip'} onChange={onChange} color="#74B9FF" />
      {mount.location && (
        <span className="text-gray-500 text-[11px] leading-snug sm:text-right">
          📍 {mount.location}
        </span>
      )}
    </div>
  );
}

// ── Steps config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'hand',    title: 'Hand Shape',     icon: '🖐️', desc: 'What shape is the palm and fingers?' },
  { id: 'lines',   title: 'Palm Lines',     icon: '〰️', desc: 'Describe each major line on your palm' },
  { id: 'mounts',  title: 'Mounts',         icon: '⛰️', desc: 'Rate the fleshy pads on your palm' },
  { id: 'details', title: 'Details',        icon: '🔍', desc: 'Thumb, fingers, and special marks' },
];

const HAND_OPTIONS = [
  { value: 'earth', label: '🟫 Earth Hand',  sub: 'Square palm · Short fingers · Practical' },
  { value: 'air',   label: '🔵 Air Hand',    sub: 'Square/rect palm · Long fingers · Intellectual' },
  { value: 'fire',  label: '🔴 Fire Hand',   sub: 'Rect palm · Short fingers · Energetic' },
  { value: 'water', label: '🩵 Water Hand',  sub: 'Oval palm · Long fingers · Intuitive' },
];

const SCORE_META = [
  { key: 'health', label: 'Vitality & Health',    color: '#6BCB77' },
  { key: 'mind',   label: 'Intellect & Mind',      color: '#74B9FF' },
  { key: 'heart',  label: 'Love & Emotion',        color: '#F472B6' },
  { key: 'career', label: 'Career & Destiny',      color: '#C9A84C' },
  { key: 'fame',   label: 'Fame & Recognition',    color: '#FFD93D' },
  { key: 'overall',label: 'Overall Palm Strength', color: '#A78BFA' },
];

const LINE_ICONS = {
  life_line: '❤️', heart_line: '💝', head_line: '🧠', fate_line: '⭐', sun_line: '☀️',
};

// ─────────────────────────────────────────────────────────────────────────────
// Reads a palm photo and fills in the features it can actually see.
// The image is sent for analysis and never stored — see palmistryVisionController.
function PalmPhotoAnalyser({ onFeatures }) {
  const [preview, setPreview]   = useState(null);
  const [busy, setBusy]         = useState(false);
  const [result, setResult]     = useState(null);
  const [problem, setProblem]   = useState(null);
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);

  const FEATURE_LABEL = {
    hand_type:'Hand shape', life_line:'Life line', heart_line:'Heart line',
    head_line:'Head line', fate_line:'Fate line', sun_line:'Sun line',
    finger_length:'Finger length',
  };

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setProblem('Please choose an image file.');
    if (file.size > 5 * 1024 * 1024) return setProblem('That image is over 5MB — please use a smaller photo.');

    setProblem(null); setResult(null); setBusy(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(new Error('Could not read that file'));
        r.readAsDataURL(file);
      });
      setPreview(dataUrl);

      const res = await palmistryApi.analyseImage({ image: dataUrl });
      setResult(res.data);
      onFeatures(res.data.features || {});
    } catch (err) {
      const d = err?.response?.data;
      setProblem(d?.error || 'Could not analyse that photo. Please try again.');
      if (d?.note) setProblem(p => `${p} ${d.note}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gold-600/25 bg-gold-500/5 p-5">
      <p className="font-serif text-gold-400 text-base mb-1">📷 Read my palm from a photo</p>
      <p className="text-gray-400 text-xs mb-4">
        We'll detect what's visible in the image and fill in the form for you.
      </p>

      {/* Which hand — classical Vedic practice */}
      <div className="rounded-xl border border-gold-600/20 bg-cosmic-900/40 p-3 mb-4">
        <p className="text-gold-500/90 text-xs font-semibold mb-1.5">🤚 Which palm to photograph</p>
        <p className="text-gray-300 text-xs leading-relaxed">
          <b className="text-gray-200">Men — right palm.</b> &nbsp;<b className="text-gray-200">Women — left palm.</b>
        </p>
        <p className="text-gray-500 text-[11px] mt-1.5 leading-relaxed">
          This follows classical Hast Rekha Shastra. If you're unsure, use your dominant hand.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button type="button" disabled={busy} onClick={() => uploadRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gold-500/40 bg-cosmic-900/60 text-gold-300 text-sm hover:bg-gold-500/10 disabled:opacity-50">
          ⬆️ Upload palm image
        </button>
        <button type="button" disabled={busy} onClick={() => cameraRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gold-500/40 bg-cosmic-900/60 text-gold-300 text-sm hover:bg-gold-500/10 disabled:opacity-50">
          📸 Capture palm image
        </button>
      </div>

      <input ref={uploadRef} type="file" accept="image/*" hidden
        onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
      {/* capture= opens the device camera directly on mobile */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
        onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />

      <p className="text-gray-500 text-[11px] mt-3 leading-relaxed">
        Open palm flat, fingers slightly spread, in even daylight. Avoid shadows and glare.
      </p>

      {preview && (
        <div className="mt-4 flex items-start gap-3">
          <img src={preview} alt="Your palm" className="w-24 h-24 object-cover rounded-xl border border-gold-600/25" />
          {busy && <p className="text-gold-400 text-xs mt-2">Reading your palm…</p>}
        </div>
      )}

      {problem && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3">
          <p className="text-amber-300 text-xs">{problem}</p>
        </div>
      )}

      {result && (
        <div className={`mt-4 rounded-xl border p-3 space-y-2 ${
          result.partial ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
        }`}>
          <p className={`text-xs font-semibold ${result.partial ? 'text-amber-300' : 'text-emerald-300'}`}>
            {result.partial
              ? '◐ Partly read from your photo — check and complete below'
              : '✓ Read from your photo — check and adjust below'}
          </p>
          <p className="text-gray-300 text-[11px]">
            <b className="text-gray-200">Filled in:</b>{' '}
            {Object.keys(result.features || {}).map(k => FEATURE_LABEL[k] || k).join(' · ') || 'nothing'}
          </p>

          {result.needs_manual?.length > 0 && (
            <p className="text-amber-300/90 text-[11px]">
              <b>Please set yourself:</b> {result.needs_manual.map(k => FEATURE_LABEL[k] || k).join(', ')} — the photo wasn't clear enough for {result.needs_manual.length > 1 ? 'these' : 'this'}. A sharper, evenly-lit photo may capture {result.needs_manual.length > 1 ? 'them' : 'it'}.
            </p>
          )}

          {result.quality_note && (
            <p className="text-gray-400 text-[11px]">{result.quality_note}</p>
          )}

          {result.hand_mismatch && (
            <p className="text-amber-300 text-[11px]">
              ⚠️ This looks like your {result.detected_hand} hand.
            </p>
          )}

          {result.unclear_features?.length > 0 && (
            <p className="text-gray-400 text-[11px]">
              Not clear enough to read: {result.unclear_features.map(k => FEATURE_LABEL[k] || k).join(', ')} — please set {result.unclear_features.length > 1 ? 'these' : 'this'} yourself below.
            </p>
          )}

          <p className="text-gray-500 text-[11px] leading-relaxed border-t border-emerald-500/15 pt-2">
            A photo can't show the <b className="text-gray-400">mounts</b> (raised pads, judged by touch),
            <b className="text-gray-400"> special marks</b>, or <b className="text-gray-400">thumb flexibility</b>.
            Add those yourself in the next steps for a fuller reading.
          </p>
        </div>
      )}

      <p className="text-gray-600 text-[10px] mt-3 leading-relaxed">
        🔒 Your palm image is analysed and immediately discarded. It is never saved to our servers.
      </p>
    </div>
  );
}

export default function PalmistryPage() {
  const [options, setOptions] = useState(null);
  const [step, setStep]       = useState(0);
  const [name, setName]       = useState('');
  const [form, setForm]       = useState({
    hand_type: '', life_line: '', heart_line: '', head_line: '',
    fate_line: '', sun_line: '', mounts: {}, dominant_mount: '',
    thumb: '', finger_length: '', special_mark: '',
  });
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [optLoading, setOptLoad]= useState(true);

  // Load option lists from backend
  useEffect(() => {
    palmistryApi.getOptions()
      .then(r => setOptions(r.data))
      .catch(() => toast.error('Could not load options'))
      .finally(() => setOptLoad(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setMount = (k, v) => setForm(f => ({ ...f, mounts: { ...f.mounts, [k]: v } }));

  const canNext = () => {
    if (step === 0) return !!form.hand_type;
    if (step === 1) return !!form.life_line && !!form.heart_line && !!form.head_line;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.hand_type || !form.life_line || !form.heart_line || !form.head_line) {
      toast.error('Please complete at least hand type and the three main lines.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await palmistryApi.analyse({ name, ...form });
      setResult(r.data);
      setStep(4); // results step
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setStep(0); setResult(null);
    setForm({ hand_type:'', life_line:'', heart_line:'', head_line:'', fate_line:'', sun_line:'', mounts:{}, dominant_mount:'', thumb:'', finger_length:'', special_mark:'' });
    setName('');
  };

  if (optLoading) return (
    <div className="min-h-screen bg-cosmic-950 flex items-center justify-center">
      <Loader className="w-8 h-8 text-gold-400 animate-spin" />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-28">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
          <p className="text-gold-500/60 text-xs uppercase tracking-[0.25em] mb-3">Vedic Hast Rekha Shastra</p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3" style={{ textShadow:'0 0 40px rgba(201,168,76,0.4)' }}>
            🖐️ Palmistry Reading
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            Upload a palm photo or select your characteristics below. Either way, the reading itself comes from our deterministic Hast Rekha engine — a photo is only used to detect what is visible in it, never to invent the reading.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Form steps ── */}
          {step < 4 && !loading && (
            <motion.div key={`step-${step}`}
              initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-30 }} transition={{ duration:0.2 }}>

              {/* Step progress */}
              <div className="flex items-center gap-1 mb-8">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s.id}>
                    <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                      i === step ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 font-semibold' :
                      i < step  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                                  'text-gray-600 border border-white/8'
                    }`}>
                      <span>{s.icon}</span>
                      <span className="hidden sm:inline">{s.title}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10" />}
                  </React.Fragment>
                ))}
              </div>

              <div className="card-cosmic rounded-2xl p-6 border border-gold-600/20 space-y-6">

                {/* Step description */}
                <div>
                  <p className="text-gold-400 font-serif text-lg">{STEPS[step].icon} {STEPS[step].title}</p>
                  <p className="text-gray-400 text-xs mt-1">{STEPS[step].desc}</p>
                </div>

                {/* ── Step 0: Hand shape + name ── */}
                {step === 0 && (
                  <div className="space-y-5">

                    {options?.image_analysis_available && (
                      <>
                        <PalmPhotoAnalyser
                          onFeatures={(features) => {
                            setForm(f => ({ ...f, ...features }));
                            if (features.hand_type) toast.success('Palm read — details filled in below');
                          }}
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gold-600/15" />
                          <span className="text-gray-600 text-[11px] uppercase tracking-wider">or fill in manually</span>
                          <div className="flex-1 h-px bg-gold-600/15" />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Your Name (optional)</label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"
                        className="w-full bg-cosmic-900/60 border border-gold-600/20 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-gold-500/50" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wider block mb-3">Hand Shape *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {HAND_OPTIONS.map(opt => (
                          <button key={opt.value} type="button"
                            onClick={() => set('hand_type', opt.value)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              form.hand_type === opt.value
                                ? 'border-gold-500/60 bg-gold-500/15'
                                : 'border-white/10 hover:border-gold-500/30 hover:bg-white/5'
                            }`}>
                            <div className="text-sm font-medium text-gray-200 mb-1">{opt.label}</div>
                            <div className="text-[11px] text-gray-500">{opt.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Quick guide */}
                    <div className="bg-white/5 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                      <p className="text-gold-500/70 font-medium mb-2">📖 Quick Guide</p>
                      <p>• <b className="text-gray-400">Earth</b>: Palm as wide as it is long; short sturdy fingers</p>
                      <p>• <b className="text-gray-400">Air</b>: Rectangular palm with clearly longer fingers</p>
                      <p>• <b className="text-gray-400">Fire</b>: Longer rectangular palm with shorter fingers</p>
                      <p>• <b className="text-gray-400">Water</b>: Oval/narrow palm with long graceful fingers</p>
                    </div>
                  </div>
                )}

                {/* ── Step 1: Palm lines ── */}
                {step === 1 && options && (
                  <div className="space-y-5">
                    {[
                      { key:'life_line',  label:'Life Line *',   opts: options.life_lines,  color:'#6BCB77', hint:'Curves around the base of the thumb' },
                      { key:'heart_line', label:'Heart Line *',  opts: options.heart_lines, color:'#F472B6', hint:'Top horizontal line below the fingers' },
                      { key:'head_line',  label:'Head Line *',   opts: options.head_lines,  color:'#74B9FF', hint:'Middle horizontal line' },
                      { key:'fate_line',  label:'Fate Line',     opts: options.fate_lines,  color:'#C9A84C', hint:'Vertical line running up the centre' },
                      { key:'sun_line',   label:'Sun / Apollo Line', opts: options.sun_lines, color:'#FFD93D', hint:'Short vertical line below ring finger' },
                    ].map(({ key, label, opts, color, hint }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-300 text-sm font-medium flex items-center gap-1.5">
                            <span>{LINE_ICONS[key]}</span>{label}
                          </label>
                          <span className="text-gray-600 text-[10px] italic">{hint}</span>
                        </div>
                        <PillSelect options={opts} value={form[key]} onChange={v => set(key, v)} color={color} />
                      </div>
                    ))}
                    <div className="bg-white/5 rounded-xl p-4 text-xs text-gray-500">
                      <p className="text-gold-500/70 font-medium mb-2">📖 Line Guide</p>
                      <p>Look at your palm in good light. The three main lines (Life, Heart, Head) are almost always visible. Fate and Sun lines may be absent — that's fine.</p>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Mounts ── */}
                {step === 2 && options && (
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                      Mounts are the raised, fleshy pads on your palm — judge them by touch, not by eye. Cup your hand slightly and press each area with a fingertip: a mount that springs back firmly is well developed, one you can barely feel is flat. Four sit directly below the fingers; Venus, Moon and Upper Mars do not. The location of each is shown on the right.
                    </p>
                    {options.mounts.map(m => (
                      <MountRow key={m.value} mount={m} value={form.mounts[m.value]} onChange={v => setMount(m.value, v)} />
                    ))}
                    <div className="pt-3">
                      <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Dominant Mount (most prominent)</label>
                      <PillSelect
                        options={[{ value:'', label:'None / Unsure' }, ...options.mounts]}
                        value={form.dominant_mount}
                        onChange={v => set('dominant_mount', v)}
                        color="#A78BFA"
                      />
                    </div>
                  </div>
                )}

                {/* ── Step 3: Details ── */}
                {step === 3 && options && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-gray-300 text-sm font-medium block mb-2">👍 Thumb</label>
                      <PillSelect options={options.thumbs} value={form.thumb} onChange={v => set('thumb', v)} color="#FB923C" />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm font-medium block mb-2">✌️ Finger Length</label>
                      <PillSelect options={options.finger_lengths} value={form.finger_length} onChange={v => set('finger_length', v)} color="#34D399" />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm font-medium block mb-2">✨ Special Mark (if any)</label>
                      <PillSelect options={options.special_marks} value={form.special_mark || 'none'} onChange={v => set('special_mark', v)} color="#F472B6" />
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-gold-400 transition-colors disabled:opacity-30 text-sm px-3 py-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  {step < 3 ? (
                    <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                      className="btn-gold px-6 py-2.5 text-sm flex items-center gap-1.5 disabled:opacity-40">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleSubmit}
                      className="btn-gold px-8 py-2.5 text-sm font-semibold flex items-center gap-2">
                      ✦ Read My Palm
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-6xl animate-pulse">🖐️</div>
              <p className="text-gold-400 font-serif animate-pulse">Reading your palm lines…</p>
              <p className="text-gray-500 text-sm">Consulting Hast Rekha Shastra</p>
            </motion.div>
          )}

          {/* ── Results ── */}
          {result && step === 4 && !loading && (
            <motion.div key="results" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-5">

              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🖐️</span>
                  <div>
                    <h2 className="font-serif text-gold-400 text-xl">
                      {result.name}'s Palm Reading
                    </h2>
                    <p className="text-xs text-gray-500">Hast Rekha Shastra · Deterministic Analysis</p>
                  </div>
                </div>
                <button onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-400 border border-white/10 hover:border-gold-500/30 px-3 py-1.5 rounded-full transition-all">
                  <RotateCcw className="w-3 h-3" /> New Reading
                </button>
              </div>

              {/* Hand type banner */}
              <div className="card-cosmic p-5 border-l-4 border-gold-500">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <p className="text-gold-300 font-serif text-xl">{result.reading.hand_type}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400">
                    {result.reading.element} · {result.reading.planet}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{result.reading.overall_personality}</p>
              </div>

              {/* Scores */}
              <Section icon="📊" title="Palm Strength Analysis">
                <div className="grid md:grid-cols-2 gap-3">
                  {SCORE_META.map(s => (
                    <ScoreBar key={s.key} label={s.label} value={result.reading.scores?.[s.key] || 0} color={s.color} />
                  ))}
                </div>
              </Section>

              {/* Lines */}
              <Section icon="〰️" title="Palm Lines">
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(result.reading.lines || {}).map(([key, val]) => val && (
                    <div key={key} className="bg-cosmic-900/60 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{LINE_ICONS[key] || '—'}</span>
                        <span className="text-gold-400 text-xs font-medium capitalize">{key.replace('_',' ')}</span>
                        <span className="text-gray-500 text-[10px] ml-auto italic">{val.quality}</span>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{val.meaning}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Mounts */}
              {result.reading.mounts?.length > 0 && (
                <Section icon="⛰️" title="Mounts">
                  <div className="space-y-3">
                    {result.reading.mounts.map((m, i) => (
                      <div key={i} className="bg-cosmic-900/60 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gold-400 text-xs font-medium">{m.mount}</span>
                          <span className="text-gray-500 text-[10px] italic">{m.quality?.replace('_',' ')}</span>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed">{m.meaning}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Career + Love 2-col */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Section icon="💼" title="Career">
                  <p className="text-gray-300 text-sm leading-relaxed">{result.reading.career_indication}</p>
                </Section>
                <Section icon="💕" title="Strengths & Challenges">
                  <div className="space-y-2">
                    {result.reading.strengths?.map((s,i) => (
                      <div key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-emerald-400">✓</span>{s}</div>
                    ))}
                    {result.reading.challenges?.map((c,i) => (
                      <div key={i} className="text-xs text-gray-400 flex gap-2"><span className="text-amber-400">△</span>{c}</div>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Thumb + Fingers */}
              {(result.reading.thumb || result.reading.finger_insights) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.reading.thumb && (
                    <Section icon="👍" title="Thumb Reading">
                      <p className="text-gray-300 text-sm leading-relaxed">{result.reading.thumb}</p>
                    </Section>
                  )}
                  {result.reading.finger_insights && (
                    <Section icon="✌️" title="Finger Insights">
                      <p className="text-gray-300 text-sm leading-relaxed">{result.reading.finger_insights}</p>
                    </Section>
                  )}
                </div>
              )}

              {/* Special mark */}
              {result.reading.special_mark && result.reading.special_mark !== SPECIAL_MARKS?.none && (
                <Section icon="✨" title="Special Mark">
                  <p className="text-gray-300 text-sm leading-relaxed">{result.reading.special_mark}</p>
                </Section>
              )}

              {/* Lucky elements */}
              <Section icon="🍀" title="Lucky Elements (Vedic)">
                <div className="flex flex-wrap gap-4 text-sm">
                  {[
                    { label:'Number',    value: result.reading.lucky_elements?.number    },
                    { label:'Color',     value: result.reading.lucky_elements?.color     },
                    { label:'Direction', value: result.reading.lucky_elements?.direction },
                    { label:'Gemstone',  value: result.reading.lucky_elements?.stone     },
                  ].map(e => (
                    <div key={e.label} className="bg-cosmic-900/60 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">{e.label}</p>
                      <p className="text-gold-400 font-semibold text-sm">{e.value}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Guidance */}
              {result.reading.guidance && (
                <Section icon="🌟" title="Guidance">
                  {result.reading.guidance.split('\n\n').map((g, i) => (
                    <p key={i} className="text-gray-300 text-sm leading-relaxed mb-2 last:mb-0">{g}</p>
                  ))}
                </Section>
              )}

              {/* Affirmation */}
              <div className="text-center py-5 border border-gold-600/20 rounded-2xl bg-gold-500/5">
                <p className="text-gold-400 font-serif text-base italic">✦ {result.reading.affirmation} ✦</p>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
