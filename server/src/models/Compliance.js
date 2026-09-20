const mongoose = require('mongoose');

const ComplianceSchema = new mongoose.Schema({
  complianceId: { type: String, required: true, unique: true, index: true },
  wellId: { type: String, required: true, ref: 'Well', index: true },
  district: { type: String, default: 'Nalgonda' },
  mandal: { type: String, required: true },
  village: { type: String, required: true },
  surveyNumber: { type: String, required: true },
  landownerName: { type: String, default: 'K. Venkataiah / Unknown Heir' },
  status: {
    type: String,
    enum: ['ACTION_REQUIRED', 'NOTICE_SERVED', 'CAPPING_ENFORCED', 'VERIFIED_SAFE', 'OVERDUE'],
    default: 'ACTION_REQUIRED',
    index: true
  },
  flaggedDate: { type: String, required: true },
  statutoryDeadline: { type: String, required: true },
  noticeReferenceNumber: { type: String },
  noticeDispatchedAt: { type: Date },
  penaltyApplicable: { type: Boolean, default: false },
  penaltyAmount: { type: Number, default: 0 },
  assignedOfficer: { type: String, default: 'Panchayat Extension Officer' },
  actionsLog: [{
    action: { type: String },
    actor: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Compliance', ComplianceSchema);
