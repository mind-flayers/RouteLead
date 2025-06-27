package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class RouteSegmentDto {
    private UUID id;
    private UUID routeId;
    private Integer segmentIndex;
    private BigDecimal startLat;
    private BigDecimal startLng;
    private BigDecimal endLat;
    private BigDecimal endLng;
    private BigDecimal distanceKm;
    private ZonedDateTime createdAt;
}

@Data
class RouteSegmentRequestDto {
    private Integer segmentIndex;
    private BigDecimal startLat;
    private BigDecimal startLng;
    private BigDecimal endLat;
    private BigDecimal endLng;
    private BigDecimal distanceKm;
}

@Data
class RouteSegmentUpdateRequestDto {
    private BigDecimal startLat;
    private BigDecimal startLng;
    private BigDecimal endLat;
    private BigDecimal endLng;
    private BigDecimal distanceKm;
} 