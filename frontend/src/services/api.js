// API wrapper for communicating with the backend server

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const API = {
  // Helper for requests
  async request(method, path, body = null) {
    const url = `${API_BASE_URL}${path}`;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method: method,
      headers: headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          if (window.app && typeof window.app.handleUserLogout === 'function') {
            window.app.handleUserLogout();
          }
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error on ${method} ${path}:`, error);
      throw error;
    }
  },

  // Tasks
  getTasks(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const path = queryString ? `/tasks?${queryString}` : '/tasks';
    return this.request('GET', path);
  },

  getTask(id) {
    return this.request('GET', `/tasks/${id}`);
  },

  createTask(taskData) {
    return this.request('POST', '/tasks', taskData);
  },

  updateTask(id, taskData) {
    return this.request('PUT', `/tasks/${id}`, taskData);
  },

  deleteTask(id) {
    return this.request('DELETE', `/tasks/${id}`);
  },

  logTime(id, minutes, userId) {
    return this.request('POST', `/tasks/${id}/log-time`, { minutes, user_id: userId });
  },

  // Categories
  getCategories() {
    return this.request('GET', '/categories');
  },

  createCategory(catData) {
    return this.request('POST', '/categories', catData);
  },

  deleteCategory(id) {
    return this.request('DELETE', `/categories/${id}`);
  },

  // Users
  getUsers() {
    return this.request('GET', '/users');
  },

  createUser(userData) {
    return this.request('POST', '/users', userData);
  },

  // Comments
  postComment(taskId, commentData) {
    return this.request('POST', `/tasks/${taskId}/comments`, commentData);
  },

  // Dashboard Statistics
  getStats() {
    return this.request('GET', '/dashboard/stats');
  },

  // Activity Logs
  getActivityLogs() {
    return this.request('GET', '/activity-logs');
  },

  // System Export/Import
  exportData() {
    return this.request('GET', '/system/export');
  },

  importData(data) {
    return this.request('POST', '/system/import', data);
  },

  // Authentication
  register(userData) {
    return this.request('POST', '/auth/register', userData);
  },

  login(credentials) {
    return this.request('POST', '/auth/login', credentials);
  },

  guestLogin() {
    return this.request('POST', '/auth/guest-login');
  },

  getProfile() {
    return this.request('GET', '/auth/profile');
  },

  logout() {
    return this.request('POST', '/auth/logout');
  }
};

window.API = API;
