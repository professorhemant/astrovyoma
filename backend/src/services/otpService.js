const nodemailer = require('nodemailer');

// In-memory OTP store: key = email/phone, value = { otp, expiresAt }
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOtp(identifier, otp) {
  otpStore.set(identifier, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min
}

function verifyOtp(identifier, otp) {
  const record = otpStore.get(identifier);
  if (!record) return { valid: false, reason: 'OTP not found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    return { valid: false, reason: 'OTP expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, reason: 'Invalid OTP. Please try again.' };
  otpStore.delete(identifier);
  return { valid: true };
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

module.exports = { generateOtp, storeOtp, verifyOtp, sendOtpEmail, sendPasswordResetEmail };
