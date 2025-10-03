const express = require('express');
const { Op, literal } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');

// GET /api/profiles/coaches - Get all coaches with search and filtering
router.get('/coaches', authenticate, async (req, res) => {
  try {
    const { search, audience } = req.query;

    const userWhereClause = {
      roles: { [Op.like]: '%"coach"%' }
    };

    const coachProfileWhere = {};

    if (audience) {
      coachProfileWhere[Op.and] = [
        literal(`JSON_CONTAINS(targetAudience, '"${audience}"')`)
      ];
    }

    if (search) {
      const searchPattern = `%${search}%`;
      const searchOrConditions = [
        { firstName: { [Op.like]: searchPattern } },
        { lastName: { [Op.like]: searchPattern } },
        { '$coach_profile.title$': { [Op.like]: searchPattern } },
        { '$coach_profile.bio$': { [Op.like]: searchPattern } }
      ];
      // Append search conditions to the where clause
      userWhereClause[Op.or] = userWhereClause[Op.or] 
        ? [...userWhereClause[Op.or], ...searchOrConditions] 
        : searchOrConditions;
    }
    
    const coaches = await User.findAll({
      where: userWhereClause,
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: CoachProfile,
          as: 'coach_profile', // Ensure alias matches model association
          where: coachProfileWhere,
          required: true // Ensures we only get users that have a coach profile
        }
      ],
    });

    res.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});

module.exports = router;