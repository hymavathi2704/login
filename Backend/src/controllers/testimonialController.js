// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');

// 🔑 THE FIX: Import all models from the central 'models/index.js'
// This ensures all model associations (like 'as: Session') are loaded.
const {
    Testimonial,
    Booking,
    Session,
    CoachProfile,
    User
} = require('../../models');


/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Returns ALL completed bookings for the client/coach pair, including any existing testimonial.
 */
// ==============================
// Check Review Eligibility (FIXED)
// ==============================
const checkReviewEligibility = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        // 1. Find the booking by its ID and the client ID (to ensure ownership)
        const booking = await Booking.findOne({
            where: { id: bookingId, clientId: userId }
        });

        // 2. Check if booking exists
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or you are not authorized to review it.' });
        }

        // 3. Check if the booking status is 'completed'
        if (booking.status !== 'completed') {
            return res.status(403).json({ error: 'You can only review completed sessions.' });
        }

        // 4. Check the 'isReviewed' flag (This is the correct logic)
        if (booking.isReviewed) {
            return res.status(403).json({ error: 'A review has already been submitted for this booking.' });
        }

        // 5. If all checks pass, the client is eligible
        res.status(200).json({ eligible: true, message: 'You are eligible to review this booking.' });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ message: 'Server error while checking review eligibility.' });
    }
};

/**
 * Submits a new testimonial OR UPDATES an existing one and marks the associated booking as reviewed (if new).
 */
const addTestimonial = async (req, res) => {
    try {
        const { coachId } = req.params; // This is Coach User ID
        const { rating, content, clientTitle, sessionId } = req.body; // sessionId is Booking ID

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        const clientId = req.user.userId;

        // 🔑 PROACTIVE FIX: We need the CoachProfile ID from the Coach User ID
        // The original code was incorrectly comparing coachProfileId (PK) with coachId (User ID)
        const coachProfile = await CoachProfile.findOne({
            where: { userId: coachId },
            attributes: ['id']
        });

        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach not found.' });
        }
        const coachProfileId = coachProfile.id; // This is the correct CoachProfile ID

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
                required: true, 
                // 🔑 FIX: Compare Session.coachProfileId with the correct coachProfileId
                where: { coachProfileId: coachProfileId } 
            }]
        });

        if (!booking) {
            return res.status(403).json({ error: 'You are not eligible to review this session. It must be a completed session with this coach.' });
        }

        // 3. Create or Update the Testimonial
        const [testimonial, created] = await Testimonial.upsert(
            {
                coachId: coachId, // This is the Coach User ID
                clientId: clientId, // Client User ID
                bookingId: sessionId, // Link to the booking
                rating: parseInt(rating, 10),
                content: content,
                clientTitle: clientTitle || null,
                isApproved: true, 
            },
            {
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