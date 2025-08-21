package com.example.be.repository;

import com.example.be.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    // Find reviews by reviewee (driver)
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(UUID revieweeId);
    
    // Find reviews by trip
    List<Review> findByTripIdOrderByCreatedAtDesc(UUID tripId);
    
    // Find reviews by reviewer
    List<Review> findByReviewerIdOrderByCreatedAtDesc(UUID reviewerId);
    
    // Check if reviewer has already reviewed this trip
    boolean existsByTripIdAndReviewerId(UUID tripId, UUID reviewerId);
    
    // Get average rating for a driver
    @Query(value = "SELECT AVG(rating) FROM reviews WHERE reviewee_id = :driverId AND role = 'DRIVER'", nativeQuery = true)
    Double getAverageRatingByDriverId(@Param("driverId") UUID driverId);
    
    // Get total review count for a driver
    @Query(value = "SELECT COUNT(*) FROM reviews WHERE reviewee_id = :driverId AND role = 'DRIVER'", nativeQuery = true)
    Long getReviewCountByDriverId(@Param("driverId") UUID driverId);
    
    // Get rating distribution for a driver
    @Query(value = """
        SELECT rating, COUNT(*) as count 
        FROM reviews 
        WHERE reviewee_id = :driverId AND role = 'DRIVER' 
        GROUP BY rating 
        ORDER BY rating DESC
        """, nativeQuery = true)
    List<Object[]> getRatingDistributionByDriverId(@Param("driverId") UUID driverId);
}
