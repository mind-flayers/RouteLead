package com.example.be.model;

import com.example.be.types.DeliveryStatusEnum;
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
@Table(name = "delivery_tracking")
public class DeliveryTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    @Column(name = "driver_location_lat", precision = 10, scale = 8)
    private BigDecimal driverLocationLat;

    @Column(name = "driver_location_lng", precision = 10, scale = 8)
    private BigDecimal driverLocationLng;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "delivery_status_enum")
    private DeliveryStatusEnum status = DeliveryStatusEnum.ACCEPTED;

    @Column(name = "estimated_arrival")
    private ZonedDateTime estimatedArrival;

    @Column(name = "actual_pickup_time")
    private ZonedDateTime actualPickupTime;

    @Column(name = "actual_delivery_time")
    private ZonedDateTime actualDeliveryTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        if (status == null) {
            status = DeliveryStatusEnum.ACCEPTED;
        }
    }
} 