const express = require('express');
const router = express.Router();
const {
  createStaffProfile,
  getAllStaffProfiles,
  getStaffProfileById,
  updateStaffProfile,
  deleteStaffProfile,
} = require('../controllers/staffController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

router.route('/')
    .post(protect, authorize('admin'), createStaffProfile) // Only admin can create
    .get(protect, authorize('admin', 'staff', 'client'), getAllStaffProfiles); // All authenticated can view all

router.route('/:id')
    .get(protect, authorize('admin', 'staff', 'client'), getStaffProfileById) // All authenticated can view by ID
    .put(protect, authorize('admin', 'staff'), updateStaffProfile) // Admin and staff themselves
    .delete(protect, authorize('admin'), deleteStaffProfile); // Only admin can delete

module.exports = router;
