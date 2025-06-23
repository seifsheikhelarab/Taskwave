document.addEventListener('DOMContentLoaded', () => {
  const taskStatus = document.getElementById('taskStatus');

  if (taskStatus) {
    taskStatus.addEventListener('change', async () => {
      const taskId = taskStatus.dataset.taskId;

      try {
        const res = await fetch(`/tasks/${taskId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isComplete: taskStatus.checked })
        });

        if (!res.ok) throw new Error('Failed to update task status');

        // Update badge
        const statusBadge = document.querySelector('.card-body .badge.bg-secondary, .card-body .badge.bg-warning, .card-body .badge.bg-success');
        if (statusBadge) {
          if (taskStatus.checked) {
            statusBadge.textContent = 'Done';
            statusBadge.className = 'badge bg-success';
          } else {
            statusBadge.textContent = 'To Do';
            statusBadge.className = 'badge bg-secondary';
          }
        }

        // Update "Status" text under toggle switch
        const statusText = taskStatus.closest('.card-body').querySelector('h5.updatetask');
        if (statusText) {
          statusText.textContent = taskStatus.checked ? 'Status: ✅ Completed' : 'Status: ⏳ Pending';
        }

      } catch (error) {
        console.error(error);
        // revert checkbox if update fails
        taskStatus.checked = !taskStatus.checked;
        alert('Failed to update task status. Please try again.');
      }
    });
  }
});