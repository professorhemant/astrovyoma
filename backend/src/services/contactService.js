// Email and phone, cleaned the same way everywhere.
//
// Both are identities people sign in with, and both were being stored as
// whatever was typed. A number saved as "+91 98765 43210" and the same number
// saved as "9876543210" are the same person to everyone except the database —
// which is exactly the bug getMe already works around when it matches a seeker
// to an astrologer by the last ten digits.

// Indian mobile numbers are ten digits beginning 6–9. Anything longer is
// assumed to carry a country code or spacing, so the last ten are taken —
// "+91 98765 43210", "098765 43210" and "9876543210" all land on the same
// stored value.
function cleanPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const last10 = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(last10) ? last10 : null;
}

// Deliberately not RFC 5322. A pattern that accepts every legal address also
// accepts most typos; this catches the mistakes people actually make and lets
// the unusual-but-valid through.
function cleanEmail(raw) {
  const v = String(raw || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : null;
}

// One message per field, saying what is wrong rather than that something is.
function validateContact({ email, phone }, { require = true } = {}) {
  const errors = [];
  const out = {};

  if (email !== undefined || require) {
    if (!String(email || '').trim()) {
      if (require) errors.push('An email address is required.');
    } else {
      out.email = cleanEmail(email);
      if (!out.email) errors.push('That email address does not look right.');
    }
  }

  if (phone !== undefined || require) {
    if (!String(phone || '').trim()) {
      if (require) errors.push('A mobile number is required.');
    } else {
      out.phone = cleanPhone(phone);
      if (!out.phone) errors.push('Enter a 10-digit Indian mobile number.');
    }
  }

  return { ok: errors.length === 0, errors, value: out };
}

module.exports = { cleanPhone, cleanEmail, validateContact };
