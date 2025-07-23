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

// Add caregiver routes
app.use('/api/caregivers', require('./routes/caregiverRoutes'));

app.use('/', (_req, res) => res.status(200).send('API v1.0 is running...'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
