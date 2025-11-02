package com.charishma.Track.Hub.repo;

import com.charishma.Track.Hub.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    // Find the most recent non-used OTP for a phone + purpose
    Optional<Otp> findTopByPhoneAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(String phone, String purpose);

    // Optional: by user id + purpose
    Optional<Otp> findTopByUserIdAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(Long userId, String purpose);
}
