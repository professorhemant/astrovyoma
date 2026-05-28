let RtcTokenBuilder, RtcRole;
try {
  const agoraToken = require('agora-token');
  RtcTokenBuilder = agoraToken.RtcTokenBuilder;
  RtcRole = agoraToken.RtcRole;
} catch (e) {
  console.warn('agora-token not available');
}

function generateToken(channelName, uid, role = 'publisher') {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate || appId === 'your_agora_app_id' || !RtcTokenBuilder) {
    return { token: 'dev-mock-token-' + channelName, appId: appId || 'dev-app-id' };
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, rtcRole, privilegeExpiredTs, privilegeExpiredTs);

  return { token, appId };
}

module.exports = { generateToken };
