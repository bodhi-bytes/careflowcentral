const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const caregiverCredentialsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  staffProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StaffProfile',
    required: true
  },
  role: {
    type: String,
    default: 'caregiver',
    enum: ['caregiver']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  // Separate from main User model
  isSeparateCredential: {
    type: Boolean,
    default: true
  },
  // Track which app/system this credential is for
  targetApp: {
    type: String,
    default: 'caregiver-app'
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, { timestamps: true });

// Password hashing middleware
caregiverCredentialsSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

// Instance method to compare passwords
caregiverCredentialsSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Virtual for account lock status
caregiverCredentialsSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('CaregiverCredentials', caregiverCredentialsSchema);
