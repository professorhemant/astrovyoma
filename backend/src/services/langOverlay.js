// Reading a content row in the language the reader asked for.
//
// A row stores both: `title` holds the English and `title_hi` the Hindi, because
// the admin edits them side by side. Every page that renders that row wants one
// of them under the plain name, and none of those pages should have to know that
// Hindi exists.
//
// So the swap happens here, once, on the way out of the database. A Hindi reader
// gets `title` already holding the Hindi; an English reader gets it untouched.
// The pages stay exactly as they were written.
//
// A blank Hindi field means "not translated yet", not "show nothing". That is
// the normal state — 66 fields across 27 lists became translatable in one go and
// almost none of them are filled — so an empty twin leaves the English standing.
// A site half-translated stays a working site.

const SUFFIX = '_hi';

function langFrom(req) {
  const q = String(req?.query?.lang || '').toLowerCase();
  if (q === 'hi' || q === 'en') return q;
  // The site sends its choice on every request (see the axios interceptor), so
  // endpoints that were never given a query parameter still answer correctly.
  const h = String(req?.headers?.['x-lang'] || '').toLowerCase();
  return h === 'hi' ? 'hi' : 'en';
}

// Overlays the Hindi onto the plain keys, and drops the twins so what comes back
// is the same shape the page has always received.
function applyLang(data, lang) {
  if (lang !== 'hi' || !data || typeof data !== 'object') return data;
  const out = { ...data };
  for (const key of Object.keys(data)) {
    if (!key.endsWith(SUFFIX)) continue;
    const base = key.slice(0, -SUFFIX.length);
    const value = data[key];
    if (typeof value === 'string' ? value.trim() !== '' : value != null) out[base] = value;
    delete out[key];
  }
  return out;
}

module.exports = { applyLang, langFrom };
