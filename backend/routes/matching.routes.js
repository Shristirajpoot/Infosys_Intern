// routes/matching.routes.js
const express = require('express');
const {
  getMatchingOpportunities,
  getMatchingVolunteers,
  updateVolunteerPreferences,
  inviteVolunteer
} = require('../controllers/matching.controller');
const protectRoute = require('../middleware/protectRoute');

const router = express.Router();

// Get matching opportunities for a volunteer
router.get('/opportunities', protectRoute, getMatchingOpportunities);

// Get matching volunteers for an opportunity (NGO only)
router.get('/volunteers/:opportunityId', protectRoute, getMatchingVolunteers);

// Update volunteer preferences
router.put('/preferences', protectRoute, updateVolunteerPreferences);

// Invite a volunteer to an opportunity (NGO only)
router.post('/invite', protectRoute, inviteVolunteer);

module.exports = router;
