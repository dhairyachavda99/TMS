const express = require('express');
const router = express.Router();
const { authenticateToken, validateProfileUpdate } = require('../middleware/profileMiddleware');
const { getProfile, updateProfile, checkUsername } = require('../controllers/profileController');

// GET current user profile
router.get('/', authenticateToken, getProfile);

// UPDATE user profile
router.put('/', authenticateToken, validateProfileUpdate, updateProfile);

// Check username availability
router.get('/check-username/:username', checkUsername);

module.exports = router;