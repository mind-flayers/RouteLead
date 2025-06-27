package com.example.be.dto;

import com.example.be.types.BidStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
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
}

@Data
class BidCreateDto {
    private UUID requestId;
    private UUID routeId;
    private Integer startIndex;
    private Integer endIndex;
    private BigDecimal offeredPrice;
}

@Data
class BidUpdateDto {
    private BigDecimal offeredPrice;
    private BidStatus status;
}

@Data
class BidResponseDto {
    private UUID id;
    private UUID requestId;
    private UUID routeId;
    private Integer startIndex;
    private Integer endIndex;
    private BigDecimal offeredPrice;
    private BidStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    // Additional fields for response
    private String driverName;
    private String vehicleInfo;
    private String customerName;
} 