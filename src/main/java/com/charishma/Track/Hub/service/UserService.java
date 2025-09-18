package com.charishma.Track.Hub.service;

import com.charishma.Track.Hub.dto.RegistrationRequest;
import com.charishma.Track.Hub.dto.UserResponse;
import com.charishma.Track.Hub.model.User;
import com.charishma.Track.Hub.repo.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional  // ✅ ensures all DB operations here run in a transaction
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegistrationRequest req) {
        // check if email exists
        Optional<User> existing = userRepository.findByEmail(req.getEmail());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword())); // HASH
        u.setIsVerified(false);
        u.setRole("USER");

        // ✅ now guaranteed to persist because of @Transactional
        User saved = userRepository.save(u);
        return toResponse(saved);
    }

    public UserResponse login(String email, String password) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return toResponse(u);
    }

    private UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setFirstName(u.getFirstName());
        r.setLastName(u.getLastName());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setRole(u.getRole());
        return r;
    }
}
