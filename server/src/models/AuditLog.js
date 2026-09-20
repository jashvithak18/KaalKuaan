const mongoose = require('mongoose');
const crypto = require('crypto');

const AuditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    default: () => `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  },
  timestamp: { type: Date, default: Date.now, index: true },
  timeFormatted: { type: String, required: true },
  wellId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  actor: { type: String, required: true },
  role: { type: String, default: 'SYSTEM' },
  previousState: { type: String },
  newState: { type: String },
  details: { type: String },
  ipAddress: { type: String, default: '127.0.0.1' },
  entryHash: { type: String }
}, {
  timestamps: false // Immutable, only creation timestamp matters
});

// Calculate tamper-evident SHA-256 hash before saving
AuditLogSchema.pre('save', function(next) {
  if (!this.entryHash) {
    const dataString = `${this.logId}|${this.timestamp.toISOString()}|${this.wellId}|${this.action}|${this.actor}|${this.newState}`;
    this.entryHash = crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
  }
  next();
});

// Enforce append-only at application layer
AuditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function(next) {
  next(new Error('IMMUTABILITY VIOLATION: Audit log entries cannot be modified or deleted.'));
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
