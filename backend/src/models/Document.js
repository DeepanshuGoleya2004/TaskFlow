const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  type: { type: String, required: true }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Document', documentSchema);
