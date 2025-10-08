// Item.js - robust item detail loader (no blocking alerts)
const API_BASE = "http://localhost:8080/api/posts";

document.addEventListener('DOMContentLoaded', initLostItem);

function initLostItem() {
    setupEventListeners();
    setupNavbarScroll();
    loadItemDetails();
}

function setupEventListeners() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmission);

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const linkText = link.textContent.trim();
            handleNavigation(linkText);
        });
    });

    const logoutBtn = document.querySelector('.btn-outline');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });

    const modal = document.getElementById('contactModal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeContactModal(); });
}

// get id from ?id=, path /item.html/123 or hash #id=123
function getPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const idFromQuery = params.get('id');
    if (idFromQuery) return idFromQuery;

    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
        const last = parts[parts.length - 1];
        if (/^\d+$/.test(last)) return last;
    }

    if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const idFromHash = hashParams.get('id');
        if (idFromHash) return idFromHash;
    }

    return null;
}

function showInlineItemError(message) {
    console.warn(message);
    const container = document.querySelector('.container') || document.querySelector('main') || document.body;
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state" style="padding: 40px; text-align:center;">
            <div style="font-size:48px;">⚠️</div>
            <h3>${escapeHtml(message)}</h3>
            <p style="color:#6b7280">Please go back to the dashboard or try again later.</p>
            <div style="margin-top:16px;">
                <a href="dashboard.html" class="btn btn-primary">Back to Dashboard</a>
            </div>
        </div>
    `;
}

function loadItemDetails() {
    const id = getPostIdFromUrl();
    if (!id) {
        showInlineItemError('No item selected.');
        return;
    }

    fetch(`${API_BASE}/${encodeURIComponent(id)}`)
        .then(async res => {
            console.log('fetch post detail', res.status, res.statusText);
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                console.error('Failed to fetch post detail:', res.status, res.statusText, txt);
                showInlineItemError('Could not load item details (server error).');
                return null;
            }
            return res.json();
        })
        .then(post => {
            if (post) populateItemDetails(post);
        })
        .catch(err => {
            console.error('Network/error fetching post detail:', err);
            showInlineItemError('Could not load item details (network error).');
        });
}

function populateItemDetails(post) {
    // title
    const titleEl = document.querySelector('.item-title');
    if (titleEl) titleEl.textContent = post.title || 'Untitled';

    // description area: replace inner content
    const descContainer = document.querySelector('.item-description');
    if (descContainer) {
        descContainer.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = post.description || '';
        descContainer.appendChild(p);
    }

    // metadata: location and createdAt
    const metaSpans = document.querySelectorAll('.item-meta .meta-item span');
    if (metaSpans && metaSpans.length >= 2) {
        metaSpans[0].textContent = post.location || 'Unknown location';
        metaSpans[1].textContent = post.createdAt ? `Posted ${new Date(post.createdAt).toLocaleString()}` : '';
    }

    // image variations: dto uses photoBase64, backend uses byte[] -> DTO base64
    const mainImage = document.getElementById('mainImage');
    const imageBase64 = post.photoBase64 ?? post.photoUrl ?? post.image ?? null;
    const imageMime = post.photoMime || 'image/jpeg';
    if (mainImage && imageBase64) {
        mainImage.src = `data:${imageMime};base64,${imageBase64}`;
    }

    // poster info
    if (post.user) {
        const posterNameEl = document.querySelector('.poster-details h3');
        if (posterNameEl) posterNameEl.textContent = `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim();

        const posterPs = document.querySelectorAll('.poster-details p');
        if (posterPs && posterPs.length >= 2) {
            posterPs[0].textContent = `📧 ${post.user.email || 'Not provided'}`;
            posterPs[1].textContent = post.user.phone ? `📞 ${post.user.phone}` : '📞 Not provided';
        }

        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle) modalTitle.textContent = `Contact ${post.user.firstName || ''}`.trim();
    }

    // status badge
    const statusEl = document.querySelector('.item-status');
    if (statusEl) {
        if (post.status && post.status.toUpperCase() === 'FOUND') {
            statusEl.textContent = '✅ Found Item';
            statusEl.classList.remove('status-lost');
            statusEl.classList.add('status-found');
        } else {
            statusEl.textContent = '❗ Lost Item';
            statusEl.classList.remove('status-found');
            statusEl.classList.add('status-lost');
        }
    }
}

function handleContactSubmission(e) {
    e.preventDefault();
    const id = getPostIdFromUrl();
    if (!id) {
        showInlineItemError('Cannot send message: missing post id.');
        return;
    }

    const form = e.target;
    const senderName = (form.senderName?.value || '').trim();
    const senderEmail = (form.senderEmail?.value || '').trim();
    const senderPhone = (form.senderPhone?.value || '').trim();
    const message = (form.message?.value || '').trim();

    if (!senderName || !senderEmail || !message) {
        alert('Please fill all required fields.');
        return;
    }

    const payload = { senderName, senderEmail, senderPhone, message };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Send';
    if (submitBtn) { submitBtn.textContent = 'Sending...'; submitBtn.disabled = true; }

    fetch(`${API_BASE}/${encodeURIComponent(id)}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const text = await res.text().catch(() => '');
        if (!res.ok) throw new Error(text || 'Failed to send');
        // success: show informal inline confirmation
        alert(text || 'Message sent successfully');
        closeContactModal();
    })
    .catch(err => {
        console.error('Failed to send contact message:', err);
        alert('Failed to send message. Try again later.');
    })
    .finally(() => {
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
    });
}

function openContactModal() { document.getElementById('contactModal')?.classList.add('active'); }
function closeContactModal() { document.getElementById('contactModal')?.classList.remove('active'); document.getElementById('contactForm')?.reset(); }

function claimItem() {
    if (confirm('Are you sure this is your item?')) {
        alert('Claim request sent to poster. They will contact you.');
    }
}
function handleLogout() { if (confirm('Are you sure you want to logout?')) window.location.href = 'login.html'; }
function handleNavigation(section) {
    if (section === 'Home') window.location.href = 'dashboard.html';
    if (section === 'Profile') window.location.href = 'profile.html';
    if (section === 'My Posts') window.location.href = 'MyPosts.html';
}
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

// small escape helper used above
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
