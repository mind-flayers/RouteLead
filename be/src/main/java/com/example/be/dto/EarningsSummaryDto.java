package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarningsSummaryDto {
    private BigDecimal todayEarnings;
    private BigDecimal weeklyEarnings;
    private BigDecimal availableBalance;
    private Long monthlyCompletedDeliveries;
    private Integer pendingBidsCount;
    
    // Growth percentages (optional for dashboard display)
    private Double todayGrowthPercentage;
    private Double weeklyGrowthPercentage;
}
