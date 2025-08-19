package com.example.be.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class MyRouteDto {
    private UUID id;
    private UUID driverId;
    
    // Location coordinates
    private BigDecimal originLat;
    private BigDecimal originLng;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    
    // Location names (resolved from coordinates)
    private String originLocationName;
    private String destinationLocationName;
    
    // Route details
    private ZonedDateTime departureTime;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime biddingStart;
    
    // Bid information
    private Integer totalBidsCount;
    private BigDecimal highestBidAmount;
    
    // Countdown information
    private Long hoursUntilBiddingEnds;
    private Long minutesUntilBiddingEnds;
    private Boolean biddingActive;
    
    // Additional info
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
    private BigDecimal totalDistanceKm;
    private Integer estimatedDurationMinutes;
}
