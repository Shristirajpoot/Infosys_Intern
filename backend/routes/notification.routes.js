const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notification.controller');
const protectRoute = require('../middleware/protectRoute');

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get notifications for the authenticated user
router.get('/', getNotifications);

// Mark specific notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
