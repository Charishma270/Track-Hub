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

                // ✅ Store email in localStorage so profile.js knows user is logged in
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userName", data.firstName + " " + data.lastName); // optional

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
