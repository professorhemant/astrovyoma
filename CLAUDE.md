# AstroVyoma — Claude Code Instructions

## Deployment Workflow
- GitHub auto-deploy NOT reliable — always use `railway up` manually.
- Backend deploy: `RAILWAY_TOKEN=6895367b-32cc-46d6-8775-5590e5437b0d railway up --service backend --detach` from ROOT (C:\Users\hks26\AstroVyoma)
- Frontend deploy: `cd frontend && RAILWAY_TOKEN=6895367b-32cc-46d6-8775-5590e5437b0d railway up --service frontend --detach` — MUST run from inside frontend/ (running from root times out due to upload size).
- Backend URL: https://backend-production-6068.up.railway.app
- Frontend URL: https://frontend-production-cceb.up.railway.app
- Custom domain: https://astrovyoma.com (use this for verification, not the railway.app URL)
- After deploying, wait ~3-5 minutes for build + deploy to complete before testing.
- Always verify the live site after deploy — do not claim done without checking.

## Verification Before Claiming Done
- After any kundali/chart change: call the live API directly to verify calculation output.
  ```
  POST https://backend-production-6068.up.railway.app/api/kundali/generate-public
  Body: {"name":"Test","dob":"1961-01-31","birth_time":"23:47:00","birth_place":"Pilani, Rajasthan, India"}
  ```
- Check `chart.divisional_charts.navamsha` for Navamsha signs.
- Confirm Ketu Navamsha ≠ Rahu Navamsha (must differ by 6 signs — Libra vs Aries for this test case).
- For frontend chart changes: take a screenshot or use Playwright to confirm visually.

## Tech Stack Notes
- Frontend: React + Vite + TailwindCSS + Framer Motion
- Backend: Node.js + Express + Sequelize + PostgreSQL
- Astrology engine: `sweph` npm (Swiss Ephemeris, Moshier analytical theory — no .se1 files needed)
- Ayanamsha: Lahiri (Chitrapaksha), SE_SIDM_LAHIRI = 1
- House system: Whole Sign (W)
- Nodes: True Rahu/Ketu (SE_TRUE_NODE = 11), Ketu = Rahu + 180°
- AI chatbot: Anthropic claude-sonnet-4-6 (only in chatbot — NOT in kundali calculations)
- Geocoding: Nominatim (OpenStreetMap), no API key needed
- Auth: JWT
- Local run: `cd backend && npm run dev` + `cd frontend && npm run dev`

## Kundali Engine Rules (backend/src/services/kundaliEngine.js)
- NAVAMSHA_START formula: Chara signs→Aries(0), Sthira→Capricorn(9), Dvishvabhava→Cancer(3)
- Ketu Navamsha is ALWAYS overridden to Rahu Navamsha + 6 signs (classical rule: Ketu = opposite Rahu)
- Divisional chart Lagna: compute separately via `getNavamsha(ascDeg)` — do NOT reuse D-1 lagna
- Saptamsha (D-7) Lagna: similarly compute via `getSaptamsha(ascDeg)`

## NorthIndianChart Component (frontend/src/components/NorthIndianChart.jsx)
- Shows RASHI (sign) numbers 1–12, not house numbers
- H1 is always top diamond (fixed); signs rotate by lagna
- Formula: `signIdx = (lagnaIdx + h - 1) % 12`, `signNum = signIdx + 1`
- Used for both Lagna (D-1) and Navamsha (D-9) charts — same component, different `lagna` prop

## Pandit Portal
- URL: /pandit-portal (astrologer-side login: online toggle, earnings)
- Login: mobile 9460307786 / PIN 7786 (Pt. Pramod Kumar Asopa)
- Do NOT put this back on /pandit — that path is the customer-facing AI avatar
  (PanditJiPage), which ChatbotPage, TarotPage and FloatingAIButton all link to.
