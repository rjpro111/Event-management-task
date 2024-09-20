// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routs/authRoutes'));
app.use('/api/events', require('./routs/eventRoutes'));
app.use('/api/rsvps', require('./routs/rsvpRoutes'));

// Error Handler
const { errorHandler } = require('./middlewares/errorHandler');
app.use(errorHandler);

// Import and initialize the cron job
require('./utils/cronJob');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
