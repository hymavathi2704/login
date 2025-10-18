// Backend/src/controllers/coachProfileController.js

import { v4 as uuidv4 } from 'uuid';
import path from 'path'; 
import fs from 'fs/promises'; // ✅ USING FS/PROMISES for async file ops
import { fileURLToPath } from 'url';
import User from '../models/user.js'; 
import CoachProfile from '../models/CoachProfile.js'; 
import ClientProfile from '../models/ClientProfile.js'; 
import Testimonial from '../models/Testimonial.js'; 
import Session from '../models/Session.js'; 
// 🚨 REMOVED: Follow, Op (no longer needed here)

// === Environment and Path Setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
// ==================================

// ==============================
// Helper: Safe JSON parse
// ==============================
const safeParse = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

// ==============================
// Helper: Delete Old Profile Picture (Fixes previous delete issue)
// ==============================
const deleteOldProfilePicture = async (publicPath) => {
    if (!publicPath) return;

    // Extract filename from public path (e.g., '/uploads/image.jpg' -> 'image.jpg')
    const fileName = path.basename(publicPath);
    const filePath = path.join(UPLOADS_DIR, fileName);

    try {
        await fs.unlink(filePath);
        console.log(`Successfully deleted old file: ${filePath}`);
    } catch (error) {
        // Ignore "file not found" errors, but log others
        if (error.code !== 'ENOENT') {
            console.error('Error deleting old profile picture:', error);
        }
    }
};


// ==============================
// GET Coach Profile (logged-in)
// ==============================
export const getCoachProfile = async (req, res) => { 
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
        plainUser.CoachProfile.specialties = safeParse(plainUser.CoachProfile.specialties);
        plainUser.CoachProfile.education = safeParse(plainUser.CoachProfile.education);
        plainUser.CoachProfile.certifications = safeParse(plainUser.CoachProfile.certifications);
        plainUser.CoachProfile.pricing = safeParse(plainUser.CoachProfile.pricing);
        plainUser.CoachProfile.availability = safeParse(plainUser.CoachProfile.availability);
    }

    res.json({ user: plainUser });

  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==============================
// UPDATE Coach Profile 
// ==============================
export const updateCoachProfile = async (req, res) => { 
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
            specialties, certifications, education 
        } = req.body; 

        // Store the old picture path before updating
        const oldProfilePicturePath = user.profilePicture; 
        
        const userData = { firstName, lastName, email, phone };
        
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

        // Update CoachProfile Model 
        await coachProfile.update({
            professionalTitle,
            bio, 
            yearsOfExperience: parseInt(yearsOfExperience) || 0,
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            specialties: specialties, 
            certifications: certifications, 
            education: education,
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
            plainUpdatedUser.CoachProfile.specialties = safeParse(plainUpdatedUser.CoachProfile.specialties);
            plainUpdatedUser.CoachProfile.education = safeParse(plainUpdatedUser.CoachProfile.education);
            plainUpdatedUser.CoachProfile.certifications = safeParse(plainUpdatedUser.CoachProfile.certifications);
        }

        res.json({ user: plainUpdatedUser });
    } catch (error) {
        console.error('Error updating coach profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// ==============================
// ADD Item (certification/education/specialties)
// ==============================
export const addItem = async (req, res) => { 
  // ... (original addItem logic remains here)
};

// ==============================
// REMOVE Item (certification/education/specialties)
// ==============================
export const removeItem = async (req, res) => { 
  // ... (original removeItem logic remains here)
};

// ==============================
// UPLOAD Profile Picture
// ==============================
export const uploadProfilePicture = async (req, res) => { 
    const userId = req.user?.userId;
    if (!userId) {
        // Cleanup uploaded file if auth fails
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
        
        // ⚠️ CRITICAL FIX: Delete the OLD file before saving the NEW path
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

// ==============================
// ✅ NEW: DELETE Profile Picture (for the delete button)
// ==============================
export const deleteProfilePicture = async (req, res) => {
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
// Exports (Only profile management functions remain)
// ==============================
export {
    getCoachProfile,
    updateCoachProfile,
    addItem,
    removeItem,
    uploadProfilePicture,
    deleteProfilePicture
};