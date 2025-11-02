package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.dto.LoginRequest;
import com.charishma.Track.Hub.dto.RegistrationRequest;
import com.charishma.Track.Hub.dto.UserResponse;
import com.charishma.Track.Hub.model.User;
import com.charishma.Track.Hub.service.OtpService;
import com.charishma.Track.Hub.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
        allowCredentials = "true"
)
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    // ✅ Step 1: Send OTP (for REGISTER or LOGIN)
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> req) {
        try {
            String email = req.get("email");
            String phone = req.get("phone"); // may be null in LOGIN
            String purpose = req.get("purpose");

            if (purpose == null) {
                return ResponseEntity.badRequest().body("Purpose is required (REGISTER or LOGIN)");
            }

            // 🔹 LOGIN: fetch phone automatically from user’s email
            if ("LOGIN".equalsIgnoreCase(purpose)) {
                if (email == null) return ResponseEntity.badRequest().body("Email is required for login OTP");
                User user = userService.findByEmail(email);
                if (user == null)
                    return ResponseEntity.status(404).body("No user found with this email.");

                phone = user.getPhone();
                if (phone == null || phone.isBlank())
                    return ResponseEntity.status(400).body("User does not have a registered phone.");
            }

            // 🔹 REGISTER: must include phone manually
            else if ("REGISTER".equalsIgnoreCase(purpose)) {
                if (phone == null || phone.isBlank())
                    return ResponseEntity.badRequest().body("Phone number is required for registration OTP.");
            }

            String otp = otpService.createOtpForPhone(phone, purpose);
            otpService.sendOtp(phone, otp);
            return ResponseEntity.ok("✅ OTP sent successfully to your registered phone (" + phone + ").");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending OTP: " + e.getMessage());
        }
    }

    // ✅ Step 2: Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> req) {
        try {
            String phone = req.get("phone");
            String otp = req.get("otp");
            String purpose = req.get("purpose");

            if (phone == null || otp == null || purpose == null)
                return ResponseEntity.badRequest().body("phone, otp, and purpose are required.");

            boolean valid = otpService.verifyOtp(phone, otp, purpose);
            if (!valid)
                return ResponseEntity.badRequest().body("Invalid or expired OTP.");

            return ResponseEntity.ok("OTP verified successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying OTP: " + e.getMessage());
        }
    }

    // ✅ Step 3: Register new user (college email enforced)
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest req) {
        try {
            // Enforce SRKREC email format
            if (!req.getEmail().toLowerCase().endsWith("@srkrec.ac.in")) {
                return ResponseEntity.badRequest().body("Please use your SRKREC college email (e.g., name@srkrec.ac.in)");
            }

            // Ensure phone exists
            if (req.getPhone() == null || req.getPhone().isBlank()) {
                return ResponseEntity.badRequest().body("Phone number is required.");
            }

            UserResponse res = userService.register(req);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + ex.getMessage());
        }
    }

    // ✅ Step 4: Login user (OTP verified first)
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        try {
            if (!req.getEmail().toLowerCase().endsWith("@srkrec.ac.in")) {
                return ResponseEntity.badRequest().body("Only SRKREC college emails are allowed.");
            }

            UserResponse res = userService.login(req.getEmail(), req.getPassword());
            session.setAttribute("userId", res.getId());
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(401).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + ex.getMessage());
        }
    }

    // ✅ Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        try {
            session.invalidate();
            return ResponseEntity.ok("Logged out successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during logout: " + e.getMessage());
        }
    }

    // ✅ Fetch user profile
    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestParam String email) {
        try {
            UserResponse res = userService.getProfileByEmail(email);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + ex.getMessage());
        }
    }

    // ✅ Fetch registered phone number (used by frontend to auto-send OTP)
    @GetMapping("/phone-by-email")
    public ResponseEntity<?> getPhoneByEmail(@RequestParam String email) {
        System.out.println("📩 DEBUG: Received email from frontend = [" + email + "]");
        try {
            String phone = userService.getPhoneByEmail(email);
            if (phone == null) {
                return ResponseEntity.status(404).body("No phone found for this email.");
            }
            return ResponseEntity.ok(phone);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching phone: " + e.getMessage());
        }
    }
}
