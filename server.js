const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { initDatabase, run, get, all } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Task Tracker API is fully operational'
  });
});

// ==========================================
// 1. Dashboard Statistics
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get basic task counts
    const totalRow = await get('SELECT COUNT(*) AS count FROM tasks');
    const completedRow = await get("SELECT COUNT(*) AS count FROM tasks WHERE status = 'Completed'");
    const inProgressRow = await get("SELECT COUNT(*) AS count FROM tasks WHERE status = 'In Progress'");
    const overdueRow = await get(
      "SELECT COUNT(*) AS count FROM tasks WHERE status != 'Completed' AND due_date IS NOT NULL AND due_date < ?",
      [today]
    );

    const total = totalRow.count;
    const completed = completedRow.count;
    const inProgress = inProgressRow.count;
    const overdue = overdueRow.count;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category tasks count distribution
    const categoryDistribution = await all(`
      SELECT c.name AS category_name, c.color AS category_color, c.icon AS category_icon, COUNT(t.id) AS count
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id
      GROUP BY c.id
    `);

    // Actual hours logged per category
    const timeSpentByCategory = await all(`
      SELECT c.name AS category_name, c.color AS category_color, SUM(t.actual_minutes) AS total_actual_minutes
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id
      GROUP BY c.id
    `);

    res.json({
      total_tasks: total,
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      overdue_tasks: overdue,
      completion_rate: completionRate,
      category_distribution: categoryDistribution,
      time_spent_by_category: timeSpentByCategory
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
});

// ==========================================
// 2. Tasks CRUD Endpoints
// ==========================================

// GET List of Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, priority, category_id, assignee_id, search } = req.query;

    let query = `
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
             u.name AS assignee_name, u.avatar AS assignee_avatar, u.role AS assignee_role
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (category_id) {
      query += ` AND t.category_id = ?`;
      params.push(category_id);
    }
    if (assignee_id) {
      query += ` AND t.assignee_id = ?`;
      params.push(assignee_id);
    }
    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ` ORDER BY t.due_date ASC, t.id DESC`;

    const tasks = await all(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET Single Task Details
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await get(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
              u.name AS assignee_name, u.avatar AS assignee_avatar, u.role AS assignee_role
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Retrieve Comments
    const comments = await all(
      `SELECT com.*, u.name AS user_name, u.avatar AS user_avatar, u.role AS user_role
       FROM comments com
       JOIN users u ON com.user_id = u.id
       WHERE com.task_id = ?
       ORDER BY com.created_at DESC`,
      [req.params.id]
    );

    // Retrieve Activity Logs
    const activity_logs = await all(
      `SELECT al.*, u.name AS user_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.task_id = ?
       ORDER BY al.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...task,
      comments,
      activity_logs
    });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: 'Failed to retrieve task details' });
  }
});

// POST Create Task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, category_id, assignee_id, due_date, estimated_minutes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const taskStatus = status || 'Todo';
    const taskPriority = priority || 'Medium';
    const estMin = estimated_minutes || 0;

    const result = await run(
      `INSERT INTO tasks (title, description, status, priority, category_id, assignee_id, due_date, estimated_minutes, actual_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [title, description, taskStatus, taskPriority, category_id || null, assignee_id || null, due_date || null, estMin]
    );

    // Create Audit Log
    // If assignee is specified, grab their name
    let assigneeName = '';
    if (assignee_id) {
      const u = await get('SELECT name FROM users WHERE id = ?', [assignee_id]);
      if (u) assigneeName = u.name;
    }

    await run(
      `INSERT INTO activity_logs (task_id, user_id, action, details)
       VALUES (?, ?, 'created', ?)`,
      [result.id, assignee_id || null, assigneeName ? `Task created and assigned to ${assigneeName}` : 'Task created']
    );

    res.status(201).json({ id: result.id, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT Update Task with Detailed Audit Logging
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, status, priority, category_id, assignee_id, due_date, estimated_minutes, actual_minutes } = req.body;

    // Get current state to compare changes
    const current = await get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!current) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = [];
    const params = [];
    const auditLogs = [];

    // Fields tracking
    if (title !== undefined && title !== current.title) {
      updates.push('title = ?');
      params.push(title);
      auditLogs.push({ action: 'updated', details: `Renamed task to "${title}"` });
    }
    if (description !== undefined && description !== current.description) {
      updates.push('description = ?');
      params.push(description);
      auditLogs.push({ action: 'updated', details: 'Updated description' });
    }
    if (status !== undefined && status !== current.status) {
      updates.push('status = ?');
      params.push(status);
      auditLogs.push({ action: 'status_changed', details: `Moved status from "${current.status}" to "${status}"` });
    }
    if (priority !== undefined && priority !== current.priority) {
      updates.push('priority = ?');
      params.push(priority);
      auditLogs.push({ action: 'updated', details: `Changed priority from "${current.priority}" to "${priority}"` });
    }
    if (category_id !== undefined && category_id !== current.category_id) {
      updates.push('category_id = ?');
      params.push(category_id || null);
      if (category_id) {
        const cat = await get('SELECT name FROM categories WHERE id = ?', [category_id]);
        auditLogs.push({ action: 'updated', details: `Category set to "${cat ? cat.name : 'Unknown'}"` });
      } else {
        auditLogs.push({ action: 'updated', details: 'Removed category' });
      }
    }
    if (assignee_id !== undefined && assignee_id !== current.assignee_id) {
      updates.push('assignee_id = ?');
      params.push(assignee_id || null);
      if (assignee_id) {
        const usr = await get('SELECT name FROM users WHERE id = ?', [assignee_id]);
        auditLogs.push({ action: 'assigned', details: `Assigned task to ${usr ? usr.name : 'Unknown'}` });
      } else {
        auditLogs.push({ action: 'assigned', details: 'Unassigned task' });
      }
    }
    if (due_date !== undefined && due_date !== current.due_date) {
      updates.push('due_date = ?');
      params.push(due_date || null);
      auditLogs.push({ action: 'updated', details: due_date ? `Changed due date to ${due_date}` : 'Removed due date' });
    }
    if (estimated_minutes !== undefined && estimated_minutes !== current.estimated_minutes) {
      updates.push('estimated_minutes = ?');
      params.push(estimated_minutes);
      auditLogs.push({ action: 'updated', details: `Estimated time changed to ${estimated_minutes} min` });
    }
    if (actual_minutes !== undefined && actual_minutes !== current.actual_minutes) {
      updates.push('actual_minutes = ?');
      params.push(actual_minutes);
      const delta = actual_minutes - current.actual_minutes;
      auditLogs.push({ action: 'time_logged', details: `Logged ${delta} minutes of focus time` });
    }

    if (updates.length === 0) {
      return res.json({ message: 'No changes detected' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(taskId);

    const updateSql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    await run(updateSql, params);

    // Write all audit logs
    const actorId = assignee_id || current.assignee_id || null;
    for (const log of auditLogs) {
      await run(
        `INSERT INTO activity_logs (task_id, user_id, action, details)
         VALUES (?, ?, ?, ?)`,
        [taskId, actorId, log.action, log.details]
      );
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE Task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    // Check if exists
    const current = await get('SELECT id FROM tasks WHERE id = ?', [taskId]);
    if (!current) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete comments and activity logs associated (handled by Cascade or manual cleanup)
    await run('DELETE FROM comments WHERE task_id = ?', [taskId]);
    await run('DELETE FROM activity_logs WHERE task_id = ?', [taskId]);
    await run('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// LOG TIME to Task
app.post('/api/tasks/:id/log-time', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { minutes, user_id } = req.body;

    if (!minutes || isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Valid minutes parameter is required' });
    }

    const task = await get('SELECT actual_minutes FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newTotal = task.actual_minutes + parseInt(minutes);
    await run('UPDATE tasks SET actual_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newTotal, taskId]);

    // Insert Activity Log
    await run(
      `INSERT INTO activity_logs (task_id, user_id, action, details)
       VALUES (?, ?, 'time_logged', ?)`,
      [taskId, user_id || null, `Focused on task for ${minutes} minutes`]
    );

    res.json({ message: 'Time logged successfully', actual_minutes: newTotal });
  } catch (error) {
    console.error('Error logging task time:', error);
    res.status(500).json({ error: 'Failed to log focus time' });
  }
});

// ==========================================
// 3. Categories Endpoints
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await all('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !color || !icon) {
      return res.status(400).json({ error: 'Name, color, and icon parameters are required' });
    }

    const result = await run(
      'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
      [name, color, icon]
    );

    res.status(201).json({ id: result.id, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const catId = req.params.id;
    // Check if default seeded
    if (parseInt(catId) <= 4) {
      return res.status(400).json({ error: 'System default categories cannot be deleted' });
    }

    const result = await run('DELETE FROM categories WHERE id = ?', [catId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==========================================
// 4. Users Endpoints
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const users = await all('SELECT * FROM users ORDER BY name ASC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, avatar, role } = req.body;

    if (!name || !email || !avatar) {
      return res.status(400).json({ error: 'Name, email, and avatar parameters are required' });
    }

    const result = await run(
      'INSERT INTO users (name, email, avatar, role) VALUES (?, ?, ?, ?)',
      [name, email, avatar, role || 'Member']
    );

    res.status(201).json({ id: result.id, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ==========================================
// 5. Comments Endpoints
// ==========================================
app.post('/api/tasks/:id/comments', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({ error: 'User ID and comment content are required' });
    }

    // Verify task exists
    const task = await get('SELECT id FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user exists
    const user = await get('SELECT name FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const result = await run(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, user_id, content]
    );

    // Log Activity
    await run(
      `INSERT INTO activity_logs (task_id, user_id, action, details)
       VALUES (?, ?, 'commented', ?)`,
      [taskId, user_id, `Added a comment: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`]
    );

    res.status(201).json({ id: result.id, message: 'Comment posted successfully' });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// ==========================================
// 6. System Data Import & Export (Settings helper)
// ==========================================
app.get('/api/system/export', async (req, res) => {
  try {
    const tasks = await all('SELECT * FROM tasks');
    const categories = await all('SELECT * FROM categories');
    const users = await all('SELECT * FROM users');
    const comments = await all('SELECT * FROM comments');
    const activity_logs = await all('SELECT * FROM activity_logs');

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

app.post('/api/system/import', async (req, res) => {
  try {
    const { tasks, categories, users, comments, activity_logs } = req.body;

    if (!tasks || !categories || !users) {
      return res.status(400).json({ error: 'Invalid import data structure' });
    }

    // Clean current databases sequentially
    await run('DELETE FROM comments');
    await run('DELETE FROM activity_logs');
    await run('DELETE FROM tasks');
    await run('DELETE FROM categories');
    await run('DELETE FROM users');

    // Import Users
    for (const u of users) {
      await run('INSERT INTO users (id, name, email, avatar, role, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
        u.id, u.name, u.email, u.avatar, u.role, u.created_at
      ]);
    }

    // Import Categories
    for (const c of categories) {
      await run('INSERT INTO categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?)', [
        c.id, c.name, c.color, c.icon, c.created_at
      ]);
    }

    // Import Tasks
    for (const t of tasks) {
      await run(
        `INSERT INTO tasks (id, title, description, status, priority, category_id, assignee_id, due_date, estimated_minutes, actual_minutes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.title, t.description, t.status, t.priority, t.category_id, t.assignee_id, t.due_date, t.estimated_minutes, t.actual_minutes, t.created_at, t.updated_at]
      );
    }

    // Import Comments if any
    if (comments && comments.length > 0) {
      for (const com of comments) {
        await run('INSERT INTO comments (id, task_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)', [
          com.id, com.task_id, com.user_id, com.content, com.created_at
        ]);
      }
    }

    // Import Logs if any
    if (activity_logs && activity_logs.length > 0) {
      for (const log of activity_logs) {
        await run('INSERT INTO activity_logs (id, task_id, user_id, action, details, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
          log.id, log.task_id, log.user_id, log.action, log.details, log.created_at
        ]);
      }
    }

    res.json({ message: 'Workspace data imported and restored successfully' });
  } catch (error) {
    console.error('Error importing database data:', error);
    res.status(500).json({ error: 'Failed to import and restore data' });
  }
});

// Database Initialization and Server Boot
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Task Tracker server is running on port ${PORT}`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
