const axios = require('axios');
const { Kundali, User } = require('../models');
const { calculateKundali } = require('../services/kundaliEngine');
const { generateSummaryPDF, generateDetailedPDF } = require('../services/pdfService');
const { getNamkaranLetter } = require('../services/namkaranService');
const { generateSummaryPDFHindi, generateDetailedPDFHindi } = require('../services/hindiPdfService');

async function geocodePlace(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const resp = await axios.get(url, { headers: { 'User-Agent': 'AstroVyoma/1.0' } });
  if (!resp.data || resp.data.length === 0) throw new Error('Place not found');
  const { lat, lon, display_name } = resp.data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon), display_name };
}

async function getTimezone(lat, lng) {
  if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) return 5.5;
  return Math.round(lng / 15 * 2) / 2;
}

async function generateKundali(req, res) {
  try {
    const { name, dob, birth_time, birth_place, lat, lng, timezone } = req.body;
    if (!dob) return res.status(400).json({ error: 'Date of birth is required' });

    let resolvedLat = lat, resolvedLng = lng, resolvedTz = timezone;

    if (!resolvedLat || !resolvedLng) {
      if (!birth_place) return res.status(400).json({ error: 'Birth place or coordinates required' });
      const geo = await geocodePlace(birth_place);
      resolvedLat = geo.lat;
      resolvedLng = geo.lng;
    }

    if (resolvedTz === undefined || resolvedTz === null) {
      resolvedTz = await getTimezone(resolvedLat, resolvedLng);
    }

    const chartData = await calculateKundali(dob, birth_time, resolvedLat, resolvedLng, resolvedTz);

    const [kundali] = await Kundali.upsert({
      user_id: req.user.id,
      person_name: name || null,
      dob,
      birth_time: birth_time || null,
      birth_place: birth_place || null,
      birth_lat: resolvedLat,
      birth_lng: resolvedLng,
      birth_timezone: resolvedTz,
      ...chartData
    }, { returning: true });

    await User.update(
      { dob, birth_time, birth_place, birth_lat: resolvedLat, birth_lng: resolvedLng, birth_timezone: resolvedTz, onboarding_complete: true },
      { where: { id: req.user.id } }
    );

    res.json({
      kundali: kundali.toJSON ? kundali.toJSON() : kundali,
      chart: chartData,
      birth_info: { dob, birth_time, birth_place, lat: resolvedLat, lng: resolvedLng, timezone: resolvedTz }
    });
  } catch (err) {
    console.error('generateKundali error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate Kundali' });
  }
}

async function getMyKundali(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'Kundali not found. Please generate your birth chart first.' });
    res.json(kundali);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Kundali' });
  }
}

async function getPersonalityReport(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'Kundali not found' });
    res.json({
      personality_traits: kundali.personality_traits,
      swabhav: kundali.swabhav,
      life_purpose: kundali.life_purpose,
      nakshatra: kundali.nakshatra,
      nakshatra_pada: kundali.nakshatra_pada,
      lagna: kundali.lagna,
      moon_sign: kundali.moon_sign,
      sun_sign: kundali.sun_sign
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personality report' });
  }
}

async function downloadSummaryPDF(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'Kundali not found. Generate your birth chart first.' });

    const data = kundali.toJSON ? kundali.toJSON() : kundali;
    const user = await User.findByPk(req.user.id, { attributes: ['name'] });
    const birthInfo = {
      dob: data.dob,
      birth_time: data.birth_time,
      birth_place: data.birth_place,
      lat: data.birth_lat,
      lng: data.birth_lng,
      timezone: data.birth_timezone
    };

    const pdfBuffer = await generateSummaryPDF(data, data.person_name || user?.name || 'Unknown', birthInfo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kundali-summary-${data.dob}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('downloadSummaryPDF error:', err);
    res.status(500).json({ error: 'Failed to generate Summary PDF' });
  }
}

async function downloadDetailedPDF(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'Kundali not found. Generate your birth chart first.' });

    const data = kundali.toJSON ? kundali.toJSON() : kundali;
    const user = await User.findByPk(req.user.id, { attributes: ['name'] });
    const birthInfo = {
      dob: data.dob,
      birth_time: data.birth_time,
      birth_place: data.birth_place,
      lat: data.birth_lat,
      lng: data.birth_lng,
      timezone: data.birth_timezone
    };

    const pdfBuffer = await generateDetailedPDF(data, data.person_name || user?.name || 'Unknown', birthInfo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kundali-detailed-${data.dob}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('downloadDetailedPDF error:', err);
    res.status(500).json({ error: 'Failed to generate Detailed PDF' });
  }
}

async function getNamkaran(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'Kundali not found. Generate your birth chart first.' });

    const data = kundali.toJSON ? kundali.toJSON() : kundali;

    // Primary: Moon's nakshatra + pada (Janma Nakshatra = basis of Namkaran)
    const moonPos = data.planetary_positions?.Moon;
    const nakshatra = moonPos?.nakshatra || data.nakshatra;
    const pada     = moonPos?.nakshatra_pada || data.nakshatra_pada || 1;

    const namkaran = getNamkaranLetter(nakshatra, pada);
    if (!namkaran) return res.status(400).json({ error: 'Nakshatra data not available in chart' });

    res.json({
      namkaran,
      moon_sign: data.moon_sign,
      lagna: data.lagna,
      dob: data.dob,
      birth_place: data.birth_place,
    });
  } catch (err) {
    console.error('getNamkaran error:', err);
    res.status(500).json({ error: 'Failed to fetch Namkaran data' });
  }
}

async function downloadSummaryPDFHindi(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'कुण्डली नहीं मिली। पहले जन्म कुण्डली बनाएँ।' });

    const data = kundali.toJSON ? kundali.toJSON() : kundali;
    const user = await User.findByPk(req.user.id, { attributes: ['name'] });
    const birthInfo = {
      dob: data.dob, birth_time: data.birth_time, birth_place: data.birth_place,
      lat: data.birth_lat, lng: data.birth_lng, timezone: data.birth_timezone
    };

    const pdfBuffer = await generateSummaryPDFHindi(data, data.person_name || user?.name || 'अज्ञात', birthInfo);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kundali-summary-hindi-${data.dob}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('downloadSummaryPDFHindi error:', err);
    res.status(500).json({ error: 'हिंदी PDF बनाने में त्रुटि हुई' });
  }
}

async function downloadDetailedPDFHindi(req, res) {
  try {
    const kundali = await Kundali.findOne({ where: { user_id: req.user.id } });
    if (!kundali) return res.status(404).json({ error: 'कुण्डली नहीं मिली। पहले जन्म कुण्डली बनाएँ।' });

    const data = kundali.toJSON ? kundali.toJSON() : kundali;
    const user = await User.findByPk(req.user.id, { attributes: ['name'] });
    const birthInfo = {
      dob: data.dob, birth_time: data.birth_time, birth_place: data.birth_place,
      lat: data.birth_lat, lng: data.birth_lng, timezone: data.birth_timezone
    };

    const pdfBuffer = await generateDetailedPDFHindi(data, data.person_name || user?.name || 'अज्ञात', birthInfo);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kundali-detailed-hindi-${data.dob}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('downloadDetailedPDFHindi error:', err);
    res.status(500).json({ error: 'हिंदी विस्तृत PDF बनाने में त्रुटि हुई' });
  }
}

async function generatePublicKundali(req, res) {
  try {
    const { name, dob, birth_time, birth_place, lat, lng, timezone } = req.body;
    if (!dob) return res.status(400).json({ error: 'Date of birth is required' });

    let resolvedLat = lat, resolvedLng = lng, resolvedTz = timezone;

    if (!resolvedLat || !resolvedLng) {
      if (!birth_place) return res.status(400).json({ error: 'Birth place or coordinates required' });
      const geo = await geocodePlace(birth_place);
      resolvedLat = geo.lat;
      resolvedLng = geo.lng;
    }

    if (resolvedTz === undefined || resolvedTz === null) {
      resolvedTz = await getTimezone(resolvedLat, resolvedLng);
    }

    const chartData = await calculateKundali(dob, birth_time, resolvedLat, resolvedLng, resolvedTz);

    res.json({
      chart: chartData,
      birth_info: { name, dob, birth_time, birth_place, lat: resolvedLat, lng: resolvedLng, timezone: resolvedTz }
    });
  } catch (err) {
    console.error('generatePublicKundali error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate Kundali' });
  }
}

module.exports = { generateKundali, generatePublicKundali, getMyKundali, getPersonalityReport, downloadSummaryPDF, downloadDetailedPDF, downloadSummaryPDFHindi, downloadDetailedPDFHindi, getNamkaran };
