// routes/volunteer.routes.js
const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/protectRoute');
const {
  getAllOpportunities,
  getOpportunityById,
  applyForOpportunity,
  getMyApplications,
  withdrawApplication,
  getDashboardStats,
  getAnalytics,
  getProfile,
  updateProfile,
  initiateEmailChange,
  verifyEmailChange,
  resendEmailChangeOtp,
  getNotifications
} = require('../controllers/volunteer.controller');

// Enforce real authentication (JWT via cookie). No fallback user so each session is distinct.
router.use(protectRoute);

// Dashboard route
router.get('/dashboard-stats', getDashboardStats);

// Analytics route
router.get('/analytics', getAnalytics);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/email-change', initiateEmailChange);
router.post('/profile/email-change/verify', verifyEmailChange);
router.post('/profile/email-change/resend', resendEmailChangeOtp);

// Opportunity routes
router.get('/opportunities', getAllOpportunities);
router.get('/opportunities/:opportunityId', getOpportunityById);
router.post('/opportunities/:opportunityId/apply', applyForOpportunity);

// Application management routes
router.get('/applications', getMyApplications);
router.put('/applications/:applicationId/withdraw', withdrawApplication);

// Notifications route
router.get('/notifications', getNotifications);

module.exports = router;
