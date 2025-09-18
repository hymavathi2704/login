const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const axios = require('axios'); // ✅ NEW: to call Auth0 userinfo endpoint
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

// ==============================
// Email + Password Registration
// ==============================
async function register(req, res) {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!password || password.length < 8)
    return res.status(400).json({ error: 'Password must be >= 8 chars' });

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
    verification_token_expires_at: otp_expires_at,
  });

  await sendVerificationEmail(email, otp).catch((err) => {
    console.error('Email send failure:', err);
  });

  res.status(201).json({ message: 'Registered. Please check email to verify.' });
}

// ==============================
// Email Verification
// ==============================
async function verifyEmail(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid email or OTP' });

  if (user.verification_token !== otp)
    return res.status(400).json({ error: 'Invalid OTP' });

  if (new Date() > user.verification_token_expires_at)
    return res.status(400).json({ error: 'OTP expired' });

  user.email_verified = true;
  user.verification_token = null;
  user.verification_token_expires_at = null;
  await user.save();

  res.json({ message: 'Email verified successfully' });
}

// ==============================
// Login with Email & Password
// ==============================
async function login(req, res) {
  const { email, password } = req.body;
  console.log('Attempting login for email:', email);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    console.log('User found. Attempting password comparison...');
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    console.log('Password comparison successful.');
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signAccessToken({
      userId: user.id,
      email: user.email,
      type: 'refresh',
    });

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:
        1000 *
        60 *
        60 *
        24 *
        (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10)),
    };

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOpts);
    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res
      .status(500)
      .json({ error: 'An unexpected server error occurred during login.' });
  }
}

// ==============================
// Auth0 Social Login (UPDATED)
// ==============================
async function socialLogin(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const auth0Token = authHeader.split(" ")[1];

    // ✅ Fetch user info from Auth0 userinfo endpoint
    const userInfoResponse = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      { headers: { Authorization: `Bearer ${auth0Token}` } }
    );

    const userInfo = userInfoResponse.data;
    console.log("🔑 Auth0 user info:", userInfo);

    if (!userInfo.email) {
      return res.status(400).json({
        error: "Email not returned by Auth0. Please enable 'email' scope in Auth0 settings."
      });
    }

    // ✅ Find or create user in DB
    let user = await User.findOne({ where: { email: userInfo.email } });

    if (!user) {
      console.log("🆕 Creating new user...");
      user = await User.create({
        id: uuidv4(),
        name: userInfo.name || "Unknown User",
        email: userInfo.email,
        email_verified: userInfo.email_verified || true,
        provider: userInfo.sub.split("|")[0],
        oauth_id: userInfo.sub,
        profileImage: userInfo.picture || null,
      });
    }

    // ✅ Sign custom access token
    const accessToken = signAccessToken({ userId: user.id, email: user.email });

    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("🚨 Auth0 social login error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to process social login" });
  }
}

// ==============================
// Other Utilities
// ==============================
async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'Logged out' });
}

async function me(req, res) {
  try {
    // ✅ Determine userId: local JWT (req.user) or Auth0 (req.auth)
    const userId = req.user?.userId || req.auth?.userId || req.auth?.sub;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // ✅ Find user by either id (local) or oauth_id (Auth0)
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id: userId }, { oauth_id: userId }],
      },
      attributes: ['id', 'name', 'email', 'email_verified', 'provider', 'profileImage'],
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('Error fetching user in /me:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function resendVerification(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.email_verified)
    return res.status(400).json({ error: 'Already verified' });

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
  if (!user)
    return res
      .status(200)
      .json({ message: 'If that email exists, we sent a link' });

  const token = signEmailToken({ userId: user.id, email: user.email });
  user.reset_token = token;
  user.reset_token_expires = new Date(Date.now() + 1000 * 60 * 60);
  await user.save();

  await sendResetPasswordEmail(email, token).catch(console.error);
  res.json({ message: 'If that email exists, we sent a link' });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  try {
    const payload = verifyToken(token);
    const user = await User.findOne({
      where: {
        id: payload.userId,
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ error: 'Invalid or expired token' });

    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be >= 8 chars' });

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
}

// ==============================
// Update Profile
// ==============================
async function updateProfile(req, res) {
  try {
    const userId = req.user?.userId || req.auth?.userId || req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    console.log('🔄 Incoming profile update for user:', userId);
    console.log('📥 Request body:', req.body);

    const { firstName, lastName, email, phone, profilePhoto } = req.body;

    // ✅ Find user by id or oauth_id
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id: userId }, { oauth_id: userId }]
      }
    });

    if (!user) {
      console.warn('⚠️ User not found for update:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Validate email if provided
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // ✅ Update only provided fields
    if (firstName || lastName) {
      user.name = [firstName, lastName].filter(Boolean).join(' ') || user.name;
    }
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    await user.save();

    console.log('✅ Profile updated successfully for user:', user.id);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    console.error('❌ Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
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
  socialLogin,
  updateProfile, // ✅ add here
};
