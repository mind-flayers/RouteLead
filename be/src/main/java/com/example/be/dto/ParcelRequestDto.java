package com.example.be.dto;

import com.example.be.types.ParcelStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class ParcelRequestDto {
    private UUID id;
    private UUID customerId;
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private String description;
    private BigDecimal maxBudget;
    private ZonedDateTime deadline;
    private ParcelStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}

@Data
class ParcelRequestCreateDto {
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private String description;
    private BigDecimal maxBudget;
    private ZonedDateTime deadline;
}

@Data
class ParcelRequestUpdateDto {
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private String description;
    private BigDecimal maxBudget;
    private ZonedDateTime deadline;
    private ParcelStatus status;
} 