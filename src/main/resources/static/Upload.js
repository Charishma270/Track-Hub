// ====== DOM Elements ======
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

let base64Photo = ""; // global variable to store photo

// ====== Initialize Upload Page ======
function initUpload() {
    setupEventListeners();
    setupNavbarScroll();
}

// ====== Event Listeners ======
function setupEventListeners() {
    // --- Photo Upload ---
    photoUpload.addEventListener('click', () => photoInput.click());

    photoUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUpload.classList.add('dragover');
    });

    photoUpload.addEventListener('dragleave', () => photoUpload.classList.remove('dragover'));

    photoUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUpload.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    // --- Location ---
    locationToggle.addEventListener('click', () => {
        locationToggle.classList.toggle('active');
        locationInfo.classList.toggle('active', locationToggle.classList.contains('active'));
        if (locationToggle.classList.contains('active')) requestLocation();
    });

    // --- Form Submit & Cancel ---
    uploadForm.addEventListener('submit', handleFormSubmit);

    cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? All entered information will be lost.')) {
            window.location.href = 'dashboard.html';
        }
    });

    // --- Navbar Links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavigation(link.textContent.trim());
        });
    });

    // --- Logout ---
    document.querySelector('.btn-outline')?.addEventListener('click', handleLogout);
}

// ====== Handle File Selection ======
function handleFileSelect(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            photoPreview.style.display = 'block';
            base64Photo = e.target.result;

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

// ====== Request Location ======
function requestLocation() {
    if (navigator.geolocation) {
        locationDetails.textContent = 'Getting your location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                locationDetails.innerHTML = `<strong>Coordinates:</strong> ${lat}, ${lng}<br><small>This location will be shared with the item owner for meetup coordination</small>`;
            },
            () => {
                locationDetails.innerHTML = `<span style="color: #dc2626;">Location access denied or unavailable</span><br><small>You can still post the item without location sharing</small>`;
            }
        );
    } else {
        locationDetails.innerHTML = `<span style="color: #dc2626;">Geolocation is not supported by this browser</span>`;
    }
}

// ====== Handle Form Submission ======
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(uploadForm);
    const title = formData.get('itemName');
    const category = formData.get('category'); // ✅ category added
    const description = formData.get('description');
    const location = formData.get('foundLocation');
    const contactMethod = formData.get('contactMethod');
    const additionalNotes = formData.get('additionalNotes');

    // --- Validation ---
    if (!title || !category || !description || !location || !contactMethod || !base64Photo) {
        alert('Please fill in all required fields, select a category, and upload a photo.');
        return;
    }

    const email = localStorage.getItem('userEmail');
    if (!email) {
        alert('You are not logged in.');
        return;
    }

    try {
        // Fetch user profile to get userId
        const profileRes = await fetch(`http://localhost:8080/api/auth/profile?email=${encodeURIComponent(email)}`);
        if (!profileRes.ok) throw new Error('Failed to fetch user profile');
        const user = await profileRes.json();

        // ✅ Prepare payload with category
       const payload = {
    userId: user.id,
    title,
    category,
    description,
    location,
    photoUrl: base64Photo,
    status: 'FOUND', // default
    contactPublic: contactMethod.toUpperCase(), // EMAIL / PHONE / BOTH
    additionalNotes
};
console.log("Payload being sent:", payload);


        // Send to backend
        const res = await fetch('http://localhost:8080/api/posts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Item posted successfully!');
            window.location.href = 'dashboard.html';
        } else {
            const errorText = await res.text();
            alert('Failed to post item: ' + errorText);
        }
    } catch (err) {
        console.error(err);
        alert('Error posting item. Please try again.');
    }
}

// ====== Navigation ======
function handleNavigation(section) {
    switch (section) {
        case 'Home': window.location.href = 'dashboard.html'; break;
        case 'Profile': window.location.href = 'profile.html'; break;
        case 'My Posts': window.location.href = 'MyPosts.html'; break;
    }
}

// ====== Logout ======
function handleLogout() {
    if (confirm('Are you sure you want to logout? Any unsaved changes will be lost.')) {
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

// ====== Initialize ======
document.addEventListener('DOMContentLoaded', initUpload);
