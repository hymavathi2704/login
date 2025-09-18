const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const User = require('../models/user');
const { signAccessToken, signEmailToken, verifyToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const { Op } = require('sequelize');
const { customAlphabet } = require('nanoid');

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'refresh_token';
const generateOtp = customAlphabet('0123456789', 6);

// ✅ Configure JWKS client for Auth0
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err, null);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be >= 8 chars' });

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const id = uuidv4();
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  
  const otp = generateOtp();
  const otp_expires_at = new Date(Date.now() + 1000 * 60 * 15);

  const user = await User.create({
    id,
    name,
    email,
    password_hash: hash,
    verification_token: otp,
    verification_token_expires_at: otp_expires_at
  });

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
  console.log('Attempting login for email:', email);
  console.log('Received password (first 5 chars):', password.substring(0, 5) + '...');
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    console.log('User found. Attempting password comparison...');
    console.log('Stored password hash:', user.password_hash);
    const ok = await bcrypt.compare(password, user.password_hash || '');

    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password comparison successful.'); // New log entry
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signAccessToken({ userId: user.id, email: user.email, type: 'refresh' });

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10))
    };
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOpts);
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Login Error:', error); // Log the full error here
    return res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
}

async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out' });
}

async function me(req, res) {
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
  if (!user) return res.status(200).json({ message: 'If that email exists, we sent a link' });

  const token = signEmailToken({ userId: user.id, email: user.email });
  user.reset_token = token;
  user.reset_token_expires = new Date(Date.now() + 1000 * 60 * 60);
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

async function socialLogin(req, res) {
  try {
    // The token is already verified by the middleware.
    // We can directly access the decoded user information from req.auth.
    const { email, name, sub } = req.auth; 
    const provider = 'auth0';

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        id: uuidv4(),
        name,
        email,
        email_verified: true,
        provider,
        oauth_id: sub,
      });
    } else if (!user.oauth_id) {
      user.oauth_id = sub;
      user.provider = provider;
      await user.save();
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Auth0 social login error:', err);
    res.status(500).json({ error: 'Failed to process social login' });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  me,
  resendVerification,
  forgotPassword,
  resetPassword,
  socialLogin
};