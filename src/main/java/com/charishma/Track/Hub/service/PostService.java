package com.charishma.Track.Hub.service;

import com.charishma.Track.Hub.dto.ClaimRequest;
import com.charishma.Track.Hub.dto.ContactRequest;
import com.charishma.Track.Hub.dto.PostDetailResponse;
import com.charishma.Track.Hub.dto.PostRequest;
import com.charishma.Track.Hub.dto.PostResponse;
import com.charishma.Track.Hub.model.Claim;
import com.charishma.Track.Hub.model.Message;
import com.charishma.Track.Hub.model.Post;
import com.charishma.Track.Hub.model.User;
import com.charishma.Track.Hub.repo.ClaimRepository;
import com.charishma.Track.Hub.repo.MessageRepository;
import com.charishma.Track.Hub.repo.PostRepository;
import com.charishma.Track.Hub.repo.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

/**
 * Service responsible for post-related business logic including:
 * - creating/updating/deleting posts
 * - returning detailed post DTOs for Item.html
 * - saving contact messages and sending email notifications
 * - creating claims and notifying poster
 *
 * Uses EmailService for async email sending.
 */
@Service
@Transactional
public class PostService {

    private static final Logger LOG = LoggerFactory.getLogger(PostService.class);

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ClaimRepository claimRepository;
    private final EmailService emailService; // async email sender

    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       MessageRepository messageRepository,
                       ClaimRepository claimRepository,
                       EmailService emailService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.claimRepository = claimRepository;
        this.emailService = emailService;
    }

    /* -------------------------
       Helpers
       ------------------------- */
    private PostResponse toResponse(Post post) {
        return new PostResponse(post);
    }

    /* -------------------------
       CRUD
       ------------------------- */

    public PostResponse createPost(PostRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + req.getUserId()));

        Post post = new Post();
        post.setUser(user);
        post.setTitle(req.getTitle());
        post.setDescription(req.getDescription());
        post.setLocation(req.getLocation());
        post.setCategory(req.getCategory());
        post.setAdditionalNotes(req.getAdditionalNotes());

        // decode base64 image if provided
        if (req.getPhotoUrl() != null && !req.getPhotoUrl().isBlank()) {
            try {
                String base64 = req.getPhotoUrl().replaceFirst("^data:image/[^;]+;base64,", "");
                post.setPhotoUrl(Base64.getDecoder().decode(base64));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid Base64 image data", ex);
            }
        }

        if (req.getStatus() != null) {
            post.setStatus(Post.Status.valueOf(req.getStatus().toUpperCase()));
        }
        if (req.getContactPublic() != null) {
            post.setContactPublic(Post.ContactMethod.valueOf(req.getContactPublic().toUpperCase()));
        }

        Post saved = postRepository.save(post);
        LOG.info("Created post id={} by userId={}", saved.getId(), user.getId());
        return toResponse(saved);
    }

    public List<PostResponse> getUserPosts(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        return postRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public List<PostResponse> getAllPosts() {
        return postRepository.findAll().stream().map(this::toResponse).toList();
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + id));
        postRepository.delete(post);
        LOG.info("Deleted post id={}", id);
    }

    public PostResponse updatePost(Long id, PostRequest req) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + id));

        if (req.getTitle() != null) post.setTitle(req.getTitle());
        if (req.getDescription() != null) post.setDescription(req.getDescription());
        if (req.getLocation() != null) post.setLocation(req.getLocation());
        if (req.getCategory() != null) post.setCategory(req.getCategory());
        if (req.getAdditionalNotes() != null) post.setAdditionalNotes(req.getAdditionalNotes());

        if (req.getPhotoUrl() != null && !req.getPhotoUrl().isBlank()) {
            try {
                String base64 = req.getPhotoUrl().replaceFirst("^data:image/[^;]+;base64,", "");
                post.setPhotoUrl(Base64.getDecoder().decode(base64));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid Base64 image data", ex);
            }
        }

        if (req.getStatus() != null) post.setStatus(Post.Status.valueOf(req.getStatus().toUpperCase()));
        if (req.getContactPublic() != null) post.setContactPublic(Post.ContactMethod.valueOf(req.getContactPublic().toUpperCase()));

        Post saved = postRepository.save(post);
        LOG.info("Updated post id={}", saved.getId());
        return new PostResponse(saved);
    }

    /* -------------------------
       Post details for item page
       ------------------------- */
    public PostDetailResponse getPostDetail(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + id));

        PostDetailResponse dto = new PostDetailResponse();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());
        dto.setLocation(post.getLocation());
        dto.setCategory(post.getCategory());
        dto.setStatus(post.getStatus() != null ? post.getStatus().name() : null);
        dto.setIsClaimed(post.getIsClaimed());
        dto.setContactPublic(post.getContactPublic() != null ? post.getContactPublic().name() : null);
        dto.setAdditionalNotes(post.getAdditionalNotes());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        if (post.getPhotoUrl() != null && post.getPhotoUrl().length > 0) {
            dto.setPhotoBase64(Base64.getEncoder().encodeToString(post.getPhotoUrl()));
        }

        // user info + stats
        User u = post.getUser();
        if (u != null) {
            PostDetailResponse.UserInfo userInfo = new PostDetailResponse.UserInfo();
            userInfo.setId(u.getId());
            userInfo.setFirstName(u.getFirstName());
            userInfo.setLastName(u.getLastName());
            userInfo.setEmail(u.getEmail());
            userInfo.setPhone(u.getPhone());
            userInfo.setCreatedAt(u.getCreatedAt());

            try {
                long posted = postRepository.countByUserId(u.getId());
                long returned = postRepository.countByUserIdAndIsClaimedTrue(u.getId());
                userInfo.setItemsPosted(posted);
                userInfo.setItemsReturned(returned);
            } catch (Exception ex) {
                LOG.warn("Unable to compute user stats for userId={}", u.getId(), ex);
                userInfo.setItemsPosted(0L);
                userInfo.setItemsReturned(0L);
            }

            dto.setUser(userInfo);
        }

        return dto;
    }

    /* -------------------------
       Contact poster (save message + notify)
       ------------------------- */
    public boolean contactPoster(Long postId, ContactRequest req) {
        Optional<Post> opt = postRepository.findById(postId);
        if (opt.isEmpty()) {
            LOG.warn("contactPoster: post not found id={}", postId);
            return false;
        }
        Post post = opt.get();

        // Save message record
        try {
            Message msg = new Message();
            msg.setPost(post);
            msg.setSenderName(req.getSenderName());
            msg.setSenderEmail(req.getSenderEmail());
            msg.setSenderPhone(req.getSenderPhone());
            msg.setMessageText(req.getMessage());
            messageRepository.save(msg);
            LOG.info("Saved message id={} for postId={}", msg.getId(), postId);
        } catch (Exception ex) {
            LOG.error("Failed to save message for postId={}", postId, ex);
        }

        // Notify poster by email if allowed
        boolean emailAllowed = post.getContactPublic() == null
                || post.getContactPublic().name().equalsIgnoreCase("EMAIL")
                || post.getContactPublic().name().equalsIgnoreCase("BOTH");

        if (emailAllowed && post.getUser() != null && post.getUser().getEmail() != null) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(post.getUser().getEmail());
                mail.setSubject("TrackHub: Message about your item \"" + post.getTitle() + "\"");

                StringBuilder sb = new StringBuilder();
                sb.append("Hi ").append(post.getUser().getFirstName() == null ? "" : post.getUser().getFirstName()).append(",\n\n");
                sb.append("You have a new message regarding your post: ").append(post.getTitle()).append("\n\n");
                sb.append("Sender: ").append(req.getSenderName()).append("\n");
                sb.append("Email: ").append(req.getSenderEmail()).append("\n");
                if (req.getSenderPhone() != null && !req.getSenderPhone().isBlank()) {
                    sb.append("Phone: ").append(req.getSenderPhone()).append("\n");
                }
                sb.append("\nMessage:\n").append(req.getMessage()).append("\n\n--\nTrackHub");

                mail.setText(sb.toString());

                // async send via EmailService
                emailService.send(mail);
                LOG.info("Queued email to notify poster about postId={}", postId);
            } catch (Exception ex) {
                LOG.error("Failed to queue email to poster for postId={}", postId, ex);
            }
        } else {
            LOG.info("Email not allowed or poster has no email for postId={}", postId);
        }

        return true;
    }

    /* -------------------------
       Claim creation (save + notify)
       ------------------------- */
    public Claim createClaim(Long postId, ClaimRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + postId));

        Claim claim = new Claim();
        claim.setPost(post);
        claim.setClaimerName(req.getClaimerName());
        claim.setClaimerEmail(req.getClaimerEmail());
        claim.setClaimerPhone(req.getClaimerPhone());
        claim.setClaimReason(req.getClaimReason());

        Claim saved = claimRepository.save(claim);
        LOG.info("Saved claim id={} for postId={}", saved.getId(), postId);

        // notify poster if allowed
        boolean emailAllowed = post.getContactPublic() == null
                || post.getContactPublic().name().equalsIgnoreCase("EMAIL")
                || post.getContactPublic().name().equalsIgnoreCase("BOTH");

        if (emailAllowed && post.getUser() != null && post.getUser().getEmail() != null) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(post.getUser().getEmail());
                mail.setSubject("TrackHub: Claim submitted for your item \"" + post.getTitle() + "\"");

                StringBuilder sb = new StringBuilder();
                sb.append("Hi ").append(post.getUser().getFirstName() == null ? "" : post.getUser().getFirstName()).append(",\n\n");
                sb.append("Someone has submitted a claim for your post: ").append(post.getTitle()).append("\n\n");
                sb.append("Claimer: ").append(req.getClaimerName()).append("\n");
                sb.append("Email: ").append(req.getClaimerEmail()).append("\n");
                if (req.getClaimerPhone() != null && !req.getClaimerPhone().isBlank()) {
                    sb.append("Phone: ").append(req.getClaimerPhone()).append("\n");
                }
                if (req.getClaimReason() != null && !req.getClaimReason().isBlank()) {
                    sb.append("\nClaim reason:\n").append(req.getClaimReason()).append("\n");
                }
                sb.append("\nPlease review this claim and contact the claimer to verify ownership.\n\n--\nTrackHub");

                mail.setText(sb.toString());
                emailService.send(mail);
                LOG.info("Queued claim notification email for postId={}", postId);
            } catch (Exception ex) {
                LOG.error("Failed to queue claim notification email for postId={}", postId, ex);
            }
        } else {
            LOG.info("Email not allowed or poster has no email for postId={}", postId);
        }

        return saved;
    }
}
