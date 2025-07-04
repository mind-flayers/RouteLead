package com.example.be.controller;

import com.example.be.model.ReturnRoute;
import com.example.be.service.RouteService;
import com.example.be.types.RouteStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverController {

    private final RouteService routeService;

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

    // Keep the existing endpoint for backwards compatibility
    @GetMapping("/my-routes")
    public String getMyRoutes() {
        return "Driver's routes (protected) - Use /routes endpoint with driverId parameter";
    }
} 