# AstroVyoma — Vedic Astrology Platform

A complete professional astrology platform with React frontend + Node.js backend.

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + Sequelize + PostgreSQL
- **Astrology Engine**: Swiss Ephemeris (sweph) with pure-JS fallback
- **AI**: Anthropic Claude (claude-sonnet-4-6)
- **Video/Audio**: Agora RTC SDK

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env`:
```
PORT=5000
DB_URL=postgresql://username:password@localhost:5432/astrovyoma
JWT_SECRET=your_secret_here
ANTHROPIC_API_KEY=your_anthropic_key     # from console.anthropic.com
AGORA_APP_ID=your_agora_app_id           # from console.agora.io (optional)
AGORA_APP_CERTIFICATE=your_certificate   # optional
NODE_ENV=development
```

Create the database:
```bash
createdb astrovyoma
```

Start the backend:
```bash
npm run dev
```

The server starts on http://localhost:5000 and auto-seeds 12 demo astrologers.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## Getting API Keys

### Anthropic API Key (required for AI chat)
1. Go to https://console.anthropic.com
2. Create an account and generate an API key
3. Add to `backend/.env` as `ANTHROPIC_API_KEY`

### Agora (optional, for live audio/video)
1. Go to https://console.agora.io
2. Create a project
3. Copy App ID and Primary Certificate
4. Add to `backend/.env`
5. Chat consultations work without Agora

### PostgreSQL
- Local: `createdb astrovyoma`
- Railway: Create a PostgreSQL service and copy the connection URL
- Supabase: Create a project and use the connection string

---

## Features

- **Free Kundali Generation** — Swiss Ephemeris precision, Vedic calculations
- **Planetary Positions** — All 9 planets (Sun through Ketu) in sidereal zodiac
- **Nakshatra Analysis** — All 27 Nakshatras with personality traits
- **Dasha Timeline** — Vimshottari dasha calculation
- **AI Chatbot** — Claude-powered with birth chart context
- **Astrologer Marketplace** — 12 seeded demo astrologers
- **Smart Matching** — Weighted algorithm by rating, orders, availability
- **Consultation Modes** — Chat, Audio, Video
- **Wallet System** — Add funds, per-minute deduction
- **Daily Horoscope** — All 12 signs, 7 unique texts per week
- **Find Your Purpose** — Swabhav, karma path, life purpose
- **Cosmic Design** — Full dark theme with particle animations

---

## Project Structure

```
AstroVyoma/
├── backend/
│   ├── server.js
│   ├── .env
│   └── src/
│       ├── models/          User, Astrologer, Kundali, Consultation, Message, Transaction, Review
│       ├── controllers/     auth, kundali, astrologer, consultation, chatbot, wallet, horoscope, geocode
│       ├── services/        ephemerisService, agoraService, chatbotService, matchingService, walletService
│       ├── middleware/       auth.js (JWT)
│       ├── routes/           index.js
│       └── seeders/          astrologerSeeder.js
└── frontend/
    ├── src/
    │   ├── pages/           Home, Kundali, Purpose, Astrologers, Detail, Consultation, Chat, Login, Register, Dashboard, Wallet
    │   ├── components/      CosmicBackground, ZodiacWheel, AstrologerCard, KundaliChart, ChatMessage, Navbar
    │   ├── context/          AuthContext.jsx
    │   └── api/              index.js
    └── tailwind.config.js
```

---

## Notes

- The sweph (Swiss Ephemeris) package requires native build tools. If it fails to install or run, the system automatically falls back to pure-JS astronomy calculations that are accurate enough for demonstration.
- Agora audio/video requires valid credentials. Chat consultations work fully without Agora.
- Daily horoscopes rotate based on day of week (7 unique texts per sign).
- Geocoding uses the free Nominatim (OpenStreetMap) API — no key required.
