// Backend/src/controllers/coachProfileController.js

const { v4: uuidv4 } = require('uuid');
const path = require('path'); 
const fs = require('fs/promises'); 
const { Op } = require('sequelize'); 

const User = require('../models/user'); 
const CoachProfile = require('../models/CoachProfile'); 
const ClientProfile = require('../models/ClientProfile'); 
const Testimonial = require('../models/Testimonial'); 
const Session = require('../models/Session'); 

// === Environment and Path Setup ===
const UPLOADS_DIR = path.join(process.cwd(), 'src', 'uploads'); 

// ==============================
// Helper: Safe JSON parse and array check
// ==============================
const safeParseArray = (jsonString) => {
  if (!jsonString) return [];
  if (typeof jsonString !== 'string') return Array.isArray(jsonString) ? jsonString : [];
  try { 
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch { 
    return []; 
  }
};

// ==============================
// Helper: Delete Old Profile Picture
// ==============================
const deleteOldProfilePicture = async (publicPath) => {
    if (!publicPath) return;

    const fileName = path.basename(publicPath);
    const filePath = path.join(UPLOADS_DIR, fileName);

    try {
        await fs.unlink(filePath);
        console.log(`Successfully deleted old file: ${filePath}`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Error deleting old profile picture:', error);
        }
    }
};


// ==============================
// GET Coach Profile
// ==============================
const getCoachProfile = async (req, res) => { 
  try {
    const userId = req.user?.userId; 
    if (!userId) return res.status(401).json({ error: 'User ID missing from token' });

    const user = await User.findByPk(userId, {
        include: [
            { 
                model: CoachProfile, 
                as: 'CoachProfile',
                include: [{ model: Session, as: 'sessions' }] 
            }, 
            { model: ClientProfile, as: 'ClientProfile' }
        ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plainUser = user.get({ plain: true });

    if (plainUser.CoachProfile) {
        // Use safeParseArray helper for JSON fields
        plainUser.CoachProfile.specialties = safeParseArray(plainUser.CoachProfile.specialties);
        plainUser.CoachProfile.education = safeParseArray(plainUser.CoachProfile.education);
        plainUser.CoachProfile.certifications = safeParseArray(plainUser.CoachProfile.certifications);
        plainUser.CoachProfile.pricing = safeParseArray(plainUser.CoachProfile.pricing); 
        plainUser.CoachProfile.availability = safeParseArray(plainUser.CoachProfile.availability); 
    }
    
    // Note: The profile picture is available directly on plainUser.profilePicture

    res.json({ user: plainUser });

  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==============================
// UPDATE Coach Profile
// ==============================
const updateCoachProfile = async (req, res) => { 
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

        const user = await User.findByPk(userId, { include: { model: CoachProfile, as: 'CoachProfile' } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const {
            firstName, lastName, email, phone,
            professionalTitle, bio, 
            yearsOfExperience, 
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            // These come in as stringified JSON from FormData in index.jsx
            specialties, certifications, education 
        } = req.body; 

        // Store the old picture path before updating
        const oldProfilePicturePath = user.profilePicture; 
        
        const userData = { firstName, lastName, email, phone };
        
        // 1. Handle File Upload/Deletion (from index.jsx FormData logic)
        if (req.file) {
            // A new file was uploaded: update path and delete the old one.
            userData.profilePicture = `/uploads/${req.file.filename}`;
            if (oldProfilePicturePath) await deleteOldProfilePicture(oldProfilePicturePath);

        } else if (req.body.profilePicture === 'null' || req.body.profilePicture === '') {
            // User explicitly removed the picture: update to null and delete the old file.
            userData.profilePicture = null;
            if (oldProfilePicturePath) await deleteOldProfilePicture(oldProfilePicturePath);

        } else if (oldProfilePicturePath) {
            // The user did not upload a new file, and did not remove the old one: keep it.
            userData.profilePicture = oldProfilePicturePath;
        }

        // Update User Model (Handles core user fields and profilePicture)
        await user.update(userData); 

        let coachProfile = user.CoachProfile;
        if (!coachProfile) coachProfile = await CoachProfile.create({ userId });

        // Parse JSON stringified arrays back into arrays for the DB update
        const specialtiesParsed = specialties ? safeParseArray(specialties) : coachProfile.specialties;
        const certificationsParsed = certifications ? safeParseArray(certifications) : coachProfile.certifications;
        const educationParsed = education ? safeParseArray(education) : coachProfile.education;
        
        // Update CoachProfile Model 
        await coachProfile.update({
            professionalTitle,
            bio, 
            yearsOfExperience: parseInt(yearsOfExperience) || 0,
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            specialties: specialtiesParsed, 
            certifications: certificationsParsed, 
            education: educationParsed,
        });

        // Fetch and return the updated user object
        const updatedUser = await User.findByPk(userId, {
            include: [
                { 
                    model: CoachProfile, 
                    as: 'CoachProfile',
                    include: [{ model: Session, as: 'sessions' }] 
                },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
        });

        const plainUpdatedUser = updatedUser.get({ plain: true });
        
        if (plainUpdatedUser.CoachProfile) {
            plainUpdatedUser.CoachProfile.specialties = safeParseArray(plainUpdatedUser.CoachProfile.specialties);
            plainUpdatedUser.CoachProfile.education = safeParseArray(plainUpdatedUser.CoachProfile.education);
            plainUpdatedUser.CoachProfile.certifications = safeParseArray(plainUpdatedUser.CoachProfile.certifications);
        }

        res.json({ user: plainUpdatedUser });
    } catch (error) {
        console.error('Error updating coach profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// ==============================
// ADD Profile Item 
// ==============================
const addProfileItem = async (req, res) => { 
    try {
        const { type, item } = req.body; 
        const allowedTypes = ['certifications', 'education', 'specialties'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid item type specified.' });
        }
        
        const userId = req.user.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        
        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

        // 1. Read existing array safely
        const existingArray = safeParseArray(coachProfile[type]);
        
        // 2. Prepare and append the new item
        let updatedArray;
        if (type === 'specialties') {
            // Specialties are simple strings
            if (existingArray.includes(item)) { // Prevent duplicates
                return res.json({ [type]: existingArray });
            }
            updatedArray = [...existingArray, item];
        } else {
            // Certs/Education are objects. Ensure they have a unique ID.
            const newItem = { 
                ...item, 
                id: item.id || uuidv4() // Use passed temp ID or generate new UUID
            };
            updatedArray = [...existingArray, newItem];
        }

        // 3. Update the database field with the new array (Sequelize handles JSON stringification)
        await coachProfile.update({ [type]: updatedArray });
        
        // 4. Return the specific type field array, now refreshed
        res.json({ [type]: updatedArray });
    } catch (error) {
        console.error('Error adding profile item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
};

// ==============================
// REMOVE Profile Item 
// ==============================
const removeProfileItem = async (req, res) => { 
    try {
        const { type, id } = req.body; // id is either the string specialty or the object ID
        const allowedTypes = ['certifications', 'education', 'specialties'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid item type specified.' });
        }

        const userId = req.user.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

        // 1. Read existing array safely
        const existingArray = safeParseArray(coachProfile[type]);
        
        // 2. Filter the array to remove the item
        const updatedArray = existingArray.filter(item => 
            type === 'specialties' ? item !== id : item.id !== id
        );

        // 3. Update the database field with the filtered array
        await coachProfile.update({ [type]: updatedArray });
        
        // 4. Return the newly updated array list
        res.json({ [type]: updatedArray });
    } catch (error) {
        console.error('Error removing profile item:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
};

// Functions below are currently unused by the frontend, but keeping them defined and exporting.
const uploadProfilePicture = async (req, res) => { 
    // This logic is mostly handled by updateCoachProfile, but keeping the function definition.
    const userId = req.user?.userId;
    if (!userId) {
        if (req.file) await fs.unlink(path.join(UPLOADS_DIR, req.file.filename)).catch(() => {});
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or file type is invalid (must be an image).' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            await fs.unlink(path.join(UPLOADS_DIR, req.file.filename));
            return res.status(404).json({ message: 'User not found' });
        }
        
        const oldProfilePicturePath = user.profilePicture;
        if (oldProfilePicturePath) await deleteOldProfilePicture(oldProfilePicturePath);
        
        const newFilename = req.file.filename;
        const publicPath = `/uploads/${newFilename}`;
        user.profilePicture = publicPath;
        await user.save(); 

        res.json({
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture, 
        });

    } catch (error) {
        console.error('Error in uploadProfilePicture:', error.stack);
        try {
            if (req.file) { 
                await fs.unlink(path.join(UPLOADS_DIR, req.file.filename));
            }
        } catch (cleanupErr) {
            console.error('Cleanup error:', cleanupErr);
        }
        res.status(500).json({ message: 'Failed to upload image due to server error.' });
    }
};

const deleteProfilePicture = async (req, res) => {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const oldFileName = user.profilePicture;
    
    // 1. Delete the file from the disk (using the safe helper)
    if (oldFileName) await deleteOldProfilePicture(oldFileName); 

    // 2. Update the user record to clear the profilePicture field
    user.profilePicture = null;
    await user.save();

    res.status(200).json({ 
        message: 'Profile picture successfully deleted.',
        profilePicture: null 
    });
};


// ==============================
// Final module.exports block
// ==============================
module.exports = {
    getCoachProfile,
    updateCoachProfile,
    addProfileItem, 
    removeProfileItem, 
    uploadProfilePicture,
    deleteProfilePicture
};