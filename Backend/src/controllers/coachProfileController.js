const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Event = require('../models/Event'); // ✅ FIX: Import Event model
const Testimonial = require('../models/Testimonial'); // ✅ FIX: Import Testimonial model
const path = require('path');
const fs = require('fs');

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
// GET Coach Profile 
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
// PUT/UPDATE Coach Profile 
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
        };

        // Coach Profile Data
        const coachData = {
            professionalTitle: req.body.professionalTitle,
            websiteUrl: req.body.websiteUrl,
            yearsOfExperience: req.body.yearsOfExperience,
            responseTime: req.body.responseTime, // Ensure this field is handled if present

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
// POST Profile Picture Upload
// ==============================
const uploadProfilePicture = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or file type is invalid (must be an image).' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
            return res.status(404).json({ message: 'User not found' });
        }

        const oldPublicPath = user.profilePicture;
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
            fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
        } catch (cleanupErr) {
            // Log cleanup error if necessary
        }
        res.status(500).json({ message: 'Failed to upload image due to server error.' });
    }
};

const getPublicCoachProfile = async (req, res) => {
  try {
    const coachId = req.params.id;
    console.log("Fetching public coach profile for:", coachId);

    // Step 1: Find the coach profile
    const coachProfile = await CoachProfile.findOne({
      where: { userId: coachId }, // coachId = User ID
      include: [
        {
          model: User,
          as: 'user', // ✅ correct alias
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          include: [
            {
              model: Event,
              as: 'events', // ✅ belongs to User
              required: false,
              where: { status: 'published' },
              attributes: ['id', 'title', 'description', 'type', 'date', 'time', 'duration', 'price'],
            },
          ],
        },
        {
          model: Testimonial,
          as: 'testimonials',
          required: false,
          attributes: ['id', 'clientName', 'clientTitle', 'clientAvatar', 'rating', 'content', 'date', 'sessionType'],
        },
      ],
    });

    if (!coachProfile || !coachProfile.user) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    const user = coachProfile.user.get({ plain: true });

    // Step 2: Construct final object
    const profile = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: coachProfile.profilePicture, // from CoachProfile
      events: user.events || [], // ✅ events included via User
      testimonials: coachProfile.testimonials || [],
      title: coachProfile.professionalTitle,
      rating: 4.9,
      totalReviews: coachProfile.testimonials?.length || 0,
      totalClients: 0,
      yearsExperience: coachProfile.yearsOfExperience || 0,
      shortBio: coachProfile.bio ? coachProfile.bio.substring(0, 150) + '...' : '',
      fullBio: coachProfile.bio || '',
      isAvailable: true,
      avgResponseTime: coachProfile.responseTime || 'within-4h',
      timezone: coachProfile.availability?.timezone || 'UTC',
      startingPrice: coachProfile.pricing?.individual || 0,
    };

    res.status(200).json({ coach: profile });
  } catch (error) {
    console.error('Error fetching public coach profile:', error);
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
};




module.exports = {
    getCoachProfile,
    updateCoachProfile,
    uploadProfilePicture, 
    getPublicCoachProfile, 
};