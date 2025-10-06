const express = require('express');
const router = express.Router();
const Ticket = require('../models/Tickets');
const { authenticateToken } = require('../middleware/auth');

// GET tickets based on user role
router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    // Role-based filtering
    if (req.user.role === 'user' || req.user.role === 'support') {
      // Users and support can only see their own tickets
      filter.raisedBy = req.user._id;
    }
    // Admin and IT staff can see all tickets (no filter)

    const tickets = await Ticket.find(filter)
      .populate('raisedBy', 'username email')
      .populate('raisedFor', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets'
    });
  }
});

module.exports = router;