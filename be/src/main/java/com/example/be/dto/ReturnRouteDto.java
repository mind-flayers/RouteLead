package com.example.be.dto;

import com.example.be.types.RouteStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class ReturnRouteDto {
    private UUID id;
    private UUID driverId;
    private BigDecimal originLat;
    private BigDecimal originLng;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    private ZonedDateTime departureTime;
    private ZonedDateTime biddingStart;
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
    private RouteStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}

@Data
class ReturnRouteRequestDto {
    private BigDecimal originLat;
    private BigDecimal originLng;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    private ZonedDateTime departureTime;
    private ZonedDateTime biddingStart;
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
} 