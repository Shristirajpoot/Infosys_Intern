const express = require("express");
const protectRoute = require("../middleware/protectRoute.js");
const { 
  getProfile,
  updateProfile,
  getUsersForSidebar, 
  getAdminAnalytics, 
  getNGOAnalytics, 
  getVolunteerAnalyticsForAdmin,
  getAgents 
} = require("../controllers/user.controller.js");

const router = express.Router();

// Middleware to check if user is admin
const requireAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Profile routes (available to all authenticated users)
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);

// This route will be protected, meaning you must be logged in to see other users
router.get("/", protectRoute, getUsersForSidebar);

// Admin analytics routes
router.get("/admin/analytics", protectRoute, requireAdminRole, getAdminAnalytics);
router.get("/admin/analytics/ngo/:ngoId", protectRoute, requireAdminRole, getNGOAnalytics);
router.get("/admin/analytics/volunteer/:volunteerId", protectRoute, requireAdminRole, getVolunteerAnalyticsForAdmin);

// Get available agents (for NGOs to assign to pickups)
router.get("/agents", protectRoute, getAgents);

module.exports = router;
