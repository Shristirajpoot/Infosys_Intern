// controllers/volunteer.controller.js
const User = require('../models/user.model');
const Opportunity = require('../models/opportunity.model');
const Application = require('../models/application.model');
const matchingService = require('../services/matchingService');
const { createApplicationReceivedNotification } = require('./notification.controller');
// Added profile handlers
 
// Get volunteer profile
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

// Update volunteer profile
const updateProfile = async (req, res) => {
  try {
  const { name, email, location, bio, skills, profileImage, bannerImage } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (location !== undefined) update.location = location;
    if (bio !== undefined) update.bio = bio;
  if (Array.isArray(skills)) update.skills = skills;
  if (profileImage !== undefined) update.profileImage = profileImage; // accept base64 / URL
  if (bannerImage !== undefined) update.bannerImage = bannerImage; // accept base64 / URL

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// --- Email Change Flow (OTP) ---
const { sendOtpEmail } = require('../utils/mailer');
let transporter;
// Email handled via utils/mailer

const initiateEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ success: false, message: 'New email required' });
    const normalized = newEmail.toLowerCase();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // If same as current email -> no change
    if (user.email === normalized) {
      return res.json({ success: true, message: 'Email unchanged' });
    }

    // If another user already owns it
    const existingOther = await User.findOne({ email: normalized, _id: { $ne: user._id } });
    if (existingOther) {
      return res.status(409).json({ success: false, message: 'Email already in use by another account' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.pendingEmail = normalized;
    user.emailChangeOtp = otp;
    user.emailChangeOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    console.log(`[email-change] OTP ${otp} generated for user ${user._id} -> ${normalized}`);
  await sendOtpEmail(newEmail, otp, { title: 'Confirm Your New Email', subject: 'Verify your new WasteZero email', variant: 'email-change' });
    res.json({ success: true, message: 'OTP sent to new email' });
  } catch (error) {
    console.error('Error initiating email change:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate email change' });
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.pendingEmail || !user.emailChangeOtp) {
      return res.status(400).json({ success: false, message: 'No pending email change' });
    }
    if (user.emailChangeOtpExpires < Date.now()) {
      user.pendingEmail = undefined;
      user.emailChangeOtp = undefined;
      user.emailChangeOtpExpires = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP expired. Start again.' });
    }
    if (user.emailChangeOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Email updated successfully', data: { email: user.email } });
  } catch (error) {
    console.error('Error verifying email change:', error);
    res.status(500).json({ success: false, message: 'Failed to verify email change' });
  }
};

// Resend OTP (if pending and not expired). If expired, generate new.
const resendEmailChangeOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({ success:false, message:'User not found'});
    if(!user.pendingEmail) return res.status(400).json({ success:false, message:'No pending email change'});
    const stillValid = user.emailChangeOtp && user.emailChangeOtpExpires && user.emailChangeOtpExpires > Date.now();
    if(!stillValid){
      user.emailChangeOtp = Math.floor(1000 + Math.random() * 9000).toString();
      user.emailChangeOtpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();
    }
  await sendOtpEmail(user.pendingEmail, user.emailChangeOtp, { title: 'Confirm Your New Email', subject: 'Your WasteZero email change OTP', variant: 'email-change' });
    res.json({ success:true, message:'OTP resent' });
  } catch(err){
    console.error('Error resending email change OTP:', err);
    res.status(500).json({ success:false, message:'Failed to resend OTP'});
  }
};

// Get all available opportunities
const getAllOpportunities = async (req, res) => {
  try {
    console.log('getAllOpportunities called'); // Debug log
    
    // Query parameters for filtering
  const { category, location, page = 1, limit = 10, includeMatched = 'true', q } = req.query;
    
    // Build query
    const query = {}; // Remove status filter to show all events
    if (category && category !== 'all') {
      query.category = category;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (q && String(q).trim().length > 0) {
      const text = String(q).trim();
      const regex = { $regex: text, $options: 'i' };
      // Search across multiple fields
      query.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { category: regex },
        { requiredSkills: regex },
        { wasteTypes: regex }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let allOpportunities = [];
    let matchedOpportunities = [];
    let regularOpportunities = [];
    
    // Get matched opportunities first if requested
    if (includeMatched === 'true' && req.user && req.user.id) {
      try {
        const matches = await matchingService.findMatchingOpportunities(req.user.id, 50);
        matchedOpportunities = matches.map(match => ({
          ...match.opportunity.toObject(),
          matchScore: match.score,
          matchReasons: match.matchReasons,
          isMatched: true
        }));
        console.log(`Found ${matchedOpportunities.length} matched opportunities`);
      } catch (error) {
        console.error('Error getting matched opportunities:', error);
        // Continue without matches if error occurs
      }
    }
    
    // Fetch all opportunities from database
    const dbOpportunities = await Opportunity.find(query)
      .populate('createdBy', 'name email profileImage')
      .sort({ createdAt: -1 });
    
    // Get IDs of matched opportunities to avoid duplicates
    const matchedIds = matchedOpportunities.map(op => op._id.toString());
    
    // Filter out already matched opportunities from regular list
    regularOpportunities = dbOpportunities
      .filter(op => !matchedIds.includes(op._id.toString()))
      .map(op => ({
        ...op.toObject(),
        isMatched: false
      }));
    
    // Combine matched opportunities first, then regular ones
    allOpportunities = [...matchedOpportunities, ...regularOpportunities];
    
    // Apply pagination to combined results
    const paginatedOpportunities = allOpportunities.slice(skip, skip + parseInt(limit));
    const totalOpportunities = allOpportunities.length;

    console.log(`Returning ${paginatedOpportunities.length} opportunities (${matchedOpportunities.length} matched, ${regularOpportunities.length} regular)`);

    res.json({
      success: true,
      data: paginatedOpportunities,
      meta: {
        matchedCount: matchedOpportunities.length,
        regularCount: regularOpportunities.length,
        totalCount: totalOpportunities
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOpportunities / parseInt(limit)),
        totalItems: totalOpportunities,
        hasNext: skip + paginatedOpportunities.length < totalOpportunities,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities',
      error: error.message
    });
  }
};

// Get single opportunity details
const getOpportunityById = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    
    const opportunity = await Opportunity.findById(opportunityId)
      .populate('createdBy', 'name email location');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunity details'
    });
  }
};

// Apply for opportunity
const applyForOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { applicationMessage } = req.body;
    const volunteerId = req.user.id;

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    if (opportunity.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is no longer accepting applications'
      });
    }

    // Check if opportunity is full
    if (opportunity.registeredCount >= opportunity.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is already at full capacity'
      });
    }

    // Check if application deadline has passed
    if (opportunity.applicationDeadline && new Date() > opportunity.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user already applied for THIS SPECIFIC opportunity
    const existingApplication = await Application.findOne({
      opportunityId: opportunityId,
      volunteerId: volunteerId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity',
        applicationStatus: existingApplication.status
      });
    }

    // Create new application
    const newApplication = new Application({
      opportunityId,
      volunteerId,
      applicationMessage: applicationMessage || '',
      status: 'pending'
    });

    await newApplication.save();
    await newApplication.populate('opportunityId', 'title date location');
    await newApplication.populate('volunteerId', 'name email');

    // Create notification for NGO about new application
    try {
      await createApplicationReceivedNotification({
        ngoId: opportunity.createdBy,
        volunteerId: volunteerId,
        eventId: opportunityId,
        applicationId: newApplication._id,
        volunteerName: newApplication.volunteerId.name,
        eventTitle: newApplication.opportunityId.title
      });
    } catch (notificationError) {
      console.error('Failed to create application notification:', notificationError);
      // Don't fail the application submission if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication
    });
  } catch (error) {
    console.error('Error applying for opportunity:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Get user's applications
const getMyApplications = async (req, res) => {
  try {
    console.log('getMyApplications called'); // Debug log
    
    const volunteerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { volunteerId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get applications from database
    const applications = await Application.find(query)
      .populate({
        path: 'opportunityId',
        populate: {
          path: 'createdBy',
          select: 'name email profileImage'
        }
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalApplications = await Application.countDocuments(query);

    console.log('Returning real applications:', applications.length);

    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplications / parseInt(limit)),
        totalItems: totalApplications,
        hasNext: skip + applications.length < totalApplications,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const volunteerId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      volunteerId
    }).populate('opportunityId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Application is already withdrawn'
      });
    }

    // If application was accepted, decrement the registered count
    if (application.status === 'accepted') {
      await Opportunity.findByIdAndUpdate(application.opportunityId._id, {
        $inc: { registeredCount: -1 }
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

// Get volunteer dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    console.log('getDashboardStats called for volunteer'); // Debug log
    
    const volunteerId = req.user.id;

    // Get real stats from database
    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      Application.countDocuments({ volunteerId }),
      Application.countDocuments({ volunteerId, status: 'pending' }),
      Application.countDocuments({ volunteerId, status: 'accepted' }),
      Application.countDocuments({ volunteerId, status: 'rejected' })
    ]);

    // Get upcoming events (accepted applications for future events)
    const upcomingEvents = await Application.countDocuments({
      volunteerId,
      status: 'accepted'
    }).populate({
      path: 'opportunityId',
      match: { date: { $gte: new Date() } }
    });

    // Calculate total hours volunteered (assuming 4 hours per accepted application)
    const totalHoursVolunteered = acceptedApplications * 4;

    // Get recent activity
    const recentApplications = await Application.find({ volunteerId })
      .populate('opportunityId', 'title')
      .sort({ appliedAt: -1 })
      .limit(5);

    const recentActivity = recentApplications.map(app => ({
      type: app.status === 'pending' ? 'application_submitted' : 
            app.status === 'accepted' ? 'application_accepted' : 'application_rejected',
      message: `${app.status === 'pending' ? 'Applied for' : 
                 app.status === 'accepted' ? 'Application accepted for' : 
                 'Application rejected for'} ${app.opportunityId?.title || 'Unknown Event'}`,
      date: app.appliedAt
    }));

    const stats = {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      upcomingEvents: upcomingEvents || 0,
      totalHoursVolunteered,
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications
      },
      recentActivity
    };

    console.log('Returning volunteer stats:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching volunteer dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get volunteer analytics (comprehensive analytics for personal view)
const getAnalytics = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    console.log('🔍 Volunteer Analytics Request:', { volunteerId }); // Debug log

    // Get volunteer details
    const volunteer = await User.findById(volunteerId)
      .select('name email createdAt skills location bio');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Get all volunteer applications
    const applications = await Application.find({ volunteerId })
      .populate('opportunityId', 'title date category location createdBy')
      .sort({ createdAt: -1 });

    console.log(`📝 Found ${applications.length} applications for volunteer ${volunteerId}`); // Debug log

    // Calculate statistics
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

    // Calculate environmental impact
    const hoursVolunteered = acceptedApplications * 4; // 4 hours per event
    const wasteCollected = acceptedApplications * 15; // 15kg per event
    const treesPlanted = Math.floor(acceptedApplications * 0.8); // 0.8 trees per event
    const co2Saved = Math.floor(wasteCollected * 0.5); // 0.5kg CO2 per kg waste

    // Get NGOs worked with
    const ngoIds = [...new Set(applications
      .filter(app => app.opportunityId?.createdBy)
      .map(app => app.opportunityId.createdBy))];
    
    const ngosWorkedWith = await User.find({ 
      _id: { $in: ngoIds }, 
      role: 'ngo' 
    }).select('name').limit(10);

    // Calculate impact score
    const impactScore = Math.floor(
      (acceptedApplications * 10) + 
      (hoursVolunteered * 2) + 
      (wasteCollected * 0.5) + 
      (treesPlanted * 5)
    );

    // Get monthly activity for the last 12 months (match NGO format)
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
      
      // Count applications in this month
      const monthApps = applications.filter(app => 
        app.createdAt >= monthStart && app.createdAt <= monthEnd
      );
      
      const acceptedThisMonth = monthApps.filter(app => app.status === 'accepted').length;
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        applications: monthApps.length,
        accepted: acceptedThisMonth,
        hours: acceptedThisMonth * 4,
        waste: acceptedThisMonth * 15
      });
    }

    console.log('📅 Monthly volunteer data generated:', monthlyData.map(m => ({
      month: m.month,
      applications: m.applications,
      accepted: m.accepted
    }))); // Debug log

    // Get category participation (match NGO format)
    const categoryStats = {};
    applications.filter(app => app.status === 'accepted').forEach(app => {
      const category = app.opportunityId?.category || 'Other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // Format for pie chart (match NGO format)
    const activityTypeData = Object.entries(categoryStats).map(([name, value]) => ({
      name,
      value: Math.round((value / acceptedApplications) * 100) || 0,
      count: value
    }));

    // If no accepted applications, provide sample data
    if (activityTypeData.length === 0) {
      console.log('⚠️ No accepted applications found, providing sample data for charts');
      activityTypeData.push({ name: 'Environmental', value: 100, count: 0 });
    }

    console.log('📊 Volunteer activity categories:', categoryStats); // Debug log
    console.log('📊 Activity type data for charts:', activityTypeData); // Debug log

    const responseData = {
      overview: {
        totalApplications,
        acceptedApplications,
        pendingApplications,
        rejectedApplications,
        totalVolunteerHours: hoursVolunteered,
        wasteCollected,
        treesPlanted,
        co2Saved,
        impactScore
      },
      monthlyData,
      activityTypeData,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        joinDate: volunteer.createdAt,
        skills: volunteer.skills || [],
        location: volunteer.location || 'Not specified',
        bio: volunteer.bio || 'No bio available'
      },
      ngosWorkedWith: ngosWorkedWith.map(ngo => ({
        id: ngo._id,
        name: ngo.name || 'Unknown NGO'
      })),
      recentActivities: applications.slice(0, 10).map(app => ({
        id: app._id,
        event: app.opportunityId?.title || 'Unknown Event',
        date: app.opportunityId?.date || new Date(),
        status: app.status,
        location: app.opportunityId?.location || 'Unknown',
        appliedDate: app.createdAt
      }))
    };

    console.log('📤 Sending volunteer analytics response:', JSON.stringify({
      overview: responseData.overview,
      monthlyDataLength: responseData.monthlyData.length,
      monthlyDataSample: responseData.monthlyData.slice(0, 3),
      activityTypeDataLength: responseData.activityTypeData.length,
      activityTypeData: responseData.activityTypeData,
      volunteerInfo: { name: responseData.volunteer.name, totalApps: totalApplications }
    }, null, 2)); // Debug log

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching volunteer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer analytics'
    });
  }
};

// Get volunteer notifications (based on application status changes)
const getNotifications = async (req, res) => {
  try {
    const volunteerId = req.user.id;
    
    // Get recent applications with status updates
    const applications = await Application.find({ volunteerId })
      .populate('opportunityId', 'title date location category')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Generate notifications from application status changes
    const notifications = [];
    
    applications.forEach(app => {
      if (app.status === 'accepted') {
        notifications.push({
          id: `accepted_${app._id}`,
          type: 'application_accepted',
          message: `Your application for "${app.opportunityId?.title || 'an event'}" has been accepted!`,
          createdAt: app.updatedAt,
          eventId: app.opportunityId?._id,
          eventTitle: app.opportunityId?.title,
          eventDate: app.opportunityId?.date
        });
      } else if (app.status === 'rejected') {
        notifications.push({
          id: `rejected_${app._id}`,
          type: 'application_rejected',
          message: `Your application for "${app.opportunityId?.title || 'an event'}" was not accepted.`,
          createdAt: app.updatedAt,
          eventId: app.opportunityId?._id,
          eventTitle: app.opportunityId?.title
        });
      } else if (app.status === 'pending') {
        // Only show pending notifications for recent applications
        const isRecent = (Date.now() - new Date(app.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 days
        if (isRecent) {
          notifications.push({
            id: `pending_${app._id}`,
            type: 'application_pending',
            message: `Your application for "${app.opportunityId?.title || 'an event'}" is under review.`,
            createdAt: app.createdAt,
            eventId: app.opportunityId?._id,
            eventTitle: app.opportunityId?.title
          });
        }
      }
    });

    // Add event reminders for upcoming accepted events
    const upcomingAcceptedApps = applications.filter(app => 
      app.status === 'accepted' && 
      app.opportunityId?.date &&
      new Date(app.opportunityId.date) > new Date() &&
      (new Date(app.opportunityId.date) - new Date()) < 3 * 24 * 60 * 60 * 1000 // Within 3 days
    );

    upcomingAcceptedApps.forEach(app => {
      const daysUntilEvent = Math.ceil((new Date(app.opportunityId.date) - new Date()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `reminder_${app._id}`,
        type: 'event_reminder',
        message: `Reminder: "${app.opportunityId.title}" is in ${daysUntilEvent} day${daysUntilEvent === 1 ? '' : 's'}!`,
        createdAt: new Date(Date.now() - (3 - daysUntilEvent) * 24 * 60 * 60 * 1000), // Simulate when reminder was created
        eventId: app.opportunityId._id,
        eventTitle: app.opportunityId.title,
        eventDate: app.opportunityId.date
      });
    });

    // Sort by most recent first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: notifications.slice(0, 10) // Return only 10 most recent
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

module.exports = {
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
};
