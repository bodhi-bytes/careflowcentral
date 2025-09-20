
require('dotenv').config();
const mongoose = require('mongoose');
const { getAvailableCaregivers } = require('./controllers/caregiverController');

// Mock request and response objects
const req = {
  query: {
    date: '2025-09-22', // Changed to a Monday
    shift: 'morning'     // Example shift, change as needed
  }
};

const res = {
  status: (code) => {
    console.log('Response status:', code);
    return {
      json: (data) => {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
      }
    };
  },
  json: (data) => {
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  }
};

// Connect to the database and run the test
const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    await getAvailableCaregivers(req, res);
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

runTest();
