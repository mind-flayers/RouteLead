package com.example.be.service;

import com.example.be.dto.CreateRouteDto;
import com.example.be.dto.RouteSegmentDto;
import com.example.be.model.ReturnRoute;
import com.example.be.model.RouteSegment;
import com.example.be.types.RouteStatus;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.repository.RouteSegmentRepository;
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
import java.util.List;
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

    @Transactional
    public void createRoute(CreateRouteDto dto) throws Exception {
        log.info("Creating route from ({}, {}) to ({}, {})", 
                dto.getOriginLat(), dto.getOriginLng(), dto.getDestinationLat(), dto.getDestinationLng());

        // 1) persist route entity
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
        route.setStatus(RouteStatus.OPEN); // Explicitly set the status
        
        // Set timestamps manually since we're using native SQL
        ZonedDateTime now = ZonedDateTime.now();
        route.setCreatedAt(now);
        route.setUpdatedAt(now);
        
        // Use native SQL with proper enum casting
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
        
        // For now, skip the complex route processing and return early
        // TODO: Implement proper route ID retrieval and continue with segment creation
        return;

        /*
        // 2) fetch directions
        LatLng origin = new LatLng(dto.getOriginLat(), dto.getOriginLng());
        LatLng destination = new LatLng(dto.getDestinationLat(), dto.getDestinationLng());
        
        DirectionsResult dr = maps.getDirections(origin, destination);
        String poly = dr.routes[0].overviewPolyline.getEncodedPath();

        // 3) sample every 10 km
        List<LatLng> points = polyService.sampleByDistance(poly, 10);

        // 4) reverse‐geocode each point to a town name
        List<String> towns = new ArrayList<>();
        for (LatLng p : points) {
            GeocodingResult[] results = maps.reverseGeocode(new com.google.maps.model.LatLng(p.getLat(), p.getLng()));
            if (results.length > 0) {
                String town = results[0].addressComponents[0].longName;
                if (!towns.contains(town)) {
                    towns.add(town);
                    log.info("Found town: {}", town);
                }
            }
        }
        
        // Ensure we have at least origin and destination
        if (towns.isEmpty()) {
            towns.add("Unknown Location");
        }

        // 5) persist segments
        for (int i = 0; i < towns.size(); i++) {
            RouteSegment segment = new RouteSegment();
            segment.setRouteId(route.getId());
            segment.setSegmentIndex(i);
            segment.setTownName(towns.get(i));
            
            // Set coordinates for the segment
            if (i < points.size()) {
                LatLng point = points.get(i);
                segment.setStartLat(BigDecimal.valueOf(point.getLat()));
                segment.setStartLng(BigDecimal.valueOf(point.getLng()));
                segment.setEndLat(BigDecimal.valueOf(point.getLat()));
                segment.setEndLng(BigDecimal.valueOf(point.getLng()));
            } else {
                // Use destination coordinates for last segment
                segment.setStartLat(dto.getDestinationLat());
                segment.setStartLng(dto.getDestinationLng());
                segment.setEndLat(dto.getDestinationLat());
                segment.setEndLng(dto.getDestinationLng());
            }
            
            segment.setDistanceKm(BigDecimal.ZERO); // Will be calculated later if needed
            
            segRepo.save(segment);
            log.info("Created segment {}: {}", i, towns.get(i));
        }
        
        log.info("Route created with {} segments", towns.size());
        */
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
        dto.setRouteId(segment.getRouteId());
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
} 