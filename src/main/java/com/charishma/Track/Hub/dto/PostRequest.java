package com.charishma.Track.Hub.dto;

import com.charishma.Track.Hub.model.Post;
import java.util.Base64;

public class PostRequest {

    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String location;
    private String photoUrl; // Base64 string
    private String category;
    private String status;
    private String contactPublic;
    private String additionalNotes;

    // ✅ Factory method to convert Post -> PostResponse
    public static PostRequest fromEntity(Post post) {
        PostRequest res = new PostRequest();
        res.setId(post.getId());
        res.setUserId(post.getUser().getId());
        res.setTitle(post.getTitle());
        res.setDescription(post.getDescription());
        res.setLocation(post.getLocation());

        // Convert byte[] -> Base64 string for frontend
        if (post.getPhotoUrl() != null) {
            res.setPhotoUrl("data:image/png;base64," + Base64.getEncoder().encodeToString(post.getPhotoUrl()));
        }

        res.setCategory(post.getCategory());
        res.setStatus(post.getStatus().name());
        res.setContactPublic(post.getContactPublic().name());
        res.setAdditionalNotes(post.getAdditionalNotes());
        return res;
    }

    // ✅ Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getContactPublic() { return contactPublic; }
    public void setContactPublic(String contactPublic) { this.contactPublic = contactPublic; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
}
