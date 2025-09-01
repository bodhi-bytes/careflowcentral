const StaffProfile = require('../models/StaffProfile');
const CaregiverCredentials = require('../models/CaregiverCredentials'); // Separate credential model
const User = require('../models/User');
const { sendEmail } = require('../config/emailConfig');
const { emailTemplates } = require('../config/emailConfig');
const { generateSecurePassword } = require('../utils/passwordGenerator');

// Create a new staff profile
exports.createStaffProfile = async (req, res) => {
  try {
    // Create staff profile
    const newProfile = await StaffProfile.create(req.body);
    
    // Check if email exists in staff data
    const staffEmail = newProfile.personalInformation?.contactDetails?.emailAddress;
    if (!staffEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff email is required for user account creation' 
      });
    }
    
    // Generate password for user
    const generatedPassword = generateSecurePassword(12);
    
    // Check if position is caregiver
    const isCaregiver = newProfile.professionalDetails?.positionAppliedFor?.toLowerCase() === 'caregiver';
    
    let credentialResult;
    
    if (isCaregiver) {
      // Create separate caregiver credentials (not in main User model)
      credentialResult = await CaregiverCredentials.create({
        email: staffEmail,
        passwordHash: generatedPassword,
        staffProfileId: newProfile._id,
        role: 'caregiver',
        status: 'active',
        targetApp: 'caregiver-app'
      });
    } else {
      // Create regular user account for non-caregiver staff
      credentialResult = await User.create({
        email: staffEmail,
        passwordHash: generatedPassword,
        role: newProfile.professionalDetails?.positionAppliedFor?.toLowerCase() || 'staff',
        profile: {
          staffId: newProfile._id,
          firstName: newProfile.personalInformation?.fullName?.firstName || '',
          lastName: newProfile.personalInformation?.fullName?.lastName || '',
          phone: newProfile.personalInformation?.contactDetails?.primaryPhone || ''
        },
        status: 'active'
      });
    }
    
    // Send credentials email
    try {
      await sendEmail(
        staffEmail,
        emailTemplates.credentialsEmail(staffEmail, generatedPassword, 
          isCaregiver ? 'caregiver' : newProfile.professionalDetails?.positionAppliedFor)
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the entire operation if email fails
    }
    
    res.status(201).json({
      success: true,
      data: newProfile,
      userId: credentialResult._id,
      credentialType: isCaregiver ? 'caregiver-separate' : 'main-system',
      message: `Staff profile created successfully. ${isCaregiver ? 'Caregiver credentials stored separately' : 'User account'} and credentials email sent.`
    });
  } catch (error) {
    console.error('Error creating staff profile:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: messages 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server Error while creating staff profile' 
    });
  }
};

// Get all staff profiles
exports.getAllStaffProfiles = async (_req, res) => {
  try {
    const profiles = await StaffProfile.find().populate('createdBy', 'role');
    console.log('Profiles from DB:', JSON.stringify(profiles, null, 2));
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single staff profile by ID
exports.getStaffProfileById = async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a staff profile by ID
exports.updateStaffProfile = async (req, res) => {
  try {
    const updatedProfile = await StaffProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProfile) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a staff profile by ID
exports.deleteStaffProfile = async (req, res) => {
  try {
    const deletedProfile = await StaffProfile.findByIdAndDelete(req.params.id);
    if (!deletedProfile) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }
    res.status(200).json({ message: 'Staff profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};