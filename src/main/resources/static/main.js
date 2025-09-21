// main.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("Main.js loaded");

    // ------------------------------
    // NAVBAR TOGGLE (Mobile menu)
    // ------------------------------
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // ------------------------------
    // THEME TOGGLE (Dark / Light)
    // ------------------------------
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem(
                "theme",
                document.body.classList.contains("dark-mode") ? "dark" : "light"
            );
        });

        // load saved theme
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
        }
    }

    // ------------------------------
    // FORM HANDLING: Registration
    // ------------------------------
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const firstName = document.getElementById("firstName").value.trim();
            const lastName = document.getElementById("lastName").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            // simple validation
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phone,
                        password
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    alert("✅ Registration successful! Welcome " + data.firstName);
                    window.location.href = "login.html";
                } else {
                    const errorText = await response.text();
                    alert("❌ Registration failed: " + errorText);
                }
            } catch (err) {
                console.error("Error:", err);
                alert("⚠️ Server error. Please try again later.");
            }
        });
    }

    // FORM HANDLING: Login
    // ------------------------------
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent form from submitting normally

            // Get email and password values
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            try {
                // Send login request to back-end
                const response = await fetch("http://localhost:8080/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Redirect to dashboard after successful login
                    window.location.href = "dashboard.html";
                } else {
                    const errorText = await response.text();
                    // Show error message for failed login
                    alert("❌ Login failed: " + errorText);
                }
            } catch (err) {
                console.error("Error:", err);
                alert("⚠️ Server error. Please try again later.");
            }
        });
    }

    // ------------------------------
    // EXTRA: Smooth scroll links
    // ------------------------------
    const links = document.querySelectorAll("a[href^='#']");
    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector(link.getAttribute("href"))?.scrollIntoView({
                behavior: "smooth",
            });
        });
    });
});

//---------------------------------
// FORM HANDLING: Dashboard
//------------------------------

let currentFilter = 'all';
let items = [];   // This will come from backend
let filteredItems = [];

// DOM Elements
const itemsGrid = document.getElementById('itemsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const dashboardUploadBtn = document.getElementById('uploadBtn'); // renamed

// Initialize the dashboard
async function initDashboard() {
    await fetchItems();   // Fetch from backend
    renderItems();
    setupEventListeners();
    setupNavbarScroll();
}

// Fetch items from backend
async function fetchItems() {
    try {
        const response = await fetch("http://localhost:8080/api/items");
        if (!response.ok) throw new Error("Failed to fetch items");

        items = await response.json(); // backend returns JSON list
        filteredItems = [...items];
    } catch (error) {
        console.error("Error fetching items:", error);
        itemsGrid.innerHTML = `<p style="color:red;">Failed to load items. Please try again later.</p>`;
    }
}

// Render items
function renderItems() {
    if (filteredItems.length === 0) {
        itemsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">No items found</h3>
                <p class="empty-description">Try adjusting your filters or check back later for new posts.</p>
                <button class="btn btn-primary" onclick="clearFilters()">Show All Items</button>
            </div>
        `;
        return;
    }

    itemsGrid.innerHTML = filteredItems.map(item => `
        <div class="item-card" data-category="${item.category}" data-status="${item.status}">
            <img src="${item.imageUrl}" alt="${item.title}" class="item-image" loading="lazy">
            <div class="item-content">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span class="item-location">📍 ${item.location}</span>
                    <span class="item-date">${item.date}</span>
                </div>
                <div class="item-meta">
                    <span class="item-status status-${item.status}">
                        ${item.status === 'lost' ? '🔍 Lost' : '✅ Found'}
                    </span>
                    <small style="color: #9ca3af;">by ${item.poster}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-small" onclick="contactPoster(${item.id})">💬 Contact</button>
                    <button class="btn btn-primary btn-small" onclick="viewDetails(${item.id})">👁️ Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filtering (same as your code)
function filterItems(filter) {
    currentFilter = filter;

    if (filter === 'all') {
        filteredItems = [...items];
    } else if (filter === 'lost' || filter === 'found') {
        filteredItems = items.filter(item => item.status === filter);
    } else {
        filteredItems = items.filter(item => item.category === filter);
    }

    renderItems();
}

// Other functions (contactPoster, viewDetails, clearFilters, etc.) stay same...
document.addEventListener('DOMContentLoaded', initDashboard);

//---------------------------------
// Profile Page JS
//---------------------------------

// DOM Elements
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

    privacyBtn.addEventListener('click', () => {
        const isPublic = privacyBtn.textContent === 'Public Profile';
        privacyBtn.textContent = isPublic ? 'Private Profile' : 'Public Profile';
        alert(`Profile set to ${isPublic ? 'private' : 'public'}`);
    });

    themeBtn.addEventListener('click', () => {
        const isLight = themeBtn.textContent === 'Light Mode';
        themeBtn.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        alert(`Theme changed to ${isLight ? 'dark' : 'light'} mode`);
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
//---------------------------------
// JS FOR UPLOAD ITEM PAGE
//---------------------------------

        // DOM Elements
        const uploadForm = document.getElementById('uploadForm');
        const photoUpload = document.getElementById('photoUpload');
        const photoInput = document.getElementById('photoInput');
        const photoPreview = document.getElementById('photoPreview');
        const previewImage = document.getElementById('previewImage');
        const locationToggle = document.getElementById('locationToggle');
        const locationInfo = document.getElementById('locationInfo');
        const locationDetails = document.getElementById('locationDetails');
        const successMessage = document.getElementById('successMessage');
        const cancelBtn = document.getElementById('cancelBtn');

        // Initialize the upload page
        function initUpload() {
            setupEventListeners();
            setupNavbarScroll();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Photo upload functionality
            photoUpload.addEventListener('click', () => {
                photoInput.click();
            });

            photoUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                photoUpload.classList.add('dragover');
            });

            photoUpload.addEventListener('dragleave', () => {
                photoUpload.classList.remove('dragover');
            });

            photoUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                photoUpload.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileSelect(files[0]);
                }
            });

            photoInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                }
            });

            // Location toggle
            locationToggle.addEventListener('click', () => {
                locationToggle.classList.toggle('active');
                if (locationToggle.classList.contains('active')) {
                    locationInfo.classList.add('active');
                    requestLocation();
                } else {
                    locationInfo.classList.remove('active');
                }
            });

            // Form submission
            uploadForm.addEventListener('submit', handleFormSubmit);

            // Cancel button
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? All entered information will be lost.')) {
                    window.location.href = 'dashboard.html';
                }
            });

            // Navigation links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
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

        // Handle file selection
        function handleFileSelect(file) {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    photoPreview.style.display = 'block';
                    
                    // Update upload area
                    photoUpload.innerHTML = `
                        <div class="upload-icon">✅</div>
                        <div class="upload-text">Photo uploaded successfully</div>
                        <div class="upload-subtext">Click to change photo</div>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select a valid image file.');
            }
        }

        // Request user location
        function requestLocation() {
            if (navigator.geolocation) {
                locationDetails.textContent = 'Getting your location...';
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude.toFixed(6);
                        const lng = position.coords.longitude.toFixed(6);
                        locationDetails.innerHTML = `
                            <strong>Coordinates:</strong> ${lat}, ${lng}<br>
                            <small>This location will be shared with the item owner for meetup coordination</small>
                        `;
                    },
                    (error) => {
                        locationDetails.innerHTML = `
                            <span style="color: #dc2626;">Location access denied or unavailable</span><br>
                            <small>You can still post the item without location sharing</small>
                        `;
                    }
                );
            } else {
                locationDetails.innerHTML = `
                    <span style="color: #dc2626;">Geolocation is not supported by this browser</span>
                `;
            }
        }

        // Handle form submission
        function handleFormSubmit(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(uploadForm);
            const itemName = formData.get('itemName');
            const category = formData.get('category');
            const description = formData.get('description');
            const foundLocation = formData.get('foundLocation');
            const contactMethod = formData.get('contactMethod');
            
            // Basic validation
            if (!itemName || !category || !description || !foundLocation || !contactMethod) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!photoInput.files.length) {
                alert('Please upload a photo of the item.');
                return;
            }
            
            // Simulate form submission
            const submitButton = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Posting Item...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                // Show success message
                successMessage.style.display = 'block';
                uploadForm.style.display = 'none';
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Reset form after delay
                setTimeout(() => {
                    if (confirm('Item posted successfully! Would you like to post another item?')) {
                        // Reset form
                        uploadForm.reset();
                        photoPreview.style.display = 'none';
                        locationToggle.classList.remove('active');
                        locationInfo.classList.remove('active');
                        photoUpload.innerHTML = `
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Click to upload or drag and drop</div>
                            <div class="upload-subtext">PNG, JPG, GIF up to 10MB</div>
                        `;
                        
                        successMessage.style.display = 'none';
                        uploadForm.style.display = 'block';
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 3000);
            }, 2000);
        }

        // Handle navigation
        function handleNavigation(section) {
            switch(section) {
                case 'Home':
                    window.location.href = 'dashboard.html';
                    break;
                case 'Profile':
                    window.location.href = 'profile.html';
                    break;
                case 'My Posts':
                    alert('My Posts Page\n\nThis would show your posted items with options to edit or delete them.');
                    break;
            }
        }

        // Handle logout
        function handleLogout() {
            if (confirm('Are you sure you want to logout? Any unsaved changes will be lost.')) {
                alert('Logging out...');
                window.location.href = 'login.html';
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
        document.addEventListener('DOMContentLoaded', initUpload);
