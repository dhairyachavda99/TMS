const express = require('express');
const { 
  getWelcomeData, 
  getUserStats, 
  getRecentUsers 
} = require('../controllers/dashboardController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// General dashboard routes - accessible by all authenticated users
router.get('/welcome', getWelcomeData);

// Admin and IT Staff routes - for system management
router.get('/stats', authorize('admin', 'it_staff'), getUserStats);
router.get('/users/recent', authorize('admin', 'support', 'it_staff'), getRecentUsers);

module.exports = router;