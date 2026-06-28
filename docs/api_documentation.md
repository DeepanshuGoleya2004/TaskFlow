# REST API Documentation
## Project: Premium Task Tracker

This document provides details for the RESTful endpoints exposed by the Node.js + Express backend. All API requests and responses are in JSON format.

---

## 1. Global Setup & Standards

- **Base URL**: `http://localhost:3000` (or the PORT dynamically bound by the server).
- **Headers**:
  - `Content-Type: application/json` is required for all `POST` and `PUT` requests.
- **Common Error Response (e.g., 400, 404, 500)**:
  ```json
  {
    "error": "Error message description"
  }
  ```

---

## 2. Endpoints Reference

### 2.1 Tasks Section

#### `GET /api/tasks`
Fetches a list of tasks. Supports filtering and searching via query parameters.
- **Query Parameters**:
  - `status`: Filter by `Todo`, `In Progress`, `Review`, or `Completed`.
  - `priority`: Filter by `Low`, `Medium`, `High`, or `Urgent`.
  - `category_id`: Filter by integer category ID.
  - `assignee_id`: Filter by integer assignee ID.
  - `search`: Case-insensitive search on task `title` and `description`.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Design Landing Page Mockup",
      "description": "Create glassmorphic layout using Figma",
      "status": "In Progress",
      "priority": "High",
      "category_id": 1,
      "category_name": "Design",
      "category_color": "hsl(280, 80%, 65%)",
      "category_icon": "🎨",
      "assignee_id": 1,
      "assignee_name": "Sarah Connor",
      "assignee_avatar": "SC",
      "due_date": "2026-07-15",
      "estimated_minutes": 240,
      "actual_minutes": 90,
      "created_at": "2026-06-28 21:00:00",
      "updated_at": "2026-06-28 21:30:00"
    }
  ]
  ```

#### `GET /api/tasks/:id`
Retrieves detailed information about a single task, including comments and activity history logs.
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "title": "Design Landing Page Mockup",
    "description": "Create glassmorphic layout using Figma",
    "status": "In Progress",
    "priority": "High",
    "category_id": 1,
    "assignee_id": 1,
    "due_date": "2026-07-15",
    "estimated_minutes": 240,
    "actual_minutes": 90,
    "created_at": "2026-06-28 21:00:00",
    "updated_at": "2026-06-28 21:30:00",
    "comments": [
      {
        "id": 1,
        "content": "Added initial design concepts to Figma file",
        "user_id": 1,
        "user_name": "Sarah Connor",
        "created_at": "2026-06-28 21:15:00"
      }
    ],
    "activity_logs": [
      {
        "id": 1,
        "action": "created",
        "details": "Task created",
        "user_name": "Maria Hill",
        "created_at": "2026-06-28 21:00:00"
      },
      {
        "id": 2,
        "action": "status_changed",
        "details": "Moved from Todo to In Progress",
        "user_name": "Sarah Connor",
        "created_at": "2026-06-28 21:10:00"
      }
    ]
  }
  ```

#### `POST /api/tasks`
Creates a new task.
- **Request Body**:
  ```json
  {
    "title": "Write Backend Tests",
    "description": "Ensure API endpoints return correct payloads",
    "status": "Todo",
    "priority": "Medium",
    "category_id": 2,
    "assignee_id": 2,
    "due_date": "2026-07-10",
    "estimated_minutes": 120
  }
  ```
- **Response (211 Created)**:
  ```json
  {
    "id": 2,
    "message": "Task created successfully"
  }
  ```

#### `PUT /api/tasks/:id`
Updates an existing task. Triggers automated activity logs if properties change (e.g. status or assignee).
- **Request Body** (Any properties can be omitted to remain unchanged):
  ```json
  {
    "status": "Review",
    "actual_minutes": 120
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Task updated successfully"
  }
  ```

#### `DELETE /api/tasks/:id`
Deletes a task. Comments and logs are cascaded.
- **Response (200 OK)**:
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```

#### `POST /api/tasks/:id/log-time`
Logs direct time to a task (accumulates `actual_minutes`).
- **Request Body**:
  ```json
  {
    "minutes": 25,
    "user_id": 2
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Time logged successfully",
    "actual_minutes": 145
  }
  ```

---

### 2.2 Categories Section

#### `GET /api/categories`
Fetches all task categories.
- **Response (200 OK)**:
  ```json
  [
    { "id": 1, "name": "Design", "color": "hsl(280, 80%, 65%)", "icon": "🎨" }
  ]
  ```

#### `POST /api/categories`
Creates a custom category.
- **Request Body**:
  ```json
  {
    "name": "Testing",
    "color": "hsl(45, 90%, 60%)",
    "icon": "🧪"
  }
  ```
- **Response (201 Created)**:
  ```json
  { "id": 5, "message": "Category created successfully" }
  ```

---

### 2.3 Users Section

#### `GET /api/users`
Fetches all simulated members.
- **Response (200 OK)**:
  ```json
  [
    { "id": 1, "name": "Sarah Connor", "email": "sarah@project.com", "avatar": "SC", "role": "Lead Designer" }
  ]
  ```

---

### 2.4 Comments Section

#### `POST /api/tasks/:id/comments`
Posts a comment to a task.
- **Request Body**:
  ```json
  {
    "user_id": 2,
    "content": "API endpoints are ready for testing."
  }
  ```
- **Response (201 Created)**:
  ```json
  { "id": 2, "message": "Comment posted successfully" }
  ```

---

### 2.5 Dashboard Summary Section

#### `GET /api/dashboard/stats`
Fetches dashboard summary data for charts and stats.
- **Response (200 OK)**:
  ```json
  {
    "total_tasks": 12,
    "completed_tasks": 4,
    "in_progress_tasks": 3,
    "overdue_tasks": 1,
    "completion_rate": 33.3,
    "category_distribution": [
      { "category_name": "Design", "count": 5 },
      { "category_name": "Engineering", "count": 7 }
    ],
    "time_spent_by_category": [
      { "category_name": "Design", "total_actual_minutes": 240 }
    ]
  }
  ```
