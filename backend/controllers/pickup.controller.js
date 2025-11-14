const Pickup = require('../models/pickup.model.js');
const User = require('../models/user.model.js');
const { io } = require('../socket/socket.js');

// @desc    Create a new pickup request
// @route   POST /api/pickups
// @access  Private (Volunteers)
const createPickup = async (req, res) => {
  try {
    const { date, time, location, wasteTypes, estimatedQuantity, notes, contactInfo, priority } = req.body;
    
    // Validation
    if (!date || !time || !location?.address || !wasteTypes?.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: date, time, location, and waste types'
      });
    }

    // Check if user is volunteer
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Only volunteers can create pickup requests'
      });
    }

    // Create pickup
    const pickup = new Pickup({
      requestedBy: req.user._id,
      date: new Date(date),
      time,
      location,
      wasteTypes,
      estimatedQuantity: estimatedQuantity || 0,
      notes: notes || '',
      contactInfo: {
        phone: contactInfo?.phone || req.user.phone,
        alternatePhone: contactInfo?.alternatePhone || '',
        contactPerson: contactInfo?.contactPerson || req.user.name
      },
      priority: priority || 'medium'
    });

    await pickup.save();
    
    // Populate user details
    await pickup.populate('requestedBy', 'name email phone');

    // Notify all NGOs about new pickup request
    const ngos = await User.find({ role: 'ngo' }).select('_id');
    ngos.forEach(ngo => {
      io.to(`user_${ngo._id}`).emit('newPickupRequest', {
        pickup: pickup,
        message: `New pickup request from ${req.user.name}`
      });
    });

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Error creating pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get all pickups for the current user
// @route   GET /api/pickups
// @access  Private
const getMyPickups = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'volunteer') {
      query.requestedBy = req.user._id;
    } else if (req.user.role === 'ngo') {
      query.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null, status: 'pending' } // Show pending requests for NGO to accept
      ];
    } else if (req.user.role === 'admin') {
      // Admin can see all pickups
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'requestedBy', select: 'name email phone' },
        { path: 'assignedTo', select: 'name email phone organizationName' },
        { path: 'agent', select: 'name email phone' }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pickups = await Pickup.find(query)
      .populate('requestedBy', 'name email phone')
      .populate('assignedTo', 'name email phone organizationName')
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Pickup.countDocuments(query);
    
    const result = {
      docs: pickups,
      totalDocs: total,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get pickup by ID
// @route   GET /api/pickups/:id
// @access  Private
const getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('assignedTo', 'name email phone organizationName')
      .populate('agent', 'name email phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if user has permission to view this pickup
    const hasPermission = 
      pickup.requestedBy._id.toString() === req.user._id.toString() ||
      pickup.assignedTo?._id?.toString() === req.user._id.toString() ||
      pickup.agent?._id?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this pickup'
      });
    }

    res.status(200).json({
      success: true,
      data: pickup
    });

  } catch (error) {
    console.error('Error fetching pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Update pickup
// @route   PUT /api/pickups/:id
// @access  Private
const updatePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check permissions
    const canEdit = 
      pickup.requestedBy.toString() === req.user._id.toString() ||
      pickup.assignedTo?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pickup'
      });
    }

    // Check if pickup can be edited
    if (!pickup.canBeEdited()) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit pickup in ${pickup.status} status`
      });
    }

    // Update allowed fields
    const allowedUpdates = ['date', 'time', 'location', 'wasteTypes', 'estimatedQuantity', 'notes', 'contactInfo', 'priority'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedPickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('requestedBy assignedTo agent', 'name email phone organizationName');

    // Notify relevant users about update
    const notificationData = {
      pickup: updatedPickup,
      message: 'Pickup request has been updated',
      updatedBy: req.user.name
    };

    // Notify NGO and agent if assigned
    if (updatedPickup.assignedTo) {
      io.to(`user_${updatedPickup.assignedTo._id}`).emit('pickupUpdated', notificationData);
    }
    if (updatedPickup.agent) {
      io.to(`user_${updatedPickup.agent._id}`).emit('pickupUpdated', notificationData);
    }

    res.status(200).json({
      success: true,
      message: 'Pickup updated successfully',
      data: updatedPickup
    });

  } catch (error) {
    console.error('Error updating pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Accept pickup request (NGO only)
// @route   POST /api/pickups/:id/accept
// @access  Private (NGO)
const acceptPickup = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can accept pickup requests'
      });
    }

    const pickup = await Pickup.findById(req.params.id)
      .populate('requestedBy', 'name email phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    if (pickup.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending pickups can be accepted'
      });
    }

    pickup.assignedTo = req.user._id;
    pickup.status = 'accepted';
    await pickup.save();

    await pickup.populate('assignedTo', 'name email phone organizationName');

    // Notify volunteer
    io.to(`user_${pickup.requestedBy._id}`).emit('pickupAccepted', {
      pickup: pickup,
      message: `Your pickup request has been accepted by ${req.user.organizationName || req.user.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Pickup request accepted successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Error accepting pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Assign agent to pickup (NGO only)
// @route   POST /api/pickups/:id/assign-agent
// @access  Private (NGO)
const assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;

    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can assign agents'
      });
    }

    const pickup = await Pickup.findById(req.params.id)
      .populate('requestedBy', 'name email phone');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    if (pickup.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign agents to your accepted pickups'
      });
    }

    if (pickup.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign agents to accepted pickups'
      });
    }

    // Verify agent exists and belongs to the same NGO
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    pickup.agent = agentId;
    pickup.status = 'assigned';
    await pickup.save();

    await pickup.populate('agent', 'name email phone');

    // Notify volunteer and agent
    const notificationData = {
      pickup: pickup,
      message: `Agent ${agent.name} has been assigned to your pickup`
    };

    io.to(`user_${pickup.requestedBy._id}`).emit('agentAssigned', notificationData);
    io.to(`user_${agentId}`).emit('pickupAssigned', {
      ...notificationData,
      message: `You have been assigned to a pickup at ${pickup.location.address}`
    });

    res.status(200).json({
      success: true,
      message: 'Agent assigned successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Error assigning agent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Cancel pickup
// @route   POST /api/pickups/:id/cancel
// @access  Private
const cancelPickup = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const pickup = await Pickup.findById(req.params.id)
      .populate('requestedBy assignedTo agent', 'name email phone organizationName');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check permissions
    const canCancel = 
      pickup.requestedBy._id.toString() === req.user._id.toString() ||
      pickup.assignedTo?._id?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this pickup'
      });
    }

    if (!pickup.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel pickup in ${pickup.status} status`
      });
    }

    pickup.status = 'cancelled';
    pickup.rejectionReason = reason || 'No reason provided';
    await pickup.save();

    // Notify all relevant parties
    const notificationData = {
      pickup: pickup,
      message: `Pickup has been cancelled by ${req.user.name}`,
      reason: reason
    };

    [pickup.requestedBy, pickup.assignedTo, pickup.agent].forEach(user => {
      if (user && user._id.toString() !== req.user._id.toString()) {
        io.to(`user_${user._id}`).emit('pickupCancelled', notificationData);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Pickup cancelled successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Error cancelling pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Update pickup status (Agent only)
// @route   POST /api/pickups/:id/status
// @access  Private (Agent)
const updatePickupStatus = async (req, res) => {
  try {
    const { status, notes, actualQuantity, photos } = req.body;
    
    const pickup = await Pickup.findById(req.params.id)
      .populate('requestedBy assignedTo agent', 'name email phone organizationName');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if user is the assigned agent
    if (pickup.agent?._id?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only assigned agents can update pickup status'
      });
    }

    const validStatusTransitions = {
      'assigned': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled']
    };

    if (!validStatusTransitions[pickup.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${pickup.status} to ${status}`
      });
    }

    pickup.status = status;

    if (status === 'completed') {
      pickup.completionDetails = {
        actualQuantity: actualQuantity || 0,
        completedAt: new Date(),
        completionNotes: notes || '',
        photos: photos || []
      };
    }

    if (notes) {
      pickup.tracking.agentNotes = notes;
    }

    await pickup.save();

    // Notify relevant parties
    const notificationData = {
      pickup: pickup,
      message: `Pickup status updated to ${status}`,
      updatedBy: req.user.name
    };

    [pickup.requestedBy, pickup.assignedTo].forEach(user => {
      if (user) {
        io.to(`user_${user._id}`).emit('pickupStatusUpdated', notificationData);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Pickup status updated successfully',
      data: pickup
    });

  } catch (error) {
    console.error('Error updating pickup status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get pickup statistics
// @route   GET /api/pickups/stats
// @access  Private
const getPickupStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    // Filter based on user role
    if (req.user.role === 'volunteer') {
      matchQuery.requestedBy = req.user._id;
    } else if (req.user.role === 'ngo') {
      matchQuery.assignedTo = req.user._id;
    }

    const stats = await Pickup.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$estimatedQuantity' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      accepted: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
      totalQuantity: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats.totalQuantity += stat.totalQuantity;
      
      if (stat._id === 'in-progress') {
        formattedStats.inProgress = stat.count;
      } else {
        formattedStats[stat._id] = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching pickup stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createPickup,
  getMyPickups,
  getPickupById,
  updatePickup,
  acceptPickup,
  assignAgent,
  cancelPickup,
  updatePickupStatus,
  getPickupStats
};
