require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const { serverConfiguration } = require('./config');

const { port } = serverConfiguration;

// Connect to MongoDB
connectDB();

const app = express();
// Set up a middleware to parse JSON data in the request body
app.use(bodyParser.json());
app.use(cors());

// Define routes for the 'users' collection (consider deprecating/refactoring this old route)
const userRoutes = require('./user.routes');
app.use('/users', userRoutes);

// Add authentication routes
app.use('/api/auth', require('./routes/authRoutes'));

// Add staff onboarding routes
app.use('/api/staff-onboarding', require('./routes/staffOnboardingRoutes'));

// Add caregiver routes
app.use('/api/staff', require('./routes/staffRoutes'));

// Add client routes
app.use('/api/clients', require('./routes/clientRoutes'));

// Add appointment routes
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Add care plan routes
app.use('/api/careplans', require('./routes/carePlanRoutes'));

// Add caregiver routes
app.use('/api/caregivers', require('./routes/caregiverRoutes'));

// Root route for health check
app.get('/', (_req, res) => res.status(200).json({ message: 'API v1.0 is running...' }));

// Catch-all for 404 Not Found - this should be the last middleware
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: `API Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});