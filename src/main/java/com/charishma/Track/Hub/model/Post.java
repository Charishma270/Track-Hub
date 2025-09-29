package com.charishma.Track.Hub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Link each post to a user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String location;

    // ✅ Store image as BLOB instead of LONGTEXT
    @Lob
    @Column(name = "photo_url", columnDefinition = "LONGBLOB")
    private byte[] photoUrl;

    // ✅ Category field
    @Column(nullable = false, length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.FOUND;

    private Boolean isClaimed = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_public", nullable = false)
    private ContactMethod contactPublic = ContactMethod.EMAIL;

    @Column(columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;

    // ===== Enums =====
    public enum Status { LOST, FOUND }
    public enum ContactMethod { EMAIL, PHONE, BOTH}


    // ===== Lifecycle Hooks =====
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public byte[] getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(byte[] photoUrl) { this.photoUrl = photoUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Boolean getIsClaimed() { return isClaimed; }
    public void setIsClaimed(Boolean isClaimed) { this.isClaimed = isClaimed; }

    public ContactMethod getContactPublic() { return contactPublic; }
    public void setContactPublic(ContactMethod contactPublic) { this.contactPublic = contactPublic; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
