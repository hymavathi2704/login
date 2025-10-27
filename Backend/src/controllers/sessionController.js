// Backend/src/controllers/sessionController.js

const { Op } = require('sequelize');
const { Session, CoachProfile, Booking, User } = require('../../models');
// ==============================
// Helper: Sanitize & Map Data (UPDATED)
// ==============================
const sanitizeSessionData = (data) => {
    // Frontend is expected to send 'title', 'type', 'duration', and 'price'.
    
    // Ensure price and duration are correctly typed
    const duration = parseInt(data.duration, 10) || 0; // Default to 0 if invalid
    const price = parseFloat(data.price) || 0.0;     // Default to 0.0 if invalid
    
    return {
        // Ensure required fields map correctly
        title: data.title || data.name || 'Untitled Session', 
        
        // This is the "section type" field you asked about.
        type: data.type || 'individual', // Default to 'individual' if missing

        duration: duration, 
        price: price, 
        description: data.description || null,
        
        // Sanitize optional fields
        defaultDate: data.defaultDate || null,
        defaultTime: data.defaultTime || null,
        meetingLink: data.meetingLink || null,
        
        isActive: true, // Default status
    };
};

// ==========================================
// 1. CREATE SESSION
// ==========================================
const createSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const data = req.body;

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }

        const sanitizedData = sanitizeSessionData(data);
        
        const newSession = await Session.create({
            coachProfileId: coachProfile.id,
            ...sanitizedData, // Now contains a valid 'title' field
        });

        return res.status(201).json({ 
            message: 'Session created successfully.',
            session: newSession 
        });

    } catch (error) {
        console.error('Error creating session:', error);
        if (error.name === 'SequelizeValidationError') {
            console.error('Sequelize Validation Errors:', error.errors.map(e => e.message));
        }
        return res.status(500).json({ error: 'Failed to create session' });
    }
};

// ==========================================
// 2. UPDATE SESSION
// ==========================================
const updateSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const sessionId = req.params.sessionId;
        const data = req.body;

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }

        const session = await Session.findOne({ 
            where: { 
                id: sessionId, 
                coachProfileId: coachProfile.id 
            } 
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }

        const sanitizedData = sanitizeSessionData(data);
        
        await session.update(sanitizedData);

        return res.json({ 
            message: 'Session updated successfully.',
            session 
        });

    } catch (error) {
        console.error('Error updating session:', error);
        return res.status(500).json({ error: 'Failed to update session' });
    }
};


// ==========================================
// 3. DELETE SESSION
// ==========================================
const deleteSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const sessionId = req.params.sessionId;

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }

        const result = await Session.destroy({ 
            where: { 
                id: sessionId, 
                coachProfileId: coachProfile.id 
            } 
        });

        if (result === 0) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }

        return res.json({ message: 'Session deleted successfully.' });

    } catch (error) {
        console.error('Error deleting session:', error);
        return res.status(500).json({ error: 'Failed to delete session' });
    }
};


// ==========================================
// 4. BOOK SESSION (Anti-Duplication Logic)
// ==========================================
const bookSession = async (req, res) => {
    try {
        // Assuming your authMiddleware adds req.user.userId
        const clientId = req.user.userId;
        const { sessionId } = req.params;
        
        const session = await Session.findByPk(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found.' });
        }
        
        // 🚨 CRITICAL CHECK: Prevent multiple active bookings for the same session by one client
        const existingBooking = await Booking.findOne({ 
            where: { 
                clientId, 
                sessionId, 
                // Status must NOT be 'cancelled'. Adjust if you have other terminal statuses.
                status: { [Op.ne]: 'cancelled' } 
            } 
        });

        if (existingBooking) {
            // This is the error message returned when a client tries to re-book.
            return res.status(400).json({ 
                error: 'You have already purchased or booked this session.' 
            });
        }
        
        // Create the new booking
        const booking = await Booking.create({ clientId, sessionId, status: 'confirmed' });

        // Optional: Send confirmation email (assuming functionality exists)
        // await sendBookingConfirmation(clientId, session.id); 

        return res.status(201).json({ message: 'Session booked successfully.', booking });
    } catch (error) {
        console.error("Session Booking Error:", error);
        return res.status(500).json({ error: 'Failed to book session.' });
    }
};


// ==========================================
// 5. GET COACH SESSION BOOKINGS (FIXED)
// ==========================================
const getCoachSessionBookings = async (req, res) => {
    try {
        const coachId = req.user.userId;
        
        const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
        if (!coachProfile) {
             return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id;

        const bookings = await Booking.findAll({
            where: { 
                sessionId: { [Op.ne]: null } // Only look for Session bookings
            },
            include: [
                {
                    model: Session,
                    as: 'Session', // 🚨 CRITICAL FIX: Use the 'Session' alias matching server.js
                    required: true,
                    where: { coachProfileId: coachProfileId }, // Filter by this coach's sessions
                    attributes: ['id', 'title', 'duration', 'price', 'type', 'defaultDate', 'defaultTime', 'meetingLink'],
                },
                {
                    model: User,
                    as: 'client', // Alias for the client user
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
                }
            ],
            order: [['bookedAt', 'DESC']]
        });
        
        return res.json(bookings);

    } catch (error) {
        console.error("Coach Session Bookings Error:", error);
        return res.status(500).json({ error: 'Failed to fetch coach session bookings.' });
    }
};

module.exports = {
    createSession,
    updateSession,
    deleteSession,
    bookSession,
    getCoachSessionBookings // <-- EXPORTED
};