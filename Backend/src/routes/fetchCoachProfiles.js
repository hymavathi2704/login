// Backend/src/routes/profiles.js
const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');

// GET /api/profiles/coaches - Get a list of all coaches (for client exploration)
router.get('/coaches', async (req, res) => {
    try {
        const { search, audience } = req.query; // Used for filtering (currently ignored, but good practice)
        
        // Find all users who have the 'coach' role and include their profile data
        const coaches = await User.findAll({
            where: {
                roles: {
                    [Op.like]: '%"coach"%' // Check if the JSON array string contains "coach"
                },
                // Basic search logic
                ...(search && {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                    ]
                })
            },
            attributes: ['id', 'firstName', 'lastName'],
            include: [
                {
                    model: CoachProfile, 
                    as: 'CoachProfile', 
                    attributes: ['professionalTitle'] // Only fetch title for the list view
                }
            ]
        });

        // The frontend component ExploreCoaches expects `coach_profile` or `CoachProfile`
        // I will return the full user objects, and the frontend will map `user.CoachProfile`
        res.json({ coaches });

    } catch (error) {
        console.error('Error fetching all coaches:', error.stack);
        res.status(500).json({ error: 'Failed to fetch coaches list.' });
    }
});

module.exports = router;