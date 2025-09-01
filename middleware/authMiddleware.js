const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Utility function to generate a JWT
const generateToken = (user) => {
    // Ensure JWT_SECRET is set in your .env file
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.profile?.personalInfo?.firstName || user.email
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }); // Token expires in 8 hours
};

// Middleware to protect routes (ensure user is logged in)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object (without password hash)
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to authorize users based on roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize, generateToken };
