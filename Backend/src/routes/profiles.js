const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Subscription = require('../models/Subscription');
const sequelize = require('../config/db');

// GET /api/profiles/coaches - Get all coaches (for clients)
router.get('/coaches', authenticate, async (req, res) => {
  try {
    const clientId = req.user.userId;

    const coaches = await User.findAll({
      where: { roles: { [Op.like]: '%"coach"%' } }, // Find users with 'coach' role
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: CoachProfile,
          attributes: ['bio', 'website', 'targetAudience'],
        },
        // Use a subquery to check if the current client is subscribed to each coach
        {
          model: Subscription,
          as: 'Subscribers',
          attributes: [],
          where: { clientId },
          required: false, // Use LEFT JOIN
        },
      ],
      // Add an attribute to show subscription status
      attributes: {
        include: [
          [
            sequelize.literal(`EXISTS(SELECT 1 FROM subscriptions WHERE subscriptions.coachId = User.id AND subscriptions.clientId = '${clientId}')`),
            'isSubscribed'
          ]
        ]
      }
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

    // Prevent subscribing to oneself
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

        // Flatten the response to be a list of clients
        const clients = subscriptions.map(sub => sub.client);

        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients.' });
    }
});

module.exports = router;