const CaregiverCredentials = require('../models/CaregiverCredentials');
const jwt = require('jsonwebtoken');
const { generateSecurePassword } = require('../utils/passwordGenerator');

// Generate JWT token for caregiver
const generateCaregiverToken = (caregiver) => {
  const payload = {
    id: caregiver._id,
    email: caregiver.email,
    role: caregiver.role,
    staffProfileId: caregiver.staffProfileId,
    type: 'caregiver-separate'
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

// Caregiver login (separate from main auth)
exports.caregiverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find caregiver credentials
    const caregiver = await CaregiverCredentials.findOne({ email, status: 'active' });
    
    if (!caregiver) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (caregiver.isLocked) {
      return res.status(423).json({ message: 'Account temporarily locked' });
    }

    // Verify password
    const isMatch = await caregiver.comparePassword(password);
    
    if (!isMatch) {
      // Increment login attempts
      caregiver.loginAttempts += 1;
      
      if (caregiver.loginAttempts >= 5) {
        caregiver.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Lock for 2 hours
      }
      
      await caregiver.save();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    caregiver.loginAttempts = 0;
    caregiver.lockUntil = undefined;
    caregiver.lastLogin = new Date();
    await caregiver.save();

    // Generate token
    const token = generateCaregiverToken(caregiver);

    res.json({
      success: true,
      token,
      user: {
        id: caregiver._id,
        email: caregiver.email,
        role: caregiver.role,
        staffProfileId: caregiver.staffProfileId
      }
    });
  } catch (error) {
    console.error('Caregiver login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get caregiver profile
exports.getCaregiverProfile = async (req, res) => {
  try {
    const caregiver = await CaregiverCredentials.findById(req.user.id)
      .select('-passwordHash')
      .populate('staffProfileId');
    
    res.json({
      success: true,
      data: caregiver
    });
  } catch (error) {
    console.error('Get caregiver profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update caregiver password
exports.updateCaregiverPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const caregiver = await CaregiverCredentials.findById(req.user.id);
    
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    // Verify current password
    const isMatch = await caregiver.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    caregiver.passwordHash = newPassword;
    await caregiver.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update caregiver password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset caregiver password (admin function)
exports.resetCaregiverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const caregiver = await CaregiverCredentials.findOne({ email });
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const newPassword = generateSecurePassword(12);
    caregiver.passwordHash = newPassword;
    await caregiver.save();

    // Here you would typically send the new password via email
    // For security, implement email sending in production

    res.json({
      success: true,
      message: 'Password reset successfully',
      newPassword // Remove this in production - send via email instead
    });
  } catch (error) {
    console.error('Reset caregiver password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  caregiverLogin,
  getCaregiverProfile,
  updateCaregiverPassword,
  resetCaregiverPassword
};
