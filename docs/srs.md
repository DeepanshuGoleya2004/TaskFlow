# Software Requirements Specification (SRS)
## Project: Premium Task Tracker

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Premium Task Tracker**, a web-based, highly visual single-page application (SPA) with a Node.js backend. The tracker offers personal task management, interactive Kanban boards, calendar layouts, time tracking (Pomodoro), and simulated multi-user collaboration.

### 1.2 Intended Audience
This document is intended for developers, system architects, and users evaluating the design, functionality, and roadmap of the Task Tracker application.

### 1.3 Scope
The Task Tracker is a localized project management tool that stores information in a persistent SQLite database. It targets visual clarity, micro-interactions, responsive screens, and premium dark-mode styling with glassmorphism.

---

## 2. Overall Description

### 2.1 Product Perspective
The system consists of:
1. **Server-Side Engine (Node.js/Express)**: Provides RESTful API endpoints for data management.
2. **Relational Database (SQLite)**: Provides persistent storage for tasks, categories, users, comments, and activity histories.
3. **Client-Side SPA (HTML/CSS/JS)**: Responsive web application using native browser features, Chart.js for data visualization, and Vanilla CSS styles.

### 2.2 Product Functions
- **Interactive Dashboard**: High-level statistical tiles, workload distributions, completion history charts, and overdue alerts.
- **Task Management**: CRUD operations on tasks with attributes including title, description, status, priority, due date, category, assignee, estimated time, and actual time.
- **Kanban Board**: Drag-and-drop task card relocation between stages (Todo, In Progress, Review, Completed).
- **Calendar View**: Interactive visual monthly grid mapping tasks to their deadlines.
- **Time Tracker / Pomodoro**: Active session countdown timer for locking focus and logging elapsed time directly to the task.
- **Category Customization**: Color-coded, icon-enriched tagging system.
- **Collaboration Simulator**: Dynamic comments feed, user role profiles, and audit log.

### 2.3 User Classes and Characteristics
- **Sole Operator / Freelancer**: Needs detailed time tracking, due date monitoring, and category segregation.
- **Team Manager / Coordinator (Simulated)**: Assigns work to virtual users, tracks comments, and views the system activity logs.

### 2.4 Operating Environment
- **Browser Compatibility**: Modern versions of Chrome, Safari, Firefox, and Edge.
- **Local Server Environment**: Node.js (v16+) on macOS/Linux/Windows.

---

## 3. System Features & Functional Requirements

### 3.1 Module 1: Core Database & Backend Administration
- **FR-1.1**: Persistent data storage in a local SQLite file (`task_tracker.db`).
- **FR-1.2**: Database auto-initialization with structured tables (`users`, `categories`, `tasks`, `comments`, `activity_logs`).
- **FR-1.3**: Automatic data seeding on clean boot to provide simulated members (e.g., Sarah, Alex, Maria) and workspace categories (e.g., Design, Engineering, Marketing, General).

### 3.2 Module 2: RESTful Web API Endpoints
- **FR-2.1**: JSON HTTP endpoints for CRUD operations on Tasks.
- **FR-2.2**: Category and User fetch APIs.
- **FR-2.3**: Commits of comments under specific tasks.
- **FR-2.4**: Automated activity logs triggered on state transitions (e.g., moving task from 'In Progress' to 'Review').
- **FR-2.5**: Statistical API outputting calculated metrics for charts.

### 3.3 Module 3: Modern UI/UX Base Shell
- **FR-3.1**: Beautiful glassmorphic design system using CSS variables, custom backgrounds, and neon gradients.
- **FR-3.2**: Side-navigation layout for view switching without full page refresh.
- **FR-3.3**: Fully responsive display resizing gracefully from desktop view to mobile screen widths.

### 3.4 Module 4: Kanban Board and Grid Lists
- **FR-4.1**: Horizontal Kanban layout grouped by column statuses.
- **FR-4.2**: HTML5 drag-and-drop capability to move tasks between status columns.
- **FR-4.3**: Tabular list view with column sorting, keyword search filters, and tag filtering.
- **FR-4.4**: Task Detail modal to update properties, log time, comment, or view history.

### 3.5 Module 5: Interactive Calendar, Pomodoro Timer & Charts
- **FR-5.1**: Calendar Grid depicting all task deadlines dynamically in the current month.
- **FR-5.2**: Built-in Pomodoro timer (e.g., 25-minute focus, 5-minute break) that increments the `actual_minutes` field of a task when stopped or finished.
- **FR-5.3**: Real-time rendering of task completion rates and time tracked distributions using Chart.js.

### 3.6 Module 6: Settings, Imports/Exports & Activity Logs
- **FR-6.1**: Full database export to JSON.
- **FR-6.2**: Database restore/import from JSON files.
- **FR-6.3**: Activity Log stream to audit changes made by the user.

---

## 4. Non-Functional Requirements

### 4.1 Safety & Security
- Validation of API input parameters to prevent basic injection vectors.
- Strict isolation of files within the designated project folder.

### 4.2 Reliability & Availability
- Fast local boot time (< 1s).
- Database file integrity preservation during unexpected crashes (atomic SQLite operations).

### 4.3 Performance
- Page transitions and drag-and-drop triggers must execute within < 50ms for fluent micro-animations.
- Server response times for local SQLite queries must stay under 15ms.

### 4.4 Aesthetics and UX
- Custom Scrollbars matching the dark glass theme.
- Vibrant, tailored color scheme instead of default browser styles.
- Clear accessibility and cursor pointers for all buttons and interactive cards.

---

## 5. Project Status & Version History

| Version | Date | Status | Description |
| :--- | :--- | :--- | :--- |
| v0.1 | 2026-06-28 | Completed | Initial design, core database, and backend administration server built (Module 1 complete). |
| v0.2 | 2026-06-28 | Completed | REST API endpoints implemented for tasks, categories, users, comments, and stats; automated testing suite completed (Module 2 complete). |
| v0.3 | 2026-06-28 | Completed | Glassmorphic visual style guide CSS variables, sidebar layouts, navigation routers, global timer widget hooks (Module 3 complete). |
| v0.4 | 2026-06-28 | In Progress | Built interactive Kanban Board with HTML5 drag-and-drop status relocations, filterable task list views, and a detailed task management modal (Module 4 complete). |

