
package com.example.be.controller;

import com.example.be.dto.CreateRouteDto;
import com.example.be.dto.RouteSegmentDto;
import com.example.be.dto.PricePredictionDto;
import com.example.be.model.ReturnRoute;
import com.example.be.types.RouteStatus;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.service.RouteService;
import com.example.be.service.PricePredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RouteController {
    private final RouteService service;
    private final ReturnRouteRepository routeRepo;
    private final PricePredictionService pricePredictionService;

    @GetMapping("/{routeId}")
    public ResponseEntity<?> getRouteById(@PathVariable UUID routeId) {
        return routeRepo.findById(routeId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Route not found"));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateRouteDto dto) {
        log.info("POST /api/routes - Creating new route");
        
        // Validate required fields
        if (dto.getDriverId() == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 400);
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", "driverId is required");
            errorResponse.put("path", "/api/routes");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        if (dto.getOriginLat() == null || dto.getOriginLng() == null || 
            dto.getDestinationLat() == null || dto.getDestinationLng() == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 400);
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", "All location coordinates are required");
            errorResponse.put("path", "/api/routes");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        if (dto.getDepartureTime() == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 400);
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", "departureTime is required");
            errorResponse.put("path", "/api/routes");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        try {
            service.createRoute(dto);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            log.error("Error creating route: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/test")
    public ResponseEntity<String> testCreate(@RequestBody CreateRouteDto dto) {
        log.info("POST /api/routes/test - Testing basic route creation");
        
        try {
            // Create a simple route object
            ReturnRoute route = new ReturnRoute();
            route.setDriverId(dto.getDriverId());
            route.setOriginLat(dto.getOriginLat());
            route.setOriginLng(dto.getOriginLng());
            route.setDestinationLat(dto.getDestinationLat());
            route.setDestinationLng(dto.getDestinationLng());
            route.setDepartureTime(dto.getDepartureTime());
            route.setDetourToleranceKm(dto.getDetourToleranceKm());
            route.setSuggestedPriceMin(dto.getSuggestedPriceMin());
            route.setSuggestedPriceMax(dto.getSuggestedPriceMax());
            route.setStatus(RouteStatus.OPEN);
            
            // Set timestamps manually since we're using native SQL
            java.time.ZonedDateTime now = java.time.ZonedDateTime.now();
            route.setCreatedAt(now);
            route.setUpdatedAt(now);
            
            // Try to save using native SQL with proper enum casting
            routeRepo.insertRouteWithEnum(
                route.getDriverId(),
                route.getOriginLat(),
                route.getOriginLng(),
                route.getDestinationLat(),
                route.getDestinationLng(),
                route.getDepartureTime(),
                route.getDetourToleranceKm(),
                route.getSuggestedPriceMin(),
                route.getSuggestedPriceMax(),
                route.getStatus().name(),
                route.getCreatedAt(),
                route.getUpdatedAt()
            );
            
            return ResponseEntity.ok("Route created successfully!");
            
        } catch (Exception e) {
            log.error("Error creating route: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/segments")
    public ResponseEntity<List<RouteSegmentDto>> getSegments(@RequestParam UUID routeId) {
        log.info("GET /api/routes/segments - Fetching segments for route: {}", routeId);
        // TODO: Implement this method in RouteService
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/price-suggestion")
    public ResponseEntity<PricePredictionDto> getPriceSuggestion(@RequestParam("routeId") UUID routeId) {
        log.info("GET /api/routes/price-suggestion - Fetching price suggestion for route {}", routeId);
        PricePredictionDto suggestion = pricePredictionService.getLatestPriceSuggestion(routeId);
        return ResponseEntity.ok(suggestion);
    }
}
