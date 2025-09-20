
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const caregiverController = require('../controllers/caregiverController');

// GET all caregivers
router.get('/', protect, authorize('admin'), caregiverController.getAllCaregivers);

// GET the current caregiver's profile
router.get('/me', protect, authorize('caregiver'), caregiverController.getMe);

// GET available caregivers by shift
router.get('/available', caregiverController.getAvailableCaregivers);

module.exports = router;
