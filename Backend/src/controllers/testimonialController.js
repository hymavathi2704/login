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
} = require('./models');


/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Returns ALL completed bookings for the client/coach pair, including any existing testimonial.
 */
const checkReviewEligibility = async (req, res) => {
    try {
        const clientId = req.user.userId; // Correct: Use 'userId' from token
        const coachId = req.params.coachId; // This is the Coach's User ID
        
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
                status: 'completed', 
            },
            // 3. Join with Session model to ensure the booking is for the specified coach
            include: [
                {
                    model: Session,
                    as: 'Session', // This alias now works because of the correct import
                    required: true,
                    attributes: ['id', 'title', 'type', 'coachProfileId'], 
                    where: { coachProfileId: coachProfileId } // Filter by the target coach
                },
                // 🔑 Join with Testimonial model to see if a review already exists
                {
                    model: Testimonial,
                    as: 'Testimonial', // This alias now works
                    required: false, 
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
        // This 'catch' block was being triggered by the association error
        console.error('Error checking review eligibility:', error); 
        return res.status(500).json({ message: 'Server error while checking review eligibility.' });
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