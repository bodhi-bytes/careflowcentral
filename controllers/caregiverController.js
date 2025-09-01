const Caregiver = require('../models/Caregiver');

// @desc    Get all caregivers
// @route   GET /api/caregivers
// @access  Private (e.g., only authenticated admins)
exports.getAllCaregivers = async (req, res) => {
    try {
        const caregivers = await Caregiver.find({}, 'profile.firstName profile.lastName');
        res.status(200).json({
            success: true,
            count: caregivers.length,
            data: caregivers
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while fetching caregivers' 
        });
    }
};

// Get the current caregiver's profile
exports.getMe = async (req, res) => {
  try {
    // Use .lean() to get a plain JavaScript object
    const caregiver = await Caregiver.findById(req.user.id).select('-passwordHash').lean();
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }
    
    // Remap profile to personalInfo for frontend compatibility
    const { profile, ...caregiverData } = caregiver;
    const response = {
      ...caregiverData,
      personalInfo: profile || {} // Ensure personalInfo is at least an empty object
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
