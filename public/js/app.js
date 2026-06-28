// ==========================================================================
// Zenith Application Controller & SPA Router
// ==========================================================================

window.currentView = 'dashboard';
window.currentTimerTaskId = null;
window.currentUser = null;
let timerInterval = null;
let timerSeconds = 25 * 60;
let isTimerRunning = false;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Zenith App booting...');
  
  // Setup Auth hooks and actions globally for UI elements
  window.app = {
    togglePassword(inputId) {
      const el = document.getElementById(inputId);
      if (el) {
        el.type = el.type === 'password' ? 'text' : 'password';
      }
    },
    
    showAuthCard(cardId) {
      document.querySelectorAll('.auth-card').forEach(c => c.classList.add('hidden'));
      const activeCard = document.getElementById(cardId);
      if (activeCard) activeCard.classList.remove('hidden');
    },

    async handleFormLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      const spinner = document.getElementById('login-spinner');
      const submitBtn = document.getElementById('btn-login-submit');

      if (spinner) spinner.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await API.login({ email, password });
        localStorage.setItem('token', res.token);
        
        Utils.showToast('Login successful! Loading workspace...');
        await checkAuth();
      } catch (err) {
        Utils.showToast(err.message, 'error');
      } finally {
        if (spinner) spinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
      }
    },

    async handleFormSignup(e) {
      e.preventDefault();
      const fullName = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      const spinner = document.getElementById('signup-spinner');
      const submitBtn = document.getElementById('btn-signup-submit');

      if (spinner) spinner.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await API.register({ fullName, email, password, confirmPassword });
        Utils.showToast(res.message);
        
        // Reset form
        document.getElementById('signup-form').reset();
        
        // Show login screen
        this.showAuthCard('login-card');
        document.getElementById('login-email').value = email;
      } catch (err) {
        Utils.showToast(err.message, 'error');
      } finally {
        if (spinner) spinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
      }
    },

    async handleFormGuestLogin() {
      try {
        Utils.showToast('Generating guest sandbox session...');
        const res = await API.guestLogin();
        localStorage.setItem('token', res.token);
        
        Utils.showToast('Guest Login successful!');
        await checkAuth();
      } catch (err) {
        Utils.showToast(`Guest session failed: ${err.message}`, 'error');
      }
    },

    async handleUserLogout() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await API.logout();
        }
      } catch (err) {
        console.warn('Logout API warning:', err);
      } finally {
        localStorage.removeItem('token');
        window.currentUser = null;
        
        // Force timer reset
        if (isTimerRunning) {
          clearInterval(timerInterval);
          isTimerRunning = false;
        }
        
        Utils.showToast('Logged out successfully.');
        await checkAuth();
      }
    },

    showUpgradeScreen() {
      localStorage.removeItem('token');
      window.currentUser = null;
      
      const appView = document.getElementById('app-view');
      const authView = document.getElementById('auth-view');
      appView.classList.add('hidden');
      authView.classList.remove('hidden');
      
      this.showAuthCard('signup-card');
    }
  };

  // 1. Core Auth Guard Routing Checks
  const authed = await checkAuth();
  if (!authed) return;

  // 2. Setup SPA Views Navigation
  const viewTitles = {
    dashboard: { title: 'Dashboard', subtitle: 'Summary and analytics overview' },
    kanban: { title: 'Kanban Board', subtitle: 'Drag and drop workflow management' },
    list: { title: 'Task List', subtitle: 'Filterable list grid view' },
    calendar: { title: 'Calendar', subtitle: 'Deadlines and schedules tracker' },
    logs: { title: 'Activity Logs', subtitle: 'System event log auditing' },
    settings: { title: 'Settings', subtitle: 'Manage categories and import/export workspace data' }
  };

  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (!view) return;

      window.currentView = view;

      document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
      
      const activePanel = document.getElementById(`view-${view}`);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }

      const metadata = viewTitles[view];
      if (metadata) {
        document.getElementById('view-title').textContent = metadata.title;
        document.getElementById('view-subtitle').textContent = metadata.subtitle;
      }

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
});

async function checkAuth() {
  const token = localStorage.getItem('token');
  const appView = document.getElementById('app-view');
  const authView = document.getElementById('auth-view');

  if (!token) {
    appView.classList.add('hidden');
    authView.classList.remove('hidden');
    document.querySelectorAll('.auth-card').forEach(c => c.classList.add('hidden'));
    const loginCard = document.getElementById('login-card');
    if (loginCard) loginCard.classList.remove('hidden');
    return false;
  }

  try {
    const profile = await API.getProfile();
    window.currentUser = profile;

    // Update Profile UI
    const avatarEl = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    if (avatarEl) avatarEl.textContent = profile.avatar || '??';
    if (nameEl) nameEl.textContent = profile.fullName || 'User';

    // Guest Mode UI adjustments
    const guestBadge = document.getElementById('header-guest-badge');
    const upgradeBtn = document.getElementById('btn-header-upgrade');
    const warningBanner = document.getElementById('guest-warning-banner');

    if (profile.isGuest) {
      if (guestBadge) guestBadge.classList.remove('hidden');
      if (upgradeBtn) upgradeBtn.classList.remove('hidden');
      if (warningBanner) warningBanner.classList.remove('hidden');
    } else {
      if (guestBadge) guestBadge.classList.add('hidden');
      if (upgradeBtn) upgradeBtn.classList.add('hidden');
      if (warningBanner) warningBanner.classList.add('hidden');
    }

    authView.classList.add('hidden');
    appView.classList.remove('hidden');

    // Load components metadata
    await Components.initialize();
    
    // Render current active view
    renderActiveView(window.currentView);
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    localStorage.removeItem('token');
    appView.classList.add('hidden');
    authView.classList.remove('hidden');
    document.querySelectorAll('.auth-card').forEach(c => c.classList.add('hidden'));
    const loginCard = document.getElementById('login-card');
    if (loginCard) loginCard.classList.remove('hidden');
    return false;
  }
}

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
      clearInterval(timerInterval);
      isTimerRunning = false;
      toggleBtn.textContent = 'Resume';
      display.classList.remove('timer-running');
    } else {
      isTimerRunning = true;
      toggleBtn.textContent = 'Pause';
      display.classList.add('timer-running');

      timerInterval = setInterval(() => {
        timerSeconds--;
        const min = Math.floor(timerSeconds / 60);
        const sec = timerSeconds % 60;
        display.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          isTimerRunning = false;
          toggleBtn.textContent = 'Start';
          display.classList.remove('timer-running');
          
          timerSeconds = 25 * 60;
          display.textContent = '25:00';
          
          if (window.currentTimerTaskId) {
            API.logTime(window.currentTimerTaskId, 25, window.currentUser ? window.currentUser.id : null)
              .then(() => {
                Utils.showToast('Pomodoro session completed! 25 minutes logged.');
                renderActiveView(window.currentView);
              })
              .catch(err => Utils.showToast(`Failed to log timer: ${err.message}`, 'error'));
          } else {
            Utils.showToast('Pomodoro session completed!');
          }
        }
      }, 1000);
    }
  };

  resetBtn.onclick = () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 25 * 60;
    display.textContent = '25:00';
    toggleBtn.textContent = 'Start';
    display.classList.remove('timer-running');
  };
}
