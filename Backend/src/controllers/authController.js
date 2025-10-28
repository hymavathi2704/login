// src/controllers/authController.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const axios = require('axios');
const { Op } = require('sequelize');
const { customAlphabet } = require('nanoid');
const { User, CoachProfile, ClientProfile } = require('../../models');
//  VITAL: Import new JWT functions
const {
    signAccessToken,
    signRefreshToken, // <-- Import Refresh Token signer
    verifyRefreshToken, // <-- Import Refresh Token verifier
    signEmailToken,
    verifyToken
} = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const asyncHandler = require('express-async-handler');

const SALT_ROUNDS = 12;
// VITAL: Define Refresh Token Cookie Name
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'jid'; // Use 'jid' or your preferred name
const ACCESS_COOKIE_NAME = 'jwt';
const generateOtp = customAlphabet('0123456789', 6);

// ==============================
// Helper function for safe cookie settings
// ==============================
const getCookieOptions = (isProduction, maxAge) => ({ // Added maxAge parameter
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    maxAge: maxAge, // Use the provided maxAge
    path: '/', // Ensure cookie is accessible across the site
});

// ==============================
// Register (No changes needed for refresh token here)
// ==============================
async function register(req, res) {
	try {
		const { firstName, lastName, password, role, specialty } = req.body;
		const email = req.body.email?.toLowerCase().trim();

		// Basic validation
		if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
		if (!password || password.length < 8)
			return res.status(400).json({ error: 'Password must be >= 8 chars' });

        if (!['client', 'coach'].includes(role))
            return res.status(400).json({ error: 'Invalid role selected.' });
        if (role === 'coach' && !specialty?.trim())
            return res.status(400).json({ error: 'Primary coaching specialty is required for coach registration.' });


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
			roles: [role],
		});

        if (role === 'client') {
            await ClientProfile.create({ userId: id });
        } else if (role === 'coach') {
            const specialtiesArray = specialty ? [specialty.trim()] : [];
            await CoachProfile.create({
                userId: id,
                specialties: specialtiesArray
            });
        }

		await sendVerificationEmail(email, otp).catch(console.error);

		res.status(201).json({ message: 'Registered. Please check email to verify.' });
	} catch (err) {
		console.error('Register error:', err);
		res.status(500).json({ error: 'Failed to register user' });
	}
}
// ==============================
// Login (UPDATED FOR REFRESH TOKEN)
// ==============================
async function login(req, res) {
	try {
		const { password } = req.body;
		const email = req.body.email?.toLowerCase().trim();
		const user = await User.findOne({ where: { email } });

		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		if (user.provider !== 'email')
			return res.status(400).json({ error: `Use ${user.provider} login` });
		if (!user.email_verified) return res.status(403).json({ error: 'Email not verified' });

		const ok = await bcrypt.compare(password, user.password_hash);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

		// --- Generate Tokens ---
        const userPayload = {
			userId: user.id,
			email: user.email,
			roles: user.roles,
		};
		const accessToken = signAccessToken(userPayload);
        const refreshToken = signRefreshToken(userPayload); // Sign refresh token

        // --- Set Cookies ---
        const isProduction = process.env.NODE_ENV === 'production';
        // Refresh token cookie (HttpOnly)
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions(isProduction, 1000 * 60 * 60 * 24 * 7)); // 7 days expiry

        // Access token cookie (HttpOnly - less critical but good practice)
        res.cookie(ACCESS_COOKIE_NAME, accessToken, getCookieOptions(isProduction, 1000 * 60 * 15)); // 15 mins expiry

        // --- Send Response ---
		res.json({
			// Keep sending accessToken in body for frontend localStorage (optional but common)
            accessToken,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone || null,
				roles: user.roles,
                profilePicture: user.profilePicture // Send profile picture URL
			},
		});
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ error: 'Login failed' });
	}
}

// ==============================
// Social Login (Keep Disabled or Update for Refresh Token)
// ==============================
async function socialLogin(req, res) {
	// If re-enabling, you MUST add refresh token generation and cookie setting here too.
	return res.status(503).json({ error: 'Social login functionality is currently disabled.' });
}

// ==============================
// Get current user (me) - No changes needed
// ==============================
async function me(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		const user = await User.findByPk(userId, {
			include: [
				{ model: CoachProfile, as: 'CoachProfile' },
				{ model: ClientProfile, as: 'ClientProfile' }
			],
		});

		if (!user) return res.status(404).json({ error: 'User not found' });

		const plainUser = user.get({ plain: true });

		res.status(200).json({ user: plainUser });
	} catch (err) {
		console.error('Error fetching /me:', err);
		res.status(500).json({ error: 'Failed to fetch user' });
	}
}

// ==============================
// Create Profile (No changes needed)
// ==============================
async function createProfile(req, res) {
	try {
		const userId = req.user?.userId;
		const { role, specialty } = req.body;

		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		if (!['client', 'coach'].includes(role))
			return res.status(400).json({ error: 'Invalid role specified' });

		const user = await User.findByPk(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.roles.includes(role)) {
            return res.status(400).json({ error: `${role} profile already exists.` });
        }

		user.roles = [...user.roles, role];
		await user.save();

		if (role === 'client') {
            await ClientProfile.create({ userId });
        } else if (role === 'coach') {
            await CoachProfile.create({
                userId,
                specialties: specialty ? JSON.stringify([specialty.trim()]) : '[]'
            });
        }

		res.status(201).json({ message: `${role} profile created successfully.` });
	} catch (err) {
		console.error('Create profile error:', err);
		res.status(500).json({ error: 'Failed to create profile' });
	}
}

// ==============================
// Logout (UPDATED TO CLEAR REFRESH COOKIE)
// ==============================
async function logout(req, res) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction, 0); // Set maxAge to 0 to clear

	// Clear the refresh token cookie
	res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
    // Clear the access token cookie
    res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions);

	res.json({ message: 'Logged out' });
}

// ==============================
// Refresh Token Endpoint (NEW)
// ==============================
const refreshToken = asyncHandler(async (req, res) => {
    const refreshTokenFromCookie = req.cookies[REFRESH_COOKIE_NAME];

    if (!refreshTokenFromCookie) {
        console.log("Refresh token endpoint: No refresh token cookie found.");
        return res.status(401).json({ error: 'Refresh token not found' });
    }

    try {
        const payload = verifyRefreshToken(refreshTokenFromCookie);

        // Optional: Check if user still exists or if token is revoked in DB (more secure)
        const user = await User.findByPk(payload.userId);
        if (!user) {
             console.log("Refresh token endpoint: User not found for token.");
             return res.status(401).json({ error: 'User not found' });
        }

        // Issue new access token
        const newAccessToken = signAccessToken({
            userId: user.id,
            email: user.email,
            roles: user.roles,
        });

        // Set new access token cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie(ACCESS_COOKIE_NAME, newAccessToken, getCookieOptions(isProduction, 1000 * 60 * 15)); // 15 mins

        // Send new access token in response body for frontend localStorage
        res.json({
            accessToken: newAccessToken,
            // Optionally send updated user data if needed
             user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || null,
                roles: user.roles,
                profilePicture: user.profilePicture
            },
        });
         console.log("Refresh token endpoint: New access token issued.");

    } catch (err) {
        console.error('Refresh token error:', err.message);
        // Clear cookies if refresh token is invalid/expired
        const isProduction = process.env.NODE_ENV === 'production';
        const clearOptions = getCookieOptions(isProduction, 0);
        res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);
        res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
});


// ==============================
// Update Profile (Keep as is, auth handled by middleware/interceptor)
// ==============================
async function updateProfile(req, res) {
	try {
		console.log('Received profile update request with body:', req.body);

		const userId = req.user?.userId;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		const user = await User.findByPk(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		const userFields = ['firstName', 'lastName', 'email', 'phone', 'profilePicture'];
		const coachFields = [
			'professionalTitle', 'bio', 'yearsOfExperience',
			'specialties', 'certifications', 'education',
			'dateOfBirth', 'gender', 'ethnicity', 'country',
			'linkedinUrl', 'twitterUrl', 'instagramUrl', 'facebookUrl',
		];
		const clientFields = ['coachingGoals', 'dateOfBirth', 'gender', 'ethnicity', 'country'];

		const userData = {};
		const coachData = {};
		const clientData = {};

		for (const key in req.body) {
			if (userFields.includes(key)) userData[key] = req.body[key];
			if (coachFields.includes(key)) coachData[key] = req.body[key];
			if (clientFields.includes(key)) clientData[key] = req.body[key];
		}

		if (req.body.profilePicture !== undefined) {
			userData.profilePicture = req.body.profilePicture;
		}


		if (userData.email) userData.email = userData.email.toLowerCase().trim();

		await user.update(userData);

		if (Object.keys(coachData).length > 0) {
			if (coachData.title) {
				coachData.professionalTitle = coachData.title;
				delete coachData.title;
			}
			const [coachProfile] = await CoachProfile.findOrCreate({ where: { userId } });
			await coachProfile.update(coachData);
		}
		if (Object.keys(clientData).length > 0) {
			const [clientProfile] = await ClientProfile.findOrCreate({ where: { userId } });
			await clientProfile.update(clientData);
		}

		const updatedUser = await User.findByPk(userId, {
			include: [
				{ model: CoachProfile, as: 'CoachProfile' },
				{ model: ClientProfile, as: 'ClientProfile' }
			],
		});

		const plainUpdatedUser = updatedUser.get({ plain: true });

		res.status(200).json({
			message: 'Profile updated successfully',
			user: plainUpdatedUser,
		});
	} catch (err) {
		console.error('Update profile error:', err);
		res.status(500).json({ error: 'Failed to update profile' });
	}
}


// ==============================
// Email & Password Reset (No changes needed)
// ==============================
async function verifyEmail(req, res) {
	try {
		const { code } = req.body;
		const email = req.body.email?.toLowerCase().trim();
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
		const email = req.body.email?.toLowerCase().trim();
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
		const email = req.body.email?.toLowerCase().trim();
		const user = await User.findOne({ where: { email } });

		if (!user) {
			// Avoid revealing if email exists
			return res.status(200).json({
				message: 'If a matching email was found, a password reset link has been sent.',
			});
		}

		// Use the generic verifyToken secret for password reset links for now
		const token = signEmailToken({ userId: user.id });
		const tokenExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minute expiry

		user.reset_token = token;
		user.reset_token_expires = tokenExpires;
		await user.save();

		await sendResetPasswordEmail(email, token).catch(console.error);

		res.status(200).json({
			message: 'If a matching email was found, a password reset link has been sent.',
		});
	} catch (err) {
		console.error('Forgot password error:', err);
		res.status(500).json({ error: 'Failed to process password reset request.' });
	}
}

async function resetPassword(req, res) {
	try {
		const { token, newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
             return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }

        // Use generic verifyToken for password reset
        let payload;
        try {
            payload = verifyToken(token);
        } catch (verifyErr) {
            console.error("Password reset token verification failed:", verifyErr.message);
            return res.status(400).json({ error: 'Invalid or expired password reset token.' });
        }


		const user = await User.findOne({
			where: {
                id: payload.userId, // Find user by ID from token
				reset_token: token, // Ensure token matches the one stored
				reset_token_expires: { [Op.gt]: new Date() }, // Check expiry
			},
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

// ===================================
// changePassword Controller (Keep as is)
// ===================================
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current password and new password.');
    }

    if (currentPassword === newPassword) {
         res.status(400);
         throw new Error('New password cannot be the same as the current password.');
    }

    const user = await User.findByPk(userId, {
        attributes: { include: ['password_hash'] }
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (!user.password_hash) {
         res.status(400);
         throw new Error('This account was created via social login and does not have a local password to change.');
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        res.status(401);
        throw new Error('Incorrect current password.');
    }

    user.password = newPassword;
    await user.save();

    // Clear cookies upon successful password change to force re-login
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = getCookieOptions(isProduction, 0);
    res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);
    res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);

    res.status(200).json({
        success: true,
        message: 'Password updated successfully. Please log in with your new password.'
    });
});


// ===================================
// deleteAccount Controller (Keep as is)
// ===================================
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    const deletedRows = await User.destroy({ where: { id: userId } });

    if (deletedRows === 0) {
        res.status(500);
        throw new Error('Failed to delete account. Please try again.');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = getCookieOptions(isProduction, 0);
    res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);
    res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);

    res.status(200).json({
        success: true,
        message: 'Account permanently deleted.'
    });
});

// ==============================
// Exports (ADD refreshToken)
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
	createProfile,
	updateProfile,
	changePassword,
	deleteAccount,
    refreshToken // <-- Export the new refresh token handler
};
