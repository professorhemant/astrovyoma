'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Palm photo → feature codes
//
// This does perception only. It emits the same enum codes the deterministic
// palmistry engine already consumes, so palmistryController.buildReading() is
// untouched.
//
// What is deliberately NOT inferred from a photo:
//   - mounts        fleshy elevations; a flat 2D image cannot measure them
//                   (palmists assess them by touch)
//   - special_mark  millimetre-scale, low-contrast; pure hallucination bait
//   - thumb         the enum conflates length (visible) with flexibility
//                   (only observable by physically bending the thumb)
// These stay user-supplied. Asking a vision model for them yields confident
// answers with nothing behind them.
//
// Palm images are biometric data: they are read from the request, sent once for
// analysis, and never written to disk, database, or logs.
// ─────────────────────────────────────────────────────────────────────────────

const Anthropic = require('@anthropic-ai/sdk');

// Constructed on first use, not at import — consultationAiController builds its
// Groq client at module load, which takes the whole server down when the key is
// absent. Don't repeat that here.
let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const MODEL = process.env.PALM_VISION_MODEL || 'claude-opus-4-8';

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

const SCHEMA = {
  type: 'object',
  properties: {
    is_palm: {
      type: 'boolean',
      description: 'True only if this is a photo of an open human palm.',
    },
    quality: {
      type: 'string',
      enum: ['good', 'usable', 'too_poor'],
      description: 'too_poor when lines cannot be traced — blur, glare, shadow, low resolution, or a partly cropped palm.',
    },
    quality_note: {
      type: 'string',
      description: 'One short sentence the user can act on, e.g. "Too dark — retake in daylight with the palm flat." Empty when quality is good.',
    },
    detected_hand: {
      type: 'string',
      enum: ['left', 'right', 'unclear'],
      description: 'Which hand this is, from thumb position.',
    },
    hand_type:     { type: 'string', enum: ENUMS.hand_type,     description: 'Palm shape + finger length: square palm & short fingers = earth; square palm & long fingers = air; long palm & short fingers = fire; long palm & long fingers = water.' },
    life_line:     { type: 'string', enum: ENUMS.life_line },
    heart_line:    { type: 'string', enum: ENUMS.heart_line },
    head_line:     { type: 'string', enum: ENUMS.head_line },
    fate_line:     { type: 'string', enum: ENUMS.fate_line },
    sun_line:      { type: 'string', enum: ENUMS.sun_line },
    finger_length: { type: 'string', enum: ENUMS.finger_length },
    unclear_features: {
      type: 'array',
      items: { type: 'string', enum: Object.keys(ENUMS) },
      description: 'Every feature above you could NOT actually see well enough to judge. Be honest — listing a feature here is always better than guessing it.',
    },
  },
  required: [
    'is_palm','quality','quality_note','detected_hand',
    ...Object.keys(ENUMS),
    'unclear_features',
  ],
  additionalProperties: false,
};

const SYSTEM = `You read palm photographs and report only what is physically visible in the image.

Rules:
- Report what you can see. If a line is not traceable in this image, name it in unclear_features rather than guessing a plausible value.
- Judge hand_type from geometry you can measure: palm width vs length, and finger length relative to palm length.
- Do not infer character, personality, fortune, or life events. Another system does the interpretation. Your only job is to describe the visible anatomy in the given vocabulary.
- If the image is not an open human palm, set is_palm false and stop.`;

async function analyseImage(req, res) {
  try {
    const anthropic = getClient();
    if (!anthropic) {
      return res.status(503).json({
        error: 'Palm photo analysis is not configured yet.',
        detail: 'ANTHROPIC_API_KEY is not set on the server.',
      });
    }

    const { image, media_type, hand } = req.body;
    if (!image) return res.status(400).json({ error: 'image is required' });

    // Accept a data URL or bare base64
    const m = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/.exec(image);
    const mediaType = m ? m[1] : (media_type || 'image/jpeg');
    const data = m ? m[2] : image;

    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(mediaType)) {
      return res.status(400).json({ error: 'Unsupported image type', valid: ['image/jpeg','image/png','image/webp'] });
    }
    // ~7MB of base64 ≈ 5MB of image; the API caps individual images well below this.
    if (data.length > 7_000_000) {
      return res.status(413).json({ error: 'Image too large — please use a photo under 5MB.' });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      system: SYSTEM,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: hand === 'left' || hand === 'right'
              ? `The user says this is their ${hand} palm. Describe the visible features.`
              : 'Describe the visible features of this palm.' },
        ],
      }],
    });

    if (response.stop_reason === 'refusal') {
      return res.status(422).json({ error: 'This image could not be analysed. Please try a different photo.' });
    }

    const text = response.content.find(b => b.type === 'text')?.text;
    if (!text) return res.status(502).json({ error: 'Analysis returned no result. Please try again.' });

    let v;
    try { v = JSON.parse(text); }
    catch { return res.status(502).json({ error: 'Analysis returned an unreadable result. Please try again.' }); }

    if (!v.is_palm) {
      return res.status(422).json({ error: "That doesn't look like an open palm. Please upload a clear photo of your palm." });
    }
    if (v.quality === 'too_poor') {
      return res.status(422).json({ error: v.quality_note || 'The photo is too unclear to read. Please retake it.', retry: true });
    }

    // Drop anything the model flagged as not actually visible, so the reading
    // engine never receives a guessed feature.
    const unclear = new Set(v.unclear_features || []);
    const features = {};
    for (const k of Object.keys(ENUMS)) {
      if (!unclear.has(k) && v[k]) features[k] = v[k];
    }

    // The engine hard-requires these four.
    const missing = ['hand_type','life_line','heart_line','head_line'].filter(k => !features[k]);
    if (missing.length) {
      return res.status(422).json({
        error: 'Some key lines were not clear enough to read in this photo.',
        unreadable: missing,
        retry: true,
        note: v.quality_note || 'Try again with the palm flat, fingers slightly spread, in even daylight.',
      });
    }

    res.json({
      features,
      quality: v.quality,
      quality_note: v.quality_note || '',
      detected_hand: v.detected_hand,
      hand_mismatch: (hand === 'left' || hand === 'right')
        && v.detected_hand !== 'unclear' && v.detected_hand !== hand,
      unclear_features: [...unclear],
      // Everything the photo cannot establish — surfaced so the UI can say so
      // instead of letting the engine imply these were read.
      not_from_photo: ['mounts', 'special_mark', 'thumb'],
      model: MODEL,
    });
  } catch (err) {
    console.error('[palmistryVision]', err?.message || err);
    res.status(500).json({ error: 'Palm analysis failed. Please try again.' });
  }
}

module.exports = { analyseImage };
