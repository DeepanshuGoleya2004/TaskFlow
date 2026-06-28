// ==========================================================================
// Zenith App Utilities & UI Helpers
// ==========================================================================

const Utils = {
  // Format minutes into "Xh Ym"
  formatMinutes(minutes) {
    if (!minutes || isNaN(minutes) || minutes <= 0) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  },

  // Format ISO Date String or Date to "MMM DD, YYYY"
  formatDate(dateStr) {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Check if a date is overdue (before today and status is not completed)
  isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  },

  // Toast notifications display
  showToast(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    // Set styling based on type
    toast.style.borderColor = type === 'error' ? 'var(--priority-urgent)' : 'var(--primary)';
    toast.style.boxShadow = type === 'error' 
      ? '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(235, 87, 87, 0.3)' 
      : '0 10px 30px rgba(0,0,0,0.5), 0 0 15px var(--primary-glow)';

    // Icon setup
    const icon = type === 'error' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    toast.classList.remove('hidden');

    // Auto-fadeout after 3 seconds
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  },

  // Color generator for category tags (returns background and border style)
  getCategoryStyle(hslColor) {
    if (!hslColor) return 'background: rgba(255,255,255,0.05); color: #fff;';
    
    // We assume input is "hsl(H, S%, L%)" or similar
    // Create semi-transparent version for glass tag background
    const transparentHsl = hslColor.replace(')', ', 0.12)').replace('hsl', 'hsla');
    return `background: ${transparentHsl}; border: 1px solid ${hslColor}; color: ${hslColor};`;
  },

  // Chart presets configuration builder
  getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#c4cbd4',
            font: {
              family: "'Inter', sans-serif",
              size: 11
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#8b98a5',
            font: {
              family: "'Inter', sans-serif"
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#8b98a5',
            font: {
              family: "'Inter', sans-serif"
            }
          }
        }
      }
    };
  }
};

window.Utils = Utils;
