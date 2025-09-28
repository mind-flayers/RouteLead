package com.example.be.controller;

import com.example.be.service.BidClosingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/bid-closing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BidClosingController {
    
    private final BidClosingService bidClosingService;
    
    /**
     * Manually close bidding for a specific route (admin endpoint)
     */
    @PostMapping("/close/{routeId}")
    public ResponseEntity<?> manuallyCloseBidding(@PathVariable UUID routeId) {
        log.info("POST /api/admin/bid-closing/close/{} - Manually closing bidding for route", routeId);
        
        try {
            bidClosingService.manuallyCloseBidding(routeId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", java.time.LocalDateTime.now());
            response.put("status", 200);
            response.put("message", "Bidding closed successfully for route: " + routeId);
            response.put("routeId", routeId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error manually closing bidding for route {}: ", routeId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("routeId", routeId);
            
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }
    
    /**
     * Trigger the scheduled bid closing process manually (admin endpoint)
     */
    @PostMapping("/trigger-scheduled")
    public ResponseEntity<?> triggerScheduledBidClosing() {
        log.info("POST /api/admin/bid-closing/trigger-scheduled - Manually triggering scheduled bid closing");
        
        try {
            bidClosingService.processExpiredBids();
            
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", java.time.LocalDateTime.now());
            response.put("status", 200);
            response.put("message", "Scheduled bid closing process completed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error triggering scheduled bid closing: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }
}
