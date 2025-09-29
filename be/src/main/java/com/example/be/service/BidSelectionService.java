package com.example.be.service;

import com.example.be.dto.BidSelectionDto;
import com.example.be.dto.BidsAndRequestsResponse;
import com.example.be.dto.ParcelRequestWithBidsDto;
import com.example.be.dto.BidDto;
import com.example.be.model.ReturnRoute;
import com.example.be.repository.ReturnRouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidSelectionService {
    
    // Weights tuned in application.properties
    @Value("${bid.weights.price:0.5}")
    private double wPrice;
    
    @Value("${bid.weights.volume:0.2}")
    private double wVolume;
    
    @Value("${bid.weights.distance:0.2}")
    private double wDistance;
    
    @Value("${bid.weights.detour:0.1}")
    private double wDetour;
    
    @Value("${vehicle.capacity:100.0}")
    private double capacityC;
    
    private final GeocodingService geocodingService;
    
    private final ReturnRouteRepository routeRepository;

    /**
     * Takes the API's BidsAndRequestsResponse, flattens all the BidDTOs into internal Bids,
     * computes a score for each, and then greedily selects the highest-scoring ones
     * that fit capacity segment-by-segment.
     */
    public List<BidSelectionDto> selectOptimalBids(UUID routeId, BidsAndRequestsResponse resp) {
        log.info("Starting optimal bid selection for route: {}", routeId);
        
        // Get route details
        ReturnRoute route = routeRepository.findById(routeId)
            .orElseThrow(() -> new RuntimeException("Route not found: " + routeId));
        
        // 1) figure out the min / max prices across *all* bids
        double minPrice = resp.getLowestBid().doubleValue();
        double maxPrice = resp.getHighestBid().doubleValue();
        double totalDist = 100.0; // Default distance - you can enhance this with actual route calculation
        
        log.info("Price range: min={}, max={}, total distance={}", minPrice, maxPrice, totalDist);

        // 2) flatten every BidDTO in every parcelRequest into a single List<BidSelectionDto>
        List<BidSelectionDto> allBids = resp.getParcelRequestsWithBids().stream()
            .flatMap(req -> req.getBids().stream()
                .map(dto -> createBidSelectionDto(dto, req)))
            .collect(Collectors.toList());

        log.info("Flattened {} bids from {} parcel requests", allBids.size(), resp.getTotalParcelRequests());

        // 3) normalize & score
        allBids.forEach(b -> {
            double normPrice = (maxPrice - minPrice) > 0 ? (b.getOfferedPrice().doubleValue() - minPrice) / (maxPrice - minPrice) : 0.5;
            double normVol = b.getVolume().doubleValue() / capacityC;
            
            // Calculate distance for this bid's segments
            double bidDist = calculateBidDistance(b.getStartIndex(), b.getEndIndex(), route);
            double normDist = bidDist / totalDist;
            
            // Estimate detour percentage (simplified calculation)
            double detourPct = estimateDetourPercentage(b.getStartIndex(), b.getEndIndex(), route);
            
            // Set normalized values
            b.setNormalizedPrice(normPrice);
            b.setNormalizedVolume(normVol);
            b.setNormalizedDistance(normDist);
            b.setDetourPercentage(detourPct);
            
            // Calculate final score
            double score = wPrice * normPrice
                        + wVolume * normVol
                        + wDistance * normDist
                        + wDetour * (1 - detourPct);
            b.setScore(score);
            
            log.debug("Bid {} scored: price={}, vol={}, dist={}, detour={}, final={}", 
                b.getId(), normPrice, normVol, normDist, detourPct, score);
        });

        // 4) greedy pick
        List<BidSelectionDto> selected = new ArrayList<>();
        List<BidSelectionDto> optimalBids = allBids.stream()
            .sorted(Comparator.comparing(BidSelectionDto::getScore).reversed())
            .filter(b -> fitsCapacityOnAllSegments(b, route, selected))
            .peek(selected::add)
            .collect(Collectors.toList());

        log.info("Selected {} optimal bids out of {} total bids", optimalBids.size(), allBids.size());
        
        return optimalBids;
    }

    /**
     * Gets all bids ranked by their scores without applying capacity constraints.
     * This shows the ranking of all bids based on the scoring algorithm.
     */
    public List<BidSelectionDto> getAllBidsRanked(UUID routeId, BidsAndRequestsResponse resp) {
        log.info("Starting bid ranking for route: {}", routeId);
        
        // Get route details
        ReturnRoute route = routeRepository.findById(routeId)
            .orElseThrow(() -> new RuntimeException("Route not found: " + routeId));
        
        // 1) figure out the min / max prices across *all* bids
        double minPrice = resp.getLowestBid().doubleValue();
        double maxPrice = resp.getHighestBid().doubleValue();
        double totalDist = 100.0; // Default distance - you can enhance this with actual route calculation
        
        log.info("Price range: min={}, max={}, total distance={}", minPrice, maxPrice, totalDist);

        // 2) flatten every BidDTO in every parcelRequest into a single List<BidSelectionDto>
        List<BidSelectionDto> allBids = resp.getParcelRequestsWithBids().stream()
            .flatMap(req -> req.getBids().stream()
                .map(dto -> createBidSelectionDto(dto, req)))
            .collect(Collectors.toList());

        log.info("Flattened {} bids from {} parcel requests", allBids.size(), resp.getTotalParcelRequests());

        // 3) normalize & score (same as optimal selection)
        allBids.forEach(b -> {
            double normPrice = (maxPrice - minPrice) > 0 ? (b.getOfferedPrice().doubleValue() - minPrice) / (maxPrice - minPrice) : 0.5;
            double normVol = b.getVolume().doubleValue() / capacityC;
            
            // Calculate distance for this bid's segments
            double bidDist = calculateBidDistance(b.getStartIndex(), b.getEndIndex(), route);
            double normDist = bidDist / totalDist;
            
            // Estimate detour percentage (simplified calculation)
            double detourPct = estimateDetourPercentage(b.getStartIndex(), b.getEndIndex(), route);
            
            // Set normalized values
            b.setNormalizedPrice(normPrice);
            b.setNormalizedVolume(normVol);
            b.setNormalizedDistance(normDist);
            b.setDetourPercentage(detourPct);
            
            // Calculate final score
            double score = wPrice * normPrice
                        + wVolume * normVol
                        + wDistance * normDist
                        + wDetour * (1 - detourPct);
            b.setScore(score);
            
            log.debug("Bid {} scored: price={}, vol={}, dist={}, detour={}, final={}", 
                b.getId(), normPrice, normVol, normDist, detourPct, score);
        });

        // 4) Sort by score (highest first) and return all bids ranked
        List<BidSelectionDto> rankedBids = allBids.stream()
            .sorted(Comparator.comparing(BidSelectionDto::getScore).reversed())
            .collect(Collectors.toList());

        log.info("Ranked {} bids by score", rankedBids.size());
        
        return rankedBids;
    }

    private BidSelectionDto createBidSelectionDto(BidDto bidDto, ParcelRequestWithBidsDto request) {
        BidSelectionDto bid = new BidSelectionDto();
        bid.setId(bidDto.getId());
        bid.setRequestId(request.getId());
        bid.setRouteId(bidDto.getRouteId());
        bid.setStartIndex(bidDto.getStartIndex());
        bid.setEndIndex(bidDto.getEndIndex());
        bid.setOfferedPrice(bidDto.getOfferedPrice());
        bid.setVolume(request.getVolumeM3());
        bid.setStatus(bidDto.getStatus().name());
        bid.setCreatedAt(bidDto.getCreatedAt());
        bid.setUpdatedAt(bidDto.getUpdatedAt());
        
        // Set parcel request details
        bid.setDescription(request.getDescription());
        bid.setMaxBudget(request.getMaxBudget());
        bid.setDeadline(request.getDeadline());
        bid.setCustomerFirstName(request.getCustomerFirstName());
        bid.setCustomerLastName(request.getCustomerLastName());
        bid.setCustomerEmail(request.getCustomerEmail());
        bid.setCustomerPhone(request.getCustomerPhone());
        
        // Set parcel physical details
        bid.setWeightKg(request.getWeightKg());
        bid.setVolumeM3(request.getVolumeM3());
        
        // Set location coordinates
        bid.setPickupLat(request.getPickupLat());
        bid.setPickupLng(request.getPickupLng());
        bid.setDropoffLat(request.getDropoffLat());
        bid.setDropoffLng(request.getDropoffLng());
        
        // Convert coordinates to location names
        try {
            if (request.getPickupLat() != null && request.getPickupLng() != null) {
                String pickupLocation = geocodingService.getLocationName(request.getPickupLat(), request.getPickupLng());
                bid.setPickupLocation(pickupLocation);
            }
            
            if (request.getDropoffLat() != null && request.getDropoffLng() != null) {
                String deliveryLocation = geocodingService.getLocationName(request.getDropoffLat(), request.getDropoffLng());
                bid.setDeliveryLocation(deliveryLocation);
            }
        } catch (Exception e) {
            log.warn("Error geocoding locations for bid {}: {}", bidDto.getId(), e.getMessage());
            // Set fallback coordinate strings if geocoding fails
            if (request.getPickupLat() != null && request.getPickupLng() != null) {
                bid.setPickupLocation(String.format("%.4f, %.4f", 
                    request.getPickupLat().doubleValue(), request.getPickupLng().doubleValue()));
            }
            if (request.getDropoffLat() != null && request.getDropoffLng() != null) {
                bid.setDeliveryLocation(String.format("%.4f, %.4f", 
                    request.getDropoffLat().doubleValue(), request.getDropoffLng().doubleValue()));
            }
        }
        
        return bid;
    }

    private double calculateBidDistance(Integer startIndex, Integer endIndex, ReturnRoute route) {
        // Simplified distance calculation - you can enhance this based on your route segments
        if (startIndex == null || endIndex == null) {
            return 0.0;
        }
        
        // For now, assume equal segment distances
        double totalDistance = 100.0; // Default distance - you can enhance this with actual route calculation
        int totalSegments = Math.max(1, endIndex - startIndex + 1);
        
        return totalDistance * (totalSegments / 10.0); // Simplified calculation
    }

    private double estimateDetourPercentage(Integer startIndex, Integer endIndex, ReturnRoute route) {
        // Simplified detour calculation - you can enhance this based on your route logic
        if (startIndex == null || endIndex == null) {
            return 0.0;
        }
        
        // For now, assume minimal detour for simplicity
        return 0.1; // 10% detour as default
    }

    private boolean fitsCapacityOnAllSegments(BidSelectionDto candidate, ReturnRoute route, List<BidSelectionDto> chosen) {
        // Simplified capacity check - you can enhance this based on your route segments
        double totalVolume = candidate.getVolume().doubleValue();
        
        // Add volume from already chosen bids that might overlap
        for (BidSelectionDto chosenBid : chosen) {
            if (hasOverlap(candidate, chosenBid)) {
                totalVolume += chosenBid.getVolume().doubleValue();
            }
        }
        
        return totalVolume <= capacityC;
    }

    private boolean hasOverlap(BidSelectionDto bid1, BidSelectionDto bid2) {
        // Check if two bids overlap in their segments
        if (bid1.getStartIndex() == null || bid1.getEndIndex() == null ||
            bid2.getStartIndex() == null || bid2.getEndIndex() == null) {
            return false;
        }
        
        return !(bid1.getEndIndex() < bid2.getStartIndex() || bid2.getEndIndex() < bid1.getStartIndex());
    }
    
    // Getter methods for configuration values
    public double getWPrice() { return wPrice; }
    public double getWVolume() { return wVolume; }
    public double getWDistance() { return wDistance; }
    public double getWDetour() { return wDetour; }
    public double getCapacityC() { return capacityC; }
} 