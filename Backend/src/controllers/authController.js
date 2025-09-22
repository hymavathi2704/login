const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validator = require('validator');
const axios = require('axios');
const { Op } = require('sequelize');
const { customAlphabet } = require('nanoid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const { signAccessToken, signEmailToken, verifyToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'refresh_token';
const generateOtp = customAlphabet('0123456789', 6);

// ==============================
// Multer setup for profile photo
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user.id}${ext}`);
  },
});

const uploadProfilePhotoMiddleware = multer({ storage }).single('profilePhoto');

// ==============================
// Register
// ==============================
async function register(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!password || password.length < 8)
      return res.status(400).json({ error: 'Password must be >= 8 chars' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const id = uuidv4();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 1000 * 60 * 15);

    await User.create({
      id,
      firstName,
      lastName,
      email,
      password_hash: hash,
      verification_token: otp,
      verification_token_expires_at: otp_expires_at,
    });

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
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signAccessToken({
      userId: user.id,
      email: user.email,
      type: 'refresh',
    });

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
        phone: user.phone,
        profilePhoto: user.profilePhoto,
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
        profilePhoto: userInfo.picture || null,
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
        phone: user.phone,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error('Auth0 login error:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to process social login' });
  }
}

// ==============================
// Profile & Session
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
    const userId = req.user?.userId || req.auth?.userId || req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findOne({
      where: { [Op.or]: [{ id: userId }, { oauth_id: userId }] },
      attributes: ['id', 'firstName', 'lastName', 'email', 'email_verified', 'provider', 'profilePhoto'],
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

    res.json({ 
  user: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profilePhoto: user.profilePhoto ? `/uploads/${user.profilePhoto}` : null,
    email_verified: user.email_verified,
    provider: user.provider
  } 
});
  } catch (err) {
    console.error('Error fetching /me:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user?.userId || req.auth?.userId || req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { firstName, lastName, email, phone, profilePhoto } = req.body;

    const user = await User.findOne({
      where: { [Op.or]: [{ id: userId }, { oauth_id: userId }] },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && !validator.isEmail(email))
      return res.status(400).json({ error: 'Invalid email format' });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// ==============================
// Upload Profile Photo
// ==============================
async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userId = req.user.id;
    const filePath = `uploads/${req.file.filename}`;

    // Update the user record in DB
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePhoto = filePath;
    await user.save();

    res.json({ message: 'Profile photo updated', profilePhoto: user.profilePhoto });
  } catch (err) {
    console.error('Upload profile photo error:', err);
    res.status(500).json({ message: 'Failed to upload profile photo' });
  }
}

// ==============================
// Verification & Password Reset
// ==============================
async function verifyEmail(req, res) { res.json({ message: 'TODO: verifyEmail' }); }
async function resendVerification(req, res) { res.json({ message: 'TODO: resendVerification' }); }
async function forgotPassword(req, res) { res.json({ message: 'TODO: forgotPassword' }); }
async function resetPassword(req, res) { res.json({ message: 'TODO: resetPassword' }); }

// ==============================
// Exports
// ==============================
module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  me,
  socialLogin,
  updateProfile,
  uploadProfilePhoto,
  uploadProfilePhotoMiddleware,
  resendVerification,
  forgotPassword,
  resetPassword,
};
