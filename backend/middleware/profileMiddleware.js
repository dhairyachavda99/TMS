// middleware/profileMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model instead of Profile

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Validation middleware for profile update
const validateProfileUpdate = (req, res, next) => {
  const { username, password, confirmPassword } = req.body;
  const errors = {};

  // Validate username
  if (username && username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  // Validate password
  if (password) {
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  validateProfileUpdate
};