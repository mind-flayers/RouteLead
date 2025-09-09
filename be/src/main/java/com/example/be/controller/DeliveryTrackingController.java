package com.example.be.controller;

import com.example.be.dto.DeliveryDetailsDto;
import com.example.be.dto.DeliveryStatusUpdateDto;
import com.example.be.dto.DeliverySummaryDto;
import com.example.be.service.DeliveryManagementService;
import com.example.be.exception.BidNotFoundException;
import com.example.be.exception.DeliveryNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Slf4j
public class DeliveryTrackingController {
    
    private final DeliveryManagementService deliveryManagementService;
    
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
