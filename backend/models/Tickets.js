const mongoose = require('mongoose');

const ticketHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'pending', 'rejected'],
    required: true
  },
  note: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['incidental', 'replacement'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'pending', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  resolvedAt: {
    type: Date
  },
  roomNo: {
    type: String,
    required: true,
    trim: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raisedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // If null, it means ticket is for the person who raised it
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  history: [ticketHistorySchema],
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ticketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate ticket number
ticketSchema.virtual('ticketNumber').get(function() {
  const year = this.createdAt.getFullYear();
  const month = String(this.createdAt.getMonth() + 1).padStart(2, '0');
  const idSuffix = this._id.toString().slice(-6).toUpperCase();
  return `TKT-${year}${month}-${idSuffix}`;
});

// Ensure virtual fields are serialized
ticketSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

ticketSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);