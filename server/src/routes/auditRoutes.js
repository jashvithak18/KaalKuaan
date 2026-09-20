const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// @route   GET /api/audit
// @desc    Get append-only audit trail
router.get('/', async (req, res) => {
  try {
    const { wellId, limit = 50 } = req.query;
    let query = {};
    if (wellId) query.wellId = wellId;

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json({
      success: true,
      count: logs.length,
      disclaimer: 'APPEND-ONLY IMMUTABLE ACTIVITY LOG',
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
