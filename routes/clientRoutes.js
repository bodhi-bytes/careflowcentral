const express = require('express');
const {
    createClientProfile,
    getAllClientProfiles,
    getClientProfileById,
    updateClientProfile,
    deleteClientProfile,
    getClientStats
} = require('../controllers/clientController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// Statistics route (admin only)
router.get('/stats', protect, authorize('admin'), getClientStats);

// Main CRUD routes
router.route('/')
    .post(protect, authorize('caregiver', 'admin'), createClientProfile) // Only caregivers/admins can create
    .get(protect, authorize('caregiver', 'admin'), getAllClientProfiles); // Only caregivers/admins can view all

router.route('/:id')
    .get(protect, authorize('caregiver', 'admin', 'client'), getClientProfileById) // Caregivers, admins, AND the client themselves
    .put(protect, authorize('caregiver', 'admin', 'client'), updateClientProfile) // Admin, caregiver, or the client themselves
    .delete(protect, authorize('admin'), deleteClientProfile); // Only admin can delete

module.exports = router;
