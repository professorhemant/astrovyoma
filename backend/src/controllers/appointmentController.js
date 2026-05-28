const { Op } = require('sequelize');
const { Appointment, Astrologer, User } = require('../models');

// Working hours: 8 AM – 9 PM IST, 1-hour slots
const SLOT_START_HOUR = 8;   // 08:00 IST
const SLOT_END_HOUR   = 21;  // 21:00 IST (last slot starts 20:00)
const IST_OFFSET_MS   = 5.5 * 60 * 60 * 1000;

function toISTMidnight(dateStr) {
  // dateStr: 'YYYY-MM-DD'
  return new Date(dateStr + 'T00:00:00+05:30');
}

function generateSlots(dateStr, durationMins) {
  const slots = [];
  const step  = durationMins <= 30 ? 30 : 60;
  const base  = toISTMidnight(dateStr);

  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h += step / 60) {
    const slotStart = new Date(base.getTime() + h * 3600000);
    const slotEnd   = new Date(slotStart.getTime() + durationMins * 60000);
    if (slotEnd <= new Date(base.getTime() + SLOT_END_HOUR * 3600000)) {
      slots.push({
        start: slotStart.toISOString(),
        label: slotStart.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Kolkata' }),
      });
    }
  }
  return slots;
}

// GET /appointments/slots/:astrologerId?date=YYYY-MM-DD&duration=60
exports.getSlots = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const dateStr    = req.query.date || new Date().toISOString().slice(0, 10);
    const duration   = parseInt(req.query.duration) || 60;

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

    const bookedStarts = new Set(booked.map(a => new Date(a.scheduled_at).toISOString()));
    const now          = new Date();

    const allSlots = generateSlots(dateStr, duration);
    const slots    = allSlots.map(s => ({
      ...s,
      available: !bookedStarts.has(s.start) && new Date(s.start) > now,
    }));

    res.json({ astrologer_id: astrologerId, date: dateStr, duration, slots, astrologer: { display_name: astrologer.display_name, price_per_min: astrologer.price_per_min } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /appointments/book
exports.bookAppointment = async (req, res) => {
  try {
    const { astrologer_id, scheduled_at, duration_mins = 60, mode = 'chat', concern_category, concern_notes } = req.body;
    if (!astrologer_id || !scheduled_at) return res.status(400).json({ error: 'astrologer_id and scheduled_at are required' });

    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate <= new Date()) return res.status(400).json({ error: 'Cannot book a slot in the past' });

    // Check slot is still free
    const conflict = await Appointment.findOne({
      where: {
        astrologer_id,
        scheduled_at: scheduledDate,
        status: { [Op.notIn]: ['cancelled'] }
      }
    });
    if (conflict) return res.status(409).json({ error: 'This slot is no longer available. Please choose another time.' });

    const astrologer = await Astrologer.findByPk(astrologer_id);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

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
      include: [{ model: Astrologer, as: 'astrologer', attributes: ['display_name','photo_url','specialties','price_per_min'] }],
      order: [['scheduled_at', 'DESC']],
      limit: 50
    });
    const now = new Date();
    const upcoming = appointments.filter(a => new Date(a.scheduled_at) > now && a.status !== 'cancelled');
    const past     = appointments.filter(a => new Date(a.scheduled_at) <= now || a.status === 'cancelled');
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
