// What an astrologer is owed, and what the platform kept.
//
// Until now a consultation debited the seeker's wallet and stopped there: the
// astrologer's id was passed into the debit and never used, no code read the
// commission setting, and the Pandit Portal had nothing to show. This is the
// other half — the record of what each consultation earned whoever gave it.
//
// Nothing here moves money. It writes down what is owed, which is what a weekly
// payout run and the portal's earnings screen both read. Paying it out is a
// bank transfer somebody makes; marking those rows paid is markPaid below.

const { AstrologerEarning, Consultation, User } = require('../models');
const { Op } = require('sequelize');
const settingsService = require('./settingsService');

// Money is held to the paisa. The platform's share is the figure that gets
// rounded, and the astrologer's share is whatever is left, so the two always
// add back up to exactly what the seeker paid.
function split(gross, percent) {
  const g = Math.round(parseFloat(gross) * 100) / 100;
  const commission = Math.round(g * parseFloat(percent)) / 100;
  return { gross: g, commission, net: Math.round((g - commission) * 100) / 100 };
}

// Record what a finished consultation earned.
//
// Idempotent on consultation_id: ending the same consultation twice, a retried
// request or a duplicate webhook must never pay anyone twice. The unique index
// is the real guarantee — the lookup below only saves the round trip, and a
// race that gets past it lands on the constraint, which is caught and treated
// as the no-op it is.
async function recordConsultationEarning({ consultationId, astrologerId, userId, grossAmount, durationMins }) {
  const gross = parseFloat(grossAmount);
  if (!(gross > 0)) return null;          // free trials and zero-cost sessions owe nobody anything

  const existing = await AstrologerEarning.findOne({ where: { consultation_id: consultationId } });
  if (existing) return existing;

  const { commissionPercent } = await settingsService.getSettings();
  const percent = Math.min(100, Math.max(0, parseFloat(commissionPercent ?? 0)));
  const amounts = split(gross, percent);

  try {
    return await AstrologerEarning.create({
      astrologer_id:      astrologerId,
      consultation_id:    consultationId,
      user_id:            userId,
      duration_mins:      durationMins || 0,
      gross_amount:       amounts.gross,
      commission_percent: percent,
      commission_amount:  amounts.commission,
      net_amount:         amounts.net,
      status:             'pending',
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return await AstrologerEarning.findOne({ where: { consultation_id: consultationId } });
    }
    throw err;
  }
}

// The payout week runs Monday to Sunday, because the kit promises payment on a
// Monday for the week before. Computed in the server's timezone, which is the
// same clock the payout is made on.
function startOfWeek(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;        // Monday = 0
  d.setDate(d.getDate() - day);
  return d;
}

function startOfDay(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

const sum = (rows, field) => rows.reduce((n, r) => n + parseFloat(r[field] || 0), 0);
const round2 = (n) => Math.round(n * 100) / 100;

// Everything the Pandit Portal shows, from the rows as they were recorded.
async function summaryFor(astrologerId, { recentLimit = 20 } = {}) {
  const rows = await AstrologerEarning.findAll({
    where: { astrologer_id: astrologerId },
    order: [['created_at', 'DESC']],
  });

  const today    = startOfDay();
  const weekFrom = startOfWeek();

  const pending = rows.filter(r => r.status !== 'paid');
  const paid    = rows.filter(r => r.status === 'paid');

  const recentRows = rows.slice(0, recentLimit);
  const consultations = await Consultation.findAll({
    where: { id: { [Op.in]: recentRows.map(r => r.consultation_id) } },
  });
  const byId = new Map(consultations.map(c => [c.id, c]));

  return {
    // What is owed but not yet transferred — the figure that matters most.
    pendingAmount: round2(sum(pending, 'net_amount')),
    pendingCount:  pending.length,
    paidAmount:    round2(sum(paid, 'net_amount')),

    todayAmount:   round2(sum(rows.filter(r => new Date(r.created_at) >= today), 'net_amount')),
    weekAmount:    round2(sum(rows.filter(r => new Date(r.created_at) >= weekFrom), 'net_amount')),

    lifetimeAmount: round2(sum(rows, 'net_amount')),
    lifetimeGross:  round2(sum(rows, 'gross_amount')),
    consultations:  rows.length,
    totalMinutes:   rows.reduce((n, r) => n + (r.duration_mins || 0), 0),

    // Shown as a list so an astrologer can check any single consultation:
    // the minutes, what the seeker paid, what was kept and what came to them.
    recent: recentRows.map(r => ({
      id:                 r.id,
      consultation_id:    r.consultation_id,
      at:                 r.created_at,
      mode:               byId.get(r.consultation_id)?.mode || null,
      duration_mins:      r.duration_mins,
      gross_amount:       parseFloat(r.gross_amount),
      commission_percent: parseFloat(r.commission_percent),
      commission_amount:  parseFloat(r.commission_amount),
      net_amount:         parseFloat(r.net_amount),
      status:             r.status,
      paid_at:            r.paid_at,
    })),
  };
}

// Called by whoever makes the weekly transfer, once it has actually gone out.
async function markPaid(earningIds, reference) {
  if (!earningIds?.length) return 0;
  const [count] = await AstrologerEarning.update(
    { status: 'paid', paid_at: new Date(), payout_reference: reference || null },
    { where: { id: { [Op.in]: earningIds }, status: { [Op.ne]: 'paid' } } }
  );
  return count;
}

module.exports = { recordConsultationEarning, summaryFor, markPaid, split, startOfWeek };
