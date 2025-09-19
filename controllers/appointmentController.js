const Appointment = require('../models/Appointment');
const StaffProfile = require('../models/StaffProfile');

const { format } = require('date-fns');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (e.g., authenticated users, caregivers can schedule for patients)
exports.createAppointment = async (req, res) => {
    const { caregiver, patient, date, shift, startTime, endTime } = req.body;

    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid or missing date provided.' });
    }
    const requestDate = new Date(date);

    try {
        // Prevent double entry by checking for an identical appointment
        const existingAppointment = await Appointment.findOne({
            caregiver,
            patient,
            date: requestDate,
            startTime,
            endTime,
        });

        if (existingAppointment) {
            return res.status(409).json({ success: false, message: 'This exact appointment has already been booked.' });
        }

        // Step 1: Validate caregiver's general availability
        const staffProfile = await StaffProfile.findById(caregiver);

        if (!staffProfile) {
            return res.status(400).json({ success: false, message: 'Caregiver profile not found.' });
        }

        const dayOfWeek = format(requestDate, 'EEEE');

        const hasShiftPreference = staffProfile.professionalDetails.workAvailability.shiftPreference
            .map(s => s.toLowerCase())
            .includes(shift.toLowerCase());
        const hasDayAvailability = staffProfile.professionalDetails.workAvailability.daysAvailable
            .map(d => d.toLowerCase())
            .includes(dayOfWeek.toLowerCase());

        // if (!hasShiftPreference || !hasDayAvailability) {
        //     return res.status(400).json({ success: false, message: 'Caregiver is not available for this day or shift.' });
        // }

        // Step 2: Check for conflicting appointments for both caregiver and patient
        const conflictingAppointment = await Appointment.findOne({
            date: requestDate,
            status: { $in: ['Scheduled', 'Pending'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            $or: [{ caregiver }, { patient }],
        });

        if (conflictingAppointment) {
            // Identify which party has the conflict
            const conflictingParty = conflictingAppointment.caregiver.toString() === caregiver ? 'Caregiver' : 'Patient';
            return res.status(400).json({ success: false, message: `${conflictingParty} has a conflicting appointment at this time.` });
        }

        // Step 3: Create the appointment
        const appointment = await Appointment.create({ ...req.body, date: requestDate });
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
            .populate('caregiver', 'personalInformation.fullName personalInformation.contactDetails.emailAddress'); // Populate caregiver name/email

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
            .populate('caregiver', 'personalInformation.fullName personalInformation.contactDetails.emailAddress');

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
