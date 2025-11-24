const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  // User who requested the pickup
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // NGO that will handle the pickup (optional until assigned)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Agent assigned by NGO to do actual pickup
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Pickup details
  date: {
    type: Date,
    required: true
  },
  
  time: {
    type: String,
    required: true
  },
  
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Types of waste to be collected
  wasteTypes: [{
    type: String,
    enum: ['plastic', 'organic', 'paper', 'glass', 'metal', 'e-waste', 'mixed'],
    required: true
  }],
  
  // Estimated quantity (optional)
  estimatedQuantity: {
    type: Number,
    min: 0,
    default: 0 // in kg
  },
  
  // Pickup status
  status: {
    type: String,
    enum: [
      'pending',      // Waiting for NGO to accept
      'accepted',     // NGO accepted, waiting for agent assignment
      'assigned',     // Agent assigned, pickup scheduled
      'in-progress',  // Agent is on the way or collecting
      'completed',    // Pickup completed successfully
      'cancelled',    // Cancelled by user or NGO
      'rejected'      // Rejected by NGO
    ],
    default: 'pending'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Additional notes
  notes: {
    type: String,
    default: ''
  },
  
  // Contact information for pickup
  contactInfo: {
    phone: String,
    alternatePhone: String,
    contactPerson: String
  },
  
  // Pickup completion details
  completionDetails: {
    actualQuantity: {
      type: Number,
      min: 0
    },
    completedAt: Date,
    completionNotes: String,
    photos: [String] // URLs to uploaded photos
  },
  
  // Rejection/Cancellation reason
  rejectionReason: {
    type: String,
    default: ''
  },
  
  // Tracking information
  tracking: {
    agentLocation: {
      latitude: Number,
      longitude: Number,
      lastUpdated: Date
    },
    estimatedArrival: Date,
    agentNotes: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
pickupSchema.index({ requestedBy: 1, status: 1 });
pickupSchema.index({ assignedTo: 1, status: 1 });
pickupSchema.index({ agent: 1, status: 1 });
pickupSchema.index({ date: 1 });
pickupSchema.index({ 'location.coordinates': '2dsphere' }); // For geospatial queries

// Virtual for formatted date
pickupSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for formatted time
pickupSchema.virtual('formattedDateTime').get(function() {
  return `${this.date.toLocaleDateString()} ${this.time}`;
});

// Method to check if pickup can be edited
pickupSchema.methods.canBeEdited = function() {
  return ['pending', 'accepted', 'assigned'].includes(this.status);
};

// Method to check if pickup can be cancelled
pickupSchema.methods.canBeCancelled = function() {
  return ['pending', 'accepted', 'assigned'].includes(this.status);
};

// Method to get status color for frontend
pickupSchema.methods.getStatusColor = function() {
  const colors = {
    'pending': 'yellow',
    'accepted': 'blue',
    'assigned': 'indigo',
    'in-progress': 'orange',
    'completed': 'green',
    'cancelled': 'red',
    'rejected': 'red'
  };
  return colors[this.status] || 'gray';
};

// Static method to find pickups by location radius
pickupSchema.statics.findByLocation = function(lat, lng, radiusInKm = 10) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusInKm * 1000 // Convert to meters
      }
    }
  });
};

// Pre-save middleware to update timestamps
pickupSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completionDetails.completedAt) {
    this.completionDetails.completedAt = new Date();
  }
  next();
});

// Export the model
const Pickup = mongoose.model('Pickup', pickupSchema);
module.exports = Pickup;
