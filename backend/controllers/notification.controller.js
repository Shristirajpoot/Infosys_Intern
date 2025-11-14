const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// Create a new notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'name email role')
      .populate('relatedEvent', 'title date location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + notifications.length < totalCount
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Helper function to create application received notification
const createApplicationReceivedNotification = async (applicationData) => {
  try {
    const { ngoId, volunteerId, eventId, volunteerName, eventTitle } = applicationData;
    
    await createNotification({
      recipient: ngoId,
      sender: volunteerId,
      type: 'application_received',
      title: 'New Application Received',
      message: `${volunteerName} has applied for your event "${eventTitle}"`,
      relatedEvent: eventId,
      relatedApplication: applicationData.applicationId,
      actionUrl: `/ngo-dashboard?tab=events&action=view-applications&eventId=${eventId}`
    });
  } catch (error) {
    console.error('Error creating application received notification:', error);
  }
};

// Helper function to create application status notification
const createApplicationStatusNotification = async (statusData) => {
  try {
    const { volunteerId, ngoId, eventId, applicationId, status, eventTitle, ngoName } = statusData;
    
    const statusMessages = {
      accepted: `Congratulations! Your application for "${eventTitle}" has been accepted by ${ngoName}`,
      rejected: `Your application for "${eventTitle}" was not selected this time. Thank you for your interest!`
    };

    await createNotification({
      recipient: volunteerId,
      sender: ngoId,
      type: status === 'accepted' ? 'application_approved' : 'application_rejected',
      title: status === 'accepted' ? 'Application Approved!' : 'Application Update',
      message: statusMessages[status],
      relatedEvent: eventId,
      relatedApplication: applicationId,
      actionUrl: `/volunteer-dashboard?tab=applications`
    });
  } catch (error) {
    console.error('Error creating application status notification:', error);
  }
};

// Helper function to create new event notification for volunteers
const createNewEventNotification = async (eventData) => {
  try {
    const { eventId, eventTitle, ngoName, ngoId, location, date } = eventData;
    
    // Get all volunteers from the database to notify them about new event
    const User = require('../models/user.model');
    const volunteers = await User.find({ role: 'volunteer' }).select('_id');
    
    // Create notifications for all volunteers
    const notificationPromises = volunteers.map(volunteer =>
      createNotification({
        recipient: volunteer._id,
        sender: ngoId,
        type: 'new_event',
        title: 'New Volunteer Opportunity',
        message: `${ngoName} has posted a new volunteer opportunity: "${eventTitle}" in ${location} on ${new Date(date).toLocaleDateString()}`,
        relatedEvent: eventId,
        actionUrl: `/volunteer-dashboard?tab=opportunities&eventId=${eventId}`
      })
    );

    await Promise.all(notificationPromises);
    console.log(`Created new event notifications for ${volunteers.length} volunteers`);
  } catch (error) {
    console.error('Error creating new event notifications:', error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createApplicationReceivedNotification,
  createApplicationStatusNotification,
  createNewEventNotification
};
