const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { OtpCode } = require('../models');

const OTP_TTL_MS = 5 * 60 * 1000;

// Codes are persisted, not held in memory — a Railway restart used to invalidate
// every code already emailed out, and a second instance could never see a code
// written by the first. Stored as a hash: a short-lived credential has no
// business being readable in a database dump.
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

function generateOtp() {
  // crypto.randomInt is uniform and unpredictable; Math.random is neither, and
  // this value guards account recovery.
  return String(crypto.randomInt(100000, 1000000));
}

async function storeOtp(identifier, otp) {
  const values = {
    identifier,
    otp_hash: hashOtp(otp),
    expires_at: new Date(Date.now() + OTP_TTL_MS),
    last_sent_at: new Date(),
  };
  const existing = await OtpCode.findOne({ where: { identifier } });
  if (existing) await existing.update(values);
  else await OtpCode.create(values);
}

async function verifyOtp(identifier, otp) {
  const record = await OtpCode.findOne({ where: { identifier } });
  if (!record) return { valid: false, reason: 'OTP not found. Please request a new one.' };
  if (Date.now() > new Date(record.expires_at).getTime()) {
    await record.destroy();
    return { valid: false, reason: 'OTP expired. Please request a new one.' };
  }
  // Constant-time compare so a wrong code cannot be narrowed down by timing.
  const a = Buffer.from(record.otp_hash, 'hex');
  const b = Buffer.from(hashOtp(otp), 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: 'Invalid OTP. Please try again.' };
  }
  await record.destroy();
  return { valid: true };
}

// Resend throttle, persisted alongside the code for the same reason.
async function secondsUntilResendAllowed(identifier, throttleMs) {
  const record = await OtpCode.findOne({ where: { identifier }, attributes: ['last_sent_at'] });
  if (!record) return 0;
  const elapsed = Date.now() - new Date(record.last_sent_at).getTime();
  return elapsed >= throttleMs ? 0 : Math.ceil((throttleMs - elapsed) / 1000);
}

// ─── DELIVERY ────────────────────────────────────────────────────────────────
// Railway blocks outbound SMTP: connecting to smtp.gmail.com:465 times out from
// the container even over IPv4. Resend goes over HTTPS on 443, which is never
// blocked, so it is preferred whenever RESEND_API_KEY is set. SMTP stays as a
// fallback for local development.

function otpEmailHtml(heading, otp, footer) {
  return `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0d0728;color:#f0e6c0;padding:32px;border-radius:12px;">
        <h2 style="color:#C9A84C;font-family:serif;margin-bottom:8px;">&#10022; AstroVyoma</h2>
        <p style="color:#d4c48a;margin-bottom:24px;">${heading}</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#C9A84C;background:#1a0a3a;padding:20px;border-radius:8px;text-align:center;">${otp}</div>
        <p style="color:#9e8a6a;font-size:12px;margin-top:24px;">${footer}</p>
      </div>
    `;
}

async function sendViaResend(to, subject, html) {
  // Resend only accepts a verified domain in `from`. Its shared onboarding
  // sender works without one, but can only deliver to the account owner's
  // address — fine for setup, so point EMAIL_FROM at your own domain later.
  const from = process.env.EMAIL_FROM || 'AstroVyoma <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend responded ${res.status}: ${body.slice(0, 300)}`);
  }
}

async function sendViaSmtp(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    // The container has no working IPv6 route; resolving to AAAA gave
    // ENETUNREACH, so pin the connection to IPv4.
    family: 4,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    // Without these an unreachable mail server holds the socket open
    // indefinitely instead of erroring.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: `"AstroVyoma ✦" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

async function deliver(to, subject, html, logTag, otp) {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, subject, html);
    console.log(`[${logTag}] Email sent to ${to} via Resend`);
    return;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    await sendViaSmtp(to, subject, html);
    console.log(`[${logTag}] Email sent to ${to} via SMTP`);
    return;
  }

  console.log(`[${logTag}] ${to} → ${otp} (set RESEND_API_KEY to send real emails)`);
}

async function sendOtpEmail(email, otp) {
  await deliver(
    email,
    'Your AstroVyoma Verification Code',
    otpEmailHtml(
      'Your verification code is:',
      otp,
      'This code expires in 5 minutes. Do not share it with anyone.'
    ),
    'OTP',
    otp
  );
}

async function sendPasswordResetEmail(email, otp) {
  await deliver(
    email,
    'Reset your AstroVyoma password',
    otpEmailHtml(
      'Use this code to reset your password:',
      otp,
      'This code expires in 5 minutes. If you did not request a password reset, you can safely ignore this email — your password will not change.'
    ),
    'RESET',
    otp
  );
}

// ── Astrologer approval ──────────────────────────────────────────────────────
// The application form promises "our team will review it and contact you at
// <email>", and until now nothing ever did. An approval minted a PIN, showed it
// to the admin once, and left the astrologer with no address to log in at, no
// login id and no PIN — so unless someone remembered to message them by hand,
// an approved astrologer simply never appeared online.
async function sendAstrologerApprovalEmail(email, { name, phone, pin, portalUrl }) {
  const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0d0728;color:#f0e6c0;padding:32px;border-radius:12px;">
        <h2 style="color:#C9A84C;font-family:serif;margin-bottom:8px;">&#10022; AstroVyoma</h2>
        <p style="color:#d4c48a;font-size:18px;margin-bottom:8px;">Namaste ${name}, your application is approved.</p>
        <p style="color:#9e8a6a;font-size:14px;margin-bottom:24px;">
          You now have an astrologer account. Seekers cannot reach you until you sign in
          and switch yourself online, so please do that first.
        </p>

        <p style="color:#d4c48a;margin-bottom:8px;font-size:14px;"><strong>1.</strong> Open your Pandit Portal</p>
        <p style="margin:0 0 20px;"><a href="${portalUrl}" style="color:#C9A84C;font-size:15px;">${portalUrl}</a></p>

        <p style="color:#d4c48a;margin-bottom:8px;font-size:14px;"><strong>2.</strong> Sign in with these</p>
        <table style="width:100%;background:#1a0a3a;border-radius:8px;padding:4px;margin-bottom:20px;">
          <tr><td style="padding:12px 16px;color:#9e8a6a;font-size:13px;">Mobile number</td>
              <td style="padding:12px 16px;color:#C9A84C;font-size:18px;font-weight:bold;text-align:right;">${phone}</td></tr>
          <tr><td style="padding:12px 16px;color:#9e8a6a;font-size:13px;">4-digit PIN</td>
              <td style="padding:12px 16px;color:#C9A84C;font-size:24px;font-weight:bold;letter-spacing:6px;text-align:right;">${pin}</td></tr>
        </table>

        <p style="color:#d4c48a;margin-bottom:8px;font-size:14px;"><strong>3.</strong> Switch the toggle to Online</p>
        <p style="color:#9e8a6a;font-size:13px;margin-bottom:24px;">
          That is what puts you in front of seekers. Go offline again whenever you like —
          nobody is penalised for being unavailable.
        </p>

        <p style="color:#9e8a6a;font-size:12px;border-top:1px solid #2a1a4a;padding-top:16px;">
          The Pandit Portal is not the same as the ordinary site login. Signing in on the
          main site makes you a customer and will not put you online.
          Keep this PIN private; ask us to reset it if it is ever seen by anyone else.
        </p>
      </div>
    `;
  await deliver(email, 'Your AstroVyoma astrologer account is ready', html, 'ASTRO-APPROVED', pin);
}

async function sendAstrologerRejectionEmail(email, { name, reason }) {
  const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0d0728;color:#f0e6c0;padding:32px;border-radius:12px;">
        <h2 style="color:#C9A84C;font-family:serif;margin-bottom:8px;">&#10022; AstroVyoma</h2>
        <p style="color:#d4c48a;font-size:16px;margin-bottom:16px;">Namaste ${name},</p>
        <p style="color:#9e8a6a;font-size:14px;margin-bottom:16px;">
          Thank you for applying to join AstroVyoma. We are not able to take your
          application forward at this time.
        </p>
        ${reason ? `<p style="color:#d4c48a;font-size:14px;background:#1a0a3a;padding:16px;border-radius:8px;margin-bottom:16px;">${reason}</p>` : ''}
        <p style="color:#9e8a6a;font-size:13px;">You are welcome to apply again in future.</p>
      </div>
    `;
  await deliver(email, 'About your AstroVyoma application', html, 'ASTRO-REJECTED', '-');
}

module.exports = { generateOtp, storeOtp, verifyOtp, secondsUntilResendAllowed, sendOtpEmail, sendPasswordResetEmail, sendAstrologerApprovalEmail, sendAstrologerRejectionEmail };
