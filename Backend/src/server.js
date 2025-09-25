require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { UnauthorizedError } = require('express-jwt');
const sequelize = require('./config/db.js');
const authRoutes = require('./routes/auth');

// Import all models to ensure they are registered with Sequelize
const User = require('./models/user');
const CoachProfile = require('./models/CoachProfile');
const ClientProfile = require('./models/ClientProfile');

const app = express();

// ==========================================
// Middlewares
// ==========================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ==========================================
// Routes
// ==========================================
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('CoachFlow API running 🚀'));

// ==========================================
// JWT Unauthorized Error Handling
// ==========================================
app.use((err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT Unauthorized Error:', err);
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  console.error('Unexpected Error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 4028;

(async () => {
  try {
    // Define associations between models
    User.hasOne(CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
    CoachProfile.belongsTo(User, { foreignKey: 'userId' });
    User.hasOne(ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
    ClientProfile.belongsTo(User, { foreignKey: 'userId' });

    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true }); // Auto-sync models (dev only)
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();