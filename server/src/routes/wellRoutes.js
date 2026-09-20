const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Well = require('../models/Well');
const Report = require('../models/Report');
const Verification = require('../models/Verification');
const Compliance = require('../models/Compliance');
const AuditLog = require('../models/AuditLog');

// Helper to append immutable audit log
const logAudit = async ({ wellId, action, actor, role, newState, details }) => {
  try {
    const now = new Date();
    const timeFormatted = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    await AuditLog.create({
      wellId,
      timeFormatted,
      action,
      actor: actor || 'Field Officer / System',
      role: role || 'FIELD_OFFICER',
      newState,
      details
    });
  } catch (err) {
    console.error('[AUDIT LOG FAILED]', err.message);
  }
};

// @route   GET /api/wells
// @desc    Get all borewells with optional filters
router.get('/', async (req, res) => {
  try {
    const { mandal, village, status, riskLevel, search } = req.query;
    let query = {};

    if (mandal && mandal !== 'ALL') query.mandal = mandal;
    if (village && village !== 'ALL') query.village = village;
    if (status && status !== 'ALL') query.status = status;
    if (riskLevel && riskLevel !== 'ALL') query.riskLevel = riskLevel;

    if (search) {
      query.$or = [
        { wellId: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { surveyNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const wells = await Well.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: wells.length, data: wells });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/wells/statistics
// @desc    Get summary statistics for dashboard / status bar
router.get('/statistics', async (req, res) => {
  try {
    const total = await Well.countDocuments();
    const unverified = await Well.countDocuments({ status: 'UNVERIFIED' });
    const highRisk = await Well.countDocuments({ riskLevel: 'HIGH', status: { $ne: 'VERIFIED_SAFE' } });
    const actionRequired = await Well.countDocuments({ status: 'ACTION_REQUIRED' });
    const verifiedSafe = await Well.countDocuments({ status: 'VERIFIED_SAFE' });

    // Mandal breakdown
    const mandalAggregation = await Well.aggregate([
      {
        $group: {
          _id: '$mandal',
          total: { $sum: 1 },
          highRisk: {
            $sum: { $cond: [{ $and: [{ $eq: ['$riskLevel', 'HIGH'] }, { $ne: ['$status', 'VERIFIED_SAFE'] }] }, 1, 0] }
          },
          actionRequired: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTION_REQUIRED'] }, 1, 0] }
          },
          verifiedSafe: {
            $sum: { $cond: [{ $eq: ['$status', 'VERIFIED_SAFE'] }, 1, 0] }
          },
          unverified: {
            $sum: { $cond: [{ $eq: ['$status', 'UNVERIFIED'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        unverified,
        highRisk,
        actionRequired,
        verifiedSafe,
        mandalBreakdown: mandalAggregation,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/wells/:id
// @desc    Get single borewell by ID or wellId
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let well = await Well.findOne({ wellId: id });
    if (!well && id.match(/^[0-9a-fA-F]{24}$/)) {
      well = await Well.findById(id);
    }

    if (!well) {
      return res.status(404).json({ success: false, message: 'Well record not found in safety network' });
    }

    // Also fetch any associated compliance record or reports
    const compliance = await Compliance.findOne({ wellId: well.wellId });
    const verification = await Verification.findOne({ wellId: well.wellId }).sort({ verifiedAt: -1 });

    res.json({
      success: true,
      data: {
        ...well.toObject(),
        complianceRecord: compliance,
        latestVerification: verification
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wells/:id/verify
// @desc    Field officer verification submission
router.post('/:id/verify', async (req, res) => {
  try {
    const well = await Well.findOne({ wellId: req.params.id });
    if (!well) {
      return res.status(404).json({ success: false, message: 'Well record not found' });
    }

    const {
      officerName = 'K. Venkateshwar Rao (AFO-NL-884)',
      badgeNumber = 'AFO-NL-884',
      gpsCoordinates = { lat: well.coordinates.lat + 0.00005, lng: well.coordinates.lng - 0.00004 },
      statusFound, // 'OPEN_DANGEROUS', 'CAPPED_TEMPORARY', 'PERMANENTLY_SEALED', 'NOT_FOUND_FALSE_ALARM'
      dangerPresent,
      photoUrl,
      dualImageMatchConfirmed = true,
      matchVerdict = 'MATCH',
      remarks
    } = req.body;

    const verificationId = `KV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Verification Document
    const verification = await Verification.create({
      verificationId,
      wellId: well.wellId,
      officer: {
        name: officerName,
        badgeNumber,
        designation: 'Mandal Agricultural Field Officer'
      },
      gpsCoordinates,
      statusFound: statusFound || 'OPEN_DANGEROUS',
      dangerPresent: dangerPresent !== undefined ? dangerPresent : true,
      photos: photoUrl ? [{ type: 'FIELD_PHOTO', url: photoUrl }] : [],
      dualImageMatchConfirmed,
      matchVerdict,
      remarks: remarks || 'On-site field verification conducted with calibrated GPS lock.'
    });

    // Update Well Status & Evidence
    let newStatus = 'ACTION_REQUIRED';
    let newRisk = 'HIGH';
    if (statusFound === 'PERMANENTLY_SEALED') {
      newStatus = 'VERIFIED_SAFE';
      newRisk = 'LOW';
    } else if (statusFound === 'NOT_FOUND_FALSE_ALARM') {
      newStatus = 'VERIFIED_SAFE';
      newRisk = 'LOW';
    }

    well.status = newStatus;
    well.riskLevel = newRisk;
    well.lastInspection = new Date();

    if (photoUrl) {
      well.photos.push({
        type: 'FIELD_EVIDENCE',
        url: photoUrl,
        caption: `Field inspection evidence by ${officerName}`,
        timestamp: new Date()
      });
    }

    const todayDate = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;

    well.timeline.push({
      date: todayDate,
      timestamp: new Date(),
      event: `Field verification completed by ${officerName}: ${statusFound.replace(/_/g, ' ')}. Danger confirmed.`,
      actor: officerName,
      statusType: dangerPresent ? 'danger' : 'success'
    });

    await well.save();

    // Ensure compliance record exists or update it
    let compliance = await Compliance.findOne({ wellId: well.wellId });
    if (!compliance) {
      compliance = await Compliance.create({
        complianceId: `CMP-NL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        wellId: well.wellId,
        mandal: well.mandal,
        village: well.village,
        surveyNumber: well.surveyNumber,
        status: newStatus === 'VERIFIED_SAFE' ? 'VERIFIED_SAFE' : 'ACTION_REQUIRED',
        flaggedDate: todayDate,
        statutoryDeadline: `${new Date().getDate() + 3} ${new Date().toLocaleString('default', { month: 'short' })} 2026`,
        noticeReferenceNumber: `REV/WALTA/2026/${well.mandal.substring(0, 3).toUpperCase()}/${well.surveyNumber.replace('/', '-')}`
      });
    } else {
      compliance.status = newStatus === 'VERIFIED_SAFE' ? 'VERIFIED_SAFE' : 'ACTION_REQUIRED';
      compliance.actionsLog.push({
        action: `Field verification logged: ${statusFound}`,
        actor: officerName,
        timestamp: new Date()
      });
      await compliance.save();
    }

    // Append to Audit Log
    await logAudit({
      wellId: well.wellId,
      action: 'FIELD_VERIFICATION_SUBMITTED',
      actor: officerName,
      role: 'FIELD_OFFICER',
      newState: newStatus,
      details: `Field status: ${statusFound}. Image Match: ${matchVerdict}. Danger Present: ${dangerPresent}`
    });

    res.json({
      success: true,
      message: 'Field verification registered successfully',
      data: {
        well,
        verification,
        compliance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/wells/:id/status
// @desc    Update borewell status (e.g., mark as capped/safe, issue QR certificate)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, actor = 'Vemulapally Gram Panchayat', cappingPhotoUrl, remarks } = req.body;
    const well = await Well.findOne({ wellId: req.params.id });

    if (!well) {
      return res.status(404).json({ success: false, message: 'Well record not found' });
    }

    const prevStatus = well.status;
    well.status = status;

    if (status === 'VERIFIED_SAFE') {
      well.riskLevel = 'LOW';
      // Issue QR Safety Certificate
      const certId = `CERT-NL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const verificationId = `KV-${Math.floor(100000 + Math.random() * 900000)}`;
      const sealHash = crypto.createHash('sha256').update(`${certId}-${well.wellId}-${Date.now()}`).digest('hex').substring(0, 16).toUpperCase();

      well.qrCertificate = {
        certificateId: certId,
        issuedAt: new Date(),
        officer: actor,
        verificationId,
        sealHash
      };

      if (cappingPhotoUrl) {
        well.photos.push({
          type: 'CAPPING_CONFIRMATION',
          url: cappingPhotoUrl,
          caption: `Concrete capping verification photograph: ${remarks || 'Permanent reinforced concrete seal installed.'}`,
          timestamp: new Date()
        });
      }

      well.compliance.enforcementStage = 'CAPPED_VERIFIED';
    }

    const todayDate = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;

    well.timeline.push({
      date: todayDate,
      timestamp: new Date(),
      event: `Status transitioned from ${prevStatus} to ${status}. ${remarks || 'Capping compliance enforced.'}`,
      actor,
      statusType: status === 'VERIFIED_SAFE' ? 'success' : 'warning'
    });

    await well.save();

    // Update Compliance record if exists
    const compliance = await Compliance.findOne({ wellId: well.wellId });
    if (compliance) {
      compliance.status = status === 'VERIFIED_SAFE' ? 'VERIFIED_SAFE' : status;
      compliance.actionsLog.push({
        action: `Status escalated to ${status}. Verified by ${actor}`,
        actor,
        timestamp: new Date()
      });
      await compliance.save();
    }

    // Log to Audit Trail
    await logAudit({
      wellId: well.wellId,
      action: `STATUS_CHANGED_${status}`,
      actor,
      role: 'PANCHAYAT',
      newState: status,
      details: `Transition from ${prevStatus} to ${status}. Certificate: ${well.qrCertificate?.certificateId || 'N/A'}`
    });

    res.json({
      success: true,
      message: `Well ${well.wellId} status updated to ${status}`,
      data: well
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wells/report
// @desc    Citizen web report submission (Simple 3-step reporting)
router.post('/report', async (req, res) => {
  try {
    const {
      photoUrl,
      coordinates,
      locationName,
      description,
      language = 'en',
      voiceRecorded = false,
      voiceTranscript = ''
    } = req.body;

    const reportId = `KK-R-${Math.floor(10000 + Math.random() * 90000)}`;

    const report = await Report.create({
      reportId,
      reporterType: 'CITIZEN_WEB',
      photo: photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
      coordinates: coordinates || { lat: 17.0542, lng: 79.2685 },
      locationName: locationName || 'Agricultural plot near road',
      description: description || 'Uncapped borewell hole spotted near farm path',
      language,
      voiceRecorded,
      voiceTranscript,
      status: 'RECEIVED'
    });

    await logAudit({
      wellId: reportId,
      action: 'CITIZEN_REPORT_FILED',
      actor: 'Public Citizen (Web)',
      role: 'PUBLIC',
      newState: 'RECEIVED',
      details: `Location: ${locationName || 'GPS Location'}. Lang: ${language}. Voice: ${voiceRecorded ? 'Yes' : 'No'}`
    });

    res.json({
      success: true,
      message: 'Citizen safety report registered with local Panchayat network',
      reportId,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wells/whatsapp-sim
// @desc    Simulated WhatsApp Bot conversational report generator
router.post('/whatsapp-sim', async (req, res) => {
  try {
    const { message, photoUrl, coordinates, locationName } = req.body;
    const reportId = `KK-R-${Math.floor(10000 + Math.random() * 90000)}`;

    const report = await Report.create({
      reportId,
      reporterType: 'WHATSAPP_BOT',
      photo: photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
      coordinates: coordinates || { lat: 17.0620, lng: 79.2810 },
      locationName: locationName || 'Settipalem village canal path',
      description: message || 'Open borewell near school path',
      language: 'te',
      status: 'FIELD_DISPATCHED',
      rawWhatsAppPayload: {
        timestamp: new Date(),
        channel: 'WhatsApp Bot Simulated',
        botAckTime: '4s'
      }
    });

    await logAudit({
      wellId: reportId,
      action: 'WHATSAPP_REPORT_INGESTED',
      actor: 'WhatsApp Bot Listener (Simulated)',
      role: 'SYSTEM',
      newState: 'RECEIVED',
      details: `Citizen report ${reportId} processed via WhatsApp automated channel.`
    });

    res.json({
      success: true,
      reportId,
      botResponse: {
        reply: `Thank you. Your report ID is ${reportId}. The nearest Mandal Field Officer and Gram Panchayat have been alerted.`,
        reportId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
