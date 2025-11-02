package com.charishma.Track.Hub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final Logger log = LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void send(SimpleMailMessage mail) {
    try {
        log.info("📨 Sending email to: {}", (mail.getTo() != null ? mail.getTo()[0] : "unknown"));
        log.info("Subject: {}", mail.getSubject());
        log.info("Body: {}", mail.getText());
        mailSender.send(mail);
        log.info("✅ Email successfully sent to {}", (mail.getTo() != null && mail.getTo().length > 0) ? mail.getTo()[0] : "unknown");
    } catch (Exception ex) {
        log.error("❌ Failed to send email", ex);
    }
    
}

}
