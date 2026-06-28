# Software Architecture
## Project: Premium Task Tracker

---

## 1. System Overview

The **Premium Task Tracker** is built on a client-server architecture. The server acts as a RESTful JSON API provider and static file host, while the client operates as an interactive Single Page Application (SPA).

```mermaid
graph TD
    subgraph Client [Browser Client (SPA)]
        UI[HTML/CSS View] <--> App[app.js - State & Router]
        App <--> Comp[components.js - UI Modules]
        Comp <--> API_C[api.js - HTTP Client]
        Comp <--> Utils[utils.js - Charts/Timers]
    end

    subgraph Server [Node.js Backend]
        API_S[server.js - Express Router] <--> DB_A[database.js - SQLite Access]
    end

    subgraph Storage [Persistent Storage]
        DB[(SQLite File: task_tracker.db)]
    end

    API_C <-->|HTTP REST / JSON| API_S
    DB_A <-->|SQL Queries| DB
```

---

## 2. Component Design

### 2.1 Backend Server (`server.js`)
- **Express Framework**: Used for quick routing, CORS management, and static file hosting.
- **Middleware**:
  - `express.json()`: Standard parser for POST/PUT payloads.
  - `morgan`: Request logging to monitor active operations.
  - Custom error handling middleware to send formatted JSON errors instead of raw stack traces.

### 2.2 Database Layer (`database.js`)
- **sqlite3 Driver**: Interacts directly with the SQLite database.
- **Initialization**: Automatically creates the tables on launch if they do not exist.
- **Seeding**: Seeds the database with default categories (Engineering, Design, Marketing, etc.) and virtual members if the tables are empty.

### 2.3 Frontend Client (`public/`)
- **`index.html`**: The single HTML page. It hosts container nodes for the sidebar and main body views.
- **`css/style.css`**: Defines a premium Glassmorphism design system:
  - Custom CSS variables for HSL colors (primary, background, panel, border, text).
  - Glass effect: `backdrop-filter: blur(16px); background: rgba(..., 0.45); border: 1px solid rgba(..., 0.15);`.
  - Micro-animations for card hovers and timer pulses.
- **`js/api.js`**: Standardized wrapper for performing async `fetch` queries.
- **`js/utils.js`**: Formatting tools, timer ticker, and Chart.js configuration wrappers.
- **`js/components.js`**: Classes or render functions for:
  - `DashboardComponent`: Statistics grids, Chart.js canvases.
  - `KanbanComponent`: Drag-and-drop board.
  - `ListComponent`: Searchable/sortable tables.
  - `CalendarComponent`: Deadline grid navigation.
  - `TimerComponent`: Task Pomodoro.
  - `SettingsComponent`: JSON import/export panel.
  - `CommentsComponent`: Commentary feeds inside task detail modals.
- **`js/app.js`**: The orchestrator. Stores global app state, manages routing, renders modals, and manages active views.

---

## 3. Data Flow & Security

1. **State Modifications**: Any user interaction (e.g. moving a task card) triggers a local state update, an immediate REST query, and a subsequent DOM update.
2. **Persistence**: SQLite transactions ensure atomic saves.
3. **Data Integrity**: Database foreign key constraints enforce cascade deletions (e.g., deleting a task deletes its comments).
