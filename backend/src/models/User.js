const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobileNumber: { type: String, required: true, unique: true, index: true },
  password: { 
    type: String, 
    required: true
  },
  role: { type: String, enum: ['Admin', 'Member', 'Guest'], default: 'Member' },
  avatar: { type: String, default: '' },
  isGuest: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
