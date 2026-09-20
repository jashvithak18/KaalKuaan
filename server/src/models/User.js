const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['PUBLIC', 'FIELD_OFFICER', 'PANCHAYAT', 'DISTRICT_ADMIN', 'SUPER_ADMIN'],
    default: 'PUBLIC'
  },
  jurisdiction: {
    district: { type: String, default: 'Nalgonda' },
    mandal: { type: String },
    village: { type: String }
  },
  badgeOrPhone: { type: String },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
