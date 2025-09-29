// ====== Elements ======
const cancelEditBtn = document.getElementById('cancelEditBtn');
const personalInfo = document.getElementById('personalInfo');
const editForm = document.getElementById('editForm');
const profileUploadBtn = document.getElementById('uploadBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationBtnSMS = document.getElementById('notificationBtnSMS');

// ====== Initialize Profile ======
function initProfile() {
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

        // ✅ Fetch posts count for this user
        fetchUserPosts(data.id);

    } catch (err) {
        console.error('Error fetching profile:', err);
        alert('Failed to load profile data.');
    }
}

// ====== Fetch User Posts & Update Stats ======
async function fetchUserPosts(userId) {
    try {
        const res = await fetch(`http://localhost:8080/api/posts/user/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch user posts');
        const posts = await res.json();

        // Items Posted = all posts
        document.getElementById('itemsPosted').textContent = posts.length;

        // Items Found = posts with status "FOUND"
        const foundCount = posts.filter(p => p.status === "FOUND").length;
        document.getElementById('itemsFound').textContent = foundCount;

    } catch (err) {
        console.error("Error fetching user posts:", err);
    }
}

// ====== Event Listeners ======
function setupEventListeners() {
    cancelEditBtn?.addEventListener('click', () => {
        personalInfo.style.display = 'block';
        editForm.classList.remove('active');
    });

    editForm?.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Save changes to backend not implemented yet.');
    });

    profileUploadBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'Upload.html';
    });

    changePasswordBtn?.addEventListener('click', () => {
        alert('Change Password form would appear here.');
    });

    notificationBtn?.addEventListener('click', () => toggleNotification(notificationBtn, 'Email'));
    notificationBtnSMS?.addEventListener('click', () => toggleNotification(notificationBtnSMS, 'SMS'));

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            handleNavigation(link.textContent.trim());
        });
    });

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

// ====== Navigation ======
function handleNavigation(section) {
    switch (section) {
        case 'Home': window.location.href = 'dashboard.html'; break;
        case 'Profile': break;
        case 'My Posts': window.location.href = 'MyPosts.html'; break;
    }
}

// ====== Logout ======
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userEmail');
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

document.addEventListener('DOMContentLoaded', initProfile);
