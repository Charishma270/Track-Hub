const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const personalInfo = document.querySelector('.profile-info');
const editForm = document.getElementById('editForm');
const profileUploadBtn = document.getElementById('uploadBtn'); // renamed
const changePasswordBtn = document.getElementById('changePasswordBtn');
const notificationBtn = document.getElementById('notificationBtn');
const privacyBtn = document.getElementById('privacyBtn');
const themeBtn = document.getElementById('themeBtn');

// Initialize the profile page
function initProfile() {
    setupEventListeners();
    setupNavbarScroll();
}

// Setup event listeners
function setupEventListeners() {
    // Edit profile functionality
    editProfileBtn.addEventListener('click', () => {
        personalInfo.style.display = 'none';
        editForm.classList.add('active');
        editProfileBtn.textContent = '📝 Editing...';
        editProfileBtn.disabled = true;
    });

    cancelEditBtn.addEventListener('click', () => {
        personalInfo.style.display = 'block';
        editForm.classList.remove('active');
        editProfileBtn.textContent = '✏️ Edit Profile';
        editProfileBtn.disabled = false;
    });

    // Form submission
    editForm.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulate saving
        const button = e.target.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        button.textContent = 'Saving...';
        button.disabled = true;
        
        setTimeout(() => {
            alert('Profile updated successfully!');
            personalInfo.style.display = 'block';
            editForm.classList.remove('active');
            editProfileBtn.textContent = '✏️ Edit Profile';
            editProfileBtn.disabled = false;
            button.textContent = originalText;
            button.disabled = false;
            
            // Update displayed information
            updateProfileDisplay();
        }, 2000);
    });

    // Upload button
    profileUploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Upload Item Feature\n\nThis would normally open a modal or redirect to an upload form.');
    });

    // Change password
    changePasswordBtn.addEventListener('click', () => {
        alert('Change Password\n\nThis would normally open a password change form with:\n• Current password field\n• New password field\n• Confirm password field\n• Security validation');
    });

    // Settings buttons
    notificationBtn.addEventListener('click', () => {
        const isEnabled = notificationBtn.textContent === 'Enabled';
        notificationBtn.textContent = isEnabled ? 'Disabled' : 'Enabled';
        notificationBtn.style.background = isEnabled ? '#fef2f2' : '#f0fdf4';
        notificationBtn.style.color = isEnabled ? '#dc2626' : '#16a34a';
        alert(`Email notifications ${isEnabled ? 'disabled' : 'enabled'}`);
    });

    notificationBtnSMS.addEventListener('click', () => {
        const isEnabled = notificationBtnSMS.textContent === 'Enabled';
        notificationBtnSMS.textContent = isEnabled ? 'Disabled' : 'Enabled';
        notificationBtnSMS.style.background = isEnabled ? '#fef2f2' : '#f0fdf4';
        notificationBtnSMS.style.color = isEnabled ? '#dc2626' : '#16a34a';
        alert(`SMS notifications ${isEnabled ? 'disabled' : 'enabled'}`);
    });


    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Handle navigation
            const linkText = link.textContent.trim();
            handleNavigation(linkText);
        });
    });

    // Logout button
    document.querySelector('.btn-outline').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
}

// Update profile display with form data
function updateProfileDisplay() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const department = document.getElementById('department').value;

    // Update profile name
    document.querySelector('.profile-name').textContent = `${firstName} ${lastName}`;
    document.querySelector('.profile-role').textContent = `${department} Student`;

    // Update detail values
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems[0].querySelector('.detail-value').textContent = email;
    detailItems[1].querySelector('.detail-value').textContent = phone;
    detailItems[3].querySelector('.detail-value').textContent = department;
}

// Handle navigation
function handleNavigation(section) {
    switch(section) {
        case 'Home':
            alert('Navigating to Dashboard...\n\nThis would redirect to dashboard.html');
            // window.location.href = 'dashboard.html';
            break;
        case 'Profile':
            // Already on profile page
            break;
        case 'My Posts':
            alert('My Posts Page\n\nThis would show:\n• Items you\'ve posted\n• Edit/delete options\n• Post status updates\n• Messages from interested users');
            break;
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logging out...\n\nThis would normally:\n• Clear user session\n• Redirect to login page\n• Show logout confirmation');
        // window.location.href = 'login.html';
    }
}

// Navbar scroll effect
function setupNavbarScroll() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);