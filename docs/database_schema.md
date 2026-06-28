# Database Schema Specification
## Project: Premium Task Tracker

This document details the SQLite database design for the **Premium Task Tracker**. All data is stored locally in the `task_tracker.db` file.

---

## 1. Entity Relationship Diagram

```
+---------------+        +------------------+
|     users     |        |    categories    |
+---------------+        +------------------+
| id (PK)       |        | id (PK)          |
| name          |        | name             |
| email         |        | color            |
| avatar        |        | icon             |
| role          |        +------------------+
+---------------+                 |
        |                         |
        | 1                       | 1
        |                         |
        | 0..*                    | 0..*
        v                         v
+-------------------------------------------+
|                   tasks                   |
+-------------------------------------------+
| id (PK)                                   |
| title                                     |
| description                               |
| status (Todo, In Progress, Review, Done)  |
| priority (Low, Medium, High, Urgent)     |
| category_id (FK -> categories.id)         |
| assignee_id (FK -> users.id)              |
| due_date                                  |
| estimated_minutes                         |
| actual_minutes                            |
| created_at                                |
| updated_at                                |
+-------------------------------------------+
        |                         |
        | 1                       | 1
        |                         |
        | 0..*                    | 0..*
        v                         v
+------------------+      +-------------------+
|     comments     |      |   activity_logs   |
+------------------+      +-------------------+
| id (PK)          |      | id (PK)           |
| task_id (FK)     |      | task_id (FK)      |
| user_id (FK)     |      | user_id (FK)      |
| content          |      | action            |
| created_at       |      | details           |
+------------------+      | created_at        |
                          +-------------------+
```

---

## 2. Table Specifications

### 2.1 `users` Table
Stores simulated users to allow task assignment, comments, and action history attribution.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL
- `email`: TEXT UNIQUE NOT NULL
- `avatar`: TEXT (Image URL or SVG placeholder)
- `role`: TEXT DEFAULT 'Member'
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### 2.2 `categories` Table
Stores custom task categories, each with a custom color and icon.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL UNIQUE
- `color`: TEXT NOT NULL (Hex or HSL color code)
- `icon`: TEXT NOT NULL (Emoji or icon class name)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### 2.3 `tasks` Table
Stores the primary work items.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `title`: TEXT NOT NULL
- `description`: TEXT
- `status`: TEXT CHECK(status IN ('Todo', 'In Progress', 'Review', 'Completed')) DEFAULT 'Todo'
- `priority`: TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium'
- `category_id`: INTEGER REFERENCES categories(id) ON DELETE SET NULL
- `assignee_id`: INTEGER REFERENCES users(id) ON DELETE SET NULL
- `due_date`: TEXT (ISO 8601 Date String `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`)
- `estimated_minutes`: INTEGER DEFAULT 0
- `actual_minutes`: INTEGER DEFAULT 0
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### 2.4 `comments` Table
Stores comments associated with tasks.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `task_id`: INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
- `user_id`: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `content`: TEXT NOT NULL
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### 2.5 `activity_logs` Table
Maintains an audit trail of all changes.
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `task_id`: INTEGER REFERENCES tasks(id) ON DELETE SET NULL
- `user_id`: INTEGER REFERENCES users(id) ON DELETE SET NULL
- `action`: TEXT NOT NULL (e.g. 'created', 'updated', 'status_changed', 'assigned', 'time_logged', 'commented')
- `details`: TEXT (Description of changes made)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

---

## 3. Database Constraints & Indexes

- **Foreign Keys**: Enabled explicitly in the SQLite database initialization by running `PRAGMA foreign_keys = ON;` on connection.
- **Indexes**:
  - `IDX_TASKS_STATUS` on `tasks(status)` for fast Kanban column population.
  - `IDX_COMMENTS_TASK` on `comments(task_id)` for quick comment loads.
  - `IDX_LOGS_TASK` on `activity_logs(task_id)` for audit trail fetching.

---

## 4. Initial Seed Data
When the database is first initialized, the following records will be inserted:

### Users (Virtual Members)
1. **Sarah Connor** (`sarah@project.com`, role: `Lead Designer`)
2. **Alex Mercer** (`alex@project.com`, role: `Fullstack Engineer`)
3. **Maria Hill** (`maria@project.com`, role: `Project Manager`)

### Categories
1. **Design** (Color: `hsl(280, 80%, 65%)`, Icon: `🎨`)
2. **Engineering** (Color: `hsl(200, 80%, 65%)`, Icon: `💻`)
3. **Marketing** (Color: `hsl(340, 80%, 65%)`, Icon: `📈`)
4. **General** (Color: `hsl(120, 80%, 65%)`, Icon: `⚙️`)
