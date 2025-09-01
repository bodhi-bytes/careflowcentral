const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const Caregiver = require('../models/Caregiver');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/authMiddleware');
const { sendEmail, emailTemplates } = require('../config/emailConfig');
const { generateSecurePassword } = require('../utils/passwordGenerator');

exports.staffOnboarding = async (req, res) => {
  try {
    const { jsonData } = req.body;
    const data = JSON.parse(jsonData);

    const {
      personalInfo,
      professionalDetails,
      documentation,
      emergencyContact,
      medicalInfo,
      agreements,
    } = data;

    // Check if user exists
    const existingUser = await User.findOne({ email: personalInfo.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Generate a random password
    const password = generateSecurePassword();

    // Create new user
    const newUser = new User({
      email: personalInfo.email,
      passwordHash: password, // This will be hashed by the pre-save hook
      role: professionalDetails.position.toLowerCase(),
    });

    const savedUser = await newUser.save();

    // Send credentials email
    const emailTemplate = emailTemplates.credentialsEmail(
      personalInfo.email,
      password,
      professionalDetails.position
    );
    await sendEmail(personalInfo.email, emailTemplate);

    // Create new staff profile
    const newProfile = new StaffProfile({
      personalInformation: {
        fullName: {
          firstName: personalInfo.firstName,
          middleInitial: personalInfo.middleInitial,
          lastName: personalInfo.lastName,
        },
        contactDetails: {
          primaryPhone: personalInfo.primaryPhone,
          secondaryPhone: personalInfo.secondaryPhone,
          emailAddress: personalInfo.email,
        },
        demographics: {
          dateOfBirth: personalInfo.dob,
          gender: personalInfo.gender,
          preferredLanguage: personalInfo.preferredLanguage,
          otherLanguage: personalInfo.otherLanguage,
        },
        address: {
          street: personalInfo.address.street,
          city: personalInfo.address.city,
          state: personalInfo.address.state,
          zip: personalInfo.address.zip,
        },
      },
      professionalDetails: {
        positionAppliedFor: professionalDetails.position,
        otherPosition: professionalDetails.otherPosition,
        qualifications: {
          certifications: professionalDetails.certifications,
          specializations: professionalDetails.specializations,
        },
        workAvailability: {
          daysAvailable: professionalDetails.availability.days,
          shiftPreference: professionalDetails.availability.shifts,
        },
      },
      employmentDocumentation: {
        governmentIDs: {
          socialSecurityNumber: documentation.ssn,
          driversLicenseNumber: documentation.driversLicense,
          driversLicenseUploadUrl: req.files.idCopy ? req.files.idCopy[0].path : null,
        },
        certificationUploads: {
          cprCertificationUrl: req.files.certCopy ? req.files.certCopy[0].path : null,
          professionalLicenseUrl: req.files.licenseCopy ? req.files.licenseCopy[0].path : null,
        },
        backgroundCheckConsent: documentation.backgroundCheckConsent,
      },
      emergencyMedicalInformation: {
        emergencyContact: {
          name: emergencyContact.name,
          relationship: emergencyContact.relationship,
          phone: emergencyContact.phone,
        },
        healthDeclarations: {
          physicalLimitations: medicalInfo.hasLimitations,
          physicalLimitationsDescription: medicalInfo.limitationsDescription,
          upToDateOnVaccinations: medicalInfo.isVaccinated,
          vaccinationRecordsUploadUrl: req.files.vaccinationRecords ? req.files.vaccinationRecords[0].path : null,
        },
      },
      agreements: {
        policyAcknowledgments: {
          employeeHandbook: agreements.handbookAck,
          hipaaCompliance: agreements.hipaaAck,
          electronicCommunications: agreements.commConsent,
        },
        digitalSignature: agreements.signature,
      },
      createdBy: savedUser._id,
    });

    const savedProfile = await newProfile.save();

    if (professionalDetails.position.toLowerCase() === 'caregiver') {
      const newCaregiver = new Caregiver({
        email: personalInfo.email,
        passwordHash: password,
        profile: savedProfile.toObject(),
      });
      await newCaregiver.save();
    }

    savedUser.profile = savedProfile._id;
    await savedUser.save();

    // Generate token
    const token = generateToken(savedUser);

    // Return user without password hash and with token
    const userToReturn = savedUser.toObject();
    delete userToReturn.passwordHash;

    res.status(201).json({
      message: 'Staff onboarded successfully. An email with credentials has been sent.',
      user: userToReturn,
      token,
    });
  } catch (error) {
    console.error("Staff onboarding error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};