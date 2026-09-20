const express = require('express');
const router = express.Router();
const Compliance = require('../models/Compliance');
const Well = require('../models/Well');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/compliance
// @desc    Get all compliance records formatted as an inspection ledger
router.get('/', async (req, res) => {
  try {
    const { status, mandal } = req.query;
    let query = {};
    if (status && status !== 'ALL') query.status = status;
    if (mandal && mandal !== 'ALL') query.mandal = mandal;

    const records = await Compliance.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/compliance/:id/notice
// @desc    Issue official statutory notice to landowner
router.patch('/:id/notice', async (req, res) => {
  try {
    const { noticeReferenceNumber, deadline } = req.body;
    const compliance = await Compliance.findOne({ complianceId: req.params.id });

    if (!compliance) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }

    compliance.status = 'NOTICE_SERVED';
    compliance.noticeReferenceNumber = noticeReferenceNumber || `REV/WALTA/2026/VML/${Math.floor(100 + Math.random() * 900)}`;
    compliance.noticeDispatchedAt = new Date();
    if (deadline) compliance.statutoryDeadline = deadline;

    compliance.actionsLog.push({
      action: `Statutory 48-Hour Capping Notice ${compliance.noticeReferenceNumber} dispatched to landowner`,
      actor: 'Panchayat Secretary',
      timestamp: new Date()
    });

    await compliance.save();

    // Update corresponding Well model
    await Well.updateOne(
      { wellId: compliance.wellId },
      {
        $set: {
          'compliance.noticeIssued': true,
          'compliance.noticeDate': new Date().toLocaleDateString(),
          'compliance.deadline': compliance.statutoryDeadline,
          'compliance.enforcementStage': 'NOTICE_DISPATCHED'
        },
        $push: {
          timeline: {
            date: `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`,
            timestamp: new Date(),
            event: `Statutory capping notice issued to landowner: ${compliance.noticeReferenceNumber}`,
            actor: 'Panchayat Secretary',
            statusType: 'warning'
          }
        }
      }
    );

    // Audit Log
    const now = new Date();
    await AuditLog.create({
      wellId: compliance.wellId,
      timeFormatted: `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      action: 'STATUTORY_NOTICE_DISPATCHED',
      actor: 'Panchayat Secretary',
      role: 'PANCHAYAT',
      newState: 'NOTICE_SERVED',
      details: `Official notice ${compliance.noticeReferenceNumber} issued. Deadline: ${compliance.statutoryDeadline}`
    });

    res.json({ success: true, message: 'Notice dispatched successfully', data: compliance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
