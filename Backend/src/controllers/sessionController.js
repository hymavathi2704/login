// Backend/src/controllers/sessionController.js

const Session = require('../models/Session');
const CoachProfile = require('../models/CoachProfile');
const { Op } = require('sequelize');

// ==============================
// Helper: Sanitize & Map Data
// ==============================
const sanitizeSessionData = (data) => {
    // We expect 'name' from the frontend, but the model needs 'title'.
    const title = data.name; // Use frontend 'name' for title
    
    // Ensure price and duration are correctly typed
    const duration = parseInt(data.duration, 10);
    const price = parseFloat(data.price);
    
    return {
        // Map 'name' to 'title'
        title: title, 
        
        // Map 'type' (frontend 'format') to 'type'
        type: data.type, 

        // Map Duration/Price/Description
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
        
        // This line is where the Sequelize validation error occurred.
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
        // This is necessary to debug validation errors during development
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

module.exports = {
    createSession,
    updateSession,
    deleteSession
};