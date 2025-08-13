package com.example.be.service;

import com.example.be.dto.CreateRouteDto;
import com.example.be.model.ReturnRoute;
import com.example.be.model.RouteSegment;
import com.example.be.types.RouteStatus;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.repository.RouteSegmentRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.util.LatLng;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteServiceSimple {
    private final ReturnRouteRepository routeRepo;
    private final RouteSegmentRepository segRepo;
    private final PolylineService polyService;
    private final ProfileRepository profileRepo;

    @Transactional
    public UUID createRoute(CreateRouteDto dto) throws Exception {
        log.info("Creating route from ({}, {}) to ({}, {})", 
                dto.getOriginLat(), dto.getOriginLng(), dto.getDestinationLat(), dto.getDestinationLng());

        // 1) Validate input data
        if (dto.getRoutePolyline() == null || dto.getRoutePolyline().trim().isEmpty()) {
            throw new IllegalArgumentException("Route polyline is required");
        }

        // 2) Create and persist route entity
        ReturnRoute route = new ReturnRoute();
        route.setDriver(profileRepo.findById(dto.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found")));
        route.setOriginLat(dto.getOriginLat());
        route.setOriginLng(dto.getOriginLng());
        route.setDestinationLat(dto.getDestinationLat());
        route.setDestinationLng(dto.getDestinationLng());
        route.setDepartureTime(dto.getDepartureTime());
        route.setBiddingStart(dto.getBiddingStartTime());
        route.setDetourToleranceKm(dto.getDetourToleranceKm());
        route.setSuggestedPriceMin(dto.getSuggestedPriceMin());
        route.setSuggestedPriceMax(dto.getSuggestedPriceMax());
        route.setRoutePolyline(dto.getRoutePolyline());
        route.setTotalDistanceKm(dto.getTotalDistanceKm());
        route.setEstimatedDurationMinutes(dto.getEstimatedDurationMinutes());
        route.setStatus(RouteStatus.OPEN);

        ReturnRoute savedRoute = routeRepo.save(route);
        UUID routeId = savedRoute.getId();
        
        log.info("Route created successfully with ID: {}", routeId);

        // 3) Generate route segments using the polyline service
        try {
            List<LatLng> segmentPoints = polyService.sampleByDistance(dto.getRoutePolyline(), 5.0); // 5km segments
            
            List<RouteSegment> segments = new ArrayList<>();
            
            for (int i = 0; i < segmentPoints.size(); i++) {
                LatLng point = segmentPoints.get(i);
                
                RouteSegment segment = new RouteSegment();
                segment.setRoute(savedRoute);
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
                
                // Set default location name (can be enhanced with reverse geocoding)
                segment.setLocationName("Location " + (i + 1));
                
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
}
