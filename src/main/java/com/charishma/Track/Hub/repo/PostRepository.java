package com.charishma.Track.Hub.repo;

import com.charishma.Track.Hub.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // ✅ Get all posts by user
    List<Post> findByUserId(Long userId);

    // ✅ Get all posts by status (e.g., "FOUND" or "LOST")
    List<Post> findByStatus(Post.Status status);

    // ✅ Search by category
    List<Post> findByCategory(String category);

    // ✅ Search by keyword in title/description
    List<Post> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titleKeyword, String descriptionKeyword);
    
    // ✅ Get posts sorted by creation date (newest first) 
    List<Post> findAllByOrderByCreatedAtDesc();

    // ✅ Get posts by location (e.g., "Library")
    List<Post> findByLocationContainingIgnoreCase(String location);
    // count posts by user
    long countByUserId(Long userId);
    
    // count posts by user where isClaimed = true (i.e., returned)
    long countByUserIdAndIsClaimedTrue(Long userId);

}
