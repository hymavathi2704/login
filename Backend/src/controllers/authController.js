// src/controllers/authController.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require('validator');
const axios = require('axios');
const { Op } = require('sequelize');
const { customAlphabet } = require('nanoid');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const { signAccessToken, signEmailToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'refresh_token';
const generateOtp = customAlphabet('0123456789', 6);

// ==============================
// Register
// ==============================
async function register(req, res) {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!password || password.length < 8)
      return res.status(400).json({ error: 'Password must be >= 8 chars' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const id = uuidv4();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 1000 * 60 * 15);

    const newUser = await User.create({
      id,
      firstName,
      lastName,
      email,
      password_hash: hash,
      verification_token: otp,
      verification_token_expires: otp_expires_at,
      provider: 'email',
      email_verified: false,
      role: role || 'client',
    });
    
    if (newUser.role === 'coach') {
      await CoachProfile.create({ userId: newUser.id });
    } else if (newUser.role === 'client') {
      await ClientProfile.create({ userId: newUser.id });
    }

    await sendVerificationEmail(email, otp).catch(console.error);

    res.status(201).json({ message: 'Registered. Please check email to verify.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

// ==============================
// Login
// ==============================
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.provider !== 'email')
      return res.status(400).json({ error: `Use ${user.provider} login` });

    if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });

    if (!user.password_hash)
      return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signAccessToken({ userId: user.id, email: user.email, type: 'refresh' });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30')),
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

// ==============================
// Social Login
// ==============================
async function socialLogin(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const auth0Token = authHeader.split(' ')[1];
    const userInfoResponse = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      { headers: { Authorization: `Bearer ${auth0Token}` } }
    );

    const userInfo = userInfoResponse.data;
    if (!userInfo.email)
      return res.status(400).json({ error: 'Email not returned by Auth0' });

    let user = await User.findOne({ where: { email: userInfo.email } });

    if (!user) {
      user = await User.create({
        id: uuidv4(),
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        email: userInfo.email,
        email_verified: userInfo.email_verified || true,
        provider: userInfo.sub.split('|')[0],
        oauth_id: userInfo.sub,
        role: 'client',
      });
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    res.json({
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Auth0 login error:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to process social login' });
  }
}

// ==============================
// Logout
// ==============================
async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out' });
}

// ==============================
// Get current user
// ==============================
async function me(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findByPk(userId, {
      include: [
        { model: CoachProfile },
        { model: ClientProfile }
      ]
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: user.get({ plain: true }) });
  } catch (err) {
    console.error('Error fetching /me:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// ==============================
// Update user profile
// ==============================
async function updateProfile(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { firstName, lastName, email, phone, ...profileData } = req.body;
    
    await user.update({ firstName, lastName, email, phone });

    if (user.role === 'coach') {
      const [coachProfile] = await CoachProfile.findOrCreate({ where: { userId } });
      await coachProfile.update(profileData);
    } else if (user.role === 'client') {
      const [clientProfile] = await ClientProfile.findOrCreate({ where: { userId } });
      await clientProfile.update(profileData);
    }
    
    const updatedUser = await User.findByPk(userId, {
      include: [
        { model: CoachProfile },
        { model: ClientProfile }
      ]
    });
    
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser.get({ plain: true }) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// ==============================
// Email & Password Reset
// ==============================
async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email, verification_token: code } });

    if (!user) return res.status(400).json({ error: 'Invalid verification code' });
    if (user.verification_token_expires < new Date())
      return res.status(400).json({ error: 'Verification code expired' });

    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
}

async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.status(400).json({ error: 'Email is already verified' });

    const otp = generateOtp();
    user.verification_token = otp;
    user.verification_token_expires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    await sendVerificationEmail(email, otp);

    res.status(200).json({ message: 'Verification email resent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: 'If a matching email was found, a password reset link has been sent.' });
    }

    const token = signEmailToken({ userId: user.id });
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60);
    
    user.reset_token = token;
    user.reset_token_expires = tokenExpires;
    await user.save();

    await sendResetPasswordEmail(email, token).catch(console.error);

    res.status(200).json({ message: 'If a matching email was found, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password_hash = hash;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
}

// ==============================
// Exports
// ==============================
module.exports = {
  register,
  login,
  socialLogin,
  logout,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateProfile,
};