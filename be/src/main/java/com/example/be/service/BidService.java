package com.example.be.service;
// ...existing imports...


import com.example.be.dto.BidCreateDto;
import com.example.be.dto.BidDto;
import com.example.be.dto.RouteBidCreateDto;
import com.example.be.model.Bid;
import com.example.be.model.Profile;
import com.example.be.model.ReturnRoute;
import com.example.be.repository.BidRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.repository.ReturnRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    @Autowired
    public BidService(BidRepository bidRepository, com.example.be.repository.CustomerBidRepository customerBidRepository, 
                     ReturnRouteRepository routeRepository, ProfileRepository profileRepository) {
        this.bidRepository = bidRepository;
        this.customerBidRepository = customerBidRepository;
        this.routeRepository = routeRepository;
        this.profileRepository = profileRepository;
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
        bidRepository.deleteById(bidId);
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
}
