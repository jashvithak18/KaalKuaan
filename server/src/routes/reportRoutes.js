const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

// Helper to extract user if token present
const getOptionalUserId = (req) => {
  if (req.query.userId) return req.query.userId;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kaal_kuaan_operational_secret_key_2026');
      return decoded.id;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// @route   GET /api/reports/my-reports
// @desc    Get reports submitted by the logged-in user
router.get('/my-reports', async (req, res) => {
  try {
    const userId = getOptionalUserId(req);
    let query = {};
    if (userId) {
      query.$or = [{ userId }, { userId: 'PUBLIC_ANON' }];
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reports
// @desc    Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reports
// @desc    Create new citizen hazard report
router.post('/', async (req, res) => {
  try {
    const {
      hazardType = 'Uncovered Borewell',
      locationName,
      area = 'Ramanapet, Telangana',
      coordinates,
      description,
      photo,
      photoUrl,
      wellId,
      userId = getOptionalUserId(req) || 'USR-PUBLIC-04'
    } = req.body;

    const reportId = `KK-R-${Math.floor(10000 + Math.random() * 90000)}`;

    const report = await Report.create({
      reportId,
      userId,
      wellId,
      hazardType,
      locationName: locationName || area,
      area,
      coordinates: coordinates || { lat: 17.0542, lng: 79.2685 },
      description: description || `${hazardType} reported by citizen`,
      photo: photo || photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
      status: 'Pending',
      reporterType: 'CITIZEN_WEB',
      submittedAt: new Date()
    });

    // Log to Audit trail
    try {
      const now = new Date();
      await AuditLog.create({
        wellId: reportId,
        timeFormatted: `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        action: 'HAZARD_REPORT_SUBMITTED',
        actor: userId,
        role: 'PUBLIC',
        newState: 'Pending',
        details: `Report ${reportId}: ${hazardType} at ${locationName || area}`
      });
    } catch (e) {
      console.error('Audit log failed:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Report received. Your report will enter the verification chain.',
      reportId,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/reports/:id/status
// @desc    Update report status (Pending -> Under Review -> Verified -> Resolved)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findOneAndUpdate(
      { reportId: req.params.id },
      { status },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
