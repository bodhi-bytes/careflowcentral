const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Appointment', 'Care Rotation', 'Visit', 'Other'], default: 'Appointment' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver', },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  durationHours: { type: Number, default: 1 },
  status: { type: String, enum: ['scheduled','completed','cancelled'], default: 'scheduled' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);