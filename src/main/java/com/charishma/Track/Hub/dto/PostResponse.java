package com.charishma.Track.Hub.dto;

import com.charishma.Track.Hub.model.Post;
import java.util.Base64;

public class PostResponse {

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

    public PostResponse(Post post) {
        this.id = post.getId();
        this.userId = post.getUser() != null ? post.getUser().getId() : null;
        this.title = post.getTitle();
        this.description = post.getDescription();
        this.location = post.getLocation();
        this.category = post.getCategory();
        this.status = post.getStatus() != null ? post.getStatus().name() : null;
        this.contactPublic = post.getContactPublic() != null ? post.getContactPublic().name() : null;
        this.additionalNotes = post.getAdditionalNotes();

        if (post.getPhotoUrl() != null && post.getPhotoUrl().length > 0) {
            this.photoUrl = Base64.getEncoder().encodeToString(post.getPhotoUrl());
        } else {
            this.photoUrl = null;
        }
    }

    // Getters (no setters required unless you want them)
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public String getPhotoUrl() { return photoUrl; }
    public String getCategory() { return category; }
    public String getStatus() { return status; }
    public String getContactPublic() { return contactPublic; }
    public String getAdditionalNotes() { return additionalNotes; }
}
