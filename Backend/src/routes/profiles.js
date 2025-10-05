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

// GET /api/profiles/coaches/:id - Get a single coach's public profile
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
          required: false, 
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


// GET /api/profiles/my-clients - Get a coach's clients
// FIX: Rewrote this function to be more stable.
router.get('/my-clients', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;

        // 1. Find all events created by the coach
        const coachEvents = await Event.findAll({
            where: { coachId },
            attributes: ['id']
        });

        if (coachEvents.length === 0) {
            return res.json([]);
        }
        const eventIds = coachEvents.map(e => e.id);

        // 2. Find all unique client IDs who booked those events
        const bookings = await Booking.findAll({
            where: { eventId: { [Op.in]: eventIds } },
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('clientId')), 'clientId']
            ]
        });

        if (bookings.length === 0) {
            return res.json([]);
        }
        const clientIds = bookings.map(b => b.clientId);

        // 3. Fetch the user details for those client IDs
        const clients = await User.findAll({
            where: { id: { [Op.in]: clientIds } },
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [{
                model: ClientProfile,
                as: 'client_profile',
                attributes: ['coachingGoals'],
                required: false
            }]
        });

        // 4. Process clients to match frontend data structure expectations
        const processedClients = clients.map(client => {
            const plainClient = client.get({ plain: true });
            if (plainClient.client_profile) {
                plainClient.ClientProfile = plainClient.client_profile;
                delete plainClient.client_profile;
            }
            return plainClient;
        });

        res.json(processedClients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients.' });
    }
});

module.exports = router;