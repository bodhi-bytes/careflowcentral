const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const StaffProfile = require('../models/StaffProfile'); // Keep this import if StaffProfile is used elsewhere in authController
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/authMiddleware'); // Import generateToken

exports.register = async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;
    
    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new user
    const newUser = new User({
      email,
      passwordHash: password, // Will be hashed by pre-save hook in User model
      role,
      profile
    });

    await newUser.save();

    // Generate token for immediate login after registration
    const token = generateToken(newUser);

    // Return user without password hash and with token
    const userToReturn = newUser.toObject();
    delete userToReturn.passwordHash;

    res.status(201).json({
      message: 'User created successfully',
      user: userToReturn,
      token
    });
  } catch (error) {
    console.error("Login error:", error);  // Add this line
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    // If user not found, check if it's a caregiver
    if (!user) {
      user = await Caregiver.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user without password hash and with token
    const userToReturn = user.toObject();
    delete userToReturn.passwordHash;

    res.status(200).json({
      message: 'Logged in successfully',
      user: userToReturn,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};