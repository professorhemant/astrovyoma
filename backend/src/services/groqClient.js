'use strict';

// Shared, lazily-constructed Groq client.
//
// Four controllers previously did `const groq = new Groq({ apiKey: ... })` at
// module scope. groq-sdk throws from its constructor when the key is missing or
// empty, so that ran at *import* time — meaning a missing, empty, or mistyped
// GROQ_API_KEY took down the entire API on boot, not just the AI features.
// Login, payments, kundali and everything else went with it.
//
// Building the client on first use instead keeps that failure inside the
// request handler, where each controller's existing try/catch turns it into a
// normal error response and the rest of the app keeps serving.

const Groq = require('groq-sdk');

let client = null;

function isConfigured() {
  return !!process.env.GROQ_API_KEY;
}

function getGroq() {
  if (!isConfigured()) {
    const err = new Error('GROQ_API_KEY is not configured on this server');
    err.status = 503;
    err.code = 'groq_not_configured';
    throw err;
  }
  if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

module.exports = { getGroq, isConfigured };
