package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class CreateRouteDto {
    private UUID driverId;
    private BigDecimal originLat;
    private BigDecimal originLng;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    private ZonedDateTime departureTime;
    private ZonedDateTime biddingStartTime;
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
    
    // Enhanced fields for polyline support
    private String routePolyline; // Google Maps encoded polyline
    private BigDecimal totalDistanceKm; // Total distance from polyline
    private Integer estimatedDurationMinutes; // Estimated travel time
} 