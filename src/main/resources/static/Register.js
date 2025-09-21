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
