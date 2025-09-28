package com.example.be.service;

import com.example.be.dto.BidSelectionDto;
import com.example.be.dto.BidsAndRequestsResponse;
import com.example.be.dto.RouteBidsAndRequestsDto;
import com.example.be.model.Bid;
import com.example.be.model.ReturnRoute;
import com.example.be.repository.BidRepository;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.types.BidStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidClosingService {
    
    private final ReturnRouteRepository routeRepository;
    private final BidRepository bidRepository;
    private final BidService bidService;
    private final BidSelectionService bidSelectionService;
    
    /**
     * Scheduled task that runs every minute to check for routes that need bid closing
     * This ensures bids are closed even if the server was down
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void processExpiredBids() {
        log.info("Starting scheduled bid closing process...");
        
        try {
            // Find routes where bidding should be closed (3 hours before departure)
            ZonedDateTime threeHoursFromNow = ZonedDateTime.now().plusHours(3);
            List<ReturnRoute> routesToClose = routeRepository.findRoutesForBidClosing(threeHoursFromNow);
            
            log.info("Found {} routes that need bid closing", routesToClose.size());
            
            for (ReturnRoute route : routesToClose) {
                try {
                    processRouteBidClosing(route);
                } catch (Exception e) {
                    log.error("Error processing bid closing for route {}: ", route.getId(), e);
                    // Continue with other routes even if one fails
                }
            }
            
        } catch (Exception e) {
            log.error("Error in scheduled bid closing process: ", e);
        }
    }
    
    /**
     * Process bid closing for a specific route
     */
    private void processRouteBidClosing(ReturnRoute route) {
        UUID routeId = route.getId();
        log.info("Processing bid closing for route: {}", routeId);
        
        // Check if bidding is already closed for this route
        if (isBiddingAlreadyClosed(routeId)) {
            log.info("Bidding already closed for route: {}", routeId);
            return;
        }
        
        // Get all pending bids for this route using native SQL
        RouteBidsAndRequestsDto bidsAndRequests = bidService.getBidsAndRequestsByRouteId(routeId, BidStatus.PENDING);
        
        if (bidsAndRequests.getTotalBids() == 0) {
            log.info("No pending bids found for route: {}", routeId);
            return;
        }
        
        log.info("Found {} pending bids for route: {}", bidsAndRequests.getTotalBids(), routeId);
        
        // Convert to BidsAndRequestsResponse format
        BidsAndRequestsResponse response = new BidsAndRequestsResponse();
        response.setRouteId(bidsAndRequests.getRouteId());
        response.setParcelRequestsWithBids(bidsAndRequests.getParcelRequestsWithBids());
        response.setTotalParcelRequests(bidsAndRequests.getTotalParcelRequests());
        response.setTotalBids(bidsAndRequests.getTotalBids());
        response.setHighestBid(bidsAndRequests.getHighestBid());
        response.setAverageBid(bidsAndRequests.getAverageBid());
        response.setLowestBid(bidsAndRequests.getLowestBid());
        
        // Get ranked bids and select the winner
        List<BidSelectionDto> rankedBids = bidSelectionService.getAllBidsRanked(routeId, response);
        
        if (rankedBids.isEmpty()) {
            log.info("No ranked bids found for route: {}", routeId);
            return;
        }
        
        // Select the winning bid (highest score)
        BidSelectionDto winningBid = rankedBids.get(0);
        log.info("Selected winning bid: {} with score: {} for route: {}", 
                winningBid.getId(), winningBid.getScore(), routeId);
        
        // Accept the winning bid
        acceptWinningBid(winningBid.getId());
        
        // Reject all other bids
        rejectOtherBids(rankedBids, winningBid.getId());
        
        // Update route status to indicate bidding is closed
        updateRouteBiddingStatus(routeId, true);
        
        log.info("Successfully closed bidding for route: {} with winning bid: {}", 
                routeId, winningBid.getId());
    }
    
    /**
     * Check if bidding is already closed for a route
     */
    private boolean isBiddingAlreadyClosed(UUID routeId) {
        // Check if there are any accepted bids for this route using native SQL
        List<Bid> acceptedBids = bidRepository.findByRouteIdAndStatusNative(routeId, "ACCEPTED");
        return !acceptedBids.isEmpty();
    }
    
    /**
     * Accept the winning bid using native SQL
     */
    private void acceptWinningBid(UUID bidId) {
        try {
            // Use native SQL to update bid status to avoid enum issues
            bidRepository.updateBidStatus(bidId, "ACCEPTED");
            log.info("Successfully accepted winning bid: {}", bidId);
        } catch (Exception e) {
            log.error("Error accepting winning bid {}: ", bidId, e);
            throw e;
        }
    }
    
    /**
     * Reject all other bids using native SQL
     */
    private void rejectOtherBids(List<BidSelectionDto> rankedBids, UUID winningBidId) {
        for (BidSelectionDto bid : rankedBids) {
            if (!bid.getId().equals(winningBidId)) {
                try {
                    // Use native SQL to update bid status to avoid enum issues
                    bidRepository.updateBidStatus(bid.getId(), "REJECTED");
                    log.debug("Rejected bid: {}", bid.getId());
                } catch (Exception e) {
                    log.error("Error rejecting bid {}: ", bid.getId(), e);
                    // Continue with other bids even if one fails
                }
            }
        }
    }
    
    /**
     * Update route bidding status (you might want to add a field to track this)
     */
    private void updateRouteBiddingStatus(UUID routeId, boolean biddingClosed) {
        // This is a placeholder - you might want to add a bidding_closed field to your routes table
        log.info("Route {} bidding status updated to: {}", routeId, biddingClosed ? "CLOSED" : "OPEN");
    }
    
    /**
     * Manual method to close bidding for a specific route (for admin use)
     */
    @Transactional
    public void manuallyCloseBidding(UUID routeId) {
        log.info("Manually closing bidding for route: {}", routeId);
        
        ReturnRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found: " + routeId));
        
        processRouteBidClosing(route);
    }
}
