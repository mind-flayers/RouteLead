package com.example.be.model;

import com.example.be.types.DeliveryStatusEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @OneToMany(mappedBy = "deliveryTracking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DriverLocationUpdate> locationUpdates = new ArrayList<>();

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