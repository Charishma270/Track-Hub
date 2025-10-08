package com.charishma.Track.Hub.dto;

public class ClaimRequest {
    private String claimerName;
    private String claimerEmail;
    private String claimerPhone;
    private String claimReason; // optional

    // getters/setters
    public String getClaimerName() { return claimerName; }
    public void setClaimerName(String claimerName) { this.claimerName = claimerName; }
    public String getClaimerEmail() { return claimerEmail; }
    public void setClaimerEmail(String claimerEmail) { this.claimerEmail = claimerEmail; }
    public String getClaimerPhone() { return claimerPhone; }
    public void setClaimerPhone(String claimerPhone) { this.claimerPhone = claimerPhone; }
    public String getClaimReason() { return claimReason; }
    public void setClaimReason(String claimReason) { this.claimReason = claimReason; }
}
