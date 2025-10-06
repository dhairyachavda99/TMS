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
      // Try to find user by username first, then by a partial match
      raisedForUser = await User.findOne({ 
        $or: [
          { username: raisedFor },
          { username: { $regex: raisedFor.split(' ')[0], $options: 'i' } }
        ]
      });
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

// IT Staff Management Routes
const { acceptTicket, rejectTicket, completeTicket, forwardTicket, getITStaff, getAllTickets } = require('../controllers/ticketController');

// Get all tickets (for IT staff)
router.get('/', authenticateToken, getAllTickets);

// Accept ticket
router.put('/:id/accept', authenticateToken, acceptTicket);

// Reject ticket
router.put('/:id/reject', authenticateToken, rejectTicket);

// Complete ticket
router.put('/:id/complete', authenticateToken, completeTicket);

// Forward ticket
router.put('/:id/forward', authenticateToken, forwardTicket);

// Get IT staff list
router.get('/it-staff', authenticateToken, getITStaff);

module.exports = router;
