const CarePlan = require('../models/CarePlan');

// @desc    Create a new care plan
// @route   POST /api/careplans
// @access  Private (e.g., authenticated caregivers/admins)
exports.createCarePlan = async (req, res) => {
    try {
        const carePlan = await CarePlan.create(req.body);
        res.status(201).json({ success: true, data: carePlan });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all care plans (or filtered by patient/caregiver)
// @route   GET /api/careplans
// @access  Private (e.g., authenticated caregivers/admins)
exports.getAllCarePlans = async (req, res) => {
    try {
        const query = {};
        if (req.query.patientId) {
            query.patient = req.query.patientId;
        }
        if (req.query.caregiverId) {
            query.assignedCaregiver = req.query.caregiverId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const carePlans = await CarePlan.find(query)
            .populate('patient', 'personalInfo.firstName personalInfo.lastName')
            .populate('assignedCaregiver', 'name email');

        res.status(200).json({ success: true, count: carePlans.length, data: carePlans });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single care plan by ID
// @route   GET /api/careplans/:id
// @access  Private (e.g., authenticated users involved in the care plan)
exports.getCarePlanById = async (req, res) => {
    try {
        const carePlan = await CarePlan.findById(req.params.id)
            .populate('patient', 'personalInfo.firstName personalInfo.lastName')
            .populate('assignedCaregiver', 'name email');

        if (!carePlan) {
            return res.status(404).json({ success: false, message: 'Care plan not found' });
        }
        res.status(200).json({ success: true, data: carePlan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a care plan by ID
// @route   PUT /api/careplans/:id
// @access  Private (e.g., authenticated caregivers/admins)
exports.updateCarePlan = async (req, res) => {
    try {
        const carePlan = await CarePlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!carePlan) {
            return res.status(404).json({ success: false, message: 'Care plan not found' });
        }
        res.status(200).json({ success: true, data: carePlan });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a care plan by ID
// @route   DELETE /api/careplans/:id
// @access  Private (e.g., authenticated admins)
exports.deleteCarePlan = async (req, res) => {
    try {
        const carePlan = await CarePlan.findByIdAndDelete(req.params.id);

        if (!carePlan) {
            return res.status(404).json({ success: false, message: 'Care plan not found' });
        }
        res.status(200).json({ success: true, message: 'Care plan deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
