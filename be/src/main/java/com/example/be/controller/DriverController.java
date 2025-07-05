package com.example.be.controller;

import com.example.be.model.ReturnRoute;
import com.example.be.service.RouteService;
import com.example.be.types.RouteStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/driver")
@CrossOrigin(origins = "*")
public class DriverController {

    private final RouteService routeService;
    private final com.example.be.service.BidService bidService;

    public DriverController(RouteService routeService, com.example.be.service.BidService bidService) {
        this.routeService = routeService;
        this.bidService = bidService;
    }

    @GetMapping("/routes")
    public ResponseEntity<List<ReturnRoute>> getDriverRoutes(
            @RequestParam UUID driverId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /api/driver/routes - driverId: {}, status: {}", driverId, status);
        
        try {
            // Convert string status to RouteStatus enum
            RouteStatus routeStatus = null;
            if (status != null && !status.trim().isEmpty()) {
                try {
                    routeStatus = RouteStatus.valueOf(status.toUpperCase().trim());
                } catch (IllegalArgumentException e) {
                    log.error("Invalid status parameter: {}", status);
                    return ResponseEntity.badRequest().build();
                }
            }
            
            List<ReturnRoute> routes = routeService.getRoutesByDriver(driverId, routeStatus);
            log.info("Found {} routes for driver {} with status {}", routes.size(), driverId, routeStatus);
            return ResponseEntity.ok(routes);
        } catch (Exception e) {
            log.error("Error fetching routes for driver {}: ", driverId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/bids/history")
    public ResponseEntity<List<com.example.be.dto.DriverBidHistoryDto>> getDriverBidHistory(
            @RequestParam UUID driverId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /api/driver/bids/history - driverId: {}, status: {}", driverId, status);
        
        try {
            // Convert string status to BidStatus enum
            com.example.be.types.BidStatus bidStatus = null;
            if (status != null && !status.trim().isEmpty()) {
                try {
                    bidStatus = com.example.be.types.BidStatus.valueOf(status.toUpperCase().trim());
                } catch (IllegalArgumentException e) {
                    log.error("Invalid status parameter: {}", status);
                    return ResponseEntity.badRequest().build();
                }
            }
            
            List<com.example.be.dto.DriverBidHistoryDto> bidHistory = bidService.getDriverBidHistory(driverId, bidStatus);
            log.info("Found {} bid history records for driver {} with status {}", bidHistory.size(), driverId, bidStatus);
            return ResponseEntity.ok(bidHistory);
        } catch (Exception e) {
            log.error("Error fetching bid history for driver {}: ", driverId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/bids/debug")
    public ResponseEntity<String> debugDriverBidHistory(@RequestParam UUID driverId) {
        log.info("DEBUG /api/driver/bids/debug - driverId: {}", driverId);
        
        try {
            List<Object[]> results = bidService.debugGetDriverBidHistoryRaw(driverId);
            
            StringBuilder debug = new StringBuilder();
            debug.append("Found ").append(results.size()).append(" results\n");
            
            for (int i = 0; i < results.size(); i++) {
                Object[] row = results.get(i);
                debug.append("Row ").append(i).append(":\n");
                for (int j = 0; j < row.length; j++) {
                    Object value = row[j];
                    debug.append("  [").append(j).append("]: ");
                    if (value != null) {
                        debug.append(value.getClass().getSimpleName()).append(" = ").append(value);
                    } else {
                        debug.append("null");
                    }
                    debug.append("\n");
                }
                debug.append("\n");
            }
            
            return ResponseEntity.ok(debug.toString());
        } catch (Exception e) {
            log.error("Error in debug endpoint: ", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Keep the existing endpoint for backwards compatibility
    @GetMapping("/my-routes")
    public String getMyRoutes() {
        return "Driver's routes (protected) - Use /routes endpoint with driverId parameter";
    }
}