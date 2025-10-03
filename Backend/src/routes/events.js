const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/user');

// GET /api/events - Get all published events (for clients)
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

// GET /api/events/my-events - Get events for the logged-in coach
router.get('/my-events', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;
        const events = await Event.findAll({ where: { coachId } });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your events.' });
    }
});

// POST /api/events - Create a new event
router.post('/', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;
        const newEvent = await Event.create({ ...req.body, coachId });
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Event Creation Error:", error);
        res.status(500).json({ error: 'Failed to create event.' });
    }
});

// PUT /api/events/:eventId - Update an existing event
router.put('/:eventId', authenticate, async (req, res) => {
    try {
        const { eventId } = req.params;
        const coachId = req.user.userId;

        const event = await Event.findOne({ where: { id: eventId, coachId } });

        if (!event) {
            return res.status(404).json({ error: 'Event not found or you do not have permission to edit it.' });
        }

        const updatedEvent = await event.update(req.body);
        res.json(updatedEvent);
    } catch (error) {
        console.error("Event Update Error:", error);
        res.status(500).json({ error: 'Failed to update event.' });
    }
});

// DELETE /api/events/:eventId - Delete an event
router.delete('/:eventId', authenticate, async (req, res) => {
    try {
        const { eventId } = req.params;
        const coachId = req.user.userId;

        const event = await Event.findOne({ where: { id: eventId, coachId } });

        if (!event) {
            return res.status(404).json({ error: 'Event not found or you do not have permission to delete it.' });
        }

        await event.destroy();
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error("Event Deletion Error:", error);
        res.status(500).json({ error: 'Failed to delete event.' });
    }
});


// POST /api/events/:eventId/book - Client books an event
router.post('/:eventId/book', authenticate, async (req, res) => {
    try {
        const clientId = req.user.userId;
        const { eventId } = req.params;
        
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        const booking = await Booking.create({ clientId, eventId, status: 'confirmed' });
        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: 'Failed to book event.' });
    }
});

// GET /api/events/my-bookings - Get a coach's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
    try {
        const coachId = req.user.userId;
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Event,
                    where: { coachId },
                    attributes: ['title', 'date', 'time']
                },
                {
                    model: User,
                    as: 'client',
                    attributes: ['firstName', 'lastName', 'email']
                }
            ]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
});

module.exports = router;
