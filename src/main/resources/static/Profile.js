// ====== Elements ======
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const personalInfo = document.getElementById('personalInfo');
const editForm = document.getElementById('editForm');
const profileUploadBtn = document.getElementById('uploadBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationBtnSMS = document.getElementById('notificationBtnSMS');

// ====== Initialize Profile ======
function initProfile() {
    // Ensure user is logged in
    const email = localStorage.getItem('userEmail');
    if (!email) {
        alert('You are not logged in. Please log in first.');
        window.location.href = 'index.html';
        return;
    }

    fetchProfile(email);
    setupEventListeners();
    setupNavbarScroll();
}

// ====== Fetch Profile from Backend ======
async function fetchProfile(email) {
    try {
        const res = await fetch(`http://localhost:8080/api/auth/profile?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        // Fill form fields
        document.getElementById('firstName').value = data.firstName || '';
        document.getElementById('lastName').value = data.lastName || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';

        // Fill display section
        document.querySelector('.profile-name').textContent = `${data.firstName || ''} ${data.lastName || ''}`;
        const detailItems = document.querySelectorAll('.detail-item');
        if (detailItems.length >= 3) {
            detailItems[0].querySelector('.detail-value').textContent = `${data.firstName || ''} ${data.lastName || ''}`;
            detailItems[1].querySelector('.detail-value').textContent = data.email || '';
            detailItems[2].querySelector('.detail-value').textContent = data.phone || '';
        }
    } catch (err) {
        console.error('Error fetching profile:', err);
        alert('Failed to load profile data.');
    }
}

// ====== Event Listeners ======
function setupEventListeners() {
    // Edit Profile
    editProfileBtn?.addEventListener('click', () => {
        personalInfo.style.display = 'none';
        editForm.classList.add('active');
        editProfileBtn.textContent = '📝 Editing...';
        editProfileBtn.disabled = true;
    });

    cancelEditBtn?.addEventListener('click', () => {
        personalInfo.style.display = 'block';
        editForm.classList.remove('active');
        editProfileBtn.textContent = '✏️ Edit Profile';
        editProfileBtn.disabled = false;
    });

    // Save Changes
    editForm?.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = e.target.querySelector('button[type="submit"]');
        const originalText = button.textContent;

        button.textContent = 'Saving...';
        button.disabled = true;

        // Simulate save and update display
        setTimeout(() => {
            alert('Profile updated successfully!');
            personalInfo.style.display = 'block';
            editForm.classList.remove('active');
            editProfileBtn.textContent = '✏️ Edit Profile';
            editProfileBtn.disabled = false;
            button.textContent = originalText;
            button.disabled = false;
            updateProfileDisplay();
        }, 2000);
    });

    // Upload Button
    profileUploadBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'Upload.html';
    });

    // Change Password
    changePasswordBtn?.addEventListener('click', () => {
        alert('Change Password form would appear here.');
    });

    // Notification Buttons
    notificationBtn?.addEventListener('click', () => toggleNotification(notificationBtn, 'Email'));
    notificationBtnSMS?.addEventListener('click', () => toggleNotification(notificationBtnSMS, 'SMS'));

    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const section = link.textContent.trim();
            handleNavigation(section);
        });
    });

    // Logout Button
    document.querySelector('.btn-outline')?.addEventListener('click', handleLogout);
}

// ====== Notification Toggle ======
function toggleNotification(button, type) {
    const isEnabled = button.textContent === 'Enabled';
    button.textContent = isEnabled ? 'Disabled' : 'Enabled';
    button.style.background = isEnabled ? '#fef2f2' : '#f0fdf4';
    button.style.color = isEnabled ? '#dc2626' : '#16a34a';
    alert(`${type} notifications ${isEnabled ? 'disabled' : 'enabled'}`);
}

// ====== Update Profile Display ======
function updateProfileDisplay() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    document.querySelector('.profile-name').textContent = `${firstName} ${lastName}`;
    const detailItems = document.querySelectorAll('.detail-item');
    if (detailItems.length >= 3) {
        detailItems[0].querySelector('.detail-value').textContent = `${firstName} ${lastName}`;
        detailItems[1].querySelector('.detail-value').textContent = email;
        detailItems[2].querySelector('.detail-value').textContent = phone;
    }
}

// ====== Navigation ======
function handleNavigation(section) {
    switch (section) {
        case 'Home':
            window.location.href = 'dashboard.html';
            break;
        case 'Profile':
            // Stay on current page
            break;
        case 'My Posts':
            window.location.href = 'MyPosts.html';
            break;
    }
}

// ====== Logout ======
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userEmail'); // Clear email
        window.location.href = 'index.html';
    }
}

// ====== Navbar Scroll Effect ======
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        navbar.style.background = window.pageYOffset > 100
            ? 'rgba(255, 255, 255, 0.98)'
            : 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = window.pageYOffset > 100
            ? '0 2px 20px rgba(0, 0, 0, 0.1)'
            : 'none';
    });
}

// ====== Initialize ======
document.addEventListener('DOMContentLoaded', initProfile);
