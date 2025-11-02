package com.charishma.Track.Hub.dto;

public class ContactVerifyRequest {
    private String senderName;
    private String senderEmail;
    private String senderPhone;
    private String messageText;
    private String otp;

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
