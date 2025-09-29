// Backend/src/routes/events.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/user');

// Get all published events (for clients)
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: 'published' },
      include: { model: User, as: 'coach', attributes: ['firstName', 'lastName'] }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// Get events created by a specific coach (for the coach's dashboard)
router.get('/my-events', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;
        const events = await Event.findAll({ where: { coachId } });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your events.' });
    }
});

// Create a new event
router.post('/', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;
        const newEvent = await Event.create({ ...req.body, coachId });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event.' });
    }
});

// Client books an event
router.post('/:eventId/book', authenticate, async (req, res) => {
    try {
        const clientId = req.user.userId;
        const eventId = req.params.eventId;
        const booking = await Booking.create({ clientId, eventId, status: 'confirmed' });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to book event.' });
    }
});

// Get a coach's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Event,
                    where: { coachId },
                    attributes: []
                },
                {
                    model: User,
                    as: 'client',
                    attributes: ['firstName', 'lastName']
                }
            ]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
});

module.exports = router;