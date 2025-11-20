// services/matchingService.js
const User = require('../models/user.model');
const Opportunity = require('../models/opportunity.model');
const Application = require('../models/application.model');

class MatchingService {
  
  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Calculate waste type compatibility score
   * @param {Array} volunteerPreferences - Volunteer's waste type preferences
   * @param {Array} opportunityWasteTypes - Opportunity's waste types
   * @returns {number} Score between 0 and 1
   */
  calculateWasteTypeScore(volunteerPreferences, opportunityWasteTypes) {
    if (!volunteerPreferences || volunteerPreferences.length === 0) return 0.5; // Neutral score
    if (!opportunityWasteTypes || opportunityWasteTypes.length === 0) return 0.5;

    const matches = volunteerPreferences.filter(pref => 
      opportunityWasteTypes.includes(pref)
    );
    
    return matches.length / Math.max(volunteerPreferences.length, opportunityWasteTypes.length);
  }

  /**
   * Calculate skills compatibility score
   * @param {Array} volunteerSkills - Volunteer's skills
   * @param {Array} requiredSkills - Opportunity's required skills
   * @returns {number} Score between 0 and 1
   */
  calculateSkillsScore(volunteerSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 1; // No specific skills required
    if (!volunteerSkills || volunteerSkills.length === 0) return 0.3; // Some base score

    const matches = volunteerSkills.filter(skill => 
      requiredSkills.some(required => 
        skill.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return Math.min(1, matches.length / requiredSkills.length);
  }

  /**
   * Calculate experience level compatibility score
   * @param {string} volunteerLevel - Volunteer's experience level
   * @param {string} requiredLevel - Required experience level
   * @returns {number} Score between 0 and 1
   */
  calculateExperienceScore(volunteerLevel, requiredLevel) {
    const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const volunteerScore = levelMap[volunteerLevel] || 1;
    const requiredScore = levelMap[requiredLevel] || 1;
    
    if (volunteerScore >= requiredScore) return 1;
    return volunteerScore / requiredScore;
  }

  /**
   * Calculate time availability score
   * @param {Object} volunteerAvailability - Volunteer's availability
   * @param {Date} opportunityDate - Opportunity date
   * @param {string} opportunityTime - Opportunity time preference
   * @returns {number} Score between 0 and 1
   */
  calculateTimeScore(volunteerAvailability, opportunityDate, opportunityTime) {
    if (!volunteerAvailability || !volunteerAvailability.days) return 0.5;

    const opportunityDay = new Date(opportunityDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayMatch = volunteerAvailability.days.includes(opportunityDay);
    
    let timeMatch = 1;
    if (volunteerAvailability.timePreference && opportunityTime) {
      timeMatch = volunteerAvailability.timePreference === 'flexible' ? 1 :
                 volunteerAvailability.timePreference === opportunityTime ? 1 : 0.7;
    }
    
    return dayMatch ? timeMatch : 0.3;
  }

  /**
   * Find matching opportunities for a volunteer
   * @param {string} volunteerId - Volunteer's ID
   * @param {number} limit - Maximum number of matches to return
   * @returns {Array} Array of matched opportunities with scores
   */
  async findMatchingOpportunities(volunteerId, limit = 10) {
    try {
      const volunteer = await User.findById(volunteerId);
      if (!volunteer || volunteer.role !== 'volunteer') {
        throw new Error('Volunteer not found');
      }

      // Get all active opportunities
      const opportunities = await Opportunity.find({ 
        status: 'active',
        date: { $gte: new Date() } // Only future opportunities
      }).populate('createdBy', 'name location');

      // Get volunteer's existing applications to exclude already applied opportunities
      const existingApplications = await Application.find({ 
        volunteerId,
        status: { $in: ['pending', 'accepted'] }
      }).select('opportunityId');
      
      const appliedOpportunityIds = existingApplications.map(app => app.opportunityId.toString());

      const matches = [];

      for (const opportunity of opportunities) {
        // Skip if already applied
        if (appliedOpportunityIds.includes(opportunity._id.toString())) continue;

        let totalScore = 0;
        let weights = 0;

        // Location score (30% weight)
        let locationScore = 0;
        if (volunteer.coordinates?.latitude && volunteer.coordinates?.longitude &&
            opportunity.coordinates?.latitude && opportunity.coordinates?.longitude) {
          const distance = this.calculateDistance(
            volunteer.coordinates.latitude,
            volunteer.coordinates.longitude,
            opportunity.coordinates.latitude,
            opportunity.coordinates.longitude
          );
          
          if (distance <= volunteer.maxTravelDistance) {
            locationScore = Math.max(0, 1 - (distance / volunteer.maxTravelDistance));
          }
        } else {
          // Fallback to string matching if coordinates not available
          locationScore = volunteer.location.toLowerCase().includes(opportunity.location.toLowerCase()) ||
                        opportunity.location.toLowerCase().includes(volunteer.location.toLowerCase()) ? 0.8 : 0.2;
        }
        totalScore += locationScore * 0.3;
        weights += 0.3;

        // Waste type score (25% weight)
        const wasteTypeScore = this.calculateWasteTypeScore(
          volunteer.wasteTypePreferences,
          opportunity.wasteTypes
        );
        totalScore += wasteTypeScore * 0.25;
        weights += 0.25;

        // Skills score (20% weight)
        const skillsScore = this.calculateSkillsScore(
          volunteer.skills,
          opportunity.requiredSkills
        );
        totalScore += skillsScore * 0.2;
        weights += 0.2;

        // Experience score (15% weight)
        const experienceScore = this.calculateExperienceScore(
          volunteer.experienceLevel,
          opportunity.requiredExperienceLevel
        );
        totalScore += experienceScore * 0.15;
        weights += 0.15;

        // Time availability score (10% weight)
        const timeScore = this.calculateTimeScore(
          volunteer.availability,
          opportunity.date,
          opportunity.timeOfDay
        );
        totalScore += timeScore * 0.1;
        weights += 0.1;

        const finalScore = weights > 0 ? totalScore / weights : 0;

        // Only include opportunities with a reasonable match score
        if (finalScore >= 0.3) {
          matches.push({
            opportunity,
            score: Math.round(finalScore * 100),
            matchReasons: {
              location: Math.round(locationScore * 100),
              wasteTypes: Math.round(wasteTypeScore * 100),
              skills: Math.round(skillsScore * 100),
              experience: Math.round(experienceScore * 100),
              timeAvailability: Math.round(timeScore * 100)
            }
          });
        }
      }

      // Sort by score and return top matches
      matches.sort((a, b) => b.score - a.score);
      return matches.slice(0, limit);

    } catch (error) {
      console.error('Error finding matching opportunities:', error);
      throw error;
    }
  }

  /**
   * Find matching volunteers for an opportunity
   * @param {string} opportunityId - Opportunity's ID
   * @param {number} limit - Maximum number of matches to return
   * @returns {Array} Array of matched volunteers with scores
   */
  async findMatchingVolunteers(opportunityId, limit = 20) {
    try {
      const opportunity = await Opportunity.findById(opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      // Get all volunteers
      const volunteers = await User.find({ role: 'volunteer' });

      // Get existing applications to exclude volunteers who already applied
      const existingApplications = await Application.find({ 
        opportunityId,
        status: { $in: ['pending', 'accepted'] }
      }).select('volunteerId');
      
      const appliedVolunteerIds = existingApplications.map(app => app.volunteerId.toString());

      const matches = [];

      for (const volunteer of volunteers) {
        // Skip if already applied
        if (appliedVolunteerIds.includes(volunteer._id.toString())) continue;

        let totalScore = 0;
        let weights = 0;

        // Location score (30% weight)
        let locationScore = 0;
        if (volunteer.coordinates?.latitude && volunteer.coordinates?.longitude &&
            opportunity.coordinates?.latitude && opportunity.coordinates?.longitude) {
          const distance = this.calculateDistance(
            volunteer.coordinates.latitude,
            volunteer.coordinates.longitude,
            opportunity.coordinates.latitude,
            opportunity.coordinates.longitude
          );
          
          if (distance <= volunteer.maxTravelDistance) {
            locationScore = Math.max(0, 1 - (distance / volunteer.maxTravelDistance));
          }
        } else {
          // Fallback to string matching
          locationScore = volunteer.location.toLowerCase().includes(opportunity.location.toLowerCase()) ||
                        opportunity.location.toLowerCase().includes(volunteer.location.toLowerCase()) ? 0.8 : 0.2;
        }
        totalScore += locationScore * 0.3;
        weights += 0.3;

        // Waste type score (25% weight)
        const wasteTypeScore = this.calculateWasteTypeScore(
          volunteer.wasteTypePreferences,
          opportunity.wasteTypes
        );
        totalScore += wasteTypeScore * 0.25;
        weights += 0.25;

        // Skills score (20% weight)
        const skillsScore = this.calculateSkillsScore(
          volunteer.skills,
          opportunity.requiredSkills
        );
        totalScore += skillsScore * 0.2;
        weights += 0.2;

        // Experience score (15% weight)
        const experienceScore = this.calculateExperienceScore(
          volunteer.experienceLevel,
          opportunity.requiredExperienceLevel
        );
        totalScore += experienceScore * 0.15;
        weights += 0.15;

        // Time availability score (10% weight)
        const timeScore = this.calculateTimeScore(
          volunteer.availability,
          opportunity.date,
          opportunity.timeOfDay
        );
        totalScore += timeScore * 0.1;
        weights += 0.1;

        const finalScore = weights > 0 ? totalScore / weights : 0;

        // Only include volunteers with a reasonable match score
        if (finalScore >= 0.3) {
          matches.push({
            volunteer: {
              _id: volunteer._id,
              name: volunteer.name,
              email: volunteer.email,
              location: volunteer.location,
              skills: volunteer.skills,
              experienceLevel: volunteer.experienceLevel,
              wasteTypePreferences: volunteer.wasteTypePreferences,
              bio: volunteer.bio
            },
            score: Math.round(finalScore * 100),
            matchReasons: {
              location: Math.round(locationScore * 100),
              wasteTypes: Math.round(wasteTypeScore * 100),
              skills: Math.round(skillsScore * 100),
              experience: Math.round(experienceScore * 100),
              timeAvailability: Math.round(timeScore * 100)
            }
          });
        }
      }

      // Sort by score and return top matches
      matches.sort((a, b) => b.score - a.score);
      return matches.slice(0, limit);

    } catch (error) {
      console.error('Error finding matching volunteers:', error);
      throw error;
    }
  }
}

module.exports = new MatchingService();
