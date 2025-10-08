package com.charishma.Track.Hub.repo;

import com.charishma.Track.Hub.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing Claim entities.
 * Provides convenient methods for querying claims
 * related to posts and their statuses.
 */
@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    /**
     * Find all claims associated with a specific post.
     * @param postId the ID of the post
     * @return list of claims related to that post
     */
    List<Claim> findByPostId(Long postId);

    /**
     * Find all claims with a particular status (e.g., PENDING, APPROVED, REJECTED).
     * @param status claim status
     * @return list of claims with the specified status
     */
    List<Claim> findByStatus(Claim.Status status);

    /**
     * (Optional) Find all claims submitted by a given email address.
     * Useful if you want users to track their own claim requests.
     */
    List<Claim> findByClaimerEmail(String claimerEmail);

    /**
     * (Optional) Count all pending claims for a specific post.
     * Can be used to limit multiple claims on the same post.
     */
    long countByPostIdAndStatus(Long postId, Claim.Status status);
}
