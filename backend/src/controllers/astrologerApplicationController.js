const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { AstrologerApplication, Astrologer } = require('../models');

async function submitApplication(req, res) {
  try {
    const { name, email, phone, bio, specialties, languages, experience_years, price_per_min, photo_url, certifications, why_join } = req.body;

    if (!name || !email || !phone || !experience_years) {
      return res.status(400).json({ error: 'name, email, phone, and experience_years are required' });
    }

    const existing = await AstrologerApplication.findOne({
      where: { email, status: { [Op.in]: ['pending', 'approved'] } },
    });
    if (existing) {
      return res.status(400).json({ error: 'Application already submitted' });
    }

    await AstrologerApplication.create({
      name, email, phone, bio, certifications, why_join,
      specialties: specialties || null,
      languages: languages || null,
      experience_years: parseInt(experience_years),
      price_per_min: price_per_min || 30,
      photo_url: photo_url || null,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. We will review and contact you within 3-5 business days.',
    });
  } catch (err) {
    console.error('submitApplication error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
}

async function getApplications(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const { rows, count } = await AstrologerApplication.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ applications: rows, total: count, page: parseInt(page) });
  } catch (err) {
    console.error('getApplications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

async function approveApplication(req, res) {
  try {
    const { id } = req.params;
    const application = await AstrologerApplication.findByPk(id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const pin_hash = await bcrypt.hash(pin, 10);

    let specialtiesArr = [];
    try { specialtiesArr = application.specialties ? application.specialties.split(',').map(s => s.trim()).filter(Boolean) : []; } catch {}

    let languagesArr = ['Hindi', 'English'];
    try { languagesArr = application.languages ? application.languages.split(',').map(s => s.trim()).filter(Boolean) : ['Hindi', 'English']; } catch {}

    const astrologer = await Astrologer.create({
      display_name: application.name,
      phone: application.phone,
      bio: application.bio || null,
      specialties: specialtiesArr,
      languages: languagesArr,
      experience_years: application.experience_years,
      price_per_min: application.price_per_min,
      photo_url: application.photo_url || null,
      pin_hash,
      is_verified: true,
    });

    application.status = 'approved';
    await application.save();

    res.json({ success: true, astrologer, pin });
  } catch (err) {
    console.error('approveApplication error:', err);
    res.status(500).json({ error: 'Failed to approve application' });
  }
}

async function rejectApplication(req, res) {
  try {
    const { id } = req.params;
    const application = await AstrologerApplication.findByPk(id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    application.status = 'rejected';
    application.rejection_reason = req.body.reason || null;
    await application.save();

    res.json({ success: true });
  } catch (err) {
    console.error('rejectApplication error:', err);
    res.status(500).json({ error: 'Failed to reject application' });
  }
}

module.exports = { submitApplication, getApplications, approveApplication, rejectApplication };
