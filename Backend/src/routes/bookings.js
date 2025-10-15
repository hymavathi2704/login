const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

// Only import the models actually needed for *this* route
const Booking = require('../models/Booking');
const User = require('../models/user');
const Session = require('../models/Session'); 
const CoachProfile = require('../models/CoachProfile'); 

// GET /api/bookings/client-sessions - Get a client's session bookings
// Renamed the path for clarity
router.get('/client-sessions', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const bookings = await Booking.findAll({
            where: { 
                clientId: userId,
                // Ensure it only fetches Session-based bookings, not old Events
                sessionId: { [Op.ne]: null } 
            },
            attributes: ['id', 'clientId', 'sessionId', 'status', 'bookedAt'],
            include: [
                {
                    model: Session,
                    as: 'Session', 
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
        res.status(500).json({ error: 'Failed to fetch session bookings.' });
    }
});

module.exports = router;