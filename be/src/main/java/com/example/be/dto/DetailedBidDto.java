package com.example.be.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class DetailedBidDto {
    // Bid information
    private UUID bidId;
    private UUID requestId;
    private UUID routeId;
    private Integer startIndex;
    private Integer endIndex;
    private BigDecimal offeredPrice;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Customer information
    private UUID customerId;
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;
    private String customerProfilePhotoUrl;
    
    // Parcel information
    private String description;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private BigDecimal maxBudget;
    private ZonedDateTime deadline;
    
    // Pickup and delivery locations
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private String pickupLocationName;
    private String dropoffLocationName;
    
    // Contact information
    private String pickupContactName;
    private String pickupContactPhone;
    private String deliveryContactName;
    private String deliveryContactPhone;
    
    // Special instructions
    private String specialInstructions;
    
    // Calculated fields
    private String customerFullName;
    private String timeAgo;
    private String parcelSize; // Formatted dimensions
    
    // Convenience getters
    public String getCustomerFullName() {
        if (customerFirstName == null && customerLastName == null) {
            return "Unknown Customer";
        }
        return (customerFirstName != null ? customerFirstName : "") + 
               (customerLastName != null ? " " + customerLastName : "").trim();
    }
}
