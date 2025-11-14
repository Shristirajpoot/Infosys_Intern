const User = require("../models/user.model");
const Opportunity = require('../models/opportunity.model');
const Application = require('../models/application.model');

// Get user profile (works for all roles)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// Update user profile (works for all roles)
const updateProfile = async (req, res) => {
  try {
  const { name, email, location, bio, skills, profileImage, bannerImage } = req.body;
    const update = {};
    
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (location !== undefined) update.location = location;
    if (bio !== undefined) update.bio = bio;
    if (skills !== undefined) update.skills = skills;
  if (profileImage !== undefined) update.profileImage = profileImage;
  if (bannerImage !== undefined) update.bannerImage = bannerImage;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUser = req.user;

        let allowedRoles = [];
        
        // Define role-based communication rules
        if (loggedInUser.role === 'ngo') {
            // NGOs can communicate with volunteers and admins
            allowedRoles = ['volunteer', 'admin'];
        } else if (loggedInUser.role === 'volunteer') {
            // Volunteers can communicate with NGOs and admins
            allowedRoles = ['ngo', 'admin'];
        } else if (loggedInUser.role === 'admin') {
            // Admins can communicate with everyone
            allowedRoles = ['volunteer', 'ngo', 'admin'];
        }

        // Find users with allowed roles, excluding the logged-in user
        const allUsers = await User.find({ 
            _id: { $ne: loggedInUserId },
            role: { $in: allowedRoles }
        }).select("-password");

        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Admin Analytics Functions

// Get Overall Platform Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all platform data
    const [
      totalUsers,
      totalNGOs,
      totalVolunteers,
      totalEvents,
      activeEvents,
      completedEvents,
      totalApplications,
      acceptedApplications,
      pendingApplications,
      rejectedApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: 'active' }),
      Opportunity.countDocuments({ status: 'completed' }),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ status: 'accepted', createdAt: { $gte: startDate } }),
      Application.countDocuments({ status: 'pending', createdAt: { $gte: startDate } }),
      Application.countDocuments({ status: 'rejected', createdAt: { $gte: startDate } })
    ]);

    // Calculate environmental impact
    const totalVolunteerHours = acceptedApplications * 4;
    const wasteCollected = acceptedApplications * 15;
    const treesPlanted = Math.floor(acceptedApplications * 0.8);
    const co2Saved = Math.floor(wasteCollected * 0.5);

    // Monthly user growth
    const userGrowthData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
      
      const [newUsers, newNGOs, newVolunteers] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } }),
        User.countDocuments({ role: 'ngo', createdAt: { $gte: monthStart, $lte: monthEnd } }),
        User.countDocuments({ role: 'volunteer', createdAt: { $gte: monthStart, $lte: monthEnd } })
      ]);
      
      userGrowthData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        users: newUsers,
        ngos: newNGOs,
        volunteers: newVolunteers
      });
    }

    // Event activity data
    const eventActivityData = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
      
      const [eventsCreated, applications] = await Promise.all([
        Opportunity.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } }),
        Application.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } })
      ]);
      
      eventActivityData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        events: eventsCreated,
        applications: applications
      });
    }

    // NGO performance data
    const topNGOs = await Opportunity.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'opportunityId',
          as: 'applications'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'ngoDetails'
        }
      },
      {
        $group: {
          _id: '$createdBy',
          ngoName: { 
            $first: { 
              $ifNull: [
                { $arrayElemAt: ['$ngoDetails.name', 0] },
                { $arrayElemAt: ['$ngoDetails.fullName', 0] }
              ]
            }
          },
          ngoEmail: { $first: { $arrayElemAt: ['$ngoDetails.email', 0] } },
          totalEvents: { $sum: 1 },
          totalApplications: { $sum: { $size: '$applications' } },
          acceptedApplications: {
            $sum: {
              $size: {
                $filter: {
                  input: '$applications',
                  cond: { $eq: ['$$this.status', 'accepted'] }
                }
              }
            }
          }
        }
      },
      { $sort: { totalEvents: -1 } },
      { $limit: 5 }
    ]);

    // Category distribution
    const categoryData = await Opportunity.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryDistribution = categoryData.map(cat => ({
      name: cat._id || 'Other',
      value: cat.count,
      percentage: Math.round((cat.count / totalEvents) * 100) || 0
    }));

    // Platform Growth Data - Daily login and user statistics
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    const [usersToday, usersYesterday, newUsersToday] = await Promise.all([
      User.countDocuments(),  // Total users (simulating "logged in today")
      User.countDocuments({ createdAt: { $lt: todayStart } }), // Users before today
      User.countDocuments({ createdAt: { $gte: todayStart } }) // New users today
    ]);
    
    const platformGrowth = {
      totalUsers: usersToday,
      newUsers: newUsersToday,
      oldUsers: usersYesterday,
      growthRate: usersYesterday > 0 ? ((usersToday - usersYesterday) / usersYesterday * 100).toFixed(1) : '0'
    };

    // Comprehensive Recent Platform Activities
    const activities = [];

    // Get recent events created (last 20)
    const recentEvents = await Opportunity.find()
      .populate('createdBy', 'name fullName email role')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get recent applications (last 20)
    const recentApplications = await Application.find()
      .populate({
        path: 'volunteerId',
        select: 'name fullName email role',
        model: 'User'
      })
      .populate({
        path: 'opportunityId', 
        select: 'title category createdBy',
        model: 'Opportunity'
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get recent user registrations (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Add event creation activities
    recentEvents.forEach(event => {
      if (event.createdBy) {
        activities.push({
          id: `event-${event._id}`,
          type: 'Event Created',
          description: `${event.createdBy.name || event.createdBy.fullName || 'NGO'} created event "${event.title}"`,
          user: event.createdBy.name || event.createdBy.fullName || 'NGO',
          userRole: event.createdBy.role || 'ngo',
          event: event.title,
          category: event.category || 'Other',
          status: event.status || 'active',
          date: event.createdAt,
          icon: 'calendar'
        });
      }
    });

    // Add application activities
    recentApplications
      .filter(app => app.volunteerId && app.opportunityId)
      .forEach(app => {
        const actionText = app.status === 'accepted' ? 'accepted to' : 
                          app.status === 'rejected' ? 'was rejected from' : 'applied for';
        
        activities.push({
          id: `app-${app._id}`,
          type: 'Application',
          description: `${app.volunteerId.name || app.volunteerId.fullName || 'Volunteer'} ${actionText} "${app.opportunityId.title}"`,
          user: app.volunteerId.name || app.volunteerId.fullName || 'Volunteer',
          userRole: app.volunteerId.role || 'volunteer',
          event: app.opportunityId.title,
          category: app.opportunityId.category || 'Other',
          status: app.status,
          date: app.createdAt,
          icon: app.status === 'accepted' ? 'check' : app.status === 'rejected' ? 'x' : 'user'
        });
      });

    // Add user registration activities
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'User Registration',
        description: `${user.name || user.fullName || 'New user'} joined as ${user.role}`,
        user: user.name || user.fullName || 'New user',
        userRole: user.role,
        event: 'Platform',
        category: 'Registration',
        status: 'completed',
        date: user.createdAt,
        icon: 'userPlus'
      });
    });

    // Sort all activities by date and take the most recent 15
    const recentActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);

    // Transform data for frontend compatibility
    const monthlyData = (eventActivityData || []).map((item, index) => ({
      month: item?.month || 'N/A',
      events: item?.events || 0,
      applications: item?.applications || 0,
      accepted: Math.floor((item?.applications || 0) * 0.7), // Estimate 70% acceptance rate
      volunteers: userGrowthData?.[index]?.volunteers || 0,
      waste: (item?.events || 0) * 15, // Estimate 15kg waste per event
      hours: (item?.events || 0) * 4 // Estimate 4 hours per event
    }));

    // Transform category distribution to activity type data format
    const activityTypeData = (categoryDistribution || []).map(cat => ({
      name: cat?.name || 'Other',
      value: cat?.percentage || 0,
      count: cat?.value || 0
    }));

    // Keep original topNGOs data AND create topVolunteers format for compatibility
    const topNGOsData = (topNGOs || []).map((ngo) => ({
      id: ngo._id,
      name: ngo?.ngoName || 'Unknown NGO',
      email: ngo?.ngoEmail || 'No email',
      totalEvents: ngo?.totalEvents || 0,
      totalApplications: ngo?.totalApplications || 0,
      acceptedApplications: ngo?.acceptedApplications || 0
    }));

    // Transform top NGOs to top volunteers format for backward compatibility
    const topVolunteers = (topNGOs || []).map((ngo, index) => ({
      id: ngo._id || (index + 1),
      name: ngo?.ngoName || 'Unknown NGO',
      eventsParticipated: ngo?.totalEvents || 0,
      totalHours: (ngo?.totalEvents || 0) * 4 // Estimate 4 hours per event
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalNGOs,
          totalVolunteers,
          totalEvents,
          activeEvents,
          completedEvents,
          totalApplications,
          acceptedApplications,
          pendingApplications,
          rejectedApplications,
          totalVolunteerHours,
          wasteCollected,
          treesPlanted,
          co2Saved
        },
        platformGrowth,
        monthlyData,
        activityTypeData,
        topVolunteers,
        topNGOs: topNGOsData,
        recentActivities,
        userGrowthData,
        eventActivityData,
        categoryDistribution,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin analytics'
    });
  }
};

// Get NGO Analytics for Admin
const getNGOAnalytics = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const { timeRange = 'month' } = req.query;

    // Get NGO details
    const ngo = await User.findById(ngoId).select('name fullName email createdAt bio role');
    
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get NGO's events and applications
    const ngoEvents = await Opportunity.find({ createdBy: ngoId });
    const eventIds = ngoEvents.map(event => event._id);
    
    const applications = await Application.find({
      opportunityId: { $in: eventIds },
      createdAt: { $gte: startDate }
    }).populate('volunteerId', 'name fullName email')
      .populate('opportunityId', 'title category date location');

    // Calculate statistics
    const totalEvents = ngoEvents.length;
    const activeEvents = ngoEvents.filter(event => event.status === 'active').length;
    const completedEvents = ngoEvents.filter(event => event.status === 'completed').length;
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

    // Get unique volunteers
    const uniqueVolunteers = await Application.distinct('volunteerId', {
      opportunityId: { $in: eventIds },
      status: 'accepted'
    });

    const totalVolunteers = uniqueVolunteers.length;
    const totalVolunteerHours = acceptedApplications * 4;
    const wasteCollected = acceptedApplications * 15;
    const treesPlanted = Math.floor(acceptedApplications * 0.8);
    const co2Saved = Math.floor(wasteCollected * 0.5);

    // Generate monthly activity data for charts
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
      
      // Get events created in this month
      const monthEvents = ngoEvents.filter(event => 
        event.createdAt >= monthStart && event.createdAt <= monthEnd
      );
      
      // Get applications for this month
      const monthApplications = applications.filter(app => 
        app.createdAt >= monthStart && app.createdAt <= monthEnd
      );
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        events: monthEvents.length,
        applications: monthApplications.length,
        accepted: monthApplications.filter(app => app.status === 'accepted').length,
        volunteers: monthApplications.filter(app => app.status === 'accepted').length, // Unique volunteers for this month
        waste: monthEvents.length * 15, // Estimate waste collected per event
        hours: monthApplications.filter(app => app.status === 'accepted').length * 4 // Hours per accepted application
      });
    }

    // Generate activity type data (categories of events)
    const categoryCount = {};
    ngoEvents.forEach(event => {
      const category = event.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const activityTypeData = Object.entries(categoryCount).map(([category, count]) => ({
      name: category,
      value: Math.round((count / totalEvents) * 100) || 0,
      count: count
    }));

    // Enhanced recent activities - include both events and applications
    const recentActivities = [];
    
    // Add recent events created
    ngoEvents.slice(0, 5).forEach(event => {
      recentActivities.push({
        id: event._id,
        type: 'Event Created',
        event: event.title,
        status: event.status,
        date: event.createdAt,
        location: event.location || 'Unknown'
      });
    });
    
    // Add recent applications
    applications.slice(0, 5).forEach(app => {
      if (app.volunteerId && app.opportunityId) {
        recentActivities.push({
          id: app._id,
          type: 'Application',
          user: app.volunteerId?.name || app.volunteerId?.fullName || 'Unknown',
          event: app.opportunityId?.title || 'Unknown Event',
          status: app.status,
          date: app.createdAt,
          location: app.opportunityId?.location || 'Unknown'
        });
      }
    });
    
    // Sort by date and limit to 10 most recent
    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivities = recentActivities.slice(0, 10);

    res.json({
      success: true,
      data: {
        ngo: {
          id: ngo._id,
          name: ngo.name || ngo.fullName,
          email: ngo.email,
          joinDate: ngo.createdAt,
          bio: ngo.bio || 'No bio available'
        },
        stats: {
          totalEvents,
          activeEvents,
          completedEvents,
          totalApplications,
          acceptedApplications,
          pendingApplications,
          rejectedApplications,
          totalVolunteers,
          totalVolunteerHours,
          wasteCollected,
          treesPlanted,
          co2Saved,
          impactScore: Math.floor((totalEvents * 50) + (totalVolunteerHours * 10) + (wasteCollected * 2))
        },
        overview: {
          totalEvents,
          activeEvents,
          completedEvents,
          totalApplications,
          acceptedApplications,
          pendingApplications,
          rejectedApplications,
          totalVolunteers,
          totalVolunteerHours,
          wasteCollected,
          treesPlanted,
          co2Saved
        },
        monthlyData,
        activityTypeData,
        recentActivities: limitedActivities,
        events: ngoEvents.slice(0, 10).map(event => ({
          id: event._id,
          title: event.title,
          date: event.date,
          category: event.category,
          status: event.status,
          capacity: event.capacity,
          location: event.location
        })),
        recentApplications: applications.slice(0, 10).map(app => ({
          id: app._id,
          volunteer: app.volunteerId?.name || app.volunteerId?.fullName || 'Unknown',
          event: app.opportunityId?.title || 'Unknown Event',
          status: app.status,
          date: app.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching NGO analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NGO analytics'
    });
  }
};

// Get Volunteer Analytics for Admin
const getVolunteerAnalyticsForAdmin = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Get volunteer details
    const volunteer = await User.findById(volunteerId)
      .select('name fullName email createdAt skills location bio role');
    
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Get volunteer's applications
    const applications = await Application.find({ volunteerId })
      .populate('opportunityId', 'title date category location createdBy')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    const hoursVolunteered = acceptedApplications * 4;
    const wasteCollected = acceptedApplications * 15;
    const treesPlanted = Math.floor(acceptedApplications * 0.8);
    const co2Saved = Math.floor(wasteCollected * 0.5);

    // Calculate impact score
    const impactScore = (acceptedApplications * 50) + (hoursVolunteered * 10) + (wasteCollected * 2);

    // Get NGOs worked with
    const ngoIds = [...new Set(applications
      .filter(app => app.status === 'accepted')
      .map(app => app.opportunityId?.createdBy?.toString())
      .filter(Boolean))];
    
    const ngosWorkedWith = await User.find({
      _id: { $in: ngoIds }
    }).select('name fullName email').limit(5);

    res.json({
      success: true,
      data: {
        volunteer: {
          id: volunteer._id,
          name: volunteer.name || volunteer.fullName,
          email: volunteer.email,
          joinDate: volunteer.createdAt,
          skills: volunteer.skills || [],
          location: volunteer.location || 'Not specified',
          bio: volunteer.bio || 'No bio available'
        },
        stats: {
          totalApplications,
          acceptedApplications,
          pendingApplications,
          rejectedApplications,
          hoursVolunteered,
          wasteCollected,
          treesPlanted,
          co2Saved,
          impactScore
        },
        ngosWorkedWith,
        recentApplications: applications.slice(0, 10).map(app => ({
          id: app._id,
          event: app.opportunityId?.title || 'Unknown Event',
          date: app.opportunityId?.date || new Date(),
          status: app.status,
          location: app.opportunityId?.location || 'Unknown',
          appliedDate: app.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer analytics for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer analytics'
    });
  }
};

// Get available agents (volunteers who can be assigned to pickups)
const getAgents = async (req, res) => {
  try {
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs and admins can access agent list'
      });
    }

    // Get volunteers who can act as agents for pickups
    const agents = await User.find({ 
      role: 'volunteer'
    })
      .select('name email phone location skills')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents'
    });
  }
};

module.exports = {
    getProfile,
    updateProfile,
    getUsersForSidebar,
    getAdminAnalytics,
    getNGOAnalytics,
    getVolunteerAnalyticsForAdmin,
    getAgents,
};
