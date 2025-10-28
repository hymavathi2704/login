// Backend/src/server.js

// 🚀 Load environment variables first
require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { UnauthorizedError } = require('express-jwt');

// 🔑 This path is correct: It points from 'Backend/src/' up to 'Backend/' and into 'models/'
const db = require('../models'); 

// ==========================================
// Route Imports
// ==========================================
const authRoutes = require('./routes/auth');
const coachProfileRoutes = require('./routes/coachProfile');
const profileRoutes = require('./routes/fetchCoachProfiles');
const clientProfileRoutes = require('./routes/clientProfile'); 
const bookingRoutes = require('./routes/bookings');
const { authenticate } = require('./middleware/authMiddleware');
const testimonialRoutes = require('./routes/testimonial'); // <-- ADD THIS LINE
const app = express();


// ==========================================
// Middlewares
// ==========================================
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

app.use(express.json({ limit: '5mb' }));

// ==========================================
// Static File Uploads
// This path is correct: It serves the 'uploads' folder from the 'Backend' directory
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    setHeaders: (res, path) => {
        const ext = path.split('.').pop().toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') {
            res.set('Content-Type', 'image/jpeg');
        }
    }
}));
// =

app.use(cookieParser());


// ==========================================
// JWT Authentication Middleware Application
// ==========================================
app.use(
    '/api', 
    authenticate.unless({
        path: [
            '/api/auth/register',
            '/api/auth/login',
            '/api/auth/verify-email',
            '/api/auth/send-verification',
            '/api/auth/forgot-password',
            '/api/auth/reset-password',
            '/api/auth/social-login',
            /\/api\/profiles\/coaches(\/.*)?/, 
            /\/api\/profiles\/coach\/[a-zA-Z0-9-]{36}/,
            /\/api\/coach\/public(\/.*)?/ 
        ],
    })
);

// ==========================================
// Model Associations
// Define associations here ONLY IF they are NOT defined in the model's static associate method.
// Associations defined in model files (like Testimonial.js) are called by models/index.js
// ==========================================
// User <-> ClientProfile
db.User.hasOne(db.ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'ClientProfile' });
db.ClientProfile.belongsTo(db.User, { foreignKey: 'userId', as: 'user' }); // Consistent alias 'user'

// User <-> CoachProfile
db.User.hasOne(db.CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'CoachProfile' });
db.CoachProfile.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// CoachProfile <-> Session (Services offered)
db.CoachProfile.hasMany(db.Session, { foreignKey: 'coachProfileId', onDelete: 'CASCADE', as: 'sessions' });
db.Session.belongsTo(db.CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

// Session <-> Booking
db.Session.hasMany(db.Booking, { foreignKey: 'sessionId', onDelete: 'CASCADE', as: 'bookings' });
db.Booking.belongsTo(db.Session, { foreignKey: 'sessionId', as: 'Session' });

// CoachProfile <-> Testimonial (Testimonials RECEIVED by Coach)
db.CoachProfile.hasMany(db.Testimonial, { foreignKey: 'coachProfileId', onDelete: 'CASCADE', as: 'testimonials' });
// 🛑 COMMENTED OUT: Defined in Testimonial.js associate method
// db.Testimonial.belongsTo(db.CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

// User (Client) <-> Testimonial (Testimonials WRITTEN by Client)
db.User.hasMany(db.Testimonial, { foreignKey: 'clientId', onDelete: 'SET NULL', as: 'writtenTestimonials' }); // SET NULL if user is deleted?
// 🛑 COMMENTED OUT: Defined in Testimonial.js associate method
// db.Testimonial.belongsTo(db.User, { foreignKey: 'clientId', as: 'client' }); // Alias 'client' used in model

// User (Client) <-> Booking (Client's bookings)
db.User.hasMany(db.Booking, { foreignKey: 'clientId', as: 'clientBookings' }); // Clearer alias
db.Booking.belongsTo(db.User, { foreignKey: 'clientId', as: 'client' });

// Booking <-> Testimonial (One-to-One)
db.Booking.hasOne(db.Testimonial, { foreignKey: 'bookingId', as: 'testimonial'}); // Booking has one Testimonial
// 🛑 COMMENTED OUT: Defined in Testimonial.js associate method
// db.Testimonial.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking'}); // Testimonial belongs to one Booking

// User <-> Follow (Following relationship)
db.User.hasMany(db.Follow, { foreignKey: 'followerId', onDelete: 'CASCADE', as: 'followingRecords' }); // Who the user follows
db.Follow.belongsTo(db.User, { foreignKey: 'followerId', as: 'followerUser' }); // The user doing the following

db.User.hasMany(db.Follow, { foreignKey: 'followingId', onDelete: 'CASCADE', as: 'followedByRecords' }); // Who follows the user
db.Follow.belongsTo(db.User, { foreignKey: 'followingId', as: 'followedUser' }); // The user being followed

// Note: The actual execution of associate methods defined in models happens via models/index.js
// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/coach', coachProfileRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/client', clientProfileRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes); // <-- ADD THIS LINE
app.get('/', (req, res) => res.send('CoachFlow API running 🚀'));

// ==========================================
// Error Handling
// ==========================================
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.status || 500;
    let errorMessage = 'Internal server error';

    if (err instanceof UnauthorizedError) {
        statusCode = 401;
        errorMessage = 'Unauthorized: Invalid or missing token';
        console.error('JWT Unauthorized Error:', err.message);
    } else {
        console.error('Unexpected Error:', err);
        errorMessage = err.message || 'An unexpected server error occurred.';
    }
    
    return res.status(statusCode).json({ error: errorMessage });
});

// ==========================================
// Start Server and Sync Database
// ==========================================
const PORT = process.env.PORT || 4028;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

(async () => {
    try {
        // Use the connection from the db object
        await db.sequelize.authenticate();
        console.log('✅ Database connected');

        // Use the connection from the db object
        await db.sequelize.sync(); 
        console.log('✅ Database synchronized ');

        app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running at ${APP_URL}`));

    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
})();