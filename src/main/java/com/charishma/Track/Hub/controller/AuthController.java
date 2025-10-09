package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.dto.LoginRequest;
import com.charishma.Track.Hub.dto.RegistrationRequest;
import com.charishma.Track.Hub.dto.UserResponse;
import com.charishma.Track.Hub.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class AuthController {

    @Autowired
    private UserService userService;

    // ✅ Register new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest req) {
        try {
            UserResponse res = userService.register(req);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + ex.getMessage());
        }
    }

    // ✅ Login and set session userId
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        try {
            UserResponse res = userService.login(req.getEmail(), req.getPassword());

            // 🔥 Store userId in session for /api/users/me
            session.setAttribute("userId", res.getId());

            return ResponseEntity.ok().body(res);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(401).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + ex.getMessage());
        }
    }

    // ✅ Logout - clears session
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        try {
            session.invalidate();
            return ResponseEntity.ok().body("Logged out successfully");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error during logout: " + ex.getMessage());
        }
    }

    // ✅ Fetch user profile by email (unchanged)
    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestParam String email) {
        try {
            UserResponse res = userService.getProfileByEmail(email);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Server error: " + ex.getMessage());
        }
    }
}
