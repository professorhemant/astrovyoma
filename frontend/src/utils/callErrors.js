/**
 * Turns a failure to join a call into something a person can act on.
 *
 * The first version of this checked `err.name` against the DOM's own
 * permission errors — NotAllowedError and friends. Agora does not throw those.
 * It throws an AgoraRTCException carrying a `code` such as PERMISSION_DENIED,
 * so a plainly blocked microphone fell past the check and surfaced as "Could not
 * join the call", which tells the astrologer nothing and me nothing either.
 *
 * Both are handled now, and anything unrecognised keeps its underlying reason
 * rather than being flattened into a shrug — an error nobody can diagnose is
 * worse than an ugly one.
 */

const MIC = /PERMISSION_DENIED|NotAllowedError|SecurityError/i;
const BUSY = /NOT_READABLE|NotReadableError|TrackStartError/i;
const MISSING = /DEVICE_NOT_FOUND|NotFoundError|DevicesNotFoundError/i;
const NETWORK = /CAN_NOT_GET_GATEWAY_SERVER|NETWORK_ERROR|NETWORK_TIMEOUT|OPERATION_ABORTED/i;
const TOKEN = /INVALID_TOKEN|TOKEN_EXPIRED|DYNAMIC_KEY|INVALID_VENDOR_KEY|CAN_NOT_GET_GATEWAY_SERVER/i;
const INSECURE = /WEB_SECURITY_RESTRICT/i;

export function describeCallError(err, { video = false } = {}) {
  // The server's own message, when there is one, is already written for a human.
  const fromServer = err?.response?.data?.error;
  if (fromServer) return fromServer;

  const signal = [err?.code, err?.name, err?.message].filter(Boolean).join(' ');
  const devices = video ? 'camera and microphone' : 'microphone';

  if (INSECURE.test(signal)) {
    return 'Calls need a secure connection. Open the site over https and try again.';
  }
  if (MIC.test(signal)) {
    return `Your ${devices} is blocked. Tap the padlock in the address bar, allow it, then answer again.`;
  }
  if (MISSING.test(signal)) {
    return `No ${devices} was found on this device.`;
  }
  if (BUSY.test(signal)) {
    return `Your ${devices} is being used by another app. Close it and answer again.`;
  }
  if (TOKEN.test(signal) || NETWORK.test(signal)) {
    return 'Could not reach the call server. Check your connection and try again.';
  }

  // Unrecognised. Keep the detail — it is the only thing that makes the next
  // one of these diagnosable.
  const detail = err?.code || err?.message || String(err);
  return `Could not join the call (${detail}).`;
}
