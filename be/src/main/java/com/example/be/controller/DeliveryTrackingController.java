package com.example.be.controller;

import com.example.be.dto.DeliveryDetailsDto;
import com.example.be.dto.DeliveryStatusUpdateDto;
import com.example.be.dto.DeliverySummaryDto;
import com.example.be.service.DeliveryManagementService;
import com.example.be.exception.BidNotFoundException;
import com.example.be.exception.DeliveryNotFoundException;
import com.example.be.types.DeliveryStatusEnum;
import com.example.be.repository.DeliveryTrackingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Slf4j
public class DeliveryTrackingController {
    
    private final DeliveryManagementService deliveryManagementService;
    private final DeliveryTrackingRepository deliveryTrackingRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * DEBUG: Test if 'open' enum value exists in database
     */
    @GetMapping("/debug/test-enum")
    public ResponseEntity<String> testEnum() {
        try {
            List<String> enumValues = jdbcTemplate.queryForList(
                "SELECT unnest(enum_range(NULL::delivery_status_enum))", String.class);
            
            log.info("Available enum values: {}", enumValues);
            return ResponseEntity.ok("Available enum values: " + enumValues.toString());
        } catch (Exception e) {
            log.error("Error testing enum: ", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    /**
     * DEBUG: Test database connectivity and migrations
     */
    @GetMapping("/debug/test-db")
    public ResponseEntity<String> testDatabase() {
        try {
            String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
            String enumTest = jdbcTemplate.queryForObject(
                "SELECT 'open'::delivery_status_enum::text", String.class);
            
            return ResponseEntity.ok("DB Version: " + version + " | Enum test: " + enumTest);
        } catch (Exception e) {
            log.error("Error testing database: ", e);
            return ResponseEntity.status(500).body("Database error: " + e.getMessage());
        }
    }
    
    /**
     * DEBUG: Test creating delivery with 'open' status
     */
    @PostMapping("/debug/test-create-open")
    public ResponseEntity<?> testCreateOpen(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String deliveryId = request.get("deliveryId");
            
            UUID trackingId = UUID.randomUUID();
            java.time.ZonedDateTime now = java.time.ZonedDateTime.now();
            java.time.ZonedDateTime estimatedArrival = now.plusHours(2);
            
            deliveryTrackingRepository.createDeliveryTrackingWithOpenStatus(
                trackingId, UUID.fromString(deliveryId), estimatedArrival, now);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("trackingId", trackingId);
            response.put("message", "Delivery tracking created with 'open' status");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating delivery with open status: ", e);
            Map<String, Object> errorResponse = createErrorResponse("Creation failed", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * DEBUG: Check for duplicate delivery tracking records
     */
    @GetMapping("/debug/check-duplicates/{bidId}")
    public ResponseEntity<?> checkDuplicates(@PathVariable UUID bidId) {
        try {
            List<Map<String, Object>> records = jdbcTemplate.queryForList(
                "SELECT id, bid_id, status, created_at FROM delivery_tracking WHERE bid_id = ?", 
                bidId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bidId", bidId);
            response.put("recordCount", records.size());
            response.put("records", records);
            
            if (records.size() > 1) {
                response.put("warning", "Multiple records found for the same bid_id");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking duplicates: ", e);
            Map<String, Object> errorResponse = createErrorResponse("Check failed", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * DEBUG: Clean up duplicate delivery tracking records (keep the latest)
     */
    @PostMapping("/debug/cleanup-duplicates/{bidId}")
    public ResponseEntity<?> cleanupDuplicates(@PathVariable UUID bidId) {
        try {
            // Get all records for this bid_id ordered by created_at DESC
            List<Map<String, Object>> records = jdbcTemplate.queryForList(
                "SELECT id, created_at FROM delivery_tracking WHERE bid_id = ? ORDER BY created_at DESC", 
                bidId);
            
            if (records.size() <= 1) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "No duplicates found");
                response.put("recordCount", records.size());
                return ResponseEntity.ok(response);
            }
            
            // Keep the first (latest) record, delete the rest
            List<UUID> idsToDelete = new ArrayList<>();
            for (int i = 1; i < records.size(); i++) {
                idsToDelete.add((UUID) records.get(i).get("id"));
            }
            
            int deletedCount = 0;
            for (UUID idToDelete : idsToDelete) {
                int deleted = jdbcTemplate.update("DELETE FROM delivery_tracking WHERE id = ?", idToDelete);
                deletedCount += deleted;
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cleanup completed");
            response.put("totalRecords", records.size());
            response.put("deletedRecords", deletedCount);
            response.put("remainingRecords", 1);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error cleaning up duplicates: ", e);
            Map<String, Object> errorResponse = createErrorResponse("Cleanup failed", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get comprehensive delivery details for a driver
     * GET /api/delivery/{bidId}/details
     */
    @GetMapping("/{bidId}/details")
    public ResponseEntity<?> getDeliveryDetails(@PathVariable UUID bidId) {
        log.info("Fetching delivery details for bid: {}", bidId);
        try {
            DeliveryDetailsDto deliveryDetails = deliveryManagementService.getDeliveryDetails(bidId);
            
            log.info("Successfully fetched delivery details for bid: {}", bidId);
            return ResponseEntity.ok(deliveryDetails);
            
        } catch (BidNotFoundException e) {
            log.error("Bid not found: {}", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Bid not found", 
                "No delivery found for bid ID: " + bidId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error fetching delivery details for bid {}: ", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Internal server error", 
                "Failed to fetch delivery details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update delivery status and location
     * PUT /api/delivery/{bidId}/status
     */
    @PutMapping("/{bidId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable UUID bidId,
            @RequestBody DeliveryStatusUpdateDto updateDto) {
        log.info("Updating delivery status for bid {} to {}", bidId, updateDto.getStatus());
        try {
            // First try to cleanup any duplicates using native SQL
            try {
                // More aggressive cleanup - keep only the latest record
                int deletedCount = jdbcTemplate.update(
                    "DELETE FROM delivery_tracking WHERE bid_id = ? AND id NOT IN (" +
                    "SELECT id FROM (SELECT id FROM delivery_tracking " +
                    "WHERE bid_id = ? ORDER BY created_at DESC LIMIT 1) as latest)",
                    bidId, bidId
                );
                log.info("Cleaned up {} duplicate records for bid: {}", deletedCount, bidId);
            } catch (Exception cleanupError) {
                log.warn("Cleanup failed but continuing: {}", cleanupError.getMessage());
            }
            
            // Now try the regular update
            DeliveryDetailsDto updatedDetails = deliveryManagementService.updateDeliveryStatus(bidId, updateDto);
            
            log.info("Successfully updated delivery status for bid: {}", bidId);
            return ResponseEntity.ok(updatedDetails);
            
        } catch (BidNotFoundException e) {
            log.error("Bid not found for status update: {}", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Bid not found", 
                "No delivery found for bid ID: " + bidId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error updating delivery status for bid {}: ", bidId, e);
            
            // If we still get duplicate error, try direct SQL update as fallback
            if (e.getMessage().contains("Query did not return a unique result")) {
                try {
                    log.info("Attempting direct SQL status update for bid: {}", bidId);
                    
                    // Update status directly using SQL
                    String statusString = updateDto.getStatus() != null ? updateDto.getStatus().name() : null;
                    jdbcTemplate.update(
                        "UPDATE delivery_tracking SET status = CAST(? AS delivery_status_enum) " +
                        "WHERE bid_id = ? AND id = (SELECT id FROM delivery_tracking WHERE bid_id = ? ORDER BY created_at DESC LIMIT 1)",
                        statusString, bidId, bidId
                    );
                    
                    log.info("Direct SQL update successful for bid: {}", bidId);
                    
                    // Return updated details
                    DeliveryDetailsDto updatedDetails = deliveryManagementService.getDeliveryDetails(bidId);
                    return ResponseEntity.ok(updatedDetails);
                    
                } catch (Exception sqlError) {
                    log.error("Direct SQL update also failed: ", sqlError);
                }
            }
            
            Map<String, Object> errorResponse = createErrorResponse("Internal server error", 
                "Failed to update delivery status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Complete delivery and get summary
     * POST /api/delivery/{bidId}/complete
     */
    @PostMapping("/{bidId}/complete")
    public ResponseEntity<?> completeDelivery(
            @PathVariable UUID bidId,
            @RequestBody DeliveryStatusUpdateDto updateDto) {
        log.info("Completing delivery for bid: {}", bidId);
        try {
            DeliverySummaryDto summary = deliveryManagementService.completeDelivery(bidId, updateDto);
            
            log.info("Successfully completed delivery for bid: {}", bidId);
            return ResponseEntity.ok(summary);
            
        } catch (BidNotFoundException e) {
            log.error("Bid not found for completion: {}", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Bid not found", 
                "No delivery found for bid ID: " + bidId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error completing delivery for bid {}: ", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Internal server error", 
                "Failed to complete delivery: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get delivery tracking status (used when starting or resuming delivery tracking)
     * GET /api/delivery/{bidId}/tracking
     */
    @GetMapping("/{bidId}/tracking")
    public ResponseEntity<?> getDeliveryTracking(@PathVariable UUID bidId) {
        log.info("Getting delivery tracking for bid: {}", bidId);
        try {
            DeliveryDetailsDto trackingDetails = deliveryManagementService.getDeliveryDetails(bidId);
            
            log.info("Successfully retrieved delivery tracking for bid: {}", bidId);
            return ResponseEntity.ok(trackingDetails);
            
        } catch (BidNotFoundException e) {
            log.error("Bid not found for tracking: {}", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Bid not found", 
                "No delivery tracking found for bid ID: " + bidId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error getting delivery tracking for bid {}: ", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Internal server error", 
                "Failed to get delivery tracking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * DEBUG: Thorough check for duplicate delivery tracking records
     */
    @GetMapping("/debug/thorough-check/{bidId}")
    public ResponseEntity<?> thoroughDuplicateCheck(@PathVariable UUID bidId) {
        try {
            // Check multiple ways to find duplicates
            List<Map<String, Object>> allRecords = jdbcTemplate.queryForList(
                "SELECT id, bid_id, status, created_at, actual_pickup_time, actual_delivery_time " +
                "FROM delivery_tracking WHERE bid_id = ? ORDER BY created_at", 
                bidId);
            
            // Also check using JPA repository count
            long jpaCount = deliveryTrackingRepository.countByBidId(bidId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bidId", bidId);
            response.put("sqlRecordCount", allRecords.size());
            response.put("jpaRecordCount", jpaCount);
            response.put("allRecords", allRecords);
            
            if (allRecords.size() != jpaCount) {
                response.put("warning", "SQL and JPA counts don't match!");
            }
            
            if (allRecords.size() > 1) {
                response.put("hasDuplicates", true);
                response.put("duplicateIds", allRecords.stream()
                    .map(r -> r.get("id"))
                    .collect(java.util.stream.Collectors.toList()));
            } else {
                response.put("hasDuplicates", false);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in thorough duplicate check for bid {}: ", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Check failed", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * DEBUG: Check parcel request status for a bid
     */
    @GetMapping("/debug/parcel-status/{bidId}")
    public ResponseEntity<?> checkParcelStatus(@PathVariable UUID bidId) {
        try {
            // Get the parcel request status directly via SQL
            List<Map<String, Object>> result = jdbcTemplate.queryForList(
                "SELECT pr.id, pr.status, pr.description " +
                "FROM parcel_requests pr " +
                "INNER JOIN bids b ON pr.id = b.request_id " +
                "WHERE b.id = ?", 
                bidId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bidId", bidId);
            
            if (result.isEmpty()) {
                response.put("message", "No parcel request found for this bid");
                response.put("parcelRequest", null);
            } else {
                Map<String, Object> parcelData = result.get(0);
                response.put("message", "Parcel request found");
                response.put("parcelRequest", parcelData);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking parcel status for bid {}: ", bidId, e);
            Map<String, Object> errorResponse = createErrorResponse("Check failed", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Helper method to create consistent error responses
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", java.time.Instant.now().toString());
        return errorResponse;
    }
}
