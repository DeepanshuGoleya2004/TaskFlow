// ==========================================================================
// Zenith Application Controller & SPA Router
// ==========================================================================

window.currentView = 'dashboard';
window.currentTimerTaskId = null;
let timerInterval = null;
let timerSeconds = 25 * 60; // 25 minutes default Focus
let isTimerRunning = false;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Zenith App booting...');
  
  // 1. Initialize Components metadata (Users & Categories)
  await Components.initialize();

  // 2. Setup SPA Views Navigation
  const viewTitles = {
    dashboard: { title: 'Dashboard', subtitle: 'Summary and analytics overview' },
    kanban: { title: 'Kanban Board', subtitle: 'Drag and drop workflow management' },
    list: { title: 'Task List', subtitle: 'Filterable list grid view' },
    calendar: { title: 'Calendar', subtitle: 'Deadlines and schedules tracker' },
    logs: { title: 'Activity Logs', subtitle: 'System event log auditing' },
    settings: { title: 'Settings', subtitle: 'Manage categories and import/export workspace data' }
  };

  // Nav Item click handler
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (!view) return;

      window.currentView = view;

      // Toggle active navigation buttons
      document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Toggle view panels
      document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
      
      const activePanel = document.getElementById(`view-${view}`);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }

      // Update Header Text
      const metadata = viewTitles[view];
      if (metadata) {
        document.getElementById('view-title').textContent = metadata.title;
        document.getElementById('view-subtitle').textContent = metadata.subtitle;
      }

      // Render view-specific content
      renderActiveView(view);
    });
  });

  // 3. Quick Action Buttons
  const quickNewTaskBtn = document.getElementById('btn-quick-new-task');
  if (quickNewTaskBtn) {
    quickNewTaskBtn.onclick = () => Components.showCreateTaskModal();
  }

  // 4. Global Timer Controls Setup
  setupTimerControls();

  // 5. Initial View Load
  renderActiveView('dashboard');
});

// View router rendering hub
function renderActiveView(view) {
  switch (view) {
    case 'dashboard':
      renderDashboardView();
      break;
    case 'kanban':
      Components.renderKanban('view-kanban');
      break;
    case 'list':
      Components.renderList('view-list');
      break;
    case 'calendar':
      renderCalendarView();
      break;
    case 'logs':
      renderLogsView();
      break;
    case 'settings':
      renderSettingsView();
      break;
    default:
      console.warn(`Unknown view type requested: ${view}`);
  }
}

// Global modal closer helper
window.closeModal = () => {
  const container = document.getElementById('modal-container');
  if (container) container.classList.add('hidden');
};

// ==========================================
// View Stubs / Placeholders (Fully coded for next modules)
// ==========================================

function renderDashboardView() {
  Components.renderDashboard('view-dashboard');
}

function renderCalendarView() {
  Components.renderCalendar('view-calendar');
}

function renderLogsView() {
  Components.renderLogs('view-logs');
}

function renderSettingsView() {
  Components.renderSettings('view-settings');
}

// ==========================================
// Focus Timer Global Controller Hooks
// ==========================================

function setupTimerControls() {
  const toggleBtn = document.getElementById('global-timer-toggle');
  const resetBtn = document.getElementById('global-timer-reset');
  const display = document.getElementById('global-timer-display');

  if (!toggleBtn || !resetBtn || !display) return;

  toggleBtn.onclick = () => {
    if (isTimerRunning) {
      // Pause
      clearInterval(timerInterval);
      isTimerRunning = false;
      toggleBtn.textContent = 'Resume';
      display.classList.remove('timer-running');
    } else {
      // Start
      isTimerRunning = true;
      toggleBtn.textContent = 'Pause';
      display.classList.add('timer-running');
      
      timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          isTimerRunning = false;
          toggleBtn.textContent = 'Start';
          display.classList.remove('timer-running');
          handleTimerComplete();
        }
      }, 1000);
    }
  };

  resetBtn.onclick = () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 25 * 60;
    toggleBtn.textContent = 'Start';
    display.classList.remove('timer-running');
    updateTimerDisplay();
  };
}

function updateTimerDisplay() {
  const display = document.getElementById('global-timer-display');
  if (!display) return;

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Invoked from Components.js when user clicks "Load Focus Timer"
window.loadTimerTask = (taskId, taskTitle) => {
  window.currentTimerTaskId = taskId;
  
  const label = document.getElementById('global-timer-task-name');
  const toggleBtn = document.getElementById('global-timer-toggle');
  const resetBtn = document.getElementById('global-timer-reset');

  if (label) label.textContent = taskTitle;
  if (toggleBtn) toggleBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = false;

  // Reset clock
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSeconds = 25 * 60;
  if (toggleBtn) toggleBtn.textContent = 'Start';
  const display = document.getElementById('global-timer-display');
  if (display) {
    display.classList.remove('timer-running');
    updateTimerDisplay();
  }
};

async function handleTimerComplete() {
  if (!window.currentTimerTaskId) return;

  const originalTaskId = window.currentTimerTaskId;
  Utils.showToast('Great job! 25 minutes of focus completed.', 'info');

  try {
    // Log 25 minutes to task actual_minutes
    await API.logTime(originalTaskId, 25, 1); // Mock user ID 1 (Sarah) for time log
    Utils.showToast('Focus session logged to database.');
    
    // Refresh background lists/kanban
    if (window.currentView === 'kanban') Components.renderKanban('view-kanban');
    if (window.currentView === 'list') Components.renderList('view-list');
  } catch (err) {
    Utils.showToast(`Failed to automatically log timer minutes: ${err.message}`, 'error');
  }
}
