require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('CoachFlow auth API'));

const PORT = process.env.PORT || 4028;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // For dev only: sync models (do NOT use in production migrations)
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
  }
})();
