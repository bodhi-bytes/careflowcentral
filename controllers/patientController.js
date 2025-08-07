const Patient = require('../models/Patient');

// @desc    Create a new patient profile
// @route   POST /api/patients
// @access  Private (e.g., only authenticated caregivers/admins)
exports.createPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);
        res.status(201).json({ success: true, data: patient });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all patient profiles
// @route   GET /api/patients
// @access  Private (e.g., only authenticated caregivers/admins)
exports.getAllPatientProfiles = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single patient profile by ID
// @route   GET /api/patients/:id
// @access  Private (e.g., only authenticated caregivers/admins, or the patient themselves)
exports.getPatientProfileById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a patient profile by ID
// @route   PUT /api/patients/:id
// @access  Private (e.g., only authenticated caregivers/admins, or the patient themselves)
exports.updatePatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validators on update
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a patient profile by ID
// @route   DELETE /api/patients/:id
// @access  Private (e.g., only authenticated caregivers/admins)
exports.deletePatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        res.status(200).json({ success: true, message: 'Patient profile deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
