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

// The model every AI feature talks to.
//
// This was written out by hand at six call sites across five files. When Groq
// retired `llama-3.3-70b-versatile` in June 2026, all six broke at once and the
// chatbot, tarot, remedies and dream interpretation went down together on the
// live site — each one failing with a 404 from inside its own try/catch, so
// nothing announced it. Naming the model once means the next retirement is this
// line, not another hunt through the tree.
//
// Override with GROQ_MODEL to try a different one without a deploy.
const CHAT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// gpt-oss reasons before it answers, and bills the reasoning to the same token
// budget as the reply. Left at its default the reasoning ate the whole of a
// 900-token allowance and the answer came back cut off mid-sentence — valid
// prose, unparseable JSON. Low keeps the quality and roughly halves the spend.
const REASONING_EFFORT = 'low';

// One place where a request gets its model, so callers pass only what makes
// them different. `json: true` asks Groq to constrain the reply to a JSON
// object, which is a harder guarantee than asking for JSON in the prompt and
// stripping markdown fences off whatever comes back.
async function chatCompletion({ json = false, ...opts }) {
  return getGroq().chat.completions.create({
    model: CHAT_MODEL,
    reasoning_effort: REASONING_EFFORT,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
    ...opts,
  });
}

module.exports = { getGroq, isConfigured, chatCompletion, CHAT_MODEL };
