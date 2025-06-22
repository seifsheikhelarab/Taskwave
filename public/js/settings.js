// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Profile form handling
    const profileForm = document.querySelector('form[action="/user/settings/profile"]');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Password form handling
    const passwordForm = document.querySelector('form[action="/user/settings/password"]');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }

    // Avatar preview
    const avatarInput = document.getElementById('avatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarPreview);
    }

    // Show success message if present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
        showNotification(urlParams.get('success'), 'success');
    }
});

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    formData.set('_method', 'PUT');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
        
        const response = await fetch('/user/settings/profile', {
            method: 'PUT',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message, 'success');
            
            // Update avatar preview if new avatar was uploaded
            if (result.user && result.user.avatar) {
                const avatarImg = document.querySelector('.rounded-circle');
                if (avatarImg) {
                    avatarImg.src = result.user.avatar;
                }
            }
            
            // Update form values
            updateFormValues(result.user);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('An error occurred while updating your profile', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Handle password form submission
async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validate passwords match
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
        
        const response = await fetch('/user/settings/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message, 'success');
            e.target.reset();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('An error occurred while updating your password', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Handle avatar preview
function handleAvatarPreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, or GIF)', 'error');
        e.target.value = '';
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image file size must be less than 5MB', 'error');
        e.target.value = '';
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarImg = document.querySelector('.rounded-circle');
        if (avatarImg) {
            avatarImg.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

// Update form values after successful profile update
function updateFormValues(user) {
    if (user.firstName) {
        const firstNameInput = document.getElementById('firstName');
        if (firstNameInput) firstNameInput.value = user.firstName;
    }
    
    if (user.lastName) {
        const lastNameInput = document.getElementById('lastName');
        if (lastNameInput) lastNameInput.value = user.lastName;
    }
    
    if (user.email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = user.email;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.alert');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Password strength indicator
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) strength++;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('Special character');
    
    return { strength, feedback };
}

// Add password strength indicator to password fields
document.addEventListener('DOMContentLoaded', function() {
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthInfo = checkPasswordStrength(password);
            
            // Remove existing strength indicator
            const existingIndicator = document.querySelector('.password-strength');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            if (password.length > 0) {
                const strengthColors = ['danger', 'warning', 'info', 'primary', 'success'];
                const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
                
                const indicator = document.createElement('div');
                indicator.className = 'password-strength mt-2';
                indicator.innerHTML = `
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar bg-${strengthColors[strengthInfo.strength - 1]}" 
                             style="width: ${(strengthInfo.strength / 5) * 100}%"></div>
                    </div>
                    <small class="text-muted">${strengthTexts[strengthInfo.strength - 1] || 'Very Weak'}</small>
                    ${strengthInfo.feedback.length > 0 ? 
                        `<br><small class="text-muted">Add: ${strengthInfo.feedback.join(', ')}</small>` : ''}
                `;
                
                this.parentNode.appendChild(indicator);
            }
        });
    }
});

// Tab switching with URL hash
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            const hash = target.replace('#', '');
            window.location.hash = hash;
        });
    });
    
    // Load tab from URL hash
    const hash = window.location.hash;
    if (hash) {
        const targetTab = document.querySelector(`[data-bs-target="${hash}"]`);
        if (targetTab) {
            const tab = new bootstrap.Tab(targetTab);
            tab.show();
        }
    }
});

// Confirm account deletion
function confirmAccountDeletion() {
    const password = prompt('Please enter your password to confirm account deletion:');
    if (!password) return;
    
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        fetch('/user/settings', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        })
        .then(response => response.json())
        .then(result => {
            if (result.message) {
                showNotification(result.message, 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error deleting account:', error);
            showNotification('An error occurred while deleting your account', 'error');
        });
    }
} 