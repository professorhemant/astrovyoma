require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const { seedAstrologers, seedRealAstrologers } = require('./src/seeders/astrologerSeeder');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust exactly one proxy hop (Railway's edge). Without this every request
// looks like it came from the proxy's IP, so the rate limiter below counts
// all users against a single shared bucket. Not `true` — trusting the whole
// chain would let a client forge X-Forwarded-For to get a fresh quota.
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || '').split(',').map(u => u.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Credential endpoints — 20 attempts per 15 min per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Registration is slightly more lenient (10/hr) — a real user might retry.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many registration attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password',  authLimiter);
app.use('/api/pandit/login',         authLimiter);
app.use('/api/auth/register',        registerLimiter);

app.use('/api', routes); // admin dashboard v2 — appointments + revenue + analytics

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'AstroVyoma API' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Safe column migrations — idempotent, run before sync
    const isPostgres = process.env.NODE_ENV === 'production';
    const migrations = [
      isPostgres
        ? `ALTER TABLE kundalis ADD COLUMN IF NOT EXISTS person_name VARCHAR(200)`
        : `ALTER TABLE kundalis ADD COLUMN person_name TEXT`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`
        : `ALTER TABLE astrologers ADD COLUMN phone TEXT`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS free_minutes INTEGER DEFAULT 0`
        : `ALTER TABLE astrologers ADD COLUMN free_minutes INTEGER DEFAULT 0`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false`
        : `ALTER TABLE astrologers ADD COLUMN is_verified INTEGER DEFAULT 0`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(100)`
        : `ALTER TABLE astrologers ADD COLUMN pin_hash TEXT`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`
        : `ALTER TABLE astrologers ADD COLUMN is_featured INTEGER DEFAULT 0`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS availability TEXT`
        : `ALTER TABLE astrologers ADD COLUMN availability TEXT`,
      isPostgres
        ? `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_id UUID`
        : `ALTER TABLE appointments ADD COLUMN consultation_id TEXT`,
      isPostgres
        ? `ALTER TABLE astrologers ADD COLUMN IF NOT EXISTS email VARCHAR(255)`
        : `ALTER TABLE astrologers ADD COLUMN email TEXT`,
      isPostgres
        ? `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE`
        : `ALTER TABLE consultations ADD COLUMN connected_at DATETIME`,
      isPostgres
        ? `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS ended_by VARCHAR(20)`
        : `ALTER TABLE consultations ADD COLUMN ended_by TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS dob DATE`
        : `ALTER TABLE astrologer_applications ADD COLUMN dob TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`
        : `ALTER TABLE astrologer_applications ADD COLUMN gender TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS location VARCHAR(255)`
        : `ALTER TABLE astrologer_applications ADD COLUMN location TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS skills TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN skills TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS astrology_learned_from TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN astrology_learned_from TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS highest_qualification TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN highest_qualification TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS degree TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN degree TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS college TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN college TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS other_platform BOOLEAN`
        : `ALTER TABLE astrologer_applications ADD COLUMN other_platform INTEGER`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS fulltime_job BOOLEAN`
        : `ALTER TABLE astrologer_applications ADD COLUMN fulltime_job INTEGER`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS daily_hours VARCHAR(20)`
        : `ALTER TABLE astrologer_applications ADD COLUMN daily_hours TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS youtube_channel TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN youtube_channel TEXT`,
      isPostgres
        ? `ALTER TABLE astrologer_applications ADD COLUMN IF NOT EXISTS linkedin_url TEXT`
        : `ALTER TABLE astrologer_applications ADD COLUMN linkedin_url TEXT`,
    ];
    for (const sql of migrations) {
      try { await sequelize.query(sql); } catch (_) { /* column already exists */ }
    }

    await sequelize.sync();
    console.log('Models synchronized');

    // One-time data fix: clockBottom was saved as 81 (typo) instead of 8.
    try {
      await sequelize.query(`UPDATE site_settings SET value = '8' WHERE key = 'clockBottom' AND value = '81'`);
    } catch (_) {}

    await seedAstrologers();
    await seedRealAstrologers();
    // Fills the editable lists with the copy the site already ships, so moving a
    // page onto the database looks identical until an admin changes something.
    await require('./src/controllers/contentController').seedContent();
    app.listen(PORT, () => console.log(`AstroVyoma API running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
