const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require(('../models/ClientProfile'));
const path = require('path'); // Required for file paths
const fs = require('fs');   // Required for file system operations

// Define the root directory for uploads, used for disk cleanup
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');


// Helper function to safely parse potential JSON strings (from FE or BE)
const safeParse = (value) => {
    if (typeof value === 'string') {
        try {
            if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
                return JSON.parse(value);
            }
        } catch (e) {
            console.warn('Failed to parse JSON string:', value);
        }
    }
    return value;
};

// ==============================
// GET Coach Profile (FIXED FETCH)
// ==============================
const getCoachProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId, {
            include: [
                { model: CoachProfile, as: 'CoachProfile' },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user: user.get({ plain: true }) });

    } catch (error) {
        console.error('Error fetching coach profile:', error.stack);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};


// ==============================
// PUT/UPDATE Coach Profile (FINAL MAPPING & PARSING FIX)
// ==============================
const updateCoachProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 1. Separate and Map Data

        // Core User Data 
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email?.toLowerCase().trim(),
            phone: req.body.phone,
            // NOTE: profilePicture is handled by the dedicated upload route,
            // and should not be passed or processed here.
        };

        // Coach Profile Data
        const coachData = {
            professionalTitle: req.body.professionalTitle,
            websiteUrl: req.body.websiteUrl,
            yearsOfExperience: req.body.yearsOfExperience,

            // APPLY SAFE PARSE TO ALL COMPLEX FIELDS BEFORE SENDING TO DB
            bio: req.body.bio,
            specialties: safeParse(req.body.specialties),
            certifications: safeParse(req.body.certifications),
            education: safeParse(req.body.education),
            sessionTypes: safeParse(req.body.sessionTypes),
            pricing: safeParse(req.body.pricing),
            availability: safeParse(req.body.availability),
        };
        
        // Clean up payloads by removing undefined or null values
        Object.keys(userData).forEach(key => (userData[key] === undefined || userData[key] === null) && delete userData[key]);
        Object.keys(coachData).forEach(key => (coachData[key] === undefined || coachData[key] === null) && delete coachData[key]);
        
        // 2. Update core User Data
        await user.update(userData);

        // 3. Update CoachProfile Data 
        if (Object.keys(coachData).length > 0) {
            const [coachProfile] = await CoachProfile.findOrCreate({ where: { userId } });
            await coachProfile.update(coachData);
        }
        
        // 4. Fetch the fully updated user object to return
        const updatedUser = await User.findByPk(userId, {
            include: [
                { model: CoachProfile, as: 'CoachProfile' },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser.get({ plain: true }),
        });

    } catch (error) {
        console.error('Update Coach Profile Error (CRITICAL):', error.stack);
        res.status(500).json({ error: 'Failed to save profile due to a server error. Check the backend console logs for the detailed Sequelize error.' });
    }
};

// ==============================
// POST Profile Picture Upload (FIXED PERSISTENCE)
// ==============================
/**
 * @desc    Uploads a new profile picture and updates the user record
 * @route   POST /api/auth/profile/upload-picture
 * @access  Private (Coach/Authenticated User)
 */
const uploadProfilePicture = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Multer saves the file to req.file
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or file type is invalid (must be an image).' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            // Clean up the uploaded file if user is not found
            fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Fetch the CoachProfile record (FindOrCreate handles cases where it might not exist yet)
        let [coachProfile] = await CoachProfile.findOrCreate({ where: { userId } });

        // --- Clean up the OLD profile picture file on the server's disk ---
        const oldPublicPath = coachProfile.profilePicture; // <-- GET PATH FROM CORRECT MODEL
        const newFilename = req.file.filename;

        if (oldPublicPath && oldPublicPath.startsWith('/uploads/')) {
            const oldFilename = oldPublicPath.replace('/uploads/', '');
            const fullOldPath = path.join(UPLOADS_DIR, oldFilename);
            
            try {
                if (fs.existsSync(fullOldPath)) {
                    fs.unlinkSync(fullOldPath);
                }
            } catch (err) {
                console.warn('Error deleting old profile picture:', err.message);
            }
        }
        // ----------------------------------------------------------------------


        // The path saved to the database is the public URL path
        const publicPath = `/uploads/${newFilename}`;
        
        // 🔑 CRITICAL FIX: Update the CoachProfile record with the new file path
        coachProfile.profilePicture = publicPath;
        await coachProfile.save(); 

        // Respond with the new path so the frontend can display it
        // The frontend uses this value to update AuthContext state and force re-render.
        res.json({
            message: 'Profile picture uploaded successfully',
            profilePicture: publicPath, // Return the publicPath directly
        });

    } catch (error) {
        console.error('Error in uploadProfilePicture:', error.stack);
        // Clean up the newly uploaded file on severe error
        try {
            fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
        } catch (cleanupErr) {
            // Log cleanup error if necessary
        }
        res.status(500).json({ message: 'Failed to upload image due to server error.' });
    }
};


module.exports = {
    getCoachProfile,
    updateCoachProfile,
    uploadProfilePicture, // <<< EXPORT NEW FUNCTION
};