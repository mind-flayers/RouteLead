package com.example.be.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ViewBidsResponseDto {
    // Route information
    private UUID routeId;
    private String routeDisplayId; // Shortened route ID for display
    private String originLocationName;
    private String destinationLocationName;
    private ZonedDateTime departureTime;
    private String status;
    
    // Countdown information
    private Long hoursUntilBiddingEnds;
    private Long minutesUntilBiddingEnds;
    private Boolean biddingActive;
    private String biddingStatus; // "ACTIVE" or "ENDED"
    
    // Bid lists
    private List<DetailedBidDto> pendingBids;
    private List<DetailedBidDto> acceptedBids;
    private List<DetailedBidDto> rejectedBids;
    
    // Summary information
    private Integer totalBidsCount;
    private Integer pendingBidsCount;
    private Integer acceptedBidsCount;
    private Integer rejectedBidsCount;
    private BigDecimal highestBidAmount;
}
