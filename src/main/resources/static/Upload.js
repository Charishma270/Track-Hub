
        // DOM Elements
        const uploadForm = document.getElementById('uploadForm');
        const photoUpload = document.getElementById('photoUpload');
        const photoInput = document.getElementById('photoInput');
        const photoPreview = document.getElementById('photoPreview');
        const previewImage = document.getElementById('previewImage');
        const locationToggle = document.getElementById('locationToggle');
        const locationInfo = document.getElementById('locationInfo');
        const locationDetails = document.getElementById('locationDetails');
        const successMessage = document.getElementById('successMessage');
        const cancelBtn = document.getElementById('cancelBtn');

        // Initialize the upload page
        function initUpload() {
            setupEventListeners();
            setupNavbarScroll();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Photo upload functionality
            photoUpload.addEventListener('click', () => {
                photoInput.click();
            });

            photoUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                photoUpload.classList.add('dragover');
            });

            photoUpload.addEventListener('dragleave', () => {
                photoUpload.classList.remove('dragover');
            });

            photoUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                photoUpload.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileSelect(files[0]);
                }
            });

            photoInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                }
            });

            // Location toggle
            locationToggle.addEventListener('click', () => {
                locationToggle.classList.toggle('active');
                if (locationToggle.classList.contains('active')) {
                    locationInfo.classList.add('active');
                    requestLocation();
                } else {
                    locationInfo.classList.remove('active');
                }
            });

            // Form submission
            uploadForm.addEventListener('submit', handleFormSubmit);

            // Cancel button
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? All entered information will be lost.')) {
                    window.location.href = 'dashboard.html';
                }
            });

            // Navigation links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
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

        // Handle file selection
        function handleFileSelect(file) {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    photoPreview.style.display = 'block';
                    
                    // Update upload area
                    photoUpload.innerHTML = `
                        <div class="upload-icon">✅</div>
                        <div class="upload-text">Photo uploaded successfully</div>
                        <div class="upload-subtext">Click to change photo</div>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select a valid image file.');
            }
        }

        // Request user location
        function requestLocation() {
            if (navigator.geolocation) {
                locationDetails.textContent = 'Getting your location...';
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude.toFixed(6);
                        const lng = position.coords.longitude.toFixed(6);
                        locationDetails.innerHTML = `
                            <strong>Coordinates:</strong> ${lat}, ${lng}<br>
                            <small>This location will be shared with the item owner for meetup coordination</small>
                        `;
                    },
                    (error) => {
                        locationDetails.innerHTML = `
                            <span style="color: #dc2626;">Location access denied or unavailable</span><br>
                            <small>You can still post the item without location sharing</small>
                        `;
                    }
                );
            } else {
                locationDetails.innerHTML = `
                    <span style="color: #dc2626;">Geolocation is not supported by this browser</span>
                `;
            }
        }

        // Handle form submission
        function handleFormSubmit(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(uploadForm);
            const itemName = formData.get('itemName');
            const category = formData.get('category');
            const description = formData.get('description');
            const foundLocation = formData.get('foundLocation');
            const contactMethod = formData.get('contactMethod');
            
            // Basic validation
            if (!itemName || !category || !description || !foundLocation || !contactMethod) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!photoInput.files.length) {
                alert('Please upload a photo of the item.');
                return;
            }
            
            // Simulate form submission
            const submitButton = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Posting Item...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                // Show success message
                successMessage.style.display = 'block';
                uploadForm.style.display = 'none';
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Reset form after delay
                setTimeout(() => {
                    if (confirm('Item posted successfully! Would you like to post another item?')) {
                        // Reset form
                        uploadForm.reset();
                        photoPreview.style.display = 'none';
                        locationToggle.classList.remove('active');
                        locationInfo.classList.remove('active');
                        photoUpload.innerHTML = `
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Click to upload or drag and drop</div>
                            <div class="upload-subtext">PNG, JPG, GIF up to 10MB</div>
                        `;
                        
                        successMessage.style.display = 'none';
                        uploadForm.style.display = 'block';
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 3000);
            }, 2000);
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
                    alert('My Posts Page\n\nThis would show your posted items with options to edit or delete them.');
                    break;
            }
        }

        // Handle logout
        function handleLogout() {
            if (confirm('Are you sure you want to logout? Any unsaved changes will be lost.')) {
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
        document.addEventListener('DOMContentLoaded', initUpload);
