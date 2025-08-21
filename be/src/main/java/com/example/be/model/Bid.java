package com.example.be.model;

import com.example.be.types.BidStatus;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
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
@Table(name = "bids")
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private ParcelRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private ReturnRoute route;

    @Column(name = "start_index", nullable = false)
    private Integer startIndex;

    @Column(name = "end_index", nullable = false)
    private Integer endIndex;

    @Column(name = "offered_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal offeredPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "bid_status")
    private BidStatus status = BidStatus.PENDING;

    @Column(name = "pickup_time")
    private ZonedDateTime pickupTime;

    @Column(name = "delivery_time")
    private ZonedDateTime deliveryTime;

    @Column(name = "special_instructions")
    private String specialInstructions;

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
            status = BidStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
} 