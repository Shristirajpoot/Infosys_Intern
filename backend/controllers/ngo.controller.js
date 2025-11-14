const User = require('../models/user.model');
const Opportunity = require('../models/opportunity.model');
const Application = require('../models/application.model');
const { createApplicationStatusNotification, createNewEventNotification } = require('./notification.controller');

// Get NGO profile
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

// Update NGO profile
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

// Get NGO Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    console.log('getDashboardStats called'); // Debug log
    const ngoId = req.user.id;
    
    // Get real stats from database
    const [activeEvents, completedEvents, totalVolunteers, totalApplications] = await Promise.all([
      Opportunity.countDocuments({ createdBy: ngoId, status: 'active' }),
      Opportunity.countDocuments({ createdBy: ngoId, status: 'completed' }),
      Application.distinct('volunteerId', { 
        status: 'accepted',
        opportunityId: { $in: await Opportunity.find({ createdBy: ngoId }).select('_id') }
      }).then(volunteers => volunteers.length),
      Application.countDocuments({
        opportunityId: { $in: await Opportunity.find({ createdBy: ngoId }).select('_id') },
        status: 'accepted'
      })
    ]);

    // Calculate total impact hours (assuming 4 hours per volunteer per event)
    const totalImpactHours = totalApplications * 4;

    const stats = {
      activeEvents,
      totalVolunteers,
      totalImpactHours,
      totalHours: totalImpactHours, // Frontend looks for both
      eventsCompleted: completedEvents,
      completedEvents
    };

    console.log('Returning stats:', stats); // Debug log

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching NGO dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get Recent Activities
const getRecentActivities = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const activities = [];

    // Get recent applications to NGO's events
    const recentApplications = await Application.find()
      .populate({
        path: 'opportunityId',
        match: { createdBy: ngoId },
        select: 'title category'
      })
      .populate('volunteerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter out applications where opportunityId is null (not NGO's events)
    const validApplications = recentApplications.filter(app => app.opportunityId);

    // Add application activities
    validApplications.forEach(app => {
      activities.push({
        id: `app_${app._id}`,
        type: 'volunteer_registration',
        message: `${app.volunteerId?.name || 'A volunteer'} applied for ${app.opportunityId?.title || 'an event'}`,
        timestamp: app.createdAt,
        icon: 'user-check',
        status: app.status,
        details: {
          volunteer: app.volunteerId?.name,
          event: app.opportunityId?.title,
          category: app.opportunityId?.category
        }
      });
    });

    // Get recent event updates (events created/modified)
    const recentEvents = await Opportunity.find({ createdBy: ngoId })
      .sort({ updatedAt: -1 })
      .limit(5);

    recentEvents.forEach(event => {
      // Check if event was recently created (within last 24 hours)
      const isNewEvent = (Date.now() - new Date(event.createdAt).getTime()) < 24 * 60 * 60 * 1000;
      
      if (isNewEvent) {
        activities.push({
          id: `event_created_${event._id}`,
          type: 'event_created',
          message: `New event "${event.title}" was created`,
          timestamp: event.createdAt,
          icon: 'calendar-plus',
          details: {
            event: event.title,
            category: event.category,
            location: event.location,
            date: event.date
          }
        });
      } else if (event.updatedAt > event.createdAt) {
        // Event was updated
        activities.push({
          id: `event_updated_${event._id}`,
          type: 'event_update',
          message: `Event "${event.title}" was updated`,
          timestamp: event.updatedAt,
          icon: 'calendar',
          details: {
            event: event.title,
            category: event.category
          }
        });
      }
    });

    // Get accepted applications (successful registrations)
    const acceptedApplications = await Application.find({ status: 'accepted' })
      .populate({
        path: 'opportunityId',
        match: { createdBy: ngoId },
        select: 'title'
      })
      .populate('volunteerId', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    const validAcceptedApps = acceptedApplications.filter(app => app.opportunityId);
    
    validAcceptedApps.forEach(app => {
      activities.push({
        id: `accepted_${app._id}`,
        type: 'volunteer_accepted',
        message: `${app.volunteerId?.name || 'A volunteer'} was accepted for ${app.opportunityId?.title}`,
        timestamp: app.updatedAt,
        icon: 'check-circle',
        details: {
          volunteer: app.volunteerId?.name,
          event: app.opportunityId?.title
        }
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Take only the 10 most recent activities
    const recentActivities = activities.slice(0, 10);

    res.json({
      success: true,
      data: recentActivities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};

// Get NGO's Events
const getMyEvents = async (req, res) => {
  try {
    console.log('getMyEvents called'); // Debug log
    const ngoId = req.user.id;
    
    // Query database for actual events created by this NGO
    const opportunities = await Opportunity.find({ createdBy: ngoId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email profileImage');

    // Format events for frontend compatibility
    const formattedEvents = opportunities.map(opp => ({
      id: opp._id,
      _id: opp._id,
      title: opp.title,
      description: opp.description,
      location: opp.location,
      date: opp.date,
      capacity: opp.capacity,
      registered: opp.registeredCount || 0,
      status: opp.status,
      category: opp.category,
      duration: opp.duration,
      requiredSkills: opp.requiredSkills || [],
      applicationDeadline: opp.applicationDeadline,
      imageUrl: opp.image,
      createdBy: opp.createdBy?.name || 'Unknown NGO',
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt
    }));

    console.log('Returning real events:', formattedEvents.length); // Debug log

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching NGO events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Create New Event
const createEvent = async (req, res) => {
  try {
    console.log('Creating event with data:', req.body); // Debug log
    console.log('User data:', req.user); // Debug log
    const { 
      title, 
      description, 
      location, 
      date, 
      capacity, 
      category, 
      duration, 
      requiredSkills, 
      applicationDeadline, 
      image,
      wasteTypes,
      requiredExperienceLevel,
      timeOfDay
    } = req.body;
    const ngoId = req.user._id || req.user.id; // Handle both _id and id

    // Validation - Fixed to match frontend fields
    if (!title || !description || !location || !date || !capacity) {
      console.log('Validation failed, missing fields:', { title: !!title, description: !!description, location: !!location, date: !!date, capacity: !!capacity });
      return res.status(400).json({
        success: false,
        message: 'All required fields (title, description, location, date, capacity) must be provided'
      });
    }

    // Validate waste types are provided
    if (!wasteTypes || !Array.isArray(wasteTypes) || wasteTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one waste type must be selected'
      });
    }

    if (new Date(date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date cannot be in the past'
      });
    }

    // Validate application deadline
    if (applicationDeadline) {
      const eventDate = new Date(date);
      const deadline = new Date(applicationDeadline);
      
      if (deadline >= eventDate) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline must be before the event date'
        });
      }
      
      if (deadline < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline cannot be in the past'
        });
      }
    }

    // Simple geocoding function for demo purposes
    // In production, you would use a real geocoding API like Google Maps
    const getCoordinatesFromLocation = (locationString) => {
      const location = locationString.toLowerCase();
      
      // Sample coordinates for common cities (you can expand this)
      const cityCoordinates = {
        'new york': { latitude: 40.7128, longitude: -74.0060 },
        'los angeles': { latitude: 34.0522, longitude: -118.2437 },
        'chicago': { latitude: 41.8781, longitude: -87.6298 },
        'houston': { latitude: 29.7604, longitude: -95.3698 },
        'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
        'phoenix': { latitude: 33.4484, longitude: -112.0740 },
        'san antonio': { latitude: 29.4241, longitude: -98.4936 },
        'san diego': { latitude: 32.7157, longitude: -117.1611 },
        'dallas': { latitude: 32.7767, longitude: -96.7970 },
        'san jose': { latitude: 37.3382, longitude: -121.8863 },
        'mumbai': { latitude: 19.0760, longitude: 72.8777 },
        'delhi': { latitude: 28.7041, longitude: 77.1025 },
        'bangalore': { latitude: 12.9716, longitude: 77.5946 },
        'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
        'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
        'chennai': { latitude: 13.0827, longitude: 80.2707 },
        'kolkata': { latitude: 22.5726, longitude: 88.3639 },
        'pune': { latitude: 18.5204, longitude: 73.8567 },
        'jaipur': { latitude: 26.9124, longitude: 75.7873 },
        'surat': { latitude: 21.1702, longitude: 72.8311 }
      };

      // Check for exact city matches
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (location.includes(city)) {
          return coords;
        }
      }

      // Default coordinates (you can set this to your region's center)
      return { latitude: 28.7041, longitude: 77.1025 }; // Delhi, India as default
    };

    // Get coordinates from location
    const coordinates = getCoordinatesFromLocation(location);

    if (capacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be at least 1'
      });
    }

    // Handle image data properly - convert to string if it's an object
    let imageData = null;
    if (image) {
      if (typeof image === 'string' && image.trim()) {
        // Valid base64 string
        imageData = image.trim();
      } else if (typeof image === 'object') {
        // Handle object formats that might contain the image data
        if (image.imagePreview && typeof image.imagePreview === 'string') {
          imageData = image.imagePreview;
        } else if (image.data && typeof image.data === 'string') {
          imageData = image.data;
        } else if (image.src && typeof image.src === 'string') {
          imageData = image.src;
        } else {
          console.log('Invalid image object format, ignoring:', Object.keys(image));
          imageData = null;
        }
      } else {
        console.log('Invalid image format, expected string but got:', typeof image);
        imageData = null;
      }
    }

    // Create new opportunity in database
    const newOpportunity = new Opportunity({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      coordinates: coordinates, // Add coordinates
      wasteTypes: wasteTypes || [], // Add waste types
      requiredExperienceLevel: requiredExperienceLevel || 'beginner', // Add experience level
      timeOfDay: timeOfDay || 'morning', // Add time of day
      date: new Date(date),
      capacity: parseInt(capacity),
      category: category || 'environmental',
      duration: duration || '4 hours', // Default duration if not provided
      requiredSkills: requiredSkills || [],
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      image: imageData, // Store processed image data
      createdBy: ngoId,
      registeredCount: 0,
      status: 'active'
    });

    const savedOpportunity = await newOpportunity.save();
    await savedOpportunity.populate('createdBy', 'name email');

    console.log('Event saved to database:', savedOpportunity._id); // Debug log

    // Create notifications for all volunteers about the new event
    try {
      await createNewEventNotification({
        eventId: savedOpportunity._id,
        eventTitle: savedOpportunity.title,
        ngoName: savedOpportunity.createdBy.name,
        ngoId: ngoId,
        location: savedOpportunity.location,
        date: savedOpportunity.date
      });
      console.log('New event notifications created successfully');
    } catch (notificationError) {
      console.error('Error creating new event notifications:', notificationError);
      // Don't fail the event creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedOpportunity
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, location, date, capacity, category, status, duration, requiredSkills, applicationDeadline } = req.body;
    const ngoId = req.user.id;

    // Find and verify ownership
    const opportunity = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or you do not have permission to update it'
      });
    }

    // Update fields if provided
    if (title) opportunity.title = title.trim();
    if (description) opportunity.description = description.trim();
    if (location) opportunity.location = location.trim();
    if (date) {
      if (new Date(date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Event date cannot be in the past'
        });
      }
      opportunity.date = new Date(date);
    }
    if (capacity) {
      const newCapacity = parseInt(capacity);
      if (newCapacity < opportunity.registeredCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below current registrations (${opportunity.registeredCount})`
        });
      }
      opportunity.capacity = newCapacity;
    }
    if (category) opportunity.category = category;
    if (status) opportunity.status = status;
    if (duration) opportunity.duration = duration.trim();
    if (requiredSkills !== undefined) opportunity.requiredSkills = requiredSkills;
    if (applicationDeadline !== undefined) {
      if (applicationDeadline) {
        const eventDate = opportunity.date;
        const deadline = new Date(applicationDeadline);
        
        if (deadline >= eventDate) {
          return res.status(400).json({
            success: false,
            message: 'Application deadline must be before the event date'
          });
        }
        
        if (deadline < new Date()) {
          return res.status(400).json({
            success: false,
            message: 'Application deadline cannot be in the past'
          });
        }
        
        opportunity.applicationDeadline = deadline;
      } else {
        opportunity.applicationDeadline = null;
      }
    }

    const updatedOpportunity = await opportunity.save();
    await updatedOpportunity.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      data: updatedOpportunity
    });
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update opportunity'
    });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const ngoId = req.user.id;

    // Find and verify ownership
    const opportunity = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to delete it'
      });
    }

    // Delete associated applications first
    await Application.deleteMany({ opportunityId: eventId });
    
    // Delete the opportunity
    await Opportunity.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// Get Event Registrations
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const ngoId = req.user.id;

    // Verify opportunity belongs to this NGO
    const opportunity = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or you do not have permission to view it'
      });
    }

    // Fetch applications for this opportunity
    const applications = await Application.find({ opportunityId: eventId })
      .populate('volunteerId', 'name email phone skills location bio')
      .sort({ appliedAt: -1 });

    // Format applications for frontend
    const formattedApplications = applications.map(app => ({
      id: app._id,
      _id: app._id,
      eventId: app.opportunityId,
      volunteerName: app.volunteerId?.name || 'Unknown Volunteer',
      email: app.volunteerId?.email || 'No email provided',
      phone: app.volunteerId?.phone || 'No phone provided',
      status: app.status,
      appliedAt: app.appliedAt,
      experience: app.volunteerId?.experience || 'Not specified',
      skills: app.volunteerId?.skills || [],
      message: app.applicationMessage || 'No message provided',
      location: app.volunteerId?.location || 'Not specified',
      bio: app.volunteerId?.bio || 'No bio available'
    }));

    res.json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations'
    });
  }
};

// Get My Volunteers (volunteers registered for NGO's events)
const getMyVolunteers = async (req, res) => {
  try {
    const ngoId = req.user.id;

    // Get all opportunities created by this NGO
    const myOpportunities = await Opportunity.find({ createdBy: ngoId }).select('_id title');
    const opportunityIds = myOpportunities.map(opp => opp._id);

    // Find all accepted applications for NGO's opportunities
    const acceptedApplications = await Application.find({ 
      opportunityId: { $in: opportunityIds }, 
      status: 'accepted' 
    })
    .populate('volunteerId', 'name email phone skills location bio createdAt')
    .populate('opportunityId', 'title')
    .sort({ appliedAt: -1 });

    // Group applications by volunteer to get unique volunteers with their registered events
    const volunteerMap = new Map();
    
    acceptedApplications.forEach(app => {
      const volunteerId = app.volunteerId._id.toString();
      
      if (!volunteerMap.has(volunteerId)) {
        volunteerMap.set(volunteerId, {
          id: volunteerId,
          name: app.volunteerId.name,
          email: app.volunteerId.email,
          phone: app.volunteerId.phone || 'Not provided',
          skills: app.volunteerId.skills || [],
          location: app.volunteerId.location || 'Not specified',
          bio: app.volunteerId.bio || '',
          registeredEvents: [],
          totalHours: 0, // This could be calculated based on event duration
          status: 'active',
          joinDate: app.volunteerId.createdAt || new Date()
        });
      }
      
      const volunteer = volunteerMap.get(volunteerId);
      volunteer.registeredEvents.push(app.opportunityId.title);
      volunteer.totalHours += 4; // Assuming 4 hours per event, adjust as needed
    });

    const volunteers = Array.from(volunteerMap.values());

    res.json({
      success: true,
      data: volunteers
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteers'
    });
  }
};

// Get Volunteer Details
const getVolunteerDetails = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const ngoId = req.user.id;

    // In a real app, fetch volunteer details and verify access
    // Mock volunteer details
    const volunteer = {
      id: volunteerId,
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1 234-567-8901',
      skills: ['Environmental Advocacy', 'Event Planning'],
      bio: 'Passionate about environmental conservation and community engagement.',
      location: 'Downtown City',
      registeredEvents: [
        {
          id: 1,
          title: 'Community Garden Project',
          status: 'upcoming',
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          title: 'River Cleanup Drive',
          status: 'upcoming',
          registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      totalHours: 25,
      status: 'active',
      joinDate: '2024-08-15'
    };

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    console.error('Error fetching volunteer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer details'
    });
  }
};

// Send Message to Volunteer
const sendMessageToVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { message } = req.body;
    const ngoId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // In a real app, save message to database and/or send notification
    // For now, return mock success response
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message to volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get Event Report
const getEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    const ngoId = req.user.id;

    // In a real app, generate report from database
    // Mock report data
    const report = {
      eventId,
      eventTitle: 'Community Garden Project',
      totalRegistrations: 15,
      attendanceRate: '87%',
      volunteerHours: 45,
      impactMetrics: {
        plantsPlanted: 120,
        areasCovered: '500 sq ft',
        volunteersEngaged: 15
      },
      feedback: {
        averageRating: 4.8,
        totalResponses: 12,
        positiveComments: 10
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating event report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate event report'
    });
  }
};

// Get Volunteer Report
const getVolunteerReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const ngoId = req.user.id;

    // In a real app, generate volunteer report from database
    // Mock report data
    const report = {
      period,
      totalVolunteers: 68,
      activeVolunteers: 45,
      newVolunteers: 12,
      totalHours: 340,
      averageHoursPerVolunteer: 7.6,
      topSkills: [
        { skill: 'Environmental Advocacy', count: 25 },
        { skill: 'Event Planning', count: 18 },
        { skill: 'Community Outreach', count: 15 }
      ],
      retentionRate: '78%'
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating volunteer report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate volunteer report'
    });
  }
};

// Review Application
const reviewApplication = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const { status, reviewNote } = req.body;
    const ngoId = req.user.id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

    // Find the application
    const application = await Application.findById(registrationId)
      .populate('opportunityId')
      .populate('volunteerId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if the opportunity belongs to the NGO
    if (application.opportunityId.createdBy.toString() !== ngoId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review applications for your own opportunities'
      });
    }

    // Store previous status for registration count updates
    const previousStatus = application.status;

    // Update application status
    application.status = status;
    application.reviewMessage = reviewNote;
    application.reviewedAt = new Date();
    application.reviewedBy = ngoId;

    await application.save();

    // Update opportunity registration count based on status change
    if (status === 'accepted' && previousStatus !== 'accepted') {
      // New acceptance - increment count
      await Opportunity.findByIdAndUpdate(eventId, {
        $inc: { registeredCount: 1 }
      });
    } else if (previousStatus === 'accepted' && status === 'rejected') {
      // Previously accepted, now rejected - decrement count
      await Opportunity.findByIdAndUpdate(eventId, {
        $inc: { registeredCount: -1 }
      });
    }

    console.log(`Application ${registrationId} ${status} for event ${eventId} (previous: ${previousStatus})`);

    // Create notification for volunteer about application status change
    try {
      const ngoUser = await User.findById(ngoId).select('name');
      await createApplicationStatusNotification({
        volunteerId: application.volunteerId._id,
        ngoId: ngoId,
        eventId: application.opportunityId._id,
        applicationId: application._id,
        status: status,
        eventTitle: application.opportunityId.title,
        ngoName: ngoUser.name
      });
    } catch (notificationError) {
      console.error('Failed to create application status notification:', notificationError);
      // Don't fail the review if notification fails
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review application'
    });
  }
};

// Attendance Management Functions

// Get Event Attendance
const getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const ngoId = req.user.id;

    // Verify NGO owns this event
    const event = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Get all accepted applications (volunteers) for this event
    const applications = await Application.find({ 
      opportunityId: eventId, 
      status: 'accepted' 
    })
    .populate('volunteerId', 'name email phone')
    .sort({ appliedAt: 1 });

    // Format for frontend
    const attendanceData = applications.map(app => ({
      id: app._id,
      volunteerId: app.volunteerId._id,
      volunteerName: app.volunteerId.name,
      email: app.volunteerId.email,
      phone: app.volunteerId.phone,
      attendanceStatus: app.attendance?.status || 'pending',
      arrivalTime: app.attendance?.arrivalTime || '',
      notes: app.attendance?.notes || '',
      markedAt: app.attendance?.markedAt,
      appliedAt: app.appliedAt
    }));

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          location: event.location
        },
        volunteers: attendanceData,
        stats: {
          total: attendanceData.length,
          present: attendanceData.filter(v => v.attendanceStatus === 'present').length,
          absent: attendanceData.filter(v => v.attendanceStatus === 'absent').length,
          late: attendanceData.filter(v => v.attendanceStatus === 'late').length,
          pending: attendanceData.filter(v => v.attendanceStatus === 'pending').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching event attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data'
    });
  }
};

// Mark Single Volunteer Attendance
const markAttendance = async (req, res) => {
  try {
    const { eventId, volunteerId } = req.params;
    const { status, arrivalTime, notes } = req.body;
    const ngoId = req.user.id;

    // Verify NGO owns this event
    const event = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Find the application
    const application = await Application.findOne({ 
      opportunityId: eventId, 
      volunteerId: volunteerId,
      status: 'accepted'
    }).populate('volunteerId', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer application not found or not accepted'
      });
    }

    // Update attendance
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    application.attendance = {
      status: status,
      markedAt: new Date(),
      markedBy: ngoId,
      arrivalTime: (status === 'present' || status === 'late') ? (arrivalTime || currentTime) : '',
      notes: notes || ''
    };

    await application.save();

    res.json({
      success: true,
      message: `Attendance marked as ${status} for ${application.volunteerId.name}`,
      data: {
        volunteerId: volunteerId,
        status: status,
        arrivalTime: application.attendance.arrivalTime,
        markedAt: application.attendance.markedAt
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
};

// Mark All Volunteers Present
const markAllPresent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { notes } = req.body;
    const ngoId = req.user.id;

    // Verify NGO owns this event
    const event = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Get all accepted applications for this event
    const applications = await Application.find({ 
      opportunityId: eventId, 
      status: 'accepted' 
    });

    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Update all applications
    const updatePromises = applications.map(app => {
      app.attendance = {
        status: 'present',
        markedAt: new Date(),
        markedBy: ngoId,
        arrivalTime: currentTime,
        notes: notes || 'Bulk marked present'
      };
      return app.save();
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `All ${applications.length} volunteers marked as present`,
      data: {
        eventId: eventId,
        markedCount: applications.length,
        markedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking all present:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all present'
    });
  }
};

// Export Attendance Report
const exportAttendanceReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    const ngoId = req.user.id;

    // Verify NGO owns this event
    const event = await Opportunity.findOne({ _id: eventId, createdBy: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Get attendance data
    const applications = await Application.find({ 
      opportunityId: eventId, 
      status: 'accepted' 
    })
    .populate('volunteerId', 'name email phone')
    .sort({ appliedAt: 1 });

    // Generate CSV content
    let csvContent = 'Volunteer ID,Name,Email,Phone,Status,Arrival Time,Notes,Applied Date\n';
    
    applications.forEach(app => {
      const attendance = app.attendance || {};
      csvContent += `${app.volunteerId._id},${app.volunteerId.name},${app.volunteerId.email},${app.volunteerId.phone || ''},${attendance.status || 'pending'},${attendance.arrivalTime || ''},${(attendance.notes || '').replace(/,/g, ';')},${app.appliedAt.toISOString().split('T')[0]}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export attendance report'
    });
  }
};

// Get Analytics Data for NGO
const getAnalyticsData = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const { timeRange = 'month' } = req.query;

    console.log('🔍 Analytics Request:', { ngoId, timeRange }); // Debug log

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

    console.log('📅 Date range:', { startDate, endDate: now }); // Debug log

    // Get NGO's events
    const ngoEvents = await Opportunity.find({ createdBy: ngoId });
    console.log(`📊 Found ${ngoEvents.length} events for NGO ${ngoId}`); // Debug log
    
    if (ngoEvents.length > 0) {
      console.log('📋 Event details:', ngoEvents.map(event => ({
        id: event._id,
        title: event.title,
        category: event.category,
        createdAt: event.createdAt,
        status: event.status
      })));
    } else {
      console.log('⚠️ No events found for NGO. Checking NGO ID and events collection...');
      // Let's check if there are any events at all in the collection
      const totalEvents = await Opportunity.countDocuments();
      console.log(`Total events in database: ${totalEvents}`);
    }

    const eventIds = ngoEvents.map(event => event._id);

    // Get applications for NGO's events
    const applications = await Application.find({
      opportunityId: { $in: eventIds },
      createdAt: { $gte: startDate }
    }).populate('volunteerId', 'name email createdAt')
      .populate('opportunityId', 'title date category location');

    console.log(`📝 Found ${applications.length} applications in date range`); // Debug log

    // Get unique volunteers
    const uniqueVolunteers = await Application.distinct('volunteerId', {
      opportunityId: { $in: eventIds },
      status: 'accepted'
    });

    console.log(`👥 Found ${uniqueVolunteers.length} unique volunteers`); // Debug log

    // Get volunteer details
    const volunteerData = await User.find({
      _id: { $in: uniqueVolunteers }
    }).select('name email createdAt skills location');

    // Calculate statistics
    const totalVolunteers = volunteerData.length;
    const totalEvents = ngoEvents.length;
    const activeEvents = ngoEvents.filter(event => event.status === 'active').length;
    const completedEvents = ngoEvents.filter(event => event.status === 'completed').length;
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

    // Calculate volunteer hours (4 hours per accepted application)
    const totalVolunteerHours = acceptedApplications * 4;

    // Environmental impact calculations
    const wasteCollected = acceptedApplications * 15; // 15kg per volunteer on average
    const treesPlanted = Math.floor(acceptedApplications * 0.8); // 0.8 trees per volunteer
    const co2Saved = Math.floor(wasteCollected * 0.5); // 0.5kg CO2 per kg waste

    // Monthly breakdown for charts - Track EVENTS CREATED by month (not applications)
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
      
      // Count events CREATED in this month
      const monthEvents = ngoEvents.filter(event => 
        event.createdAt >= monthStart && event.createdAt <= monthEnd
      );
      
      // Count applications in this month for secondary metrics
      const monthApps = applications.filter(app => 
        app.createdAt >= monthStart && app.createdAt <= monthEnd
      );
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        events: monthEvents.length, // Events created this month
        applications: monthApps.length,
        volunteers: new Set(monthApps.map(app => app.volunteerId?.toString())).size,
        waste: monthApps.filter(app => app.status === 'accepted').length * 15,
        hours: monthApps.filter(app => app.status === 'accepted').length * 4
      });
    }

    console.log('📅 Monthly data generated:', monthlyData.map(m => ({
      month: m.month,
      events: m.events,
      applications: m.applications
    }))); // Debug log

    // Event category breakdown - Use actual EVENT categories (not application categories)
    const eventCategoryStats = {};
    ngoEvents.forEach(event => {
      const category = event.category || 'Other';
      eventCategoryStats[category] = (eventCategoryStats[category] || 0) + 1;
    });

    // Ensure we have at least some activity data to display
    let activityTypeData = Object.entries(eventCategoryStats).map(([name, value]) => ({
      name,
      value: Math.round((value / totalEvents) * 100) || 0,
      count: value
    }));

    // If no events exist, provide sample data so charts aren't empty
    if (activityTypeData.length === 0) {
      console.log('⚠️ No event categories found, providing sample data for charts');
      activityTypeData = [
        { name: 'Environmental', value: 100, count: 0 },
      ];
    }

    console.log('📊 Event categories found:', eventCategoryStats); // Debug log
    console.log('📊 Activity type data for charts:', activityTypeData); // Debug log

    // Recent activities - Show NGO's own events instead of applications
    const recentActivities = ngoEvents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(event => ({
        id: event._id,
        type: 'Event',
        name: event.title || 'Unknown Event',
        event: event.title || 'Unknown Event',
        status: event.status || 'active',
        date: event.createdAt,
        eventDate: event.date,
        location: event.location || 'Unknown',
        description: event.description || '',
        category: event.category || 'Other'
      }));

    // Top volunteers
    const volunteerStats = {};
    applications.filter(app => app.status === 'accepted').forEach(app => {
      const volunteerId = app.volunteerId?._id?.toString();
      if (volunteerId) {
        volunteerStats[volunteerId] = (volunteerStats[volunteerId] || 0) + 1;
      }
    });

    const topVolunteers = Object.entries(volunteerStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([volunteerId, count]) => {
        const volunteer = volunteerData.find(v => v._id.toString() === volunteerId);
        return {
          id: volunteerId,
          name: volunteer?.name || 'Unknown',
          email: volunteer?.email || '',
          eventsParticipated: count,
          totalHours: count * 4,
          joinDate: volunteer?.createdAt || new Date()
        };
      });

    const responseData = {
      overview: {
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
      monthlyData,
      activityTypeData,
      recentActivities,
      topVolunteers,
      timeRange
    };

    console.log('📤 Sending analytics response:', JSON.stringify({
      overview: responseData.overview,
      monthlyDataLength: responseData.monthlyData.length,
      monthlyDataSample: responseData.monthlyData.slice(0, 3), // Show first 3 months
      activityTypeDataLength: responseData.activityTypeData.length,
      activityTypeData: responseData.activityTypeData, // Show all categories
      recentActivitiesLength: responseData.recentActivities.length,
      topVolunteersLength: responseData.topVolunteers.length
    }, null, 2)); // Debug log

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

// Get Volunteer Analytics for NGO
const getVolunteerAnalytics = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const { volunteerId } = req.params;

    // Get NGO's events
    const ngoEvents = await Opportunity.find({ createdBy: ngoId });
    const eventIds = ngoEvents.map(event => event._id);

    // Get volunteer's applications for this NGO's events
    const volunteerApplications = await Application.find({
      volunteerId,
      opportunityId: { $in: eventIds }
    }).populate('opportunityId', 'title date category location')
      .sort({ createdAt: -1 });

    // Get volunteer details
    const volunteer = await User.findById(volunteerId)
      .select('fullName email createdAt skills location bio');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Calculate volunteer statistics
    const totalApplications = volunteerApplications.length;
    const acceptedApplications = volunteerApplications.filter(app => app.status === 'accepted').length;
    const pendingApplications = volunteerApplications.filter(app => app.status === 'pending').length;
    const rejectedApplications = volunteerApplications.filter(app => app.status === 'rejected').length;
    const hoursVolunteered = acceptedApplications * 4;
    const wasteCollected = acceptedApplications * 15;
    const treesPlanted = Math.floor(acceptedApplications * 0.8);
    const co2Saved = Math.floor(wasteCollected * 0.5);

    // Calculate impact score
    const impactScore = (acceptedApplications * 50) + (hoursVolunteered * 10) + (wasteCollected * 2);

    // Monthly activity breakdown
    const monthlyActivity = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthApps = volunteerApplications.filter(app => 
        app.createdAt >= monthStart && app.createdAt <= monthEnd
      );
      
      monthlyActivity.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        applications: monthApps.length,
        accepted: monthApps.filter(app => app.status === 'accepted').length,
        waste: monthApps.filter(app => app.status === 'accepted').length * 15,
        hours: monthApps.filter(app => app.status === 'accepted').length * 4
      });
    }

    // Event category participation
    const categoryParticipation = {};
    volunteerApplications.filter(app => app.status === 'accepted').forEach(app => {
      const category = app.opportunityId?.category || 'Other';
      categoryParticipation[category] = (categoryParticipation[category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        volunteer: {
          id: volunteer._id,
          name: volunteer.fullName,
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
        monthlyActivity,
        categoryParticipation,
        recentApplications: volunteerApplications.slice(0, 10).map(app => ({
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
    console.error('Error fetching volunteer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer analytics'
    });
  }
};

module.exports = {
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
  // New attendance functions
  getEventAttendance,
  markAttendance,
  markAllPresent,
  exportAttendanceReport,
  // Analytics functions
  getAnalyticsData,
  getVolunteerAnalytics
};
