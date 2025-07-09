package com.example.be.controller;

import com.example.be.dto.CreateEarningsRequestDto;
import com.example.be.dto.EarningsDto;
import com.example.be.dto.EarningsSummaryDto;
import com.example.be.service.EarningsService;
import com.example.be.types.EarningsStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/earnings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EarningsController {

    private final EarningsService earningsService;

    /**
     * Create a new earnings record
     * POST /api/earnings
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEarnings(@RequestBody CreateEarningsRequestDto request) {
        try {
            log.info("Creating earnings for driver: {}, bid: {}", request.getDriverId(), request.getBidId());
            
            EarningsDto earnings = earningsService.createEarnings(request);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Earnings record created successfully",
                "data", earnings,
                "timestamp", ZonedDateTime.now(),
                "status", 201
            ));
            
        } catch (RuntimeException e) {
            log.error("Error creating earnings: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Failed to create earnings: " + e.getMessage(),
                "timestamp", ZonedDateTime.now(),
                "status", 400
            ));
        } catch (Exception e) {
            log.error("Unexpected error creating earnings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Internal server error while creating earnings",
                "timestamp", ZonedDateTime.now(),
                "status", 500
            ));
        }
    }

    /**
     * Get earnings summary for driver dashboard
     * GET /api/earnings/summary?driverId={driverId}
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getEarningsSummary(@RequestParam UUID driverId) {
        try {
            log.info("Fetching earnings summary for driver: {}", driverId);
            
            EarningsSummaryDto summary = earningsService.getEarningsSummary(driverId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Earnings summary retrieved successfully",
                "data", summary,
                "timestamp", ZonedDateTime.now(),
                "status", 200
            ));
            
        } catch (Exception e) {
            log.error("Error fetching earnings summary for driver: {}", driverId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to fetch earnings summary",
                "timestamp", ZonedDateTime.now(),
                "status", 500
            ));
        }
    }

    /**
     * Get detailed earnings history for a driver
     * GET /api/earnings/history?driverId={driverId}&status={status}
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getEarningsHistory(
            @RequestParam UUID driverId,
            @RequestParam(required = false) String status) {
        try {
            log.info("Fetching earnings history for driver: {}, status: {}", driverId, status);
            
            // Validate status if provided
            Optional<EarningsStatusEnum> statusEnum = Optional.empty();
            if (status != null && !status.isEmpty()) {
                try {
                    statusEnum = Optional.of(EarningsStatusEnum.valueOf(status.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid status value. Valid values are: PENDING, AVAILABLE, WITHDRAWN",
                        "timestamp", ZonedDateTime.now(),
                        "status", 400
                    ));
                }
            }
            
            List<EarningsDto> earnings = earningsService.getEarningsHistory(driverId, statusEnum);
            
            return ResponseEntity.ok(Map.of(
                "message", "Earnings history retrieved successfully",
                "data", earnings,
                "count", earnings.size(),
                "timestamp", ZonedDateTime.now(),
                "status", 200
            ));
            
        } catch (Exception e) {
            log.error("Error fetching earnings history for driver: {}", driverId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to fetch earnings history",
                "timestamp", ZonedDateTime.now(),
                "status", 500
            ));
        }
    }

    /**
     * Update earnings status
     * PATCH /api/earnings/{earningsId}/status
     */
    @PatchMapping("/{earningsId}/status")
    public ResponseEntity<Map<String, Object>> updateEarningsStatus(
            @PathVariable UUID earningsId,
            @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Status is required",
                    "timestamp", ZonedDateTime.now(),
                    "status", 400
                ));
            }
            
            EarningsStatusEnum status;
            try {
                status = EarningsStatusEnum.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid status value. Valid values are: PENDING, AVAILABLE, WITHDRAWN",
                    "timestamp", ZonedDateTime.now(),
                    "status", 400
                ));
            }
            
            log.info("Updating earnings status for ID: {} to status: {}", earningsId, status);
            
            EarningsDto earnings = earningsService.updateEarningsStatus(earningsId, status);
            
            return ResponseEntity.ok(Map.of(
                "message", "Earnings status updated successfully",
                "data", earnings,
                "timestamp", ZonedDateTime.now(),
                "status", 200
            ));
            
        } catch (RuntimeException e) {
            log.error("Error updating earnings status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Failed to update earnings status: " + e.getMessage(),
                "timestamp", ZonedDateTime.now(),
                "status", 400
            ));
        } catch (Exception e) {
            log.error("Unexpected error updating earnings status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Internal server error while updating earnings status",
                "timestamp", ZonedDateTime.now(),
                "status", 500
            ));
        }
    }

    /**
     * Get earnings by bid ID
     * GET /api/earnings/bid/{bidId}
     */
    @GetMapping("/bid/{bidId}")
    public ResponseEntity<Map<String, Object>> getEarningsByBidId(@PathVariable UUID bidId) {
        try {
            log.info("Fetching earnings for bid: {}", bidId);
            
            Optional<EarningsDto> earnings = earningsService.getEarningsByBidId(bidId);
            
            if (earnings.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "message", "Earnings found for bid",
                    "data", earnings.get(),
                    "timestamp", ZonedDateTime.now(),
                    "status", 200
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Error fetching earnings for bid: {}", bidId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to fetch earnings for bid",
                "timestamp", ZonedDateTime.now(),
                "status", 500
            ));
        }
    }
}
