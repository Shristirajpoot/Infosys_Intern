const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAllUsers,
  getUserDetails,
  toggleUserBlock,
  getAdminConversations,
  startConversation,
  sendMessage,
  getConversationMessages,
  getPlatformStats,
  getWasteCollectionReport
} = require('../controllers/admin.controller');
const protectRoute = require('../middleware/protectRoute');

// Middleware to ensure only admins can access these routes
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Apply protection and admin check to all routes
router.use(protectRoute);
router.use(adminOnly);

// Analytics routes
router.get('/analytics', getDashboardAnalytics);
router.get('/stats', getPlatformStats);
router.get('/reports/waste-collection', getWasteCollectionReport);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/toggle-block', toggleUserBlock);

// Chat/messaging routes
router.get('/conversations', getAdminConversations);
router.post('/conversations/:userId', startConversation);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

module.exports = router;
