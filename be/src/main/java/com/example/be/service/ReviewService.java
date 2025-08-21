package com.example.be.service;

import com.example.be.repository.ReviewRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.types.ReviewRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ProfileRepository profileRepository;
    private final ReturnRouteRepository returnRouteRepository;
    private final EntityManager entityManager;
    
    @Transactional
    public Map<String, Object> createReview(UUID tripId, UUID reviewerId, UUID revieweeId, ReviewRole role, Short rating, String comment) {
        log.info("Creating review: tripId={}, reviewerId={}, revieweeId={}, role={}, rating={}", 
                tripId, reviewerId, revieweeId, role, rating);
        
        // Check if reviewer has already reviewed this trip
        if (reviewRepository.existsByTripIdAndReviewerId(tripId, reviewerId)) {
            throw new RuntimeException("You have already reviewed this trip");
        }
        
        // Validate entities exist using native SQL
        String checkTripSql = "SELECT COUNT(*) FROM return_routes WHERE id = ?";
        Long tripCount = (Long) entityManager.createNativeQuery(checkTripSql)
                .setParameter(1, tripId)
                .getSingleResult();
        
        if (tripCount == 0) {
            throw new RuntimeException("Trip not found");
        }
        
        String checkReviewerSql = "SELECT COUNT(*) FROM profiles WHERE id = ?";
        Long reviewerCount = (Long) entityManager.createNativeQuery(checkReviewerSql)
                .setParameter(1, reviewerId)
                .getSingleResult();
        
        if (reviewerCount == 0) {
            throw new RuntimeException("Reviewer not found");
        }
        
        String checkRevieweeSql = "SELECT COUNT(*) FROM profiles WHERE id = ?";
        Long revieweeCount = (Long) entityManager.createNativeQuery(checkRevieweeSql)
                .setParameter(1, revieweeId)
                .getSingleResult();
        
        if (revieweeCount == 0) {
            throw new RuntimeException("Reviewee not found");
        }
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        // Insert review using native SQL
        String insertReviewSql = """
            INSERT INTO reviews (trip_id, reviewer_id, reviewee_id, role, rating, comment, created_at)
            VALUES (?, ?, ?, CAST(? AS review_role), ?, ?, ?)
            RETURNING id, created_at
            """;
        
        Object[] result = (Object[]) entityManager.createNativeQuery(insertReviewSql)
                .setParameter(1, tripId)
                .setParameter(2, reviewerId)
                .setParameter(3, revieweeId)
                .setParameter(4, role.name())
                .setParameter(5, rating)
                .setParameter(6, comment)
                .setParameter(7, ZonedDateTime.now())
                .getSingleResult();
        
                            UUID reviewId = (UUID) result[0];
                    Instant createdAt = (Instant) result[1];
        
        log.info("Review created successfully with ID: {}", reviewId);
        
        Map<String, Object> reviewData = new HashMap<>();
        reviewData.put("id", reviewId);
        reviewData.put("tripId", tripId);
        reviewData.put("reviewerId", reviewerId);
        reviewData.put("revieweeId", revieweeId);
        reviewData.put("role", role.name());
        reviewData.put("rating", rating);
        reviewData.put("comment", comment);
                            reviewData.put("createdAt", createdAt.toString());
        
        return reviewData;
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getDriverRatingStats(UUID driverId) {
        log.info("Getting rating stats for driver: {}", driverId);
        
        Double averageRating = reviewRepository.getAverageRatingByDriverId(driverId);
        Long totalReviews = reviewRepository.getReviewCountByDriverId(driverId);
        List<Object[]> ratingDistribution = reviewRepository.getRatingDistributionByDriverId(driverId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);
        stats.put("totalReviews", totalReviews != null ? totalReviews : 0L);
        
        // Create rating distribution map
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0);
        }
        
        for (Object[] row : ratingDistribution) {
            Short rating = (Short) row[0];
            Integer count = ((Number) row[1]).intValue();
            distribution.put(rating.intValue(), count);
        }
        
        stats.put("ratingDistribution", distribution);
        
        return stats;
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDriverReviews(UUID driverId) {
        String sql = """
            SELECT r.id, r.trip_id, r.reviewer_id, r.reviewee_id, r.role, r.rating, r.comment, r.created_at,
                   p.first_name, p.last_name
            FROM reviews r
            JOIN profiles p ON r.reviewer_id = p.id
            WHERE r.reviewee_id = ?
            ORDER BY r.created_at DESC
            """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter(1, driverId)
                .getResultList();
        
        List<Map<String, Object>> reviews = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> review = new HashMap<>();
            review.put("id", row[0]);
            review.put("tripId", row[1]);
            review.put("reviewerId", row[2]);
            review.put("revieweeId", row[3]);
            review.put("role", row[4]);
            review.put("rating", row[5]);
            review.put("comment", row[6]);
            review.put("createdAt", row[7]);
            review.put("reviewerName", (row[8] != null ? row[8] : "") + " " + (row[9] != null ? row[9] : ""));
            reviews.add(review);
        }
        
        return reviews;
    }
    
    @Transactional(readOnly = true)
    public boolean hasReviewedTrip(UUID tripId, UUID reviewerId) {
        return reviewRepository.existsByTripIdAndReviewerId(tripId, reviewerId);
    }
}
