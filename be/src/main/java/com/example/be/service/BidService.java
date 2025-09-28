package com.example.be.service;
// ...existing imports...


import com.example.be.dto.BidCreateDto;
import com.example.be.dto.BidDto;
import com.example.be.dto.RouteBidCreateDto;
import com.example.be.model.Bid;
import com.example.be.model.Profile;
import com.example.be.model.ReturnRoute;
import com.example.be.model.DeliveryTracking;
import com.example.be.repository.BidRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.repository.ParcelRequestRepository;
import com.example.be.repository.DeliveryTrackingRepository;
import com.example.be.types.DeliveryStatusEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BidService {
    private static final Logger logger = LoggerFactory.getLogger(BidService.class);
    private final BidRepository bidRepository;
    private final com.example.be.repository.CustomerBidRepository customerBidRepository;
    private final ReturnRouteRepository routeRepository;
    private final ProfileRepository profileRepository;
    private final ParcelRequestRepository parcelRequestRepository;
    private final DeliveryTrackingRepository deliveryTrackingRepository;

    @Autowired
    public BidService(BidRepository bidRepository, com.example.be.repository.CustomerBidRepository customerBidRepository, 
                     ReturnRouteRepository routeRepository, ProfileRepository profileRepository, 
                     ParcelRequestRepository parcelRequestRepository, DeliveryTrackingRepository deliveryTrackingRepository) {
        this.bidRepository = bidRepository;
        this.customerBidRepository = customerBidRepository;
        this.routeRepository = routeRepository;
        this.profileRepository = profileRepository;
        this.parcelRequestRepository = parcelRequestRepository;
        this.deliveryTrackingRepository = deliveryTrackingRepository;
    }
    @Transactional(readOnly = true)
    public List<BidDto> getBidsByParcelRequestIdAndStatus(UUID parcelRequestId, com.example.be.types.BidStatus status) {
        String statusStr = status != null ? status.name() : null;
        List<com.example.be.model.Bid> bids = customerBidRepository.findByParcelRequestIdAndStatus(parcelRequestId, statusStr);
        List<BidDto> dtos = new ArrayList<>();
        for (com.example.be.model.Bid bid : bids) {
            BidDto dto = new BidDto();
            dto.setId(bid.getId());
            dto.setRequestId(bid.getRequest() != null ? bid.getRequest().getId() : null);
            dto.setRouteId(bid.getRoute() != null ? bid.getRoute().getId() : null);
            dto.setStartIndex(bid.getStartIndex());
            dto.setEndIndex(bid.getEndIndex());
            dto.setOfferedPrice(bid.getOfferedPrice());
            dto.setStatus(bid.getStatus());
            dto.setCreatedAt(bid.getCreatedAt());
            dto.setUpdatedAt(bid.getUpdatedAt());
            dtos.add(dto);
        }
        return dtos;
    }

    public List<BidDto> getBidsByCustomerIdAndStatus(UUID customerId, com.example.be.types.BidStatus status) {
        String statusStr = status != null ? status.name() : null;
        List<com.example.be.model.Bid> bids = customerBidRepository.findByCustomerIdAndStatus(customerId, statusStr);
        List<BidDto> dtos = new ArrayList<>();
        for (com.example.be.model.Bid bid : bids) {
            BidDto dto = new BidDto();
            dto.setId(bid.getId());
            dto.setRequestId(bid.getRequest() != null ? bid.getRequest().getId() : null);
            dto.setRouteId(bid.getRoute() != null ? bid.getRoute().getId() : null);
            dto.setStartIndex(bid.getStartIndex());
            dto.setEndIndex(bid.getEndIndex());
            dto.setOfferedPrice(bid.getOfferedPrice());
            dto.setStatus(bid.getStatus());
            dto.setCreatedAt(bid.getCreatedAt());
            dto.setUpdatedAt(bid.getUpdatedAt());
            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public List<BidDto> getBidsByRouteIdAndStatus(UUID routeId, com.example.be.types.BidStatus status) {
        String statusStr = status != null ? status.name() : null;
        List<com.example.be.model.Bid> bids = bidRepository.findByRouteIdAndStatusNative(routeId, statusStr);
        List<BidDto> dtos = new ArrayList<>();
        for (com.example.be.model.Bid bid : bids) {
            BidDto dto = new BidDto();
            dto.setId(bid.getId());
            dto.setRequestId(bid.getRequest() != null ? bid.getRequest().getId() : null);
            dto.setRouteId(bid.getRoute() != null ? bid.getRoute().getId() : null);
            dto.setStartIndex(bid.getStartIndex());
            dto.setEndIndex(bid.getEndIndex());
            dto.setOfferedPrice(bid.getOfferedPrice());
            dto.setStatus(bid.getStatus());
            dto.setCreatedAt(bid.getCreatedAt());
            dto.setUpdatedAt(bid.getUpdatedAt());
            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public com.example.be.dto.RouteBidsAndRequestsDto getBidsAndRequestsByRouteId(UUID routeId, com.example.be.types.BidStatus status) {
        // Get bids for the route
        List<BidDto> allBids = getBidsByRouteIdAndStatus(routeId, status);
        
        // Get parcel requests for the route
        List<com.example.be.model.ParcelRequest> parcelRequests = parcelRequestRepository.findByRouteIdNative(routeId);
        
        // Create hierarchical structure
        List<com.example.be.dto.ParcelRequestWithBidsDto> parcelRequestsWithBids = new ArrayList<>();
        
        for (com.example.be.model.ParcelRequest request : parcelRequests) {
            com.example.be.dto.ParcelRequestWithBidsDto requestWithBids = new com.example.be.dto.ParcelRequestWithBidsDto();
            
            // Set parcel request details
            requestWithBids.setId(request.getId());
            requestWithBids.setCustomerId(request.getCustomer().getId());
            requestWithBids.setPickupLat(request.getPickupLat());
            requestWithBids.setPickupLng(request.getPickupLng());
            requestWithBids.setDropoffLat(request.getDropoffLat());
            requestWithBids.setDropoffLng(request.getDropoffLng());
            requestWithBids.setWeightKg(request.getWeightKg());
            requestWithBids.setVolumeM3(request.getVolumeM3());
            requestWithBids.setDescription(request.getDescription());
            requestWithBids.setMaxBudget(request.getMaxBudget());
            requestWithBids.setDeadline(request.getDeadline());
            requestWithBids.setStatus(request.getStatus());
            requestWithBids.setCreatedAt(request.getCreatedAt());
            requestWithBids.setUpdatedAt(request.getUpdatedAt());
            
            // Set customer information
            requestWithBids.setCustomerFirstName(request.getCustomer().getFirstName());
            requestWithBids.setCustomerLastName(request.getCustomer().getLastName());
            requestWithBids.setCustomerEmail(request.getCustomer().getEmail());
            requestWithBids.setCustomerPhone(request.getCustomer().getPhoneNumber());
            
            // Filter bids for this specific parcel request
            List<BidDto> requestBids = new ArrayList<>();
            for (BidDto bid : allBids) {
                if (bid.getRequestId() != null && bid.getRequestId().equals(request.getId())) {
                    requestBids.add(bid);
                }
            }
            requestWithBids.setBids(requestBids);
            requestWithBids.setTotalBids(requestBids.size());
            
            // Calculate statistics for this parcel request
            java.math.BigDecimal highestBid = java.math.BigDecimal.ZERO;
            java.math.BigDecimal lowestBid = null;
            java.math.BigDecimal totalBidAmount = java.math.BigDecimal.ZERO;
            
            for (BidDto bid : requestBids) {
                if (bid.getOfferedPrice() != null) {
                    if (highestBid.compareTo(bid.getOfferedPrice()) < 0) {
                        highestBid = bid.getOfferedPrice();
                    }
                    if (lowestBid == null || lowestBid.compareTo(bid.getOfferedPrice()) > 0) {
                        lowestBid = bid.getOfferedPrice();
                    }
                    totalBidAmount = totalBidAmount.add(bid.getOfferedPrice());
                }
            }
            
            java.math.BigDecimal averageBid = requestBids.isEmpty() ? java.math.BigDecimal.ZERO : 
                totalBidAmount.divide(java.math.BigDecimal.valueOf(requestBids.size()), 2, java.math.BigDecimal.ROUND_HALF_UP);
            
            requestWithBids.setHighestBid(highestBid);
            requestWithBids.setAverageBid(averageBid);
            requestWithBids.setLowestBid(lowestBid);
            
            parcelRequestsWithBids.add(requestWithBids);
        }
        
        // Calculate overall statistics
        java.math.BigDecimal overallHighestBid = java.math.BigDecimal.ZERO;
        java.math.BigDecimal overallLowestBid = null;
        java.math.BigDecimal overallTotalBidAmount = java.math.BigDecimal.ZERO;
        int totalBidsCount = 0;
        
        for (BidDto bid : allBids) {
            if (bid.getOfferedPrice() != null) {
                if (overallHighestBid.compareTo(bid.getOfferedPrice()) < 0) {
                    overallHighestBid = bid.getOfferedPrice();
                }
                if (overallLowestBid == null || overallLowestBid.compareTo(bid.getOfferedPrice()) > 0) {
                    overallLowestBid = bid.getOfferedPrice();
                }
                overallTotalBidAmount = overallTotalBidAmount.add(bid.getOfferedPrice());
                totalBidsCount++;
            }
        }
        
        java.math.BigDecimal overallAverageBid = totalBidsCount == 0 ? java.math.BigDecimal.ZERO : 
            overallTotalBidAmount.divide(java.math.BigDecimal.valueOf(totalBidsCount), 2, java.math.BigDecimal.ROUND_HALF_UP);
        
        // Create response DTO
        com.example.be.dto.RouteBidsAndRequestsDto response = new com.example.be.dto.RouteBidsAndRequestsDto();
        response.setRouteId(routeId);
        response.setParcelRequestsWithBids(parcelRequestsWithBids);
        response.setTotalParcelRequests(parcelRequestsWithBids.size());
        response.setTotalBids(totalBidsCount);
        response.setHighestBid(overallHighestBid);
        response.setAverageBid(overallAverageBid);
        response.setLowestBid(overallLowestBid);
        
        return response;
    }

    @Transactional(readOnly = true)
    public BidDto getBidById(UUID id) {
        logger.info("Looking up Bid with id: {}", id);
        Bid bid = bidRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Bid not found for id: {}", id);
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Bid not found");
                });
        logger.info("Bid found: {}", bid);
        BidDto dto = new BidDto();
        dto.setId(bid.getId());
        dto.setRequestId(bid.getRequest() != null ? bid.getRequest().getId() : null);
        dto.setRouteId(bid.getRoute() != null ? bid.getRoute().getId() : null);
        dto.setStartIndex(bid.getStartIndex());
        dto.setEndIndex(bid.getEndIndex());
        dto.setOfferedPrice(bid.getOfferedPrice());
        dto.setStatus(bid.getStatus());
        dto.setCreatedAt(bid.getCreatedAt());
        dto.setUpdatedAt(bid.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<BidDto> getAllBids() {
        List<Bid> bids = bidRepository.findAll();
        List<BidDto> dtos = new ArrayList<>();
        for (Bid bid : bids) {
            BidDto dto = new BidDto();
            dto.setId(bid.getId());
            dto.setRequestId(bid.getRequest() != null ? bid.getRequest().getId() : null);
            dto.setRouteId(bid.getRoute() != null ? bid.getRoute().getId() : null);
            dto.setStartIndex(bid.getStartIndex());
            dto.setEndIndex(bid.getEndIndex());
            dto.setOfferedPrice(bid.getOfferedPrice());
            dto.setStatus(bid.getStatus());
            dto.setCreatedAt(bid.getCreatedAt());
            dto.setUpdatedAt(bid.getUpdatedAt());
            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional
    public BidDto createBid(BidCreateDto bidCreateDto) {
        // Use native insert to handle enum casting
        bidRepository.insertBid(
                bidCreateDto.getRequestId(),
                bidCreateDto.getRouteId(),
                bidCreateDto.getStartIndex(),
                bidCreateDto.getEndIndex(),
                bidCreateDto.getOfferedPrice(),
                com.example.be.types.BidStatus.PENDING.name()
        );
        // Fetch the saved bid to return all fields (find the latest matching bid using native query)
        Bid savedBid = bidRepository.findLatestBidByAllFields(
                bidCreateDto.getRequestId(),
                bidCreateDto.getRouteId(),
                bidCreateDto.getStartIndex(),
                bidCreateDto.getEndIndex(),
                bidCreateDto.getOfferedPrice(),
                com.example.be.types.BidStatus.PENDING.name()
        ).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Bid creation failed"));
        BidDto dto = new BidDto();
        dto.setId(savedBid.getId());
        dto.setRequestId(savedBid.getRequest() != null ? savedBid.getRequest().getId() : null);
        dto.setRouteId(savedBid.getRoute() != null ? savedBid.getRoute().getId() : null);
        dto.setStartIndex(savedBid.getStartIndex());
        dto.setEndIndex(savedBid.getEndIndex());
        dto.setOfferedPrice(savedBid.getOfferedPrice());
        dto.setStatus(savedBid.getStatus());
        dto.setCreatedAt(savedBid.getCreatedAt());
        dto.setUpdatedAt(savedBid.getUpdatedAt());
        return dto;
    }

    @Transactional
    public BidDto updateBidStatus(UUID bidId, com.example.be.types.BidStatus status) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Bid not found"));
        
        // Update using native SQL to handle enum properly
        bidRepository.updateBidStatus(bidId, status.name());
        
        // If bid is accepted, create delivery tracking record
        if (status == com.example.be.types.BidStatus.ACCEPTED) {
            createDeliveryTrackingForBid(bidId);
        }
        
        // Refresh the entity to get updated data
        bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Bid not found after update"));
        
        BidDto dto = new BidDto();
        dto.setId(bid.getId());
        dto.setRequestId(bid.getRequest() != null ? bid.getRequest().getId() : null);
        dto.setRouteId(bid.getRoute() != null ? bid.getRoute().getId() : null);
        dto.setStartIndex(bid.getStartIndex());
        dto.setEndIndex(bid.getEndIndex());
        dto.setOfferedPrice(bid.getOfferedPrice());
        dto.setStatus(bid.getStatus());
        dto.setCreatedAt(bid.getCreatedAt());
        dto.setUpdatedAt(bid.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<com.example.be.dto.DriverBidHistoryDto> getDriverBidHistory(UUID driverId, com.example.be.types.BidStatus status) {
        List<Object[]> results;
        
        if (status != null) {
            results = bidRepository.findBidHistoryByDriverIdAndStatus(driverId, status.name());
        } else {
            results = bidRepository.findBidHistoryByDriverId(driverId);
        }
        
        List<com.example.be.dto.DriverBidHistoryDto> bidHistoryList = new ArrayList<>();
        
        for (Object[] row : results) {
            com.example.be.dto.DriverBidHistoryDto dto = new com.example.be.dto.DriverBidHistoryDto();
            
            // Map the query results to DTO
            dto.setBidId((UUID) row[0]);
            dto.setRequestId((UUID) row[1]);
            dto.setRouteId((UUID) row[2]);
            dto.setStartIndex((Integer) row[3]);
            dto.setEndIndex((Integer) row[4]);
            dto.setOfferedPrice((java.math.BigDecimal) row[5]);
            dto.setStatus(com.example.be.types.BidStatus.valueOf((String) row[6]));
            
            // Handle different timestamp types
            if (row[7] instanceof java.sql.Timestamp) {
                dto.setCreatedAt(((java.sql.Timestamp) row[7]).toInstant().atZone(java.time.ZoneId.systemDefault()));
            } else if (row[7] instanceof java.time.OffsetDateTime) {
                dto.setCreatedAt(((java.time.OffsetDateTime) row[7]).toZonedDateTime());
            } else if (row[7] instanceof java.time.LocalDateTime) {
                dto.setCreatedAt(((java.time.LocalDateTime) row[7]).atZone(java.time.ZoneId.systemDefault()));
            }
            
            if (row[8] instanceof java.sql.Timestamp) {
                dto.setUpdatedAt(((java.sql.Timestamp) row[8]).toInstant().atZone(java.time.ZoneId.systemDefault()));
            } else if (row[8] instanceof java.time.OffsetDateTime) {
                dto.setUpdatedAt(((java.time.OffsetDateTime) row[8]).toZonedDateTime());
            } else if (row[8] instanceof java.time.LocalDateTime) {
                dto.setUpdatedAt(((java.time.LocalDateTime) row[8]).atZone(java.time.ZoneId.systemDefault()));
            }
            
            // Parcel request details
            dto.setPickupLat((java.math.BigDecimal) row[9]);
            dto.setPickupLng((java.math.BigDecimal) row[10]);
            dto.setDropoffLat((java.math.BigDecimal) row[11]);
            dto.setDropoffLng((java.math.BigDecimal) row[12]);
            dto.setWeightKg((java.math.BigDecimal) row[13]);
            dto.setVolumeM3((java.math.BigDecimal) row[14]);
            dto.setDescription((String) row[15]);
            dto.setMaxBudget((java.math.BigDecimal) row[16]);
            
            // Handle deadline timestamp
            if (row[17] instanceof java.sql.Timestamp) {
                dto.setDeadline(((java.sql.Timestamp) row[17]).toInstant().atZone(java.time.ZoneId.systemDefault()));
            } else if (row[17] instanceof java.time.OffsetDateTime) {
                dto.setDeadline(((java.time.OffsetDateTime) row[17]).toZonedDateTime());
            } else if (row[17] instanceof java.time.LocalDateTime) {
                dto.setDeadline(((java.time.LocalDateTime) row[17]).atZone(java.time.ZoneId.systemDefault()));
            }
            
            // Customer details
            dto.setCustomerFirstName((String) row[18]);
            dto.setCustomerLastName((String) row[19]);
            
            bidHistoryList.add(dto);
        }
        
        return bidHistoryList;
    }

    @Transactional(readOnly = true)
    public List<Object[]> debugGetDriverBidHistoryRaw(UUID driverId) {
        return bidRepository.findBidHistoryByDriverId(driverId);
    }

    @Transactional
    public void deleteBid(UUID bidId) {
        if (!bidRepository.existsById(bidId)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Bid not found");
        }
        
        logger.info("Deleting bid {} with cascade - removing all related entities in one query", bidId);
        
        // Delete all related entities and the bid itself in one query
        bidRepository.deleteBidWithCascade(bidId);
        
        logger.info("Successfully deleted bid {} with all related data (payments, earnings, conversations, delivery tracking, disputes)", bidId);
    }

    @Transactional
    public BidDto createRouteBid(RouteBidCreateDto routeBidCreateDto) {
        logger.info("Creating route bid for route: {}", routeBidCreateDto.getRouteId());
        
        // Create a new Bid entity
        Bid bid = new Bid();
        
        // Set the route (we need to fetch it from the repository)
        ReturnRoute route = routeRepository.findById(routeBidCreateDto.getRouteId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Route not found"));
        bid.setRoute(route);
        
        // Set the customer (we need to fetch it from the repository)
        Profile customer = profileRepository.findById(routeBidCreateDto.getCustomerId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Customer not found"));
        
        // For route-based bidding, we'll set the request to null and use default indices
        bid.setRequest(null);
        bid.setStartIndex(0);
        bid.setEndIndex(0);
        bid.setOfferedPrice(routeBidCreateDto.getOfferedPrice());
        bid.setStatus(com.example.be.types.BidStatus.PENDING);
        bid.setSpecialInstructions(routeBidCreateDto.getSpecialInstructions());
        
        // Save the bid
        Bid savedBid = bidRepository.save(bid);
        
        // Convert to DTO
        BidDto dto = new BidDto();
        dto.setId(savedBid.getId());
        dto.setRequestId(null); // No request for route-based bids
        dto.setRouteId(savedBid.getRoute().getId());
        dto.setStartIndex(savedBid.getStartIndex());
        dto.setEndIndex(savedBid.getEndIndex());
        dto.setOfferedPrice(savedBid.getOfferedPrice());
        dto.setStatus(savedBid.getStatus());
        dto.setCreatedAt(savedBid.getCreatedAt());
        dto.setUpdatedAt(savedBid.getUpdatedAt());
        
        logger.info("Route bid created successfully with ID: {}", savedBid.getId());
        return dto;
    }
    
    /**
     * Create delivery tracking record for an accepted bid
     */
    private void createDeliveryTrackingForBid(UUID bidId) {
        try {
            // Check if delivery tracking already exists for this bid
            if (deliveryTrackingRepository.findByBidId(bidId).isPresent()) {
                logger.info("Delivery tracking already exists for bid: {}", bidId);
                return;
            }
            
            // Get the bid details
            Bid bid = bidRepository.findById(bidId)
                    .orElseThrow(() -> new RuntimeException("Bid not found: " + bidId));
            
            // Create delivery tracking record
            DeliveryTracking deliveryTracking = new DeliveryTracking();
            deliveryTracking.setBid(bid);
            deliveryTracking.setStatus("picked_up");
            
            // Calculate estimated arrival time (for now, set to 2 hours from now)
            deliveryTracking.setEstimatedArrival(ZonedDateTime.now().plusHours(2));
            
            deliveryTrackingRepository.save(deliveryTracking);
            logger.info("Created delivery tracking record for bid: {}", bidId);
            
        } catch (Exception e) {
            logger.error("Error creating delivery tracking for bid {}: ", bidId, e);
            // Don't throw exception to avoid breaking the bid acceptance flow
        }
    }
}
