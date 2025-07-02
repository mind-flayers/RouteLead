package com.example.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "route_segments")
public class RouteSegment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(name = "route_id", nullable = false)
    private UUID routeId;

    @Column(name = "segment_index", nullable = false)
    private Integer segmentIndex;

    @Column(name = "town_name", nullable = false)
    private String townName;

    @Column(name = "start_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal startLat;

    @Column(name = "start_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal startLng;

    @Column(name = "end_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal endLat;

    @Column(name = "end_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal endLng;

    @Column(name = "distance_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal distanceKm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
    }
} 