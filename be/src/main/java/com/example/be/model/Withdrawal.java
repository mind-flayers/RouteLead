package com.example.be.model;

import com.example.be.types.WithdrawalStatusEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "withdrawals")
public class Withdrawal {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Profile driver;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "bank_details", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> bankDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "withdrawal_status_enum")
    private WithdrawalStatusEnum status = WithdrawalStatusEnum.PENDING;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "processed_at")
    private ZonedDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        if (status == null) {
            status = WithdrawalStatusEnum.PENDING;
        }
    }
} 