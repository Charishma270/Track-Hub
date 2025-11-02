const loginForm = document.getElementById("loginForm");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpInput = document.getElementById("otpInput");
const loginBtn = document.getElementById("loginBtn");
let otpVerified = false;
let fetchedPhone = null;

// ✅ Step 1: Send OTP automatically to registered phone
if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", async () => {
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const phoneRes = await fetch(`http://localhost:8080/api/auth/phone-by-email?email=${encodeURIComponent(email)}`);
        if (!email) {
            alert("Please enter your email first!");
            return;
        }

        try {
            // 🔹 Fetch the phone linked to this email
            const phoneRes = await fetch(`http://localhost:8080/api/auth/phone-by-email?email=${email}`);
            if (!phoneRes.ok) {
                alert("No phone number found for this email!");
                return;
            }
            fetchedPhone = await phoneRes.text();

            // 🔹 Now send OTP to that phone number
            const res = await fetch("http://localhost:8080/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, purpose: "LOGIN" }),
        });


            const text = await res.text();
            alert(text);
            document.getElementById("otpSection").style.display = "block";
        } catch (err) {
            alert("Error sending OTP: " + err.message);
        }
    });
}

// ✅ Step 2: Verify OTP
if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", async () => {
        if (!fetchedPhone) {
            alert("No registered phone found. Please try again.");
            return;
        }

        const otp = otpInput.value.trim();
        if (!otp) {
            alert("Enter OTP first!");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: fetchedPhone, otp: otp, purpose: "LOGIN" }),
            });

            const text = await res.text();
            if (text.toLowerCase().includes("success")) {
                otpVerified = true;
                alert("✅ OTP verified! You can now log in.");
                loginBtn.disabled = false;
            } else {
                alert("❌ " + text);
            }
        } catch (err) {
            alert("Error verifying OTP: " + err.message);
        }
    });
}

// ✅ Step 3: Login only after OTP verified
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!otpVerified) {
            alert("Please verify your email using OTP before login!");
            return;
        }

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userName", data.firstName + " " + data.lastName);
                alert("✅ Login successful! Welcome " + data.firstName);
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
