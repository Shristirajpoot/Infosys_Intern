const express = require('express');
const router = express.Router();
const Opportunity = require('../models/opportunity.model.js');
const protectRoute = require('../middleware/protectRoute');

// Create new opportunity
router.post('/', protectRoute, async (req, res) => {
    try {
        const opportunity = new Opportunity({
            ...req.body,
            createdBy: req.user._id
        });
        await opportunity.save();
        res.status(201).json({ success: true, opportunity });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// Get all opportunities
router.get('/', async (req, res) => {
    try {
        const opportunities = await Opportunity.find().populate('createdBy', 'name email');
        res.json({ success: true, opportunities });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
