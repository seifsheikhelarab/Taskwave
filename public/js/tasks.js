// Handle task status updates
document.querySelectorAll('.form-check-input').forEach(checkbox => {
    checkbox.addEventListener('change', async function() {
        const taskId = this.closest('tr').dataset.taskId;
        const isComplete = this.checked;

        try {
            const response = await fetch(`/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isComplete })
            });

            if (!response.ok) {
                throw new Error('Failed to update task status');
            }

            // Update UI
            const statusBadge = this.closest('tr').querySelector('.badge');
            if (statusBadge) {
                statusBadge.className = `badge bg-${isComplete ? 'success' : 'secondary'}`;
                statusBadge.textContent = isComplete ? 'Done' : 'To Do';
            }

            // Update task count
            const completedCount = document.querySelector('.completed-tasks-count');
            if (completedCount) {
                const currentCount = parseInt(completedCount.textContent);
                completedCount.textContent = isComplete ? currentCount + 1 : currentCount - 1;
            }
        } catch (error) {
            console.error('Error:', error);
            this.checked = !isComplete; // Revert checkbox state
            alert('Failed to update task status. Please try again.');
        }
    });
});

// Handle task deletion
document.querySelectorAll('[data-delete-task]').forEach(button => {
    button.addEventListener('click', async function(e) {
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        const taskId = this.dataset.deleteTask;
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            // Remove task from UI
            const taskRow = this.closest('tr');
            taskRow.remove();

            // Update task count
            const taskCount = document.querySelector('.total-tasks-count');
            if (taskCount) {
                const currentCount = parseInt(taskCount.textContent);
                taskCount.textContent = currentCount - 1;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete task. Please try again.');
        }
    });
});

// Handle task editing
document.querySelectorAll('[data-edit-task]').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const taskId = this.dataset.editTask;
        window.location.href = `/tasks/${taskId}/edit`;
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    let searchTimeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(() => {
            fetch(`/tasks/search/suggestions?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.suggestions && data.suggestions.length > 0) {
                        searchSuggestions.innerHTML = data.suggestions.map(suggestion => `
                            <div class="p-2 border-bottom suggestion-item" style="cursor: pointer;">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-tasks me-2 text-muted"></i>
                                    <div>
                                        <div class="fw-bold">${suggestion.title}</div>
                                        <small class="text-muted">${suggestion.project ? suggestion.project.name : 'No Project'}</small>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                        
                        searchSuggestions.style.display = 'block';
                        
                        // Add click handlers to suggestions
                        document.querySelectorAll('.suggestion-item').forEach(item => {
                            item.addEventListener('click', function() {
                                searchInput.value = this.querySelector('.fw-bold').textContent;
                                searchSuggestions.style.display = 'none';
                                document.getElementById('searchForm').submit();
                            });
                        });
                    } else {
                        searchSuggestions.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error fetching suggestions:', error);
                    searchSuggestions.style.display = 'none';
                });
        }, 300);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });
});
