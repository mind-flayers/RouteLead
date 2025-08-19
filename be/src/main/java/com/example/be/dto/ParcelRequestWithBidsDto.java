package com.example.be.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ParcelRequestWithBidsDto {
    private UUID id;
    private UUID customerId;
    private java.math.BigDecimal pickupLat;
    private java.math.BigDecimal pickupLng;
    private java.math.BigDecimal dropoffLat;
    private java.math.BigDecimal dropoffLng;
    private java.math.BigDecimal weightKg;
    private java.math.BigDecimal volumeM3;
    private String description;
    private java.math.BigDecimal maxBudget;
    private java.time.ZonedDateTime deadline;
    private com.example.be.types.ParcelStatus status;
    private String pickupContactName;
    private String pickupContactPhone;
    private String deliveryContactName;
    private String deliveryContactPhone;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    
    // Customer information
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;
    
    // Associated bids for this parcel request
    private List<BidDto> bids;
    private int totalBids;
    private java.math.BigDecimal highestBid;
    private java.math.BigDecimal averageBid;
    private java.math.BigDecimal lowestBid;
} 