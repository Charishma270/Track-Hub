package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.dto.*;
import com.charishma.Track.Hub.model.Claim;
import com.charishma.Track.Hub.service.OtpService;
import com.charishma.Track.Hub.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final OtpService otpService;

    public PostController(PostService postService, OtpService otpService) {
        this.postService = postService;
        this.otpService = otpService;
    }

    /* ------------------------------------------
       Create a new post
    ------------------------------------------ */
    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestBody PostRequest req) {
        try {
            PostResponse saved = postService.createPost(req);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post created successfully!",
                "data", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error creating post: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Get posts by user ID
    ------------------------------------------ */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPosts(@PathVariable Long userId) {
        try {
            List<PostResponse> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "data", posts
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error fetching user posts: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Get all posts (sorted by date DESC)
    ------------------------------------------ */
    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<PostResponse> posts = postService.getAllPostsSortedByDateDesc();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "data", posts
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error fetching all posts: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Get post details by ID
    ------------------------------------------ */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        try {
            PostDetailResponse dto = postService.getPostDetail(id);
            if (dto == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "status", "error",
                    "message", "Post not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "data", dto
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error fetching post: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Update a post
    ------------------------------------------ */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostRequest req) {
        try {
            PostResponse updated = postService.updatePost(id, req);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post updated successfully!",
                "data", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error updating post: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Delete a post
    ------------------------------------------ */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post deleted successfully!"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error deleting post: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Step 1: Initiate contact (Generate OTP)
    ------------------------------------------ */
    @PostMapping("/{id}/contact/initiate")
    public ResponseEntity<?> initiateContact(@PathVariable Long id, @RequestBody ContactRequest req) {
        try {
            if (!postService.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of(
                    "status", "error",
                    "message", "Post not found"
                ));
            }

            String otp = otpService.createOtpForPhone(req.getSenderPhone(), "CONTACT");
            otpService.sendOtp(req.getSenderPhone(), otp);

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "OTP sent to your registered phone number."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error initiating contact: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Step 2: Verify OTP and Send Email
    ------------------------------------------ */
    @PostMapping("/{id}/contact/verify")
    public ResponseEntity<?> verifyContactOtp(@PathVariable Long id, @RequestBody ContactVerifyRequest req) {
        try {
            boolean valid = otpService.verifyOtp(req.getSenderPhone(), req.getOtp(), "CONTACT");
            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Invalid or expired OTP."
                ));
            }

            boolean sent = postService.contactPoster(id, req);
            if (sent) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Message sent successfully to post owner."
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "error",
                    "message", "Post not found."
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error verifying OTP: " + e.getMessage()
            ));
        }
    }

    /* ------------------------------------------
       Submit claim for found item
    ------------------------------------------ */
    @PostMapping("/{id}/claim")
    public ResponseEntity<?> submitClaim(@PathVariable Long id, @RequestBody ClaimRequest req) {
        try {
            Claim claim = postService.createClaim(id, req);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Claim submitted successfully!",
                "data", claim
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Error creating claim: " + e.getMessage()
            ));
        }
    }
}
