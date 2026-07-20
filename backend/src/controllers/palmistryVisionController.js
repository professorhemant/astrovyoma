'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Palm photo → feature codes  (Groq vision)
//
// Perception only. Emits the same enum codes the deterministic palmistry engine
// already consumes, so palmistryController.buildReading() is untouched.
//
// Groq supports JSON *mode* but not json_schema, so the model can return any
// shape it likes — including invented enum values. Everything it returns is
// therefore validated against ENUMS below and silently dropped if it doesn't
// match. Never pass a model-supplied string to the engine unchecked.
//
// What is deliberately NOT inferred from a photo:
//   - mounts        fleshy elevations; a flat 2D image cannot measure them
//                   (palmists assess them by touch)
//   - special_mark  millimetre-scale, low-contrast; pure hallucination bait
//   - thumb         the enum conflates length (visible) with flexibility
//                   (only observable by physically bending the thumb)
// These stay user-supplied.
//
// Palm images are biometric data: read from the request, sent once for
// analysis, never written to disk, database, or logs.
// ─────────────────────────────────────────────────────────────────────────────

const Groq = require('groq-sdk');

// Built on first use, not at import. consultationAiController constructs its
// Groq client at module load, which takes the whole server down when the key is
// missing — don't repeat that here.
let client = null;
function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

// Groq's current vision model. Llama-4-Maverick was deprecated 2026-02-20, so
// this is env-overridable to avoid another silent breakage on deprecation.
const MODEL = process.env.PALM_VISION_MODEL || 'qwen/qwen3.6-27b';

// Must stay in sync with the tables in palmistryController.js
const ENUMS = {
  hand_type:     ['earth','air','fire','water'],
  life_line:     ['long_deep','long_faint','short','broken','chained','forked_end','double'],
  heart_line:    ['long_curved','long_straight','short','chained','broken','forked','absent'],
  head_line:     ['long_straight','long_sloping','short','broken','forked','chained','absent'],
  fate_line:     ['strong_clear','from_life','from_moon','broken','absent','late_start'],
  sun_line:      ['present_strong','present_faint','absent','multiple'],
  finger_length: ['long_index','long_middle','long_ring','long_little','balanced'],
};

const PROMPT = `You are examining a photograph of a human palm. Report ONLY what is physically visible.

Return a single JSON object with exactly these keys:

{
  "is_palm": true | false,
  "quality": "good" | "usable" | "too_poor",
  "quality_note": "one short actionable sentence, or empty string if quality is good",
  "detected_hand": "left" | "right" | "unclear",
  "hand_type": ${JSON.stringify(ENUMS.hand_type)},
  "life_line": ${JSON.stringify(ENUMS.life_line)},
  "heart_line": ${JSON.stringify(ENUMS.heart_line)},
  "head_line": ${JSON.stringify(ENUMS.head_line)},
  "fate_line": ${JSON.stringify(ENUMS.fate_line)},
  "sun_line": ${JSON.stringify(ENUMS.sun_line)},
  "finger_length": ${JSON.stringify(ENUMS.finger_length)},
  "unclear_features": ["names of any features above you could NOT actually see"]
}

Rules:
- Each feature value MUST be exactly one string from its list above. Never invent a value.
- If a line is not clearly traceable in THIS image, put its name in unclear_features. Listing it there is always better than guessing. Guessing is the worst possible outcome.
- hand_type comes from measurable geometry: square palm + short fingers = earth; square palm + long fingers = air; long palm + short fingers = fire; long palm + long fingers = water.
- "quality": "too_poor" if blur, glare, shadow, low resolution or cropping stop you tracing the major lines.
- Do NOT infer character, personality, fortune or life events. A separate system does interpretation. You only describe visible anatomy.
- If the image is not an open human palm, return is_palm false and set every feature to null.

Output the raw JSON object and nothing else. No markdown fences, no explanation, no preamble.`;

// qwen3.6 is a reasoning model: it emits a <think> block before the answer, and
// that block contains braces and quoted key names that look like JSON. Strip it
// first, or a naive brace match parses the reasoning instead of the result.
function extractJson(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;

  let s = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')  // completed reasoning
    .replace(/<\/?think>/gi, '')                // stray/unclosed tag
    .replace(/```(?:json)?/gi, '')               // markdown fences
    .trim();

  try { return JSON.parse(s); } catch {}

  // Scan for a balanced object, preferring the last one (the answer usually
  // follows any narration). String-aware so braces inside values don't confuse
  // the depth count.
  const found = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '{') continue;
    let depth = 0, inStr = false, esc = false;
    for (let j = i; j < s.length; j++) {
      const ch = s[j];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { found.push(s.slice(i, j + 1)); i = j; break; }
      }
    }
  }
  for (const candidate of found.reverse()) {
    try {
      const o = JSON.parse(candidate);
      if (o && typeof o === 'object' && 'is_palm' in o) return o;
    } catch {}
  }
  return null;
}

// Deliberately NOT using Groq's response_format: json_object. Its server-side
// validator rejects the whole request with json_validate_failed when the model
// slips (observed in production, with an empty failed_generation), so the text
// never reaches us and extractJson never gets a chance. We validate every field
// against ENUMS regardless, so JSON mode was buying a failure mode, not safety.
async function callModel(groq, mediaType, data, hand) {
  const res = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: PROMPT + (hand === 'left' || hand === 'right'
            ? `\n\nThe user says this is their ${hand} palm.` : '') },
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${data}` } },
      ],
    }],
  });
  const raw = res.choices?.[0]?.message?.content;
  const parsed = extractJson(raw);
  // Log a short excerpt only — never the image, never the full body.
  if (!parsed) console.warn('[palmistryVision] unparseable output:', String(raw ?? '').slice(0, 200));
  return parsed;
}

async function analyseImage(req, res) {
  try {
    const groq = getClient();
    if (!groq) {
      return res.status(503).json({
        error: 'Palm photo analysis is not configured yet.',
        detail: 'GROQ_API_KEY is not set on the server.',
      });
    }

    const { image, media_type, hand } = req.body;
    if (!image) return res.status(400).json({ error: 'image is required' });

    const m = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/.exec(image);
    const mediaType = m ? m[1] : (media_type || 'image/jpeg');
    const data = m ? m[2] : image;

    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(mediaType)) {
      return res.status(400).json({ error: 'Unsupported image type', valid: ['image/jpeg','image/png','image/webp'] });
    }
    // Groq caps a request containing an image at 20MB; stay well under it.
    if (data.length > 7_000_000) {
      return res.status(413).json({ error: 'Image too large — please use a photo under 5MB.' });
    }

    // One retry: JSON mode is not a guarantee, and a malformed first response
    // is common enough that failing the user on it would be needless.
    let v = await callModel(groq, mediaType, data, hand);
    if (!v) v = await callModel(groq, mediaType, data, hand);
    if (!v) return res.status(502).json({ error: 'Could not read the analysis result. Please try again.' });

    if (v.is_palm === false || v.is_palm === 'false') {
      return res.status(422).json({ error: "That doesn't look like an open palm. Please upload a clear photo of your palm." });
    }
    if (v.quality === 'too_poor') {
      return res.status(422).json({
        error: typeof v.quality_note === 'string' && v.quality_note.trim()
          ? v.quality_note
          : 'The photo is too unclear to read. Please retake it.',
        retry: true,
      });
    }

    // Validate every value against the engine's vocabulary. Anything the model
    // flagged unclear, invented, or returned in the wrong shape is dropped —
    // the engine must never receive a guessed or unrecognised feature.
    const flagged = new Set(Array.isArray(v.unclear_features) ? v.unclear_features : []);
    const features = {};
    const rejected = [];
    for (const [key, allowed] of Object.entries(ENUMS)) {
      if (flagged.has(key)) continue;
      const val = v[key];
      if (typeof val === 'string' && allowed.includes(val)) features[key] = val;
      else if (val != null) rejected.push(`${key}=${String(val).slice(0, 40)}`);
    }
    if (rejected.length) {
      console.warn('[palmistryVision] discarded invalid values:', rejected.join(', '));
    }

    // Return whatever WAS readable rather than discarding a partial read. An
    // earlier version required all four engine-mandatory features and threw
    // everything away if one was unclear — so a photo with a perfectly legible
    // hand shape but a faint head line filled in nothing at all. Partial is
    // useful: the user completes the rest in the form, which is what the form
    // is for. Only fail outright when nothing at all could be read.
    if (Object.keys(features).length === 0) {
      return res.status(422).json({
        error: (typeof v.quality_note === 'string' && v.quality_note.trim())
          || 'Nothing could be read clearly in this photo.',
        retry: true,
        note: 'Try again with the palm flat, fingers slightly spread, in even daylight.',
      });
    }

    const unclear = [
      ...[...flagged].filter(k => k in ENUMS),
      ...rejected.map(r => r.split('=')[0]),
    ];
    // Engine-mandatory features the photo could not supply; the user must set
    // these before a reading can be generated.
    const needs_manual = ['hand_type','life_line','heart_line','head_line']
      .filter(k => !features[k]);

    res.json({
      features,
      quality: ['good','usable'].includes(v.quality) ? v.quality : 'usable',
      quality_note: typeof v.quality_note === 'string' ? v.quality_note : '',
      detected_hand: ['left','right','unclear'].includes(v.detected_hand) ? v.detected_hand : 'unclear',
      hand_mismatch: (hand === 'left' || hand === 'right')
        && ['left','right'].includes(v.detected_hand) && v.detected_hand !== hand,
      unclear_features: [...new Set(unclear)],
      needs_manual,
      partial: needs_manual.length > 0,
      // Things a photo cannot establish — surfaced so the UI can say so rather
      // than letting the reading imply they were observed.
      not_from_photo: ['mounts', 'special_mark', 'thumb'],
      model: MODEL,
    });
  } catch (err) {
    const msg = err?.message || String(err);
    const status = err?.status ?? err?.response?.status;
    const code = err?.error?.error?.code || err?.error?.code || '';
    console.error(`[palmistryVision] status=${status} code=${code} ${msg}`);

    // Classify on the HTTP status, not on the message text. An earlier version
    // matched /model/ and therefore reported Groq's rate-limit error ("Rate
    // limit reached for model ...") as a dead model, which sent operators
    // hunting for a model change when the real fix was to wait.
    if (status === 429) {
      return res.status(429).json({
        error: 'Palm reading is busy right now. Please try again in a minute.',
        retry: true,
      });
    }
    if (status === 404 || /model_not_found|decommission|deprecat/i.test(`${code} ${msg}`)) {
      return res.status(503).json({
        error: 'Palm photo analysis is temporarily unavailable.',
        detail: `Vision model "${MODEL}" was rejected by Groq (${code || status || 'unknown'}). Set PALM_VISION_MODEL to a current vision model.`,
      });
    }
    if (status === 413) {
      return res.status(413).json({ error: 'That image is too large. Please use a smaller photo.' });
    }
    res.status(500).json({
      error: 'Palm analysis failed. Please try again.',
      // Operational reason only — an upstream API status/code, never the image
      // and never a key. Without it, a misclassified failure is undiagnosable
      // in production, which is exactly what happened here.
      detail: `upstream ${status || 'error'}${code ? ` (${code})` : ''}`,
    });
  }
}

module.exports = { analyseImage };
