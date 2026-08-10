import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SwastikBorder from '../components/SwastikBorder';
import { content as contentApi } from '../api';

// The onboarding kit an astrologer reads before applying. Every card, step and
// question is a list in the admin, and every line of writing is a setting, so
// the terms can be changed without a deploy — which matters here more than
// anywhere else on the site, because these are commitments people will hold us
// to. The constants below are only the fallback: if the content request fails
// the page still reads in full rather than showing a set of empty boxes.
//
// Colours come from a fixed set for the same reason as the About page —
// Tailwind only ships classes it can see written out, so a class assembled at
// runtime would arrive with no styling at all.
const TONES = {
  gold:    { grad: 'from-gold-600/20 to-gold-400/5',       border: 'border-gold-500/30' },
  violet:  { grad: 'from-violet-600/20 to-violet-400/5',   border: 'border-violet-500/30' },
  emerald: { grad: 'from-emerald-600/20 to-emerald-400/5', border: 'border-emerald-500/30' },
  blue:    { grad: 'from-blue-600/20 to-blue-400/5',       border: 'border-blue-500/30' },
};
const toneOf = (t) => TONES[t] || TONES.gold;

const CRITERIA = [
  { emoji: '📿', title: 'At least 3 years of practice', desc: 'Consulting real people, not only study. Longer practice raises the per-minute rate you can ask for.' },
  { emoji: '🎓', title: 'A tradition you can name', desc: 'Vedic, KP, Nadi, Lal Kitab, numerology, Vastu, tarot — guru-shishya lineage counts as much as an institutional certificate.' },
  { emoji: '🗣️', title: 'Fluent in Hindi or English', desc: 'Any further language you speak widens the seekers matched to you and is shown on your profile.' },
  { emoji: '📱', title: 'A smartphone and steady internet', desc: 'Consultations run over chat and call in the browser. Nothing to install.' },
  { emoji: '☮️', title: 'No fear-based predictions', desc: 'A hard rule, not a preference. A difficult period is delivered with the remedy beside it, never as doom to be paid away.' },
];

const DOCUMENTS = [
  { title: 'Photo ID (Aadhaar, PAN or passport)', why: 'Confirms you are who the profile says you are.', required: true },
  { title: 'PAN card', why: 'Needed before any payout can be released.', required: true },
  { title: 'Bank account details or UPI id', why: 'Where your earnings are sent.', required: true },
  { title: 'Certificates or proof of lineage', why: 'Shown on your profile as credentials. Strengthens an application without being compulsory.', required: false },
  { title: 'A clear photograph of yourself', why: 'Your profile picture. Seekers choose an astrologer they can see.', required: true },
];

const STEPS = [
  { title: 'Send the application', timing: '15 minutes', desc: 'The form on Join as Astrologer asks for your details, your practice and the per-minute rate you want. Nothing is charged and nothing is committed.' },
  { title: 'We read it', timing: 'Within 3 working days', desc: 'A person reads every application. If your practice fits AstroVyoma you are called; if not, you are told plainly rather than left waiting.' },
  { title: 'A conversation', timing: 'About 30 minutes', desc: 'A call with a senior astrologer on the panel. Part chart discussion, part how you handle a frightened client. It is not an examination.' },
  { title: 'Papers and verification', timing: '2 to 4 working days', desc: 'ID, PAN and bank details are checked. Certificates you supply are added to your profile as credentials.' },
  { title: 'Your profile goes up', timing: '1 working day', desc: 'Photo, biography, disciplines, languages and rate. You approve how it reads before it is published.' },
  { title: 'Go online and take your first consultation', timing: 'Same day', desc: 'Switch yourself online in the Pandit Portal and seekers can reach you. Go offline whenever you want; nobody is penalised for being unavailable.' },
];

const KIT = [
  { emoji: '🪪', tone: 'gold', title: 'Your own profile page', desc: 'A page on AstroVyoma carrying your photograph, biography, disciplines, languages, credentials and rate — a link you can share anywhere as your own.' },
  { emoji: '🎛️', tone: 'violet', title: 'The Pandit Portal', desc: 'Your working screen. Switch online or offline in one tap, see who is waiting, and watch what you have earned build up through the day.' },
  { emoji: '💬', tone: 'blue', title: 'Chat and call consultations', desc: 'Both run in the browser with per-minute billing handled for you. Your personal number is never shown to a seeker.' },
  { emoji: '📅', tone: 'emerald', title: 'Appointments and pooja bookings', desc: 'Seekers can book a slot ahead of time or commission a pooja. Both arrive in your portal with the birth details already filled in.' },
  { emoji: '📊', tone: 'gold', title: 'An earnings record', desc: 'Every consultation listed with its minutes, what the seeker paid and what came to you. Nothing about your payout is hidden from you.' },
  { emoji: '🤝', tone: 'violet', title: 'The panel behind you', desc: 'A complex chart can be taken to the wider panel for a second reading. You are joined to a guild, not left alone with a queue.' },
];

const CONDUCT = [
  { title: 'Never trade on fear', desc: 'No predictions of death, no curses, no danger that can only be lifted by paying more. A hard period is named together with what can be done about it.' },
  { title: 'Never sell a remedy you profit from privately', desc: 'Gemstones and rudraksha are recommended on merit. If a seeker wants to buy, point them at the Astro Mall or anywhere they like — not at yourself.' },
  { title: 'Keep what you are told', desc: 'Birth details and what a seeker tells you stay between you and them. Not repeated, not reused, not discussed elsewhere.' },
  { title: 'Say when you do not know', desc: 'An honest "the chart does not show this clearly" is respected here. A confident invention is not.' },
  { title: 'Keep the hours you advertise', desc: 'Being offline is fine at any time. Showing yourself online and not answering is not — it costs the seeker their wait.' },
  { title: 'Consult off the platform and it ends', desc: 'Taking a seeker you met here to a private arrangement removes you from the panel. It is the one thing there is no second conversation about.' },
];

const FAQS = [
  { question: 'Does it cost anything to join?', answer: 'No. There is no joining fee, no registration charge and no subscription. AstroVyoma earns only its share of a consultation you have actually given.' },
  { question: 'Do I have to work fixed hours?', answer: 'No. You are visible to seekers only while you have set yourself online, and you can go offline at any moment. There is no minimum.' },
  { question: 'Can I keep my own clients and my own practice?', answer: 'Yes. Your practice outside AstroVyoma is entirely yours. The one rule is that a seeker who came to you through the platform stays on the platform.' },
  { question: 'Who decides my rate?', answer: 'You propose a per-minute rate when you apply and it is agreed with you before your profile goes up. You can ask for it to be changed later as your reviews build.' },
  { question: 'What if a seeker disputes a consultation?', answer: 'It is read by a person, both sides are heard, and you are told the outcome. A refund is not taken out of your earnings without you being told why.' },
  { question: 'What happens if my application is turned down?', answer: 'You are told, and told why. You are welcome to apply again once the reason has been addressed — most often it is years of practice.' },
];

// ── Animated star field ───────────────────────────────────────────────────────
function MiniStars() {
  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: (i * 9.7 + 7.3) % 100,
    y: (i * 13.1 + 3.7) % 100,
    size: ((i * 2.3) % 2) + 0.5,
    delay: (i * 0.4) % 6,
    dur: 2 + (i * 0.19) % 3.5,
    op: 0.3 + (i * 0.06) % 0.6,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.op }}
          animate={{ opacity: [s.op * 0.2, s.op, s.op * 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

function SectionHead({ heading, intro }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12">
      <motion.h2 {...fadeUp(0)} className="font-serif text-3xl md:text-4xl text-gold-400 mb-4">
        {heading}
      </motion.h2>
      {intro && (
        <motion.p {...fadeUp(0.08)} className="text-gray-400 leading-relaxed">{intro}</motion.p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AstrologerOnboardingPage() {
  const [cms, setCms] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    contentApi.bundle(['onboarding_criteria', 'onboarding_documents', 'onboarding_steps',
                       'onboarding_kit', 'onboarding_conduct', 'onboarding_faqs'])
      .then(r => { setCms(r.data.lists); setCfg(r.data.settings); })
      .catch(() => {});
  }, []);

  // An empty list means "not loaded" or "emptied by mistake", and either way the
  // page reads better with what it shipped with than with a gap.
  const pick = (key, fallback) => (cms?.[key]?.length ? cms[key] : fallback);
  const criteria  = pick('onboarding_criteria',  CRITERIA);
  const documents = pick('onboarding_documents', DOCUMENTS);
  const steps     = pick('onboarding_steps',     STEPS);
  const kit       = pick('onboarding_kit',       KIT);
  const conduct   = pick('onboarding_conduct',   CONDUCT);
  const faqs      = pick('onboarding_faqs',      FAQS);

  // A field the admin has cleared should show as cleared, so only an absent
  // setting falls back.
  const t = (key, fallback) => (cfg?.[key] === undefined || cfg?.[key] === null ? fallback : cfg[key]);

  return (
    <div className="relative min-h-screen bg-cosmic-950 overflow-x-hidden">
      <SwastikBorder />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-4 md:px-8 lg:px-16 overflow-hidden">
        <MiniStars />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.p {...fadeUp(0)} className="text-gold-500/60 text-xs tracking-[0.25em] uppercase mb-4">
            {t('obEyebrow', '✦ For Astrologers')}
          </motion.p>

          <motion.h1 {...fadeUp(0.08)}
            className="font-serif text-4xl md:text-6xl text-gold-400 leading-tight mb-6"
            style={{ textShadow: '0 0 60px rgba(201,168,76,0.35)' }}>
            {t('obTitle', 'The Astrologer’s Kit')}
            {t('obTitleTwo', 'Everything Before You Join') && (
              <><br /><span className="text-white/90">{t('obTitleTwo', 'Everything Before You Join')}</span></>
            )}
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            {t('obIntro', 'What we ask of you, what you get in return, and exactly how joining works — set out in full before you fill in a single form.')}
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/join-as-astrologer" className="btn-gold px-8 py-3 text-sm font-semibold">
              {t('obCtaButton', 'Apply to Join')} →
            </Link>
            <Link to="/astrologers" className="btn-outline-gold px-8 py-3 text-sm">
              See the Panel
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── What you earn ─────────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0)}
            className="rounded-3xl border border-gold-500/30 bg-gradient-to-br from-gold-600/15 to-gold-400/5 px-6 py-12 md:px-14 text-center">
            <p className="text-gold-500/70 text-xs tracking-[0.2em] uppercase mb-3">
              {t('obEarnHeading', 'What You Earn')}
            </p>
            <p className="font-serif text-6xl md:text-7xl text-gold-400 mb-4"
               style={{ textShadow: '0 0 50px rgba(201,168,76,0.4)' }}>
              {t('obEarnShare', '60–75%')}
            </p>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              {t('obEarnIntro', 'Your share of every consultation, before anything else is taken.')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="rounded-2xl bg-cosmic-900/60 border border-gold-600/20 px-5 py-4">
                <p className="text-gray-500 text-[11px] uppercase tracking-wider mb-1">Paid out</p>
                <p className="text-gray-200 text-sm">{t('obPayoutDay', 'Every Monday, for the week before')}</p>
              </div>
              <div className="rounded-2xl bg-cosmic-900/60 border border-gold-600/20 px-5 py-4">
                <p className="text-gray-500 text-[11px] uppercase tracking-wider mb-1">Smallest payout</p>
                <p className="text-gray-200 text-sm">{t('obPayoutMin', '₹500')}</p>
              </div>
            </div>

            <p className="text-gray-500 text-xs max-w-2xl mx-auto mt-6 leading-relaxed">
              {t('obPayoutNote', 'Paid by bank transfer or UPI to the account you verified. Nothing is deducted beyond the platform share and whatever tax the law requires.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Who we are looking for ────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <SectionHead
            heading={t('obCriteriaHeading', 'Who We Are Looking For')}
            intro={t('obCriteriaIntro', 'Meet these and you should expect to be accepted. We would rather turn away a good astrologer than take one who trades on fear.')}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {criteria.map((c, i) => (
              <motion.div key={c.row_id || c.title} {...fadeUp(i * 0.05)}
                className="card-cosmic px-6 py-6">
                <div className="text-3xl mb-3">{c.emoji}</div>
                <h3 className="text-gold-400 font-semibold mb-2 text-sm">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How joining works ─────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16 bg-cosmic-900/20">
        <div className="max-w-3xl mx-auto">
          <SectionHead
            heading={t('obStepsHeading', 'How Joining Works')}
            intro={t('obStepsIntro', 'Six steps, about a fortnight end to end, and a person at every one of them.')}
          />
          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div key={s.row_id || s.title} {...fadeUp(i * 0.05)}
                className="flex gap-5 card-cosmic px-6 py-5">
                <div className="shrink-0 w-9 h-9 rounded-full border border-gold-500/40 bg-gold-600/10
                                flex items-center justify-center text-gold-400 font-serif text-sm">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                    <h3 className="text-gold-400 font-semibold text-sm">{s.title}</h3>
                    {s.timing && (
                      <span className="text-[11px] text-gray-500 border border-gold-600/20 rounded-full px-2.5 py-0.5">
                        {s.timing}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get ──────────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <SectionHead
            heading={t('obKitHeading', 'What You Get on Day One')}
            intro={t('obKitIntro', 'The whole kit, handed over the moment your profile goes up. There is nothing further to buy.')}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kit.map((k, i) => {
              const tone = toneOf(k.tone);
              return (
                <motion.div key={k.row_id || k.title} {...fadeUp(i * 0.05)}
                  className={`rounded-2xl border ${tone.border} bg-gradient-to-br ${tone.grad} px-6 py-6`}>
                  <div className="text-3xl mb-3">{k.emoji}</div>
                  <h3 className="text-gold-400 font-semibold mb-2 text-sm">{k.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{k.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Papers to keep ready ──────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16 bg-cosmic-900/20">
        <div className="max-w-3xl mx-auto">
          <SectionHead
            heading={t('obDocsHeading', 'Papers to Keep Ready')}
            intro={t('obDocsIntro', 'Nothing is asked for until after the conversation, but having these to hand shortens verification to a couple of days.')}
          />
          <div className="space-y-3">
            {documents.map((d, i) => (
              <motion.div key={d.row_id || d.title} {...fadeUp(i * 0.04)}
                className="flex items-start gap-4 card-cosmic px-5 py-4">
                <span className="text-gold-400 mt-0.5 shrink-0">{d.required ? '✔' : '○'}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="text-gray-200 text-sm font-medium">{d.title}</h3>
                    {!d.required && <span className="text-[11px] text-gray-500">optional</span>}
                  </div>
                  {d.why && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{d.why}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we ask of you ────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <SectionHead
            heading={t('obConductHeading', 'What We Ask of You')}
            intro={t('obConductIntro', 'The code every astrologer on the panel agrees to. It is short, and it is the whole of it.')}
          />
          <div className="space-y-3">
            {conduct.map((c, i) => (
              <motion.div key={c.row_id || c.title} {...fadeUp(i * 0.04)}
                className="card-cosmic px-6 py-5 border-l-2 border-l-gold-500/40">
                <h3 className="text-gold-400 font-semibold text-sm mb-1.5">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questions ─────────────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 md:px-8 lg:px-16 bg-cosmic-900/20">
        <div className="max-w-3xl mx-auto">
          <SectionHead heading={t('obFaqHeading', 'Questions Astrologers Ask')} />
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <motion.div key={f.row_id || f.question} {...fadeUp(i * 0.04)} className="card-cosmic overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                  <span className="text-gray-200 text-sm font-medium">{f.question}</span>
                  <span className={`text-gold-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <p className="px-6 pb-5 -mt-1 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16 overflow-hidden">
        <MiniStars />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.h2 {...fadeUp(0)} className="font-serif text-3xl md:text-4xl text-gold-400 mb-5">
            {t('obCtaHeading', 'Ready to Join the Panel?')}
          </motion.h2>
          <motion.p {...fadeUp(0.08)} className="text-gray-300 leading-relaxed mb-8">
            {t('obCtaText', 'The application takes about fifteen minutes and commits you to nothing. If your practice fits AstroVyoma you will hear from a person within three working days.')}
          </motion.p>
          <motion.div {...fadeUp(0.14)}>
            <Link to="/join-as-astrologer" className="btn-gold px-10 py-3.5 text-sm font-semibold inline-block">
              {t('obCtaButton', 'Apply to Join')} →
            </Link>
          </motion.div>
          <motion.p {...fadeUp(0.2)} className="text-gray-500 text-xs mt-6 leading-relaxed">
            {t('obCtaHelp', 'Would rather ask something first? Write to us and an astrologer on the panel will answer, not a sales desk.')}
          </motion.p>
        </div>
      </section>
    </div>
  );
}
