// The weekly payout run, from the admin.
//
// This screen does not move money — no bank is connected. It tells you who is
// owed what, and records that you have paid them once you actually have. That
// order matters: marking a run paid is a statement about the real world, so it
// is only ever done by a person who has just made the transfer.

const earningsService = require('../services/earningsService');
const { startOfWeek } = earningsService;

// Everything still owed, grouped by astrologer.
//
// ?week=last cuts the run off at the end of last week, which is what the kit
// promises: paid on a Monday, for the week before. Without it the run covers
// everything outstanding including consultations given this morning.
async function getPending(req, res) {
  try {
    const upto = req.query.week === 'last' ? startOfWeek() : null;
    const [data, recent] = await Promise.all([
      earningsService.pendingByAstrologer({ upto }),
      earningsService.recentPayouts({ limit: 10 }),
    ]);
    res.json({ ...data, recent, upto: upto ? upto.toISOString() : null });
  } catch (err) {
    console.error('getPending payouts error:', err);
    res.status(500).json({ error: 'Failed to load payouts' });
  }
}

// Record that one astrologer's outstanding earnings have been paid.
async function payAstrologer(req, res) {
  try {
    const { astrologer_id, earning_ids, reference } = req.body || {};
    if (!astrologer_id || !Array.isArray(earning_ids) || !earning_ids.length) {
      return res.status(400).json({ error: 'astrologer_id and earning_ids are required' });
    }

    const result = await earningsService.payAstrologer(astrologer_id, earning_ids, reference);
    if (!result.paid) {
      // Either somebody settled this run a moment ago or the ids have gone
      // stale. Neither is an error worth a 500 — the screen reloads and shows
      // the truth.
      return res.json({ paid: 0, amount: 0, message: 'Nothing left to settle — it may already be paid.' });
    }

    console.log(`[payout] ${result.paid} earning(s), ₹${result.amount} to astrologer ${astrologer_id}` +
                (reference ? ` (ref ${reference})` : ''));
    res.json(result);
  } catch (err) {
    console.error('payAstrologer error:', err);
    res.status(500).json({ error: 'Failed to record the payout' });
  }
}

// Put a payout recorded in error back to owed.
async function undoPayout(req, res) {
  try {
    const { astrologer_id, earning_ids } = req.body || {};
    if (!astrologer_id || !Array.isArray(earning_ids) || !earning_ids.length) {
      return res.status(400).json({ error: 'astrologer_id and earning_ids are required' });
    }

    const result = await earningsService.undoPayout(astrologer_id, earning_ids);
    if (!result.restored) {
      return res.json({ restored: 0, amount: 0, message: 'Nothing to undo — it may already have been reversed.' });
    }

    console.log(`[payout] undone: ${result.restored} earning(s), ₹${result.amount} back to owed for astrologer ${astrologer_id}`);
    res.json(result);
  } catch (err) {
    console.error('undoPayout error:', err);
    res.status(500).json({ error: 'Failed to undo the payout' });
  }
}

module.exports = { getPending, payAstrologer, undoPayout };
