const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'task_tracker.db');

// Connect to SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Failed to enable foreign key support:', pragmaErr.message);
      } else {
        console.log('Foreign key support enabled.');
      }
    });
  }
});

// Helper: Wrap database runs in Promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper: Wrap database gets in Promises
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper: Wrap database alls in Promises
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper: Execute statements in serialized sequence
function serialize(fn) {
  db.serialize(fn);
}

// Initialize Database Schema
async function initDatabase() {
  console.log('Initializing database schema...');

  // Create Users Table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'Member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Categories Table
  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Tasks Table
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('Todo', 'In Progress', 'Review', 'Completed')) DEFAULT 'Todo',
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      due_date TEXT,
      estimated_minutes INTEGER DEFAULT 0,
      actual_minutes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Comments Table
  await run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Activity Logs Table
  await run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Indexes for search optimization
  await run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_logs_task ON activity_logs(task_id)`);

  console.log('Database schema created successfully.');

  // Seed default data if empty
  await seedInitialData();
}

// Seed helper functions
async function seedInitialData() {
  // Check if users already seeded
  const userCount = await get('SELECT COUNT(*) AS count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding initial users...');
    const users = [
      { name: 'Sarah Connor', email: 'sarah@project.com', avatar: 'SC', role: 'Lead Designer' },
      { name: 'Alex Mercer', email: 'alex@project.com', avatar: 'AM', role: 'Fullstack Engineer' },
      { name: 'Maria Hill', email: 'maria@project.com', avatar: 'MH', role: 'Project Manager' }
    ];
    for (const u of users) {
      await run('INSERT INTO users (name, email, avatar, role) VALUES (?, ?, ?, ?)', [u.name, u.email, u.avatar, u.role]);
    }
  }

  // Check if categories already seeded
  const catCount = await get('SELECT COUNT(*) AS count FROM categories');
  if (catCount.count === 0) {
    console.log('Seeding initial categories...');
    const categories = [
      { name: 'Design', color: 'hsl(280, 80%, 65%)', icon: '🎨' },
      { name: 'Engineering', color: 'hsl(200, 80%, 65%)', icon: '💻' },
      { name: 'Marketing', color: 'hsl(340, 80%, 65%)', icon: '📈' },
      { name: 'General', color: 'hsl(120, 80%, 65%)', icon: '⚙️' }
    ];
    for (const c of categories) {
      await run('INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)', [c.name, c.color, c.icon]);
    }
  }

  console.log('Database seeding complete.');
}

module.exports = {
  db,
  run,
  get,
  all,
  serialize,
  initDatabase
};
