const mongoose = require('mongoose');

const claimWorkflowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  registrationCompleted: { type: Boolean, default: true },
  loginCompleted: { type: Boolean, default: true },
  profileCompleted: { type: Boolean, default: false },
  policyVerified: { type: Boolean, default: false },
  incidentReported: { type: Boolean, default: false },
  documentsUploaded: { type: Boolean, default: false },
  damageAnalysisCompleted: { type: Boolean, default: false },
  claimEstimated: { type: Boolean, default: false },
  garageSelected: { type: Boolean, default: false },
  claimReviewed: { type: Boolean, default: false },
  claimSubmitted: { type: Boolean, default: false },
  
  policyDetails: { type: Object, default: null },
  incidentDetails: { type: Object, default: null },
  uploadedDocs: { type: Array, default: [] },
  aiAssessment: { type: Object, default: null },
  estimationDetails: { type: Object, default: null },
  selectedGarage: { type: String, default: null }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ClaimWorkflow', claimWorkflowSchema);
