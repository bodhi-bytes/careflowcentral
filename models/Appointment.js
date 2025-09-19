const mongoose = require('mongoose');

<<<<<<< HEAD
const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    caregiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffProfile', // Updated to reference StaffProfile
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
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending','Missed'],
        default: 'Scheduled',
    },
    notes: {
        type: String,
    },
=======
const AppointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  durationHours: { type: Number, default: 1 },
  status: { type: String, enum: ['scheduled','completed','cancelled'], default: 'scheduled' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
>>>>>>> e1a809e2e30e4303139f90b49ce3592f844023af
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);