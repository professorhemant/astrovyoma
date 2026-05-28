const axios = require('axios');
const { tzNameAt } = require('tzlookup');
const moment = require('moment-timezone');

function getTimezone(lat, lng) {
  try {
    const tzId = tzNameAt(lat, lng);
    const offset = moment.tz.zone(tzId).utcOffset(Date.now()) / -60;
    const abbr = moment.tz(tzId).zoneAbbr();
    return { tzId, offset, abbr };
  } catch (_) {
    const offset = Math.round((lng / 15) * 2) / 2;
    return { tzId: null, offset, abbr: 'UTC' + (offset >= 0 ? '+' : '') + offset };
  }
}

async function searchPlace(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`;
    const resp = await axios.get(url, {
      headers: { 'User-Agent': 'AstroVyoma/1.0 (astrology app)' },
      timeout: 8000
    });

    const results = (resp.data || []).map(item => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const tz = getTimezone(lat, lng);
      return {
        display_name: item.display_name,
        short_name: [item.address?.city || item.address?.town || item.address?.village, item.address?.state, item.address?.country].filter(Boolean).join(', '),
        lat,
        lng,
        timezone: tz.offset,
        timezone_id: tz.tzId,
        timezone_abbr: tz.abbr,
        country: item.address?.country,
      };
    });

    res.json(results);
  } catch (err) {
    console.error('Geocode error:', err.message);
    res.status(500).json({ error: 'Geocoding service temporarily unavailable' });
  }
}

module.exports = { searchPlace };
