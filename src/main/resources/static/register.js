const registerForm = document.getElementById("registerForm");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpInput = document.getElementById("otpInput");
const otpSection = document.getElementById("otpSection");
const registerBtn = document.getElementById("registerBtn");

let otpVerified = false;

// ✅ Step 1: Send OTP to entered phone number
sendOtpBtn.addEventListener("click", async () => {
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();

  if (!phone || phone.length !== 10) {
    alert("Please enter a valid 10-digit phone number!");
    return;
  }

  if (!email.endsWith("@srkrec.ac.in")) {
    alert("Please use your SRKREC college email (e.g., name@srkrec.ac.in)");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone, purpose: "REGISTER" }),
    });

    const text = await res.text();
    alert(text);
    otpSection.style.display = "block";
  } catch (err) {
    alert("Error sending OTP: " + err.message);
  }
});

// ✅ Step 2: Verify OTP
verifyOtpBtn.addEventListener("click", async () => {
  const phone = document.getElementById("phone").value.trim();
  const otp = otpInput.value.trim();

  if (!otp) {
    alert("Enter the OTP first!");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone, otp: otp, purpose: "REGISTER" }),
    });

    const text = await res.text();
    if (text.toLowerCase().includes("success")) {
      otpVerified = true;
      alert("✅ OTP verified! You can now complete registration.");
      registerBtn.disabled = false;
    } else {
      alert("❌ " + text);
    }
  } catch (err) {
    alert("Error verifying OTP: " + err.message);
  }
});

// ✅ Step 3: Register after OTP verified
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!otpVerified) {
    alert("Please verify your phone with OTP first!");
    return;
  }

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phone, password }),
    });

    if (res.ok) {
      const data = await res.json();
      alert("✅ Registration successful! Welcome " + data.firstName);
      window.location.href = "login.html";
    } else {
      const errorText = await res.text();
      alert("❌ Registration failed: " + errorText);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("⚠️ Server error. Please try again later.");
  }
});
