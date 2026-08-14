import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { appointments as apptApi, astrologers as astrologersApi, wallet as walletApi } from '../api';
import { useAuth } from '../context/AuthContext';

// Kept in step with ALLOWED_DURATIONS in backend/src/controllers/
// appointmentController.js, which is what actually decides what may be booked.
const DURATIONS  = [{ v:15, l:'15 min' }, { v:30, l:'30 min' }, { v:60, l:'1 hour' }, { v:90, l:'1.5 hours' }];
// Chat is gone from here because a chat consultation cannot be held: it is
// withdrawn in consultationController — it had an AI answering in the
// astrologer's name and the portal has no inbox to replace that with. Offering
// it here sold a session that could never be joined, and it was the default,
// so it was the likeliest booking anyone made.
//
// `voice` is what a seeker calls it; `audio` is what the consultation endpoint
// calls it. The name that travels to the server is set here so the two cannot
// drift, and joining maps it back.
const MODES      = [{ v:'voice', l:'🎙 Voice', d:'Audio call' }, { v:'video', l:'📹 Video', d:'Video call' }];
const CONCERNS   = ['Marriage & Relationships','Career & Business','Finance & Wealth','Health','Education','Children','Foreign Travel','Spiritual Guidance','General Reading'];
const STEP_LABELS= ['Date & Duration','Time Slot','Session Details','Confirm'];

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((l, i) => (
        <React.Fragment key={i}>
          <div className={`flex flex-col items-center gap-1 ${i <= step ? '' : 'opacity-40'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-gold-500 text-cosmic-950' : 'bg-cosmic-800 text-cosmic-500'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-[10px] text-cosmic-500 hidden sm:block whitespace-nowrap">{l}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 max-w-[40px] transition-all ${i < step ? 'bg-emerald-500' : 'bg-cosmic-800'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function getDatesAhead(n) {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
}

export default function BookAppointmentPage() {
  const { astrologerId } = useParams();
  const navigate          = useNavigate();
  const { user }          = useAuth();

  const [astrologer,   setAstrologer]   = useState(null);
  const [astLoading,   setAstLoading]   = useState(true);
  const [step,         setStep]         = useState(0);
  const [booking,      setBooking]      = useState(false);
  const [confirmed,    setConfirmed]    = useState(null);

  // Form state
  const [date,         setDate]         = useState(getDatesAhead(14)[1]); // default tomorrow
  const [duration,     setDuration]     = useState(60);
  const [mode,         setMode]         = useState('voice');
  const [slots,        setSlots]        = useState([]);
  const [working,      setWorking]      = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [concern,      setConcern]      = useState('');
  const [notes,        setNotes]        = useState('');
  // Null until known, so the review screen shows nothing rather than "₹0" to
  // somebody whose balance simply has not loaded.
  const [balance,      setBalance]      = useState(null);

  const dates = getDatesAhead(14);

  useEffect(() => {
    astrologersApi.getById(astrologerId)
      .then(r => setAstrologer(r.data))
      .catch(() => toast.error('Astrologer not found'))
      .finally(() => setAstLoading(false));
  }, [astrologerId]);

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const { data } = await apptApi.getSlots(astrologerId, { date, duration });
      setSlots(data.slots);
      setWorking(data.working !== false);
    } catch {
      setSlots([]);
      // A request that failed is not the same as a day off, and must not be
      // reported as one.
      setWorking(true);
    } finally {
      setSlotsLoading(false);
    }
  }, [astrologerId, date, duration]);

  useEffect(() => { if (step === 1) loadSlots(); }, [step, loadSlots]);

  // Fetched when the review screen opens rather than on mount, so it is the
  // balance at the moment of deciding — and a failure here leaves the line off
  // the screen rather than stopping the booking.
  useEffect(() => {
    if (step !== 3 || !user) return;
    walletApi.getBalance()
      .then(r => setBalance(parseFloat(r.data.balance)))
      .catch(() => setBalance(null));
  }, [step, user]);

  const amount = astrologer ? parseFloat(astrologer.price_per_min) * duration : 0;

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    try {
      const { data } = await apptApi.book({
        astrologer_id:    astrologerId,
        scheduled_at:     selectedSlot.start,
        duration_mins:    duration,
        mode,
        concern_category: concern || 'general',
        concern_notes:    notes,
      });
      setConfirmed(data);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (astLoading) return (
    <div className="relative z-10 min-h-screen pt-32 flex items-center justify-center">
      <div className="text-gold-400 animate-pulse font-serif text-xl">✦ Loading…</div>
    </div>
  );

  // Success screen
  if (step === 4 && confirmed) {
    const appt = confirmed.appointment;
    return (
      <div className="relative z-10 min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="card-cosmic p-8 max-w-md w-full text-center">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring', stiffness:200 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto mb-5">
            ✓
          </motion.div>
          <h2 className="text-gold-400 font-serif text-2xl mb-2">Appointment Confirmed!</h2>
          <p className="text-cosmic-300 text-sm mb-6">Your session with <strong className="text-cosmic-100">{confirmed.astrologer?.display_name || astrologer?.display_name}</strong> is booked.</p>

          <div className="card-cosmic p-4 mb-6 text-left space-y-2">
            {[
              ['Date & Time', new Date(appt.scheduled_at).toLocaleString('en-IN', { weekday:'short', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata' })],
              ['Duration',   `${appt.duration_mins} minutes`],
              ['Mode',       appt.mode.charAt(0).toUpperCase() + appt.mode.slice(1)],
              ['Amount',     `₹${parseFloat(appt.amount).toFixed(0)}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-cosmic-500">{l}</span>
                <span className="text-cosmic-200 font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Promised a reminder 15 minutes before. There is no reminder system
              — no email, no SMS, nothing scheduled — so it promised something
              nobody was going to send. Say what is actually true instead. */}
          <p className="text-cosmic-500 text-xs mb-6">
            Open My Appointments a few minutes before {new Date(appt.scheduled_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Kolkata' })} and a
            Join button will be waiting there.
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/my-appointments')} className="flex-1 btn-cosmic py-2.5 text-sm">My Appointments</button>
            <button onClick={() => navigate('/astrologers')} className="flex-1 py-2.5 text-sm border border-cosmic-700 text-cosmic-300 rounded-xl hover:bg-white/5 transition-colors">Browse More</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Astrologer header */}
        {astrologer && (
          <div className="card-cosmic p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center text-xl shrink-0">
              {astrologer.display_name?.[0] || '🔮'}
            </div>
            <div>
              <div className="text-cosmic-100 font-semibold">{astrologer.display_name}</div>
              <div className="text-xs text-cosmic-400">
                {astrologer.specialties?.slice(0,2).join(' • ')} · ₹{astrologer.price_per_min}/min
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-gold-400 font-bold">₹{amount.toFixed(0)}</div>
              <div className="text-xs text-cosmic-500">estimated</div>
            </div>
          </div>
        )}

        <StepDots step={step} />

        <AnimatePresence mode="wait">

          {/* STEP 0 — Date & Duration */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} className="space-y-5">
              <div className="card-cosmic p-5">
                <h3 className="text-gold-400 font-serif mb-4">Select Date</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {dates.map(d => (
                    <button key={d} onClick={() => setDate(d)}
                      className={`p-2.5 rounded-xl text-center text-xs transition-all border ${date === d ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold' : 'border-cosmic-700 text-cosmic-400 hover:border-gold-500/30 hover:text-cosmic-200'}`}>
                      {formatDate(d)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-cosmic p-5">
                <h3 className="text-gold-400 font-serif mb-4">Session Duration</h3>
                {/* Four across is too tight on a phone, so they wrap to two. */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DURATIONS.map(d => (
                    <button key={d.v} onClick={() => setDuration(d.v)}
                      className={`py-3 rounded-xl text-sm transition-all border ${duration === d.v ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold' : 'border-cosmic-700 text-cosmic-400 hover:border-gold-500/30'}`}>
                      <div>{d.l}</div>
                      {astrologer && <div className="text-xs opacity-70 mt-0.5">₹{(parseFloat(astrologer.price_per_min) * d.v).toFixed(0)}</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-cosmic p-5">
                <h3 className="text-gold-400 font-serif mb-4">Consultation Mode</h3>
                <div className="flex gap-3">
                  {MODES.map(m => (
                    <button key={m.v} onClick={() => setMode(m.v)}
                      className={`flex-1 py-3 rounded-xl text-xs text-center transition-all border ${mode === m.v ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold' : 'border-cosmic-700 text-cosmic-400 hover:border-gold-500/30'}`}>
                      <div className="text-base mb-0.5">{m.l.split(' ')[0]}</div>
                      <div>{m.l.split(' ').slice(1).join(' ')}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{m.d}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(1)} className="btn-cosmic w-full py-3 text-sm font-semibold">
                View Available Slots →
              </button>
            </motion.div>
          )}

          {/* STEP 1 — Time Slot */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}>
              <div className="card-cosmic p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gold-400 font-serif">Available Slots</h3>
                  <span className="text-xs text-cosmic-400">{formatDate(date)} · {duration} min</span>
                </div>

                {slotsLoading ? (
                  <div className="text-center py-8 text-gold-400 animate-pulse font-serif">✦ Loading slots…</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((s, i) => (
                      <button key={i} disabled={!s.available}
                        onClick={() => setSelectedSlot(s)}
                        className={`py-2.5 rounded-xl text-xs text-center transition-all border ${
                          !s.available
                            ? 'border-cosmic-800 text-cosmic-700 bg-cosmic-900/50 cursor-not-allowed'
                            : selectedSlot?.start === s.start
                            ? 'bg-gold-500/20 border-gold-500/60 text-gold-400 font-semibold'
                            : 'border-cosmic-700 text-cosmic-300 hover:border-gold-500/30 hover:text-gold-400'
                        }`}>
                        {s.label}
                        {!s.available && <div className="text-[9px] text-cosmic-700">Booked</div>}
                      </button>
                    ))}
                  </div>
                )}

                {/* An astrologer with the day off and one whose day is fully
                    booked both leave an empty grid, and they are not the same
                    thing to somebody deciding when to come back. */}
                {!slotsLoading && slots.filter(s => s.available).length === 0 && (
                  <p className="text-cosmic-500 text-sm text-center py-4">
                    {working === false
                      ? `${astrologer?.display_name || 'This astrologer'} does not take appointments on this day. Please pick another.`
                      : 'No available slots on this date. Please pick another day.'}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 text-sm border border-cosmic-700 text-cosmic-400 rounded-xl hover:bg-white/5 transition-colors">← Back</button>
                <button onClick={() => setStep(2)} disabled={!selectedSlot}
                  className="flex-1 btn-cosmic py-3 text-sm font-semibold disabled:opacity-40">
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Session details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}>
              <div className="card-cosmic p-5 mb-5 space-y-4">
                <h3 className="text-gold-400 font-serif">Session Details</h3>

                <div>
                  <label className="block text-xs text-cosmic-400 mb-2">Concern Area</label>
                  <div className="flex flex-wrap gap-2">
                    {CONCERNS.map(c => (
                      <button key={c} onClick={() => setConcern(c)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${concern === c ? 'bg-gold-500/20 border-gold-500/60 text-gold-400' : 'border-cosmic-700 text-cosmic-400 hover:border-gold-500/30 hover:text-cosmic-200'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cosmic-400 mb-2">
                    Pre-session Notes <span className="text-cosmic-600">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe your question or situation briefly to help the astrologer prepare…"
                    rows={4}
                    maxLength={500}
                    className="input-cosmic w-full text-sm resize-none"
                  />
                  <div className="text-right text-xs text-cosmic-600 mt-1">{notes.length}/500</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm border border-cosmic-700 text-cosmic-400 rounded-xl hover:bg-white/5 transition-colors">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 btn-cosmic py-3 text-sm font-semibold">Review Booking →</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}>
              <div className="card-cosmic p-5 mb-5 space-y-3">
                <h3 className="text-gold-400 font-serif mb-4">Review & Confirm</h3>

                {[
                  ['Astrologer', astrologer?.display_name],
                  ['Date',       formatDate(date)],
                  ['Time',       selectedSlot?.label + ' IST'],
                  ['Duration',   `${duration} minutes`],
                  ['Mode',       mode.charAt(0).toUpperCase() + mode.slice(1)],
                  ['Concern',    concern || 'General Reading'],
                  ['Amount',     `₹${amount.toFixed(0)}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-start justify-between py-2 border-b border-gold-500/10 last:border-0">
                    <span className="text-xs text-cosmic-500">{l}</span>
                    <span className="text-sm text-cosmic-200 font-medium text-right max-w-[60%]">{v}</span>
                  </div>
                ))}

                {notes && (
                  <div className="pt-2">
                    <div className="text-xs text-cosmic-500 mb-1">Your Notes</div>
                    <p className="text-xs text-cosmic-400 leading-relaxed">{notes}</p>
                  </div>
                )}
              </div>

              {/* This said "₹X will be deducted from your wallet at the time of
                  the session", which nothing did — booking has never taken a
                  paisa, and there is no code that charges an appointment. What
                  actually happens is that the session bills by the minute like
                  any other consultation, so say that, and say it against the
                  balance they have. */}
              <p className="text-xs text-cosmic-500 text-center mb-2">
                Nothing is charged now. The session is billed from your wallet at
                ₹{astrologer?.price_per_min} a minute while it runs, so a full{' '}
                {duration} minutes comes to ₹{amount.toFixed(0)}.
              </p>
              {balance !== null && (
                <p className={`text-xs text-center mb-4 ${balance < amount ? 'text-amber-300' : 'text-cosmic-500'}`}>
                  Your wallet holds ₹{balance.toFixed(0)}
                  {balance < amount && (
                    <> — enough for about {Math.floor(balance / (parseFloat(astrologer?.price_per_min) || 1))} minutes.{' '}
                      <Link to="/wallet" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">Top up</Link>
                      {' '}before the session, or it will end when the balance runs out.
                    </>
                  )}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 text-sm border border-cosmic-700 text-cosmic-400 rounded-xl hover:bg-white/5 transition-colors">← Back</button>
                <button onClick={handleBook} disabled={booking}
                  className="flex-1 btn-cosmic py-3 text-sm font-semibold disabled:opacity-60">
                  {booking ? '✦ Booking…' : 'Confirm Appointment'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
