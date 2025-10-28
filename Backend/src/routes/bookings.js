const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

const { Booking, User, Session, CoachProfile } = require('../../models');
// GET /api/bookings/client-sessions - Get a client's session bookings
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
            // 🔑 FIX: Include isReviewed in attributes
            attributes: ['id', 'clientId', 'sessionId', 'status', 'bookedAt', 'isReviewed'],
            include: [
                {
                    model: Session,
                    as: 'Session', 
                    attributes: ['id', 'title', 'duration', 'price', 'type', 'defaultDate', 'defaultTime', 'meetingLink'],
                    required: true,
                    include: [{ 
                        model: CoachProfile, 
                        as: 'coachProfile', 
                        // 🔑 FIX: Fetch coach's user ID for frontend logic
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