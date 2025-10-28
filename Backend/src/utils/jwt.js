const jwt = require('jsonwebtoken');
require('dotenv').config();

// Ensure JWT secrets are loaded
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is missing. Check your .env file.");
}

// --- Access Token ---
const signAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' } // Short expiry
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Access token verification failed:", error.message);
    throw error; // Re-throw the error (e.g., TokenExpiredError)
  }
};

// --- Refresh Token ---
const signRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' } // Longer expiry
  );
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        console.error("Refresh token verification failed:", error.message);
        throw error; // Re-throw the error
    }
};

// --- Email/Reset Token (Keep as is or use separate secret) ---
const signEmailToken = (payload) => {
  // Using JWT_SECRET for simplicity here, consider a separate secret if needed
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES || '1h' } // Shorter expiry might be better
  );
};

const verifyToken = (token) => {
  // Generic verify using the main secret (primarily for email/reset)
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Generic token verification failed:", error.message);
    throw error;
  }
};


module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailToken,
  verifyToken // Keep the generic one for email/reset links
};
