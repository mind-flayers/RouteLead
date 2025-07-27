package com.example.be.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class DisputeCreateDto {
    private UUID userId;
    private String description;
    private UUID relatedBidId;
    private UUID relatedRouteId;
    
    // Getters and setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public UUID getRelatedBidId() { return relatedBidId; }
    public void setRelatedBidId(UUID relatedBidId) { this.relatedBidId = relatedBidId; }
    
    public UUID getRelatedRouteId() { return relatedRouteId; }
    public void setRelatedRouteId(UUID relatedRouteId) { this.relatedRouteId = relatedRouteId; }
} 