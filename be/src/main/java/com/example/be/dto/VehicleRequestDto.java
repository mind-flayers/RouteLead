package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class VehicleRequestDto {
    private UUID driverId;
    private String color;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String plateNumber;
    private BigDecimal maxWeightKg;
    private BigDecimal maxVolumeM3;
    private List<String> vehiclePhotos;
    
    // Manual getters in case Lombok is not working
    public UUID getDriverId() { return driverId; }
    public String getColor() { return color; }
    public String getMake() { return make; }
    public String getModel() { return model; }
    public Integer getYearOfManufacture() { return yearOfManufacture; }
    public String getPlateNumber() { return plateNumber; }
    public BigDecimal getMaxWeightKg() { return maxWeightKg; }
    public BigDecimal getMaxVolumeM3() { return maxVolumeM3; }
    public List<String> getVehiclePhotos() { return vehiclePhotos; }
} 