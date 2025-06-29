package com.example.routelead.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Data Transfer Object for Vehicle update requests.
 * Contains validation annotations for input validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUpdateRequestDto {
    
    @Size(max = 50, message = "Color must not exceed 50 characters")
    private String color;
    
    @NotBlank(message = "Make is required")
    @Size(min = 1, max = 100, message = "Make must be between 1 and 100 characters")
    private String make;
    
    @NotBlank(message = "Model is required")
    @Size(min = 1, max = 100, message = "Model must be between 1 and 100 characters")
    private String model;
    
    private Integer yearOfManufacture;
    
    @NotBlank(message = "Plate number is required")
    @Size(min = 1, max = 20, message = "Plate number must be between 1 and 20 characters")
    private String plateNumber;
    
    @Positive(message = "Max weight must be positive")
    private BigDecimal maxWeightKg;
    
    @Positive(message = "Max volume must be positive")
    private BigDecimal maxVolumeM3;
    
    private String vehiclePhotos;
} 