// ==========================================================================
// Zenith Interactive Components (Kanban Board, List, and Task Detail Modals)
// ==========================================================================

const Components = {
  // Store loaded users & categories in memory for quick lookups
  users: [],
  categories: [],

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
  // 1. Kanban Board Component
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

      // Group tasks by status
      tasks.forEach(task => {
        if (columns[task.status]) {
          columns[task.status].push(task);
        }
      });

      let html = '<div class="kanban-board">';
      
      // Render columns
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

        // Render cards inside column
        statusTasks.forEach(task => {
          const priorityClass = task.priority.toLowerCase();
          const catStyle = Utils.getCategoryStyle(task.category_color);
          const isOverdue = task.status !== 'Completed' && Utils.isOverdue(task.due_date);
          const dueDateText = task.due_date ? Utils.formatDate(task.due_date) : '';
          
          html += `
            <div class="task-card" draggable="true" ondragstart="Components.onDragStart(event, ${task.id})" onclick="Components.showTaskDetails(${task.id})">
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

  // HTML5 Drag and Drop handlers
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
      
      // Refresh current view
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
  // 2. Task List / Grid View Component
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

    // Build filter UI and Table Shell if not already built
    let filterBar = container.querySelector('.filter-bar');
    let tableContainer = container.querySelector('.list-table-container');

    if (!filterBar || !tableContainer) {
      // Build filter bar elements
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

      // Attach filter change listeners
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

      // Sort client-side
      tasks.sort((a, b) => {
        let valA = a[this.sortBy];
        let valB = b[this.sortBy];

        // Handle nulls
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'string') {
          return this.sortOrder === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        } else {
          return this.sortOrder === 'asc' 
            ? valA - valB 
            : valB - valA;
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
              <span class="list-task-title" onclick="Components.showTaskDetails(${t.id})">${t.title}</span>
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
  // 3. Task Details Modal Component
  // ==========================================
  async showTaskDetails(taskId) {
    const overlay = document.getElementById('modal-container');
    if (!overlay) return;

    overlay.innerHTML = '<div class="modal-box"><div class="modal-body">Loading task details...</div></div>';
    overlay.classList.remove('hidden');

    try {
      const task = await API.getTask(taskId);

      // Build categories options
      let categoryOptions = '<option value="">No Category</option>';
      this.categories.forEach(c => {
        categoryOptions += `<option value="${c.id}" ${task.category_id === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`;
      });

      // Build users options
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
              <form id="task-detail-form" class="detail-main" onsubmit="Components.saveTaskDetails(event, ${task.id})">
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
                  <button type="button" class="btn btn-danger" onclick="Components.deleteTask(${task.id})">Delete Task</button>
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
                  
                  <!-- Progress Bar -->
                  <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 1.2rem;">
                    <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary)); border-radius: 4px;"></div>
                  </div>

                  <!-- Focus Timer Launch -->
                  <button class="btn btn-secondary" style="width: 100%; display: flex; justify-content: center; gap: 0.5rem;" onclick="Components.loadTaskToTimer(${task.id}, '${task.title.replace(/'/g, "\\'")}')">
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
                    <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="Components.postComment(${task.id})">Post</button>
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
      
      // Refresh Details Modal (remains open)
      this.showTaskDetails(taskId);
      
      // Refresh current view (in case count indicators update)
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
      category_id: category_id ? parseInt(category_id) : null,
      assignee_id: assignee_id ? parseInt(assignee_id) : null,
      due_date: due_date || null,
      estimated_minutes: estimated_minutes ? parseInt(estimated_minutes) : 0
    };

    try {
      await API.updateTask(taskId, payload);
      Utils.showToast('Task updated successfully');
      closeModal();
      
      // Refresh background view
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

      // Refresh background view
      if (window.currentView === 'kanban') this.renderKanban('view-kanban');
      if (window.currentView === 'list') this.renderList('view-list');
    } catch (err) {
      Utils.showToast(`Failed to delete task: ${err.message}`, 'error');
    }
  },

  // Load selected task into the Global Pomodoro timer
  loadTaskToTimer(taskId, taskTitle) {
    if (window.loadTimerTask) {
      window.loadTimerTask(taskId, taskTitle);
      closeModal();
      Utils.showToast(`"${taskTitle}" loaded into focus timer`);
    }
  },

  // ==========================================
  // 4. Create Task Modal Component
  // ==========================================
  showCreateTaskModal() {
    const overlay = document.getElementById('modal-container');
    if (!overlay) return;

    // Build categories options
    let categoryOptions = '<option value="">No Category</option>';
    this.categories.forEach(c => {
      categoryOptions += `<option value="${c.id}">${c.icon} ${c.name}</option>`;
    });

    // Build users options
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
      category_id: category_id ? parseInt(category_id) : null,
      assignee_id: assignee_id ? parseInt(assignee_id) : null,
      due_date: due_date || null,
      estimated_minutes: estimated_minutes ? parseInt(estimated_minutes) : 0
    };

    try {
      await API.createTask(payload);
      Utils.showToast('Task created successfully');
      closeModal();

      // Refresh current view
      if (window.currentView === 'kanban') this.renderKanban('view-kanban');
      if (window.currentView === 'list') this.renderList('view-list');
    } catch (err) {
      Utils.showToast(`Failed to create task: ${err.message}`, 'error');
    }
  }
};
