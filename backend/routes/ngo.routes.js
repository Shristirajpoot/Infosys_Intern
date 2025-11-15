// routes/ngo.routes.js
const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getDashboardStats,
  getRecentActivities,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  reviewApplication,
  getMyVolunteers,
  getVolunteerDetails,
  sendMessageToVolunteer,
  getEventReport,
  getVolunteerReport,
  getEventAttendance,
  markAttendance,
  markAllPresent,
  exportAttendanceReport,
  getAnalyticsData,
  getVolunteerAnalytics
} = require('../controllers/ngo.controller');

const protectRoute = require('../middleware/protectRoute');

// --------------------
// Apply authentication middleware to all routes
// --------------------
router.use(protectRoute);

// Optional: Add role-based access control middleware
const requireNGORole = (req, res, next) => {
  if (!req.user.role || req.user.role !== 'ngo') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. NGO role required.'
    });
  }
  next();
};

// Uncomment for production to enforce NGO role
// router.use(requireNGORole);

// --------------------
// Test route to verify server is working
// --------------------
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'NGO routes working', user: req.user });
});

// --------------------
// Profile routes
// --------------------
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// --------------------
// Dashboard routes
// --------------------
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/activities', getRecentActivities);

// --------------------
// Event management routes
// --------------------
router.get('/events', getMyEvents); // Fetch real events from DB
router.post('/events', createEvent); // Create new event
router.put('/events/:eventId', updateEvent); // Update event
router.delete('/events/:eventId', deleteEvent); // Delete event

// Registrations for a specific event
router.get('/events/:eventId/registrations', getEventRegistrations); // Fetch real applications

// Review volunteer applications (accept/reject/withdraw)
router.post('/events/:eventId/registrations/:registrationId/review', reviewApplication);

// --------------------
// Volunteer management routes
// --------------------
router.get('/volunteers', getMyVolunteers); // Fetch all volunteers linked to NGO events
router.get('/volunteers/:volunteerId', getVolunteerDetails); // Fetch volunteer details
router.post('/volunteers/:volunteerId/message', sendMessageToVolunteer); // Send message

// --------------------
// Reports routes
// --------------------
router.get('/reports/event/:eventId', getEventReport); // Event-specific report
router.get('/reports/volunteers', getVolunteerReport); // Aggregate volunteer report

// --------------------
// Attendance management routes
// --------------------
router.get('/events/:eventId/attendance', getEventAttendance); // Fetch attendance for event
router.post('/events/:eventId/attendance/:volunteerId', markAttendance); // Mark single volunteer
router.post('/events/:eventId/attendance/mark-all-present', markAllPresent); // Mark all present
router.get('/events/:eventId/attendance/export', exportAttendanceReport); // Export CSV report

// --------------------
// Analytics routes
// --------------------
router.get('/analytics', getAnalyticsData); // NGO-level analytics
router.get('/analytics/volunteer/:volunteerId', getVolunteerAnalytics); // Volunteer analytics

module.exports = router;
