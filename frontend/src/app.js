

window.currentView = 'dashboard';
window.currentTimerTaskId = null;
window.currentUser = null;
let timerInterval = null;
let timerSeconds = 25 * 60;
let isTimerRunning = false;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Zenith App booting...');

  // Load initial theme settings
  const currentTheme = localStorage.getItem('theme');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  if (currentTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('light-theme');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }

  // Setup Auth hooks and actions globally for UI elements
  window.app = {
    togglePassword(inputId) {
      const el = document.getElementById(inputId);
      if (el) {
        el.type = el.type === 'password' ? 'text' : 'password';
      }
    },

    showAuthCard(cardId) {
      // Direct navigate via URL hash
      if (cardId === 'signup-card') {
        window.location.hash = '#/signup';
      } else {
        window.location.hash = '#/login';
      }
    },

    async handleFormLogin(e) {
      e.preventDefault();
      const loginId = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const rememberMe = document.getElementById('login-remember').checked;

      const spinner = document.getElementById('login-spinner');
      const submitBtn = document.getElementById('btn-login-submit');

      if (spinner) spinner.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await API.login({ loginId, password });
        localStorage.setItem('token', res.token);

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedUser', loginId);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedUser');
        }

        Utils.showToast('Login successful! Loading workspace...');
        window.currentUser = null;
        window.location.hash = '#/dashboard';
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
      const mobileNumber = document.getElementById('signup-mobile').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      const spinner = document.getElementById('signup-spinner');
      const submitBtn = document.getElementById('btn-signup-submit');

      if (spinner) spinner.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await API.register({ fullName, email, mobileNumber, password, confirmPassword });
        Utils.showToast(res.message);

        document.getElementById('signup-form').reset();
        window.location.hash = '#/login';

        setTimeout(() => {
          const emailInput = document.getElementById('login-email');
          if (emailInput) emailInput.value = email;
        }, 50);
      } catch (err) {
        Utils.showToast(err.message, 'error');
      } finally {
        if (spinner) spinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
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
        const rememberMe = localStorage.getItem('rememberMe');
        const rememberedUser = localStorage.getItem('rememberedUser');

        localStorage.removeItem('token');
        localStorage.clear();
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        window.currentUser = null;

        if (rememberMe === 'true') {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedUser', rememberedUser);
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();

        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const rememberChk = document.getElementById('login-remember');
        if (emailInput) emailInput.value = (rememberMe === 'true') ? (rememberedUser || '') : '';
        if (passInput) passInput.value = '';
        if (rememberChk) rememberChk.checked = (rememberMe === 'true');

        if (isTimerRunning) {
          clearInterval(timerInterval);
          isTimerRunning = false;
        }

        Utils.showToast('Logged out successfully.');
        window.location.hash = '#/login';
      }
    },

    showUpgradeScreen() {
      localStorage.removeItem('token');
      window.currentUser = null;
      window.location.hash = '#/signup';
    },

    toggleTheme() {
      const isLight = document.documentElement.classList.contains('light-theme');
      const sunIcon = document.getElementById('theme-icon-sun');
      const moonIcon = document.getElementById('theme-icon-moon');

      if (isLight) {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
      } else {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
      }

      // Re-draw components and charts immediately on theme changes
      if (window.currentView === 'dashboard' && window.Components) {
        window.Components.renderDashboard('view-dashboard');
      }
    }
  };

  // Bind Sidebar Nav Items to update hash router
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view) {
        window.location.hash = `#/${view}`;
      }
    });
  });

  // Bind hash change listener
  window.addEventListener('hashchange', handleRouting);

  // Quick Action Buttons
  const quickNewTaskBtn = document.getElementById('btn-quick-new-task');
  if (quickNewTaskBtn) {
    quickNewTaskBtn.onclick = () => Components.showCreateTaskModal();
  }

  // Global Timer Controls Setup
  setupTimerControls();

  // Run initial routing check
  await handleRouting();
});

// Primary SPA Router
async function handleRouting() {
  const hash = window.location.hash || '#/';
  const token = localStorage.getItem('token');

  const landingView = document.getElementById('landing-view');
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');

  const publicRoutes = ['#/', '#/login', '#/signup'];
  const isPublic = publicRoutes.includes(hash);

  // 1. Unauthenticated Route Guard Redirects
  if (!token) {
    if (!isPublic) {
      console.log('Unauthenticated access blocked. Redirecting to login.');
      window.location.hash = '#/login';
      return;
    }

    // Process public pages rendering
    if (hash === '#/') {
      showLandingView();
    } else if (hash === '#/login') {
      showAuthView('login-card');
    } else if (hash === '#/signup') {
      showAuthView('signup-card');
    }
    return;
  }

  // 2. Authenticated Session Retrieval
  if (!window.currentUser) {
    try {
      const profile = await API.getProfile();
      window.currentUser = profile;
      updateHeaderProfileUI(profile);
    } catch (err) {
      console.error('Session validation failed on route change:', err);
      localStorage.removeItem('token');
      window.location.hash = '#/';
      return;
    }
  }

  // 3. Authenticated Route Guard Redirects
  if (isPublic) {
    // If logged in, send them directly to dashboard
    window.location.hash = '#/dashboard';
    return;
  }

  // Render workspace views
  landingView.classList.add('hidden');
  authView.classList.add('hidden');
  appView.classList.remove('hidden');

  // Parse active workspace panel from hash (e.g. #/kanban -> kanban)
  const activePanel = hash.substring(2) || 'dashboard';
  window.currentView = activePanel;

  // Toggle active class on sidebar navigation buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.dataset.view === activePanel) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle active view panel visibility
  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.id === `view-${activePanel}`) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  // Update Header titles
  const viewTitles = {
    dashboard: { title: 'Dashboard', subtitle: 'Summary and analytics overview' },
    kanban: { title: 'Kanban Board', subtitle: 'Drag and drop workflow management' },
    list: { title: 'Task List', subtitle: 'Filterable list grid view' },
    calendar: { title: 'Calendar', subtitle: 'Deadlines and schedules tracker' },
    logs: { title: 'Activity Logs', subtitle: 'System event log auditing' },
    claims: { title: 'Claims Flow', subtitle: 'Step-by-step progress tracking workflow' },
    settings: { title: 'Settings', subtitle: 'Manage categories and import/export workspace data' }
  };

  const metadata = viewTitles[activePanel];
  if (metadata) {
    document.getElementById('view-title').textContent = metadata.title;
    document.getElementById('view-subtitle').textContent = metadata.subtitle;
  }

  // Render contents
  renderActiveView(activePanel);
}

function showLandingView() {
  document.getElementById('landing-view').classList.remove('hidden');
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('app-view').classList.add('hidden');
}

function showAuthView(cardToShow) {
  document.getElementById('landing-view').classList.add('hidden');
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('auth-view').classList.remove('hidden');

  document.querySelectorAll('.auth-card').forEach(c => {
    if (c.id === cardToShow) {
      c.classList.remove('hidden');
    } else {
      c.classList.add('hidden');
    }
  });

  if (cardToShow === 'login-card') {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const rememberedUser = localStorage.getItem('rememberedUser');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const rememberChk = document.getElementById('login-remember');
    if (emailInput) emailInput.value = rememberMe ? (rememberedUser || '') : '';
    if (passInput) passInput.value = '';
    if (rememberChk) rememberChk.checked = rememberMe;
  }

  API.request('GET', '/auth/check-users')
    .then(res => {
      const notice = document.getElementById('zero-users-notice');
      if (notice) {
        if (res && res.count === 0) {
          notice.classList.remove('hidden');
        } else {
          notice.classList.add('hidden');
        }
      }
    })
    .catch(err => {
      console.warn('Failed to query users count:', err);
    });
}

function updateHeaderProfileUI(profile) {
  const avatarEl = document.getElementById('header-user-avatar');
  const nameEl = document.getElementById('header-user-name');
  if (avatarEl) avatarEl.textContent = profile.avatar || '??';
  if (nameEl) nameEl.textContent = profile.fullName || 'User';

  // Bind Sidebar user widgets details
  const sidebarAvatarEl = document.getElementById('sidebar-user-avatar');
  const sidebarNameEl = document.getElementById('sidebar-user-name');
  const sidebarEmailEl = document.getElementById('sidebar-user-email');
  if (sidebarAvatarEl) sidebarAvatarEl.textContent = profile.avatar || '??';
  if (sidebarNameEl) sidebarNameEl.textContent = profile.fullName || 'User';
  if (sidebarEmailEl) sidebarEmailEl.textContent = profile.email || '';

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
}

// View router rendering hub
function renderActiveView(view) {
  switch (view) {
    case 'dashboard':
      Components.renderDashboard('view-dashboard');
      break;
    case 'kanban':
      Components.renderKanban('view-kanban');
      break;
    case 'list':
      Components.renderList('view-list');
      break;
    case 'calendar':
      Components.renderCalendar('view-calendar');
      break;
    case 'logs':
      Components.renderLogs('view-logs');
      break;
    case 'settings':
      Components.renderSettings('view-settings');
      break;
    case 'profile':
      Components.renderProfile('view-profile');
      break;
    case 'claims':
      Components.renderClaims('view-claims');
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

// Focus timer controls
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

// Invoked from Components.js when user clicks "Load Focus Timer"
window.loadTimerTask = (taskId, taskTitle) => {
  window.currentTimerTaskId = taskId;

  const label = document.getElementById('global-timer-task-name');
  const toggleBtn = document.getElementById('global-timer-toggle');
  const resetBtn = document.getElementById('global-timer-reset');

  if (label) label.textContent = taskTitle;
  if (toggleBtn) toggleBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = false;
};
