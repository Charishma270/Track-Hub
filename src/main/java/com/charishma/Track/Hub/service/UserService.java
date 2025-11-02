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
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ Register a new user
    public UserResponse register(RegistrationRequest req) {
        Optional<User> existing = userRepository.findByEmail(req.getEmail());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Email already in use.");
        }

        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setIsVerified(true); // ✅ Assume verified after OTP
        u.setRole("USER");

        User saved = userRepository.save(u);
        return toResponse(saved);
    }

    // ✅ Login verification
    public UserResponse login(String email, String password) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(password, u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return toResponse(u);
    }

    // ✅ Get profile details
    public UserResponse getProfileByEmail(String email) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toResponse(u);
    }

    // ✅ Get phone for a given email (used for OTP sending)
    public String getPhoneByEmail(String email) {
    return userRepository.findByEmailIgnoreCase(email)
            .map(User::getPhone)
            .orElse(null);
}


    // ✅ Helper method to return entity from email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
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
