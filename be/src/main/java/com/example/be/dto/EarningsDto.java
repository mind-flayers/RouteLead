package com.example.be.dto;

import com.example.be.types.EarningsStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarningsDto {
    private UUID id;
    private UUID driverId;
    private UUID bidId;
    private UUID routeId;
    private String customerName;
    private String routeDescription;
    private BigDecimal grossAmount;
    private BigDecimal appFee;
    private BigDecimal netAmount;
    private EarningsStatusEnum status;
    private ZonedDateTime earnedAt;
    
    // Additional route and bid information for dashboard display
    private String originLocation;
    private String destinationLocation;
    private String parcelDescription;
    private BigDecimal offeredPrice;
}
