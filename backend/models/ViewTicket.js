const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
    trim: true
  },
  commentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [commentSchema],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  resolution: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ createdAt: -1 });

// Virtual for ticket age in days
ticketSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update resolvedAt when status changes to resolved/closed
ticketSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' || this.status === 'closed') {
      if (!this.resolvedAt) {
        this.resolvedAt = new Date();
      }
    } else {
      this.resolvedAt = undefined;
      this.resolvedBy = undefined;
    }
  }
  next();
});

// Static method to get tickets by status
ticketSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get tickets by priority
ticketSchema.statics.getByPriority = function(priority) {
  return this.find({ priority })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

// Instance method to add comment
ticketSchema.methods.addComment = function(comment, userId) {
  this.comments.push({
    comment,
    commentBy: userId
  });
  return this.save();
};

// Instance method to assign ticket
ticketSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  if (this.status === 'open') {
    this.status = 'in-progress';
  }
  return this.save();
};

module.exports = mongoose.model('ViewTicket', ticketSchema);