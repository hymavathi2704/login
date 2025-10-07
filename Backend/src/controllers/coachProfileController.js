const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Event = require('../models/Event');
const Testimonial = require('../models/Testimonial');
const Session = require('../models/Session'); // CRITICAL: Import Session model
const { Op } = require('sequelize'); // CRITICAL: Import Op for filtering

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

// ==============================
// GET Coach Profile (logged-in)
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
                include: [{ model: Session, as: 'sessions' }] // UPDATED: Use 'sessions' alias
            }, 
            { model: ClientProfile, as: 'ClientProfile' }
        ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plainUser = user.get({ plain: true });

    // CRITICAL FIX: Parse JSON string fields for the frontend
    if (plainUser.CoachProfile) {
        plainUser.CoachProfile.specialties = safeParse(plainUser.CoachProfile.specialties);
        plainUser.CoachProfile.education = safeParse(plainUser.CoachProfile.education);
        plainUser.CoachProfile.certifications = safeParse(plainUser.CoachProfile.certifications);
        // REMOVED: plainUser.CoachProfile.sessionTypes parsing logic
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
const updateCoachProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

        // FIX: Explicitly include CoachProfile using the alias 'CoachProfile'
        const user = await User.findByPk(userId, { include: { model: CoachProfile, as: 'CoachProfile' } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const {
            firstName, lastName, email, phone,
            professionalTitle, bio, // websiteUrl and profilePicture REMOVED
            yearsOfExperience, 
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            // REMOVED: sessionTypes from destructured body
            pricing, availability
        } = req.body; // profilePicture and websiteUrl are no longer expected or processed here

        // Update user fields
        await user.update({ firstName, lastName, email, phone });

        // Update or create coach profile
        let coachProfile = user.CoachProfile;
        if (!coachProfile) coachProfile = await CoachProfile.create({ userId });

        await coachProfile.update({
            professionalTitle,
            bio, // websiteUrl and profilePicture REMOVED from the update payload
            yearsOfExperience: parseInt(yearsOfExperience) || 0,
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            // REMOVED: sessionTypes update logic
            pricing: pricing || '{}',
            availability: availability || '{}'
        });

        // Fetch the updated user object with all includes for the return value
        const updatedUser = await User.findByPk(userId, {
            include: [
                { 
                    model: CoachProfile, 
                    as: 'CoachProfile',
                    include: [{ model: Session, as: 'sessions' }] // UPDATED: Use 'sessions' alias
                },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
        });

        const plainUpdatedUser = updatedUser.get({ plain: true });
        
        // ENSURE PARSING ON RETURN AS WELL
        if (plainUpdatedUser.CoachProfile) {
            plainUpdatedUser.CoachProfile.specialties = safeParse(plainUpdatedUser.CoachProfile.specialties);
            plainUpdatedUser.CoachProfile.education = safeParse(plainUpdatedUser.CoachProfile.education);
            plainUpdatedUser.CoachProfile.certifications = safeParse(plainUpdatedUser.CoachProfile.certifications);
            // REMOVED: plainUpdatedUser.CoachProfile.sessionTypes parsing logic
            plainUpdatedUser.CoachProfile.pricing = safeParse(plainUpdatedUser.CoachProfile.pricing);
            plainUpdatedUser.CoachProfile.availability = safeParse(plainUpdatedUser.CoachProfile.availability);
        }


        res.json({ user: plainUpdatedUser });
    } catch (error) {
        console.error('Error updating coach profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// ==============================
// ADD Item (certification/education/specialties)
// ... (unchanged)
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

    // *** CRITICAL FIX: Ensure currentItems is an array before pushing ***
    const dataFromDb = safeParse(coachProfile[type]);
    const currentItems = Array.isArray(dataFromDb) ? dataFromDb : [];
    
    currentItems.push(type === 'specialties' ? item : { ...item, id: uuidv4() }); // Specialties may be strings, others objects

    // Data is stored as a JSON string in the database
    await coachProfile.update({ [type]: JSON.stringify(currentItems) });
    
    // FIX: Force read the updated profile to ensure data freshness for the return value
    const updatedProfile = await CoachProfile.findOne({ where: { userId } });
    const currentItemsParsed = safeParse(updatedProfile[type]);

    // Return the specific type field array, now guaranteed to be refreshed from DB
    res.json({ [type]: currentItemsParsed });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

// ==============================
// REMOVE Item (certification/education/specialties)
// ... (unchanged)
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

    // *** CRITICAL FIX: Ensure currentItems is an array before filtering ***
    const dataFromDb = safeParse(coachProfile[type]);
    const listToFilter = Array.isArray(dataFromDb) ? dataFromDb : [];
    
    // Filtering logic: filter by string value for specialties, filter by object id for Certs/Edu
    const currentItems = listToFilter.filter(item => 
        type === 'specialties' ? item !== id : item.id !== id
    );

    // Data is stored as a JSON string in the database
    await coachProfile.update({ [type]: JSON.stringify(currentItems) });
    
    // FIX: Force read the updated profile to ensure data freshness for the return value
    const updatedProfile = await CoachProfile.findOne({ where: { userId } });
    const currentItemsParsed = safeParse(updatedProfile[type]);

    // Return the specific type field array, now guaranteed to be refreshed from DB
    res.json({ [type]: currentItemsParsed });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// ==============================
// UPLOAD Profile Picture
// ... (unchanged)
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
            fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
        } catch (cleanupErr) {
            // Log cleanup error if necessary
        }
        res.status(500).json({ message: 'Failed to upload image due to server error.' });
    }
};

// ==============================
// GET Public Coach Profile (by ID)
// ==============================
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
          as: 'user', 
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePicture'], 
          include: [
            {
              model: Event,
              as: 'events', 
              required: false,
              where: { status: 'published' },
              attributes: ['id', 'title', 'description', 'type', 'date', 'time', 'duration', 'price'],
            },
          ],
        },
        { // Testimonials received by this coach
          model: Testimonial,
          as: 'testimonials',
          required: false,
          attributes: ['id', 'clientId', 'clientTitle', 'rating', 'content', 'date', 'sessionType'], 
          include: [{ // Include client (User) details for avatar/name
            model: User,
            as: 'clientUser', // ALIAS from server.js
            attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
          }]
        },
        { // Include the coach's available services
          model: Session,
          as: 'sessions', // UPDATED: Use 'sessions' alias
          required: false,
        }
      ],
    });

    if (!coachProfile || !coachProfile.user) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    // CRITICAL: Parse JSON strings before sending to the frontend
    const plainCoachProfile = coachProfile.get({ plain: true });
    
    if (plainCoachProfile.specialties) plainCoachProfile.specialties = safeParse(plainCoachProfile.specialties);
    if (plainCoachProfile.education) plainCoachProfile.education = safeParse(plainCoachProfile.education);
    if (plainCoachProfile.certifications) plainCoachProfile.certifications = safeParse(plainCoachProfile.certifications);
    if (plainCoachProfile.pricing) plainCoachProfile.pricing = safeParse(plainCoachProfile.pricing); 
    if (plainCoachProfile.availability) plainCoachProfile.availability = safeParse(plainCoachProfile.availability);


    const user = plainCoachProfile.user;

    // Format testimonials to include the client's name/avatar from the User model
    const formattedTestimonials = (plainCoachProfile.testimonials || []).map(t => ({
        id: t.id,
        clientId: t.clientId,
        clientName: t.clientUser ? `${t.clientUser.firstName} ${t.clientUser.lastName}` : 'Anonymous Client',
        clientAvatar: t.clientUser?.profilePicture || '/default-avatar.png', 
        clientTitle: t.clientTitle,
        rating: t.rating,
        content: t.content,
        date: t.date,
        sessionType: t.sessionType,
    }));


    // Step 2: Construct final object
    const profile = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: plainCoachProfile.profilePicture || user.profilePicture, 
      events: user.events || [], 
      testimonials: formattedTestimonials,
      availableSessions: plainCoachProfile.sessions || [], // UPDATED: Use plainCoachProfile.sessions
      title: plainCoachProfile.professionalTitle,
      rating: 4.9, 
      totalReviews: formattedTestimonials.length,
      totalClients: 0,
      yearsExperience: plainCoachProfile.yearsOfExperience || 0,
      shortBio: plainCoachProfile.bio ? plainCoachProfile.bio.substring(0, 150) + '...' : '',
      fullBio: plainCoachProfile.bio || '',
      isAvailable: true,
      avgResponseTime: plainCoachProfile.responseTime || 'within-4h',
      timezone: plainCoachProfile.availability?.timezone || 'UTC',
      // Get starting price from pricing JSON or look at the cheapest session
      startingPrice: plainCoachProfile.pricing?.individual || plainCoachProfile.sessions?.[0]?.price || 0,
      
      // PARSED LIST FIELDS
      specialties: plainCoachProfile.specialties || [],
      education: plainCoachProfile.education || [],
      certifications: plainCoachProfile.certifications || [],

      // ADDED: Social Links and Demographics
      linkedinUrl: plainCoachProfile.linkedinUrl,
      twitterUrl: plainCoachProfile.twitterUrl,
      instagramUrl: plainCoachProfile.instagramUrl,
      facebookUrl: plainCoachProfile.facebookUrl,
      dateOfBirth: plainCoachProfile.dateOfBirth,
      gender: plainCoachProfile.gender,
      ethnicity: plainCoachProfile.ethnicity,
      country: plainCoachProfile.country,
    };

    res.status(200).json({ coach: profile });
  } catch (error) {
    console.error('Error fetching public coach profile:', error);
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
};

// ==============================
// GET All Coach Profiles (for client discovery)
// ===================================
const getAllCoachProfiles = async (req, res) => {
  try {
    const { search, audience } = req.query;
    const whereClause = {
      roles: { [Op.like]: '%"coach"%' }, // Ensure only users with 'coach' role are selected
      [Op.or]: []
    };

    if (search) {
        whereClause[Op.or].push(
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        );
    }
    
    if (whereClause[Op.or].length === 0) delete whereClause[Op.or];

    const coaches = await User.findAll({
        where: whereClause,
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'],
        include: [
            { 
                model: CoachProfile, 
                as: 'CoachProfile',
                // Filter by audience specialty
                where: audience ? { specialties: { [Op.like]: `%${audience}%` } } : {},
                required: true,
                include: [
                    { // For rating calculation
                        model: Testimonial,
                        as: 'testimonials',
                        attributes: ['rating'], 
                        required: false,
                    },
                    { // For price calculation
                        model: Session,
                        as: 'sessions', // UPDATED: Use 'sessions' alias
                        attributes: ['price'], 
                        required: false,
                    }
                ]
            },
        ],
        // Grouping is necessary for aggregation (like counting testimonials)
        group: ['User.id', 'CoachProfile.id', 'CoachProfile.testimonials.id', 'CoachProfile.sessions.id']
    });

    const processedCoaches = coaches.map(coach => {
        const plainCoach = coach.get({ plain: true });
        const profile = plainCoach.CoachProfile;
        
        if (profile) {
            profile.specialties = safeParse(profile.specialties);
            profile.pricing = safeParse(profile.pricing);
        }

        const ratings = profile?.testimonials?.map(t => t.rating) || [];
        const prices = profile?.sessions?.map(s => s.price) || [];
        
        const averageRating = ratings.length > 0 
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : '0.0';
        
        // Calculate minimum price from available sessions, falling back to pricing JSON
        const startingPrice = prices.length > 0
            ? Math.min(...prices)
            : profile?.pricing?.individual || 0; 

        
        return {
            id: plainCoach.id,
            name: `${plainCoach.firstName} ${plainCoach.lastName}`,
            title: profile?.professionalTitle,
            profileImage: plainCoach.profilePicture,
            shortBio: profile?.bio ? profile.bio.substring(0, 150) + '...' : '',
            specialties: profile?.specialties || [],
            startingPrice: startingPrice,
            rating: parseFloat(averageRating),
            totalReviews: ratings.length,
        };
    });

    res.status(200).json({ coaches: processedCoaches });
  } catch (error) {
    console.error('Error fetching all coach profiles:', error);
    res.status(500).json({ error: 'Failed to fetch coach profiles' });
  }
};

module.exports = {
  getCoachProfile,
  updateCoachProfile,
  addItem,
  removeItem,
  uploadProfilePicture, 
  getPublicCoachProfile, 
  getAllCoachProfiles,
};