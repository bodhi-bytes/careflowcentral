const express = require('express');
const router = express.Router();
const {
  createCaregiverProfile,
  getAllCaregiverProfiles,
  getCaregiverProfileById,
  updateCaregiverProfile,
  deleteCaregiverProfile,
} = require('../controllers/caregiverController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

router.route('/')
    .post(protect, authorize('admin'), createCaregiverProfile) // Only admin can create
    .get(protect, authorize('admin', 'caregiver', 'client'), getAllCaregiverProfiles); // All authenticated can view all

router.route('/:id')
    .get(protect, authorize('admin', 'caregiver', 'client'), getCaregiverProfileById) // All authenticated can view by ID
    .put(protect, authorize('admin', 'caregiver'), updateCaregiverProfile) // Admin and caregiver themselves
    .delete(protect, authorize('admin'), deleteCaregiverProfile); // Only admin can delete

module.exports = router;
