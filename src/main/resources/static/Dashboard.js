let currentFilter = 'all';
let items = [];
let filteredItems = [];

// DOM Elements
const itemsGrid = document.getElementById('itemsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const dashboardUploadBtn = document.getElementById('uploadBtn');

// Initialize the dashboard
async function initDashboard() {
    await fetchItems();
    renderItems();
    setupEventListeners();
    setupNavbarScroll();
}

// Fetch posts from backend
async function fetchItems() {
    try {
        const response = await fetch("http://localhost:8080/api/posts/all");
        if (!response.ok) throw new Error("Failed to fetch posts");

        items = await response.json();
        filteredItems = [...items];
    } catch (error) {
        console.error("Error fetching items:", error);
        itemsGrid.innerHTML = `<p style="color:red;">Failed to load items. Please try again later.</p>`;
    }
}

// Render posts
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

    itemsGrid.innerHTML = filteredItems.map(item => {
        const imageSrc = item.photoUrl
            ? `data:image/png;base64,${item.photoUrl}`
            : "placeholder.png";

        const status = item.status ? item.status.toUpperCase() : "UNKNOWN";

        return `
            <div class="item-card" data-category="${item.category}" data-status="${status}">
                <img src="${imageSrc}" alt="${item.title}" class="item-image" loading="lazy">
                <div class="item-content">
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-description">${item.description}</p>
                    <div class="item-meta">
                        <span class="item-location">📍 ${item.location}</span>
                    </div>
                    <div class="item-meta">
                        <span class="item-status status-${status.toLowerCase()}">
                            ${status === 'LOST' ? '🔍 Lost' : '✅ Found'}
                        </span>
                        <small style="color: #9ca3af;">by User #${item.userId}</small>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-secondary btn-small" onclick="window.location.href='Item.html'">💬 Contact</button>
                        <button class="btn btn-primary btn-small" onclick="window.location.href='Item.html'">👁️ Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filtering
function filterItems(filter) {
    currentFilter = filter;

    if (filter === 'all') {
        filteredItems = [...items];
    } else if (filter === 'lost' || filter === 'found') {
        filteredItems = items.filter(item => 
            item.status && item.status.toLowerCase() === filter
        );
    } else {
        filteredItems = items.filter(item => 
            item.category && item.category.toLowerCase() === filter
        );
    }

    renderItems();
}

// Clear filters
function clearFilters() {
    currentFilter = 'all';
    filteredItems = [...items];
    renderItems();
}

// Dummy handlers for now
function contactPoster(id) {
    alert("Contact poster feature coming soon for post ID " + id);
}
function viewDetails(id) {
    alert("View details feature coming soon for post ID " + id);
}

document.addEventListener('DOMContentLoaded', initDashboard);
