package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.dto.ContactRequest;
import com.charishma.Track.Hub.dto.PostDetailResponse;
import com.charishma.Track.Hub.dto.PostRequest;
import com.charishma.Track.Hub.dto.PostResponse;
import com.charishma.Track.Hub.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.charishma.Track.Hub.dto.ClaimRequest;
import com.charishma.Track.Hub.model.Claim;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    // Constructor injection
    public PostController(PostService postService) {
        this.postService = postService;
    }

    // -------------------------
    // Create
    // -------------------------
    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestBody PostRequest req) {
        try {
            PostResponse saved = postService.createPost(req);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating post: " + e.getMessage());
        }
    }

    // -------------------------
    // Read (by user)
    // -------------------------
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPosts(@PathVariable Long userId) {
        try {
            List<PostResponse> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching posts: " + e.getMessage());
        }
    }

    // -------------------------
    // Read (all)
    // -------------------------
    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<PostResponse> posts = postService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching all posts: " + e.getMessage());
        }
    }

    // -------------------------
    // Read (single detail)
    // -------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        try {
            PostDetailResponse dto = postService.getPostDetail(id);
            if (dto == null) {
                return ResponseEntity.status(404).body("Post not found");
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching post: " + e.getMessage());
        }
    }

    // -------------------------
    // Update
    // -------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostRequest req) {
        try {
            PostResponse updated = postService.updatePost(id, req);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating post: " + e.getMessage());
        }
    }

    // -------------------------
    // Delete
    // -------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting post: " + e.getMessage());
        }
    }

    // -------------------------
    // Contact poster (save message + email)
    // -------------------------
    @PostMapping("/{id}/contact")
    public ResponseEntity<?> contactPoster(@PathVariable Long id, @RequestBody ContactRequest req) {
        try {
            boolean ok = postService.contactPoster(id, req);
            if (ok) {
                return ResponseEntity.ok("Message sent (or queued).");
            } else {
                return ResponseEntity.status(404).body("Post not found.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending message: " + e.getMessage());
        }
    }
    // -------------------------
    // Submit claim for found item
    // -------------------------

@PostMapping("/{id}/claim")
public ResponseEntity<?> submitClaim(@PathVariable Long id, @RequestBody ClaimRequest req) {
    try {
        Claim claim = postService.createClaim(id, req);
        return ResponseEntity.ok(claim); // or a simpler message
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error creating claim: " + e.getMessage());
    }
}


}
