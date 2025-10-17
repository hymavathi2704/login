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
const { signAccessToken, signEmailToken, verifyToken } = require('../utils/jwt'); 
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const asyncHandler = require('express-async-handler'); // <-- ADD THIS LINE

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'refresh_token';
const ACCESS_COOKIE_NAME = 'jwt'; // Defined the access token cookie name
const generateOtp = customAlphabet('0123456789', 6);

// ==============================
// Helper function for safe cookie settings
// ==============================
const getCookieOptions = (isProduction) => ({
    httpOnly: true,
    // FIX: Set secure only if in production (where HTTPS is guaranteed)
    secure: isProduction, 
    // FIX: Use 'Lax' in development (HTTP localhost) to allow the cookie to be sent.
    // Use 'None' only when secure: true is active (production HTTPS).
    sameSite: isProduction ? 'None' : 'Lax', 
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days expiration example
});

// ==============================
// Register
// ==============================
async function register(req, res) {
	try {
		const { firstName, lastName, password } = req.body;
		const email = req.body.email?.toLowerCase().trim();

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
			verification_token_expires: otp_expires_at,
			provider: 'email',
			email_verified: false,
			roles: [],
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

		const accessToken = signAccessToken({
			userId: user.id,
			email: user.email,
			roles: user.roles,
		});
		
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = getCookieOptions(isProduction);

		// Clear the refresh token cookie just in case an old one exists
		res.clearCookie(REFRESH_COOKIE_NAME, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'None' : 'Lax',
		});

        // 🔥 FIX: Set the Access Token as an HTTP-only cookie using the environment-aware settings
        res.cookie(ACCESS_COOKIE_NAME, accessToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 7, 
        });

		res.json({
			accessToken,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone || null,
				roles: user.roles,
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
	// ⚠️ TEMPORARILY DISABLED SOCIAL LOGIN
	/*
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

		const email = userInfo.email.toLowerCase().trim();
		let user = await User.findOne({ where: { email } });

		if (!user) {
			user = await User.create({
				id: uuidv4(),
				firstName: userInfo.given_name || '',
				lastName: userInfo.family_name || '',
				email,
				email_verified: userInfo.email_verified || true,
				provider: userInfo.sub.split('|')[0],
				oauth_id: userInfo.sub,
				roles: [],
			});
			await ClientProfile.create({ userId: user.id });
		}

		const accessToken = signAccessToken({
			userId: user.id,
			email: user.email,
			roles: user.roles,
		});
		
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = getCookieOptions(isProduction);

		// Clear the refresh token cookie just in case an old one exists
		res.clearCookie(REFRESH_COOKIE_NAME, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'None' : 'Lax',
		});
        
        // 🔥 FIX: Set the Access Token as an HTTP-only cookie using the environment-aware settings
        res.cookie(ACCESS_COOKIE_NAME, accessToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 7, 
        });

		res.json({
			accessToken,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone || null,
				roles: user.roles,
			},
		});
	} catch (err) {
		console.error('Auth0 login error:', err.response?.data || err);
		res.status(500).json({ error: 'Failed to process social login' });
	}
	*/
	// <--- ADDED: Return 503 error instead of attempting login
	return res.status(503).json({ error: 'Social login functionality is currently disabled.' }); 
}
// ==============================
// Get current user (with profiles)
// ==============================
async function me(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		// FIX: Use the 'as' alias for both profiles to match server.js association and desired output.
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
// Create a new role profile
// ==============================
async function createProfile(req, res) {
	try {
		const userId = req.user?.userId;
		const { role } = req.body;

		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		if (!['client', 'coach'].includes(role))
			return res.status(400).json({ error: 'Invalid role specified' });

		const user = await User.findByPk(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		if (!user.roles.includes(role)) {
			user.roles = [...user.roles, role];
			await user.save();
		}

		if (role === 'client') await ClientProfile.findOrCreate({ where: { userId } });
		if (role === 'coach') await CoachProfile.findOrCreate({ where: { userId } });

		res.status(201).json({ message: `${role} profile created successfully.` });
	} catch (err) {
		console.error('Create profile error:', err);
		res.status(500).json({ error: 'Failed to create profile' });
	}
}

// ==============================
// Logout
// ==============================
async function logout(req, res) {
    const isProduction = process.env.NODE_ENV === 'production';
	// Clear the refresh token cookie
	res.clearCookie(REFRESH_COOKIE_NAME, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? 'None' : 'Lax',
	});
    // Clear the access token cookie
    res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction, 
        sameSite: isProduction ? 'None' : 'Lax', 
    });
	res.json({ message: 'Logged out' });
}


// ==============================
// Update user profile
// ==============================
// NOTE: This function is likely deprecated/replaced by coachProfileController.updateCoachProfile
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
// Email & Password Reset
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
			return res.status(200).json({
				message: 'If a matching email was found, a password reset link has been sent.',
			});
		}

		const token = signEmailToken({ userId: user.id });
		const tokenExpires = new Date(Date.now() + 1000 * 60 * 60);

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
		const user = await User.findOne({
			where: {
				reset_token: token,
				reset_token_expires: { [Op.gt]: new Date() },
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
// ✅ NEW/FIXED: changePassword Controller
// ===================================
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // ✅ FIX 1: Use req.user.userId, not req.user._id (Sequelize vs Mongoose style)
    const userId = req.user.userId; 

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current password and new password.');
    }
    
    if (currentPassword === newPassword) {
         res.status(400);
         throw new Error('New password cannot be the same as the current password.');
    }

    // 1. Find the user and explicitly fetch the 'password_hash' attribute
    // ✅ FIX 2: Use Sequelize syntax to retrieve the password hash
    const user = await User.findByPk(userId, { 
        attributes: { include: ['password_hash'] } // Must explicitly include the hash
    }); 

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }
    
    if (!user.password_hash) {
         res.status(400);
         throw new Error('This account was created via social login and does not have a local password to change.');
    }

    // 2. Check if the current password is correct (Relies on matchPassword method in user.js)
    const isMatch = await user.matchPassword(currentPassword); 

    if (!isMatch) {
        res.status(401);
        throw new Error('Incorrect current password.');
    }

    // 3. Update the password
    // ✅ FIX 3: Set the VIRTUAL field 'password' (which your user.js hook is expecting)
    user.password = newPassword; 
    await user.save(); // save() triggers the beforeSave hook to hash and update password_hash

    // 4. Send response and force re-login
    res.status(200).json({ 
        success: true, 
        message: 'Password updated successfully. Please log in with your new password.' 
    });
});

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
	createProfile,
	updateProfile,
	changePassword, // <-- EXPORT THIS
};