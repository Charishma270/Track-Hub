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

