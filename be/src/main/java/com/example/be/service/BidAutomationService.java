package com.example.be.service;

import com.example.be.dto.BidsAndRequestsResponse;
import com.example.be.dto.RouteBidsAndRequestsDto;
import com.example.be.dto.BidSelectionDto;
import com.example.be.model.ReturnRoute;
import com.example.be.model.Bid;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.repository.BidRepository;
import com.example.be.types.RouteStatus;
import com.example.be.types.BidStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BidAutomationService {
    
    private static final Logger log = LoggerFactory.getLogger(BidAutomationService.class);
    
    @Autowired
    private ReturnRouteRepository returnRouteRepository;
    
    @Autowired
    private BidRepository bidRepository;
    
    @Autowired
    private BidService bidService;
    
    @Autowired
    private BidSelectionService bidSelectionService;
    
    /**
     * Scheduled method to automatically process bidding for routes where bidding has ended.
     * Runs every minute to check for routes where bidding should end.
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void processAutomaticBidSelection() {
        log.debug("Running automatic bid selection process...");
        
        try {
            // Get routes where bidding should end (departure_time - 2 hours <= current time)
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime biddingCutoff = now.plusHours(2); // Routes departing in the next 2 hours
            
            List<ReturnRoute> routesForBidding = returnRouteRepository.findRoutesForAutomaticBidding(biddingCutoff);
            
            log.info("Found {} routes eligible for automatic bid selection", routesForBidding.size());
            
            for (ReturnRoute route : routesForBidding) {
                try {
                    processRouteAutomaticBidSelection(route);
                } catch (Exception e) {
                    log.error("Error processing automatic bid selection for route {}: {}", 
                             route.getId(), e.getMessage(), e);
                }
            }
            
        } catch (Exception e) {
            log.error("Error in automatic bid selection process: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Process automatic bid selection for a specific route
     */
    private void processRouteAutomaticBidSelection(ReturnRoute route) {
        log.info("Processing automatic bid selection for route: {}", route.getId());
        
        try {
            // Check if route already has accepted bids
            long acceptedBidsCount = bidRepository.countByRouteIdAndStatus(route.getId(), BidStatus.ACCEPTED.name());
            if (acceptedBidsCount > 0) {
                log.info("Route {} already has accepted bids, skipping automatic selection", route.getId());
                return;
            }
            
            // Get all pending bids for this route
            RouteBidsAndRequestsDto bidsAndRequests = bidService.getBidsAndRequestsByRouteId(route.getId(), BidStatus.PENDING);
            
            if (bidsAndRequests.getTotalBids() == 0) {
                log.info("No pending bids found for route {}, skipping automatic selection", route.getId());
                return;
            }
            
            log.info("Found {} pending bids for route {}", bidsAndRequests.getTotalBids(), route.getId());
            
            // Convert to BidsAndRequestsResponse format for BidSelectionService
            BidsAndRequestsResponse response = new BidsAndRequestsResponse();
            response.setRouteId(bidsAndRequests.getRouteId());
            response.setParcelRequestsWithBids(bidsAndRequests.getParcelRequestsWithBids());
            response.setTotalParcelRequests(bidsAndRequests.getTotalParcelRequests());
            response.setTotalBids(bidsAndRequests.getTotalBids());
            response.setHighestBid(bidsAndRequests.getHighestBid());
            response.setAverageBid(bidsAndRequests.getAverageBid());
            response.setLowestBid(bidsAndRequests.getLowestBid());
            
            // Select optimal bids using the existing service
            List<BidSelectionDto> optimalBids = bidSelectionService.selectOptimalBids(route.getId(), response);
            
            log.info("Selected {} optimal bids for route {}", optimalBids.size(), route.getId());
            
            // Mark selected bids as ACCEPTED
            for (BidSelectionDto selectedBid : optimalBids) {
                try {
                    updateBidStatus(selectedBid.getId(), BidStatus.ACCEPTED);
                    log.info("Marked bid {} as ACCEPTED for route {}", selectedBid.getId(), route.getId());
                } catch (Exception e) {
                    log.error("Error updating bid {} status: {}", selectedBid.getId(), e.getMessage());
                }
            }
            
            // Update route status to BOOKED if we have accepted bids
            if (!optimalBids.isEmpty()) {
                route.setStatus(RouteStatus.BOOKED);
                route.setUpdatedAt(ZonedDateTime.now());
                returnRouteRepository.save(route);
                log.info("Updated route {} status to BOOKED", route.getId());
            }
            
        } catch (Exception e) {
            log.error("Error processing route {} for automatic bid selection: {}", 
                     route.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Update bid status
     */
    private void updateBidStatus(UUID bidId, BidStatus newStatus) {
        Bid bid = bidRepository.findById(bidId)
            .orElseThrow(() -> new RuntimeException("Bid not found: " + bidId));
        
        bid.setStatus(newStatus);
        bid.setUpdatedAt(ZonedDateTime.now());
        bidRepository.save(bid);
        
        log.debug("Updated bid {} status to {}", bidId, newStatus);
    }
}
