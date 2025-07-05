package com.example.be.dto;

import com.example.be.types.RouteStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@Getter
@Setter
public class ReturnRouteUpdateRequestDto {
    private BigDecimal originLat;
    private BigDecimal originLng;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    private ZonedDateTime departureTime;
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
    private RouteStatus status;
}