const CaregiverProfile = require('../models/CaregiverProfile');

// Create a new caregiver profile
exports.createCaregiverProfile = async (req, res) => {
  try {
    const newProfile = await CaregiverProfile.create(req.body);
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all caregiver profiles
exports.getAllCaregiverProfiles = async (_req, res) => {
  try {
    const profiles = await CaregiverProfile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single caregiver profile by ID
exports.getCaregiverProfileById = async (req, res) => {
  try {
    const profile = await CaregiverProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a caregiver profile by ID
exports.updateCaregiverProfile = async (req, res) => {
  try {
    const updatedProfile = await CaregiverProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProfile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a caregiver profile by ID
exports.deleteCaregiverProfile = async (req, res) => {
  try {
    const deletedProfile = await CaregiverProfile.findByIdAndDelete(req.params.id);
    if (!deletedProfile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }
    res.status(200).json({ message: 'Caregiver profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
