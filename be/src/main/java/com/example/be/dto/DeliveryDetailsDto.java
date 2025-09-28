package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class DeliveryDetailsDto {
    private UUID deliveryTrackingId;
    private UUID bidId;
    private UUID customerId;
    private UUID driverId;
    
    // Customer Details
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    // Bid Details
    private BigDecimal bidAmount;
    private String status; // Changed from DeliveryStatusEnum to String for proper JSON serialization
    private ZonedDateTime estimatedArrival;
    private ZonedDateTime actualPickupTime;
    private ZonedDateTime actualDeliveryTime;
    
    // Parcel Details
    private String description;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private String pickupContactName;
    private String pickupContactPhone;
    private String deliveryContactName;
    private String deliveryContactPhone;
    
    // Location Details
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private String pickupAddress;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private String dropoffAddress;
    
    // Current Location
    private BigDecimal currentLat;
    private BigDecimal currentLng;
    private ZonedDateTime lastLocationUpdate;
    
    // Additional delivery information
    private String specialInstructions;
    private String parcelPhotos; // JSON string of photo URLs
    private boolean paymentCompleted;
}
