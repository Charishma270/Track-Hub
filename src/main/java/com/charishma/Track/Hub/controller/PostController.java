package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.dto.*;
import com.charishma.Track.Hub.model.Claim;
import com.charishma.Track.Hub.service.OtpService;
import com.charishma.Track.Hub.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.charishma.Track.Hub.dto.ContactVerifyRequest;


import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final OtpService otpService;

    // Constructor injection
    public PostController(PostService postService, OtpService otpService) {
        this.postService = postService;
        this.otpService = otpService;
    }

    // -------------------------
    // Create a new post
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
    // Get posts by a specific user
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
    // Get all posts (newest first)
    // -------------------------
    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts() {
        try {
            // ✅ Now retrieves posts in DESCENDING order (freshest first)
            List<PostResponse> posts = postService.getAllPostsSortedByDateDesc();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching all posts: " + e.getMessage());
        }
    }

    // -------------------------
    // Get post details by ID
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
    // Update a post
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
    // Delete a post
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
    // Step 1: Initiate Contact (Generate OTP)
    // -------------------------
    @PostMapping("/{id}/contact/initiate")
    public ResponseEntity<?> initiateContact(@PathVariable Long id, @RequestBody ContactRequest req) {
        try {
            boolean postExists = postService.existsById(id);
            if (!postExists) {
                return ResponseEntity.status(404).body("Post not found");
            }

            // Generate OTP for contact verification
            String otp = otpService.createOtpForPhone(req.getSenderPhone(), "CONTACT");

            // Send OTP via SMS or fallback email
            otpService.sendOtp(req.getSenderPhone(), otp);

            return ResponseEntity.ok("OTP sent to your registered phone number.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error initiating contact: " + e.getMessage());
        }
    }

    // -------------------------
    // Step 2: Verify OTP and Send Contact Email
    // -------------------------
    @PostMapping("/{id}/contact/verify")
    public ResponseEntity<?> verifyContactOtp(@PathVariable Long id, @RequestBody ContactVerifyRequest req) {
        try {
            boolean valid = otpService.verifyOtp(req.getSenderPhone(), req.getOtp(), "CONTACT");
            if (!valid) {
                return ResponseEntity.badRequest().body("Invalid or expired OTP.");
            }

            boolean sent = postService.contactPoster(id, req);
            if (sent) {
                return ResponseEntity.ok("Message sent successfully to post owner.");
            } else {
                return ResponseEntity.status(404).body("Post not found.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying OTP: " + e.getMessage());
        }
    }

    // -------------------------
    // Submit claim for a found item
    // -------------------------
    @PostMapping("/{id}/claim")
    public ResponseEntity<?> submitClaim(@PathVariable Long id, @RequestBody ClaimRequest req) {
        try {
            Claim claim = postService.createClaim(id, req);
            return ResponseEntity.ok(claim);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating claim: " + e.getMessage());
        }
    }
}
