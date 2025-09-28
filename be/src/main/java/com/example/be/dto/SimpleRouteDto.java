package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleRouteDto {
    private UUID id;
    private UUID driverId;
    private String driverName;
    private String driverEmail;
    private String driverPhone;
    private String driverProfilePhoto;
    private BigDecimal originLat;
    private BigDecimal originLng;
    private String originAddress;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    private String destinationAddress;
    private ZonedDateTime departureTime;
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
