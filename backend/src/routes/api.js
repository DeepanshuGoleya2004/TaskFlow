const express = require('express');
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');

// Mongoose Models
const User = require('../models/User');
const Category = require('../models/Category');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

// ==========================================
// 1. Dashboard Statistics
// ==========================================
router.get('/dashboard/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Scoped metrics queries
    const total = await Task.countDocuments({ user_id: userId });
    const completed = await Task.countDocuments({ user_id: userId, status: 'Completed' });
    const inProgress = await Task.countDocuments({ user_id: userId, status: 'In Progress' });
    const overdue = await Task.countDocuments({
      user_id: userId,
      status: { $ne: 'Completed' },
      due_date: { $lt: today, $ne: null }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Categories list to build counts
    const categories = await Category.find().sort({ name: 1 });
    
    const categoryDistribution = [];
    const timeSpentByCategory = [];

    for (const cat of categories) {
      const taskCount = await Task.countDocuments({ user_id: userId, category_id: cat._id });
      categoryDistribution.push({
        category_name: cat.name,
        category_color: cat.color,
        category_icon: cat.icon,
        count: taskCount
      });

      const catTasks = await Task.find({ user_id: userId, category_id: cat._id });
      const totalMinutes = catTasks.reduce((sum, t) => sum + (t.actual_minutes || 0), 0);
      
      timeSpentByCategory.push({
        category_name: cat.name,
        category_color: cat.color,
        total_actual_minutes: totalMinutes > 0 ? totalMinutes : null
      });
    }

    res.json({
      total_tasks: total,
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      overdue_tasks: overdue,
      completion_rate: completionRate,
      category_distribution: categoryDistribution,
      time_spent_by_category: timeSpentByCategory,
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
});

// ==========================================
// 2. Tasks CRUD Endpoints
// ==========================================

// GET List of Tasks (Scoped by RBAC)
router.get('/tasks', authenticate, async (req, res) => {
  try {
    const { status, priority, category_id, assignee_id, search } = req.query;

    // Filters build
    const filter = {};
    
    // RBAC check: Members and Guests only access their own tasks; Admins access everything
    if (req.user.role !== 'Admin') {
      filter.user_id = req.user.id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category_id) filter.category_id = category_id;
    if (assignee_id) filter.assignee_id = assignee_id;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('category_id')
      .populate('assignee_id')
      .sort({ due_date: 1, createdAt: -1 });

    // Map to flat compatibility structure
    const mappedTasks = tasks.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      category_id: t.category_id ? t.category_id._id : null,
      category_name: t.category_id ? t.category_id.name : null,
      category_color: t.category_id ? t.category_id.color : null,
      category_icon: t.category_id ? t.category_id.icon : null,
      assignee_id: t.assignee_id ? t.assignee_id._id : null,
      assignee_name: t.assignee_id ? t.assignee_id.fullName : null,
      assignee_avatar: t.assignee_id ? t.assignee_id.avatar : null,
      assignee_role: t.assignee_id ? t.assignee_id.role : null,
      due_date: t.due_date,
      estimated_minutes: t.estimated_minutes,
      actual_minutes: t.actual_minutes,
      created_at: t.createdAt,
      updated_at: t.updatedAt
    }));

    res.json(mappedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET Single Task Details
router.get('/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('category_id')
      .populate('assignee_id');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Auth Scope validation (unless Admin)
    if (req.user.role !== 'Admin' && task.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Retrieve Comments
    const comments = await Comment.find({ task_id: task._id })
      .populate('user_id')
      .sort({ createdAt: -1 });

    // Retrieve Activity Logs
    const activity_logs = await ActivityLog.find({ task_id: task._id })
      .populate('user_id')
      .sort({ createdAt: -1 });

    const mappedComments = comments.map(c => ({
      id: c._id,
      content: c.content,
      user_id: c.user_id ? c.user_id._id : null,
      user_name: c.user_id ? c.user_id.fullName : 'Unknown User',
      user_avatar: c.user_id ? c.user_id.avatar : '?',
      user_role: c.user_id ? c.user_id.role : 'Member',
      created_at: c.createdAt
    }));

    const mappedLogs = activity_logs.map(l => ({
      id: l._id,
      action: l.action,
      details: l.details,
      user_name: l.user_id ? l.user_id.fullName : 'System',
      created_at: l.createdAt
    }));

    res.json({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category_id: task.category_id ? task.category_id._id : null,
      category_name: task.category_id ? task.category_id.name : null,
      category_color: task.category_id ? task.category_id.color : null,
      category_icon: task.category_id ? task.category_id.icon : null,
      assignee_id: task.assignee_id ? task.assignee_id._id : null,
      assignee_name: task.assignee_id ? task.assignee_id.fullName : null,
      assignee_avatar: task.assignee_id ? task.assignee_id.avatar : null,
      assignee_role: task.assignee_id ? task.assignee_id.role : null,
      due_date: task.due_date,
      estimated_minutes: task.estimated_minutes,
      actual_minutes: task.actual_minutes,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      comments: mappedComments,
      activity_logs: mappedLogs
    });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: 'Failed to retrieve task details' });
  }
});

// POST Create Task
router.post('/tasks', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, category_id, assignee_id, due_date, estimated_minutes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      category_id: category_id || null,
      assignee_id: assignee_id || null,
      user_id: req.user.id, // Set active user as owner
      due_date: due_date || null,
      estimated_minutes: estimated_minutes || 0,
      actual_minutes: 0
    });

    // Create Audit Log
    let assigneeName = '';
    if (assignee_id) {
      const u = await User.findById(assignee_id);
      if (u) assigneeName = u.fullName;
    }

    await ActivityLog.create({
      task_id: task._id,
      user_id: req.user.id,
      action: 'created',
      details: assigneeName ? `Task created and assigned to ${assigneeName}` : 'Task created'
    });

    res.status(201).json({ id: task._id, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT Update Task with Detailed Audit Logging
router.put('/tasks/:id', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, status, priority, category_id, assignee_id, due_date, estimated_minutes, actual_minutes } = req.body;

    // Get current task state to verify ownership and changes
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'Admin' && task.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const auditLogs = [];

    // Fields comparison
    if (title !== undefined && title !== task.title) {
      auditLogs.push({ action: 'updated', details: `Renamed task to "${title}"` });
      task.title = title;
    }
    if (description !== undefined && description !== task.description) {
      auditLogs.push({ action: 'updated', details: 'Updated description' });
      task.description = description;
    }
    if (status !== undefined && status !== task.status) {
      auditLogs.push({ action: 'status_changed', details: `Moved status from "${task.status}" to "${status}"` });
      task.status = status;
    }
    if (priority !== undefined && priority !== task.priority) {
      auditLogs.push({ action: 'updated', details: `Changed priority from "${task.priority}" to "${priority}"` });
      task.priority = priority;
    }
    
    // Category check
    if (category_id !== undefined) {
      const oldCatId = task.category_id ? task.category_id.toString() : null;
      const newCatId = category_id ? category_id.toString() : null;
      if (oldCatId !== newCatId) {
        task.category_id = category_id || null;
        if (category_id) {
          const cat = await Category.findById(category_id);
          auditLogs.push({ action: 'updated', details: `Category set to "${cat ? cat.name : 'Unknown'}"` });
        } else {
          auditLogs.push({ action: 'updated', details: 'Removed category' });
        }
      }
    }

    // Assignee check
    if (assignee_id !== undefined) {
      const oldAssigneeId = task.assignee_id ? task.assignee_id.toString() : null;
      const newAssigneeId = assignee_id ? assignee_id.toString() : null;
      if (oldAssigneeId !== newAssigneeId) {
        task.assignee_id = assignee_id || null;
        if (assignee_id) {
          const usr = await User.findById(assignee_id);
          auditLogs.push({ action: 'assigned', details: `Assigned task to ${usr ? usr.fullName : 'Unknown'}` });
        } else {
          auditLogs.push({ action: 'assigned', details: 'Unassigned task' });
        }
      }
    }

    if (due_date !== undefined && due_date !== task.due_date) {
      auditLogs.push({ action: 'updated', details: due_date ? `Changed due date to ${due_date}` : 'Removed due date' });
      task.due_date = due_date || null;
    }
    if (estimated_minutes !== undefined && estimated_minutes !== task.estimated_minutes) {
      auditLogs.push({ action: 'updated', details: `Estimated time changed to ${estimated_minutes} min` });
      task.estimated_minutes = estimated_minutes;
    }
    if (actual_minutes !== undefined && actual_minutes !== task.actual_minutes) {
      const delta = actual_minutes - task.actual_minutes;
      auditLogs.push({ action: 'time_logged', details: `Logged ${delta} minutes of focus time` });
      task.actual_minutes = actual_minutes;
    }

    if (auditLogs.length > 0) {
      await task.save();
      
      // Write audit trail
      for (const log of auditLogs) {
        await ActivityLog.create({
          task_id: taskId,
          user_id: req.user.id,
          action: log.action,
          details: log.details
        });
      }
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE Task
router.delete('/tasks/:id', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Scoped protection
    if (req.user.role !== 'Admin' && task.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Cascade deletes
    await Comment.deleteMany({ task_id: taskId });
    await ActivityLog.deleteMany({ task_id: taskId });
    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// LOG TIME to Task
router.post('/tasks/:id/log-time', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { minutes } = req.body;

    if (!minutes || isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Valid minutes parameter is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Scope check
    if (req.user.role !== 'Admin' && task.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.actual_minutes += parseInt(minutes);
    await task.save();

    // Insert Activity Log
    await ActivityLog.create({
      task_id: taskId,
      user_id: req.user.id,
      action: 'time_logged',
      details: `Focused on task for ${minutes} minutes`
    });

    res.json({ message: 'Time logged successfully', actual_minutes: task.actual_minutes });
  } catch (error) {
    console.error('Error logging task time:', error);
    res.status(500).json({ error: 'Failed to log focus time' });
  }
});

// ==========================================
// 3. Categories Endpoints (Admin / Member access only)
// ==========================================
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

router.post('/categories', authenticate, authorize(['Admin', 'Member']), async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !color || !icon) {
      return res.status(400).json({ error: 'Name, color, and icon parameters are required' });
    }

    const category = await Category.create({ name, color, icon });
    res.status(201).json({ id: category._id, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.message.includes('duplicate') || error.message.includes('E11000')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.delete('/categories/:id', authenticate, authorize(['Admin', 'Member']), async (req, res) => {
  try {
    const catId = req.params.id;

    const cat = await Category.findById(catId);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const defaults = ['Design', 'Engineering', 'Marketing', 'General'];
    if (defaults.includes(cat.name)) {
      return res.status(400).json({ error: 'System default categories cannot be deleted' });
    }

    await cat.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==========================================
// 4. Users Endpoints
// ==========================================
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ fullName: 1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

router.post('/users', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { name, email, avatar, role } = req.body;

    if (!name || !email || !avatar) {
      return res.status(400).json({ error: 'Name, email, and avatar parameters are required' });
    }

    const hashedPassword = await bcrypt.hash('Taskpass123!', 10);

    const user = await User.create({
      fullName: name,
      email,
      password: hashedPassword,
      avatar,
      role: role || 'Member',
      isGuest: false
    });

    res.status(201).json({ id: user._id, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('duplicate') || error.message.includes('E11000')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ==========================================
// 5. Comments Endpoints
// ==========================================
router.post('/tasks/:id/comments', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Scope check
    if (req.user.role !== 'Admin' && task.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await Comment.create({
      task_id: taskId,
      user_id: req.user.id,
      content
    });

    // Log Activity
    await ActivityLog.create({
      task_id: taskId,
      user_id: req.user.id,
      action: 'commented',
      details: `Added a comment: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
    });

    res.status(201).json({ id: comment._id, message: 'Comment posted successfully' });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// ==========================================
// 6. Global Activity Logs
// ==========================================
router.get('/activity-logs', authenticate, async (req, res) => {
  try {
    const filter = {};
    
    // Non-admins only see logs related to their own tasks or actions
    if (req.user.role !== 'Admin') {
      const myTasks = await Task.find({ user_id: req.user.id }).select('_id');
      const taskIds = myTasks.map(t => t._id);
      
      filter.$or = [
        { user_id: req.user.id },
        { task_id: { $in: taskIds } }
      ];
    }

    const logs = await ActivityLog.find(filter)
      .populate('user_id')
      .populate('task_id')
      .sort({ createdAt: -1 })
      .limit(100);

    const mappedLogs = logs.map(l => ({
      id: l._id,
      action: l.action,
      details: l.details,
      user_name: l.user_id ? l.user_id.fullName : 'System',
      task_id: l.task_id ? l.task_id._id : null,
      task_title: l.task_id ? l.task_id.title : null,
      created_at: l.createdAt
    }));

    res.json(mappedLogs);
  } catch (error) {
    console.error('Error fetching global logs:', error);
    res.status(500).json({ error: 'Failed to retrieve activity logs' });
  }
});

// ==========================================
// 7. System Data Import & Export (Members and Admins only, Guest blocked!)
// ==========================================
router.get('/system/export', authenticate, authorize(['Admin', 'Member']), async (req, res) => {
  try {
    const userId = req.user.id;
    const query = req.user.role === 'Admin' ? {} : { user_id: userId };
    
    const tasks = await Task.find(query);
    const taskIds = tasks.map(t => t._id);
    
    const categories = await Category.find();
    const users = await User.find({}, '-password');
    
    const comments = await Comment.find({ task_id: { $in: taskIds } });
    const activity_logs = await ActivityLog.find({ task_id: { $in: taskIds } });

    res.json({
      export_time: new Date().toISOString(),
      tasks,
      categories,
      users,
      comments,
      activity_logs
    });
  } catch (error) {
    console.error('Error exporting database data:', error);
    res.status(500).json({ error: 'Failed to export workspace data' });
  }
});

router.post('/system/import', authenticate, authorize(['Admin', 'Member']), async (req, res) => {
  try {
    const { tasks, categories, comments, activity_logs } = req.body;

    if (!tasks || !categories) {
      return res.status(400).json({ error: 'Invalid import data structure' });
    }

    const userId = req.user.id;

    // Purge only user's own items
    if (req.user.role === 'Admin') {
      await Comment.deleteMany({});
      await ActivityLog.deleteMany({});
      await Task.deleteMany({});
    } else {
      const myTasks = await Task.find({ user_id: userId }).select('_id');
      const myTaskIds = myTasks.map(t => t._id);
      await Comment.deleteMany({ task_id: { $in: myTaskIds } });
      await ActivityLog.deleteMany({ task_id: { $in: myTaskIds } });
      await Task.deleteMany({ user_id: userId });
    }

    // Import Categories (avoid duplicates)
    for (const c of categories) {
      const exists = await Category.findOne({ name: c.name });
      if (!exists) {
        await Category.create({ name: c.name, color: c.color, icon: c.icon });
      }
    }

    // Import Tasks (force user_id to current user to prevent privilege escalations!)
    for (const t of tasks) {
      await Task.create({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        category_id: t.category_id || null,
        assignee_id: t.assignee_id || null,
        user_id: req.user.role === 'Admin' ? (t.user_id || userId) : userId,
        due_date: t.due_date,
        estimated_minutes: t.estimated_minutes,
        actual_minutes: t.actual_minutes,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      });
    }

    // Import Comments
    if (comments && comments.length > 0) {
      for (const com of comments) {
        await Comment.create({
          task_id: com.task_id,
          user_id: com.user_id,
          content: com.content,
          createdAt: com.createdAt
        });
      }
    }

    // Import Logs
    if (activity_logs && activity_logs.length > 0) {
      for (const log of activity_logs) {
        await ActivityLog.create({
          task_id: log.task_id,
          user_id: log.user_id,
          action: log.action,
          details: log.details,
          createdAt: log.createdAt
        });
      }
    }

    res.json({ message: 'Workspace data imported and restored successfully' });
  } catch (error) {
    console.error('Error importing database data:', error);
    res.status(500).json({ error: 'Failed to import and restore data' });
  }
});

module.exports = router;
