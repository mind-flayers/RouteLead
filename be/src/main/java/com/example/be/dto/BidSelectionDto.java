package com.example.be.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BidSelectionDto {
    private UUID id;
    private UUID requestId;
    private UUID routeId;
    private Integer startIndex;
    private Integer endIndex;
    private BigDecimal offeredPrice;
    private BigDecimal volume;
    private String status;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    
    // Scoring fields
    private Double score;
    private Double normalizedPrice;
    private Double normalizedVolume;
    private Double normalizedDistance;
    private Double detourPercentage;
    
    // Parcel request details
    private String description;
    private BigDecimal maxBudget;
    private java.time.ZonedDateTime deadline;
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;
} 