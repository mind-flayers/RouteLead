package com.example.routelead.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for Vehicle responses.
 * Used to transfer vehicle data between layers without exposing internal entity details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Long id;
    private UUID driverId;
    private String color;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String plateNumber;
    private BigDecimal maxWeightKg;
    private BigDecimal maxVolumeM3;
    private String vehiclePhotos;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
} 