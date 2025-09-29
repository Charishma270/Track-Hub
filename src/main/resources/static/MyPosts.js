// MyPosts.js - fetches user's posts from backend, supports edit & delete

let userPosts = [];
let filteredPosts = [];
let currentFilter = "all";
let currentUser = null; // profile user

// DOM Elements
const postsGrid = document.getElementById("postsGrid");
const filterTabs = document.querySelectorAll(".tab-btn");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editPhotoInput = document.getElementById("editPhotoInput");
const editPreview = document.getElementById("editPreview");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditModalBtn = document.getElementById("closeEditModal");

// Initialize MyPosts page
async function initMyPosts() {
    const email = localStorage.getItem("userEmail");
    if (!email) {
        alert("You are not logged in!");
        window.location.href = "index.html";
        return;
    }

    try {
        currentUser = await fetchProfile(email);
        await fetchUserPosts();
        setupEventListeners();
        updateStats();
        renderPosts();
        setupNavbarScroll();
    } catch (err) {
        console.error("Error loading My Posts:", err);
        postsGrid.innerHTML = `<p style="color:red;">Failed to load your posts. Please try again later.</p>`;
    }
}

// Fetch profile
async function fetchProfile(email) {
    const profileRes = await fetch(`http://localhost:8080/api/auth/profile?email=${encodeURIComponent(email)}`);
    if (!profileRes.ok) {
        throw new Error("Failed to fetch profile");
    }
    return profileRes.json();
}

// Fetch posts for user
async function fetchUserPosts() {
    if (!currentUser || !currentUser.id) throw new Error("User id missing");
    const postsRes = await fetch(`http://localhost:8080/api/posts/user/${currentUser.id}`);
    if (!postsRes.ok) {
        const txt = await postsRes.text();
        throw new Error("Failed to fetch posts: " + txt);
    }
    userPosts = await postsRes.json();
    // ensure array
    if (!Array.isArray(userPosts)) userPosts = [];
    filteredPosts = [...userPosts];
}

// Render posts
function renderPosts() {
    if (!filteredPosts || filteredPosts.length === 0) {
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
        const imageSrc = post.photoUrl ? `data:image/png;base64,${stripDataPrefix(post.photoUrl)}` : "placeholder.png";
        const statusRaw = (post.status || "FOUND").toString();
        const status = statusRaw.toUpperCase();

        return `
            <div class="post-card" data-status="${status}">
                <img src="${imageSrc}" alt="${escapeHtml(post.title || '')}" class="post-image" loading="lazy">
                <div class="post-content">
                    <div class="post-header">
                        <div>
                            <h3 class="post-title">${escapeHtml(post.title || '')}</h3>
                            <span class="post-status status-${status.toLowerCase()}">
                                ${getStatusText(status)}
                            </span>
                        </div>
                    </div>
                    <p class="post-description">${escapeHtml(post.description || '')}</p>
                    <div class="post-meta">
                        <span class="post-location">📍 ${escapeHtml(post.location || '')}</span>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-secondary btn-small" onclick="openEditModal(${post.id})">✏️ Edit</button>
                        <button class="btn btn-danger btn-small" onclick="confirmDelete(${post.id})">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update stats section
function updateStats() {
    document.getElementById("totalPosts").textContent = userPosts.length;
    document.getElementById("activePosts").textContent = userPosts.filter(p => {
        const s = (p.status || "").toString().toUpperCase();
        return s === "FOUND" || s === "LOST";
    }).length;
    document.getElementById("resolvedPosts").textContent = userPosts.filter(p => p.isClaimed === true).length;
    // messagesReceived is placeholder until you have messages API
    document.getElementById("messagesReceived").textContent = 0;
}

// Get readable status
function getStatusText(status) {
    switch (status) {
        case "LOST": return "🔍 Lost";
        case "FOUND": return "✅ Found";
        case "RESOLVED": return "✅ Resolved";
        default: return status;
    }
}

// Filtering
function filterPosts(filter) {
    currentFilter = filter;
    if (filter === "all") {
        filteredPosts = [...userPosts];
    } else if (filter === "active") {
        filteredPosts = userPosts.filter(p => {
            const s = (p.status || "").toString().toUpperCase();
            return s === "FOUND" || s === "LOST";
        });
    } else if (filter === "resolved") {
        filteredPosts = userPosts.filter(p => p.isClaimed === true);
    } else if (filter === "expired") {
        // not implemented server-side — just empty
        filteredPosts = [];
    } else {
        filteredPosts = userPosts.filter(p => (p.status || "").toLowerCase() === filter);
    }
    renderPosts();
}

// DELETE flow
function confirmDelete(postId) {
    if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
        deletePost(postId);
    }
}

async function deletePost(postId) {
    try {
        const res = await fetch(`http://localhost:8080/api/posts/${postId}`, { method: "DELETE" });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Delete failed");
        }
        // remove from local arrays and re-render
        userPosts = userPosts.filter(p => p.id !== postId);
        filterPosts(currentFilter);
        updateStats();
        alert("Post deleted successfully.");
    } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete post: " + (err.message || err));
    }
}

// EDIT flow: open modal, prefill
function openEditModal(postId) {
    const post = userPosts.find(p => p.id === postId);
    if (!post) {
        alert("Post not found");
        return;
    }
    // show modal & prefill
    document.getElementById("editPostId").value = post.id;
    document.getElementById("editTitle").value = post.title || "";
    document.getElementById("editCategory").value = (post.category || "").toLowerCase();
    document.getElementById("editDescription").value = post.description || "";
    document.getElementById("editLocation").value = post.location || "";
    document.getElementById("editStatus").value = (post.status || "FOUND").toString().toUpperCase();
    document.getElementById("editContact").value = (post.contactPublic || "EMAIL").toString().toUpperCase();
    document.getElementById("editAdditionalNotes").value = post.additionalNotes || "";

    // preview photo if exists
    if (post.photoUrl) {
        editPreview.src = post.photoUrl.startsWith("data:") ? post.photoUrl : `data:image/png;base64,${stripDataPrefix(post.photoUrl)}`;
    } else {
        editPreview.src = "placeholder.png";
    }

    // reset file input
    editPhotoInput.value = "";
    (editModal).style.display = "block";
    editModal.setAttribute("aria-hidden", "false");
}

// Helper to hide modal
function closeEditModal() {
    (editModal).style.display = "none";
    editModal.setAttribute("aria-hidden", "true");
}

// Convert file input to base64 for photo replacement
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Submit edit (PUT)
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const postId = parseInt(document.getElementById("editPostId").value, 10);
        const title = document.getElementById("editTitle").value.trim();
        const category = document.getElementById("editCategory").value;
        const description = document.getElementById("editDescription").value.trim();
        const location = document.getElementById("editLocation").value.trim();
        const status = document.getElementById("editStatus").value.toString().toUpperCase();
        const contactPublic = document.getElementById("editContact").value.toString().toUpperCase();
        const additionalNotes = document.getElementById("editAdditionalNotes").value.trim();

        // optionally new photo
        let photoBase64 = null;
        if (editPhotoInput.files && editPhotoInput.files[0]) {
            photoBase64 = await fileToBase64(editPhotoInput.files[0]);
        } else {
            // preserve current photo if exists
            const existing = userPosts.find(p => p.id === postId);
            if (existing && existing.photoUrl) {
                // ensure it's a plain base64 string or data:...;base64,...
                photoBase64 = existing.photoUrl;
            }
        }

        // Build payload matching PostRequest
        const payload = {
            userId: currentUser.id,
            title,
            category,
            description,
            location,
            photoUrl: photoBase64,
            status,
            contactPublic,
            additionalNotes
        };

        const res = await fetch(`http://localhost:8080/api/posts/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Failed to update post");
        }

        const updated = await res.json();

        // update local copy
        const idx = userPosts.findIndex(p => p.id === postId);
        if (idx !== -1) userPosts[idx] = updated;
        filterPosts(currentFilter);
        updateStats();
        closeEditModal();
        alert("Post updated successfully.");
    } catch (err) {
        console.error("Update error:", err);
        alert("Failed to update post: " + (err.message || err));
    }
});

// Setup event listeners
function setupEventListeners() {
    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            filterPosts(tab.dataset.filter);
        });
    });

    // Cancel/Close edit modal
    cancelEditBtn.addEventListener("click", () => {
        closeEditModal();
    });
    closeEditModalBtn?.addEventListener("click", () => {
        closeEditModal();
    });

    // Optional: live preview when user selects new photo
    editPhotoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const data = await fileToBase64(file);
        editPreview.src = data;
    });
}

// Utility helpers
function stripDataPrefix(base64orData) {
    if (!base64orData) return "";
    return base64orData.replace(/^data:image\/[^;]+;base64,/, "").trim();
}
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Navbar scroll effect: copied from your other pages
function setupNavbarScroll() {
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;
        navbar.style.background = window.pageYOffset > 100
            ? "rgba(255, 255, 255, 0.98)"
            : "rgba(255, 255, 255, 0.95)";
        navbar.style.boxShadow = window.pageYOffset > 100
            ? "0 2px 20px rgba(0, 0, 0, 0.1)"
            : "none";
    });
}

// Initialize page
document.addEventListener("DOMContentLoaded", initMyPosts);

// Export small helpers to global so inline onclicks work
window.openEditModal = openEditModal;
window.confirmDelete = confirmDelete;
window.deletePost = deletePost;
