// ==========================================================================
// Zenith Application Router & Core Controller (Skeleton)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Zenith App initialized.');
  
  // Set default view titles
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

      console.log(`Switched to view: ${view}`);
    });
  });

  // Basic modal close functionality
  window.closeModal = () => {
    document.getElementById('modal-container').classList.add('hidden');
  };
});
