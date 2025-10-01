const express = require('express');
const { Op, fn, col, literal } = require('sequelize'); // Import additional helpers
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Subscription = require('../models/Subscription');
const sequelize = require('../config/db');

// GET /api/profiles/coaches - Get all coaches with search and filtering
router.get('/coaches', authenticate, async (req, res) => {
  try {
    const clientId = req.user.userId;
    const { search, audience } = req.query;

    const userWhereClause = {
      roles: { [Op.like]: '%"coach"%' }
    };

    const coachProfileWhere = {};

    // --- THIS IS THE FIX ---
    if (audience) {
      // Use a raw query part to correctly query the JSON array
      coachProfileWhere[Op.and] = [
        literal(`JSON_CONTAINS(targetAudience, '"${audience}"')`)
      ];
    }

    // Add search functionality
    if (search) {
      const searchPattern = `%${search}%`;
      userWhereClause[Op.or] = [
        { firstName: { [Op.like]: searchPattern } },
        { lastName: { [Op.like]: searchPattern } },
        // Also allow searching by joining on the coach_profile title/bio
        { '$coach_profile.title$': { [Op.like]: searchPattern } },
        { '$coach_profile.bio$': { [Op.like]: searchPattern } }
      ];
    }
    
    const coaches = await User.findAll({
      where: userWhereClause,
      attributes: ['id', 'firstName', 'lastName', 'email',
        [
          literal(`EXISTS(SELECT 1 FROM subscriptions WHERE subscriptions.coachId = User.id AND subscriptions.clientId = '${clientId}')`),
          'isSubscribed'
        ]
      ],
      include: [
        {
          model: CoachProfile,
          where: coachProfileWhere,
          required: true // INNER JOIN to only get users with a matching coach profile
        }
      ],
    });

    res.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});


// POST /api/profiles/coaches/:coachId/subscribe - Subscribe to a coach
router.post('/coaches/:coachId/subscribe', authenticate, async (req, res) => {
  try {
    const clientId = req.user.userId;
    const { coachId } = req.params;

    if (clientId === coachId) {
      return res.status(400).json({ error: 'You cannot subscribe to yourself.' });
    }

    const [subscription, created] = await Subscription.findOrCreate({
      where: { clientId, coachId },
    });

    if (!created) {
      return res.status(409).json({ message: 'Already subscribed to this coach.' });
    }

    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});

// GET /api/profiles/my-clients - Get a coach's subscribed clients
router.get('/my-clients', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;

        const subscriptions = await Subscription.findAll({
            where: { coachId },
            include: [{
                model: User,
                as: 'client',
                attributes: ['id', 'firstName', 'lastName', 'email'],
                include: [{
                    model: ClientProfile,
                    attributes: ['coachingGoals']
                }]
            }]
        });

        const clients = subscriptions.map(sub => sub.client);
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients.' });
    }
});

module.exports = router;
