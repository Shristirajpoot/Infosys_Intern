const User = require('../models/user.model');
const Opportunity = require('../models/opportunity.model');
const Application = require('../models/application.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

// Generate waste collection trends data for charts with period support
const generateWasteCollectionTrends = (period = 'month') => {
  const now = new Date();
  const data = [];
  let days, dateFormat;
  
  // Configure data range and format based on period
  switch (period.toLowerCase()) {
    case 'week':
      days = 7;
      dateFormat = { weekday: 'short' };
      break;
    case 'year':
      days = 365;
      dateFormat = { month: 'short', year: '2-digit' };
      break;
    case 'month':
    default:
      days = 30;
      dateFormat = { month: 'short', day: 'numeric' };
      break;
  }
  
  // Generate data for the specified period
  if (period.toLowerCase() === 'year') {
    // For yearly data, generate 12 monthly data points
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      // Generate realistic waste collection data with some randomness
      let baseCollected = 450 + Math.random() * 300; // 450-750 kg base
      baseCollected *= 30; // Monthly totals for yearly view
      
      const recycledRatio = 0.6 + Math.random() * 0.2; // 60-80% recycling rate
      const organicRatio = 0.3 + Math.random() * 0.15; // 30-45% organic waste
      
      const collected = Math.round(baseCollected);
      const recycled = Math.round(collected * recycledRatio);
      const organic = Math.round(collected * organicRatio);
      
      data.push({
        date: date.toLocaleDateString('en-US', dateFormat),
        collected,
        recycled,
        organic
      });
    }
  } else {
    // For week/month data, generate daily data points
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic waste collection data with some randomness
      let baseCollected = 450 + Math.random() * 300; // 450-750 kg base
      
      // Adjust base amount for different periods
      if (period.toLowerCase() === 'week') {
        baseCollected *= 0.8; // Slightly less for weekly view
      }
      
      const recycledRatio = 0.6 + Math.random() * 0.2; // 60-80% recycling rate
      const organicRatio = 0.3 + Math.random() * 0.15; // 30-45% organic waste
      
      const collected = Math.round(baseCollected);
      const recycled = Math.round(collected * recycledRatio);
      const organic = Math.round(collected * organicRatio);
      
      data.push({
        date: date.toLocaleDateString('en-US', dateFormat),
        collected,
        recycled,
        organic
      });
    }
  }
  
  return data;
};

// Get waste collection report with period filtering
const getWasteCollectionReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Validate period parameter
    const validPeriods = ['week', 'month', 'year'];
    if (!validPeriods.includes(period.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Must be one of: week, month, year'
      });
    }

    const wasteData = generateWasteCollectionTrends(period);
    
    res.json({
      success: true,
      data: wasteData,
      period,
      message: `Waste collection trends for ${period}`
    });
  } catch (error) {
    console.error('Error generating waste collection report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate waste collection report'
    });
  }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    // Get user counts by role
    const totalUsers = await User.countDocuments();
    const ngoCount = await User.countDocuments({ role: 'ngo' });
    const volunteerCount = await User.countDocuments({ role: 'volunteer' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Get opportunity statistics
    const totalOpportunities = await Opportunity.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({ status: 'active' });
    const completedOpportunities = await Opportunity.countDocuments({ status: 'completed' });
    
    // Get application statistics
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Get monthly user growth data
    const monthlyUserData = await User.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Calculate growth percentages
    const previousMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    
    const userGrowth = previousMonth > 0 ? 
      ((recentUsers - previousMonth) / previousMonth * 100).toFixed(1) : 
      recentUsers > 0 ? '100' : '0';
    
    // Get recent activities (last 10 activities)
    const recentActivities = [];
    
    // Get recent user registrations
    const recentUserRegistrations = await User.find({ 
      createdAt: { $gte: thirtyDaysAgo } 
    })
    .select('name role createdAt location')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get recent opportunities created
    const recentOpportunities = await Opportunity.find({ 
      createdAt: { $gte: thirtyDaysAgo } 
    })
    .populate('createdBy', 'name')
    .select('title createdBy createdAt location')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get recent applications
    const recentApplicationsData = await Application.find({ 
      createdAt: { $gte: thirtyDaysAgo } 
    })
    .populate('volunteerId', 'name location')
    .populate('opportunityId', 'title')
    .select('volunteerId opportunityId createdAt status')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Format recent activities
    recentUserRegistrations.forEach(user => {
      recentActivities.push({
        user: user.name,
        action: `Registered as ${user.role}`,
        time: getTimeAgo(user.createdAt),
        location: user.location || 'Unknown location',
        type: 'registration'
      });
    });
    
    recentOpportunities.forEach(opp => {
      recentActivities.push({
        user: opp.createdBy?.name || 'Unknown user',
        action: `Created opportunity "${opp.title}"`,
        time: getTimeAgo(opp.createdAt),
        location: opp.location || 'Unknown location',
        type: 'opportunity'
      });
    });
    
    recentApplicationsData.forEach(app => {
      recentActivities.push({
        user: app.volunteerId?.name || 'Unknown volunteer',
        action: `Applied for "${app.opportunityId?.title || 'Unknown opportunity'}"`,
        time: getTimeAgo(app.createdAt),
        location: app.volunteerId?.location || 'Unknown location',
        type: 'application'
      });
    });
    
    // Sort by date and limit to 10
    recentActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedActivities = recentActivities.slice(0, 10);

    res.json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          ngos: ngoCount,
          volunteers: volunteerCount,
          admins: adminCount,
          recentRegistrations: recentUsers,
          growthPercentage: userGrowth,
          dailyActive: Math.floor(totalUsers * 0.4), // Estimated daily active users
          newToday: Math.floor(recentUsers * 0.1) // Estimated new users today
        },
        opportunityStats: {
          total: totalOpportunities,
          active: activeOpportunities,
          completed: completedOpportunities
        },
        applicationStats: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications
        },
        recentActivity: limitedActivities,
        monthlyData: monthlyUserData,
        wasteCollectionTrends: generateWasteCollectionTrends() // Add waste collection data
      }
    });
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard analytics' 
    });
  }
};

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.isBlocked = status === 'blocked';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip value
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

// Get user details by ID
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get additional stats for the user
    let additionalStats = {};
    
    if (user.role === 'ngo') {
      const opportunities = await Opportunity.find({ createdBy: userId });
      const totalApplications = await Application.countDocuments({
        opportunity: { $in: opportunities.map(opp => opp._id) }
      });
      
      additionalStats = {
        opportunitiesCreated: opportunities.length,
        totalApplications,
        activeOpportunities: opportunities.filter(opp => opp.status === 'active').length
      };
    } else if (user.role === 'volunteer') {
      const applications = await Application.find({ volunteer: userId });
      const approvedApplications = applications.filter(app => app.status === 'approved');
      
      additionalStats = {
        totalApplications: applications.length,
        approvedApplications: approvedApplications.length,
        completedEvents: approvedApplications.length // Simplified for now
      };
    }
    
    res.json({
      success: true,
      data: {
        user,
        stats: additionalStats
      }
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user details' 
    });
  }
};

// Toggle user block/unblock status
const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Toggle block status
    user.isBlocked = !user.isBlocked;
    user.blockReason = user.isBlocked ? reason : null;
    user.blockedAt = user.isBlocked ? new Date() : null;
    user.blockedBy = user.isBlocked ? req.user._id : null;
    
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        userId: user._id,
        isBlocked: user.isBlocked,
        blockReason: user.blockReason
      }
    });
  } catch (error) {
    console.error('Error toggling user block status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
};

// Get admin conversations
const getAdminConversations = async (req, res) => {
  try {
    const adminId = req.user._id;
    
    const conversations = await Conversation.find({
      participants: adminId
    })
    .populate('participants', 'name email role profilePicture')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error getting admin conversations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversations' 
    });
  }
};

// Start conversation with user
const startConversation = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { userId } = req.params;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [adminId, userId] }
    });
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [adminId, userId]
      });
      await conversation.save();
    }
    
    // Populate the conversation
    await conversation.populate('participants', 'name email role profilePicture');
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start conversation' 
    });
  }
};

// Send message in conversation
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;
    
    // Verify conversation exists and admin is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }
    
    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      content
    });
    await message.save();
    
    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();
    
    // Populate message with sender info
    await message.populate('sender', 'name role');
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message' 
    });
  }
};

// Get messages in a conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify conversation exists and admin is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages' 
    });
  }
};

// Get platform statistics summary
const getPlatformStats = async (req, res) => {
  try {
    // Get current date for comparisons
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });
    const newUsersLastMonth = await User.countDocuments({ 
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
    });
    
    // Calculate user growth
    const userGrowth = newUsersLastMonth > 0 ? 
      ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1) : 
      newUsersThisMonth > 0 ? '100' : '0';
    
    // Opportunity statistics
    const totalOpportunities = await Opportunity.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({ status: 'active' });
    
    // Application statistics
    const totalApplications = await Application.countDocuments();
    const thisMonthApplications = await Application.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growthPercentage: userGrowth
        },
        opportunities: {
          total: totalOpportunities,
          active: activeOpportunities
        },
        applications: {
          total: totalApplications,
          thisMonth: thisMonthApplications
        },
        engagement: {
          applicationRate: totalUsers > 0 ? ((totalApplications / totalUsers) * 100).toFixed(1) : '0',
          averageOpportunitiesPerNgo: await calculateAverageOpportunities()
        }
      }
    });
  } catch (error) {
    console.error('Error getting platform stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform statistics' 
    });
  }
};

// Helper function to calculate average opportunities per NGO
const calculateAverageOpportunities = async () => {
  try {
    const ngoCount = await User.countDocuments({ role: 'ngo' });
    const opportunityCount = await Opportunity.countDocuments();
    return ngoCount > 0 ? (opportunityCount / ngoCount).toFixed(1) : '0';
  } catch (error) {
    return '0';
  }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};

module.exports = {
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
};
