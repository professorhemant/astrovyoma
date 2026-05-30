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
    ];
    for (const sql of migrations) {
      try { await sequelize.query(sql); } catch (_) { /* column already exists */ }
    }

    await sequelize.sync();
    console.log('Models synchronized');
    await seedAstrologers();
    await seedRealAstrologers();
    app.listen(PORT, () => console.log(`AstroVyoma API running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
