// dashboard.js - robust version
const API_BASE = "http://localhost:8080/api/posts";

let currentFilter = 'all';
let items = [];
let filteredItems = [];

// DOM Elements
const itemsGrid = document.getElementById('itemsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const dashboardUploadBtn = document.getElementById('uploadBtn');

document.addEventListener('DOMContentLoaded', initDashboard);

// Initialize the dashboard
async function initDashboard() {
    await fetchItems();
    renderItems();
    setupEventListeners();
    setupNavbarScroll();
}

// Fetch posts from backend (with helpful logging and inline error UI)
async function fetchItems() {
    try {
        const response = await fetch(`${API_BASE}/all`, { method: 'GET' });
        console.log('fetch /api/posts/all ->', response.status, response.statusText);

        if (!response.ok) {
            let body = '';
            try { body = await response.text(); } catch (e) {}
            console.error('Backend error response body:', body);
            showEmptyState('Could not load items from server. See console for details.');
            items = [];
            filteredItems = [];
            return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            console.warn('Expected array from /all, got:', data);
            showEmptyState('Unexpected server response. See console for details.');
            items = [];
            filteredItems = [];
            return;
        }

        items = data;
        filteredItems = [...items];
        console.log('Loaded posts:', items.length);
    } catch (err) {
        console.error('Network or runtime error fetching posts:', err);
        showEmptyState('Network error: could not fetch items. Check backend and CORS. See console for details.');
        items = [];
        filteredItems = [];
    }
}

function showEmptyState(message = 'No items found.') {
    itemsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align:center; padding:28px;">
            <div style="font-size:32px;">🔍</div>
            <h3 class="empty-title">${escapeHtml(message)}</h3>
            <p class="empty-description">Try reloading or contact the developer if the problem persists.</p>
            <div style="margin-top:12px;">
                <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
            </div>
        </div>
    `;
}

// Render posts
function renderItems() {
    if (!filteredItems || filteredItems.length === 0) {
        return showEmptyState('No items found');
    }

    itemsGrid.innerHTML = filteredItems.map(item => {
        // determine id robustly
        const id = (item.id ?? item.postId ?? (item._id ? item._id : null));
        const hasId = id !== null && id !== undefined;

        // handle image field permutations
        const imageBase64 = item.photoUrl ?? item.photoBase64 ?? item.image ?? null;
        const imageMime = item.photoMime || 'image/jpeg';
        const imageSrc = imageBase64 ? `data:${imageMime};base64,${imageBase64}` : "placeholder.png";

        const status = item.status ? String(item.status).toUpperCase() : "UNKNOWN";
        const userId = (item.user && (item.user.id || item.userId)) || item.userId || 'Unknown';

        const titleEsc = escapeHtml(item.title || 'Untitled');
        const descEsc = escapeHtml(item.description || '');
        const locationEsc = escapeHtml(item.location || 'Unknown');

        // If no id, buttons should not navigate (and show disabled UI)
        const detailsUrl = hasId ? `Item.html?id=${encodeURIComponent(id)}` : '#';

        // disable class for missing id
        const disabledAttr = hasId ? '' : 'disabled';
        const disabledStyle = hasId ? '' : 'opacity:0.6;cursor:not-allowed';

        return `
            <div class="item-card" data-category="${escapeHtml(item.category || '')}" data-status="${status}">
                <img src="${imageSrc}" alt="${titleEsc}" class="item-image" loading="lazy" onclick="${hasId ? `window.location.href='${detailsUrl}'` : 'void(0)'}" style="cursor:${hasId ? 'pointer' : 'default'}">
                <div class="item-content">
                    <h3 class="item-title" style="cursor:${hasId ? 'pointer' : 'default'}" onclick="${hasId ? `window.location.href='${detailsUrl}'` : 'void(0)'}">${titleEsc}</h3>
                    <p class="item-description">${descEsc}</p>
                    <div class="item-meta">
                        <span class="item-location">📍 ${locationEsc}</span>
                    </div>
                    <div class="item-meta">
                        <span class="item-status status-${status.toLowerCase()}">
                            ${status === 'LOST' ? '🔍 Lost' : '✅ Found'}
                        </span>
                        <small style="color: #9ca3af;">by User #${escapeHtml(userId)}</small>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-secondary btn-small" style="${disabledStyle}" ${disabledAttr} onclick="${hasId ? `window.location.href='${detailsUrl}'` : 'alert(\"Item id missing — cannot open details\")'}">💬 Contact</button>
                        <button class="btn btn-primary btn-small" style="${disabledStyle}" ${disabledAttr} onclick="${hasId ? `window.location.href='${detailsUrl}'` : 'alert(\"Item id missing — cannot open details\")'}">👁️ Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// simple HTML escape to reduce injection issues in template strings
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Filtering
function filterItems(filter) {
    currentFilter = filter;
    if (filter === 'all') filteredItems = [...items];
    else if (filter === 'lost' || filter === 'found') filteredItems = items.filter(item => item.status && item.status.toLowerCase() === filter);
    else filteredItems = items.filter(item => item.category && item.category.toLowerCase() === filter);
    renderItems();
}

// Clear filters
function clearFilters() {
    currentFilter = 'all';
    filteredItems = [...items];
    renderItems();
}

// Event listeners for filters, upload button, etc
function setupEventListeners() {
    if (filterButtons) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const f = btn.dataset.filter;
                filterItems(f || 'all');
            });
        });
    }
    if (dashboardUploadBtn) {
        dashboardUploadBtn.addEventListener('click', () => {
            window.location.href = 'upload.html';
        });
    }
}

// Navbar scroll effect
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255,255,255,0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255,255,255,0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}
