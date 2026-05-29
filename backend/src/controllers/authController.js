const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateOtp, storeOtp, verifyOtp, sendOtpEmail } = require('../services/otpService');

async function sendOtp(req, res) {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required' });

    const identifier = email || phone;

    // Check if user already exists
    const existing = email
      ? await User.findOne({ where: { email } })
      : await User.findOne({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'Account already exists with this email or phone' });

    const otp = generateOtp();
    storeOtp(identifier, otp);

    if (email) {
      await sendOtpEmail(email, otp);
      return res.json({ message: `OTP sent to ${email}` });
    }

    // Phone-only: log OTP (SMS integration can be added later)
    console.log(`[OTP] Phone ${phone} → ${otp}`);
    res.json({ message: `OTP sent to ${phone}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

async function register(req, res) {
  try {
    const { name, email, phone, password, otp } = req.body;
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Name, password, and email or phone are required' });
    }
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const identifier = email || phone;
    const result = verifyOtp(identifier, otp);
    if (!result.valid) return res.status(400).json({ error: result.reason });

    const existingUser = email
      ? await User.findOne({ where: { email } })
      : await User.findOne({ where: { phone } });
    if (existingUser) return res.status(409).json({ error: 'User already exists with this email or phone' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email || null, phone: phone || null, password_hash });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
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
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
}

module.exports = { sendOtp, register, login, getMe };
