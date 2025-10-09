package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.model.User;
import com.charishma.Track.Hub.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

/**
 * Simple endpoint to return the "current" user info for client-side autofill.
 * Works with Spring Security (uses principal name/email) OR with a session attribute "userId".
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@SessionAttribute(name = "userId", required = false) Long sessionUserId) {
        // 1) Try Spring Security principal
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
                String username = ((org.springframework.security.core.userdetails.User) auth.getPrincipal()).getUsername();
                // assuming username is email; adjust if your principal stores something else
                Optional<User> uOpt = userRepository.findByEmail(username);
                if (uOpt.isPresent()) {
                    User u = uOpt.get();
                    return ResponseEntity.ok(Map.of(
                        "id", u.getId(),
                        "firstName", u.getFirstName(),
                        "lastName", u.getLastName(),
                        "email", u.getEmail(),
                        "phone", u.getPhone()
                    ));
                }
            }
        } catch (Exception ex) {
            // ignore and fall through to session-based lookup
        }

        // 2) Fallback: session attribute userId
        if (sessionUserId != null) {
            Optional<User> uOpt = userRepository.findById(sessionUserId);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                return ResponseEntity.ok(Map.of(
                    "id", u.getId(),
                    "firstName", u.getFirstName(),
                    "lastName", u.getLastName(),
                    "email", u.getEmail(),
                    "phone", u.getPhone()
                ));
            } else {
                return ResponseEntity.status(404).body("User not found for session userId");
            }
        }

        // 3) not authenticated / no session
        return ResponseEntity.status(204).body(null); // 204 No Content -> client will fall back
    }
}
