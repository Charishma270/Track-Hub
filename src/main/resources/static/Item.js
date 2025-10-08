        // Initialize the page
        function initLostItem() {
            setupEventListeners();
            setupNavbarScroll();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Contact form submission
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', handleContactSubmission);
            }

            // Navigation links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    const linkText = link.textContent.trim();
                    handleNavigation(linkText);
                });
            });

            // Logout button
            document.querySelector('.btn-outline').addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });

            // Modal close on background click
            const modal = document.getElementById('contactModal');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeContactModal();
                }
            });
        }

        // Change main image when thumbnail is clicked
        function changeImage(thumbnail) {
            const mainImage = document.getElementById('mainImage');
            const allThumbnails = document.querySelectorAll('.thumbnail');
            
            // Remove active class from all thumbnails
            allThumbnails.forEach(thumb => thumb.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            
            // Change main image source
            mainImage.src = thumbnail.src.replace('w=100&h=100', 'w=600&h=400');
        }

        // Open contact modal
        function openContactModal() {
            const modal = document.getElementById('contactModal');
            modal.classList.add('active');
        }

        // Close contact modal
        function closeContactModal() {
            const modal = document.getElementById('contactModal');
            modal.classList.remove('active');
            
            // Reset form
            const form = document.getElementById('contactForm');
            form.reset();
        }

        // Handle contact form submission
        function handleContactSubmission(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const senderName = formData.get('senderName');
            const senderEmail = formData.get('senderEmail');
            const message = formData.get('message');
            
            // Basic validation
            if (!senderName || !senderEmail || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Simulate sending message
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                alert(`Message sent successfully to Sarah Johnson!\n\nYour message: "${message}"\n\nSarah will receive your contact information and message. You should hear back within 24 hours.`);
                closeContactModal();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        }

        // Claim item function
        function claimItem() {
            const confirmation = confirm('Are you sure this is your item?\n\nBy claiming this item, you confirm that:\n• This item belongs to you\n• You can provide additional verification if requested\n• You will arrange pickup with the finder\n\nProceed with claim?');
            
            if (confirmation) {
                alert('Claim submitted!\n\nYour claim has been sent to Sarah Johnson. Please be prepared to:\n\n• Provide additional identifying details\n• Show student ID for verification\n• Arrange a safe meetup location\n\nSarah will contact you shortly to verify ownership and arrange pickup.');
            }
        }

        // View poster profile
        function viewPosterProfile() {
            alert('Sarah Johnson\'s Profile\n\n📊 Statistics:\n• 15 items posted\n• 12 items successfully returned\n• 4.9/5 average rating\n• Member since January 2024\n\n🎓 Student Information:\n• Computer Science Major\n• Junior Year\n• Active community member\n\n⭐ Recent Reviews:\n"Very helpful and responsive!" - Mike\n"Quick to respond and easy to coordinate with" - Emma\n"Genuine person, item was exactly as described" - Alex');
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
                    window.location.href = 'MyPosts.html';
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
        document.addEventListener('DOMContentLoaded', initLostItem);