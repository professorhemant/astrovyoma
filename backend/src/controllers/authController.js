const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction, Astrologer, sequelize } = require('../models');
const { generateOtp, storeOtp, verifyOtp, secondsUntilResendAllowed, sendPasswordResetEmail } = require('../services/otpService');

const MIN_PASSWORD_LENGTH = 8;

// Credited once, at account creation. Set WELCOME_BONUS=0 to switch the offer
// off without a deploy — the signup page copy is written for the ₹50 default,
// so change it there too if this moves.
const WELCOME_BONUS = Number.isFinite(Number(process.env.WELCOME_BONUS))
  ? Number(process.env.WELCOME_BONUS)
  : 50;
// One reset email per address per minute, so the endpoint can't be used to
// spam someone's inbox (or burn the Gmail sending quota).
const RESET_THROTTLE_MS = 60 * 1000;

// OTPs are namespaced so a signup code can never be replayed as a reset code.
const resetKey = email => `reset:${email.toLowerCase()}`;

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Name, password, and email or phone are required' });
    }

    const existingUser = email
      ? await User.findOne({ where: { email } })
      : await User.findOne({ where: { phone } });
    if (existingUser) return res.status(409).json({ error: 'User already exists with this email or phone' });

    const password_hash = await bcrypt.hash(password, 12);

    // The bonus is part of creating the account rather than a follow-up write:
    // signup is the only moment it can be awarded, so a credit that failed on
    // its own would leave an account permanently short with nothing in the
    // ledger to explain it. Both rows land or neither does.
    const user = await sequelize.transaction(async (t) => {
      const created = await User.create({
        name,
        email: email || null,
        phone: phone || null,
        password_hash,
        wallet_balance: WELCOME_BONUS,
      }, { transaction: t });

      if (WELCOME_BONUS > 0) {
        await Transaction.create({
          user_id:       created.id,
          type:          'bonus',
          amount:        WELCOME_BONUS,
          description:   'Welcome bonus on signup',
          balance_after: WELCOME_BONUS,
          reference_id:  `welcome:${created.id}`,
        }, { transaction: t });
      }

      return created;
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      welcome_bonus: WELCOME_BONUS,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, wallet_balance: user.wallet_balance }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Password and email or phone are required' });
    }

    const user = email
      ? await User.findOne({ where: { email } })
      : await User.findOne({ where: { phone } });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, wallet_balance: user.wallet_balance }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // An astrologer signing in the ordinary way lands here — a seeker account
    // with a wallet — and nothing tells her she is on the wrong side of the
    // site. Seema Sharma did exactly that on 2026-08-12: signed in, saw her own
    // name in the header, and stayed offline to customers, so a seeker called
    // her and sat in an empty channel. Match on phone and let the front end say
    // so. Last ten digits, because the two records are typed at different times
    // by different people and one carries a +91.
    let astrologerProfile = null;
    const digits = String(user.phone || '').replace(/\D/g, '').slice(-10);
    if (digits.length === 10) {
      const candidates = await Astrologer.findAll({ attributes: ['id', 'display_name', 'phone', 'is_online'] });
      const match = candidates.find(a =>
        String(a.phone || '').replace(/\D/g, '').slice(-10) === digits
      );
      if (match) {
        astrologerProfile = { display_name: match.display_name, is_online: match.is_online };
      }
    }

    res.json({ ...user.toJSON(), astrologer_profile: astrologerProfile });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

// Always answers 200 with the same message. Telling the caller whether an
// account exists would turn this into a free account-enumeration oracle.
async function forgotPassword(req, res) {
  const generic = {
    message: 'If an account with that email exists, a reset code has been sent to it.'
  };

  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) return res.status(400).json({ error: 'Email or phone is required' });

    const identifier = String(emailOrPhone).trim();
    const isEmail = identifier.includes('@');

    const user = isEmail
      ? await User.findOne({ where: { email: identifier.toLowerCase() } })
      : await User.findOne({ where: { phone: identifier } });

    // No account, or a phone-only account with no address to send a code to.
    // Both fall through to the same generic response.
    if (!user || !user.email) return res.json(generic);

    // Throttle now reads last_sent_at from the stored code, so it survives a
    // restart and is shared across instances — the Map it replaced did neither.
    const wait = await secondsUntilResendAllowed(resetKey(user.email), RESET_THROTTLE_MS);
    if (wait > 0) return res.json(generic);

    const otp = generateOtp();
    await storeOtp(resetKey(user.email), otp);

    // Deliberately not awaited. Blocking on SMTP made a real account take
    // seconds (or hang the request entirely) while an unknown one returned
    // instantly — which both broke the endpoint under a slow mail server and
    // leaked account existence through response time.
    sendPasswordResetEmail(user.email, otp).catch(err => {
      console.error('Failed to send reset email:', err && err.message ? err.message : err);
    });

    res.json(generic);
  } catch (err) {
    console.error('Forgot password error:', err);
    // Still generic — an error here must not reveal whether the account existed.
    res.json(generic);
  }
}

async function resetPassword(req, res) {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const normalized = String(email).trim().toLowerCase();
    const result = await verifyOtp(resetKey(normalized), String(otp).trim());
    if (!result.valid) return res.status(400).json({ error: result.reason });

    const user = await User.findOne({ where: { email: normalized } });
    // The OTP was valid, so this should not happen — but the code is spent
    // either way, which is the behaviour we want.
    if (!user) return res.status(400).json({ error: 'Unable to reset password. Please request a new code.' });

    user.password_hash = await bcrypt.hash(password, 12);
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
}

module.exports = { register, login, getMe, forgotPassword, resetPassword };
