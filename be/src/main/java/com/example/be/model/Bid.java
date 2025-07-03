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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "route_id", nullable = false)
    private UUID routeId;

    @Column(name = "start_index", nullable = false)
    private Integer startIndex;

    @Column(name = "end_index", nullable = false)
    private Integer endIndex;

    @Column(name = "offered_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal offeredPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "bid_status")
    private BidStatus status = BidStatus.PENDING;

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