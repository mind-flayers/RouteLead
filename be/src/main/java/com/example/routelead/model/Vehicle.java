package com.example.routelead.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Entity representing a vehicle in the RouteLead system.
 * Contains information about vehicles registered by drivers.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "routelead_vehicle_details")
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

    @Column(name = "plate_number", nullable = false, unique = true)
    private String plateNumber;

    @Column(name = "max_weight_kg", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal maxWeightKg = BigDecimal.ZERO;

    @Column(name = "max_volume_m3", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal maxVolumeM3 = BigDecimal.ZERO;

    @Column(name = "vehicle_photos", columnDefinition = "jsonb")
    @Builder.Default
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