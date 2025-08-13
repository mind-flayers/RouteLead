package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RouteSegmentRequestDto {
    private Integer segmentIndex;
    private BigDecimal startLat;
    private BigDecimal startLng;
    private BigDecimal endLat;
    private BigDecimal endLng;
    private BigDecimal distanceKm;
    private String locationName; // City/village name for this segment
} 