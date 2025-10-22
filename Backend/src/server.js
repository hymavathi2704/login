// Backend/src/server.js

// 🚀 Load environment variables first
require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { UnauthorizedError } = require('express-jwt');
const sequelize = require('./config/db.js');

// ==========================================
// Model Imports
// ... (Model Imports are omitted for brevity, they remain unchanged)
// ==========================================
const User = require('./models/user');
const CoachProfile = require('./models/CoachProfile');
const ClientProfile = require('./models/ClientProfile');
const Booking = require('./models/Booking');
const Session = require('./models/Session');
const Testimonial = require('./models/Testimonial');
const Follow = require('./models/Follow'); 

// ==========================================
// Route Imports
// ==========================================
const authRoutes = require('./routes/auth');
const coachProfileRoutes = require('./routes/coachProfile');
const profileRoutes = require('./routes/fetchCoachProfiles');
const clientProfileRoutes = require('./routes/clientProfile'); 
const bookingRoutes = require('./routes/bookings');
const { authenticate } = require('./middleware/authMiddleware');

const app = express();


// ==========================================
// Middlewares
// ==========================================

// 🔑 FIX 1: Ensure FRONTEND_URL is used for CORS
const corsOptions = {
    // This allows the production URL to connect to the backend API.
    // It is critical that your production environment sets the FRONTEND_URL environment variable.
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
// 🔑 CRITICAL FIX: Custom Middleware for Static Files (MIME Type Fix for JPG)
// ==========================================
// ==========================================
// 🔑 CRITICAL FIX: Standard Express.static with setHeaders for JPG MIME type
// This replaces the complex and unreliable custom middleware from the previous attempt.
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    // Use the built-in setHeaders option to explicitly force the MIME type for JPG/JPEG
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
            // Allow fetching public coach list (for non-logged in users)
            /\/api\/profiles\/coaches(\/.*)?/, 
            // 💡 FIX: Allow fetching a single public coach profile by ID without authentication
            /\/api\/profiles\/coach\/[a-zA-Z0-9-]{36}/,
            // Allow fetching public coach profiles/sessions with internal routes (existing config)
            /\/api\/coach\/public(\/.*)?/ 
        ],
    })
);


// ==========================================
// Model Associations (omitted)
// ==========================================
// User <-> ClientProfile
User.hasOne(ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'ClientProfile' });
ClientProfile.belongsTo(User, { foreignKey: 'userId', as: 'ClientProfile' });

// User <-> CoachProfile
User.hasOne(CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'CoachProfile' });
CoachProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' }); 

// CoachProfile <-> Session (Services offered)
CoachProfile.hasMany(Session, { foreignKey: 'coachProfileId', onDelete: 'CASCADE', as: 'sessions' });
Session.belongsTo(CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

// Session <-> Booking (CRITICAL NEW ASSOCIATION)
Session.hasMany(Booking, { foreignKey: 'sessionId', onDelete: 'CASCADE', as: 'bookings' });
Booking.belongsTo(Session, { foreignKey: 'sessionId', as: 'Session' }); 

// CoachProfile <-> Testimonial (Testimonials RECEIVED)
CoachProfile.hasMany(Testimonial, { foreignKey: 'coachProfileId', onDelete: 'CASCADE', as: 'testimonials' });
Testimonial.belongsTo(CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

// NEW ASSOCIATION: User <-> Testimonial (Testimonials WRITTEN by client)
User.hasMany(Testimonial, { foreignKey: 'clientId', onDelete: 'SET NULL', as: 'writtenTestimonials' }); 
Testimonial.belongsTo(User, { foreignKey: 'clientId', as: 'clientUser' });

// User <-> Booking (Client's bookings)
User.hasMany(Booking, { foreignKey: 'clientId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// NEW ASSOCIATIONS: User <-> Follow (Client follows Coach)
User.hasMany(Follow, { foreignKey: 'followerId', onDelete: 'CASCADE', as: 'followingRecords' });
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'followerUser' });

User.hasMany(Follow, { foreignKey: 'followingId', onDelete: 'CASCADE', as: 'followedByRecords' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'followingCoach' });

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/coach', coachProfileRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/client', clientProfileRoutes); 
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => res.send('CoachFlow API running 🚀'));

// ==========================================
// Error Handling (FIXED for universal JSON response)
// ==========================================
app.use((err, req, res, next) => {
    // If headers have already been sent, pass to default Express handler
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.status || 500;
    let errorMessage = 'Internal server error';

    if (err instanceof UnauthorizedError) {
        // 401 for JWT errors
        statusCode = 401;
        errorMessage = 'Unauthorized: Invalid or missing token';
        console.error('JWT Unauthorized Error:', err.message);
    } else {
        // For all other errors, use the error status if available, else 500
        console.error('Unexpected Error:', err);
        errorMessage = err.message || 'An unexpected server error occurred.';
    }
    
    // Send a structured JSON response regardless of the error type
    return res.status(statusCode).json({ error: errorMessage });
});

// ==========================================
// Start Server and Sync Database
// ... (remains unchanged)
// ==========================================
const PORT = process.env.PORT || 4028;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // 🚨 CRITICAL ACTION: Dropping old tables to fix the foreign key conflict.
        // REMOVE { force: true } AFTER THE FIRST SUCCESSFUL RUN!
        await sequelize.sync(); 
        console.log('✅ Database synchronized (FORCED)');

        app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running at ${APP_URL}`));

    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
})();
