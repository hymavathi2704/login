const express = require('express');
const { Op, literal, fn, col } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const sequelize = require('../config/db');


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
      userWhereClause[Op.or] = searchOrConditions;
    }
    
    const coaches = await User.findAll({
      where: userWhereClause,
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: CoachProfile,
          as: 'coach_profile',
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

// NEW ENDPOINT: GET /api/profiles/coaches/:id - Get a single coach's public profile
router.get('/coaches/:id', authenticate, async (req, res) => {
  try {
    const coachId = req.params.id;

    const coach = await User.findOne({
      where: { 
        id: coachId,
        roles: { [Op.like]: '%"coach"%' }
      },
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: CoachProfile,
          as: 'coach_profile',
          required: true,
        },
        {
          model: Event,
          where: { status: 'published' },
          required: false, // Use required: false to still get coach if they have no events
        }
      ]
    });

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found.' });
    }

    res.json(coach);
  } catch (error) {
    console.error('Error fetching single coach:', error);
    res.status(500).json({ error: 'Failed to fetch coach profile.' });
  }
});


// GET /api/profiles/my-clients - Get a coach's clients based on who has booked sessions
router.get('/my-clients', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;

        // Find all unique client IDs who have booked an event with this coach
        const bookings = await Booking.findAll({
            attributes: [
                [fn('DISTINCT', col('clientId')), 'clientId'],
            ],
            include: [{
                model: Event,
                attributes: [],
                where: { coachId },
                required: true
            }]
        });

        if (bookings.length === 0) {
            return res.json([]);
        }

        const clientIds = bookings.map(b => b.clientId);

        // Fetch the user details for those client IDs
        const clients = await User.findAll({
            where: {
                id: { [Op.in]: clientIds }
            },
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [{
                model: ClientProfile,
                attributes: ['coachingGoals'],
                required: false
            }]
        });

        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients.' });
    }
});

module.exports = router;

