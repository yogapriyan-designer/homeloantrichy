const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const transporter = require('./mailer');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again later.' }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- SIGNUP ----------
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const info = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ).run(email.toLowerCase(), passwordHash, name || null);

  const token = jwt.sign({ userId: info.lastInsertRowid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  transporter.sendMail({
    from: `"Home Loan Trichy Website" <${process.env.EMAIL_USER}>`,
    to: 'rajibalayoga@gmail.com',
    subject: `New Signup: ${email}`,
    text: `A new user signed up.\n\nEmail: ${email}\nName: ${name || 'Not provided'}\nTime: ${new Date().toLocaleString()}`
  }).catch(err => console.error('Signup notification email failed:', err));

  res.status(201).json({ token, email });
});

// ---------- LOGIN ----------
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  transporter.sendMail({
    from: `"Home Loan Trichy Website" <${process.env.EMAIL_USER}>`,
    to: 'rajibalayoga@gmail.com',
    subject: `Login: ${user.email}`,
    text: `A user logged in.\n\nEmail: ${user.email}\nTime: ${new Date().toLocaleString()}`
  }).catch(err => console.error('Login notification email failed:', err));

  res.json({ token, email: user.email, name: user.name });
});

module.exports = router;