package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleUpdateRequestDto {
    private String color;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String plateNumber;
    private BigDecimal maxWeightKg;
    private BigDecimal maxVolumeM3;
    private String vehiclePhotos;
} 