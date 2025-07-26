package com.example.be.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
public class RouteBidWithRequestDto {
    // Route information
    private UUID routeId;
    private UUID customerId;
    
    // Parcel request information
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
    private String description;
    private BigDecimal maxBudget;
    private ZonedDateTime deadline;
    private String pickupContactName;
    private String pickupContactPhone;
    private String deliveryContactName;
    private String deliveryContactPhone;
    
    // Bid information
    private BigDecimal offeredPrice;
    private String specialInstructions;
    
    // Getters and setters
    public UUID getRouteId() { return routeId; }
    public void setRouteId(UUID routeId) { this.routeId = routeId; }
    
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    
    public BigDecimal getPickupLat() { return pickupLat; }
    public void setPickupLat(BigDecimal pickupLat) { this.pickupLat = pickupLat; }
    
    public BigDecimal getPickupLng() { return pickupLng; }
    public void setPickupLng(BigDecimal pickupLng) { this.pickupLng = pickupLng; }
    
    public BigDecimal getDropoffLat() { return dropoffLat; }
    public void setDropoffLat(BigDecimal dropoffLat) { this.dropoffLat = dropoffLat; }
    
    public BigDecimal getDropoffLng() { return dropoffLng; }
    public void setDropoffLng(BigDecimal dropoffLng) { this.dropoffLng = dropoffLng; }
    
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    
    public BigDecimal getVolumeM3() { return volumeM3; }
    public void setVolumeM3(BigDecimal volumeM3) { this.volumeM3 = volumeM3; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getMaxBudget() { return maxBudget; }
    public void setMaxBudget(BigDecimal maxBudget) { this.maxBudget = maxBudget; }
    
    public ZonedDateTime getDeadline() { return deadline; }
    public void setDeadline(ZonedDateTime deadline) { this.deadline = deadline; }
    
    public String getPickupContactName() { return pickupContactName; }
    public void setPickupContactName(String pickupContactName) { this.pickupContactName = pickupContactName; }
    
    public String getPickupContactPhone() { return pickupContactPhone; }
    public void setPickupContactPhone(String pickupContactPhone) { this.pickupContactPhone = pickupContactPhone; }
    
    public String getDeliveryContactName() { return deliveryContactName; }
    public void setDeliveryContactName(String deliveryContactName) { this.deliveryContactName = deliveryContactName; }
    
    public String getDeliveryContactPhone() { return deliveryContactPhone; }
    public void setDeliveryContactPhone(String deliveryContactPhone) { this.deliveryContactPhone = deliveryContactPhone; }
    
    public BigDecimal getOfferedPrice() { return offeredPrice; }
    public void setOfferedPrice(BigDecimal offeredPrice) { this.offeredPrice = offeredPrice; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
} 