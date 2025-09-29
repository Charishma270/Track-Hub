package com.charishma.Track.Hub.service;

import com.charishma.Track.Hub.dto.PostRequest;
import com.charishma.Track.Hub.dto.PostResponse;
import com.charishma.Track.Hub.model.Post;
import com.charishma.Track.Hub.model.User;
import com.charishma.Track.Hub.repo.PostRepository;
import com.charishma.Track.Hub.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    private PostResponse toResponse(Post post) {
        return new PostResponse(post);
    }

    // Create a post and return DTO
    public PostResponse createPost(PostRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + req.getUserId()));

        Post post = new Post();
        post.setUser(user);
        post.setTitle(req.getTitle());
        post.setDescription(req.getDescription());
        post.setLocation(req.getLocation());

        // Convert Base64 to byte[] if provided
        if (req.getPhotoUrl() != null && !req.getPhotoUrl().isBlank()) {
            try {
                String base64 = req.getPhotoUrl().replaceFirst("^data:image/[^;]+;base64,", "");
                byte[] decoded = Base64.getDecoder().decode(base64);
                post.setPhotoUrl(decoded);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid Base64 image data");
            }
        }

        // Status mapping (Post.Status uses LOST/FOUND)
        if (req.getStatus() != null) {
            post.setStatus(Post.Status.valueOf(req.getStatus().toUpperCase()));
        }

        // ContactMethod mapping: enum in Post is defined as lowercase (email, phone, both)
        if (req.getContactPublic() != null) {
            post.setContactPublic(Post.ContactMethod.valueOf(req.getContactPublic().toUpperCase()));

        }



        post.setAdditionalNotes(req.getAdditionalNotes());
        post.setCategory(req.getCategory());

        Post saved = postRepository.save(post);
        return toResponse(saved);
    }

    // Get posts by userId
    public List<PostResponse> getUserPosts(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        return postRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get all posts
    public List<PostResponse> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Delete a post
public void deletePost(Long id) {
    Post post = postRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + id));
    postRepository.delete(post);
}

// Update a post
public PostResponse updatePost(Long id, PostRequest req) {
    Post post = postRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + id));

    // Update fields
    if (req.getTitle() != null) post.setTitle(req.getTitle());
    if (req.getDescription() != null) post.setDescription(req.getDescription());
    if (req.getLocation() != null) post.setLocation(req.getLocation());
    if (req.getCategory() != null) post.setCategory(req.getCategory());
    if (req.getAdditionalNotes() != null) post.setAdditionalNotes(req.getAdditionalNotes());

    // Convert Base64 -> byte[] if provided
    if (req.getPhotoUrl() != null && !req.getPhotoUrl().isBlank()) {
        try {
            String base64 = req.getPhotoUrl().replaceFirst("^data:image/[^;]+;base64,", "");
            byte[] decoded = Base64.getDecoder().decode(base64);
            post.setPhotoUrl(decoded);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Base64 image data");
        }
    }

    // Status
    if (req.getStatus() != null) {
        post.setStatus(Post.Status.valueOf(req.getStatus().toUpperCase()));
    }

    // ContactMethod
    if (req.getContactPublic() != null) {
        post.setContactPublic(Post.ContactMethod.valueOf(req.getContactPublic().toUpperCase()));
    }

    Post saved = postRepository.save(post);
    return new PostResponse(saved);
}

}
