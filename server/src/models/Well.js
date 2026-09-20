const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  actor: { type: String, default: 'System' },
  statusType: { type: String, default: 'info' } // info, warning, danger, success
});

const WellSchema = new mongoose.Schema({
  wellId: { type: String, required: true, unique: true, index: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  district: { type: String, default: 'Nalgonda', index: true },
  mandal: { type: String, required: true, index: true },
  village: { type: String, required: true, index: true },
  area: { type: String, default: 'Ramanapet, Telangana' },
  hazardType: {
    type: String,
    enum: ['Uncovered Borewell', 'Abandoned Borewell', 'Open Well', 'Unverified Borewell', 'Damaged Cover', 'Other'],
    default: 'Uncovered Borewell'
  },
  description: { type: String, default: 'Reported open borewell in agricultural field' },
  lastVerified: { type: String, default: '18 Sep 2026' },
  surveyNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['UNVERIFIED', 'ACTION_REQUIRED', 'CAPPED_PENDING_AUDIT', 'VERIFIED_SAFE', 'Open', 'Reported', 'Verified', 'Secured'],
    default: 'UNVERIFIED',
    index: true
  },
  riskLevel: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'HIGH',
    index: true
  },
  detectionSource: {
    type: String,
    default: 'SIMULATED SATELLITE ANOMALY (Sentinel-2 Cadastral Overlay)'
  },
  detectionConfidence: { type: Number, default: 87 },
  detectionDate: { type: String, default: '18 Sep 2026' },
  permitStatus: {
    type: String,
    enum: ['NO_RECORD', 'MATCHED', 'EXPIRED', 'UNREGISTERED_DRILLING'],
    default: 'NO_RECORD'
  },
  permitDetails: {
    permitNumber: { type: String, default: 'NONE' },
    applicantName: { type: String, default: 'Not on official record' },
    rigOperatorId: { type: String, default: 'Unregistered' }
  },
  evidence: {
    diameterEstimate: { type: String, default: '0.65m' },
    voidSignature: { type: String, default: 'Circular dark void signature confirmed' },
    nearHabitation: { type: Boolean, default: true },
    distanceToSchool: { type: String, default: '180m from Zilla Parishad Primary School' },
    distanceToRoad: { type: String, default: '25m from cart track / village road' },
    summary: { type: String, default: 'High vulnerability: Unregistered void anomaly within 200m of village children transit path.' }
  },
  photos: [{
    type: { type: String, enum: ['SATELLITE', 'FIELD_EVIDENCE', 'CAPPING_CONFIRMATION', 'REPORT'] },
    url: { type: String, required: true },
    caption: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  lastInspection: { type: Date, default: null },
  compliance: {
    noticeIssued: { type: Boolean, default: false },
    noticeDate: { type: String, default: null },
    deadline: { type: String, default: null },
    assignedAuthority: { type: String, default: 'Panchayat Secretary' },
    enforcementStage: {
      type: String,
      enum: ['NOTICE_PENDING', 'NOTICE_DISPATCHED', 'CAPPING_ORDERED', 'CAPPED_VERIFIED'],
      default: 'NOTICE_PENDING'
    }
  },
  qrCertificate: {
    certificateId: { type: String, default: null },
    issuedAt: { type: Date, default: null },
    officer: { type: String, default: null },
    verificationId: { type: String, default: null },
    sealHash: { type: String, default: null }
  },
  timeline: [TimelineEventSchema],
  isDemoTarget: { type: Boolean, default: false } // To highlight in guided demo
}, {
  timestamps: true
});

module.exports = mongoose.model('Well', WellSchema);
