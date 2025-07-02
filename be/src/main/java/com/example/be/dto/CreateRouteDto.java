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
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
} 