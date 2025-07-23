const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

    // Return user without password hash
    const userToReturn = newUser.toObject();
    delete userToReturn.passwordHash;

    res.status(201).json({
      message: 'User created successfully',
      user: userToReturn
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
