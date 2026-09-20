const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const { processAssistantMessage } = require('../services/aiAssistantService');

// @route   POST /api/ai/assistant
// @desc    Process conversational safety queries with deterministic DB grounding
router.post('/assistant', protect, async (req, res) => {
  try {
    const {
      message,
      conversationHistory = [],
      userLocation = null,
      locationName = '',
      hasPermission = false,
      currentAlert = null,
      userReports = [],
      action = null,
      reportDraft = null
    } = req.body;

    // Handle explicit report confirmation action
    if (action === 'CONFIRM_SUBMIT_REPORT' && reportDraft) {
      const reportId = `KK-R-${Math.floor(10000 + Math.random() * 90000)}`;
      const userId = req.user?.userId || 'PUBLIC_CITIZEN';

      const newReport = new Report({
        reportId,
        userId,
        hazardType: reportDraft.hazardType || 'Uncovered Borewell',
        locationName: reportDraft.locationName || locationName || 'Citizen GPS Pin',
        area: reportDraft.locationName || locationName || 'Vemulapally, Telangana',
        coordinates: reportDraft.coordinates || userLocation,
        description: reportDraft.description || 'Reported via Kaal Kuaan AI Safety Assistant',
        reporterType: 'CITIZEN_WEB',
        status: 'Pending'
      });

      await newReport.save();

      // Log to audit trail
      try {
        await AuditLog.create({
          action: 'CITIZEN_REPORT_SUBMITTED_AI',
          actor: req.user?.name || 'Citizen User',
          role: req.user?.role || 'PUBLIC',
          details: `Report ${reportId} submitted via AI Assistant for ${newReport.locationName}`,
          metadata: { reportId, hazardType: newReport.hazardType }
        });
      } catch (auditErr) {
        console.warn('Audit log write error:', auditErr.message);
      }

      return res.json({
        success: true,
        reply: `Report submitted successfully.\n\n• **Reference ID:** ${reportId}\n• **Status:** Pending Verification\n• **Hazard:** ${newReport.hazardType}\n• **Location:** ${newReport.locationName}\n\nYour report has been logged in the Mandal revenue & Gram Panchayat queue. Thank you for helping keep your community safe.`,
        suggestedActions: [
          {
            type: 'VIEW_ON_MAP',
            label: 'View on Live Map'
          }
        ],
        submittedReport: newReport
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    // Process query through safety orchestrator
    const result = await processAssistantMessage({
      message: message.trim(),
      conversationHistory,
      userLocation,
      locationName,
      hasPermission,
      currentAlert,
      userReports,
      authenticatedUser: req.user
    });

    res.json({
      success: true,
      reply: result.reply,
      suggestedActions: result.suggestedActions || [],
      reportDraft: result.reportDraft || null
    });
  } catch (error) {
    console.error('[AI ASSISTANT ROUTE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'I could not retrieve safety information right now. Please try again shortly.',
      reply: 'I could not retrieve safety information right now. The Kaal Kuaan safety network is operational — please check the map or scan views directly.'
    });
  }
});

module.exports = router;
