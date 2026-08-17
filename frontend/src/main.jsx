import React from 'react';
import ReactDOM from 'react-dom/client'; // v7-admin-final
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// ── Sentry (JS error monitoring) ──────────────────────────────────────────────
// Set VITE_SENTRY_DSN in Railway env vars to activate.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,       // capture 10% of page loads for perf traces
    replaysOnErrorSampleRate: 1, // full session replay on every error
  });
}

// ── Google Analytics GA4 ──────────────────────────────────────────────────────
// Set VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) in Railway env vars to activate.
if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
  const s = document.createElement('script');
  s.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, { send_page_view: false });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
