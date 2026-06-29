const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { type: String, required: true, default: 'Active' },
  coverageAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Policy', policySchema);
