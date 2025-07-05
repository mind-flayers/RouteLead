package com.example.be.controller;

import com.example.be.dto.CreateRouteDto;
import com.example.be.dto.RouteSegmentDto;
import com.example.be.dto.PricePredictionDto;
import com.example.be.dto.ReturnRouteUpdateRequestDto;
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

    @GetMapping("/directions")
    public ResponseEntity<?> getDirections(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng) {
        try {
            var directions = service.getRouteDirections(originLat, originLng, destLat, destLng);
            if (directions.routes != null && directions.routes.length > 0) {
                var response = new java.util.HashMap<String, Object>();
                response.put("status", "OK");
                response.put("origin", String.format("%.6f, %.6f", originLat, originLng));
                response.put("destination", String.format("%.6f, %.6f", destLat, destLng));
                
                // Get up to 3 best routes
                var routes = new java.util.ArrayList<java.util.Map<String, Object>>();
                int maxRoutes = Math.min(3, directions.routes.length);
                
                for (int i = 0; i < maxRoutes; i++) {
                    var route = directions.routes[i];
                    var leg = route.legs[0];
                    var routeInfo = new java.util.HashMap<String, Object>();
                    
                    // Basic route info
                    routeInfo.put("route_number", i + 1);
                    routeInfo.put("polyline", route.overviewPolyline.getEncodedPath());
                    routeInfo.put("distance", leg.distance.humanReadable);
                    routeInfo.put("duration", leg.duration.humanReadable);
                    routeInfo.put("start_address", leg.startAddress);
                    routeInfo.put("end_address", leg.endAddress);
                    
                    // Route summary
                    var summary = new java.util.HashMap<String, Object>();
                    summary.put("total_distance_meters", leg.distance.inMeters);
                    summary.put("total_duration_seconds", leg.duration.inSeconds);
                    summary.put("traffic_duration", leg.durationInTraffic != null ? leg.durationInTraffic.humanReadable : null);
                    routeInfo.put("summary", summary);
                    
                    // Detailed road information
                    var steps = new java.util.ArrayList<java.util.Map<String, Object>>();
                    for (var step : leg.steps) {
                        var stepInfo = new java.util.HashMap<String, Object>();
                        stepInfo.put("instruction", step.htmlInstructions);
                        stepInfo.put("distance", step.distance.humanReadable);
                        stepInfo.put("duration", step.duration.humanReadable);
                        stepInfo.put("road_name", step.htmlInstructions.replaceAll("<[^>]*>", "").trim());
                        stepInfo.put("travel_mode", step.travelMode.toString());
                        
                        // Add maneuver information
                        if (step.maneuver != null) {
                            stepInfo.put("maneuver", step.maneuver.toString());
                        }
                        
                        // Add polyline for this step
                        if (step.polyline != null) {
                            stepInfo.put("step_polyline", step.polyline.getEncodedPath());
                        }
                        
                        steps.add(stepInfo);
                    }
                    routeInfo.put("steps", steps);
                    
                    // Road summary
                    var roadSummary = new java.util.HashMap<String, Object>();
                    roadSummary.put("total_steps", steps.size());
                    roadSummary.put("major_roads", extractMajorRoads(steps));
                    routeInfo.put("road_summary", roadSummary);
                    
                    routes.add(routeInfo);
                }
                
                response.put("routes", routes);
                response.put("total_routes_found", directions.routes.length);
                response.put("routes_returned", maxRoutes);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body(java.util.Map.of("status", "ZERO_RESULTS", "message", "No route found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
    
    private java.util.List<String> extractMajorRoads(java.util.List<java.util.Map<String, Object>> steps) {
        var majorRoads = new java.util.ArrayList<String>();
        for (var step : steps) {
            String roadName = (String) step.get("road_name");
            if (roadName != null && !roadName.isEmpty() && !majorRoads.contains(roadName)) {
                majorRoads.add(roadName);
            }
        }
        return majorRoads;
    }

    @PostMapping("/break-polyline")
    public ResponseEntity<?> breakPolylineIntoSegments(
            @RequestParam String polyline,
            @RequestParam(defaultValue = "10.0") double segmentDistanceKm) {
        try {
            log.info("Breaking polyline into {} km segments", segmentDistanceKm);
            
            // Break the polyline into segments
            var segments = service.breakPolylineIntoSegments(polyline, segmentDistanceKm);
            
            var response = new java.util.HashMap<String, Object>();
            response.put("status", "SUCCESS");
            response.put("original_polyline", polyline);
            response.put("segment_distance_km", segmentDistanceKm);
            response.put("total_segments", segments.size());
            
            // Create detailed segment information
            var segmentDetails = new java.util.ArrayList<java.util.Map<String, Object>>();
            
            for (int i = 0; i < segments.size(); i++) {
                var segment = segments.get(i);
                var segmentInfo = new java.util.HashMap<String, Object>();
                
                segmentInfo.put("segment_number", i + 1);
                segmentInfo.put("latitude", segment.getLat());
                segmentInfo.put("longitude", segment.getLng());
                segmentInfo.put("coordinates", String.format("%.6f, %.6f", segment.getLat(), segment.getLng()));
                
                // Calculate distance from start (approximate)
                double distanceFromStart = i * segmentDistanceKm;
                segmentInfo.put("distance_from_start_km", distanceFromStart);
                
                segmentDetails.add(segmentInfo);
            }
            
            response.put("segments", segmentDetails);
            
            // Create a new polyline from the segments (for visualization)
            if (segments.size() > 1) {
                var segmentPolyline = new StringBuilder();
                for (var segment : segments) {
                    if (segmentPolyline.length() > 0) {
                        segmentPolyline.append("|");
                    }
                    segmentPolyline.append(segment.getLat()).append(",").append(segment.getLng());
                }
                response.put("segmented_polyline", segmentPolyline.toString());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error breaking polyline into segments: ", e);
            return ResponseEntity.status(500).body(java.util.Map.of(
                "status", "ERROR", 
                "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{routeId}")
    public ResponseEntity<?> deleteRoute(@PathVariable UUID routeId) {
        log.info("DELETE /api/routes/{} - Deleting route", routeId);
        
        try {
            service.deleteRoute(routeId);
            
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("timestamp", LocalDateTime.now());
            successResponse.put("status", 200);
            successResponse.put("message", "Route deleted successfully");
            successResponse.put("routeId", routeId);
            successResponse.put("path", "/api/routes/" + routeId);
            
            return ResponseEntity.ok(successResponse);
            
        } catch (RuntimeException e) {
            log.error("Error deleting route with ID {}: {}", routeId, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", e.getMessage().contains("not found") ? 404 : 400);
            errorResponse.put("error", e.getMessage().contains("not found") ? "Not Found" : "Bad Request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("path", "/api/routes/" + routeId);
            
            HttpStatus status = e.getMessage().contains("not found") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Unexpected error deleting route with ID {}: ", routeId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "An unexpected error occurred while deleting the route");
            errorResponse.put("details", e.getMessage());
            errorResponse.put("path", "/api/routes/" + routeId);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PatchMapping("/{routeId}")
    public ResponseEntity<?> patchRoute(
            @PathVariable UUID routeId,
            @RequestParam UUID driverId,
            @RequestBody ReturnRouteUpdateRequestDto updateDto) {
        log.info("PATCH /api/routes/{} - Updating route for driver: {}", routeId, driverId);
        
        try {
            ReturnRoute updatedRoute = service.patchRoute(routeId, driverId, updateDto);
            
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("timestamp", LocalDateTime.now());
            successResponse.put("status", 200);
            successResponse.put("message", "Route updated successfully");
            successResponse.put("data", updatedRoute);
            successResponse.put("path", "/api/routes/" + routeId);
            
            return ResponseEntity.ok(successResponse);
            
        } catch (RuntimeException e) {
            log.error("Error updating route with ID {}: {}", routeId, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", e.getMessage().contains("not found") || e.getMessage().contains("access denied") ? 404 : 400);
            errorResponse.put("error", e.getMessage().contains("not found") || e.getMessage().contains("access denied") ? "Not Found" : "Bad Request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("path", "/api/routes/" + routeId);
            
            HttpStatus status = e.getMessage().contains("not found") || e.getMessage().contains("access denied") ? 
                HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Unexpected error updating route with ID {}: ", routeId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "An unexpected error occurred while updating the route");
            errorResponse.put("details", e.getMessage());
            errorResponse.put("path", "/api/routes/" + routeId);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
