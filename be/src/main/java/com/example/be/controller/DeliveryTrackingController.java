package com.example.be.controller;

import com.example.be.dto.DeliveryDetailsDto;
import com.example.be.dto.DeliveryStatusUpdateDto;
import com.example.be.dto.DeliverySummaryDto;
import com.example.be.service.DeliveryManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<DeliveryDetailsDto> getDeliveryDetails(@PathVariable UUID bidId) {
        log.info("Fetching delivery details for bid: {}", bidId);
        try {
            DeliveryDetailsDto details = deliveryManagementService.getDeliveryDetails(bidId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            log.error("Error fetching delivery details for bid {}: ", bidId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Update delivery status and location
     * PUT /api/delivery/{bidId}/status
     */
    @PutMapping("/{bidId}/status")
    public ResponseEntity<DeliveryDetailsDto> updateDeliveryStatus(
            @PathVariable UUID bidId,
            @RequestBody DeliveryStatusUpdateDto updateDto) {
        log.info("Updating delivery status for bid {} to {}", bidId, updateDto.getStatus());
        try {
            DeliveryDetailsDto updatedDetails = deliveryManagementService.updateDeliveryStatus(bidId, updateDto);
            return ResponseEntity.ok(updatedDetails);
        } catch (Exception e) {
            log.error("Error updating delivery status for bid {}: ", bidId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Complete delivery and get summary
     * POST /api/delivery/{bidId}/complete
     */
    @PostMapping("/{bidId}/complete")
    public ResponseEntity<DeliverySummaryDto> completeDelivery(
            @PathVariable UUID bidId,
            @RequestBody DeliveryStatusUpdateDto updateDto) {
        log.info("Completing delivery for bid: {}", bidId);
        try {
            DeliverySummaryDto summary = deliveryManagementService.completeDelivery(bidId, updateDto);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error completing delivery for bid {}: ", bidId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get delivery tracking status (used when starting or resuming delivery tracking)
     * GET /api/delivery/{bidId}/tracking
     */
    @GetMapping("/{bidId}/tracking")
    public ResponseEntity<DeliveryDetailsDto> getDeliveryTracking(@PathVariable UUID bidId) {
        log.info("Getting delivery tracking for bid: {}", bidId);
        try {
            DeliveryDetailsDto details = deliveryManagementService.getDeliveryDetails(bidId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            log.error("Error getting delivery tracking for bid {}: ", bidId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
