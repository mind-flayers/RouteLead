package com.example.be.model;

import com.example.be.types.DeliveryStatusEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @Column(name = "status", nullable = false)
    private String status = "picked_up";

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
        if (status == null || status.isEmpty()) {
            status = "picked_up";
        }
    }
    
    // Helper methods to work with enum
    public DeliveryStatusEnum getStatusEnum() {
        try {
            return DeliveryStatusEnum.valueOf(status);
        } catch (Exception e) {
            return DeliveryStatusEnum.open; // Default to open (initial state)
        }
    }
    
    public void setStatusEnum(DeliveryStatusEnum statusEnum) {
        this.status = statusEnum.name();
    }
    
    // Getter and setter for status string
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
} 