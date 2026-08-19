import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dream as dreamApi } from '../api';
import { useLanguage } from '../context/LanguageContext';

// Dreams Do Say Something.
//
// Both languages are carried here in full — labels, buttons and placeholders,
// not only the reading. That is a deliberate departure from LanguageContext's
// usual rule that the interface stays English: somebody typing a dream at four
// in the morning in Hindi should not be doing it into an English form. Tarot
// made the same call.
//
// Where it differs from Tarot is that the choice never blocks entry. Tarot puts
// a language gate ahead of everything; this page opens in whatever the navbar
// toggle already says and offers its own switch, because most people will
// arrive here from a search rather than from the front door.

const T = {
  en: {
    title: 'Dreams Do Say Something',
    subtitle: 'Read against the watch of the night you dreamt it in, and the texts that fixed its meaning.',
    dreamLabel: 'What did you see?',
    dreamPlaceholder: 'Everything you remember — people, places, animals, colours, how it felt…',
    tryExample: 'Or try one of these:',
    whenLabel: 'When did you dream it?',
    dateLabel: 'Date',
    timeLabel: 'Time',
    timeHelp: 'The watch of the night decides when the dream is due. Guess if you have to — near enough is enough.',
    moodLabel: 'How did you feel on waking?',
    moodNone: 'Not sure',
    sleptAgain: 'I fell asleep again afterwards',
    recurring: 'I have this dream again and again',
    submit: 'Read my dream',
    submitting: 'Reading…',
    loadingLine: 'Working out the watch of the night…',
    timingHeading: 'When this dream is due',
    dueBy: 'Expected by',
    nullified: 'This dream is nullified',
    nullifiedSlept: 'You fell asleep again after it, and the texts hold that a dream slept upon does not come to pass.',
    nullifiedLater: 'A later dream the same night takes precedence, so this one is spent.',
    daytime: 'A daytime dream. The texts do not hold these as fruitful — they read as the mind sorting the day.',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    brahma: 'Brahma Muhurta',
    symbolsHeading: 'What the texts say',
    noSymbols: 'No symbol from the classical lists was recognised in this dream. The reading below goes on what you described.',
    classical: 'Classical',
    psychological: 'Psychological',
    readingHeading: 'Your reading',
    chartHeading: 'Against your own chart',
    guidanceHeading: 'What to do',
    remediesHeading: 'Remedies',
    lockedTitle: 'The reading is part of the Platinum plan',
    lockedBodyAuth: 'The watch of the night and the symbols above are yours for nothing. The full reading — woven together, and read against your own birth chart and running dasha — comes with Platinum.',
    lockedBodyPlan: 'This one is on the Platinum plan. The full reading is read against your own birth chart and your running dasha, which is something no other dream tool can do.',
    signIn: 'Sign in',
    seePlans: 'See plans',
    switchTo: 'हिंदी',
    langName: 'English',
    errGeneric: 'Could not read the dream. Please try again.',
    errShort: 'Please write a little more about the dream.',
    footNote: 'Verdicts come from the classical texts named beside them, not from a language model. Nothing here predicts illness or misfortune.',
  },
  hi: {
    title: 'सपने कुछ कहते हैं',
    subtitle: 'आपने जिस पहर में सपना देखा, और जिन ग्रंथों ने उसका फल तय किया — दोनों के आधार पर।',
    dreamLabel: 'आपने क्या देखा?',
    dreamPlaceholder: 'जो कुछ याद है — लोग, जगहें, जानवर, रंग, कैसा महसूस हुआ…',
    tryExample: 'या इनमें से कोई आज़माएँ:',
    whenLabel: 'सपना कब आया?',
    dateLabel: 'तारीख़',
    timeLabel: 'समय',
    timeHelp: 'रात का पहर ही तय करता है कि सपना कब फलेगा। ठीक याद न हो तो अंदाज़ा चलेगा।',
    moodLabel: 'जागने पर कैसा लगा?',
    moodNone: 'कह नहीं सकते',
    sleptAgain: 'उसके बाद मैं फिर सो गया',
    recurring: 'यह सपना मुझे बार-बार आता है',
    submit: 'सपना पढ़ें',
    submitting: 'पढ़ा जा रहा है…',
    loadingLine: 'रात का पहर निकाला जा रहा है…',
    timingHeading: 'यह सपना कब फलेगा',
    dueBy: 'इस तारीख़ तक',
    nullified: 'यह सपना निष्फल हो गया',
    nullifiedSlept: 'आप उसके बाद फिर सो गए, और शास्त्र कहते हैं कि जिस सपने पर दोबारा नींद आ जाए वह फलता नहीं।',
    nullifiedLater: 'उसी रात का बाद वाला सपना प्रबल होता है, इसलिए यह निष्फल हुआ।',
    daytime: 'यह दिन का सपना है। शास्त्र इन्हें फलदायी नहीं मानते — ये दिन भर की बातों को मन का समेटना है।',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    brahma: 'ब्रह्म मुहूर्त',
    symbolsHeading: 'शास्त्र क्या कहते हैं',
    noSymbols: 'इस सपने में शास्त्रीय सूचियों का कोई प्रतीक नहीं पहचाना गया। नीचे की व्याख्या आपके विवरण पर आधारित है।',
    classical: 'शास्त्र',
    psychological: 'मनोविज्ञान',
    readingHeading: 'आपकी व्याख्या',
    chartHeading: 'आपकी अपनी कुंडली के अनुसार',
    guidanceHeading: 'क्या करें',
    remediesHeading: 'उपाय',
    lockedTitle: 'पूरी व्याख्या प्लैटिनम योजना में मिलती है',
    lockedBodyAuth: 'ऊपर का पहर और प्रतीक आपके लिए नि:शुल्क हैं। पूरी व्याख्या — सब जोड़कर, और आपकी अपनी जन्मकुंडली तथा चल रही दशा के साथ पढ़ी हुई — प्लैटिनम योजना में मिलती है।',
    lockedBodyPlan: 'यह सुविधा प्लैटिनम योजना में है। पूरी व्याख्या आपकी जन्मकुंडली और चल रही दशा के साथ पढ़ी जाती है — जो और कोई स्वप्न-सुविधा नहीं कर सकती।',
    signIn: 'साइन इन करें',
    seePlans: 'योजनाएँ देखें',
    switchTo: 'English',
    langName: 'हिंदी',
    errGeneric: 'सपना पढ़ा नहीं जा सका। कृपया फिर कोशिश करें।',
    errShort: 'सपने के बारे में थोड़ा और लिखें।',
    footNote: 'शुभ-अशुभ का निर्णय साथ में लिखे ग्रंथों से आता है, किसी भाषा-मॉडल से नहीं। यहाँ कोई बीमारी या अनिष्ट की भविष्यवाणी नहीं की जाती।',
  },
};

const EXAMPLES = {
  en: [
    'A black cobra was coiled around a silver sword under a full moon',
    'I was flying over a clear sky and then fell from a great height',
    'My grandmother, who has passed, gave me white flowers in a temple',
    'My teeth were falling out one by one and I could not stop it',
  ],
  hi: [
    'पूरे चाँद के नीचे एक काला नाग चाँदी की तलवार से लिपटा था',
    'मैं साफ़ आसमान में उड़ रहा था और फिर बहुत ऊँचाई से गिर गया',
    'मेरी दिवंगत दादी ने मंदिर में मुझे सफ़ेद फूल दिए',
    'मेरे दाँत एक-एक करके गिर रहे थे और मैं रोक नहीं पा रहा था',
  ],
};

const MOODS = {
  en: [['peaceful','Peaceful'],['anxious','Anxious'],['confused','Confused'],['scared','Scared'],['joyful','Joyful'],['strange','Strange']],
  hi: [['peaceful','शांत'],['anxious','बेचैन'],['confused','उलझन में'],['scared','डरा हुआ'],['joyful','ख़ुश'],['strange','अजीब']],
};

const VERDICT_STYLE = {
  auspicious:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  inauspicious: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  mixed:        'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

// The schema asks for guidance as one string and the model sometimes sends an
// array of two. React renders an array of strings with nothing between them, so
// the two sentences arrive run together — this takes either shape and gives
// back lines to paragraph out.
function asLines(v) {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  const s = String(v ?? '').trim();
  return s ? [s] : [];
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDue(iso, lang) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── The watch of the night, which is the whole point ────────────────────────
function TimingPanel({ timing, t, lang }) {
  if (!timing) return null;

  if (timing.isDaytime) {
    return (
      <div className="card-cosmic p-5 border-l-4 border-cosmic-600">
        <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">{t.timingHeading}</h3>
        <p className="text-sm text-cosmic-300">{t.daytime}</p>
      </div>
    );
  }

  return (
    <div className="card-cosmic p-5 border-l-4 border-gold-500">
      <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-3">{t.timingHeading}</h3>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
        <span className="font-serif text-xl text-gold-300">{timing.label?.[lang]}</span>
        {timing.isBrahmaMuhurta && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
            ✦ {t.brahma}
          </span>
        )}
      </div>

      {timing.nullified ? (
        <div className="rounded-lg bg-cosmic-900 border border-cosmic-700 p-3">
          <p className="text-sm text-amber-400 font-medium mb-1">{t.nullified}</p>
          <p className="text-xs text-cosmic-400">
            {timing.nullifiedBy === 'slept_again' ? t.nullifiedSlept : t.nullifiedLater}
          </p>
        </div>
      ) : (
        <p className="text-sm text-cosmic-200">
          <span className="text-cosmic-400">{t.dueBy}: </span>
          <span className="text-gold-300 font-medium">{formatDue(timing.dueDate, lang)}</span>
          <span className="text-cosmic-500"> · {timing.fruition?.[lang]}</span>
        </p>
      )}

      <p className="text-[11px] text-cosmic-600 mt-3">
        {t.sunset} {timing.sunset} · {t.sunrise} {timing.sunrise}
      </p>
    </div>
  );
}

// ── One looked-up symbol, with its source showing ───────────────────────────
function SymbolCard({ s, i, t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
      className="bg-cosmic-900 rounded-xl p-4 border border-gold-600/10">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-gold-400 font-medium text-sm">✦ {s.name}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${VERDICT_STYLE[s.verdict] || VERDICT_STYLE.mixed}`}>
          {s.verdict_label}
        </span>
      </div>
      <p className="text-xs text-cosmic-300 mb-1.5">
        <span className="text-cosmic-500">{t.classical}: </span>{s.vedic}
      </p>
      <p className="text-xs text-cosmic-400 mb-2">
        <span className="text-cosmic-500">{t.psychological}: </span>{s.jungian}
      </p>
      <p className="text-[10px] text-cosmic-600 italic">— {s.source_label}</p>
    </motion.div>
  );
}

function LockedPanel({ data, t }) {
  const needsAuth = data.locked_reason === 'auth_required';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="card-cosmic p-6 border border-gold-600/25 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="font-serif text-lg text-gold-300 mb-2">{t.lockedTitle}</h3>
      <p className="text-sm text-cosmic-400 max-w-md mx-auto mb-5">
        {needsAuth ? t.lockedBodyAuth : t.lockedBodyPlan}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {needsAuth && (
          <Link to="/login" className="border border-cosmic-600 hover:border-gold-600/40 text-cosmic-300 px-5 py-2 rounded-lg text-sm transition-colors">
            {t.signIn}
          </Link>
        )}
        <Link to="/plans" className="btn-gold px-5 py-2 text-sm font-semibold">{t.seePlans}</Link>
      </div>
    </motion.div>
  );
}

export default function DreamInterpretationPage() {
  const { lang: siteLang } = useLanguage();
  // Opens in whatever the navbar already says, then this page owns it.
  const [lang, setLang] = useState(siteLang === 'hi' ? 'hi' : 'en');
  const t = T[lang];

  const [form, setForm] = useState({
    dream_text: '', dream_date: todayISO(), dream_time: '04:00',
    mood: '', fell_asleep_again: false, is_recurring: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (useLang, body) => {
    setLoading(true);
    try {
      const payload = { ...body, lang: useLang, tz_min: -new Date().getTimezoneOffset() };
      const res = await dreamApi.interpret(payload);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || T[useLang].errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.dream_text.trim().length < 10) return toast.error(t.errShort);
    run(lang, form);
  };

  // Flipping the language re-reads the same dream rather than clearing it —
  // retyping a dream to see it in the other language would be an absurd thing
  // to ask of somebody who has just woken up.
  const flipLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    if (result) run(next, form);
  };

  const it = result?.interpretation;

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-24">

        <div className="flex justify-end mb-4">
          <button type="button" onClick={flipLang}
            className="text-xs border border-cosmic-700 hover:border-gold-600/40 text-cosmic-400 hover:text-gold-400 px-3 py-1.5 rounded-lg transition-colors">
            {t.langName} · {t.switchTo}
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="font-serif text-3xl text-gold-400 mb-2">{t.title}</h1>
          <p className="text-cosmic-400 text-sm max-w-lg mx-auto">{t.subtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-cosmic p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-xs text-cosmic-400 mb-1 block">{t.dreamLabel} *</label>
              <textarea className="input-cosmic w-full h-32 resize-none" placeholder={t.dreamPlaceholder}
                value={form.dream_text} onChange={e => setForm(f => ({ ...f, dream_text: e.target.value }))} required />
            </div>

            <div>
              <p className="text-xs text-cosmic-600 mb-2">{t.tryExample}</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES[lang].map((ex, i) => (
                  <button key={i} type="button" onClick={() => setForm(f => ({ ...f, dream_text: ex }))}
                    className="text-xs border border-cosmic-700 text-cosmic-500 hover:border-gold-600/30 hover:text-cosmic-300 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {ex.slice(0, 38)}…
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-cosmic-400 mb-1 block">{t.whenLabel}</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-cosmic-600 mb-1 block">{t.dateLabel}</span>
                  <input type="date" className="input-cosmic w-full" value={form.dream_date}
                    onChange={e => setForm(f => ({ ...f, dream_date: e.target.value }))} />
                </div>
                <div>
                  <span className="text-[11px] text-cosmic-600 mb-1 block">{t.timeLabel}</span>
                  <input type="time" className="input-cosmic w-full" value={form.dream_time}
                    onChange={e => setForm(f => ({ ...f, dream_time: e.target.value }))} />
                </div>
              </div>
              <p className="text-[11px] text-cosmic-600 mt-1.5">{t.timeHelp}</p>
            </div>

            <div>
              <label className="text-xs text-cosmic-400 mb-2 block">{t.moodLabel}</label>
              <div className="flex flex-wrap gap-2">
                {MOODS[lang].map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setForm(f => ({ ...f, mood: f.mood === val ? '' : val }))}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      form.mood === val
                        ? 'border-gold-600/50 text-gold-400 bg-gold-500/10'
                        : 'border-cosmic-700 text-cosmic-500 hover:border-gold-600/30'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {[['fell_asleep_again', t.sleptAgain], ['is_recurring', t.recurring]].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs text-cosmic-400 cursor-pointer">
                  <input type="checkbox" checked={form[key]} className="accent-gold-500"
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50">
              🌙 {loading ? t.submitting : t.submit}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-12 space-y-3">
              <div className="text-4xl animate-pulse">🌙</div>
              <p className="text-gold-400 font-serif animate-pulse">{t.loadingLine}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            <TimingPanel timing={result.timing} t={t} lang={lang} />

            <div>
              <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-3">{t.symbolsHeading}</h3>
              {result.symbols?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.symbols.map((s, i) => <SymbolCard key={s.key} s={s} i={i} t={t} />)}
                </div>
              ) : (
                <p className="text-sm text-cosmic-500 bg-cosmic-900 rounded-xl p-4 border border-cosmic-800">{t.noSymbols}</p>
              )}
            </div>

            {result.locked && <LockedPanel data={result} t={t} />}

            {it && (
              <>
                <div className="card-cosmic p-5">
                  <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">{t.readingHeading}</h3>
                  <p className="font-serif text-gold-300 text-base leading-relaxed italic mb-3">"{it.summary}"</p>
                  <p className="text-sm text-cosmic-200 leading-relaxed">{it.reading}</p>
                </div>

                {it.chart_note && (
                  <div className="card-cosmic p-5 border-l-4 border-violet-500/50">
                    <h3 className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">{t.chartHeading}</h3>
                    <p className="text-sm text-cosmic-200 leading-relaxed">{it.chart_note}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {asLines(it.guidance).length > 0 && (
                    <div className="card-cosmic p-4">
                      <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">{t.guidanceHeading}</h3>
                      {asLines(it.guidance).map((g, i) => (
                        <p key={i} className="text-sm text-cosmic-300 leading-relaxed mb-1.5 last:mb-0">{g}</p>
                      ))}
                    </div>
                  )}
                  {it.remedies?.length > 0 && (
                    <div className="card-cosmic p-4">
                      <h3 className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">{t.remediesHeading}</h3>
                      <ul className="space-y-1">
                        {it.remedies.map((r, i) => (
                          <li key={i} className="text-sm text-cosmic-300 flex gap-2"><span className="text-gold-500">•</span>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {it.affirmation && (
                  <div className="text-center py-4 border border-gold-600/20 rounded-xl bg-gold-500/5">
                    <p className="text-gold-400 font-serif text-base italic">✦ {it.affirmation} ✦</p>
                  </div>
                )}
              </>
            )}

            <p className="text-[11px] text-cosmic-600 text-center max-w-lg mx-auto pt-2">{t.footNote}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
