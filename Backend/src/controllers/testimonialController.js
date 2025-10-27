// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const Testimonial = require('../models/Testimonial');
const Booking = require('../models/Booking'); 
const Session = require('../models/Session'); 
const CoachProfile = require('../models/CoachProfile'); 
const User = require('../models/user'); // 🔑 ADDED: Needed for coachName in eligibility check



/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Returns ALL completed bookings for the client/coach pair, including any existing testimonial.
 */
const checkReviewEligibility = async (req, res) => {
    try {
        // 🔑 THE FIX: The JWT payload uses 'userId', not 'id'.
        const clientId = req.user.userId; 
        const coachId = req.params.coachId; // The Coach's User ID
        
        if (!clientId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        
        // 1. Get the CoachProfile ID and associate User details
        const coachProfile = await CoachProfile.findOne({ 
            where: { userId: coachId },
            attributes: ['id'],
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
        });

        if (!coachProfile || !coachProfile.user) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id;
        const coachName = `${coachProfile.user.firstName} ${coachProfile.user.lastName}`;


        // 2. Find ALL completed bookings for this client and coach, and include existing testimonials
        const completedBookings = await Booking.findAll({
            where: {
                clientId,
                status: 'completed', // 🔑 Look for ALL completed sessions
                // Removed isReviewed filter to allow checking/editing reviewed sessions
            },
            // 3. Join with Session model to ensure the booking is for the specified coach
            include: [
                {
                    model: Session,
                    as: 'Session',
                    required: true,
                    attributes: ['id', 'title', 'type', 'coachProfileId'], 
                    where: { coachProfileId: coachProfileId } // Filter by the target coach
                },
                // 🔑 NEW: Join with Testimonial model to see if a review already exists
                {
                    model: Testimonial,
                    as: 'Testimonial', // IMPORTANT: This assumes the association is correct in Sequelize config
                    required: false, // Ensure we get bookings even if no testimonial exists
                    attributes: ['id', 'rating', 'content', 'clientTitle']
                }
            ],
        });
        
        const eligibleSessions = completedBookings
            .map(booking => ({
                id: booking.id, // Booking ID is used as the key
                title: booking.Session.title,
                coachName: coachName,
                coachId: coachId,
                existingReview: booking.Testimonial 
                    ? {
                        id: booking.Testimonial.id,
                        rating: booking.Testimonial.rating,
                        content: booking.Testimonial.content,
                        clientTitle: booking.Testimonial.clientTitle
                      }
                    : null,
            }));

        return res.status(200).json({ eligibleSessions });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return res.status(500).json({ message: 'Server error while checking review eligibility.' });
    }
};

/**
 * Submits a new testimonial OR UPDATES an existing one and marks the associated booking as reviewed (if new).
 */
// ===========================================
// Add Testimonial
// ===========================================
const addTestimonial = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { rating, content, clientTitle, sessionId } = req.body;

        // 1. Check if user is authenticated (This check is now correct)
        // Our new middleware provides req.user even if expired.
        // This will only fail if no token was provided at all.
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        const clientId = req.user.userId;

        // 2. Find the specific booking (session) to link the review to
        const booking = await Booking.findOne({
            where: {
                id: sessionId,
                clientId: clientId,
                status: 'completed',
            },
            include: [{
                model: Session,
                as: 'Session',
                where: { coachProfileId: coachId }
            }]
        });

        if (!booking) {
            return res.status(403).json({ error: 'You are not eligible to review this session. It must be a completed session with this coach.' });
        }

        // 3. Create or Update the Testimonial
        const [testimonial, created] = await Testimonial.upsert(
            {
                coachId: coachId,
                clientId: clientId,
                bookingId: sessionId, // Link to the booking
                rating: parseInt(rating, 10),
                content: content,
                clientTitle: clientTitle || null,
                isApproved: true, 
            },
            {
                // Find existing testimonial by bookingId to update it
                conflictFields: ['bookingId'], 
                returning: true,
            }
        );

        // 4. Mark the booking as reviewed
        if (booking) {
            booking.isReviewed = true;
            await booking.save();
        }

        res.status(created ? 201 : 200).json(testimonial);

    } catch (error) {
        console.error("Failed to add testimonial:", error);
        res.status(500).json({ error: "Failed to submit testimonial." });
    }
};

module.exports = {
    checkReviewEligibility,
    addTestimonial,
};