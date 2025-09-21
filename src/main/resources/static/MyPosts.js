
        // Sample data for user's posts
        const userPosts = [
            {
                id: 1,
                title: "iPhone 13 Pro",
                description: "Black iPhone 13 Pro found near the library entrance. Has a blue case with initials 'JS' on the back. Screen protector is slightly cracked on the top right corner.",
                image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Main Library",
                date: "2 hours ago",
                status: "active",
                category: "electronics",
                messages: 5,
                views: 23
            },
            {
                id: 2,
                title: "Red Backpack",
                description: "Found a red Jansport backpack containing textbooks and a laptop charger. Last seen in the cafeteria during lunch break. Has a small keychain attached.",
                image: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Student Cafeteria",
                date: "1 day ago",
                status: "resolved",
                category: "accessories",
                messages: 3,
                views: 45
            },
            {
                id: 3,
                title: "Silver Watch",
                description: "Found a silver Casio watch in the gym locker room. Has some scratches on the band but still works perfectly. Looks like it might be engraved on the back.",
                image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Sports Complex",
                date: "3 days ago",
                status: "active",
                category: "accessories",
                messages: 2,
                views: 18
            },
            {
                id: 4,
                title: "Chemistry Textbook",
                description: "Found Organic Chemistry textbook (3rd edition) with lots of highlighted notes and bookmarks. Has someone's name written inside the front cover.",
                image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Science Building",
                date: "1 week ago",
                status: "expired",
                category: "books",
                messages: 1,
                views: 12
            },
            {
                id: 5,
                title: "Blue Denim Jacket",
                description: "Found a blue denim jacket hanging in the computer lab. Size medium, has a small pin collection on the left side. Looks like it's been there for a while.",
                image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Computer Lab",
                date: "2 weeks ago",
                status: "resolved",
                category: "clothing",
                messages: 4,
                views: 31
            },
            {
                id: 6,
                title: "Black Wallet",
                description: "Found a black leather wallet near the parking lot. Contains some cards and cash. Trying to find the rightful owner - please provide identification details.",
                image: "https://images.pexels.com/photos/164571/pexels-photo-164571.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                location: "📍 Parking Lot B",
                date: "3 weeks ago",
                status: "active",
                category: "accessories",
                messages: 7,
                views: 67
            }
        ];

        // Sample messages data
        const messagesData = {
            1: [
                {
                    sender: "Mike Johnson",
                    time: "2 hours ago",
                    message: "Hi! I think this might be my iPhone. I lost it yesterday near the library. The initials 'JS' are actually 'MJ' - Mike Johnson. Can we meet up?"
                },
                {
                    sender: "Sarah Davis",
                    time: "1 hour ago",
                    message: "Is this still available? I lost my phone in that area too. Mine has a crack in the same spot!"
                },
                {
                    sender: "Alex Chen",
                    time: "30 minutes ago",
                    message: "I can provide more details about the phone if needed. When would be a good time to meet?"
                }
            ],
            2: [
                {
                    sender: "Emma Wilson",
                    time: "1 day ago",
                    message: "Thank you so much for finding my backpack! This is definitely mine. When can I pick it up?"
                },
                {
                    sender: "Emma Wilson",
                    time: "1 day ago",
                    message: "I can meet you at the cafeteria anytime today. My student ID is EW2024."
                }
            ],
            3: [
                {
                    sender: "David Park",
                    time: "2 days ago",
                    message: "I think this is my watch! I lost it in the gym last week. It has my initials 'DP' engraved on the back."
                }
            ]
        };

        let currentFilter = 'all';
        let filteredPosts = [...userPosts];

        // DOM Elements
        const postsGrid = document.getElementById('postsGrid');
        const filterTabs = document.querySelectorAll('.tab-btn');
        const messagesModal = document.getElementById('messagesModal');

        // Initialize the page
        function initMyPosts() {
            renderPosts();
            setupEventListeners();
            setupNavbarScroll();
        }

        // Render posts to the grid
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

            postsGrid.innerHTML = filteredPosts.map(post => `
                <div class="post-card" data-status="${post.status}">
                    <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy">
                    <div class="post-content">
                        <div class="post-header">
                            <div>
                                <h3 class="post-title">${post.title}</h3>
                                <span class="post-status status-${post.status}">
                                    ${getStatusText(post.status)}
                                </span>
                            </div>
                        </div>
                        <p class="post-description">${post.description}</p>
                        <div class="post-meta">
                            <span class="post-location">${post.location}</span>
                            <span>${post.date}</span>
                        </div>
                        <div class="post-meta">
                            <span>👁️ ${post.views} views</span>
                            <span class="messages-indicator">
                                💬 ${post.messages} messages
                                ${post.messages > 0 ? `<span class="message-badge">${post.messages}</span>` : ''}
                            </span>
                        </div>
                        <div class="post-actions">
                            <button class="btn btn-secondary btn-small" onclick="editPost(${post.id})">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-primary btn-small" onclick="viewMessages(${post.id})" ${post.messages === 0 ? 'disabled' : ''}>
                                💬 Messages (${post.messages})
                            </button>
                            <button class="btn btn-success btn-small" onclick="markAsResolved(${post.id})" ${post.status === 'resolved' ? 'disabled' : ''}>
                                ✅ Mark Resolved
                            </button>
                            <button class="btn btn-danger btn-small" onclick="deletePost(${post.id})">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Get status text
        function getStatusText(status) {
            switch(status) {
                case 'active': return '🔍 Active';
                case 'resolved': return '✅ Resolved';
                case 'expired': return '⏰ Expired';
                default: return status;
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Filter tabs
            filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    filterTabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Filter posts
                    const filter = tab.dataset.filter;
                    filterPosts(filter);
                });
            });

            // Navigation links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === '#') {
                        e.preventDefault();
                        // Remove active class from all nav links
                        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                        // Add active class to clicked link
                        link.classList.add('active');
                        
                        // Handle navigation
                        const linkText = link.textContent.trim();
                        handleNavigation(linkText);
                    }
                });
            });

            // Logout button
            document.querySelector('.btn-outline').addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });

            // Modal close on background click
            messagesModal.addEventListener('click', (e) => {
                if (e.target === messagesModal) {
                    closeModal();
                }
            });
        }

        // Filter posts
        function filterPosts(filter) {
            currentFilter = filter;
            
            if (filter === 'all') {
                filteredPosts = [...userPosts];
            } else {
                filteredPosts = userPosts.filter(post => post.status === filter);
            }
            
            renderPosts();
        }

        // Edit post function
        function editPost(postId) {
            const post = userPosts.find(p => p.id === postId);
            if (post) {
                alert(`Edit Post: "${post.title}"\n\nThis would normally open an edit form with:\n• Item name and description\n• Category selection\n• Photo upload\n• Location details\n• Status updates`);
            }
        }

        // View messages function
        function viewMessages(postId) {
            const post = userPosts.find(p => p.id === postId);
            const messages = messagesData[postId] || [];
            
            if (post && messages.length > 0) {
                const messagesContent = document.getElementById('messagesContent');
                messagesContent.innerHTML = `
                    <h4 style="margin-bottom: 16px; color: #1f2937;">Messages for "${post.title}"</h4>
                    ${messages.map(msg => `
                        <div class="message-item">
                            <div class="message-header">
                                <span class="message-sender">${msg.sender}</span>
                                <span class="message-time">${msg.time}</span>
                            </div>
                            <div class="message-text">${msg.message}</div>
                        </div>
                    `).join('')}
                `;
                messagesModal.classList.add('active');
            } else {
                alert('No messages yet for this item.');
            }
        }

        // Mark as resolved function
        function markAsResolved(postId) {
            const postIndex = userPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                if (confirm('Mark this item as resolved? This means the item has been successfully returned to its owner.')) {
                    userPosts[postIndex].status = 'resolved';
                    filterPosts(currentFilter);
                    alert('Item marked as resolved! Great job helping someone find their lost item.');
                }
            }
        }

        // Delete post function
        function deletePost(postId) {
            const post = userPosts.find(p => p.id === postId);
            if (post) {
                if (confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
                    const postIndex = userPosts.findIndex(p => p.id === postId);
                    userPosts.splice(postIndex, 1);
                    filterPosts(currentFilter);
                    alert('Post deleted successfully.');
                }
            }
        }

        // Close modal function
        function closeModal() {
            messagesModal.classList.remove('active');
            document.getElementById('replyText').value = '';
        }

        // Send reply function
        function sendReply() {
            const replyText = document.getElementById('replyText').value.trim();
            if (replyText) {
                alert(`Reply sent: "${replyText}"\n\nThis would normally:\n• Send the message to the interested user\n• Add it to the conversation thread\n• Notify the recipient via email/SMS`);
                closeModal();
            } else {
                alert('Please enter a reply message.');
            }
        }

        // Handle navigation
        function handleNavigation(section) {
            switch(section) {
                case 'Home':
                    window.location.href = 'dashboard.html';
                    break;
                case 'Profile':
                    window.location.href = 'profile.html';
                    break;
                case 'My Posts':
                    // Already on My Posts page
                    break;
            }
        }

        // Handle logout
        function handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                alert('Logging out...');
                window.location.href = 'login.html';
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
        document.addEventListener('DOMContentLoaded', initMyPosts);