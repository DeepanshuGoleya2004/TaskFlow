// ==========================================================================
// Zenith Interactive Components (Dashboard, Kanban, List, Calendar, and Modals)
// ==========================================================================

const Components = {
  // Store loaded metadata and charts
  users: [],
  categories: [],
  charts: {},
  calendarDate: new Date(),

  async initialize() {
    try {
      // Load dependencies
      this.users = await API.getUsers();
      this.categories = await API.getCategories();
    } catch (err) {
      console.error('Failed to initialize components metadata:', err);
    }
  },

  // ==========================================
  // 1. Dashboard Component (with Animated Charts)
  // ==========================================
  async renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading dashboard metrics...</div>';

    try {
      const stats = await API.getStats();

      container.innerHTML = `
        <!-- Top Stats Cards Grid -->
        <div class="dashboard-grid-stats">
          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper todo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Total Tasks</h3>
              <div class="stat-number">${stats.total_tasks}</div>
            </div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper progress">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
            </div>
            <div class="stat-details">
              <h3>In Progress</h3>
              <div class="stat-number">${stats.in_progress_tasks}</div>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Completion Rate</h3>
              <div class="stat-number">${stats.completion_rate}%</div>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper overdue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="stat-details">
              <h3>Overdue Tasks</h3>
              <div class="stat-number" style="color: ${stats.overdue_tasks > 0 ? 'var(--priority-urgent)' : 'inherit'}">${stats.overdue_tasks}</div>
            </div>
          </div>
        </div>

        <!-- Charts Layout Row -->
        <div class="dashboard-row-analytics">
          <div class="glass-panel" style="height: 350px;">
            <div class="chart-panel-header">
              <h2>Workload Distribution</h2>
              <span class="text-muted" style="font-size: 0.8rem;">Task count by category</span>
            </div>
            <div class="chart-canvas-wrapper">
              <canvas id="chart-workload"></canvas>
            </div>
          </div>

          <div class="glass-panel" style="height: 350px;">
            <div class="chart-panel-header">
              <h2>Focus Hours Spent</h2>
              <span class="text-muted" style="font-size: 0.8rem;">Total minutes logged</span>
            </div>
            <div class="chart-canvas-wrapper">
              <canvas id="chart-time"></canvas>
            </div>
          </div>
        </div>
      `;

      // Render actual charts
      this.renderDashboardCharts(stats);
    } catch (err) {
      container.innerHTML = `<div class="error-msg">Error loading dashboard: ${err.message}</div>`;
    }
  },

  renderDashboardCharts(stats) {
    // Destroy previous chart instances if they exist
    if (this.charts.workload) this.charts.workload.destroy();
    if (this.charts.time) this.charts.time.destroy();

    const workloadCtx = document.getElementById('chart-workload');
    const timeCtx = document.getElementById('chart-time');

    if (!workloadCtx || !timeCtx) return;

    // Process workload distribution data
    const workloadLabels = stats.category_distribution.map(c => c.category_name || 'Uncategorized');
    const workloadData = stats.category_distribution.map(c => c.count);
    const workloadColors = stats.category_distribution.map(c => c.category_color || '#8b98a5');

    // Process time spent data
    const timeLabels = stats.time_spent_by_category.map(c => c.category_name || 'Uncategorized');
    const timeData = stats.time_spent_by_category.map(c => c.total_actual_minutes || 0);
    const timeColors = stats.time_spent_by_category.map(c => c.category_color || '#8b98a5');

    // Build Workload Distribution Chart (Bar Chart)
    this.charts.workload = new Chart(workloadCtx, {
      type: 'bar',
      data: {
        labels: workloadLabels,
        datasets: [{
          label: 'Tasks Count',
          data: workloadData,
          backgroundColor: workloadColors.map(c => c.replace(')', ', 0.35)').replace('hsl', 'hsla')),
          borderColor: workloadColors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: Utils.getChartOptions()
    });

    // Build Time Logged Chart (Doughnut Chart)
    this.charts.time = new Chart(timeCtx, {
      type: 'doughnut',
      data: {
        labels: timeLabels,
        datasets: [{
          data: timeData,
          backgroundColor: timeColors.map(c => c.replace(')', ', 0.45)').replace('hsl', 'hsla')),
          borderColor: timeColors,
          borderWidth: 1.5
        }]
      },
      options: {
        ...Utils.getChartOptions(),
        scales: {
          x: { display: false },
          y: { display: false }
        },
        cutout: '70%'
      }
    });
  },

  // ==========================================
  // 2. Kanban Board Component
  // ==========================================
  async renderKanban(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading Kanban Board...</div>';

    try {
      const tasks = await API.getTasks();
      const columns = {
        'Todo': [],
        'In Progress': [],
        'Review': [],
        'Completed': []
      };

      tasks.forEach(task => {
        if (columns[task.status]) {
          columns[task.status].push(task);
        }
      });

      let html = '<div class="kanban-board">';
      for (const [status, statusTasks] of Object.entries(columns)) {
        const dotClass = status.toLowerCase().replace(' ', '');
        html += `
          <div class="kanban-column" data-status="${status}" ondragover="Components.onDragOver(event)" ondragleave="Components.onDragLeave(event)" ondrop="Components.onDrop(event, '${status}')">
            <div class="column-header">
              <div class="column-title-group">
                <span class="column-dot ${dotClass}"></span>
                <h2>${status}</h2>
              </div>
              <span class="column-count">${statusTasks.length}</span>
            </div>
            <div class="column-cards-container">
        `;

        statusTasks.forEach(task => {
          const priorityClass = task.priority.toLowerCase();
          const catStyle = Utils.getCategoryStyle(task.category_color);
          const isOverdue = task.status !== 'Completed' && Utils.isOverdue(task.due_date);
          const dueDateText = task.due_date ? Utils.formatDate(task.due_date) : '';
          
          html += `
            <div class="task-card" draggable="true" ondragstart="Components.onDragStart(event, '${task.id}')" onclick="Components.showTaskDetails('${task.id}')">
              <div class="card-tags">
                ${task.category_name ? `<span class="category-tag" style="${catStyle}">${task.category_icon} ${task.category_name}</span>` : '<span></span>'}
                <span class="priority-tag ${priorityClass}">${task.priority}</span>
              </div>
              <h3>${task.title}</h3>
              <p class="card-desc">${task.description || 'No description provided.'}</p>
              <div class="card-footer">
                <div class="card-due ${isOverdue ? 'overdue' : ''}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>${dueDateText || 'No due date'}</span>
                </div>
                ${task.assignee_name ? `
                  <div class="card-assignee" title="Assigned to ${task.assignee_name}">
                    <div class="avatar-circle">${task.assignee_avatar || 'U'}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      html += '</div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="error-msg">Error loading Kanban Board: ${err.message}</div>`;
    }
  },

  onDragStart(event, taskId) {
    event.dataTransfer.setData('text/plain', taskId);
    event.currentTarget.classList.add('dragging');
  },

  onDragOver(event) {
    event.preventDefault();
    const column = event.currentTarget;
    column.classList.add('drag-over');
  },

  onDragLeave(event) {
    const column = event.currentTarget;
    column.classList.remove('drag-over');
  },

  async onDrop(event, status) {
    event.preventDefault();
    const column = event.currentTarget;
    column.classList.remove('drag-over');

    const taskId = event.dataTransfer.getData('text/plain');
    if (!taskId) return;

    try {
      await API.updateTask(taskId, { status: status });
      Utils.showToast(`Task status updated to "${status}"`);
      
      if (window.currentView === 'kanban') {
        this.renderKanban('view-kanban');
      } else if (window.currentView === 'list') {
        this.renderList('view-list');
      }
    } catch (err) {
      Utils.showToast(`Failed to update task status: ${err.message}`, 'error');
    }
  },

  // ==========================================
  // 3. Task List / Grid View Component
  // ==========================================
  currentFilters: {
    status: '',
    priority: '',
    category_id: '',
    assignee_id: '',
    search: ''
  },
  sortBy: 'due_date',
  sortOrder: 'asc',

  async renderList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filterBar = container.querySelector('.filter-bar');
    let tableContainer = container.querySelector('.list-table-container');

    if (!filterBar || !tableContainer) {
      let categoryOptions = '<option value="">All Categories</option>';
      this.categories.forEach(c => {
        categoryOptions += `<option value="${c.id}">${c.icon} ${c.name}</option>`;
      });

      let userOptions = '<option value="">All Assignees</option>';
      this.users.forEach(u => {
        userOptions += `<option value="${u.id}">${u.name}</option>`;
      });

      container.innerHTML = `
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="form-control" id="list-filter-search" placeholder="Search tasks..." value="${this.currentFilters.search}">
          </div>
          <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
            <select class="form-control" id="list-filter-status" style="width: 140px;">
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
            <select class="form-control" id="list-filter-priority" style="width: 140px;">
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <select class="form-control" id="list-filter-category" style="width: 160px;">
              ${categoryOptions}
            </select>
            <select class="form-control" id="list-filter-assignee" style="width: 160px;">
              ${userOptions}
            </select>
          </div>
        </div>
        <div class="list-table-container glass-panel">
          <table class="list-table">
            <thead>
              <tr>
                <th onclick="Components.sortList('title')">Task Name</th>
                <th onclick="Components.sortList('status')">Status</th>
                <th onclick="Components.sortList('priority')">Priority</th>
                <th onclick="Components.sortList('category_id')">Category</th>
                <th onclick="Components.sortList('assignee_id')">Assignee</th>
                <th onclick="Components.sortList('due_date')">Due Date</th>
                <th onclick="Components.sortList('actual_minutes')">Time Spent</th>
              </tr>
            </thead>
            <tbody id="list-tasks-body">
              <tr><td colspan="7" style="text-align: center;">Loading tasks...</td></tr>
            </tbody>
          </table>
        </div>
      `;

      document.getElementById('list-filter-search').addEventListener('input', (e) => {
        this.currentFilters.search = e.target.value;
        this.fetchAndRenderListBody();
      });
      document.getElementById('list-filter-status').addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.fetchAndRenderListBody();
      });
      document.getElementById('list-filter-priority').addEventListener('change', (e) => {
        this.currentFilters.priority = e.target.value;
        this.fetchAndRenderListBody();
      });
      document.getElementById('list-filter-category').addEventListener('change', (e) => {
        this.currentFilters.category_id = e.target.value;
        this.fetchAndRenderListBody();
      });
      document.getElementById('list-filter-assignee').addEventListener('change', (e) => {
        this.currentFilters.assignee_id = e.target.value;
        this.fetchAndRenderListBody();
      });
    }

    this.fetchAndRenderListBody();
  },

  async fetchAndRenderListBody() {
    const tbody = document.getElementById('list-tasks-body');
    if (!tbody) return;

    try {
      let tasks = await API.getTasks(this.currentFilters);

      tasks.sort((a, b) => {
        let valA = a[this.sortBy];
        let valB = b[this.sortBy];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'string') {
          return this.sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return this.sortOrder === 'asc' ? valA - valB : valB - valA;
        }
      });

      if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No tasks match selected filter criteria.</td></tr>';
        return;
      }

      let html = '';
      tasks.forEach(t => {
        const priorityClass = t.priority.toLowerCase();
        const statusClass = t.status.toLowerCase().replace(' ', '');
        const catStyle = Utils.getCategoryStyle(t.category_color);
        const isOverdue = t.status !== 'Completed' && Utils.isOverdue(t.due_date);
        
        html += `
          <tr>
            <td>
              <span class="list-task-title" onclick="Components.showTaskDetails('${t.id}')">${t.title}</span>
            </td>
            <td>
              <span class="status-badge ${statusClass}">${t.status}</span>
            </td>
            <td>
              <span class="priority-tag ${priorityClass}">${t.priority}</span>
            </td>
            <td>
              ${t.category_name ? `<span class="category-tag" style="${catStyle}">${t.category_icon} ${t.category_name}</span>` : '<span class="text-muted">—</span>'}
            </td>
            <td>
              ${t.assignee_name ? `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div class="avatar-circle">${t.assignee_avatar}</div>
                  <span>${t.assignee_name}</span>
                </div>
              ` : '<span class="text-muted">—</span>'}
            </td>
            <td class="${isOverdue ? 'text-danger' : ''}" style="${isOverdue ? 'color: var(--priority-urgent); font-weight: 600;' : ''}">
              ${t.due_date ? Utils.formatDate(t.due_date) : '<span class="text-muted">—</span>'}
            </td>
            <td>
              <span class="time-spent-badge" style="font-weight: 500;">
                ⏱️ ${Utils.formatMinutes(t.actual_minutes)} / ${Utils.formatMinutes(t.estimated_minutes)}
              </span>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--priority-urgent);">Error: ${err.message}</td></tr>`;
    }
  },

  sortList(field) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.fetchAndRenderListBody();
  },

  // ==========================================
  // 4. Calendar Component
  // ==========================================
  async renderCalendar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading calendar dates...</div>';

    try {
      const tasks = await API.getTasks();
      const year = this.calendarDate.getFullYear();
      const month = this.calendarDate.getMonth();

      // Start of month day (0-6)
      const firstDayIndex = new Date(year, month, 1).getDay();
      // Total days in month
      const totalDays = new Date(year, month + 1, 0).getDate();
      // Total days in previous month
      const prevTotalDays = new Date(year, month, 0).getDate();

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      let html = `
        <div class="glass-panel">
          <div class="calendar-header">
            <h2>${monthNames[month]} ${year}</h2>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary" onclick="Components.navigateCalendar(-1)" style="padding: 0.5rem 0.8rem;">&lt;</button>
              <button class="btn btn-secondary" onclick="Components.navigateCalendar(0)" style="padding: 0.5rem 0.8rem;">Today</button>
              <button class="btn btn-secondary" onclick="Components.navigateCalendar(1)" style="padding: 0.5rem 0.8rem;">&gt;</button>
            </div>
          </div>
          <div class="calendar-grid">
            <!-- Day labels -->
            <div class="calendar-day-label">Sun</div>
            <div class="calendar-day-label">Mon</div>
            <div class="calendar-day-label">Tue</div>
            <div class="calendar-day-label">Wed</div>
            <div class="calendar-day-label">Thu</div>
            <div class="calendar-day-label">Fri</div>
            <div class="calendar-day-label">Sat</div>
      `;

      // Render previous month's padding cells
      for (let i = firstDayIndex; i > 0; i--) {
        const d = prevTotalDays - i + 1;
        html += `
          <div class="calendar-cell inactive">
            <div class="calendar-date">${d}</div>
          </div>
        `;
      }

      const todayStr = new Date().toISOString().split('T')[0];

      // Render active month cells
      for (let day = 1; day <= totalDays; day++) {
        const currentCellDate = new Date(year, month, day);
        // ISO YYYY-MM-DD
        const currentCellDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Find tasks due on this date
        const cellTasks = tasks.filter(t => t.due_date === currentCellDateStr);
        const isToday = currentCellDateStr === todayStr;

        html += `
          <div class="calendar-cell ${isToday ? 'today' : ''}">
            <div class="calendar-date">${day}</div>
            <div style="display: flex; flex-direction: column; gap: 0.3rem; overflow-y: auto; flex-grow: 1;">
              ${cellTasks.map(t => {
                const priorityColor = t.priority === 'Urgent' ? 'var(--priority-urgent)' : (t.priority === 'High' ? 'var(--priority-high)' : 'var(--primary)');
                const borderHsl = t.category_color || priorityColor;
                const bgHsl = borderHsl.replace(')', ', 0.15)').replace('hsl', 'hsla');
                
                return `
                  <div class="calendar-task-item" style="background: ${bgHsl}; border-left: 3px solid ${borderHsl}; color: #fff;" onclick="Components.showTaskDetails('${t.id}'); event.stopPropagation();">
                    ${t.title}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Render next month's padding cells to fill the grid (total cells should be multiple of 7)
      const totalCellsFilled = firstDayIndex + totalDays;
      const cellsToFill = 42 - totalCellsFilled; // 6 rows of 7 = 42
      for (let i = 1; i <= cellsToFill; i++) {
        html += `
          <div class="calendar-cell inactive">
            <div class="calendar-date">${i}</div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="error-msg">Error loading calendar: ${err.message}</div>`;
    }
  },

  navigateCalendar(direction) {
    if (direction === 0) {
      this.calendarDate = new Date();
    } else {
      this.calendarDate.setMonth(this.calendarDate.getMonth() + direction);
    }
    this.renderCalendar('view-calendar');
  },

  // ==========================================
  // 5. Task Details Modal Component
  // ==========================================
  async showTaskDetails(taskId) {
    const overlay = document.getElementById('modal-container');
    if (!overlay) return;

    overlay.innerHTML = '<div class="modal-box"><div class="modal-body">Loading task details...</div></div>';
    overlay.classList.remove('hidden');

    try {
      const task = await API.getTask(taskId);

      let categoryOptions = '<option value="">No Category</option>';
      this.categories.forEach(c => {
        categoryOptions += `<option value="${c.id}" ${task.category_id === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`;
      });

      let assigneeOptions = '<option value="">No Assignee</option>';
      this.users.forEach(u => {
        assigneeOptions += `<option value="${u.id}" ${task.assignee_id === u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`;
      });

      const estHours = task.estimated_minutes ? task.estimated_minutes : 0;
      const progressPercent = task.estimated_minutes > 0 ? Math.min(Math.round((task.actual_minutes / task.estimated_minutes) * 100), 100) : 0;

      overlay.innerHTML = `
        <div class="modal-box large">
          <div class="modal-header">
            <h2>Task Detail Settings</h2>
            <button class="modal-close" onclick="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-layout">
              
              <!-- Left Side: Core Edit Form -->
              <form id="task-detail-form" class="detail-main" onsubmit="Components.saveTaskDetails(event, '${task.id}')">
                <div class="form-group">
                  <label for="detail-title">Task Title</label>
                  <input type="text" id="detail-title" class="form-control" value="${task.title}" required>
                </div>
                
                <div class="form-group">
                  <label for="detail-desc">Description</label>
                  <textarea id="detail-desc" class="form-control" rows="4" style="resize: none;">${task.description || ''}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-status">Status</label>
                    <select id="detail-status" class="form-control">
                      <option value="Todo" ${task.status === 'Todo' ? 'selected' : ''}>Todo</option>
                      <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option value="Review" ${task.status === 'Review' ? 'selected' : ''}>Review</option>
                      <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="detail-priority">Priority</label>
                    <select id="detail-priority" class="form-control">
                      <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                      <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                      <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                      <option value="Urgent" ${task.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-category">Category</label>
                    <select id="detail-category" class="form-control">
                      ${categoryOptions}
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="detail-assignee">Assignee</label>
                    <select id="detail-assignee" class="form-control">
                      ${assigneeOptions}
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-due">Due Date</label>
                    <input type="date" id="detail-due" class="form-control" value="${task.due_date || ''}">
                  </div>
                  <div class="form-group">
                    <label for="detail-estimate">Estimate (Minutes)</label>
                    <input type="number" id="detail-estimate" class="form-control" min="0" value="${estHours}">
                  </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                  <button type="submit" class="btn btn-primary" style="flex-grow: 1;">Save Changes</button>
                  <button type="button" class="btn btn-danger" onclick="Components.deleteTask('${task.id}')">Delete Task</button>
                </div>
              </form>

              <!-- Right Side: Focus Timer, Comments and Activity Logs -->
              <div class="detail-side">
                
                <!-- Time & Focus Section -->
                <div>
                  <div class="detail-section-title">Focus & Time Progress</div>
                  <div style="margin-bottom: 0.8rem; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <span>Logged: <strong>${Utils.formatMinutes(task.actual_minutes)}</strong></span>
                    <span>Estimate: <strong>${Utils.formatMinutes(task.estimated_minutes)}</strong></span>
                  </div>
                  
                  <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 1.2rem;">
                    <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary)); border-radius: 4px;"></div>
                  </div>

                  <button class="btn btn-secondary" style="width: 100%; display: flex; justify-content: center; gap: 0.5rem;" onclick="Components.loadTaskToTimer('${task.id}', '${task.title.replace(/'/g, "\\'")}')">
                    ⏱️ Load Focus Timer
                  </button>
                </div>

                <!-- Comments Feed -->
                <div>
                  <div class="detail-section-title">Comments Feed</div>
                  <div class="comments-feed" id="modal-comments-feed">
                    ${this.renderCommentsList(task.comments)}
                  </div>
                  
                  <div style="display: flex; gap: 0.5rem;">
                    <select id="comment-user-id" class="form-control" style="width: 100px; padding: 0.4rem 0.5rem; font-size: 0.8rem;">
                      ${this.users.map(u => `<option value="${u.id}">${u.avatar}</option>`).join('')}
                    </select>
                    <input type="text" id="comment-text-input" class="form-control" placeholder="Add a comment..." style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                    <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="Components.postComment('${task.id}')">Post</button>
                  </div>
                </div>

                <!-- Audit History Logs -->
                <div>
                  <div class="detail-section-title">Task Log Audit Trail</div>
                  <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.75rem; padding-right: 0.5rem;">
                    ${task.activity_logs.map(log => `
                      <div style="border-left: 2px solid var(--border-glass); padding-left: 0.6rem; margin-left: 0.2rem;">
                        <span style="color: var(--text-muted);">${new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> - 
                        <strong>${log.user_name || 'System'}</strong>: 
                        <span style="color: var(--text-secondary);">${log.details}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      `;
    } catch (err) {
      overlay.innerHTML = `<div class="modal-box"><div class="modal-body text-danger">Error: ${err.message}</div></div>`;
    }
  },

  renderCommentsList(comments) {
    if (!comments || comments.length === 0) {
      return '<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem 0;">No comments yet. Be the first!</div>';
    }

    return comments.map(c => `
      <div class="comment-card">
        <div class="comment-header">
          <span class="comment-author">${c.user_name} (${c.user_role})</span>
          <span class="comment-time">${new Date(c.created_at).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
        </div>
        <div class="comment-body">${c.content}</div>
      </div>
    `).join('');
  },

  async postComment(taskId) {
    const input = document.getElementById('comment-text-input');
    const userSelect = document.getElementById('comment-user-id');
    if (!input || !input.value.trim() || !userSelect) return;

    const content = input.value.trim();
    const userId = userSelect.value;

    try {
      await API.postComment(taskId, { user_id: userId, content: content });
      input.value = '';
      Utils.showToast('Comment posted successfully');
      this.showTaskDetails(taskId);
      
      if (window.currentView === 'kanban') this.renderKanban('view-kanban');
      if (window.currentView === 'list') this.renderList('view-list');
    } catch (err) {
      Utils.showToast(`Failed to post comment: ${err.message}`, 'error');
    }
  },

  async saveTaskDetails(event, taskId) {
    event.preventDefault();
    
    const title = document.getElementById('detail-title').value.trim();
    const description = document.getElementById('detail-desc').value.trim();
    const status = document.getElementById('detail-status').value;
    const priority = document.getElementById('detail-priority').value;
    const category_id = document.getElementById('detail-category').value;
    const assignee_id = document.getElementById('detail-assignee').value;
    const due_date = document.getElementById('detail-due').value;
    const estimated_minutes = document.getElementById('detail-estimate').value;

    const payload = {
      title,
      description,
      status,
      priority,
      category_id: category_id || null,
      assignee_id: assignee_id || null,
      due_date: due_date || null,
      estimated_minutes: estimated_minutes ? parseInt(estimated_minutes) : 0
    };

    try {
      await API.updateTask(taskId, payload);
      Utils.showToast('Task updated successfully');
      closeModal();
      
      if (window.currentView === 'kanban') this.renderKanban('view-kanban');
      if (window.currentView === 'list') this.renderList('view-list');
    } catch (err) {
      Utils.showToast(`Failed to update task: ${err.message}`, 'error');
    }
  },

  async deleteTask(taskId) {
    if (!confirm('Are you absolutely sure you want to delete this task? This action is permanent.')) return;

    try {
      await API.deleteTask(taskId);
      Utils.showToast('Task deleted successfully');
      closeModal();

      if (window.currentView === 'kanban') this.renderKanban('view-kanban');
      if (window.currentView === 'list') this.renderList('view-list');
    } catch (err) {
      Utils.showToast(`Failed to delete task: ${err.message}`, 'error');
    }
  },

  loadTaskToTimer(taskId, taskTitle) {
    if (window.loadTimerTask) {
      window.loadTimerTask(taskId, taskTitle);
      closeModal();
      Utils.showToast(`"${taskTitle}" loaded into focus timer`);
    }
  },

  // ==========================================
  // 6. Create Task Modal Component
  // ==========================================
  showCreateTaskModal() {
    const overlay = document.getElementById('modal-container');
    if (!overlay) return;

    let categoryOptions = '<option value="">No Category</option>';
    this.categories.forEach(c => {
      categoryOptions += `<option value="${c.id}">${c.icon} ${c.name}</option>`;
    });

    let assigneeOptions = '<option value="">No Assignee</option>';
    this.users.forEach(u => {
      assigneeOptions += `<option value="${u.id}">${u.name} (${u.role})</option>`;
    });

    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2>Create New Workspace Task</h2>
          <button class="modal-close" onclick="closeModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="create-task-form" onsubmit="Components.createTask(event)">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.2rem;">
            <div class="form-group">
              <label for="create-title">Task Title</label>
              <input type="text" id="create-title" class="form-control" placeholder="e.g. Code auth route tests" required>
            </div>
            
            <div class="form-group">
              <label for="create-desc">Description</label>
              <textarea id="create-desc" class="form-control" rows="3" placeholder="Describe the task objective..." style="resize: none;"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="create-status">Initial Status</label>
                <select id="create-status" class="form-control">
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-group">
                <label for="create-priority">Priority</label>
                <select id="create-priority" class="form-control">
                  <option value="Low">Low</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="create-category">Category</label>
                <select id="create-category" class="form-control">
                  ${categoryOptions}
                </select>
              </div>
              <div class="form-group">
                <label for="create-assignee">Assignee</label>
                <select id="create-assignee" class="form-control">
                  ${assigneeOptions}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="create-due">Due Date</label>
                <input type="date" id="create-due" class="form-control">
              </div>
              <div class="form-group">
                <label for="create-estimate">Estimate (Minutes)</label>
                <input type="number" id="create-estimate" class="form-control" min="0" value="0">
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    `;

    overlay.classList.remove('hidden');
  },

  async createTask(event) {
    event.preventDefault();

    const title = document.getElementById('create-title').value.trim();
    const description = document.getElementById('create-desc').value.trim();
    const status = document.getElementById('create-status').value;
    const priority = document.getElementById('create-priority').value;
    const category_id = document.getElementById('create-category').value;
    const assignee_id = document.getElementById('create-assignee').value;
    const due_date = document.getElementById('create-due').value;
    const estimated_minutes = document.getElementById('create-estimate').value;

    const payload = {
      title,
      description,
      status,
      priority,
      category_id: category_id || null,
      assignee_id: assignee_id || null,
      due_date: due_date || null,
      estimated_minutes: estimated_minutes ? parseInt(estimated_minutes) : 0
    };

    try {
      await API.createTask(payload);
      Utils.showToast('Task created successfully');
      closeModal();

      // Refresh active panel
      if (window.currentView === 'dashboard') this.renderDashboard('view-dashboard');
      if (window.currentView === 'kanban') this.renderKanban('view-kanban');
      if (window.currentView === 'list') this.renderList('view-list');
      if (window.currentView === 'calendar') this.renderCalendar('view-calendar');
    } catch (err) {
      Utils.showToast(`Failed to create task: ${err.message}`, 'error');
    }
  },

  // ==========================================
  // 5. Activity Logs View Component
  // ==========================================
  async renderLogs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading audit logs...</div>';

    try {
      const logs = await API.getActivityLogs();

      if (logs.length === 0) {
        container.innerHTML = `
          <div class="glass-panel" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            No activities recorded in the workspace yet.
          </div>
        `;
        return;
      }

      let html = `
        <div class="glass-panel">
          <h2 style="font-family: var(--font-heading); margin-bottom: 1.5rem; font-size: 1.3rem;">Workspace Activity Timeline</h2>
          <div class="logs-timeline">
      `;

      logs.forEach(log => {
        const actionClass = log.action;
        const date = new Date(log.created_at);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        const taskRef = log.task_title ? ` on <strong style="color: var(--primary); cursor: pointer;" onclick="Components.showTaskDetails(${log.task_id})">${log.task_title}</strong>` : '';

        html += `
          <div class="log-item">
            <span class="log-dot ${actionClass}"></span>
            <div class="log-meta">
              <span class="log-actor">${log.user_name || 'System'}</span>
              <span>•</span>
              <span>${dateStr} at ${timeStr}</span>
            </div>
            <div class="log-details">${log.details}${taskRef}</div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="error-msg">Error loading activity logs: ${err.message}</div>`;
    }
  },

  // ==========================================
  // 6. Settings Component (Categories, Backup Portability)
  // ==========================================
  async renderSettings(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading settings...</div>';

    try {
      this.categories = await API.getCategories();

      let categoryListHtml = '';
      this.categories.forEach(c => {
        const isSystem = ['Design', 'Engineering', 'Marketing', 'General'].includes(c.name);
        const catStyle = Utils.getCategoryStyle(c.color);
        
        categoryListHtml += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); margin-bottom: 0.6rem;">
            <span class="category-tag" style="${catStyle}">${c.icon} ${c.name}</span>
            ${isSystem ? `
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Default</span>
            ` : `
               <button class="btn-timer-ctrl" onclick="Components.deleteCategory('${c.id}')" style="border-color: rgba(235, 87, 87, 0.2); color: var(--priority-urgent);">Delete</button>
            `}
          </div>
        `;
      });

      container.innerHTML = `
        <div class="settings-grid">
          
          <div class="glass-panel">
            <div class="settings-section-title">Category Settings</div>
            <p class="settings-description">Custom categories allow tag sorting and project visual grouping.</p>
            
            <div style="margin-bottom: 2rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
               ${categoryListHtml}
            </div>

            <form id="create-category-form" onsubmit="Components.createCategory(event)" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
               <div style="font-weight: 600; font-size: 0.9rem; color: #fff;">Create Custom Category</div>
               <div class="form-group">
                 <label for="cat-name">Category Name</label>
                 <input type="text" id="cat-name" class="form-control" placeholder="e.g. Documentation" required>
               </div>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                 <div class="form-group">
                   <label for="cat-color">Color (HSL)</label>
                   <select id="cat-color" class="form-control">
                     <option value="hsl(280, 80%, 65%)">Purple</option>
                     <option value="hsl(200, 80%, 65%)">Cyan</option>
                     <option value="hsl(340, 80%, 65%)">Pink</option>
                     <option value="hsl(120, 80%, 65%)">Green</option>
                     <option value="hsl(45, 90%, 60%)">Yellow</option>
                     <option value="hsl(15, 85%, 60%)">Orange</option>
                     <option value="hsl(0, 80%, 60%)">Red</option>
                   </select>
                 </div>
                 <div class="form-group">
                   <label for="cat-icon">Icon (Emoji)</label>
                   <select id="cat-icon" class="form-control">
                     <option value="🎨">🎨 Art / Design</option>
                     <option value="💻">💻 Code / Dev</option>
                     <option value="📈">📈 Charts / Marketing</option>
                     <option value="⚙️">⚙️ General</option>
                     <option value="🧪">🧪 Testing</option>
                     <option value="📝">📝 Writing</option>
                     <option value="🚀">🚀 Release</option>
                     <option value="💬">💬 Chat</option>
                   </select>
                 </div>
               </div>
               <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Create Category</button>
            </form>
          </div>

          <div class="glass-panel">
            <div class="settings-section-title">Workspace Data Portability</div>
            <p class="settings-description">Export your complete database, tasks, comment feeds, and activity timelines to a backup JSON file, or restore from a previously exported backup.</p>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
               <div>
                 <div style="font-weight: 600; font-size: 0.9rem; color: #fff; margin-bottom: 0.5rem;">Export Data Backup</div>
                 <button type="button" class="btn btn-secondary" onclick="Components.exportWorkspaceData()" style="width: 100%; justify-content: center; gap: 0.5rem;">
                   📥 Download Workspace Backup JSON
                 </button>
               </div>

               <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem;">
                 <div style="font-weight: 600; font-size: 0.9rem; color: #fff; margin-bottom: 0.5rem;">Restore Workspace Backup</div>
                 <div class="import-upload-area" onclick="document.getElementById('import-file-selector').click()">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                   <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Click to choose file or drag backup JSON here</div>
                   <input type="file" id="import-file-selector" class="hidden" accept=".json" onchange="Components.importWorkspaceData(event)">
                 </div>
               </div>
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="error-msg">Error loading settings: ${err.message}</div>`;
    }
  },

  async deleteCategory(id) {
    if (window.currentUser && window.currentUser.isGuest) {
      Utils.showToast('Managing custom categories is disabled in Guest Mode. Upgrade to save changes.', 'error');
      return;
    }
    try {
      await API.deleteCategory(id);
      Utils.showToast('Category deleted successfully');
      this.renderSettings('view-settings');
    } catch (err) {
      Utils.showToast(`Failed to delete category: ${err.message}`, 'error');
    }
  },

  async createCategory(event) {
    event.preventDefault();
    if (window.currentUser && window.currentUser.isGuest) {
      Utils.showToast('Creating custom categories is disabled in Guest Mode. Upgrade to save changes.', 'error');
      return;
    }
    const name = document.getElementById('cat-name').value.trim();
    const color = document.getElementById('cat-color').value;
    const icon = document.getElementById('cat-icon').value;

    try {
      await API.createCategory({ name, color, icon });
      Utils.showToast('Category created successfully');
      document.getElementById('cat-name').value = '';
      this.renderSettings('view-settings');
    } catch (err) {
      Utils.showToast(`Failed to create category: ${err.message}`, 'error');
    }
  },

  async exportWorkspaceData() {
    if (window.currentUser && window.currentUser.isGuest) {
      Utils.showToast('Workspace backup exports are disabled in Guest Mode.', 'error');
      return;
    }
    try {
      const data = await API.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenith_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Utils.showToast('Backup JSON downloaded successfully');
    } catch (err) {
      Utils.showToast(`Export failed: ${err.message}`, 'error');
    }
  },

  async importWorkspaceData(event) {
    if (window.currentUser && window.currentUser.isGuest) {
      Utils.showToast('Restoring database backups is disabled in Guest Mode.', 'error');
      event.target.value = '';
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!confirm('WARNING: Importing this backup will overwrite ALL current database tasks, comments, categories, and timelines. Do you want to proceed?')) {
          event.target.value = '';
          return;
        }

        const res = await API.importData(parsed);
        Utils.showToast(res.message);
        
        await this.initialize();
        
        const dashBtn = document.querySelector('[data-view="dashboard"]');
        if (dashBtn) dashBtn.click();
      } catch (err) {
        Utils.showToast(`Import failed: Invalid backup file - ${err.message}`, 'error');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }
};

window.Components = Components;
