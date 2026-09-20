const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true },
  wellId: { type: String, ref: 'Well', index: true },
  hazardType: {
    type: String,
    default: 'Uncovered Borewell'
  },
  reporterType: {
    type: String,
    enum: ['CITIZEN_WEB', 'CITIZEN_PORTAL', 'WHATSAPP_BOT', 'PANCHAYAT_VOLUNTEER', 'FIELD_OFFICER'],
    default: 'CITIZEN_WEB'
  },
  photo: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  locationName: { type: String },
  area: { type: String },
  description: { type: String },
  language: {
    type: String,
    enum: ['te', 'hi', 'ta', 'kn', 'mr', 'en'],
    default: 'en'
  },
  voiceRecorded: { type: Boolean, default: false },
  voiceTranscript: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Verified', 'Resolved', 'RECEIVED', 'TRIAGED', 'FIELD_DISPATCHED', 'REJECTED'],
    default: 'Pending'
  },
  rawWhatsAppPayload: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);
