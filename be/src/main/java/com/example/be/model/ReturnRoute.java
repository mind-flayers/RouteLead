package com.example.be.model;

import com.example.be.types.RouteStatus;
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
@Table(name = "return_routes")
public class ReturnRoute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "origin_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal originLat;

    @Column(name = "origin_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal originLng;

    @Column(name = "destination_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal destinationLat;

    @Column(name = "destination_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal destinationLng;

    @Column(name = "departure_time", nullable = false)
    private ZonedDateTime departureTime;

    @Column(name = "detour_tolerance_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal detourToleranceKm = BigDecimal.ZERO;

    @Column(name = "suggested_price_min", nullable = false, precision = 10, scale = 2)
    private BigDecimal suggestedPriceMin;

    @Column(name = "suggested_price_max", nullable = false, precision = 10, scale = 2)
    private BigDecimal suggestedPriceMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "route_status")
    private RouteStatus status = RouteStatus.OPEN;

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
        if (status == null) {
            status = RouteStatus.OPEN;
        }
        if (detourToleranceKm == null) {
            detourToleranceKm = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
} 