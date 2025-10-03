// Validation middleware for ticket creation
const validateTicketCreation = (req, res, next) => {
  const { ticketType, complaint, roomNo } = req.body;
  const errors = [];

  // Validate ticket type
  if (!ticketType) {
    errors.push('Ticket type is required');
  } else if (!['incidental', 'replacement'].includes(ticketType)) {
    errors.push('Invalid ticket type. Must be either "incidental" or "replacement"');
  }

  // Validate complaint/description
  if (!complaint || complaint.trim() === '') {
    errors.push('Complaint description is required');
  } else if (complaint.trim().length < 10) {
    errors.push('Complaint description must be at least 10 characters long');
  } else if (complaint.length > 2000) {
    errors.push('Complaint description cannot exceed 2000 characters');
  }

  // Validate room number
  if (!roomNo) {
    errors.push('Room number is required');
  } else if (!/^\d+$/.test(roomNo.toString().trim())) {
    errors.push('Room number must contain only numbers');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Clean up the data
  req.body.complaint = complaint.trim();
  req.body.roomNo = roomNo.toString().trim();
  req.body.raisedFor = req.body.raisedFor ? req.body.raisedFor.trim() : null;

  next();
};

// Validation middleware for status update
const validateStatusUpdate = (req, res, next) => {
  const { status, note } = req.body;
  const validStatuses = ['open', 'in-progress', 'resolved', 'closed', 'pending'];

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  if (note && note.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Note cannot exceed 500 characters'
    });
  }

  next();
};

// Validation middleware for pagination
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }

  req.query.page = page;
  req.query.limit = limit;

  next();
};

// Validation middleware for MongoDB ObjectId
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

module.exports = {
  validateTicketCreation,
  validateStatusUpdate,
  validatePagination,
  validateObjectId
};