const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  verificationId: { type: String, required: true, unique: true, index: true },
  wellId: { type: String, required: true, index: true },
  officer: {
    id: { type: String },
    name: { type: String, required: true },
    designation: { type: String, default: 'Mandal Agricultural Field Officer' },
    badgeNumber: { type: String, default: 'AFO-NL-884' }
  },
  gpsCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracyMeters: { type: Number, default: 4.2 }
  },
  statusFound: {
    type: String,
    enum: ['OPEN_DANGEROUS', 'CAPPED_TEMPORARY', 'PERMANENTLY_SEALED', 'NOT_FOUND_FALSE_ALARM'],
    required: true
  },
  dangerPresent: { type: Boolean, required: true },
  photos: [{
    type: { type: String, enum: ['FIELD_PHOTO', 'CAPPING_PHOTO'] },
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  dualImageMatchConfirmed: { type: Boolean, default: false },
  matchVerdict: {
    type: String,
    enum: ['MATCH', 'NOT_MATCH', 'UNCERTAIN'],
    default: 'MATCH'
  },
  remarks: { type: String },
  verifiedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Verification', VerificationSchema);
