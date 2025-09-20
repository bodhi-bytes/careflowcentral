const Appointment = require('../models/Appointment');
const StaffProfile = require('../models/StaffProfile');
const Caregiver = require('../models/Caregiver');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const webpush = require('web-push');

const { format } = require('date-fns');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (e.g., authenticated users, caregivers can schedule for patients)
exports.createAppointment = async (req, res) => {
    console.log('Creating appointment...');
    const { caregiver, patient, date, shift, startTime, endTime } = req.body;

    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
        console.log('Invalid or missing date provided.');
        return res.status(400).json({ success: false, message: 'Invalid or missing date provided.' });
    }
    const requestDate = new Date(date);

    try {
        console.log('Checking for existing appointment...');
        // Prevent double entry by checking for an identical appointment
        const existingAppointment = await Appointment.findOne({
            caregiver,
            patient,
            date: requestDate,
            startTime,
            endTime,
        });

        if (existingAppointment) {
            console.log('This exact appointment has already been booked.');
            return res.status(409).json({ success: false, message: 'This exact appointment has already been booked.' });
        }

        console.log('Validating caregiver availability...');
        // Step 1: Validate caregiver's general availability
        const staffProfile = await StaffProfile.findById(caregiver);

        if (!staffProfile) {
            console.log('Caregiver profile not found.');
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
        //     console.log('Caregiver is not available for this day or shift.');
        //     return res.status(400).json({ success: false, message: 'Caregiver is not available for this day or shift.' });
        // }

        console.log('Checking for conflicting appointments...');
        // Step 2: Check for conflicting appointments for both caregiver and patient
        const conflictingAppointment = await Appointment.findOne({
            date: requestDate,
            status: { $in: ['Scheduled', 'Pending'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            $or: [{ caregiver }, { patient }],
        });

        if (conflictingAppointment) {
            const conflictingParty = conflictingAppointment.caregiver.toString() === caregiver ? 'Caregiver' : 'Patient';
            console.log(`${conflictingParty} has a conflicting appointment at this time.`);
            return res.status(400).json({ success: false, message: `${conflictingParty} has a conflicting appointment at this time.` });
        }

        console.log('Creating appointment document...');
        // Step 3: Create the appointment
        const appointment = await Appointment.create({ ...req.body, date: requestDate });

        console.log('Sending notifications...');
        // Step 4: Send notifications
        const client = await Client.findById(patient);
        const caregiverInfo = await Caregiver.findById(caregiver);

        const notificationPayload = {
            title: "New Appointment Scheduled",
            message: `You have an appointment on ${format(requestDate, 'MMM dd, yyyy')} at ${startTime}`,
            appointmentId: appointment._id
        };

        // Create notifications for client and caregiver
        if (client) {
            console.log('Creating notification for client...');
            await Notification.create({
                user: client._id,
                appointment: appointment._id,
                message: `Your appointment with ${caregiverInfo && caregiverInfo.profile ? caregiverInfo.profile.fullName : 'a caregiver'} has been scheduled.`
            });
        }

        if (caregiverInfo) {
            console.log('Creating notification for caregiver...');
            await Notification.create({
                user: caregiverInfo._id,
                appointment: appointment._id,
                message: `You have a new appointment with ${client ? client.personalInfo.firstName + ' ' + client.personalInfo.lastName : 'a client'}.`
            });

            // Send push notifications
            if (caregiverInfo.subscription) {
                console.log('Sending push notification to caregiver...');
                webpush.sendNotification(caregiverInfo.subscription, JSON.stringify(notificationPayload))
                    .catch(err => console.error('Error sending notification to caregiver', err));
            }
        }

        console.log('Appointment created successfully.');
        console.log('Appointment object:', appointment);
        res.status(201).json({ success: true, data: appointment });

    } catch (error) {
        console.error('Error creating appointment:', error);
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
