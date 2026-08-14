const { Op } = require('sequelize');
const { Appointment, Astrologer, User } = require('../models');

const availability = require('../services/availabilityService');

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toISTMidnight(dateStr) {
  // dateStr: 'YYYY-MM-DD'
  return new Date(dateStr + 'T00:00:00+05:30');
}

// What a seeker may book. The booking page shows the same four; this list is
// the one that decides, because the page can be edited by whoever is holding
// the browser.
const ALLOWED_DURATIONS = [15, 30, 60, 90];
const DEFAULT_DURATION  = 60;

// What a session can be booked as. `voice` is the seeker's word for what the
// consultation endpoint calls `audio`; the booking page maps between them.
const BOOKABLE_MODES = ['voice', 'video'];

const cleanDuration = (v) => {
  const n = parseInt(v);
  return ALLOWED_DURATIONS.includes(n) ? n : DEFAULT_DURATION;
};

// `window` is the astrologer's working hours for this date, or null on a day
// she does not work — in which case there is nothing to offer.
function generateSlots(dateStr, durationMins, window) {
  if (!window) return [];
  const openMin  = availability.toMinutes(window.from);
  const closeMin = availability.toMinutes(window.to);
  if (openMin === null || closeMin === null || closeMin <= openMin) return [];

  const slots = [];
  // Offer a short session on its own granularity: a 15-minute reading starting
  // only on the half hour would leave the other 15 minutes unbookable. Anything
  // an hour or longer still starts on the hour.
  const step = Math.min(durationMins, 60);
  const base = toISTMidnight(dateStr);

  for (let m = openMin; m + durationMins <= closeMin; m += step) {
    const slotStart = new Date(base.getTime() + m * 60000);
    slots.push({
      start: slotStart.toISOString(),
      label: slotStart.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Kolkata' }),
    });
  }
  return slots;
}

// GET /appointments/slots/:astrologerId?date=YYYY-MM-DD&duration=60
exports.getSlots = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const dateStr    = req.query.date || new Date().toISOString().slice(0, 10);
    const duration   = cleanDuration(req.query.duration);

    const astrologer = await Astrologer.findByPk(astrologerId);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

    const dayStart = toISTMidnight(dateStr);
    const dayEnd   = new Date(dayStart.getTime() + 24 * 3600000);

    // Fetch existing confirmed/pending appointments for that day
    const booked = await Appointment.findAll({
      where: {
        astrologer_id: astrologerId,
        scheduled_at:  { [Op.gte]: dayStart, [Op.lt]: dayEnd },
        status:        { [Op.notIn]: ['cancelled'] }
      },
      attributes: ['scheduled_at', 'duration_mins']
    });

    // Availability is an overlap test, not a matching start time.
    //
    // This used to compare start instants, so an hour booked at 10:00 left
    // 10:30 showing as free to anyone booking half an hour — the astrologer
    // double-booked and neither seeker was told. Sessions of 15 minutes make
    // that near-certain rather than merely possible, since four of them fit
    // inside one booked hour.
    const bookedRanges = booked.map(a => {
      const start = new Date(a.scheduled_at).getTime();
      return [start, start + (a.duration_mins || DEFAULT_DURATION) * 60000];
    });
    const now = Date.now();

    const window = availability.windowFor(astrologer.availability, dateStr);

    const slots = generateSlots(dateStr, duration, window).map(s => {
      const start = new Date(s.start).getTime();
      const end   = start + duration * 60000;
      const clash = bookedRanges.some(([bStart, bEnd]) => start < bEnd && end > bStart);
      return { ...s, available: !clash && start > now };
    });

    res.json({
      astrologer_id: astrologerId,
      date: dateStr,
      duration,
      slots,
      // So the page can say "not working this day" rather than showing an empty
      // box that looks like a page that failed to load.
      working: !!window,
      hours: window,
      astrologer: { display_name: astrologer.display_name, price_per_min: astrologer.price_per_min },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /appointments/book
exports.bookAppointment = async (req, res) => {
  try {
    const { astrologer_id, scheduled_at, mode = 'voice', concern_category, concern_notes } = req.body;
    if (!astrologer_id || !scheduled_at) return res.status(400).json({ error: 'astrologer_id and scheduled_at are required' });

    // Only modes that can actually be held. Chat consultations are withdrawn in
    // consultationController, so a chat appointment was a booking nobody could
    // ever join — and it was this endpoint's default.
    if (!BOOKABLE_MODES.includes(mode)) {
      return res.status(400).json({
        error: `A session can be booked as ${BOOKABLE_MODES.join(' or ')}.`,
      });
    }

    // A length the booking page never offers is not bookable by hand either.
    // Unlike the slots list, which defaults quietly, this refuses: the amount
    // is worked out from the duration, so silently booking an hour against a
    // request for something else charges for a session nobody asked for.
    const duration_mins = req.body.duration_mins === undefined
      ? DEFAULT_DURATION
      : parseInt(req.body.duration_mins);
    if (!ALLOWED_DURATIONS.includes(duration_mins)) {
      return res.status(400).json({
        error: `A session must be one of ${ALLOWED_DURATIONS.join(', ')} minutes.`,
      });
    }

    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate)) return res.status(400).json({ error: 'scheduled_at is not a valid date' });
    if (scheduledDate <= new Date()) return res.status(400).json({ error: 'Cannot book a slot in the past' });

    // The slot has to be free for the whole session, not merely unclaimed at
    // the minute it starts. Booking half an hour at 10:30 against an hour
    // already booked at 10:00 used to pass, because only the start instants
    // were compared — the astrologer found out by being in two places at once.
    const sessionStart = scheduledDate;
    const sessionEnd   = new Date(scheduledDate.getTime() + duration_mins * 60000);

    // Anything starting within a day either side is close enough to overlap;
    // the exact test is done below, in one place, on both sides.
    const sameDay = await Appointment.findAll({
      where: {
        astrologer_id,
        status: { [Op.notIn]: ['cancelled'] },
        scheduled_at: {
          [Op.gte]: new Date(sessionStart.getTime() - 24 * 3600000),
          [Op.lt]:  new Date(sessionEnd.getTime()   + 24 * 3600000),
        },
      },
      attributes: ['scheduled_at', 'duration_mins'],
    });
    const conflict = sameDay.some(a => {
      const bStart = new Date(a.scheduled_at).getTime();
      const bEnd   = bStart + (a.duration_mins || DEFAULT_DURATION) * 60000;
      return sessionStart.getTime() < bEnd && sessionEnd.getTime() > bStart;
    });
    if (conflict) return res.status(409).json({ error: 'This slot is no longer available. Please choose another time.' });

    const astrologer = await Astrologer.findByPk(astrologer_id);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

    // The session has to fall inside the hours she actually works. The slots
    // list already only offers times that do, but the list is a suggestion made
    // to a browser and this is the decision.
    const dateStr = new Date(sessionStart.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
    const window  = availability.windowFor(astrologer.availability, dateStr);
    if (!window) {
      return res.status(409).json({ error: `${astrologer.display_name} is not taking appointments that day.` });
    }
    const startMin = Math.round((sessionStart.getTime() + IST_OFFSET_MS) / 60000) % 1440;
    const openMin  = availability.toMinutes(window.from);
    const closeMin = availability.toMinutes(window.to);
    if (startMin < openMin || startMin + duration_mins > closeMin) {
      return res.status(409).json({
        error: `${astrologer.display_name} takes appointments between ${window.from} and ${window.to} that day.`,
      });
    }

    const amount = parseFloat(astrologer.price_per_min) * duration_mins;

    const appointment = await Appointment.create({
      user_id:          req.user.id,
      astrologer_id,
      scheduled_at:     scheduledDate,
      duration_mins,
      mode,
      concern_category: concern_category || 'general',
      concern_notes:    concern_notes || '',
      status:           'confirmed',
      amount,
    });

    res.status(201).json({ appointment, astrologer: { display_name: astrologer.display_name, photo_url: astrologer.photo_url } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /appointments/my
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { user_id: req.user.id },
      // `id` and `is_online` so the seeker can actually start the session from
      // the card when the time comes, and be told when the astrologer is not
      // there yet rather than being bounced by the server.
      include: [{ model: Astrologer, as: 'astrologer',
        attributes: ['id','display_name','photo_url','specialties','price_per_min','is_online'] }],
      order: [['scheduled_at', 'DESC']],
      limit: 50
    });

    // An appointment stays upcoming until it has *finished*, not until it has
    // started. Splitting on the start time moved a session into Past the moment
    // it was due, so a seeker arriving two minutes late found it filed under
    // history with no way back into it.
    const now = Date.now();
    const endOf = (a) => new Date(a.scheduled_at).getTime() + (a.duration_mins || 60) * 60000;

    // A session that has been given is over whatever the clock says — ending a
    // half-hour booking after ten minutes should not leave it sitting under
    // Upcoming for the remaining twenty.
    const done     = (a) => a.status === 'cancelled' || a.status === 'completed';
    const upcoming = appointments.filter(a => !done(a) && endOf(a) > now);
    const past     = appointments.filter(a => done(a) || endOf(a) <= now);
    res.json({ upcoming, past });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (appt.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });

    const hoursUntil = (new Date(appt.scheduled_at) - new Date()) / 3600000;
    if (hoursUntil < 1) return res.status(400).json({ error: 'Cannot cancel within 1 hour of appointment' });

    await appt.update({ status: 'cancelled', cancellation_reason: req.body.reason || 'User cancelled' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /appointments/astrologer/:astrologerId  (astrologer's upcoming bookings — for future astrologer dashboard)
exports.getAstrologerAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        astrologer_id: req.params.astrologerId,
        scheduled_at:  { [Op.gte]: new Date() },
        status:        { [Op.notIn]: ['cancelled'] }
      },
      include: [{ model: User, as: 'user', attributes: ['name','email','phone'] }],
      order: [['scheduled_at', 'ASC']],
      limit: 50
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
