// controllers/profileController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// UPDATE user profile
const updateProfile = async (req, res) => {
  try {
    const { password, currentPassword } = req.body;
    const userId = req.user._id;

    // Get user with password for validation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If updating password, validate current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      // Check if current password is correct
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = password;
      user.updatedAt = Date.now();
      await user.save();
    }

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: 'Password updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Check username availability
const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (username.length < 3) {
      return res.json({
        available: false,
        message: 'Username must be at least 3 characters'
      });
    }

    const existingUser = await User.findOne({ username });
    
    res.json({
      available: !existingUser,
      message: existingUser ? 'Username already taken' : 'Username available'
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking username'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  checkUsername
};