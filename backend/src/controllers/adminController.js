const bcrypt = require('bcryptjs');
const { DEMO_ASTROLOGER_NAMES } = require('../seeders/astrologerSeeder');
const { Op } = require('sequelize');
const { sequelize, User, Astrologer, Consultation, Transaction, Appointment,
        Kundali, Message, Review, Subscription, UserReport, AiChatMessage, OtpCode } = require('../models');

// Settings live in the site_settings table now. They used to be this module's
// local state, which meant every restart — and Railway restarts on each deploy —
// quietly reverted them to defaults while the admin screen still said "Saved".
const settingsService = require('../services/settingsService');

async function getStats(req, res) {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); weekAgo.setHours(0, 0, 0, 0);
    const [
      totalUsers, totalAstrologers, totalConsultations, todaySignups,
      activeConsultations, totalRevenue, onlineAstrologers,
      totalAppointments, todayRevenue, weekRevenue, totalCredits, totalDebits,
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Astrologer.count(),
      Consultation.count(),
      User.count({ where: { created_at: { [Op.gte]: today } } }),
      Consultation.count({ where: { status: 'active' } }),
      Transaction.sum('amount', { where: { type: 'credit' } }),
      Astrologer.count({ where: { is_online: true } }),
      Appointment.count(),
      Transaction.sum('amount', { where: { type: 'credit', created_at: { [Op.gte]: today } } }),
      Transaction.sum('amount', { where: { type: 'credit', created_at: { [Op.gte]: weekAgo } } }),
      Transaction.sum('amount', { where: { type: 'credit' } }),
      Transaction.sum('amount', { where: { type: 'debit' } }),
    ]);
    res.json({
      totalUsers, totalAstrologers, totalConsultations, todaySignups,
      activeConsultations, totalRevenue: totalRevenue || 0,
      onlineAstrologers, totalAppointments,
      todayRevenue: todayRevenue || 0, weekRevenue: weekRevenue || 0,
      totalCredits: totalCredits || 0, totalDebits: totalDebits || 0,
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

async function getUsers(req, res) {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ]
    } : {};
    const { rows, count } = await User.findAndCountAll({
      where, attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']], limit: parseInt(limit), offset,
    });
    res.json({ users: rows, total: count, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, wallet_adjustment, adjustment_note } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updates = {};
    if (role) updates.role = role;
    if (wallet_adjustment && wallet_adjustment !== 0) {
      const newBalance = parseFloat(user.wallet_balance) + parseFloat(wallet_adjustment);
      if (newBalance < 0) return res.status(400).json({ error: 'Cannot reduce balance below zero' });
      updates.wallet_balance = newBalance;
      await Transaction.create({
        user_id: id, type: wallet_adjustment > 0 ? 'credit' : 'debit',
        amount: Math.abs(wallet_adjustment),
        description: adjustment_note || (wallet_adjustment > 0 ? 'Admin credit' : 'Admin debit'),
        balance_after: newBalance,
      });
    }
    await User.update(updates, { where: { id } });
    const updated = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    res.json(updated);
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

// Deleting a user has to remove everything that belongs to them. No model
// declares onDelete, and sequelize.sync() does not alter foreign keys on tables
// that already exist, so adding cascades to the associations would not change
// the live database. The cascade is therefore explicit here, and wrapped in a
// transaction so a failure part-way through cannot leave a half-deleted account.
async function deleteUser(req, res) {
  const t = await sequelize.transaction();
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Messages hang off consultations rather than the user directly.
    const consultations = await Consultation.findAll({
      where: { user_id: userId }, attributes: ['id'], transaction: t,
    });
    const consultationIds = consultations.map(c => c.id);
    if (consultationIds.length) {
      await Message.destroy({ where: { consultation_id: consultationIds }, transaction: t });
    }

    // Reviews reference the consultation, so they go before it.
    await Review.destroy({ where: { user_id: userId }, transaction: t });
    await Consultation.destroy({ where: { user_id: userId }, transaction: t });

    // Sequential, not Promise.all. Concurrent deletes that share a transaction
    // keep running after one of them rejects, and the rollback in the catch
    // block lands while they are still in flight — they then hit a finished
    // transaction and throw outside any handler, crashing the process instead
    // of returning a clean error. One at a time keeps at most one in flight.
    for (const Model of [Kundali, Transaction, Subscription, Appointment, UserReport, AiChatMessage]) {
      await Model.destroy({ where: { user_id: userId }, transaction: t });
    }

    // Pending reset codes are keyed by email, not user id.
    if (user.email) {
      await OtpCode.destroy({ where: { identifier: `reset:${user.email.toLowerCase()}` }, transaction: t });
    }

    // An astrologer profile is a separate business record that happens to be
    // linked to a login. Unlink it rather than deleting the astrologer.
    await Astrologer.update({ user_id: null }, { where: { user_id: userId }, transaction: t });

    await User.destroy({ where: { id: userId }, transaction: t });
    await t.commit();
    res.json({ success: true });
  } catch (err) {
    await t.rollback();
    console.error('deleteUser error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// One-shot removal of the seeded demo astrologers.
//
// Deleting them one row at a time through the UI proved unreliable, so this
// does the whole set in a single transaction. It matches on the exact seeded
// display names, so a genuine astrologer can never be caught by it — the real
// pandit lives in REAL_ASTROLOGERS and is not in this list.
//
// Their consultations, messages, appointments and reviews go too: those are
// test sessions answered by an LLM, not billing records worth preserving.
// Returns a per-name report so the caller can see exactly what happened.
async function cleanupDemoAstrologers(req, res) {
  const t = await sequelize.transaction();
  try {
    const demos = await Astrologer.findAll({
      where: { display_name: DEMO_ASTROLOGER_NAMES },
      transaction: t,
    });

    if (!demos.length) {
      await t.rollback();
      return res.json({ success: true, deleted: 0, message: 'No demo astrologers found.', removed: [] });
    }

    const ids = demos.map(a => a.id);

    const consultations = await Consultation.findAll({
      where: { astrologer_id: ids }, attributes: ['id'], transaction: t,
    });
    const consultationIds = consultations.map(c => c.id);
    if (consultationIds.length) {
      await Message.destroy({ where: { consultation_id: consultationIds }, transaction: t });
    }

    await Review.destroy({ where: { astrologer_id: ids }, transaction: t });
    await Consultation.destroy({ where: { astrologer_id: ids }, transaction: t });
    await Appointment.destroy({ where: { astrologer_id: ids }, transaction: t });

    // Report the rows the delete actually affected, not the number matched.
    // Reporting `demos.length` made a delete that removed nothing look
    // successful, which cost a diagnosis cycle.
    const destroyed = await Astrologer.destroy({ where: { id: ids }, transaction: t });

    await t.commit();

    // Confirm from outside the transaction that the rows are really gone.
    const stillPresent = await Astrologer.count({ where: { id: ids } });
    const totalAfter = await Astrologer.count();

    res.json({
      success: stillPresent === 0,
      matched: demos.length,
      deleted: destroyed,
      still_present_after_commit: stillPresent,
      total_astrologers_now: totalAfter,
      removed: demos.map(a => a.display_name),
      consultations_removed: consultationIds.length,
    });
  } catch (err) {
    await t.rollback();
    console.error('cleanupDemoAstrologers error:', err);
    res.status(500).json({ error: 'Cleanup failed', detail: err.message });
  }
}

async function getAstrologers(req, res) {
  try {
    const astrologers = await Astrologer.findAll({ order: [['created_at', 'DESC']] });
    res.json(astrologers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch astrologers' });
  }
}

async function createAstrologer(req, res) {
  try {
    const { display_name, bio, phone, pin, price_per_min, experience_years, specialties, languages, free_minutes, photo_url, is_verified } = req.body;
    const pin_hash = pin ? await bcrypt.hash(String(pin), 10) : null;
    const a = await Astrologer.create({
      display_name, bio, phone, pin_hash,
      price_per_min: price_per_min || 30,
      experience_years: experience_years || 5,
      specialties: specialties || [],
      languages: languages || ['Hindi', 'English'],
      free_minutes: free_minutes || 0,
      photo_url: photo_url || null,
      is_verified: is_verified !== undefined ? is_verified : true,
    });
    res.status(201).json(a);
  } catch (err) {
    console.error('createAstrologer error:', err);
    res.status(500).json({ error: 'Failed to create astrologer' });
  }
}

// The portal PIN is only ever stored as a bcrypt hash, so the plaintext shown
// once at approval is unrecoverable. Without this, an astrologer who loses it
// is locked out of the pandit portal with no way back in.
async function resetAstrologerPin(req, res) {
  try {
    const { id } = req.params;
    const astrologer = await Astrologer.findByPk(id);
    if (!astrologer) return res.status(404).json({ error: 'Astrologer not found' });

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    astrologer.pin_hash = await bcrypt.hash(pin, 10);
    await astrologer.save();

    // Returned in the clear exactly once — the caller has to hand it over now.
    res.json({ success: true, display_name: astrologer.display_name, pin });
  } catch (err) {
    console.error('resetAstrologerPin error:', err);
    res.status(500).json({ error: 'Failed to reset PIN' });
  }
}

async function updateAstrologer(req, res) {
  try {
    const { id } = req.params;
    const { pin, ...rest } = req.body;
    const updates = { ...rest };
    if (pin) updates.pin_hash = await bcrypt.hash(String(pin), 10);
    await Astrologer.update(updates, { where: { id } });
    const updated = await Astrologer.findByPk(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update astrologer' });
  }
}

// Deleting an astrologer used to destroy only that row, leaving their
// consultations, appointments and reviews behind pointing at nothing.
//
// Consultations and appointments are billing records, so this refuses rather
// than cascading: erasing an astrologer who has taken paid sessions would
// destroy financial history. Deactivating (is_available/is_online false) is the
// right action there. Profiles with no trading history — demo fixtures, a
// mistaken entry — delete cleanly, with their reviews removed in the same
// transaction.
async function deleteAstrologer(req, res) {
  const t = await sequelize.transaction();
  try {
    const astrologerId = req.params.id;
    const astrologer = await Astrologer.findByPk(astrologerId, { transaction: t });
    if (!astrologer) {
      await t.rollback();
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    const consultations = await Consultation.count({ where: { astrologer_id: astrologerId }, transaction: t });
    const appointments = await Appointment.count({ where: { astrologer_id: astrologerId }, transaction: t });

    // Refuse by default: deleting an astrologer with trading history would
    // destroy billing records. `force` is the deliberate override for cases
    // where the history is itself disposable — seeded demo profiles and their
    // test consultations — and the caller has been told what it will remove.
    const force = req.query.force === 'true' || req.body?.force === true;

    if ((consultations > 0 || appointments > 0) && !force) {
      await t.rollback();
      return res.status(409).json({
        error: `"${astrologer.display_name}" has ${consultations} consultation(s) and ${appointments} appointment(s).`,
        detail: 'Deleting removes those billing records too. Mark them unavailable instead, or confirm to delete everything.',
        consultations,
        appointments,
        can_force: true,
      });
    }

    if (force && consultations > 0) {
      const ids = (await Consultation.findAll({
        where: { astrologer_id: astrologerId }, attributes: ['id'], transaction: t,
      })).map(c => c.id);
      if (ids.length) await Message.destroy({ where: { consultation_id: ids }, transaction: t });
    }

    await Review.destroy({ where: { astrologer_id: astrologerId }, transaction: t });
    if (force) {
      await Consultation.destroy({ where: { astrologer_id: astrologerId }, transaction: t });
      await Appointment.destroy({ where: { astrologer_id: astrologerId }, transaction: t });
    }
    await Astrologer.destroy({ where: { id: astrologerId }, transaction: t });
    await t.commit();
    res.json({ success: true });
  } catch (err) {
    await t.rollback();
    console.error('deleteAstrologer error:', err);
    res.status(500).json({ error: 'Failed to delete astrologer' });
  }
}

async function getConsultations(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Consultation.findAndCountAll({
      order: [['created_at', 'DESC']], limit: parseInt(limit), offset,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Astrologer, as: 'astrologer', attributes: ['id', 'display_name'] },
      ],
    });
    res.json({ consultations: rows, total: count, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
}

async function getTransactions(req, res) {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = type ? { type } : {};
    const { rows, count } = await Transaction.findAndCountAll({
      where, order: [['created_at', 'DESC']], limit: parseInt(limit), offset,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    res.json({ transactions: rows, total: count, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

async function getAppointments(req, res) {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Appointment.findAndCountAll({
      order: [['scheduled_at', 'DESC']], limit: parseInt(limit), offset,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Astrologer, as: 'astrologer', attributes: ['id', 'display_name'] },
      ],
    });
    res.json({ appointments: rows, total: count, page: parseInt(page) });
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}

async function getRevenue(req, res) {
  try {
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const amount = await Transaction.sum('amount', {
        where: { type: 'credit', created_at: { [Op.gte]: d, [Op.lt]: nextD } }
      });
      daily.push({ date: d.toISOString().split('T')[0], amount: amount || 0 });
    }

    const topAstrologers = await Consultation.findAll({
      attributes: [
        'astrologer_id',
        [sequelize.fn('COUNT', sequelize.col('Consultation.id')), 'consultCount'],
        [sequelize.fn('SUM', sequelize.col('total_cost')), 'revenue'],
      ],
      where: { status: 'completed' },
      group: ['astrologer_id', 'astrologer.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Consultation.id')), 'DESC']],
      limit: 5,
      include: [{ model: Astrologer, as: 'astrologer', attributes: ['display_name', 'photo_url'] }],
    });

    const modeBreakdown = await Consultation.findAll({
      attributes: ['mode', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['mode'],
    });

    res.json({ daily, topAstrologers, modeBreakdown });
  } catch (err) {
    console.error('getRevenue error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
}

async function getSiteSettings(req, res) {
  try {
    res.json(await settingsService.getSettings({ fresh: true }));
  } catch (err) {
    console.error('getSiteSettings error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
}

async function updateSiteSettings(req, res) {
  try {
    res.json(await settingsService.updateSettings(req.body));
  } catch (err) {
    console.error('updateSiteSettings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
}

async function setupAdmin(req, res) {
  try {
    const { email, secret } = req.body;
    // Fail closed. The old fallback ('astrovyoma_admin_2024') lived in source, so
    // anyone reading the repo could promote any account to admin whenever
    // ADMIN_SECRET was unset in the environment. With no secret configured the
    // endpoint is disabled outright rather than guarded by a public default.
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) return res.status(503).json({ error: 'Admin setup is disabled' });
    if (!secret || secret !== adminSecret) return res.status(403).json({ error: 'Invalid secret' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with this email' });
    await User.update({ role: 'admin' }, { where: { email } });
    res.json({ success: true, message: `${email} is now admin` });
  } catch (err) {
    res.status(500).json({ error: 'Setup failed' });
  }
}

module.exports = {
  getStats, getUsers, updateUser, deleteUser, cleanupDemoAstrologers,
  getAstrologers, createAstrologer, updateAstrologer, deleteAstrologer, resetAstrologerPin,
  getConsultations, getTransactions, getAppointments, getRevenue,
  getSiteSettings, updateSiteSettings,
  setupAdmin,
};
