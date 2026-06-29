const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  datePaid: { type: Date, default: Date.now },
  status: { type: String, required: true, default: 'Paid' },
  referenceNumber: { type: String, required: true }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema);
