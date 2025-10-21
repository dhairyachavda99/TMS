const Ticket = require('../models/Tickets');
const TicketLog = require('../models/TicketLog');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const { ticketType, complaint, roomNo, raisedFor } = req.body;
    const userId = req.user._id;

    // Validation
    if (!ticketType || !complaint || !roomNo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ticket type, complaint description, and room number'
      });
    }

    // Validate ticket type
    if (!['incidental', 'replacement'].includes(ticketType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket type'
      });
    }

    // Generate title from complaint (first 50 characters)
    const title = complaint.length > 50
      ? complaint.substring(0, 47) + '...'
      : complaint;

    // Handle raisedFor - if it's a string, try to find the user
    let raisedForUser = null;
    console.log('=== SCRIPT STARTED ===');
    if (raisedFor && raisedFor.trim() !== '') {
      const searchName = raisedFor.trim();
      console.log('Searching for user:', searchName);

      // Try to find user by username (case insensitive)
      raisedForUser = await User.findOne({
        username: { $regex: new RegExp(`^${searchName}$`, 'i') }
      });

      console.log('Initial search result:', raisedForUser);

      // If not found by username, create a simple mapping for common names
      if (!raisedForUser) {
        console.log('User not found, trying name mapping...');
        const nameMapping = {
          'hetal mam': 'hetal',
          'asmita mam': 'asmita',
          'khushal sir': 'khushal',
          'shaunak sir': 'shaunak',
          'savan sir': 'savan',
          'imran sir': 'imran',
          'yash sir': 'yash',
          'devki mam': 'devki',
          'rachel mam': 'rachel',
          'daya mam': 'daya',
          'reetu mam': 'reetu',
          'smita mam': 'smita'
        };

        const mappedName = nameMapping[searchName.toLowerCase()];
        console.log('Mapped name:', mappedName);

        if (mappedName) {
          raisedForUser = await User.findOne({
            username: { $regex: new RegExp(`^${mappedName}$`, 'i') }
          });
          console.log('Mapped search result:', raisedForUser);
        }
      }
      if (!raisedForUser) {
        console.log('Trying broader search...');
        raisedForUser = await User.findOne({
          $or: [
            { displayName: { $regex: new RegExp(searchName, 'i') } },
            { email: { $regex: new RegExp(searchName, 'i') } }
          ]
        });
        console.log('Broad search result:', raisedForUser ? raisedForUser.username : 'NOT FOUND');
      }
    }
    console.log("data", {
      title,
      description: complaint,
      type: ticketType,
      roomNo: roomNo.toString(),
      raisedBy: userId,
      raisedFor: raisedForUser ? raisedForUser._id : null,
      history: [{
        status: 'open',
        note: 'Ticket created',
        updatedBy: userId
      }]
    })
    // Create the ticket
    const ticket = new Ticket({
      title,
      description: complaint,
      type: ticketType,
      status: 'pending',
      roomNo: roomNo.toString(),
      raisedBy: userId,
      raisedFor: raisedForUser ? raisedForUser._id : null,
      history: [{
        status: 'pending',
        note: 'Ticket created',
        updatedBy: userId
      }]
    });

    await ticket.save();

    // Create ticket log entry
    await TicketLog.createLog({
      ticketId: ticket._id,
      action: 'created',
      description: `Ticket created with type: ${ticketType}`,
      newStatus: 'pending',
      updatedBy: userId,
      metadata: {
        roomNo: roomNo.toString(),
        type: ticketType,
        raisedForName: raisedFor || null
      }
    });



    // Populate the ticket for response
    await ticket.populate([
      { path: 'raisedBy', select: 'username email role' },
      { path: 'raisedFor', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticket: {
          id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          description: ticket.description,
          type: ticket.type,
          status: ticket.status,
          priority: ticket.priority,
          roomNo: ticket.roomNo,
          raisedBy: ticket.raisedBy,
          raisedFor: ticket.raisedFor,
          createdAt: ticket.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tickets for a user
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;

    // Build query
    const query = {
      $or: [
        { raisedBy: userId },
        { raisedFor: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const tickets = await Ticket.find(query)
      .populate('raisedBy', 'username email role')
      .populate('raisedFor', 'username email')
      .populate('assignedTo', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tickets (admin/support only)
const getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const priority = req.query.priority;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const tickets = await Ticket.find(query)
      .populate('raisedBy', 'username email role')
      .populate('raisedFor', 'username email')
      .populate('assignedTo', 'username email role')
      .populate('history.updatedBy', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single ticket by ID
const getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const ticket = await Ticket.findById(ticketId)
      .populate('raisedBy', 'username email role')
      .populate('raisedFor', 'username email')
      .populate('assignedTo', 'username email role')
      .populate('history.updatedBy', 'username email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permission - user can only view their own tickets unless they're admin/support
    if (userRole === 'user') {
      const canView = ticket.raisedBy._id.equals(userId) ||
        (ticket.raisedFor && ticket.raisedFor._id.equals(userId));

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get ticket logs
    const logs = await TicketLog.getTicketLogs(ticketId, 20);

    res.json({
      success: true,
      data: {
        ticket,
        logs
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update ticket status (admin/support only)
const updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status, note } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const previousStatus = ticket.status;

    // Update ticket
    ticket.status = status;
    ticket.history.push({
      status,
      note: note || `Status changed to ${status}`,
      updatedBy: userId
    });

    await ticket.save();

    // Create log entry
    await TicketLog.createLog({
      ticketId: ticket._id,
      action: 'status_changed',
      description: `Status changed from ${previousStatus} to ${status}`,
      previousStatus,
      newStatus: status,
      updatedBy: userId,
      metadata: {
        note: note || null
      }
    });

    await ticket.populate([
      { path: 'raisedBy', select: 'username email role' },
      { path: 'raisedFor', select: 'username email' },
      { path: 'assignedTo', select: 'username email role' }
    ]);

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get ticket statistics
const getTicketStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchQuery = {};

    // For regular users, only show their tickets
    if (userRole === 'user') {
      matchQuery = {
        $or: [
          { raisedBy: userId },
          { raisedFor: userId }
        ]
      };
    }

    const stats = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          incidental: { $sum: { $cond: [{ $eq: ['$type', 'incidental'] }, 1, 0] } },
          replacement: { $sum: { $cond: [{ $eq: ['$type', 'replacement'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      open: 0,
      resolved: 0,
      pending: 0,
      rejected: 0,
      incidental: 0,
      replacement: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Accept ticket (IT staff only)
const acceptTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!['admin', 'it_staff'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. IT staff only.'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not in pending status'
      });
    }

    ticket.status = 'open';
    ticket.assignedTo = userId;
    ticket.history.push({
      status: 'open',
      note: 'Ticket accepted by IT staff',
      updatedBy: userId
    });

    await ticket.save();

    await TicketLog.createLog({
      ticketId: ticket._id,
      action: 'accepted',
      description: 'Ticket accepted by IT staff',
      newStatus: 'open',
      updatedBy: userId
    });

    // Notify ticket creator
    const notification = new Notification({
      recipient: ticket.raisedBy,
      sender: userId,
      type: 'ticket_accepted',
      title: 'Ticket Accepted',
      message: `Your ticket ${ticket.ticketNumber} has been accepted and is now being worked on`,
      ticketId: ticket._id
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Ticket accepted successfully'
    });
  } catch (error) {
    console.error('Accept ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reject ticket (IT staff only)
const rejectTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!['admin', 'it_staff'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. IT staff only.'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not in pending status'
      });
    }

    ticket.status = 'rejected';
    ticket.history.push({
      status: 'rejected',
      note: reason || 'Ticket rejected by IT staff',
      updatedBy: userId
    });

    await ticket.save();

    await TicketLog.createLog({
      ticketId: ticket._id,
      action: 'rejected',
      description: reason || 'Ticket rejected by IT staff',
      newStatus: 'rejected',
      updatedBy: userId
    });

    // Notify ticket creator
    const notification = new Notification({
      recipient: ticket.raisedBy,
      sender: userId,
      type: 'ticket_rejected',
      title: 'Ticket Rejected',
      message: `Your ticket ${ticket.ticketNumber} has been rejected. Reason: ${reason || 'No reason provided'}`,
      ticketId: ticket._id
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Ticket rejected successfully'
    });
  } catch (error) {
    console.error('Reject ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete ticket (IT staff only)
const completeTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { resolution } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!['admin', 'it_staff'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. IT staff only.'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Ticket must be open to complete'
      });
    }

    ticket.status = 'resolved';
    ticket.resolution = resolution;
    ticket.resolvedAt = new Date();
    ticket.history.push({
      status: 'resolved',
      note: resolution || 'Ticket completed',
      updatedBy: userId
    });

    await ticket.save();

    await TicketLog.createLog({
      ticketId: ticket._id,
      action: 'completed',
      description: resolution || 'Ticket completed',
      newStatus: 'resolved',
      updatedBy: userId
    });

    // Notify ticket creator
    const notification = new Notification({
      recipient: ticket.raisedBy,
      sender: userId,
      type: 'ticket_completed',
      title: 'Ticket Resolved',
      message: `Your ticket ${ticket.ticketNumber} has been resolved. Resolution: ${resolution || 'Completed'}`,
      ticketId: ticket._id
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Ticket completed successfully'
    });
  } catch (error) {
    console.error('Complete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forward ticket to another IT staff
const forwardTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { assignToId, note } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!['admin', 'it_staff'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. IT staff only.'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const assignToUser = await User.findById(assignToId);
    if (!assignToUser || !['admin', 'it_staff'].includes(assignToUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IT staff member selected'
      });
    }

    ticket.assignedTo = assignToId;
    ticket.status = 'open';
    ticket.history.push({
      status: 'open',
      note: note || `Ticket forwarded to ${assignToUser.username}`,
      updatedBy: userId
    });

    await ticket.save();

    await TicketLog.createLog({
      ticketId: ticket._id,
      action: 'forwarded',
      description: note || `Ticket forwarded to ${assignToUser.username}`,
      newStatus: 'open',
      updatedBy: userId,
      metadata: { forwardedTo: assignToId }
    });

    // Create notification for the assigned user
    const notification = new Notification({
      recipient: assignToId,
      sender: userId,
      type: 'ticket_forwarded',
      title: 'Ticket Forwarded to You',
      message: `Ticket ${ticket.ticketNumber} has been forwarded to you by ${req.user.username}`,
      ticketId: ticket._id
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Ticket forwarded successfully'
    });
  } catch (error) {
    console.error('Forward ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get IT staff list
const getITStaff = async (req, res) => {
  try {
    const itStaff = await User.find({
      role: { $in: ['admin', 'it_staff'] }
    }).select('username email role');

    res.json({
      success: true,
      data: { itStaff }
    });
  } catch (error) {
    console.error('Get IT staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get IT staff statistics with pagination
const getITStaffStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const { staffId, page = 1, limit = 10, startDate, endDate, viewType = 'month' } = req.query;

    if (!['admin', 'it_staff'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get IT staff based on selection
    let itStaff;
    if (userRole === 'admin' && staffId && staffId !== 'all') {
      itStaff = await User.find({ _id: staffId, role: 'it_staff' });
    } else if (userRole === 'admin') {
      itStaff = await User.find({ role: 'it_staff' });
    } else {
      itStaff = await User.find({ _id: userId, role: { $in: ['admin', 'it_staff'] } });
    }
    
    // Generate date ranges based on viewType and date filters
    let dateRanges = [];
    const now = new Date();
    
    if (startDate && endDate) {
      // Custom date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (viewType === 'day') {
        // Generate daily ranges
        const current = new Date(start);
        while (current <= end) {
          dateRanges.push({
            label: current.toISOString().slice(0, 10),
            start: new Date(current),
            end: new Date(current.getTime() + 24 * 60 * 60 * 1000)
          });
          current.setDate(current.getDate() + 1);
        }
      } else {
        // Generate monthly ranges
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
        
        while (current <= endMonth) {
          const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
          dateRanges.push({
            label: current.toISOString().slice(0, 7),
            start: new Date(current),
            end: new Date(monthEnd.getTime() + 24 * 60 * 60 * 1000)
          });
          current.setMonth(current.getMonth() + 1);
        }
      }
    } else {
      // Default: last 6 months or 30 days
      const periods = viewType === 'day' ? 30 : 6;
      
      for (let i = periods - 1; i >= 0; i--) {
        if (viewType === 'day') {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          dateRanges.push({
            label: date.toISOString().slice(0, 10),
            start: new Date(date),
            end: new Date(date.getTime() + 24 * 60 * 60 * 1000)
          });
        } else {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          dateRanges.push({
            label: monthStart.toISOString().slice(0, 7),
            start: monthStart,
            end: new Date(monthEnd.getTime() + 24 * 60 * 60 * 1000)
          });
        }
      }
    }
    
    // Create stats for each staff member for each date range
    const allStats = [];
    
    for (const staff of itStaff) {
      if (userRole === 'it_staff' && !staff._id.equals(userId)) continue;
      
      for (const range of dateRanges) {
        const tickets = await Ticket.find({
          $or: [
            { assignedTo: staff._id },
            { 'history.updatedBy': staff._id }
          ],
          createdAt: { $gte: range.start, $lt: range.end }
        });
        
        allStats.push({
          period: range.label,
          staffId: staff._id,
          staffName: staff.username,
          accepted: tickets.filter(t => t.status !== 'pending').length,
          completed: tickets.filter(t => t.status === 'resolved').length,
          rejected: tickets.filter(t => t.status === 'rejected').length,
          open: tickets.filter(t => t.status === 'open').length,
          total: tickets.length,
          viewType
        });
      }
    }

    // Apply pagination
    const totalStats = allStats.length;
    const paginatedStats = allStats.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: {
        stats: paginatedStats,
        pagination: {
          current: pageNum,
          pages: Math.ceil(totalStats / limitNum),
          total: totalStats,
          hasNext: pageNum < Math.ceil(totalStats / limitNum),
          hasPrev: pageNum > 1,
          limit: limitNum
        },
        filters: {
          viewType,
          startDate,
          endDate,
          staffId
        }
      }
    });
  } catch (error) {
    console.error('Get IT staff stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  getTicketStats,
  acceptTicket,
  rejectTicket,
  completeTicket,
  forwardTicket,
  getITStaff,
  getITStaffStats
};