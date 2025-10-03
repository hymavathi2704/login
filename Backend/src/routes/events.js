const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

// Correctly import middleware and models
const { authenticate, isCoach } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/user');

// GET /api/events/my-events - Fetches events created by the logged-in coach
router.get('/my-events', authenticate, isCoach, async (req, res) => {
  try {
    const coachId = req.user.userId;
    const events = await Event.findAll({
      where: { coachId },
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'status'],
      }],
      order: [['startTime', 'ASC']],
    });
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch coach events:', error);
    res.status(500).json({ error: 'Failed to retrieve events.' });
  }
});

// POST /api/events - Creates a new event for the logged-in coach
router.post('/', authenticate, isCoach, async (req, res) => {
  try {
    const coachId = req.user.userId;
    const { title, description, startTime, endTime, type, capacity } = req.body;
    
    const newEvent = await Event.create({
      coachId,
      title,
      description,
      startTime,
      endTime,
      type,
      capacity,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// GET /api/events/available - Fetches available events for clients
router.get('/available', authenticate, async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {
                startTime: { [Op.gt]: new Date() },
            },
            include: [{
                model: User,
                as: 'coach',
                attributes: ['id', 'firstName', 'lastName'],
            }],
            order: [['startTime', 'ASC']],
        });
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch available events:', error);
        res.status(500).json({ error: 'Failed to retrieve available events.' });
    }
});

module.exports = router;