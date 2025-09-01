// models/StaffProfile.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const NameSchema = new Schema({
  firstName: { type: String, required: true },
  middleInitial: { type: String, maxlength: 1 },
  lastName: { type: String, required: true }
});

const ContactDetailsSchema = new Schema({
  primaryPhone: { type: String, required: true },
  secondaryPhone: String,
  emailAddress: { type: String, required: true, lowercase: true }
});

const DemographicsSchema = new Schema({
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  preferredLanguage: { type: String, default: 'English' },
  otherLanguage: String
});

const AddressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  zip: String
});

const QualificationsSchema = new Schema({
  certifications: [{ type: String }],
  specializations: [{ type: String }]
});

const WorkAvailabilitySchema = new Schema({
  daysAvailable: [{ type: String }],
  shiftPreference: [{ type: String }]
});

const GovernmentIDsSchema = new Schema({
  socialSecurityNumber: { type: String, select: false }, // Hidden by default
  driversLicenseNumber: String,
  driversLicenseUploadUrl: String
});

const CertificationUploadsSchema = new Schema({
  cprCertificationUrl: String,
  professionalLicenseUrl: String
});

const EmergencyContactSchema = new Schema({
  name: String,
  relationship: String,
  phone: String
});

const HealthDeclarationsSchema = new Schema({
  physicalLimitations: Boolean,
  physicalLimitationsDescription: String,
  upToDateOnVaccinations: Boolean,
  vaccinationRecordsUploadUrl: String
});

const PolicyAcknowledgmentsSchema = new Schema({
  employeeHandbook: Boolean,
  hipaaCompliance: Boolean,
  electronicCommunications: Boolean
});

const StaffProfileSchema = new Schema({
  personalInformation: {
    fullName: { type: NameSchema, required: true },
    contactDetails: { type: ContactDetailsSchema, required: true },
    demographics: { type: DemographicsSchema, required: true },
    address: { type: AddressSchema, required: true } // Added address
  },
  professionalDetails: {
    positionAppliedFor: { type: String, required: true },
    otherPosition: String,
    qualifications: { type: QualificationsSchema, required: true },
    workAvailability: { type: WorkAvailabilitySchema, required: true }
  },
  employmentDocumentation: {
    governmentIDs: { type: GovernmentIDsSchema },
    certificationUploads: { type: CertificationUploadsSchema },
    backgroundCheckConsent: Boolean
  },
  emergencyMedicalInformation: {
    emergencyContact: { type: EmergencyContactSchema },
    healthDeclarations: { type: HealthDeclarationsSchema }
  },
  agreements: {
    policyAcknowledgments: { type: PolicyAcknowledgmentsSchema },
    digitalSignature: String,
    signatureDate: { type: Date, default: Date.now } // Added default
  },
  submissionTimestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Rejected', 'On Hold'],
    default: 'Pending Review'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Added for dynamic/custom fields
  customFields: [{
    name: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  }]
}, { timestamps: true });

// Add text index for search functionality
StaffProfileSchema.index({
  'personalInformation.fullName.firstName': 'text',
  'personalInformation.fullName.lastName': 'text',
  'personalInformation.contactDetails.emailAddress': 'text'
});

module.exports = mongoose.model('StaffProfile', StaffProfileSchema);