let userPosts = [];
let filteredPosts = [];
let currentFilter = "all";

// DOM Elements
const postsGrid = document.getElementById("postsGrid");
const filterTabs = document.querySelectorAll(".tab-btn");
const messagesModal = document.getElementById("messagesModal");

// Initialize MyPosts page
async function initMyPosts() {
    const email = localStorage.getItem("userEmail");
    if (!email) {
        alert("You are not logged in!");
        window.location.href = "index.html";
        return;
    }

    try {
        // Fetch user profile
        const profileRes = await fetch(`http://localhost:8080/api/auth/profile?email=${encodeURIComponent(email)}`);
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const user = await profileRes.json();

        // Fetch user posts
        const postsRes = await fetch(`http://localhost:8080/api/posts/user/${user.id}`);
        if (!postsRes.ok) throw new Error("Failed to fetch posts");
        userPosts = await postsRes.json();
        filteredPosts = [...userPosts];

        updateStats();
        renderPosts();
        setupEventListeners();
        setupNavbarScroll();
    } catch (err) {
        console.error("Error loading My Posts:", err);
        postsGrid.innerHTML = `<p style="color:red;">Failed to load your posts. Please try again later.</p>`;
    }
}

// Render posts
function renderPosts() {
    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">📝</div>
                <h3 class="empty-title">No posts found</h3>
                <p class="empty-description">You haven't posted any items yet or no items match the current filter.</p>
                <a href="upload.html" class="btn btn-primary">📸 Post Your First Item</a>
            </div>
        `;
        return;
    }

    postsGrid.innerHTML = filteredPosts.map(post => {
        const imageSrc = post.photoUrl
            ? `data:image/png;base64,${post.photoUrl}`
            : "placeholder.png";

        const status = post.status ? post.status.toLowerCase() : "active";

        return `
            <div class="post-card" data-status="${status}">
                <img src="${imageSrc}" alt="${post.title}" class="post-image" loading="lazy">
                <div class="post-content">
                    <div class="post-header">
                        <div>
                            <h3 class="post-title">${post.title}</h3>
                            <span class="post-status status-${status}">
                                ${getStatusText(status)}
                            </span>
                        </div>
                    </div>
                    <p class="post-description">${post.description}</p>
                    <div class="post-meta">
                        <span class="post-location">📍 ${post.location}</span>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-secondary btn-small" onclick="editPost(${post.id})">✏️ Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deletePost(${post.id})">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update stats section
function updateStats() {
    document.getElementById("totalPosts").textContent = userPosts.length;
    document.getElementById("activePosts").textContent = userPosts.filter(p => p.status === "LOST" || p.status === "FOUND").length;
    document.getElementById("resolvedPosts").textContent = userPosts.filter(p => p.isClaimed === true).length;
    document.getElementById("messagesReceived").textContent = 0; // placeholder, needs backend messages later
}

// Get readable status
function getStatusText(status) {
    switch (status) {
        case "lost": return "🔍 Lost";
        case "found": return "✅ Found";
        case "resolved": return "✅ Resolved";
        default: return status;
    }
}

// Filtering
function filterPosts(filter) {
    currentFilter = filter;
    if (filter === "all") {
        filteredPosts = [...userPosts];
    } else if (filter === "active") {
        filteredPosts = userPosts.filter(p => p.status === "LOST" || p.status === "FOUND");
    } else if (filter === "resolved") {
        filteredPosts = userPosts.filter(p => p.isClaimed === true);
    } else if (filter === "expired") {
        filteredPosts = []; // not implemented yet
    }
    renderPosts();
}

// Edit/Delete (dummy for now)
function editPost(postId) {
    alert(`Edit functionality for post ID ${postId} is not implemented yet.`);
}
function deletePost(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
        alert(`Delete functionality for post ID ${postId} is not implemented yet.`);
    }
}

// Navbar scroll effect
function setupNavbarScroll() {
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        navbar.style.background = window.pageYOffset > 100
            ? "rgba(255, 255, 255, 0.98)"
            : "rgba(255, 255, 255, 0.95)";
        navbar.style.boxShadow = window.pageYOffset > 100
            ? "0 2px 20px rgba(0, 0, 0, 0.1)"
            : "none";
    });
}

// Setup event listeners
function setupEventListeners() {
    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            filterPosts(tab.dataset.filter);
        });
    });
}

document.addEventListener("DOMContentLoaded", initMyPosts);
