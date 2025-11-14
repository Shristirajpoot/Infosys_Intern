// controllers/matching.controller.js
const matchingService = require('../services/matchingService');
const User = require('../models/user.model');

const getMatchingOpportunities = async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const matches = await matchingService.findMatchingOpportunities(volunteerId, limit);

    res.status(200).json({
      success: true,
      data: matches,
      message: `Found ${matches.length} matching opportunities`
    });

  } catch (error) {
    console.error('Error getting matching opportunities:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get matching opportunities'
    });
  }
};

const getMatchingVolunteers = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    // Verify user is NGO
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can access volunteer matching'
      });
    }

    const matches = await matchingService.findMatchingVolunteers(opportunityId, limit);

    res.status(200).json({
      success: true,
      data: matches,
      message: `Found ${matches.length} matching volunteers`
    });

  } catch (error) {
    console.error('Error getting matching volunteers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get matching volunteers'
    });
  }
};

const updateVolunteerPreferences = async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const {
      coordinates,
      wasteTypePreferences,
      availability,
      maxTravelDistance,
      experienceLevel,
      skills
    } = req.body;

    // Verify user is volunteer
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Only volunteers can update preferences'
      });
    }

    const updateData = {};
    
    if (coordinates) updateData.coordinates = coordinates;
    if (wasteTypePreferences) updateData.wasteTypePreferences = wasteTypePreferences;
    if (availability) updateData.availability = availability;
    if (maxTravelDistance !== undefined) updateData.maxTravelDistance = maxTravelDistance;
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (skills) updateData.skills = skills;

    const updatedUser = await User.findByIdAndUpdate(
      volunteerId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Volunteer preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating volunteer preferences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update preferences'
    });
  }
};

const inviteVolunteer = async (req, res) => {
  try {
    const { opportunityId, volunteerId } = req.body;

    // Verify user is NGO
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can invite volunteers'
      });
    }

    // Here you could implement invitation logic
    // For now, we'll just return success
    // In a full implementation, you might:
    // 1. Create a notification for the volunteer
    // 2. Send an email invitation
    // 3. Create a special application with "invited" status

    res.status(200).json({
      success: true,
      message: 'Volunteer invitation sent successfully'
    });

  } catch (error) {
    console.error('Error inviting volunteer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to invite volunteer'
    });
  }
};

module.exports = {
  getMatchingOpportunities,
  getMatchingVolunteers,
  updateVolunteerPreferences,
  inviteVolunteer
};
