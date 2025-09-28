package com.example.be.controller;

import com.example.be.dto.CreateRouteDto;
import com.example.be.dto.RouteSegmentDto;
import com.example.be.dto.PricePredictionDto;
import com.example.be.dto.ReturnRouteUpdateRequestDto;
import com.example.be.dto.RouteDetailsDto;
import com.example.be.dto.RouteBidCreateDto;
import com.example.be.dto.RouteBidWithRequestDto;
import com.example.be.dto.BidDto;
import com.example.be.dto.SimpleRouteDto;
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
import java.util.Optional;
import com.example.be.model.Profile;
import com.example.be.repository.ProfileRepository;
import com.example.be.service.BidSelectionService;
import com.example.be.dto.BidsAndRequestsResponse;
import com.example.be.dto.BidSelectionDto;

@Slf4j
@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RouteController {
    private final RouteService service;
    private final ReturnRouteRepository routeRepo;
    private final PricePredictionService pricePredictionService;
    private final ProfileRepository profileRepository;
    private final com.example.be.service.BidService bidService;
    private final BidSelectionService bidSelectionService;

    @GetMapping
    public ResponseEntity<?> getRecentRoutes(@RequestParam(defaultValue = "3") int limit) {
        log.info("GET /api/routes - Fetching {} most recent routes", limit);
        try {
            List<ReturnRoute> routes = routeRepo.findAll()
                .stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
            
            // Convert to SimpleRouteDto to avoid circular references
            List<SimpleRouteDto> routeDtos = routes.stream()
                .map(route -> {
                    SimpleRouteDto dto = new SimpleRouteDto();
                    dto.setId(route.getId());
                    dto.setDriverId(route.getDriver().getId());
                    dto.setDriverName(route.getDriver().getFirstName() + " " + route.getDriver().getLastName());
                    dto.setDriverEmail(route.getDriver().getEmail());
                    dto.setDriverPhone(route.getDriver().getPhoneNumber());
                    dto.setDriverProfilePhoto(route.getDriver().getProfilePhotoUrl());
                    dto.setOriginLat(route.getOriginLat());
                    dto.setOriginLng(route.getOriginLng());
                    dto.setOriginAddress(null); // Address not stored in ReturnRoute entity
                    dto.setDestinationLat(route.getDestinationLat());
                    dto.setDestinationLng(route.getDestinationLng());
                    dto.setDestinationAddress(null); // Address not stored in ReturnRoute entity
                    dto.setDepartureTime(route.getDepartureTime());
                    dto.setDetourToleranceKm(route.getDetourToleranceKm());
                    dto.setSuggestedPriceMin(route.getSuggestedPriceMin());
                    dto.setSuggestedPriceMax(route.getSuggestedPriceMax());
                    dto.setStatus(route.getStatus().name());
                    dto.setCreatedAt(route.getCreatedAt());
                    dto.setUpdatedAt(route.getUpdatedAt());
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(routeDtos);
        } catch (Exception e) {
            log.error("Error fetching recent routes: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{routeId}")
    public ResponseEntity<?> getRouteById(@PathVariable UUID routeId) {
        log.info("GET /api/routes/{} - Fetching route by ID", routeId);
        try {
            Optional<ReturnRoute> routeOpt = routeRepo.findById(routeId);
            if (routeOpt.isPresent()) {
                ReturnRoute route = routeOpt.get();
                // Convert to SimpleRouteDto to avoid circular references
                SimpleRouteDto dto = new SimpleRouteDto();
                dto.setId(route.getId());
                dto.setDriverId(route.getDriver().getId());
                dto.setDriverName(route.getDriver().getFirstName() + " " + route.getDriver().getLastName());
                dto.setDriverEmail(route.getDriver().getEmail());
                dto.setDriverPhone(route.getDriver().getPhoneNumber());
                dto.setDriverProfilePhoto(route.getDriver().getProfilePhotoUrl());
                dto.setOriginLat(route.getOriginLat());
                dto.setOriginLng(route.getOriginLng());
                dto.setOriginAddress(null); // Address not stored in ReturnRoute entity
                dto.setDestinationLat(route.getDestinationLat());
                dto.setDestinationLng(route.getDestinationLng());
                dto.setDestinationAddress(null); // Address not stored in ReturnRoute entity
                dto.setDepartureTime(route.getDepartureTime());
                dto.setDetourToleranceKm(route.getDetourToleranceKm());
                dto.setSuggestedPriceMin(route.getSuggestedPriceMin());
                dto.setSuggestedPriceMax(route.getSuggestedPriceMax());
                dto.setStatus(route.getStatus().name());
                dto.setCreatedAt(route.getCreatedAt());
                dto.setUpdatedAt(route.getUpdatedAt());
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Route not found"));
            }
        } catch (Exception e) {
            log.error("Error fetching route by ID: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{routeId}/details")
    public ResponseEntity<?> getRouteDetails(@PathVariable UUID routeId) {
        log.info("GET /api/routes/{}/details - Fetching detailed route information", routeId);
        try {
            RouteDetailsDto routeDetails = service.getRouteDetails(routeId);
            return ResponseEntity.ok(routeDetails);
        } catch (Exception e) {
            log.error("Error fetching route details: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/" + routeId + "/details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/test/details")
    public ResponseEntity<?> getTestRouteDetails() {
        log.info("GET /api/routes/test/details - Fetching test route details");
        try {
            // Hardcoded route ID for testing
            UUID testRouteId = UUID.fromString("1cc88146-8e0b-41fa-a81a-17168a1407ec");
            RouteDetailsDto routeDetails = service.getRouteDetails(testRouteId);
            return ResponseEntity.ok(routeDetails);
        } catch (Exception e) {
            log.error("Error fetching test route details: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/test/details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/mock/details")
    public ResponseEntity<?> getMockRouteDetails() {
        log.info("GET /api/routes/mock/details - Fetching mock route details");
        try {
            RouteDetailsDto mockData = new RouteDetailsDto();
            
            // Set basic route information
            mockData.setId(UUID.fromString("1cc88146-8e0b-41fa-a81a-17168a1407ec"));
            mockData.setOriginLat(new java.math.BigDecimal("6.9271"));
            mockData.setOriginLng(new java.math.BigDecimal("79.8612"));
            mockData.setOriginAddress("Badulla, Sri Lanka");
            mockData.setDestinationLat(new java.math.BigDecimal("6.9934"));
            mockData.setDestinationLng(new java.math.BigDecimal("81.0550"));
            mockData.setDestinationAddress("Badulla, Sri Lanka");
            mockData.setDepartureTime(java.time.ZonedDateTime.now().plusDays(1));
            mockData.setDetourToleranceKm(new java.math.BigDecimal("5.0"));
            mockData.setSuggestedPriceMin(new java.math.BigDecimal("150.00"));
            mockData.setSuggestedPriceMax(new java.math.BigDecimal("300.00"));
            mockData.setStatus(com.example.be.types.RouteStatus.INITIATED);
            mockData.setCreatedAt(java.time.ZonedDateTime.now().minusHours(2));
            mockData.setUpdatedAt(java.time.ZonedDateTime.now().minusHours(1));
            
            // Driver information
            mockData.setDriverId(UUID.randomUUID());
            mockData.setDriverName("Sanjika Pissu");
            mockData.setDriverEmail("sanjika.pisuda@example.com");
            mockData.setDriverPhone("+94 999999999");
            mockData.setDriverProfilePhoto("https://via.placeholder.com/12");
            mockData.setDriverRating(4.8);
            mockData.setDriverReviewCount(287);
            
            // Vehicle information
            mockData.setVehicleMake("Toyota");
            mockData.setVehicleModel("Hilux");
            mockData.setVehiclePlateNumber("WP-ABC-1234");
            mockData.setVehicleMaxWeight(new java.math.BigDecimal("1000.00"));
            mockData.setVehicleMaxVolume(new java.math.BigDecimal("5.0"));
            
            // Bid information
            mockData.setTotalBids(7);
            mockData.setHighestBid(new java.math.BigDecimal("250.00"));
            mockData.setAverageBid(new java.math.BigDecimal("200.00"));
            mockData.setRecentBids(new java.util.ArrayList<>());
            
            // Route information
            mockData.setTotalDistance(new java.math.BigDecimal("45.2"));
            mockData.setEstimatedDuration("1 hr 45 min");
            mockData.setRouteImage("https://via.placeholder.com/300x150");
            mockData.setRouteTags(java.util.List.of("Heavy Cargo", "Fragile Items", "Temperature Sensitive"));
            
            // Route segments
            java.util.List<RouteSegmentDto> segments = new java.util.ArrayList<>();
            RouteSegmentDto segment1 = new RouteSegmentDto();
            segment1.setId(UUID.randomUUID());
            segment1.setRouteId(mockData.getId());
            segment1.setSegmentIndex(0);
            segment1.setLocationName("Colombo");
            segment1.setStartLat(new java.math.BigDecimal("6.9271"));
            segment1.setStartLng(new java.math.BigDecimal("79.8612"));
            segment1.setEndLat(new java.math.BigDecimal("6.9600"));
            segment1.setEndLng(new java.math.BigDecimal("80.0000"));
            segment1.setDistanceKm(new java.math.BigDecimal("15.5"));
            segments.add(segment1);
            
            RouteSegmentDto segment2 = new RouteSegmentDto();
            segment2.setId(UUID.randomUUID());
            segment2.setRouteId(mockData.getId());
            segment2.setSegmentIndex(1);
            segment2.setLocationName("Kandy");
            segment2.setStartLat(new java.math.BigDecimal("6.9600"));
            segment2.setStartLng(new java.math.BigDecimal("80.0000"));
            segment2.setEndLat(new java.math.BigDecimal("6.9934"));
            segment2.setEndLng(new java.math.BigDecimal("81.0550"));
            segment2.setDistanceKm(new java.math.BigDecimal("29.7"));
            segments.add(segment2);
            
            mockData.setSegments(segments);
            
            return ResponseEntity.ok(mockData);
        } catch (Exception e) {
            log.error("Error creating mock route details: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/mock/details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRoute(@RequestBody CreateRouteDto createRouteDto) {
        log.info("POST /api/routes/create - Creating new route for driver {}", createRouteDto.getDriverId());
        
        try {
            // Validate required fields
            if (createRouteDto.getDriverId() == null) {
                return ResponseEntity.badRequest().body("Driver ID is required");
            }
            if (createRouteDto.getOriginLat() == null || createRouteDto.getOriginLng() == null) {
                return ResponseEntity.badRequest().body("Origin coordinates are required");
            }
            if (createRouteDto.getDestinationLat() == null || createRouteDto.getDestinationLng() == null) {
                return ResponseEntity.badRequest().body("Destination coordinates are required");
            }
            if (createRouteDto.getDepartureTime() == null) {
                return ResponseEntity.badRequest().body("Departure time is required");
            }
            if (createRouteDto.getRoutePolyline() == null || createRouteDto.getRoutePolyline().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Route polyline is required");
            }
            
            UUID routeId = service.createRoute(createRouteDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("routeId", routeId);
            response.put("message", "Route created successfully");
            response.put("status", "SUCCESS");
            response.put("segmentsCount", createRouteDto.getSegments() != null ? createRouteDto.getSegments().size() : 0);
            
            log.info("Route created successfully with ID: {}", routeId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid route data: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 400);
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("path", "/api/routes/create");
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error creating route: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "Failed to create route: " + e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/create");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{routeId}/place-bid")
    public ResponseEntity<?> placeBidOnRoute(@PathVariable UUID routeId, @RequestBody RouteBidCreateDto bidCreateDto) {
        log.info("POST /api/routes/{}/place-bid - Placing bid on route", routeId);
        try {
            // Set the route ID from the path variable
            bidCreateDto.setRouteId(routeId);
            
            // Create the bid using the BidService
            BidDto createdBid = bidService.createRouteBid(bidCreateDto);
            
            // Create response with additional message
            Map<String, Object> bidResponse = new HashMap<>();
            bidResponse.put("id", createdBid.getId());
            bidResponse.put("routeId", createdBid.getRouteId());
            bidResponse.put("customerId", bidCreateDto.getCustomerId());
            bidResponse.put("offeredPrice", createdBid.getOfferedPrice());
            bidResponse.put("specialInstructions", bidCreateDto.getSpecialInstructions());
            bidResponse.put("status", createdBid.getStatus().name());
            bidResponse.put("createdAt", createdBid.getCreatedAt());
            bidResponse.put("message", "Bid placed successfully!");
            
            return ResponseEntity.ok(bidResponse);
        } catch (Exception e) {
            log.error("Error placing bid on route: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/" + routeId + "/place-bid");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{routeId}/create-request-and-bid")
    public ResponseEntity<?> createRequestAndBid(@PathVariable UUID routeId, @RequestBody RouteBidWithRequestDto dto) {
        log.info("POST /api/routes/{}/create-request-and-bid - Creating request and bid", routeId);
        try {
            // Set the route ID from the path variable
            dto.setRouteId(routeId);
            
            // Create both request and bid using the RouteService
            Map<String, Object> result = service.createRequestAndBid(dto);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating request and bid: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/" + routeId + "/create-request-and-bid");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{routeId}/bids-and-requests")
    public ResponseEntity<?> getBidsAndRequestsForRoute(
            @PathVariable UUID routeId,
            @RequestParam(required = false) com.example.be.types.BidStatus status) {
        log.info("GET /api/routes/{}/bids-and-requests - Fetching bids and requests for route with status: {}", routeId, status);
        try {
            com.example.be.dto.RouteBidsAndRequestsDto result = bidService.getBidsAndRequestsByRouteId(routeId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", LocalDateTime.now());
            response.put("status", 200);
            response.put("message", "Bids and requests retrieved successfully");
            response.put("data", result);
            response.put("path", "/api/routes/" + routeId + "/bids-and-requests");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching bids and requests for route: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/" + routeId + "/bids-and-requests");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{routeId}/optimal-bids")
    public ResponseEntity<?> getOptimalBidsForRoute(
            @PathVariable UUID routeId,
            @RequestParam(required = false) com.example.be.types.BidStatus status) {
        log.info("GET /api/routes/{}/optimal-bids - Selecting optimal bids for route with status: {}", routeId, status);
        try {
            // First get the bids and requests
            com.example.be.dto.RouteBidsAndRequestsDto bidsAndRequests = bidService.getBidsAndRequestsByRouteId(routeId, status);
            
            // Convert to BidsAndRequestsResponse format
            com.example.be.dto.BidsAndRequestsResponse response = new com.example.be.dto.BidsAndRequestsResponse();
            response.setRouteId(bidsAndRequests.getRouteId());
            response.setParcelRequestsWithBids(bidsAndRequests.getParcelRequestsWithBids());
            response.setTotalParcelRequests(bidsAndRequests.getTotalParcelRequests());
            response.setTotalBids(bidsAndRequests.getTotalBids());
            response.setHighestBid(bidsAndRequests.getHighestBid());
            response.setAverageBid(bidsAndRequests.getAverageBid());
            response.setLowestBid(bidsAndRequests.getLowestBid());
            
            // Select optimal bids
            List<com.example.be.dto.BidSelectionDto> optimalBids = bidSelectionService.selectOptimalBids(routeId, response);
            
            Map<String, Object> result = new HashMap<>();
            result.put("timestamp", LocalDateTime.now());
            result.put("status", 200);
            result.put("message", "Optimal bids selected successfully");
            result.put("routeId", routeId);
            result.put("totalBidsConsidered", bidsAndRequests.getTotalBids());
            result.put("optimalBidsSelected", optimalBids.size());
            result.put("selectionCriteria", Map.of(
                "priceWeight", bidSelectionService.getWPrice(),
                "volumeWeight", bidSelectionService.getWVolume(),
                "distanceWeight", bidSelectionService.getWDistance(),
                "detourWeight", bidSelectionService.getWDetour(),
                "vehicleCapacity", bidSelectionService.getCapacityC()
            ));
            result.put("optimalBids", optimalBids);
            result.put("path", "/api/routes/" + routeId + "/optimal-bids");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error selecting optimal bids for route: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/" + routeId + "/optimal-bids");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{routeId}/ranked-bids")
    public ResponseEntity<?> getRankedBidsForRoute(
            @PathVariable UUID routeId,
            @RequestParam(required = false) com.example.be.types.BidStatus status) {
        log.info("GET /api/routes/{}/ranked-bids - Ranking all bids for route with status: {}", routeId, status);
        try {
            // First get the bids and requests
            com.example.be.dto.RouteBidsAndRequestsDto bidsAndRequests = bidService.getBidsAndRequestsByRouteId(routeId, status);
            
            // Convert to BidsAndRequestsResponse format
            com.example.be.dto.BidsAndRequestsResponse response = new com.example.be.dto.BidsAndRequestsResponse();
            response.setRouteId(bidsAndRequests.getRouteId());
            response.setParcelRequestsWithBids(bidsAndRequests.getParcelRequestsWithBids());
            response.setTotalParcelRequests(bidsAndRequests.getTotalParcelRequests());
            response.setTotalBids(bidsAndRequests.getTotalBids());
            response.setHighestBid(bidsAndRequests.getHighestBid());
            response.setAverageBid(bidsAndRequests.getAverageBid());
            response.setLowestBid(bidsAndRequests.getLowestBid());
            
            // Get all bids ranked by score
            List<com.example.be.dto.BidSelectionDto> rankedBids = bidSelectionService.getAllBidsRanked(routeId, response);
            
            Map<String, Object> result = new HashMap<>();
            result.put("timestamp", LocalDateTime.now());
            result.put("status", 200);
            result.put("message", "All bids ranked successfully");
            result.put("routeId", routeId);
            result.put("totalBids", rankedBids.size());
            result.put("rankingCriteria", Map.of(
                "priceWeight", bidSelectionService.getWPrice(),
                "volumeWeight", bidSelectionService.getWVolume(),
                "distanceWeight", bidSelectionService.getWDistance(),
                "detourWeight", bidSelectionService.getWDetour(),
                "vehicleCapacity", bidSelectionService.getCapacityC()
            ));
            result.put("rankedBids", rankedBids);
            result.put("path", "/api/routes/" + routeId + "/ranked-bids");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error ranking bids for route: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/api/routes/" + routeId + "/ranked-bids");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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

        // Validate polyline data (required for complete route creation)
        if (dto.getRoutePolyline() == null || dto.getRoutePolyline().trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", 400);
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", "routePolyline is required for route creation");
            errorResponse.put("path", "/api/routes");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        try {
            UUID routeId = service.createRoute(dto);
            
            // Return success response with created route ID
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("timestamp", LocalDateTime.now());
            successResponse.put("status", 201);
            successResponse.put("message", "Route created successfully");
            successResponse.put("routeId", routeId);
            successResponse.put("path", "/api/routes");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);
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
            Profile driver = profileRepository.findById(dto.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + dto.getDriverId()));
            route.setDriver(driver);
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
                route.getDriver().getId(),
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
