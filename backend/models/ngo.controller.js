// controllers/ngo.controller.js

const Application = require('../models/application.model');
const Opportunity = require('../models/opportunity.model');
const mongoose = require('mongoose');
const { Parser } = require('json2csv'); // For CSV export

// ---------------------------
// 1️⃣ Review Application
// ---------------------------
/**
 * Review an application for an event.
 * NGO can accept, reject, or withdraw an application.
 */
const reviewApplication = async (req, res) => {
  const { eventId, registrationId } = req.params;
  const { status, reviewMessage } = req.body;

  try {
    // Validate status
    if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if NGO owns the event
    const opportunity = await Opportunity.findById(eventId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!opportunity.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find the application
    const application = await Application.findById(registrationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Update application review
    application.status = status;
    application.reviewMessage = reviewMessage || '';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------------
// 2️⃣ Mark Attendance
// ---------------------------
/**
 * Mark attendance for a single volunteer.
 */
const markAttendance = async (req, res) => {
  const { eventId, volunteerId } = req.params;
  const { status, arrivalTime, notes } = req.body;

  try {
    // Check if NGO owns the event
    const opportunity = await Opportunity.findById(eventId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!opportunity.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find the volunteer's application
    const application = await Application.findOne({ opportunityId: eventId, volunteerId });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Update attendance
    application.attendance = {
      status,
      markedAt: new Date(),
      markedBy: req.user._id,
      arrivalTime: arrivalTime || null,
      notes: notes || ''
    };

    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------------
// 3️⃣ Mark All Volunteers Present
// ---------------------------
const markAllPresent = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check if NGO owns the event
    const opportunity = await Opportunity.findById(eventId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!opportunity.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Update all accepted applications to 'present'
    const result = await Application.updateMany(
      { opportunityId: eventId, status: 'accepted' },
      {
        $set: {
          'attendance.status': 'present',
          'attendance.markedAt': new Date(),
          'attendance.markedBy': req.user._id
        }
      }
    );

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------------
// 4️⃣ Export Attendance Report (CSV)
// ---------------------------
const exportAttendanceReport = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check if NGO owns the event
    const opportunity = await Opportunity.findById(eventId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!opportunity.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const applications = await Application.find({ opportunityId: eventId })
      .populate('volunteerId', 'name email')
      .populate('reviewedBy', 'name email');

    const data = applications.map(app => ({
      Volunteer: app.volunteerId.name,
      Email: app.volunteerId.email,
      ApplicationStatus: app.status,
      ReviewMessage: app.reviewMessage || '',
      ReviewedBy: app.reviewedBy ? app.reviewedBy.name : '',
      AttendanceStatus: app.attendance.status,
      ArrivalTime: app.attendance.arrivalTime || '',
      Notes: app.attendance.notes || '',
      MarkedAt: app.attendance.markedAt ? app.attendance.markedAt.toISOString() : ''
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_report_${eventId}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  reviewApplication,
  markAttendance,
  markAllPresent,
  exportAttendanceReport
};
