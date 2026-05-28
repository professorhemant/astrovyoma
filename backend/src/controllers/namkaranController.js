'use strict';

const axios = require('axios');
const { calculateKundali } = require('../services/kundaliEngine');
const { getNamkaranLetter, NAKSHATRA_DATA } = require('../services/namkaranService');

async function geocodePlace(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const resp = await axios.get(url, { headers: { 'User-Agent': 'AstroVyoma/1.0' } });
  if (!resp.data || resp.data.length === 0) throw new Error('Place not found');
  const { lat, lon } = resp.data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

// POST /api/namkaran/calculate
// Accepts baby's birth data, returns nakshatra + namkaran letter. No DB save.
async function calculateNamkaran(req, res) {
  try {
    const { dob, birth_time, birth_place, lat, lng, timezone, baby_name } = req.body;
    if (!dob) return res.status(400).json({ error: 'Date of birth is required' });

    let resolvedLat = lat, resolvedLng = lng, resolvedTz = timezone;

    if (!resolvedLat || !resolvedLng) {
      if (!birth_place) return res.status(400).json({ error: 'Birth place or coordinates required' });
      const geo = await geocodePlace(birth_place);
      resolvedLat = geo.lat;
      resolvedLng = geo.lng;
    }

    if (resolvedTz === undefined || resolvedTz === null) {
      resolvedTz = Math.round(resolvedLng / 15 * 2) / 2;
      if (resolvedLat >= 8 && resolvedLat <= 37 && resolvedLng >= 68 && resolvedLng <= 97) resolvedTz = 5.5;
    }

    const chartData = await calculateKundali(dob, birth_time, resolvedLat, resolvedLng, resolvedTz);

    const moonPos = chartData.planetary_positions?.Moon;
    const nakshatra = moonPos?.nakshatra || chartData.nakshatra;
    const pada     = moonPos?.nakshatra_pada || chartData.nakshatra_pada || 1;

    if (!nakshatra) return res.status(400).json({ error: 'Could not determine nakshatra from birth data' });

    const namkaran = getNamkaranLetter(nakshatra, pada);
    if (!namkaran) return res.status(400).json({ error: 'Nakshatra not recognized: ' + nakshatra });

    res.json({
      baby_name: baby_name || '',
      dob,
      birth_time: birth_time || null,
      birth_place: birth_place || null,
      namkaran,
      moon_sign:    chartData.moon_sign,
      moon_degree:  moonPos?.degree,
      lagna:        chartData.lagna,
      panchang:     chartData.panchang,
    });
  } catch (err) {
    console.error('calculateNamkaran error:', err);
    res.status(500).json({ error: err.message || 'Failed to calculate Namkaran' });
  }
}

module.exports = { calculateNamkaran };
