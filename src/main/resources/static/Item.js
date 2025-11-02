// Item.js - Enhanced version with user auto-fill for contact modal
// -----------------------------------------------

const API_BASE = "http://localhost:8080/api/posts";
const USER_API = "http://localhost:8080/api/users/me";

let currentUser = null; // holds logged-in user info for autofill

document.addEventListener('DOMContentLoaded', () => {
    initLostItem();
    loadCurrentUser(); // fetch current user for autofill
});

// -----------------------------------------------
// Initialization
// -----------------------------------------------
function initLostItem() {
    setupEventListeners();
    setupNavbarScroll();
    loadItemDetails();
}

// -----------------------------------------------
// Load current user for autofill (from /api/users/me)
// -----------------------------------------------
function loadCurrentUser() {
    fetch(USER_API, { credentials: "include" })
        .then(async res => {
            if (res.status === 200) {
                try {
                    const data = await res.json();
                    currentUser = data;
                    console.log("Loaded current user:", currentUser);
                } catch (err) {
                    console.warn("Could not parse current user JSON:", err);
                }
            } else {
                console.log("No current user or not logged in (status:", res.status, ")");
            }
        })
        .catch(err => {
            console.error("Error loading current user:", err);
        });
}

// -----------------------------------------------
// Event Listeners
// -----------------------------------------------
function setupEventListeners() {
    const contactForm = document.getElementById("contactForm");
    if (contactForm) contactForm.addEventListener("submit", handleContactSubmission);

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            const linkText = link.textContent.trim();
            handleNavigation(linkText);
        });
    });

    const logoutBtn = document.querySelector(".btn-outline");
    if (logoutBtn) logoutBtn.addEventListener("click", e => {
        e.preventDefault();
        handleLogout();
    });

    const modal = document.getElementById("contactModal");
    if (modal) modal.addEventListener("click", e => {
        if (e.target === modal) closeContactModal();
    });
}

// -----------------------------------------------
// Helpers: Get Post ID
// -----------------------------------------------
function getPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const idFromQuery = params.get("id");
    if (idFromQuery) return idFromQuery;

    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
        const last = parts[parts.length - 1];
        if (/^\d+$/.test(last)) return last;
    }

    if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const idFromHash = hashParams.get("id");
        if (idFromHash) return idFromHash;
    }

    return null;
}

// -----------------------------------------------
// Inline Error
// -----------------------------------------------
function showInlineItemError(message) {
    console.warn(message);
    const container = document.querySelector(".container") || document.querySelector("main") || document.body;
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

// -----------------------------------------------
// Fetch and Populate
// -----------------------------------------------
function loadItemDetails() {
    const id = getPostIdFromUrl();
    if (!id) {
        showInlineItemError("No item selected.");
        return;
    }

    fetch(`${API_BASE}/${encodeURIComponent(id)}`)
        .then(async res => {
            console.log("fetch post detail", res.status, res.statusText);
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                console.error("Failed to fetch post detail:", res.status, res.statusText, txt);
                showInlineItemError("Could not load item details (server error).");
                return null;
            }

            const result = await res.json().catch(() => null);
            if (!result) {
                showInlineItemError("Invalid server response.");
                return null;
            }

            // ✅ Extract post correctly whether wrapped or not
            const post = result.data ? result.data : result;
            return post;
        })
        .then(post => {
            if (post) populateItemDetails(post);
        })
        .catch(err => {
            console.error("Network/error fetching post detail:", err);
            showInlineItemError("Could not load item details (network error).");
        });
}


// -----------------------------------------------
// Format "Member since"
// -----------------------------------------------
function formatMemberSince(dateString) {
    if (!dateString) return "Member since —";
    const d = new Date(dateString);
    if (isNaN(d)) return "Member since —";
    return `Member since ${d.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
}

// -----------------------------------------------
// Populate Item Details
// -----------------------------------------------
function populateItemDetails(post) {
    console.log("POST DETAIL:", post);

    // Title
    const titleEl = document.querySelector(".item-title");
    if (titleEl) titleEl.textContent = post.title || "Untitled";

    // Description
    const descContainer = document.querySelector(".item-description");
    if (descContainer) {
        descContainer.innerHTML = "";
        const p = document.createElement("p");
        p.textContent = post.description || "";
        descContainer.appendChild(p);
    }

    // Metadata
    const metaSpans = document.querySelectorAll(".item-meta .meta-item span");
    if (metaSpans && metaSpans.length >= 2) {
        metaSpans[0].textContent = post.location || "Unknown location";
        metaSpans[1].textContent = post.createdAt ? `Posted ${new Date(post.createdAt).toLocaleString()}` : "";
    }

    // Image
    const mainImage = document.getElementById("mainImage");
    const imageBase64 = post.photoBase64 ?? post.photoUrl ?? post.image ?? null;
    const imageMime = post.photoMime || "image/jpeg";
    if (mainImage && imageBase64) {
        mainImage.src = `data:${imageMime};base64,${imageBase64}`;
    }

    // Poster Info
    if (post.user) {
        const u = post.user;
        const posterNameEl = document.querySelector(".poster-details h3");
        if (posterNameEl) posterNameEl.textContent = `${u.firstName || ""} ${u.lastName || ""}`.trim();

        const posterPs = document.querySelectorAll(".poster-details p");
        const createdValue = u.createdAt ?? u.created_at ?? u.created_date ?? u.created;

        if (posterPs && posterPs.length >= 3) {
            posterPs[0].textContent = `📧 ${u.email || "Not provided"}`;
            posterPs[1].textContent = u.phone ? `📞 ${u.phone}` : "📞 Not provided";
            posterPs[2].textContent = formatMemberSince(createdValue);
        }

        const modalTitle = document.querySelector(".modal-title");
        if (modalTitle) modalTitle.textContent = `Contact ${u.firstName || ""}`.trim();
    }

    // Poster Stats
    const statsContainer = document.querySelector(".poster-stats");
    if (statsContainer) {
        const u = post.user || {};
        const itemsPosted = u.itemsPosted ?? 0;
        const itemsReturned = u.itemsReturned ?? 0;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${escapeHtml(itemsPosted)}</span>
                <span class="stat-label">Items Posted</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${escapeHtml(itemsReturned)}</span>
                <span class="stat-label">Items Returned</span>
            </div>
        `;
    }

    // Dynamic Location
    const locationInfo = document.querySelector(".location-info .location-details") || document.querySelector(".location-info");
    if (locationInfo) {
        let locHtml = "";
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

    // Status
    const statusEl = document.querySelector(".item-status");
    if (statusEl) {
        if (post.status && String(post.status).toUpperCase() === "FOUND") {
            statusEl.textContent = "✅ Found Item";
            statusEl.classList.remove("status-lost");
            statusEl.classList.add("status-found");
        } else {
            statusEl.textContent = "❗ Lost Item";
            statusEl.classList.remove("status-found");
            statusEl.classList.add("status-lost");
        }
    }
}

// -----------------------------------------------
// Contact Form
// -----------------------------------------------
function openContactModal() {
    const modal = document.getElementById("contactModal");

    // Auto-fill fields if currentUser available
    if (currentUser) {
        const nameInput = document.getElementById("senderName");
        const emailInput = document.getElementById("senderEmail");
        const phoneInput = document.getElementById("senderPhone");

        if (nameInput && !nameInput.value.trim()) {
            const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ");
            nameInput.value = fullName || "";
        }
        if (emailInput && !emailInput.value.trim()) {
            emailInput.value = currentUser.email || "";
        }
        if (phoneInput && !phoneInput.value.trim()) {
            phoneInput.value = currentUser.phone || "";
        }
    }

    modal?.classList.add("active");
}

function closeContactModal() {
    const modal = document.getElementById("contactModal");
    if (modal) modal.classList.remove("active");
    document.getElementById("contactForm")?.reset();
}

async function handleContactSubmission(e) {
    e.preventDefault();
    const id = getPostIdFromUrl();
    if (!id) {
        showInlineItemError("Cannot send message: missing post id.");
        return;
    }

    const form = e.target;
    const senderName = (form.senderName?.value || "").trim();
    const senderEmail = (form.senderEmail?.value || "").trim();
    const senderPhone = (form.senderPhone?.value || "").trim();
    const message = (form.message?.value || "").trim();

    if (!senderName || !senderEmail || !senderPhone || !message) {
        alert("Please fill all required fields.");
        return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn ? submitBtn.textContent : "Send";
    if (submitBtn) {
        submitBtn.textContent = "Sending OTP...";
        submitBtn.disabled = true;
    }

    try {
        // STEP 1️⃣: Initiate contact (send OTP)
        const initRes = await fetch(`${API_BASE}/${encodeURIComponent(id)}/contact/initiate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderName, senderEmail, senderPhone })
        });

        const initText = await initRes.text().catch(() => "");
        if (!initRes.ok) throw new Error(initText || "Failed to send OTP");

        alert("OTP sent successfully to your phone. Please enter it to continue.");
        const otp = prompt("Enter the OTP sent to your phone:");

        if (!otp) {
            alert("OTP is required to verify contact.");
            return;
        }

        // STEP 2️⃣: Verify OTP and send message
        if (submitBtn) {
            submitBtn.textContent = "Verifying OTP...";
        }

        const verifyRes = await fetch(`${API_BASE}/${encodeURIComponent(id)}/contact/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderName, senderEmail, senderPhone, otp, message })
        });

        const verifyText = await verifyRes.text().catch(() => "");
        if (!verifyRes.ok) throw new Error(verifyText || "Failed to send message");

        alert("✅ Message sent successfully to the post owner!");
        closeContactModal();
    } catch (err) {
        console.error("Contact flow failed:", err);
        alert("Failed to send message. " + (err.message || "Try again later."));
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}


// -----------------------------------------------
// Claim Item
// -----------------------------------------------
function claimItem() {
    const id = getPostIdFromUrl();
    if (!id) {
        showInlineItemError("No post selected for claim.");
        return;
    }

    const name = currentUser ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() : prompt("Enter your full name to claim this item:");
    if (!name) return;
    const email = currentUser?.email || prompt("Enter your email:");
    if (!email) return;
    const phone = currentUser?.phone || prompt("Enter your phone (optional):", "");
    const reason = prompt("Optional: any details to help verify you are the owner:", "");

    const payload = {
        claimerName: name.trim(),
        claimerEmail: email.trim(),
        claimerPhone: phone ? phone.trim() : "",
        claimReason: reason ? reason.trim() : ""
    };

    if (!confirm("Submit claim? A message will be sent to the poster to verify ownership.")) return;

    fetch(`${API_BASE}/${encodeURIComponent(id)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(async res => {
            const text = await res.text().catch(() => "");
            if (!res.ok) throw new Error(text || "Failed to submit claim");
            alert("Claim submitted successfully. Poster will be notified.");
        })
        .catch(err => {
            console.error("Claim submission failed:", err);
            alert("Failed to submit claim. Try again later.");
        });
}

// -----------------------------------------------
// UI Helpers
// -----------------------------------------------
function handleLogout() {
    if (confirm("Are you sure you want to logout?")) window.location.href = "login.html";
}

function handleNavigation(section) {
    if (section === "Home") window.location.href = "dashboard.html";
    if (section === "Profile") window.location.href = "profile.html";
    if (section === "My Posts") window.location.href = "MyPosts.html";
}

function setupNavbarScroll() {
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;
        if (window.scrollY > 100) {
            navbar.style.background = "rgba(255,255,255,0.98)";
            navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)";
        } else {
            navbar.style.background = "rgba(255,255,255,0.95)";
            navbar.style.boxShadow = "none";
        }
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
