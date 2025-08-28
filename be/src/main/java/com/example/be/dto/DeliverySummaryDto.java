package com.example.be.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class DeliverySummaryDto {
    private UUID deliveryTrackingId;
    private UUID bidId;
    private String customerName;
    private BigDecimal bidAmount;
    private ZonedDateTime deliveryStartedAt;
    private ZonedDateTime deliveryCompletedAt;
    private Long totalDeliveryTimeMinutes;
    private String pickupAddress;
    private String dropoffAddress;
    private Integer totalLocationUpdates;
    private BigDecimal totalDistanceKm;
    private String driverName;
    private String parcelDescription;
    private BigDecimal weightKg;
    private BigDecimal volumeM3;
}
