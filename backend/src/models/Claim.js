const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimNumber: { type: String, required: true, unique: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
  description: { type: String, required: true },
  status: { type: String, required: true, default: 'Submitted' },
  amount: { type: Number, required: true },
  dateFiled: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Claim', claimSchema);
