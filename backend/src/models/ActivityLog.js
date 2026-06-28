const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  details: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
