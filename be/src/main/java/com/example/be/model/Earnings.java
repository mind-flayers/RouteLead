package com.example.be.model;

import com.example.be.types.EarningsStatusEnum;
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
@Table(name = "earnings")
public class Earnings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Profile driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id")
    private Bid bid;

    @Column(name = "gross_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "app_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal appFee;

    @Column(name = "net_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal netAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "earnings_status_enum")
    private EarningsStatusEnum status = EarningsStatusEnum.PENDING;

    @Column(name = "earned_at", nullable = false)
    private ZonedDateTime earnedAt;

    @PrePersist
    protected void onCreate() {
        if (earnedAt == null) {
            earnedAt = ZonedDateTime.now();
        }
        if (status == null) {
            status = EarningsStatusEnum.PENDING;
        }
    }
} 