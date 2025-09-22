package com.charishma.Track.Hub.controller;

import com.charishma.Track.Hub.dto.PostRequest;
import com.charishma.Track.Hub.dto.PostResponse;
import com.charishma.Track.Hub.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

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
}
