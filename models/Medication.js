// models/Medication.js
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dose: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Active', 'Completed', 'Cancelled', 'Missed'],
    default: 'Scheduled'
  },
  frequency: {
    type: String,
    enum: ['Once', 'Daily', 'Weekly', 'Monthly', 'As Needed', 'Custom'],
    required: true
  },
  customFrequency: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timesPerDay: Number
  },
  timeOfDay: [{
    type: String,
    enum: ['Morning', 'Noon', 'Evening', 'Bedtime']
  }],
  specificTime: Date,
  repeats: {
    type: String,
    enum: ['Does not repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'],
    default: 'Does not repeat'
  },
  repeatEndDate: Date,
  repeatCount: Number,
  instructions: {
    type: String,
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastTaken: Date,
  nextDose: Date
}, {
  timestamps: true
});

// Calculate next dose date before saving
MedicationSchema.pre('save', function(next) {
  if (this.isModified('frequency') || this.isModified('timeOfDay') || this.isModified('lastTaken')) {
    this.calculateNextDose();
  }
  next();
});

// Method to calculate next dose
MedicationSchema.methods.calculateNextDose = function() {
  if (this.frequency === 'Once' && this.lastTaken) {
    this.nextDose = null;
    return;
  }

  if (!this.lastTaken) {
    // If never taken, next dose is now
    this.nextDose = new Date();
    return;
  }

  const lastTaken = new Date(this.lastTaken);
  let nextDose = new Date(lastTaken);

  switch (this.frequency) {
    case 'Daily':
      nextDose.setDate(nextDose.getDate() + 1);
      break;
    case 'Weekly':
      nextDose.setDate(nextDose.getDate() + 7);
      break;
    case 'Monthly':
      nextDose.setMonth(nextDose.getMonth() + 1);
      break;
    case 'As Needed':
      // Next dose is not scheduled for "As Needed" medications
      nextDose = null;
      break;
    default:
      // For custom frequencies or other cases
      nextDose.setDate(nextDose.getDate() + 1);
  }

  this.nextDose = nextDose;
};

// Static method to get today's medications
MedicationSchema.statics.getTodaysMedications = function(patientId) {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  return this.find({
    patient: patientId,
    isActive: true,
    $or: [
      { frequency: 'Daily' },
      { frequency: 'Once', lastTaken: { $exists: false } },
      { 'customFrequency.days': dayOfWeek },
      { 
        frequency: 'As Needed',
        nextDose: { $lte: today }
      }
    ]
  }).populate('patient', 'name').sort({ 'timeOfDay': 1 });
};

module.exports = mongoose.model('Medication', MedicationSchema);