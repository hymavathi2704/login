const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');
const { signAccessToken, signEmailToken, verifyToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const { Op } = require('sequelize');
const { customAlphabet } = require('nanoid');

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'refresh_token';
const generateOtp = customAlphabet('0123456789', 6);

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be >= 8 chars' });

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const id = uuidv4();
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Generate a 6-digit OTP instead of a JWT token
  const otp = generateOtp();
  const otp_expires_at = new Date(Date.now() + 1000 * 60 * 15); // OTP expires in 15 minutes

  const user = await User.create({
    id,
    name,
    email,
    password_hash: hash,
    verification_token: otp, // Use the OTP here
    verification_token_expires_at: otp_expires_at // Add a timestamp for expiration
  });

  // send verification email with OTP
  await sendVerificationEmail(email, otp).catch(err => {
    console.error('Email send failure:', err);
  });

  res.status(201).json({ message: 'Registered. Please check email to verify.' });
}

async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ error: 'Invalid email or OTP' });
  }

  // Check if OTP matches and has not expired
  if (user.verification_token !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  if (new Date() > user.verification_token_expires_at) {
    return res.status(400).json({ error: 'OTP expired' });
  }

  user.email_verified = true;
  user.verification_token = null;
  user.verification_token_expires_at = null;
  await user.save();

  res.json({ message: 'Email verified successfully' });
}


async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });

  const ok = await bcrypt.compare(password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signAccessToken({ userId: user.id, email: user.email, type: 'refresh' }); // simple; you can sign with different secret

  // set refresh token as HttpOnly secure cookie
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10))
  };
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOpts);
  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
}

async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  // Optionally blacklist refresh token in DB
  res.json({ message: 'Logged out' });
}

async function me(req, res) {
  // expects authenticate middleware to set req.user
  const user = await User.findByPk(req.user.userId, { attributes: ['id','name','email','email_verified','provider'] });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
}

async function resendVerification(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.email_verified) return res.status(400).json({ error: 'Already verified' });

  const otp = generateOtp();
  const otp_expires_at = new Date(Date.now() + 1000 * 60 * 15);

  user.verification_token = otp;
  user.verification_token_expires_at = otp_expires_at;
  await user.save();

  await sendVerificationEmail(email, otp).catch(console.error);
  res.json({ message: 'Verification email resent' });
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(200).json({ message: 'If that email exists, we sent a link' }); // don't reveal existence

  // create token (use JWT or UUID)
  const token = signEmailToken({ userId: user.id, email: user.email });
  user.reset_token = token;
  user.reset_token_expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await user.save();

  await sendResetPasswordEmail(email, token).catch(console.error);
  res.json({ message: 'If that email exists, we sent a link' });
}

async function resetPassword(req, res) {
  const { token } = req.body;
  const { newPassword } = req.body;
  try {
    const payload = verifyToken(token);
    const user = await User.findOne({ where: { id: payload.userId, reset_token: token, reset_token_expires: { [Op.gt]: new Date() } } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Password must be >= 8 chars' });

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
}

// Stub social login handler — frontend should exchange provider token and backend validates and issues own tokens
async function socialLogin(req, res) {
  const { provider, id_token, access_token } = req.body;
  // Implement provider verification:
  // - For Google: verify id_token using Google's tokeninfo or google-auth-library
  // - For GitHub: exchange code for access token and fetch user
  // For brevity we show a simplified pseudo-flow.
  if (!['google','github'].includes(provider)) return res.status(400).json({ error: 'Unsupported provider' });

  // TODO: verify id_token with provider, get profile info (email, oauth_id, name)
  // Example: suppose we have profile = { email: 'user@example.com', oauth_id: 'ext-id-123', name: 'Social User' }; // replace

  let user = await User.findOne({ where: { [Op.or]: [{ email: profile.email }, { oauth_id: profile.oauth_id }] } });
  if (!user) {
    user = await User.create({
      id: uuidv4(),
      name: profile.name,
      email: profile.email,
      email_verified: true,
      provider,
      oauth_id: profile.oauth_id
    });
  } else {
    // link account if necessary
    if (!user.oauth_id) {
      user.oauth_id = profile.oauth_id;
      await user.save();
    }
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signAccessToken({ userId: user.id, email: user.email, type: 'refresh' });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10))
  });

  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
}

module.exports = {
  register, verifyEmail, login, logout, me, resendVerification, forgotPassword, resetPassword, socialLogin
};