// Hindu festival + planetary event calendar.
//
// This used to be a hand-typed array of dates that stopped at 2026-05-29, so
// every month after that came back empty. Dates now come from festivalEngine,
// which derives them from the ephemeris for any year asked for.

const festivalEngine = require('../services/festivalEngine');

const TYPE_ORDER = ['eclipse','retrograde-start','retrograde-end','transit',
                    'festival','purnima','amavasya','ekadashi'];

function sortEvents(a, b) {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate;
  return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
}

exports.getCalendar = (req, res) => {
  try {
    const now   = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year  = parseInt(req.query.year, 10)  || now.getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'month must be 1-12' });
    }
    // The ephemeris reaches far wider than anyone will page to, but keep the
    // generator from being handed something absurd.
    if (year < 1900 || year > 2100) {
      return res.status(400).json({ error: 'year must be between 1900 and 2100' });
    }

    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const events = festivalEngine.getYear(year)
      .filter(e => e.date.startsWith(prefix))
      .sort(sortEvents);

    const grouped = {};
    events.forEach(e => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });

    // Sidebar teaser: the next few events from today, which may fall in the
    // following year if the user is paging around in December.
    const today = new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
    const upcoming = [...festivalEngine.getYear(now.getFullYear()),
                      ...festivalEngine.getYear(now.getFullYear() + 1)]
      .filter(e => e.date >= today)
      .sort(sortEvents)
      .slice(0, 5);

    res.json({ month, year, events, grouped, upcoming });
  } catch (err) {
    console.error('[events/calendar]', err);
    res.status(500).json({ error: err.message });
  }
};

// Whole-year feed, for a year view or an export.
exports.getYearEvents = (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    if (year < 1900 || year > 2100) {
      return res.status(400).json({ error: 'year must be between 1900 and 2100' });
    }
    const events = festivalEngine.getYear(year).slice().sort(sortEvents);
    res.json({ year, count: events.length, events });
  } catch (err) {
    console.error('[events/year]', err);
    res.status(500).json({ error: err.message });
  }
};
