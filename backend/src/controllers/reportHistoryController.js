const { UserReport, Kundali } = require('../models');

const TYPE_ICONS = {
  kundali:    '🔯',
  kp:         '🪐',
  muhurta:    '✨',
  namkaran:   '👶',
  yoga:       '🌟',
  lal_kitab:  '📖',
  domain:     '🔭',
  guna_milan: '💍',
  gochara:    '🌀',
};

async function saveReport(req, res) {
  try {
    const { type, title, meta } = req.body;
    if (!type || !title) return res.status(400).json({ error: 'type and title are required' });

    const report = await UserReport.create({
      user_id: req.user.id,
      type,
      title,
      meta: meta || null,
    });

    res.json({ success: true, id: report.id });
  } catch (err) {
    console.error('saveReport error:', err.message);
    res.status(500).json({ error: 'Failed to save report' });
  }
}

async function deleteReport(req, res) {
  try {
    const report = await UserReport.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!report) return res.status(404).json({ error: 'Not found' });
    await report.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
}

async function getHistory(req, res) {
  try {
    const reports = await UserReport.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    // Also pull the saved Kundali (one per user) and prepend if exists
    let kundaliEntry = null;
    try {
      const k = await Kundali.findOne({ where: { user_id: req.user.id } });
      if (k) {
        kundaliEntry = {
          id: `kundali-${k.id}`,
          type: 'kundali',
          title: `${k.person_name || 'Your'}'s Kundali`,
          icon: TYPE_ICONS.kundali,
          meta: {
            dob: k.dob,
            birth_place: k.birth_place,
            lagna: k.lagna,
            moon_sign: k.moon_sign,
            nakshatra: k.nakshatra,
            nakshatra_lord: k.nakshatra_lord,
          },
          created_at: k.updated_at || k.created_at,
          is_kundali: true,
        };
      }
    } catch { /* ignore */ }

    const formatted = reports.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      icon: TYPE_ICONS[r.type] || '📋',
      meta: r.meta,
      created_at: r.created_at,
    }));

    const all = kundaliEntry ? [kundaliEntry, ...formatted] : formatted;

    res.json(all);
  } catch (err) {
    console.error('getHistory error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}

module.exports = { saveReport, getHistory, deleteReport };
