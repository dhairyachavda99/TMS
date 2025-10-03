// routes/ticketGenerate.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Tickets');
const TicketLog = require('../models/TicketLog');
const User = require('../models/User');
const { validateTicketCreation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// POST /api/tickets/generate - Create a new ticket from the form
router.post('/generate', authenticateToken, validateTicketCreation, async (req, res) => {
  try {
    console.log("body", req.body)
    const { ticketType, complaint, roomNo, raisedFor } = req.body;
    const userId = req.user._id;

    // Generate title from complaint (first 50 characters)
    const title = complaint.length > 50 
      ? complaint.substring(0, 47) + '...' 
      : complaint;

    // Handle raisedFor - find user if specified
    let raisedForUser = null;

if (raisedFor && raisedFor.trim() !== '') {
  raisedForUser = await User.findOne({ username: raisedFor });
}


    // Create the ticket
    const ticket = new Ticket({
      title,
      description: complaint,
      type: ticketType,
      status: 'open',
      roomNo: roomNo.toString(),
      raisedBy: userId,
      raisedFor: raisedForUser ? raisedForUser._id : null,
      history: [{
        status: 'open',
        note: 'Ticket created from web form',
        updatedBy: userId,
        timestamp: new Date()
      }]
    });

    await ticket.save();

    // Create ticket log entry
    const logEntry = new TicketLog({
      ticketId: ticket._id,
      action: 'created',
      description: `Ticket created with type: ${ticketType}`,
      newStatus: 'open',
      updatedBy: userId,
      metadata: {
        source: 'web_form',
        roomNo: roomNo.toString(),
        type: ticketType,
        raisedForName: raisedFor || null
      }
    });

    await logEntry.save();
    // Populate the ticket for response
    await ticket.populate([
      { path: 'raisedBy', select: 'username email role' },
      { path: 'raisedFor', select: 'username email' }
    ]);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Ticket generated successfully',
      data: {
        ticket: {
          id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          description: ticket.description,
          type: ticket.type,
          status: ticket.status,
          roomNo: ticket.roomNo,
          raisedBy: ticket.raisedBy,
          raisedFor: ticket.raisedFor,
          createdAt: ticket.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Ticket generation error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate ticket data detected'
      });
    }

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
      message: 'Failed to generate ticket. Please try again.'
    });
  }
});

// GET /api/tickets/user/:userId - Get tickets for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    // Check permission - users can only view their own tickets unless admin
    if (userRole === 'user' && userId !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const tickets = await Ticket.find({
      $or: [
        { raisedBy: userId },
        { raisedFor: userId }
      ]
    })
    .populate('raisedBy', 'username email role')
    .populate('raisedFor', 'username email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tickets }
    });

  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// GET /api/tickets/:ticketId/logs - Get logs for a specific ticket
router.get('/:ticketId/logs', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user._id;
    const userRole = req.user.role;

    // First check if ticket exists and user has permission
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permission for regular users
    if (userRole === 'user') {
      const canView = ticket.raisedBy.equals(userId) || 
                     (ticket.raisedFor && ticket.raisedFor.equals(userId));
      
      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get ticket logs
    const logs = await TicketLog.find({ ticketId })
      .populate('updatedBy', 'username email role')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { logs }
    });

  } catch (error) {
    console.error('Get ticket logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket logs'
    });
  }
});

// Enhanced validation middleware specifically for the form
const validateFormData = (req, res, next) => {
  const { ticketType, complaint, roomNo } = req.body;
  const errors = [];

  // Validate ticket type
  if (!ticketType) {
    errors.push({ field: 'ticketType', message: 'Please select a ticket type' });
  } else if (!['incidental', 'replacement'].includes(ticketType)) {
    errors.push({ field: 'ticketType', message: 'Invalid ticket type selected' });
  }

  // Validate complaint
  if (!complaint || complaint.trim() === '') {
    errors.push({ field: 'complaint', message: 'Please describe your complaint' });
  } else if (complaint.trim().length < 10) {
    errors.push({ field: 'complaint', message: 'Please provide a more detailed description (at least 10 characters)' });
  } else if (complaint.length > 2000) {
    errors.push({ field: 'complaint', message: 'Description is too long (maximum 2000 characters)' });
  }

  // Validate room number
  if (!roomNo) {
    errors.push({ field: 'roomNo', message: 'Please enter your room number' });
  } else if (!/^\d+$/.test(roomNo.toString().trim())) {
    errors.push({ field: 'roomNo', message: 'Room number should contain only numbers' });
  } else if (roomNo.toString().trim().length > 10) {
    errors.push({ field: 'roomNo', message: 'Room number is too long' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please fix the following errors:',
      errors
    });
  }

  // Clean up the data
  req.body.complaint = complaint.trim();
  req.body.roomNo = roomNo.toString().trim();
  req.body.raisedFor = req.body.raisedFor ? req.body.raisedFor.trim() : '';

  next();
};

// Update the route to use enhanced validation
router.post('/generate', authenticateToken, validateFormData, async (req, res) => {
  // ... (same implementation as above)
});

module.exports = router;
