# TaskFlow | Decoupled MERN Architecture

TaskFlow is next-generation project management and focus tracker workspace designed to streamline workflows, record time logs, and generate reports.

This repository is refactored into a separate **Frontend Presentation Layer** (Vite SPA) and **Backend REST Service Layer** (Node, Express, and MongoDB).

---

## 📂 Project Structure

```
project-root/
├── frontend/             # Frontend client application (Vite Dev Server)
│   ├── public/           # Static asset assets (wireframes, icons)
│   ├── src/
│   │   ├── services/     # Centralized API service layer (api.js)
│   │   ├── utils/        # Global helper utilities and toaster alerts (utils.js)
│   │   ├── components/   # HTML template grid card builders (components.js)
│   │   ├── styles/       # SaaS visual variable stylesheets (style.css)
│   │   └── app.js        # Main SPA hash router & timer hooks controller
│   ├── package.json      # Frontend package configuration
│   ├── vite.config.js    # Vite builder server setup
│   └── .env              # Client environment endpoints variable
│
├── backend/              # RESTful API Service Backend
│   ├── src/
│   │   ├── config/       # MongoDB connections setup (db.js)
│   │   ├── middleware/   # Token validation and RBAC guards (auth.js)
│   │   ├── models/       # Mongoose schemas (User, Category, Task, Comments, logs)
│   │   └── routes/       # Auth routes and tasks CRUD routers
│   ├── package.json      # Backend package configuration
│   └── .env              # Server ports and connection cluster secrets
│
├── package.json          # Root workspace scripts runner
└── README.md             # Integration guide instructions
```

---

## ⚡ Setup & Launch Guide

### 1. Prerequisites
Make sure you have **Node.js** (v18+) and an active **MongoDB Atlas Cluster** database.

### 2. Quick Install
Run this command from the project root to install dependencies for both the frontend and backend applications:
```bash
npm run install-all
```

### 3. Launching the Services

You must start the backend database service and the frontend client dev server in two separate terminal shells:

#### Option A: Running with Prefix Scripts (From root)
- To launch the **Backend API** (Runs on port `5000`):
  ```bash
  npm run dev-backend
  ```
- To launch the **Frontend Dev Server** (Runs on port `5173`):
  ```bash
  npm run dev-frontend
  ```

#### Option B: Running Individually (From subdirectories)
- **Backend API**:
  ```bash
  cd backend
  npm run dev
  ```
- **Frontend SPA**:
  ```bash
  cd frontend
  npm run dev
  ```

Once both services are active, navigate your browser to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_signature_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔌 API Endpoints Reference

### Authentication Routing (`/api/auth`)
- `POST /api/auth/register` - Create a new user account (returns 211 redirect status)
- `POST /api/auth/login` - Authenticate member credentials and retrieve JWT session
- `POST /api/auth/guest-login` - Seed a clean sandbox session for guests (bypasses password, reseeds 5 tasks)
- `GET /api/auth/profile` - Retrieve active account metadata and stats metrics
- `POST /api/auth/logout` - Clear session (purges sandboxed database records for guest visits)

### Core Tasks & Workspace Features (`/api`)
- `GET /api/dashboard/stats` - Fetch aggregate metrics and category/time arrays
- `GET /api/tasks` - Query tasks (scoped strictly by owner ID, Admin sees all)
- `GET /api/tasks/:id` - Fetch single task details, comments, and audit histories
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task details (logs audit logs for modified attributes)
- `DELETE /api/tasks/:id` - Cascade delete task, comment streams, and action logs
- `POST /api/tasks/:id/log-time` - Log focus time to a task (increments actual minutes)
- `GET /api/categories` - List categories
- `POST /api/categories` - Create custom category (Admin/Member only)
- `DELETE /api/categories/:id` - Delete category (Admin/Member only)
- `POST /api/tasks/:id/comments` - Append comments to task cards
- `GET /api/activity-logs` - Retrieve audit trails (non-admins only see own logs)
- `GET /api/system/export` - Export workspace JSON dump (Guest blocked)
- `POST /api/system/import` - Import and restore workspace collections (Guest blocked)

---

## 🛠️ Troubleshooting

- **CORS Blockage**: Ensure `backend/.env` has `CLIENT_URL=http://localhost:5173` matching the frontend server location.
- **Port Conflicts**: Ensure port `5000` (backend) and port `5173` (frontend) are free on your system before launching.
