'use strict';

// Agora RTC token issuing.
//
// This used to return `{ token: 'dev-mock-token-...' }` whenever the Agora keys
// were absent. In production that was silent: startConsultation happily created
// an active consultation with started_at set, the client tried to join a channel
// with a token Agora rejects, the call never connected — and endConsultation
// still billed duration x price_per_min from the user's wallet. The user paid
// for a call that could not have worked.
//
// The mock is now confined to non-production, and callers can ask whether Agora
// is usable before starting anything billable.

let RtcTokenBuilder, RtcRole;
try {
  const agoraToken = require('agora-token');
  RtcTokenBuilder = agoraToken.RtcTokenBuilder;
  RtcRole = agoraToken.RtcRole;
} catch (e) {
  console.warn('agora-token not available');
}

const TOKEN_TTL_SECONDS = 3600;

function isConfigured() {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  return !!(
    appId &&
    appCertificate &&
    appId !== 'your_agora_app_id' &&
    RtcTokenBuilder
  );
}

// Returns { configured, token, appId }. When not configured, `configured` is
// false and there is no usable token — callers must not begin a billable
// session. Never throws, so a misconfiguration cannot take a request down.
function generateToken(channelName, uid, role = 'publisher') {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      return { configured: false, token: null, appId: null };
    }
    // Local development only: lets the UI render without Agora credentials.
    return {
      configured: false,
      token: 'dev-mock-token-' + channelName,
      appId: process.env.AGORA_APP_ID || 'dev-app-id',
      dev_mock: true,
    };
  }

  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  let token = '';
  try {
    token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    );
  } catch (e) {
    console.error('agora: token generation failed:', e.message);
  }

  // A malformed app id or certificate makes the builder return an empty string
  // rather than throwing. Treating that as success would put us straight back
  // to billing for a call that cannot connect, so report it as unconfigured.
  if (!token) {
    console.error('agora: empty token generated — check AGORA_APP_ID / AGORA_APP_CERTIFICATE');
    return { configured: false, token: null, appId: null };
  }

  return { configured: true, token, appId: process.env.AGORA_APP_ID };
}

module.exports = { generateToken, isConfigured };
