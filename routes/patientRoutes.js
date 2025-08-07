const express = require('express');
const {
    createPatientProfile,
    getAllPatientProfiles,
    getPatientProfileById,
    updatePatientProfile,
    deletePatientProfile,
} = require('../controllers/patientController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

router.route('/')
    .post(protect, authorize('caregiver', 'admin'), createPatientProfile) // Only caregivers/admins can create
    .get(protect, authorize('caregiver', 'admin'), getAllPatientProfiles); // Only caregivers/admins can view all

router.route('/:id')
    .get(protect, authorize('caregiver', 'admin', 'client'), getPatientProfileById) // Caregivers, admins, AND the patient themselves
    .put(protect, authorize('caregiver', 'admin', 'client'), updatePatientProfile) // Admin, caregiver, or the patient themselves
    .delete(protect, authorize('admin'), deletePatientProfile); // Only admin can delete

module.exports = router;
