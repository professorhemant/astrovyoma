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

async function sendOtpEmail(email, otp) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`[OTP] ${email} → ${otp} (set EMAIL_USER + EMAIL_PASS to send real emails)`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    // Without these a bad or unreachable mail server holds the socket open
    // indefinitely instead of erroring.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: `"AstroVyoma ✦" <${user}>`,
    to: email,
    subject: 'Your AstroVyoma Verification Code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0d0728;color:#f0e6c0;padding:32px;border-radius:12px;">
        <h2 style="color:#C9A84C;font-family:serif;margin-bottom:8px;">&#10022; AstroVyoma</h2>
        <p style="color:#d4c48a;margin-bottom:24px;">Your verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#C9A84C;background:#1a0a3a;padding:20px;border-radius:8px;text-align:center;">${otp}</div>
        <p style="color:#9e8a6a;font-size:12px;margin-top:24px;">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });

  console.log(`[OTP] Email sent to ${email}`);
}

async function sendPasswordResetEmail(email, otp) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`[RESET] ${email} → ${otp} (set EMAIL_USER + EMAIL_PASS to send real emails)`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    // Without these a bad or unreachable mail server holds the socket open
    // indefinitely instead of erroring.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: `"AstroVyoma ✦" <${user}>`,
    to: email,
    subject: 'Reset your AstroVyoma password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0d0728;color:#f0e6c0;padding:32px;border-radius:12px;">
        <h2 style="color:#C9A84C;font-family:serif;margin-bottom:8px;">&#10022; AstroVyoma</h2>
        <p style="color:#d4c48a;margin-bottom:24px;">Use this code to reset your password:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#C9A84C;background:#1a0a3a;padding:20px;border-radius:8px;text-align:center;">${otp}</div>
        <p style="color:#9e8a6a;font-size:12px;margin-top:24px;">This code expires in 5 minutes. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
      </div>
    `,
  });

  console.log(`[RESET] Email sent to ${email}`);
}

module.exports = { generateOtp, storeOtp, verifyOtp, sendOtpEmail, sendPasswordResetEmail };
