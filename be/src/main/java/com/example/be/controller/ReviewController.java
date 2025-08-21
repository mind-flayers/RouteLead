package com.example.be.controller;

import com.example.be.service.ReviewService;
import com.example.be.types.ReviewRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ReviewController {
    
    private final ReviewService reviewService;
    
    /**
     * Create a new review
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(@RequestBody Map<String, Object> request) {
        try {
            log.info("Creating review: {}", request);
            
            String tripId = (String) request.get("tripId");
            String reviewerId = (String) request.get("reviewerId");
            String revieweeId = (String) request.get("revieweeId");
                                    String roleStr = (String) request.get("role");
                        Integer ratingInt = (Integer) request.get("rating");
                        String comment = (String) request.get("comment");
                        
                        Short rating = ratingInt.shortValue();
            
            if (tripId == null || reviewerId == null || revieweeId == null || roleStr == null || rating == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required fields: tripId, reviewerId, revieweeId, role, rating");
                return ResponseEntity.badRequest().body(response);
            }
            
            UUID tripIdUuid = UUID.fromString(tripId);
            UUID reviewerIdUuid = UUID.fromString(reviewerId);
            UUID revieweeIdUuid = UUID.fromString(revieweeId);
            ReviewRole role = ReviewRole.valueOf(roleStr);
            
            // Validate rating
            if (rating < 1 || rating > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Rating must be between 1 and 5");
                return ResponseEntity.badRequest().body(response);
            }
            
            var review = reviewService.createReview(tripIdUuid, reviewerIdUuid, revieweeIdUuid, role, rating, comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully");
            response.put("reviewId", review.get("id").toString());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format in review creation: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid ID format: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error creating review: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create review: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Get driver rating statistics
     * GET /api/reviews/driver/{driverId}/stats
     */
    @GetMapping("/driver/{driverId}/stats")
    public ResponseEntity<Map<String, Object>> getDriverRatingStats(@PathVariable String driverId) {
        try {
            log.info("Getting rating stats for driver: {}", driverId);
            
            UUID driverIdUuid = UUID.fromString(driverId);
            Map<String, Object> stats = reviewService.getDriverRatingStats(driverIdUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for driverId: {}", driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid driver ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error getting driver rating stats: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get rating stats: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Check if user has already reviewed a trip
     * GET /api/reviews/check/{tripId}/{reviewerId}
     */
    @GetMapping("/check/{tripId}/{reviewerId}")
    public ResponseEntity<Map<String, Object>> checkIfReviewed(@PathVariable String tripId, @PathVariable String reviewerId) {
        try {
            log.info("Checking if reviewer {} has reviewed trip {}", reviewerId, tripId);
            
            UUID tripIdUuid = UUID.fromString(tripId);
            UUID reviewerIdUuid = UUID.fromString(reviewerId);
            
            boolean hasReviewed = reviewService.hasReviewedTrip(tripIdUuid, reviewerIdUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasReviewed", hasReviewed);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid ID format: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error checking review status: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to check review status: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
