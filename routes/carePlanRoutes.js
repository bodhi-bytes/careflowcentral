const express = require('express');
const {
    createCarePlan,
    getAllCarePlans,
    getCarePlanById,
    updateCarePlan,
    deleteCarePlan,
} = require('../controllers/carePlanController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

router.route('/')
    .post(protect, authorize('caregiver', 'admin'), createCarePlan) // Only caregivers/admins can create
    .get(protect, authorize('caregiver', 'admin', 'client'), getAllCarePlans); // Caregivers, admins, or clients can view

router.route('/:id')
    .get(protect, authorize('caregiver', 'admin', 'client'), getCarePlanById) // Caregivers, admins, or clients involved
    .put(protect, authorize('caregiver', 'admin'), updateCarePlan) // Only caregivers/admins can update
    .delete(protect, authorize('admin'), deleteCarePlan); // Only admins can delete

module.exports = router;
