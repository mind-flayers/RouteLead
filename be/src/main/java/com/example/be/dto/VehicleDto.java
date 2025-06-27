package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
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

@Data
class VehicleRequestDto {
    private String color;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String plateNumber;
    private BigDecimal maxWeightKg;
    private BigDecimal maxVolumeM3;
    private String vehiclePhotos;
}

@Data
class VehicleUpdateRequestDto {
    private String color;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String plateNumber;
    private BigDecimal maxWeightKg;
    private BigDecimal maxVolumeM3;
    private String vehiclePhotos;
} 