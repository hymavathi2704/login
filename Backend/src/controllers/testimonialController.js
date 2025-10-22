// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const Testimonial = require('../models/Testimonial');
const Booking = require('../models/Booking'); 
const Session = require('../models/Session'); 
const CoachProfile = require('../models/CoachProfile'); // Needed to get coachProfileId

/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Eligibility: Client must have a 'completed' booking with the coach that has NOT been reviewed yet.
 */
const checkReviewEligibility = async (req, res) => {
    try {
        const clientId = req.user.id; 
        const coachId = req.params.coachId; // The Coach's User ID
        
        if (!clientId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        
        // 1. Get the CoachProfile ID from the Coach's User ID
        const coachProfile = await CoachProfile.findOne({ 
            where: { userId: coachId },
            attributes: ['id']
        });

        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id;

        // 2. Find all eligible bookings (completed AND not reviewed)
        const eligibleBookings = await Booking.findAll({
            where: {
                clientId,
                status: 'completed', // 🔑 Only completed sessions
                isReviewed: false     // 🔑 Only unreviewed sessions (FIXED with model update)
            },
            // 3. Join with Session model to ensure the booking is for the specified coach
            include: [{
                model: Session,
                as: 'Session',
                required: true,
                attributes: ['id', 'title'],
                where: { coachProfileId: coachProfileId } // Filter by the target coach
            }],
        });
        
        const eligibleSessions = eligibleBookings
            .map(booking => ({
                // IMPORTANT: Pass the Booking ID, not the Session ID
                id: booking.id, 
                title: `${booking.Session.title} (Booking ID: ${booking.id})`,
            }));

        return res.status(200).json({ eligibleSessions });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return res.status(500).json({ message: 'Server error while checking review eligibility.' });
    }
};

/**
 * Submits a new testimonial and marks the associated booking as reviewed.
 */
const addTestimonial = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { rating, content, clientTitle, sessionId: bookingId } = req.body; 

        if (!rating || !content || !bookingId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // 1. Verify and lock the booking 
        const booking = await Booking.findOne({
            where: {
                id: bookingId,
                clientId,
                status: 'completed',
                isReviewed: false 
            },
            include: [{ 
                model: Session, 
                as: 'Session',
                attributes: ['coachProfileId', 'type'] 
            }] 
        });

        if (!booking || !booking.Session) {
            return res.status(403).json({ error: 'The selected session is not eligible for review.' });
        }
        
        const coachProfileId = booking.Session.coachProfileId;
        const sessionType = booking.Session.type;

        // 2. Create the Testimonial entry
        await Testimonial.create({
            id: uuidv4(),
            coachProfileId,
            clientId,
            clientTitle: clientTitle || null,
            rating: parseInt(rating),
            content,
            date: new Date().toISOString().split('T')[0], 
            sessionType, 
        });

        // 3. Mark the Booking as reviewed
        await booking.update({ isReviewed: true });
        
        return res.status(201).json({ message: 'Testimonial submitted successfully!' });

    } catch (error) {
        console.error('Error submitting testimonial:', error);
        return res.status(500).json({ error: 'Failed to submit testimonial. Server error.' });
    }
};

module.exports = {
    checkReviewEligibility,
    addTestimonial,
};