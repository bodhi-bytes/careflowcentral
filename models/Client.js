const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClientSchema = new Schema({
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { 
      type: String, 
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say'
    },
    profilePhotoUrl: { type: String, default: '' }
  },
  
  contactDetails: {
    email: { 
      type: String, 
      required: true, 
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    phone: { type: String, required: true },
    emergencyContact: {
      fullName: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true }
    }
  },
  
  medicalInfo: {
    conditions: [{ type: String }],
    otherCondition: { type: String, default: '' },
    allergies: [{ type: String }],
    otherAllergies: { type: String, default: '' },
    medications: [{
      name: { type: String, required: true },
      dosage: { type: String, default: '' },
      frequency: { type: String, default: '' }
    }],
    mobility: { 
      type: String, 
      enum: ['Independent', 'Uses Cane/Walker', 'Wheelchair User', 'Bedridden'],
      default: 'Independent'
    }
  },
  
  location: {
    street: { type: String, required: true },
    apt: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  
  careNeeds: {
    activities: [{ type: String }],
    specialRequirements: { type: String, default: '' }
  },
  
  servicePreferences: {
    schedule: [{
      day: { type: String, required: true },
      startTime: { type: String, default: '' },
      endTime: { type: String, default: '' }
    }],
    caregiverGender: { 
      type: String, 
      enum: ['Male', 'Female', 'No Preference'],
      default: 'No Preference'
    },
    caregiverLanguage: { type: String, default: '' }
  },
  
  consent: {
    photoRelease: { type: Boolean, default: false },
    medicalConsent: { type: Boolean, default: false },
    signature: { type: String, required: true },
    consentDate: { type: Date, default: Date.now }
  },
  
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deceased'],
    default: 'Active'
  },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  customFields: [{
    name: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  }]
}, { 
  timestamps: true 
});

// Add text index for search functionality
ClientSchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  'contactDetails.email': 'text'
});

// Virtual for full name
ClientSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Ensure virtual fields are serialized
ClientSchema.set('toJSON', { virtuals: true });
ClientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', ClientSchema);
