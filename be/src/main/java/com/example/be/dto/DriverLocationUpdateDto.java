package com.example.be.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
public class DriverLocationUpdateDto {
    private UUID id;
    private UUID deliveryTrackingId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private ZonedDateTime recordedAt;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getDeliveryTrackingId() { return deliveryTrackingId; }
    public void setDeliveryTrackingId(UUID deliveryTrackingId) { this.deliveryTrackingId = deliveryTrackingId; }
    
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    
    public ZonedDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(ZonedDateTime recordedAt) { this.recordedAt = recordedAt; }
} 