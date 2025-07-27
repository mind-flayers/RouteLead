package com.example.be.dto;

import com.example.be.types.DisputeStatusEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
public class DisputeDto {
    private UUID id;
    private UUID userId;
    private UUID relatedBidId;
    private UUID relatedRouteId;
    private String description;
    private DisputeStatusEnum status;
    private ZonedDateTime createdAt;
    private ZonedDateTime resolvedAt;
    
    // Additional fields for display
    private String userName;
    private String relatedBidInfo;
    private String relatedRouteInfo;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    
    public UUID getRelatedBidId() { return relatedBidId; }
    public void setRelatedBidId(UUID relatedBidId) { this.relatedBidId = relatedBidId; }
    
    public UUID getRelatedRouteId() { return relatedRouteId; }
    public void setRelatedRouteId(UUID relatedRouteId) { this.relatedRouteId = relatedRouteId; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public DisputeStatusEnum getStatus() { return status; }
    public void setStatus(DisputeStatusEnum status) { this.status = status; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(ZonedDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getRelatedBidInfo() { return relatedBidInfo; }
    public void setRelatedBidInfo(String relatedBidInfo) { this.relatedBidInfo = relatedBidInfo; }
    
    public String getRelatedRouteInfo() { return relatedRouteInfo; }
    public void setRelatedRouteInfo(String relatedRouteInfo) { this.relatedRouteInfo = relatedRouteInfo; }
} 