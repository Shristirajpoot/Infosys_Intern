// models/application.model.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  applicationMessage: {
    type: String,
    maxLength: 500
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewMessage: {
    type: String,
    maxLength: 500
  },
  // Attendance tracking fields
  attendance: {
    status: {
      type: String,
      enum: ['pending', 'present', 'absent', 'late'],
      default: 'pending'
    },
    markedAt: {
      type: Date
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    arrivalTime: {
      type: String // Store as HH:MM format
    },
    notes: {
      type: String,
      maxLength: 200
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications - use correct field names
applicationSchema.index({ opportunityId: 1, volunteerId: 1 }, { unique: true });

// Index for efficient queries
applicationSchema.index({ volunteerId: 1, status: 1 });
applicationSchema.index({ opportunityId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
