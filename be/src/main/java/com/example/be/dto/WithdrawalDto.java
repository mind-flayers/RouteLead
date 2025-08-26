package com.example.be.dto;

import com.example.be.types.WithdrawalStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalDto {
    private UUID id;
    private UUID driverId;
    private BigDecimal amount;
    private Map<String, Object> bankDetails;
    private WithdrawalStatusEnum status;
    private String transactionId;
    private ZonedDateTime processedAt;
    private ZonedDateTime createdAt;
    private String driverName; // For admin view
}
