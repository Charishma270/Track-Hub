package com.charishma.Track.Hub.repo;

import com.charishma.Track.Hub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // ✅ Optional: Fetch profile by ID
    Optional<User> findById(Long id);
    Optional<User> findByEmailIgnoreCase(String email);
     Optional<User> findByPhone(String phone);
}

