package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class PricePredictionDto {
    private UUID id;
    private UUID routeId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String modelVersion;
    private String features;
    private ZonedDateTime generatedAt;
}

@Data
class PricePredictionRequestDto {
    private UUID routeId;
    private String modelVersion;
    private String features;
}

@Data
class PricePredictionResponseDto {
    private UUID id;
    private UUID routeId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String modelVersion;
    private ZonedDateTime generatedAt;
    // Additional context
    private String routeInfo;
    private BigDecimal confidence;
} 