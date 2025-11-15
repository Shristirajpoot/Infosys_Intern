const express = require('express');
const {
  createPickup,
  getMyPickups,
  getPickupById,
  updatePickup,
  acceptPickup,
  assignAgent,
  cancelPickup,
  updatePickupStatus,
  getPickupStats
} = require('../controllers/pickup.controller.js');
const protectRoute = require('../middleware/protectRoute.js');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// @desc    Get pickup statistics
// @route   GET /api/pickups/stats
// @access  Private
router.get('/stats', getPickupStats);

// @desc    Get all pickups for current user
// @route   GET /api/pickups
// @access  Private
router.get('/', getMyPickups);

// @desc    Create new pickup request
// @route   POST /api/pickups
// @access  Private (Volunteers only)
router.post('/', createPickup);

// @desc    Get pickup by ID
// @route   GET /api/pickups/:id
// @access  Private
router.get('/:id', getPickupById);

// @desc    Update pickup
// @route   PUT /api/pickups/:id
// @access  Private
router.put('/:id', updatePickup);

// @desc    Accept pickup request
// @route   POST /api/pickups/:id/accept
// @access  Private (NGO only)
router.post('/:id/accept', acceptPickup);

// @desc    Assign agent to pickup
// @route   POST /api/pickups/:id/assign-agent
// @access  Private (NGO only)
router.post('/:id/assign-agent', assignAgent);

// @desc    Cancel pickup
// @route   POST /api/pickups/:id/cancel
// @access  Private
router.post('/:id/cancel', cancelPickup);

// @desc    Update pickup status
// @route   POST /api/pickups/:id/status
// @access  Private (Agent only)
router.post('/:id/status', updatePickupStatus);

module.exports = router;
