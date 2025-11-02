package com.charishma.Track.Hub.service;

import com.charishma.Track.Hub.model.Otp;
import com.charishma.Track.Hub.repo.OtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.charishma.Track.Hub.repo.UserRepository;
import com.charishma.Track.Hub.model.User;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private final Random secureRandom = new SecureRandom();

    @Value("${app.otp.expiry.minutes:5}")
    private int otpExpiryMinutes;

   public OtpService(OtpRepository otpRepository,
                  SmsService smsService,
                  UserRepository userRepository,
                  EmailService emailService) {
    this.otpRepository = otpRepository;
    this.userRepository = userRepository;
    this.emailService = emailService;
}



    @Transactional
    public String createOtpForPhone(String phone, String purpose) {
        String code = generateNumericOtp(6);

        Otp otp = new Otp();
        otp.setPhone(phone);
        otp.setOtpCode(code);
        otp.setPurpose(purpose);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otp.setUsed(false);
        otpRepository.save(otp);

        logger.info("📱 Created OTP {} for phone {} (purpose {}, expires {})", code, phone, purpose, otp.getExpiresAt());
        return code;
    }

    public boolean sendOtp(String phone, String otpCode) {
    try {
        // Find the user's email linked to this phone number
        Optional<User> userOpt = userRepository.findByPhone(phone);
        if (userOpt.isEmpty()) {
            logger.warn("❌ No user found with phone {}", phone);
            return false;
        }

        String email = userOpt.get().getEmail();

        // Send OTP via email instead of SMS
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("TrackHub OTP Verification");
        mail.setText("Your OTP for TrackHub is: " + otpCode + "\nThis OTP is valid for " 
                    + otpExpiryMinutes + " minutes.\n\n-- TrackHub Team");

        emailService.send(mail);
        logger.info("✅ OTP sent to email: {}", email);
        return true;

    } catch (Exception e) {
        logger.error("❌ Failed to send OTP to email for phone {}", phone, e);
        return false;
    }
}

    @Transactional
    public boolean verifyOtp(String phone, String code, String purpose) {
        Optional<Otp> opt = otpRepository.findTopByPhoneAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(phone, purpose);
        if (opt.isEmpty()) {
            logger.warn("No OTP found for {} purpose {}", phone, purpose);
            return false;
        }

        Otp otp = opt.get();

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.warn("OTP expired for {}", phone);
            return false;
        }

        if (!otp.getOtpCode().equals(code)) {
            logger.warn("OTP mismatch for {}", phone);
            return false;
        }

        otp.setUsed(true);
        otpRepository.save(otp);
        logger.info("✅ OTP verified successfully for {}", phone);
        return true;
    }

    private String generateNumericOtp(int digits) {
        int min = (int) Math.pow(10, digits - 1);
        int max = (int) Math.pow(10, digits) - 1;
        return String.valueOf(secureRandom.nextInt(max - min + 1) + min);
    }

    public String createToken() {
        return UUID.randomUUID().toString();
    }
}
