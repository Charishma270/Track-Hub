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
// Get the login form element
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

        // Sample data for lost and found items
        const sampleItems = [
            {
                id: 1,
                title: "iPhone 13 Pro",
                description: "Black iPhone 13 Pro found near the library entrance. Has a blue case with initials 'JS' on the back. Screen protector is slightly cracked on the top right corner.",
                image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Main Library",
                date: "2 hours ago",
                status: "found",
                category: "electronics",
                poster: "Sarah Johnson"
            },
            {
                id: 2,
                title: "Red Backpack",
                description: "Lost my red Jansport backpack containing textbooks and a laptop charger. Last seen in the cafeteria during lunch break. Has a small keychain attached.",
                image: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Student Cafeteria",
                date: "5 hours ago",
                status: "lost",
                category: "accessories",
                poster: "Mike Chen"
            },
            {
                id: 3,
                title: "Silver Watch",
                description: "Found a silver Casio watch in the gym locker room. Has some scratches on the band but still works perfectly. Looks like it might be engraved on the back.",
                image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Sports Complex",
                date: "1 day ago",
                status: "found",
                category: "accessories",
                poster: "Emma Davis"
            },
            {
                id: 4,
                title: "Chemistry Textbook",
                description: "Lost my Organic Chemistry textbook (3rd edition) with lots of highlighted notes and bookmarks. Has my name written inside the front cover.",
                image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Science Building",
                date: "2 days ago",
                status: "lost",
                category: "books",
                poster: "Alex Rodriguez"
            },
            {
                id: 5,
                title: "Blue Denim Jacket",
                description: "Found a blue denim jacket hanging in the computer lab. Size medium, has a small pin collection on the left side. Looks like it's been there for a while.",
                image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Computer Lab",
                date: "3 days ago",
                status: "found",
                category: "clothing",
                poster: "Lisa Park"
            },
            {
                id: 6,
                title: "AirPods Pro",
                description: "Lost my white AirPods Pro in the original charging case. Last seen in the student lounge area. Case has a small dent on one corner.",
                image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Student Lounge",
                date: "4 days ago",
                status: "lost",
                category: "electronics",
                poster: "David Kim"
            },
            {
                id: 7,
                title: "Black Wallet",
                description: "Found a black leather wallet near the parking lot. Contains some cards and cash. Trying to find the rightful owner - please provide identification details.",
                image: "https://images.pexels.com/photos/164571/pexels-photo-164571.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Parking Lot B",
                date: "1 week ago",
                status: "found",
                category: "accessories",
                poster: "Jennifer Wilson"
            },
            {
                id: 8,
                title: "Calculus Notebook",
                description: "Lost my spiral notebook with all my calculus notes from this semester. Has a green cover and my name on the front. Really need it for upcoming exams!",
                image: "https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Mathematics Building",
                date: "1 week ago",
                status: "lost",
                category: "books",
                poster: "Ryan Thompson"
            }
        ];

        let currentFilter = 'all';
        let filteredItems = [...sampleItems];

        // DOM Elements
        const itemsGrid = document.getElementById('itemsGrid');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const uploadBtn = document.getElementById('uploadBtn');

        // Initialize the dashboard
        function initDashboard() {
            renderItems();
            setupEventListeners();
            setupNavbarScroll();
        }

        // Render items to the grid
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
                    <img src="${item.image}" alt="${item.title}" class="item-image" loading="lazy">
                    <div class="item-content">
                        <h3 class="item-title">${item.title}</h3>
                        <p class="item-description">${item.description}</p>
                        <div class="item-meta">
                            <span class="item-location">${item.location}</span>
                            <span class="item-date">${item.date}</span>
                        </div>
                        <div class="item-meta">
                            <span class="item-status status-${item.status}">
                                ${item.status === 'lost' ? '🔍 Lost' : '✅ Found'}
                            </span>
                            <small style="color: #9ca3af;">by ${item.poster}</small>
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-secondary btn-small" onclick="contactPoster(${item.id})">
                                💬 Contact
                            </button>
                            <button class="btn btn-primary btn-small" onclick="viewDetails(${item.id})">
                                👁️ Details
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Setup event listeners
        function setupEventListeners() {
            // Filter buttons
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    filterButtons.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    // Filter items
                    const filter = btn.dataset.filter;
                    filterItems(filter);
                });
            });

            // Upload button
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showUploadModal();
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

        // Filter items based on category or status
        function filterItems(filter) {
            currentFilter = filter;
            
            if (filter === 'all') {
                filteredItems = [...sampleItems];
            } else if (filter === 'lost' || filter === 'found') {
                filteredItems = sampleItems.filter(item => item.status === filter);
            } else {
                filteredItems = sampleItems.filter(item => item.category === filter);
            }
            
            renderItems();
        }

        // Clear all filters
        function clearFilters() {
            currentFilter = 'all';
            filteredItems = [...sampleItems];
            
            // Reset filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
            
            renderItems();
        }

        // Contact poster function
        function contactPoster(itemId) {
            const item = sampleItems.find(i => i.id === itemId);
            if (item) {
                alert(`Contacting ${item.poster} about "${item.title}"\n\nThis would normally open a messaging interface or show contact details.`);
            }
        }

        // View details function
        function viewDetails(itemId) {
            const item = sampleItems.find(i => i.id === itemId);
            if (item) {
                alert(`Item Details:\n\nTitle: ${item.title}\nDescription: ${item.description}\nLocation: ${item.location}\nPosted: ${item.date}\nStatus: ${item.status}\nPosted by: ${item.poster}`);
            }
        }

        // Show upload modal
        function showUploadModal() {
            alert('Upload Item Feature\n\nThis would normally open a modal or redirect to an upload form where users can:\n\n• Add photos of the item\n• Provide detailed description\n• Set location where found/lost\n• Choose category\n• Add contact information');
        }

        // Handle navigation
        function handleNavigation(section) {
            switch(section) {
                case 'Home':
                    // Already on home/dashboard
                    break;
                case 'Profile':
                    alert('Profile Page\n\nThis would show:\n• User information\n• Account settings\n• Activity history\n• Notification preferences');
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
                // In a real app, you would redirect to login page
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
        document.addEventListener('DOMContentLoaded', initDashboard);
