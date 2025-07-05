package com.example.be.dto;

import com.example.be.types.BidStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverBidHistoryDto {
    private UUID bidId;
    private UUID requestId;
    private UUID routeId;
    private Integer startIndex;
    private Integer endIndex;
    private BigDecimal offeredPrice;
    private BidStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Parcel request details
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private String description;
    private BigDecimal maxBudget;
    private ZonedDateTime deadline;
    
    // Customer details
    private String customerFirstName;
    private String customerLastName;
    
    public String getCustomerFullName() {
        return (customerFirstName != null ? customerFirstName : "") + 
               (customerLastName != null ? " " + customerLastName : "").trim();
    }
}
