const Appointment = require('../models/Appointment');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (e.g., authenticated users, caregivers can schedule for patients)
exports.createAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create(req.body);
        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all appointments (or filtered by patient/caregiver)
// @route   GET /api/appointments
// @access  Private (e.g., authenticated users)
exports.getAllAppointments = async (req, res) => {
    try {
        // Basic filtering example: /api/appointments?patientId=...&caregiverId=...
        const query = {};
        if (req.query.patientId) {
            query.patient = req.query.patientId;
        }
        if (req.query.caregiverId) {
            query.caregiver = req.query.caregiverId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'personalInfo.firstName personalInfo.lastName') // Populate patient name
            .populate('caregiver', 'name email'); // Populate caregiver name/email

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (e.g., authenticated users involved in the appointment)
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'personalInfo.firstName personalInfo.lastName')
            .populate('caregiver', 'name email');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update an appointment by ID
// @route   PUT /api/appointments/:id
// @access  Private (e.g., authenticated users, caregivers/admins)
exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete an appointment by ID
// @route   DELETE /api/appointments/:id
// @access  Private (e.g., authenticated admins)
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
