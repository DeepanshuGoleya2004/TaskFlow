const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Todo', 'In Progress', 'Review', 'Completed'], 
    default: 'Todo' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  assignee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  due_date: { type: String, default: null },
  estimated_minutes: { type: Number, default: 0 },
  actual_minutes: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
