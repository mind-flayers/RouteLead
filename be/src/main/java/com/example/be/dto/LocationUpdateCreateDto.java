package com.example.be.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class LocationUpdateCreateDto {
    private UUID deliveryTrackingId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // Getters and setters
    public UUID getDeliveryTrackingId() { return deliveryTrackingId; }
    public void setDeliveryTrackingId(UUID deliveryTrackingId) { this.deliveryTrackingId = deliveryTrackingId; }
    
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
} 