const mongoose = require('mongoose');

const ticketLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'created',
      'status_changed',
      'assigned',
      'unassigned',
      'comment_added',
      'updated',
      'closed',
      'reopened'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  previousStatus: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'pending'],
  },
  newStatus: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'pending'],
    default: null
  },
  previousAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  newAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
ticketLogSchema.index({ ticketId: 1, timestamp: -1 });
ticketLogSchema.index({ updatedBy: 1, timestamp: -1 });
ticketLogSchema.index({ action: 1, timestamp: -1 });

// Static method to create log entry
ticketLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating ticket log:', error);
    throw error;
  }
};

// Static method to get ticket logs
ticketLogSchema.statics.getTicketLogs = async function(ticketId, limit = 50) {
  try {
    return await this.find({ ticketId })
      .populate('updatedBy', 'username email role')
      .populate('previousAssignee', 'username email')
      .populate('newAssignee', 'username email')
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error fetching ticket logs:', error);
    throw error;
  }
};

module.exports = mongoose.model('TicketLog', ticketLogSchema);