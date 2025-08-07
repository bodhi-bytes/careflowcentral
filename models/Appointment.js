const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    caregiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CaregiverProfile',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String, // Or specific time type if needed
        required: true,
    },
    endTime: {
        type: String, // Or specific time type if needed
        required: true,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending'],
        default: 'Scheduled',
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
