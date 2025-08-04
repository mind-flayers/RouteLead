package com.example.be.service;

import com.example.be.dto.CreateRouteDto;
import com.example.be.dto.RouteSegmentDto;
import com.example.be.dto.ReturnRouteUpdateRequestDto;
import com.example.be.dto.RouteDetailsDto;
import com.example.be.dto.BidSummaryDto;
import com.example.be.dto.PricePredictionDto;
import com.example.be.dto.RouteBidWithRequestDto;
import com.example.be.model.ReturnRoute;
import com.example.be.model.RouteSegment;
import com.example.be.types.RouteStatus;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.repository.RouteSegmentRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.util.LatLng;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.GeocodingResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteService {
    private final ReturnRouteRepository routeRepo;
    private final RouteSegmentRepository segRepo;
    private final GoogleMapsClient maps;
    private final PolylineService polyService;
    private final ProfileRepository profileRepo;
    private final com.example.be.service.ParcelRequestService parcelRequestService;
    private final com.example.be.service.BidService bidService;

    @Transactional
    public UUID createRoute(CreateRouteDto dto) throws Exception {
        log.info("Creating route from ({}, {}) to ({}, {})", 
                dto.getOriginLat(), dto.getOriginLng(), dto.getDestinationLat(), dto.getDestinationLng());

        // 1) Validate input data
        if (dto.getRoutePolyline() == null || dto.getRoutePolyline().trim().isEmpty()) {
            throw new IllegalArgumentException("Route polyline is required");
        }

        // 2) Generate UUID for the route
        UUID routeId = UUID.randomUUID();
        
        // 3) Get current timestamp
        ZonedDateTime now = ZonedDateTime.now();
        
        // 4) Use native SQL to insert route with proper enum casting
        routeRepo.insertRouteWithAllFields(
            routeId,
            dto.getDriverId(),
            dto.getOriginLat(),
            dto.getOriginLng(),
            dto.getDestinationLat(),
            dto.getDestinationLng(),
            dto.getDepartureTime(),
            dto.getDetourToleranceKm(),
            dto.getSuggestedPriceMin(),
            dto.getSuggestedPriceMax(),
            RouteStatus.INITIATED.name(), // Convert enum to string for native SQL
            now,
            now,
            dto.getBiddingStartTime(),
            dto.getEstimatedDurationMinutes(),
            dto.getRoutePolyline(),
            dto.getTotalDistanceKm()
        );
        
        log.info("Route created with ID: {}", routeId);

        // 3) Generate route segments using existing polyline service
        try {
            // Use the existing break-polyline functionality to create segments
            // Default segment distance of 10km (can be made configurable)
            List<LatLng> segmentPoints = polyService.sampleByDistance(dto.getRoutePolyline(), 10);
            
            // Create and save route segments
            List<RouteSegment> segments = new ArrayList<>();
            for (int i = 0; i < segmentPoints.size(); i++) {
                LatLng point = segmentPoints.get(i);
                
                RouteSegment segment = new RouteSegment();
                // Create a temporary route object with the ID for the relationship
                ReturnRoute tempRoute = new ReturnRoute();
                tempRoute.setId(routeId);
                segment.setRoute(tempRoute);
                segment.setSegmentIndex(i);
                segment.setStartLat(BigDecimal.valueOf(point.getLat()));
                segment.setStartLng(BigDecimal.valueOf(point.getLng()));
                
                // For the last segment, use destination coordinates
                if (i < segmentPoints.size() - 1) {
                    LatLng nextPoint = segmentPoints.get(i + 1);
                    segment.setEndLat(BigDecimal.valueOf(nextPoint.getLat()));
                    segment.setEndLng(BigDecimal.valueOf(nextPoint.getLng()));
                    
                    // Calculate distance between points
                    double distance = calculateDistance(point, nextPoint);
                    segment.setDistanceKm(BigDecimal.valueOf(distance));
                } else {
                    // Last segment ends at destination
                    segment.setEndLat(dto.getDestinationLat());
                    segment.setEndLng(dto.getDestinationLng());
                    
                    LatLng destination = new LatLng(dto.getDestinationLat().doubleValue(), dto.getDestinationLng().doubleValue());
                    double distance = calculateDistance(point, destination);
                    segment.setDistanceKm(BigDecimal.valueOf(distance));
                }
                
                // Set default town name (can be enhanced with reverse geocoding)
                segment.setTownName("Location " + (i + 1));
                
                segments.add(segment);
            }
            
            // Save all segments
            segRepo.saveAll(segments);
            log.info("Created {} route segments for route {}", segments.size(), routeId);
            
        } catch (Exception e) {
            log.error("Error creating route segments for route {}: {}", routeId, e.getMessage());
            // Don't fail the entire route creation if segment generation fails
            // The route is still valid without segments initially
        }
        
        return routeId;
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     */
    private double calculateDistance(LatLng point1, LatLng point2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(point2.getLat() - point1.getLat());
        double lonDistance = Math.toRadians(point2.getLng() - point1.getLng());
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(point1.getLat())) 
                * Math.cos(Math.toRadians(point2.getLat()))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }

    public List<RouteSegmentDto> getSegments(UUID routeId) {
        log.info("Getting segments for route: {}", routeId);
        
        return segRepo.findByRouteIdOrderBySegmentIndex(routeId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private RouteSegmentDto convertToDto(RouteSegment segment) {
        RouteSegmentDto dto = new RouteSegmentDto();
        dto.setId(segment.getId());
        dto.setRouteId(segment.getRoute() != null ? segment.getRoute().getId() : null);
        dto.setSegmentIndex(segment.getSegmentIndex());
        dto.setTownName(segment.getTownName());
        dto.setStartLat(segment.getStartLat());
        dto.setStartLng(segment.getStartLng());
        dto.setEndLat(segment.getEndLat());
        dto.setEndLng(segment.getEndLng());
        dto.setDistanceKm(segment.getDistanceKm());
        dto.setCreatedAt(segment.getCreatedAt());
        return dto;
    }

    /**
     * Get directions between two points using Google Maps
     */
    public DirectionsResult getRouteDirections(double originLat, double originLng, double destLat, double destLng) throws Exception {
        LatLng origin = new LatLng(originLat, originLng);
        LatLng destination = new LatLng(destLat, destLng);
        return maps.getDirections(origin, destination);
    }

    public List<LatLng> breakPolylineIntoSegments(String encodedPolyline, double segmentDistanceKm) throws Exception {
        log.info("Breaking polyline into {} km segments", segmentDistanceKm);
        
        // Use the existing PolylineService to sample points at the specified distance
        List<LatLng> segments = polyService.sampleByDistance(encodedPolyline, segmentDistanceKm);
        
        log.info("Created {} segments from polyline", segments.size());
        return segments;
    }

    /**
     * Get all routes by driver ID
     */
    public List<ReturnRoute> getRoutesByDriver(UUID driverId) {
        log.info("Fetching all routes for driver: {}", driverId);
        return routeRepo.findByDriverId(driverId);
    }

    /**
     * Get routes by driver ID with optional status filtering
     */
    public List<ReturnRoute> getRoutesByDriver(UUID driverId, RouteStatus status) {
        log.info("Fetching routes for driver: {} with status: {}", driverId, status);
        
        if (status != null) {
            return routeRepo.findByDriverIdAndStatusNative(driverId, status.name());
        } else {
            return routeRepo.findByDriverId(driverId);
        }
    }

    /**
     * Update an existing route
     * @param routeId The ID of the route to update
     * @param updateDto The data to update the route with
     * @return The updated route
     * @throws RuntimeException if the route is not found
     */
    @Transactional
    public ReturnRoute updateRoute(UUID routeId, ReturnRouteUpdateRequestDto updateDto) {
        log.info("Updating route with ID: {}", routeId);
        
        ReturnRoute route = routeRepo.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with ID: " + routeId));
        
        // Update fields if they are provided in the DTO (partial update)
        if (updateDto.getOriginLat() != null) {
            route.setOriginLat(updateDto.getOriginLat());
        }
        if (updateDto.getOriginLng() != null) {
            route.setOriginLng(updateDto.getOriginLng());
        }
        if (updateDto.getDestinationLat() != null) {
            route.setDestinationLat(updateDto.getDestinationLat());
        }
        if (updateDto.getDestinationLng() != null) {
            route.setDestinationLng(updateDto.getDestinationLng());
        }
        if (updateDto.getDepartureTime() != null) {
            route.setDepartureTime(updateDto.getDepartureTime());
        }
        if (updateDto.getDetourToleranceKm() != null) {
            route.setDetourToleranceKm(updateDto.getDetourToleranceKm());
        }
        if (updateDto.getSuggestedPriceMin() != null) {
            route.setSuggestedPriceMin(updateDto.getSuggestedPriceMin());
        }
        if (updateDto.getSuggestedPriceMax() != null) {
            route.setSuggestedPriceMax(updateDto.getSuggestedPriceMax());
        }
        if (updateDto.getStatus() != null) {
            route.setStatus(updateDto.getStatus());
        }
        
        ReturnRoute updatedRoute = routeRepo.save(route);
        log.info("Route updated successfully with ID: {}", routeId);
        
        return updatedRoute;
    }

    /**
     * Partially update an existing route using native SQL (PATCH operation)
     * Only updates fields that are provided in the DTO (non-null values)
     * Verifies that the route belongs to the specified driver
     * 
     * @param routeId The ID of the route to update
     * @param driverId The ID of the driver who owns the route
     * @param updateDto The data to update the route with
     * @return The updated route
     * @throws RuntimeException if the route is not found or doesn't belong to the driver
     */
    @Transactional
    public ReturnRoute patchRoute(UUID routeId, UUID driverId, ReturnRouteUpdateRequestDto updateDto) {
        log.info("Patching route with ID: {} for driver: {}", routeId, driverId);
        
        // First, verify the route exists and belongs to the driver
        ReturnRoute existingRoute = routeRepo.findByIdAndDriverId(routeId, driverId)
                .orElseThrow(() -> new RuntimeException("Route not found or access denied"));
        
        // Check if route can be updated (business logic)
        if (existingRoute.getStatus() == RouteStatus.COMPLETED) {
            throw new RuntimeException("Cannot update completed route");
        }
        
        // Prepare status string for native query
        String statusString = null;
        if (updateDto.getStatus() != null) {
            statusString = updateDto.getStatus().name();
        }
        
        // Perform the update using native SQL
        ZonedDateTime now = ZonedDateTime.now();
        int updatedRows = routeRepo.updateRoutePartially(
            routeId,
            driverId,
            updateDto.getOriginLat(),
            updateDto.getOriginLng(),
            updateDto.getDestinationLat(),
            updateDto.getDestinationLng(),
            updateDto.getDepartureTime(),
            updateDto.getDetourToleranceKm(),
            updateDto.getSuggestedPriceMin(),
            updateDto.getSuggestedPriceMax(),
            statusString,
            now
        );
        
        if (updatedRows == 0) {
            throw new RuntimeException("Route not found or access denied");
        }
        
        // Return the updated route
        ReturnRoute updatedRoute = routeRepo.findByIdAndDriverId(routeId, driverId)
                .orElseThrow(() -> new RuntimeException("Failed to retrieve updated route"));
        
        log.info("Route patched successfully with ID: {} for driver: {}", routeId, driverId);
        return updatedRoute;
    }

    /**
     * Delete a route by ID
     * @param routeId The ID of the route to delete
     * @throws RuntimeException if the route is not found
     */
    @Transactional
    public void deleteRoute(UUID routeId) {
        log.info("Deleting route with ID: {}", routeId);
        
        // Check if route exists
        ReturnRoute route = routeRepo.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found with ID: " + routeId));
        
        // Check if route can be deleted (business logic)
        if (route.getStatus() == RouteStatus.BOOKED || route.getStatus() == RouteStatus.COMPLETED) {
            throw new RuntimeException("Cannot delete route with status: " + route.getStatus() + 
                ". Only OPEN or CANCELLED routes can be deleted.");
        }
        
        // Delete associated route segments first (cascade delete should handle this, but being explicit)
        List<RouteSegment> segments = segRepo.findByRouteIdOrderBySegmentIndex(routeId);
        if (!segments.isEmpty()) {
            segRepo.deleteAll(segments);
            log.info("Deleted {} segments for route: {}", segments.size(), routeId);
        }
        
        // Delete the route
        routeRepo.delete(route);
        log.info("Route deleted successfully with ID: {}", routeId);
    }

    @Transactional(readOnly = true)
    public RouteDetailsDto getRouteDetails(UUID routeId) {
        log.info("Getting detailed route information for route: {}", routeId);
        
        ReturnRoute route = routeRepo.findById(routeId)
            .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));
        
        RouteDetailsDto dto = new RouteDetailsDto();
        
        // Basic route information
        dto.setId(route.getId());
        dto.setOriginLat(route.getOriginLat());
        dto.setOriginLng(route.getOriginLng());
        dto.setDestinationLat(route.getDestinationLat());
        dto.setDestinationLng(route.getDestinationLng());
        dto.setDepartureTime(route.getDepartureTime());
        dto.setDetourToleranceKm(route.getDetourToleranceKm());
        dto.setSuggestedPriceMin(route.getSuggestedPriceMin());
        dto.setSuggestedPriceMax(route.getSuggestedPriceMax());
        dto.setStatus(route.getStatus());
        dto.setCreatedAt(route.getCreatedAt());
        dto.setUpdatedAt(route.getUpdatedAt());
        
        // Driver information
        if (route.getDriver() != null) {
            dto.setDriverId(route.getDriver().getId());
            dto.setDriverName(route.getDriver().getFirstName() + " " + route.getDriver().getLastName());
            dto.setDriverEmail(route.getDriver().getEmail());
            dto.setDriverPhone(route.getDriver().getPhoneNumber());
            dto.setDriverProfilePhoto(route.getDriver().getProfilePhotoUrl());
        }
        
        // Route segments
        List<RouteSegment> segments = segRepo.findByRouteIdOrderBySegmentIndex(routeId);
        dto.setSegments(segments.stream().map(this::convertToDto).collect(Collectors.toList()));
        
        // Calculate total distance
        BigDecimal totalDistance = segments.stream()
            .map(RouteSegment::getDistanceKm)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalDistance(totalDistance);
        
        // Set default values for missing data
        dto.setTotalBids(0);
        dto.setHighestBid(BigDecimal.ZERO);
        dto.setAverageBid(BigDecimal.ZERO);
        dto.setRecentBids(new ArrayList<>());
        dto.setDriverRating(4.5); // Default rating
        dto.setDriverReviewCount(0);
        dto.setEstimatedDuration("1 hr 45 min"); // Default duration
        dto.setRouteImage("https://via.placeholder.com/300x150");
        dto.setRouteTags(List.of("Heavy Cargo", "Fragile Items", "Temperature Sensitive"));
        
        // Set default addresses (these would normally come from geocoding)
        dto.setOriginAddress("Colombo, Sri Lanka");
        dto.setDestinationAddress("Badulla, Sri Lanka");
        
        return dto;
    }

    @Transactional
    public Map<String, Object> createRequestAndBid(RouteBidWithRequestDto dto) {
        log.info("Creating parcel request and bid for route: {}", dto.getRouteId());
        
        try {
            // 1. Create ParcelRequest
            com.example.be.model.ParcelRequest parcelRequest = new com.example.be.model.ParcelRequest();
            
            // Set customer
            parcelRequest.setCustomer(profileRepo.findById(dto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found")));
            
            // Set parcel details
            parcelRequest.setPickupLat(dto.getPickupLat());
            parcelRequest.setPickupLng(dto.getPickupLng());
            parcelRequest.setDropoffLat(dto.getDropoffLat());
            parcelRequest.setDropoffLng(dto.getDropoffLng());
            parcelRequest.setWeightKg(dto.getWeightKg());
            parcelRequest.setVolumeM3(dto.getVolumeM3());
            parcelRequest.setDescription(dto.getDescription());
            parcelRequest.setMaxBudget(dto.getMaxBudget());
            // Set deadline to 7 days from now if not provided
            if (dto.getDeadline() != null) {
                parcelRequest.setDeadline(dto.getDeadline());
            } else {
                parcelRequest.setDeadline(ZonedDateTime.now().plusDays(7));
            }
            parcelRequest.setPickupContactName(dto.getPickupContactName());
            parcelRequest.setPickupContactPhone(dto.getPickupContactPhone());
            parcelRequest.setDeliveryContactName(dto.getDeliveryContactName());
            parcelRequest.setDeliveryContactPhone(dto.getDeliveryContactPhone());
            parcelRequest.setStatus(com.example.be.types.ParcelStatus.OPEN);
            
            // Set timestamps
            ZonedDateTime now = ZonedDateTime.now();
            parcelRequest.setCreatedAt(now);
            parcelRequest.setUpdatedAt(now);
            
            // Save parcel request using native SQL and get the ID directly
            UUID createdRequestId = parcelRequestService.createNativeAndReturnId(parcelRequest);
            
            // 2. Create Bid using the existing BidService
            com.example.be.dto.BidCreateDto bidCreateDto = new com.example.be.dto.BidCreateDto();
            bidCreateDto.setRequestId(createdRequestId); // Use the UUID we got
            bidCreateDto.setRouteId(dto.getRouteId());
            bidCreateDto.setStartIndex(0);
            bidCreateDto.setEndIndex(0);
            bidCreateDto.setOfferedPrice(dto.getOfferedPrice());
            
            // Create the bid
            com.example.be.dto.BidDto createdBid = bidService.createBid(bidCreateDto);
            
            // 3. Return combined response
            Map<String, Object> response = new HashMap<>();
            response.put("requestId", createdRequestId);
            response.put("bidId", createdBid.getId());
            response.put("routeId", dto.getRouteId());
            response.put("customerId", dto.getCustomerId());
            response.put("offeredPrice", createdBid.getOfferedPrice());
            response.put("status", createdBid.getStatus().name());
            response.put("createdAt", createdBid.getCreatedAt());
            response.put("message", "Parcel request and bid created successfully!");
            
            log.info("Successfully created request and bid. Request ID: {}, Bid ID: {}", 
                    createdRequestId, createdBid.getId());
            
            return response;
            
        } catch (Exception e) {
            log.error("Error creating request and bid: ", e);
            log.error("DTO details - RouteId: {}, CustomerId: {}, Weight: {}, Volume: {}", 
                    dto.getRouteId(), dto.getCustomerId(), dto.getWeightKg(), dto.getVolumeM3());
            throw new RuntimeException("Failed to create request and bid: " + e.getMessage());
        }
    }
}