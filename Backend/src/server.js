require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { UnauthorizedError } = require('express-jwt');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

// ==========================================
// Define uploads folder once
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ uploads folder created');
}

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
// Serve static files (profile photos, etc.)
// ==========================================
app.use('/uploads', express.static(uploadDir)); // ✅ Only once

// ==========================================
// Routes
// ==========================================
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('CoachFlow auth API running 🚀'));

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
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true }); // Auto-sync models (dev only)
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
