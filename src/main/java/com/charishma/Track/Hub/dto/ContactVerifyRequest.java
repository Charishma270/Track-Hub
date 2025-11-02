package com.charishma.Track.Hub.dto;

public class ContactVerifyRequest {
    private String senderName;
    private String senderEmail;
    private String senderPhone;
    private String message; // ✅ renamed from messageText
    private String otp;

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
