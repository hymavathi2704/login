// Backend/src/controllers/clientProfileController.js

const User = require('../models/user');
const ClientProfile = require('../models/ClientProfile');

// ==============================
// Update Client Profile (Handles User and ClientProfile data)
// ==============================
async function updateClientProfile(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		const user = await User.findByPk(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		// Fields from the request body
		const body = req.body;

		// 1. Map fields to the User model (firstName, lastName, phone, profilePicture)
		const userFields = ['firstName', 'lastName', 'phone', 'profilePicture']; 
		const userData = {};

		// 2. Map fields to the ClientProfile model (coachingGoals, demographics)
		const clientFields = [
            'coachingGoals', 
            'dateOfBirth', 
            'gender', 
            'ethnicity', 
            'country'
        ];
		const clientData = {};

		// Separate data based on target model
		for (const key in body) {
			if (userFields.includes(key)) {
                userData[key] = body[key];
            } else if (clientFields.includes(key)) {
                clientData[key] = body[key];
            }
		}
		
		// 3. Update User table
		if (Object.keys(userData).length > 0) {
			// Prevent accidental email change via this route
			if (userData.email) delete userData.email; 
			await user.update(userData);
		}

		// 4. Update ClientProfile table (Create it if it doesn't exist)
		// We use findOrCreate to ensure profile always exists for the client role
		const [clientProfile] = await ClientProfile.findOrCreate({ where: { userId } });
			
		if (Object.keys(clientData).length > 0) {
			await clientProfile.update(clientData);
		}
        
        // 5. Ensure 'client' role is present if profile was created
        if (!user.roles.includes('client')) {
            user.roles = [...user.roles, 'client'];
            await user.save();
        }

		// 6. Fetch and return the fully updated user object for frontend sync
		const updatedUser = await User.findByPk(userId, {
			include: [
				{ model: ClientProfile, as: 'ClientProfile' }
			],
		});

		const plainUpdatedUser = updatedUser.get({ plain: true });

		res.status(200).json({
			message: 'Client profile updated successfully',
			user: plainUpdatedUser,
		});

	} catch (err) {
		console.error('Client profile update error:', err);
		// If an error occurs, always send a JSON response to prevent the <!DOCTYPE error
		res.status(500).json({ error: 'Failed to update client profile. Check server logs.' });
	}
}


module.exports = {
	updateClientProfile,
};