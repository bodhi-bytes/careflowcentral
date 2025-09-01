const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientCredentialsSchema = new mongoose.Schema({
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
  clientProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  role: {
    type: String,
    default: 'client',
    enum: ['client']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isSeparateCredential: {
    type: Boolean,
    default: true
  },
  targetApp: {
    type: String,
    default: 'client-app'
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
clientCredentialsSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

// Instance method to compare passwords
clientCredentialsSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Virtual for account lock status
clientCredentialsSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('ClientCredentials', clientCredentialsSchema);