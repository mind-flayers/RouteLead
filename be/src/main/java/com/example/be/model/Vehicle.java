package com.example.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "vehicle_details")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "color")
    private String color;

    @Column(name = "make", nullable = false)
    private String make;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(name = "plate_number", nullable = false)
    private String plateNumber;

    @Column(name = "max_weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxWeightKg = BigDecimal.ZERO;

    @Column(name = "max_volume_m3", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxVolumeM3 = BigDecimal.ZERO;

    @Column(name = "vehicle_photos", columnDefinition = "jsonb")
    private String vehiclePhotos = "[]";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = ZonedDateTime.now();
        }
        if (maxWeightKg == null) {
            maxWeightKg = BigDecimal.ZERO;
        }
        if (maxVolumeM3 == null) {
            maxVolumeM3 = BigDecimal.ZERO;
        }
        if (vehiclePhotos == null) {
            vehiclePhotos = "[]";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
} 