const express = require('express');
const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

router.route('/')
    .post(protect, authorize('caregiver', 'admin', 'client'), createAppointment) // Caregivers, admins, or clients can create
    .get(protect, authorize('caregiver', 'admin', 'client'), getAllAppointments); // Caregivers, admins, or clients can view

router.route('/:id')
    .get(protect, authorize('caregiver', 'admin', 'client'), getAppointmentById) // Caregivers, admins, or clients involved in appointment
    .put(protect, authorize('caregiver', 'admin', 'client'), updateAppointment) // Caregivers, admins, or clients involved in appointment
    .delete(protect, authorize('admin'), deleteAppointment); // Only admins can delete

module.exports = router;
