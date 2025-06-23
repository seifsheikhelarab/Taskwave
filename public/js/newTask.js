document.getElementById('project').addEventListener('change', function() {
    const selectedProjectId = this.value;
    const assigneeOptions = document.querySelectorAll('#assignees option[data-project]');
    
    assigneeOptions.forEach(option => {
        if (option.dataset.project === selectedProjectId) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
            option.selected = false;
        }
    });
});