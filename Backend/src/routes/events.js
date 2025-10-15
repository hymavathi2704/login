const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
// NOTE: Event model is kept but not used in the /my-bookings logic below
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/user');
const Session = require('../models/Session'); 
const CoachProfile = require('../models/CoachProfile'); 

// ... (omitted existing event routes: GET /, /my-events, POST, PUT, DELETE, POST /:eventId/book) ...
// GET /api/events/my-bookings - Get a client's session bookings (FIXED Alias)
router.get('/my-bookings', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const bookings = await Booking.findAll({
            where: { 
                clientId: userId,
                sessionId: { [Op.ne]: null } 
            },
            attributes: ['id', 'clientId', 'sessionId', 'status', 'bookedAt'],
            include: [
                {
                    model: Session,
                    as: 'Session', // 🚨 CRITICAL FIX: Use the 'Session' alias
                    attributes: ['id', 'title', 'duration', 'price', 'type', 'defaultDate', 'defaultTime', 'meetingLink'],
                    required: true,
                    include: [{ 
                        model: CoachProfile, 
                        as: 'coachProfile', 
                        attributes: ['userId'],
                        include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] 
                    }]
                }
            ],
            order: [['bookedAt', 'DESC']]
        });
        
        res.json(bookings);
    } catch (error) {
        console.error('Failed to fetch client session bookings:', error);
        // This is the error seen in the console
        res.status(500).json({ error: 'Failed to fetch session bookings.' });
    }
});

module.exports = router;