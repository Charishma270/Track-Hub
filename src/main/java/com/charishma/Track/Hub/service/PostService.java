package com.charishma.Track.Hub.service;

import com.charishma.Track.Hub.dto.ContactRequest;
import com.charishma.Track.Hub.dto.PostDetailResponse;
import com.charishma.Track.Hub.dto.PostRequest;
import com.charishma.Track.Hub.dto.PostResponse;
import com.charishma.Track.Hub.model.Message;
import com.charishma.Track.Hub.model.Post;
import com.charishma.Track.Hub.model.User;
import com.charishma.Track.Hub.repo.MessageRepository;
import com.charishma.Track.Hub.repo.PostRepository;
import com.charishma.Track.Hub.repo.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final JavaMailSender mailSender;

    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       MessageRepository messageRepository,
                       JavaMailSender mailSender) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.mailSender = mailSender;
    }

    // -------------------------
    // Helpers
    // -------------------------
    private PostResponse toResponse(Post post) {
        return new PostResponse(post);
    }

    // -------------------------
    // Existing functionality (keeps current behavior)
    // -------------------------

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

        // ContactMethod mapping
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

    // -------------------------
    // New functionality for item.html
    // -------------------------

    /**
     * Return detailed post DTO including poster info and base64 image string.
     * Returns null if not found.
     */
    public PostDetailResponse getPostDetail(Long id) {
        Optional<Post> opt = postRepository.findById(id);
        if (opt.isEmpty()) return null;
        Post p = opt.get();

        PostDetailResponse dto = new PostDetailResponse();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setLocation(p.getLocation());
        dto.setCategory(p.getCategory());
        dto.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        dto.setIsClaimed(p.getIsClaimed());
        dto.setContactPublic(p.getContactPublic() != null ? p.getContactPublic().name() : null);
        dto.setAdditionalNotes(p.getAdditionalNotes());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        // convert photo bytes to base64 string (if present)
        if (p.getPhotoUrl() != null && p.getPhotoUrl().length > 0) {
            String base64 = Base64.getEncoder().encodeToString(p.getPhotoUrl());
            dto.setPhotoBase64(base64);
        }

        // user info
        User u = p.getUser();
        PostDetailResponse.UserInfo userInfo = new PostDetailResponse.UserInfo();
        if (u != null) {
            userInfo.setId(u.getId());
            userInfo.setFirstName(u.getFirstName());
            userInfo.setLastName(u.getLastName());
            userInfo.setEmail(u.getEmail());
            userInfo.setPhone(u.getPhone());
        // ADD createdAt so frontend can display "Member since"
        userInfo.setCreatedAt(u.getCreatedAt());
        Long postedCount = 0L;
    Long returnedCount = 0L;
    try {
        postedCount = postRepository.countByUserId(u.getId());
        returnedCount = postRepository.countByUserIdAndIsClaimedTrue(u.getId());
    } catch (Exception ex) {
        // log and default to 0 if something goes wrong
        ex.printStackTrace();
    }
    userInfo.setItemsPosted(postedCount);
    userInfo.setItemsReturned(returnedCount);

        }
        dto.setUser(userInfo);
        return dto;
    }

    /**
     * Handle contact requests: save Message record and attempt to email the poster
     * Returns true if processed (message saved or email attempted). Returns false if post not found.
     */
    public boolean contactPoster(Long postId, ContactRequest req) {
        Optional<Post> opt = postRepository.findById(postId);
        if (opt.isEmpty()) return false;
        Post post = opt.get();

        // Save message to DB (best-effort)
        try {
            Message msg = new Message();
            msg.setPost(post);
            msg.setSenderName(req.getSenderName());
            msg.setSenderEmail(req.getSenderEmail());
            msg.setSenderPhone(req.getSenderPhone());
            msg.setMessageText(req.getMessage());
            messageRepository.save(msg);
        } catch (Exception e) {
            // log and continue (we'll still try to email)
            e.printStackTrace();
        }

        // Check if email should be sent (EMAIL or BOTH)
        boolean emailAllowed = post.getContactPublic() == null
                || post.getContactPublic().name().equalsIgnoreCase("EMAIL")
                || post.getContactPublic().name().equalsIgnoreCase("BOTH");

        if (emailAllowed && post.getUser() != null && post.getUser().getEmail() != null) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(post.getUser().getEmail());
                mail.setSubject("TrackHub: Message about your item \"" + post.getTitle() + "\"");

                StringBuilder sb = new StringBuilder();
                String posterName = post.getUser().getFirstName() == null ? "" : post.getUser().getFirstName();
                sb.append("Hi ").append(posterName).append(",\n\n");
                sb.append("You have a new message from TrackHub regarding your post: ").append(post.getTitle()).append("\n\n");
                sb.append("Sender: ").append(req.getSenderName()).append("\n");
                sb.append("Email: ").append(req.getSenderEmail()).append("\n");
                if (req.getSenderPhone() != null && !req.getSenderPhone().isBlank()) {
                    sb.append("Phone: ").append(req.getSenderPhone()).append("\n");
                }
                sb.append("\nMessage:\n").append(req.getMessage()).append("\n\n");
                sb.append("--\nThis email was sent by TrackHub.");

                mail.setText(sb.toString());
                mailSender.send(mail);
            } catch (Exception e) {
                // don't fail the request if email fails; message is in DB
                e.printStackTrace();
            }
        }

        return true;
    }
}
