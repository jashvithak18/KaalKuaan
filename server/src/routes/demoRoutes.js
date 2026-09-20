const express = require('express');
const router = express.Router();
const seedDefaultData = require('../utils/seedData');
const Well = require('../models/Well');

// @route   POST /api/demo/reset
// @desc    Completely resets the database to pristine initial state for demonstration
router.post('/reset', async (req, res) => {
  try {
    await seedDefaultData();
    const demoWell = await Well.findOne({ wellId: 'KK-TS-04281' });
    res.json({
      success: true,
      message: 'Demo state successfully reset to initial pristine scan condition.',
      targetWell: demoWell
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
