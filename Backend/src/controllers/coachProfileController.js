const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Event = require('../models/Event');
const Testimonial = require('../models/Testimonial');

// Define the root directory for uploads, used for disk cleanup
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// ==============================
// Helper: Safe JSON parse
// ==============================
const safeParse = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

// Helper function to fetch and parse the full user profile
const fetchAndParseUser = async (userId) => {
    const user = await User.findByPk(userId, {
        include: [
            { model: CoachProfile, as: 'CoachProfile' }, 
            { model: ClientProfile, as: 'ClientProfile' }
        ],
    });

    if (!user) return null;

    const plainUser = user.get({ plain: true });

    // CRITICAL FIX: Parse JSON string fields for the frontend
    if (plainUser.CoachProfile) {
        plainUser.CoachProfile.specialties = safeParse(plainUser.CoachProfile.specialties);
        plainUser.CoachProfile.education = safeParse(plainUser.CoachProfile.education);
        plainUser.CoachProfile.certifications = safeParse(plainUser.CoachProfile.certifications);
        plainUser.CoachProfile.sessionTypes = safeParse(plainUser.CoachProfile.sessionTypes);
        plainUser.CoachProfile.pricing = safeParse(plainUser.CoachProfile.pricing);
        plainUser.CoachProfile.availability = safeParse(plainUser.CoachProfile.availability);
    }
    return plainUser;
};


// ==============================
// GET Coach Profile (logged-in)
// ==============================
const getCoachProfile = async (req, res) => {
  try {
    const userId = req.user?.userId; 
    if (!userId) return res.status(401).json({ error: 'User ID missing from token' });

    // Use the robust helper function
    const plainUser = await fetchAndParseUser(userId);

    if (!plainUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: plainUser });

  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==============================
// UPDATE Coach Profile <<< FIX APPLIED HERE >>>
// ==============================
const updateCoachProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

    const user = await User.findByPk(userId, { include: { model: CoachProfile, as: 'CoachProfile' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      firstName, lastName, email, phone,
      professionalTitle, profilePicture, websiteUrl, bio,
      yearsOfExperience, 
      sessionTypes,
      pricing, availability,
      // CRITICAL: Explicitly get list fields from req.body
      specialties,
      certifications,
      education // Kept in req.body logic even if frontend removed it, in case the list logic is re-used.
    } = req.body;

    // Update user fields
    await user.update({ firstName, lastName, email, phone });

    // Update or create coach profile
    let coachProfile = user.CoachProfile;
    if (!coachProfile) coachProfile = await CoachProfile.create({ userId });

    // Build the update payload dynamically to include the list arrays if they exist in the request body
    const coachUpdatePayload = {
      professionalTitle,
      profilePicture, 
      websiteUrl,
      bio,
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      sessionTypes: sessionTypes || '[]', 
      pricing: pricing || '{}',
      availability: availability || '{}'
    };
    
    // 🔑 FINAL FIX: Only include list fields if they are explicitly present in the request body 
    // AND are arrays (as the frontend sends them) to avoid overwriting with null.
    if (Array.isArray(specialties)) {
        // Sequelize automatically converts the array to JSON string for the DB.
        coachUpdatePayload.specialties = specialties; 
    }
    if (Array.isArray(certifications)) {
        coachUpdatePayload.certifications = certifications; 
    }
    if (Array.isArray(education)) {
        coachUpdatePayload.education = education; 
    }

    await coachProfile.update(coachUpdatePayload);

    // Return the updated, fully parsed user object
    const plainUpdatedUser = await fetchAndParseUser(userId);
    res.json({ user: plainUpdatedUser });
  } catch (error) {
    console.error('Error updating coach profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ==============================
// ADD Item (certification/education/specialties)
// ==============================
const addItem = async (req, res) => {
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

    // 1. CRITICAL FIX: Explicitly handle null/corrupted data and parse
    let currentItems = coachProfile[type];
    if (!currentItems) {
        currentItems = []; 
    } else {
        currentItems = safeParse(currentItems); 
        if (!Array.isArray(currentItems)) { 
            currentItems = [];
        }
    }
    
    currentItems.push({ ...item, id: uuidv4() });

    // 2. Save the array directly (Sequelize handles JSON conversion)
    await coachProfile.update({ [type]: currentItems });
    
    // 3. Return the specific array for immediate frontend state update
    res.json({ [type]: currentItems });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

// ==============================
// REMOVE Item (certification/education/specialties)
// ==============================
const removeItem = async (req, res) => {
  try {
    const { type, id } = req.body;
    const allowedTypes = ['certifications', 'education', 'specialties'];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid item type specified.' });
    }

    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

    const coachProfile = await CoachProfile.findOne({ where: { userId } });
    if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

    // 1. CRITICAL FIX: Explicitly handle null/corrupted data and parse
    let currentItems = coachProfile[type];
    if (!currentItems) {
        currentItems = [];
    } else {
        currentItems = safeParse(currentItems);
        if (!Array.isArray(currentItems)) {
            currentItems = [];
        }
    }
    
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    // 2. Save the filtered array directly (Sequelize handles JSON conversion)
    await coachProfile.update({ [type]: updatedItems });
    
    // 3. Return the specific array for immediate frontend state update
    res.json({ [type]: updatedItems });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// ==============================
// UPLOAD Profile Picture
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
            // Unlink file logic omitted for brevity
            return res.status(404).json({ message: 'User not found' });
        }
        
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
        // File cleanup logic omitted for brevity
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

    // CRITICAL FIX FOR PUBLIC PROFILE: Parse JSON strings
    const plainCoachProfile = coachProfile.get({ plain: true });
    
    if (plainCoachProfile.specialties) plainCoachProfile.specialties = safeParse(plainCoachProfile.specialties);
    if (plainCoachProfile.education) plainCoachProfile.education = safeParse(plainCoachProfile.education);
    if (plainCoachProfile.certifications) plainCoachProfile.certifications = safeParse(plainCoachProfile.certifications);


    const user = plainCoachProfile.user;

    // Step 2: Construct final object
    const profile = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: plainCoachProfile.profilePicture, // from CoachProfile
      events: user.events || [], // ✅ events included via User
      testimonials: plainCoachProfile.testimonials || [],
      title: plainCoachProfile.professionalTitle,
      rating: 4.9,
      totalReviews: plainCoachProfile.testimonials?.length || 0,
      totalClients: 0,
      yearsExperience: plainCoachProfile.yearsOfExperience || 0,
      shortBio: plainCoachProfile.bio ? plainCoachProfile.bio.substring(0, 150) + '...' : '',
      fullBio: plainCoachProfile.bio || '',
      isAvailable: true,
      avgResponseTime: plainCoachProfile.responseTime || 'within-4h',
      timezone: plainCoachProfile.availability?.timezone || 'UTC',
      startingPrice: plainCoachProfile.pricing?.individual || 0,
      
      // ADD PARSED LIST FIELDS TO THE PUBLIC RESPONSE
      specialties: plainCoachProfile.specialties || [],
      education: plainCoachProfile.education || [],
      certifications: plainCoachProfile.certifications || [],
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
  addItem,
  removeItem,
  uploadProfilePicture, 
  getPublicCoachProfile, 
};