package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEarningsRequestDto {
    private UUID driverId;
    private UUID bidId;
    private BigDecimal amount; // Can be used as gross amount if grossAmount is not provided
    private BigDecimal grossAmount;
    private BigDecimal appFee;
    private String description;
    
    // Net amount will be calculated as grossAmount - appFee
    // Status will default to PENDING
    
    public BigDecimal getGrossAmount() {
        // If grossAmount is explicitly set, use it; otherwise use amount
        return grossAmount != null ? grossAmount : amount;
    }
    
    public BigDecimal getAppFee() {
        // Default app fee to 0 if not provided
        return appFee != null ? appFee : BigDecimal.ZERO;
    }
}
