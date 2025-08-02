package com.example.be.dto;

import com.example.be.model.ParcelRequest;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class RouteBidsAndRequestsDto {
    private UUID routeId;
    private List<ParcelRequestWithBidsDto> parcelRequestsWithBids;
    private int totalParcelRequests;
    private int totalBids;
    private java.math.BigDecimal highestBid;
    private java.math.BigDecimal averageBid;
    private java.math.BigDecimal lowestBid;
} 