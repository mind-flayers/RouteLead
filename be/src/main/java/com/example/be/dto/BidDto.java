package com.example.be.dto;

import com.example.be.types.BidStatus;
// import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

public class BidDto {
    private UUID id;
    private UUID requestId;
    private UUID routeId;
    private Integer startIndex;
    private Integer endIndex;
    private BigDecimal offeredPrice;
    private BidStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getRequestId() { return requestId; }
    public void setRequestId(UUID requestId) { this.requestId = requestId; }
    public UUID getRouteId() { return routeId; }
    public void setRouteId(UUID routeId) { this.routeId = routeId; }
    public Integer getStartIndex() { return startIndex; }
    public void setStartIndex(Integer startIndex) { this.startIndex = startIndex; }
    public Integer getEndIndex() { return endIndex; }
    public void setEndIndex(Integer endIndex) { this.endIndex = endIndex; }
    public BigDecimal getOfferedPrice() { return offeredPrice; }
    public void setOfferedPrice(BigDecimal offeredPrice) { this.offeredPrice = offeredPrice; }
    public BidStatus getStatus() { return status; }
    public void setStatus(BidStatus status) { this.status = status; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }




    private String driverName;
    private String vehicleInfo;
    private String customerName;
} 