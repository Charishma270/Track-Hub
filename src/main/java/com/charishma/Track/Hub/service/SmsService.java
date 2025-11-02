package com.charishma.Track.Hub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${msg91.authkey}")
    private String authKey;

    @Value("${msg91.senderid}")
    private String senderId;

    @Value("${msg91.templateid}")
    private String templateId;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendSms(String phone, String otp) {
        String url = "https://control.msg91.com/api/v5/otp";

        Map<String, Object> body = new HashMap<>();
        body.put("template_id", templateId);
        body.put("mobile", "+91" + phone);
        body.put("otp", otp);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("authkey", authKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            logger.info("✅ MSG91 OTP API Response [{}]: {}", response.getStatusCode(), response.getBody());
            return response.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException e) {
            logger.error("❌ MSG91 OTP API error: Status={} Body={}", e.getStatusCode(), e.getResponseBodyAsString());
            logger.warn("⚠️ OTP for {} is {}", phone, otp);
            return false;
        } catch (Exception e) {
            logger.error("❌ Unexpected error while sending OTP: {}", e.getMessage(), e);
            logger.warn("⚠️ OTP for {} is {}", phone, otp);
            return false;
        }
    }
}
