const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, User, Astrologer, Consultation, Transaction, Appointment } = require('../models');

let siteSettings = {
  maintenanceMode: false,
  announcement: '',
  announcementActive: false,
  commissionPercent: 20,
  newUserFreeMinutes: 5,
  minWalletRecharge: 100,
  maxWalletRecharge: 10000,
  platformPhone: '',
  platformEmail: '',
  platformWhatsApp: '',
  featuredAstrologerIds: [],
};

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

async function deleteUser(req, res) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
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

async function deleteAstrologer(req, res) {
  try {
    await Astrologer.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
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

function getSiteSettings(req, res) {
  res.json(siteSettings);
}

function updateSiteSettings(req, res) {
  siteSettings = { ...siteSettings, ...req.body };
  res.json(siteSettings);
}

async function setupAdmin(req, res) {
  try {
    const { email, secret } = req.body;
    const adminSecret = process.env.ADMIN_SECRET || 'astrovyoma_admin_2024';
    if (secret !== adminSecret) return res.status(403).json({ error: 'Invalid secret' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with this email' });
    await User.update({ role: 'admin' }, { where: { email } });
    res.json({ success: true, message: `${email} is now admin` });
  } catch (err) {
    res.status(500).json({ error: 'Setup failed' });
  }
}

module.exports = {
  getStats, getUsers, updateUser, deleteUser,
  getAstrologers, createAstrologer, updateAstrologer, deleteAstrologer,
  getConsultations, getTransactions, getAppointments, getRevenue,
  getSiteSettings, updateSiteSettings,
  setupAdmin,
};
