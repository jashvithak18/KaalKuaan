const express = require('express');
const router = express.Router();
const Well = require('../models/Well');

// Helper: Haversine distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// @route   GET /api/public/map
// @desc    Sanitized public safety map data with proximity scan
router.get('/map', async (req, res) => {
  try {
    const { lat, lng, radius = 2000, search } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { village: { $regex: search, $options: 'i' } },
        { mandal: { $regex: search, $options: 'i' } }
      ];
    }

    const wells = await Well.find(query).select(
      'wellId coordinates district mandal village surveyNumber status riskLevel detectionDate lastInspection qrCertificate'
    );

    let parsedLat = parseFloat(lat);
    let parsedLng = parseFloat(lng);
    let wellsWithDistance = wells.map((w) => {
      let dist = null;
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        dist = Math.round(getDistanceMeters(parsedLat, parsedLng, w.coordinates.lat, w.coordinates.lng));
      }
      return {
        ...w.toObject(),
        distanceMeters: dist,
        // Strip sensitive internal data, only keep public classification
        publicSafetyStatus:
          w.status === 'VERIFIED_SAFE'
            ? 'VERIFIED SAFE / CAPPED'
            : w.status === 'ACTION_REQUIRED'
            ? 'ACTION REQUIRED / HIGH RISK'
            : 'REPORTED / UNVERIFIED'
      };
    });

    // Count open risks within 1km
    let nearbyDangers = 0;
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      nearbyDangers = wellsWithDistance.filter(
        (w) => w.distanceMeters <= 1000 && w.status !== 'VERIFIED_SAFE'
      ).length;
    }

    res.json({
      success: true,
      meta: {
        title: 'KNOW THE DANGERS BEFORE YOU WALK THERE.',
        subtext: 'Official Public Borewell Safety Radar for Citizens & Panchayats',
        queryCenter: !isNaN(parsedLat) ? { lat: parsedLat, lng: parsedLng } : null,
        nearbyDangersWithin1km: nearbyDangers,
        disclaimer: 'SIMULATED DATA — HACKATHON DEMO'
      },
      count: wellsWithDistance.length,
      data: wellsWithDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
