package com.charishma.Track.Hub.dto;

import java.time.LocalDateTime;

public class PostDetailResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private String photoBase64; // base64 data URL (without prefix)
    private String category;
    private String status;
    private Boolean isClaimed;
    private String contactPublic;
    private String additionalNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // nested poster info
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDateTime createdAt;  // 👈 ADD THIS FIELD

        
        // getters/setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    private UserInfo user;

    // getters & setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhotoBase64() { return photoBase64; }
    public void setPhotoBase64(String photoBase64) { this.photoBase64 = photoBase64; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsClaimed() { return isClaimed; }
    public void setIsClaimed(Boolean isClaimed) { this.isClaimed = isClaimed; }

    public String getContactPublic() { return contactPublic; }
    public void setContactPublic(String contactPublic) { this.contactPublic = contactPublic; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
}
