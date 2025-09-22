const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Get values
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        try {
            // Send login request
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                // ✅ Save user info in localStorage for later use
                localStorage.setItem("userId", data.id);                // important for uploads
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userName", data.firstName + " " + data.lastName);

                alert("✅ Login successful! Welcome " + data.firstName);

                // Redirect to dashboard
                window.location.href = "dashboard.html";
            } else {
                const errorText = await response.text();
                alert("❌ Login failed: " + errorText);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("⚠️ Server error. Please try again later.");
        }
    });
}
