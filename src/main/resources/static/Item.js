// Item.js - robust item detail loader (no blocking alerts)
// Rewritten: robust date parsing, defensive field access, better logging

const API_BASE = "http://localhost:8080/api/posts";

document.addEventListener('DOMContentLoaded', initLostItem);

function initLostItem() {
    setupEventListeners();
    setupNavbarScroll();
    loadItemDetails();
}

function claimItem() {
    const id = getPostIdFromUrl();
    if (!id) {
        showInlineItemError('No post selected for claim.');
        return;
    }

    // Show a small prompt modal form to collect claimer details (or reuse contact modal)
    // We'll reuse the contact modal style: open a quick prompt sequence
    const name = prompt('Enter your full name to claim this item:');
    if (!name) return;
    const email = prompt('Enter your email:');
    if (!email) return;
    const phone = prompt('Enter your phone (optional):', '');
    const reason = prompt('Optional: any details to help verify you are the owner:', '');

    const payload = {
        claimerName: name.trim(),
        claimerEmail: email.trim(),
        claimerPhone: phone ? phone.trim() : '',
        claimReason: reason ? reason.trim() : ''
    };

    // disable UI briefly
    if (!confirm('Submit claim? A message will be sent to the poster to verify ownership.')) return;

    fetch(`${API_BASE}/${encodeURIComponent(id)}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const text = await res.text().catch(() => '');
        if (!res.ok) throw new Error(text || 'Failed to submit claim');
        alert('Claim submitted successfully. Poster will be notified.');
    })
    .catch(err => {
        console.error('Claim submission failed:', err);
        alert('Failed to submit claim. Try again later.');
    });
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

// ----- URL / ID helpers -----
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

// ----- Inline UI for errors (non-blocking) -----
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

// ----- Fetch and populate -----
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

// ----- Robust date parsing for "Member since" -----
function formatMemberSince(raw) {
    if (raw === null || raw === undefined || raw === '') return 'Member since —';

    // If already a Date
    if (raw instanceof Date && !isNaN(raw)) {
        return `Member since ${raw.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
    }

    // If number (seconds or ms)
    if (typeof raw === 'number') {
        const asMillis = raw < 1e12 ? raw * 1000 : raw;
        const d = new Date(asMillis);
        if (!isNaN(d)) return `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
    }

    // If string (ISO or other)
    if (typeof raw === 'string') {
        const s = raw.trim();

        // /Date(1234567890)/ format
        const msMatch = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
        if (msMatch) {
            const d = new Date(parseInt(msMatch[1], 10));
            if (!isNaN(d)) return `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        }

        // Try ISO parse
        const dIso = new Date(s);
        if (!isNaN(dIso)) {
            return `Member since ${dIso.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        }

        // try fallback parse
        const parsed = Date.parse(s);
        if (!isNaN(parsed)) {
            const d2 = new Date(parsed);
            return `Member since ${d2.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        }
    }

    // If object like {year,month,day}
    if (typeof raw === 'object') {
        const r = raw;
        if (r.year !== undefined && r.month !== undefined) {
            const y = Number(r.year);
            const m = Number(r.month) - 1;
            const day = r.day !== undefined ? Number(r.day) : 1;
            const d = new Date(y, m, day);
            if (!isNaN(d)) return `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        }

        if (r.seconds !== undefined) {
            const ms = Number(r.seconds) * 1000 + (r.nanos ? Math.floor(Number(r.nanos) / 1e6) : 0);
            const d = new Date(ms);
            if (!isNaN(d)) return `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        }

        if (r.createdAt || r.created_at) {
            return formatMemberSince(r.createdAt ?? r.created_at);
        }
    }

    // final string attempt
    try {
        const asString = String(raw);
        const p = Date.parse(asString);
        if (!isNaN(p)) {
            const d = new Date(p);
            return `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        }
    } catch (e) { /* ignore */ }

    return 'Member since —';
}

// ----- Populate UI -----
function populateItemDetails(post) {
    console.log('POST DETAIL (full):', post);
    console.log('POST DETAIL user object:', post.user);

    // Title
    const titleEl = document.querySelector('.item-title');
    if (titleEl) titleEl.textContent = post.title || 'Untitled';

    // Description
    const descContainer = document.querySelector('.item-description');
    if (descContainer) {
        descContainer.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = post.description || '';
        descContainer.appendChild(p);
    }

    // Metadata: location and createdAt for post
    const metaSpans = document.querySelectorAll('.item-meta .meta-item span');
    if (metaSpans && metaSpans.length >= 2) {
        metaSpans[0].textContent = post.location || 'Unknown location';
        metaSpans[1].textContent = post.createdAt ? `Posted ${new Date(post.createdAt).toLocaleString()}` : '';
    }

    // Image handling (supports several field names)
    const mainImage = document.getElementById('mainImage');
    const imageBase64 = post.photoBase64 ?? post.photoUrl ?? post.image ?? null;
    const imageMime = post.photoMime || 'image/jpeg';
    if (mainImage) {
        if (imageBase64) mainImage.src = `data:${imageMime};base64,${imageBase64}`;
        // else keep existing placeholder image in HTML
    }

    // Poster info: name, email, phone, member since
    if (post.user) {
        const posterNameEl = document.querySelector('.poster-details h3');
        if (posterNameEl) posterNameEl.textContent = `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim();

        // prefer multiple selectors: check for 3 p tags, otherwise fallback to .poster-member-since
        const posterPs = document.querySelectorAll('.poster-details p');

        // Determine created value robustly (try multiple property names)
        const u = post.user || {};
        const createdValue = u.createdAt ?? u.created_at ?? u.created_date ?? u.created;

        if (posterPs && posterPs.length >= 3) {
            posterPs[0].textContent = `📧 ${u.email || 'Not provided'}`;
            posterPs[1].textContent = u.phone ? `📞 ${u.phone}` : '📞 Not provided';
            posterPs[2].textContent = formatMemberSince(createdValue);
        } else {
            if (posterPs && posterPs.length >= 1) {
                posterPs[0].textContent = `📧 ${u.email || 'Not provided'}`;
            }
            const memberEl = document.querySelector('.poster-member-since');
            if (memberEl) memberEl.textContent = formatMemberSince(createdValue);
        }

        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle) modalTitle.textContent = `Contact ${post.user.firstName || ''}`.trim();
    }

        // --- POSTER STATISTICS (insert here) ---
    // Replace static stats with live values from post.user (safe fallbacks)
    const statsContainer = document.querySelector('.poster-stats');
    if (statsContainer) {
        const u = post.user || {};

        // try multiple possible field names (backend might send different names)
        const itemsPosted = (u.itemsPosted ?? u.items_posted ?? u.itemsPostedCount ?? u.postCount ?? null);
        const itemsReturned = (u.itemsReturned ?? u.items_returned ?? u.itemsReturnedCount ?? u.returnedCount ?? null);
        const ratingRaw = (u.rating ?? u.avgRating ?? u.ratingValue ?? null);

        const itemsPostedDisplay = (itemsPosted !== null && itemsPosted !== undefined) ? String(itemsPosted) : '—';
        const itemsReturnedDisplay = (itemsReturned !== null && itemsReturned !== undefined) ? String(itemsReturned) : '—';
        const ratingDisplay = (ratingRaw !== null && ratingRaw !== undefined && !Number.isNaN(Number(ratingRaw)))
            ? (Number(ratingRaw).toFixed(1))
            : '—';

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${escapeHtml(itemsPostedDisplay)}</span>
                <span class="stat-label">Items Posted</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${escapeHtml(itemsReturnedDisplay)}</span>
                <span class="stat-label">Items Returned</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${escapeHtml(ratingDisplay)}</span>
                <span class="stat-label">Rating</span>
            </div>
        `;
    }
    // --- end poster stats ---


    // Dynamic Location Details block (location + additionalNotes)
    const locationInfo = document.querySelector('.location-info .location-details') || document.querySelector('.location-info');
    if (locationInfo) {
        let locHtml = '';
        if (post.location) locHtml += `<h3>${escapeHtml(post.location)}</h3>`;
        if (post.additionalNotes) {
            locHtml += `<p>${escapeHtml(post.additionalNotes)}</p>`;
        } else if (post.description) {
            locHtml += `<p>${escapeHtml(post.description)}</p>`;
        } else {
            locHtml += `<p>Location information not provided.</p>`;
        }
        locationInfo.innerHTML = locHtml;
    }

    // status badge
    const statusEl = document.querySelector('.item-status');
    if (statusEl) {
        if (post.status && String(post.status).toUpperCase() === 'FOUND') {
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

// ----- Contact form handling -----
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
        // success: show informal inline confirmation (alert preserved here)
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

// ----- Misc UI helpers -----
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

// small escape helper
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function formatMemberSince(dateString) {
    if (!dateString) return 'Member since —';
    const d = new Date(dateString);
    if (isNaN(d)) return 'Member since —';
    return `Member since ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
}
