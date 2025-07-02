package com.example.be.service;
// ...existing imports...


import com.example.be.dto.BidCreateDto;
import com.example.be.dto.BidDto;
import com.example.be.model.Bid;
import com.example.be.repository.BidRepository;
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

    @Autowired
    public BidService(BidRepository bidRepository) {
        this.bidRepository = bidRepository;
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
        dto.setRequestId(bid.getRequestId());
        dto.setRouteId(bid.getRouteId());
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
            dto.setRequestId(bid.getRequestId());
            dto.setRouteId(bid.getRouteId());
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
        Bid bid = new Bid();
        bid.setRequestId(bidCreateDto.getRequestId());
        bid.setRouteId(bidCreateDto.getRouteId());
        bid.setStartIndex(bidCreateDto.getStartIndex());
        bid.setEndIndex(bidCreateDto.getEndIndex());
        bid.setOfferedPrice(bidCreateDto.getOfferedPrice());
        // status, createdAt, updatedAt are set automatically
        Bid savedBid = bidRepository.save(bid);
        BidDto dto = new BidDto();
        dto.setId(savedBid.getId());
        dto.setRequestId(savedBid.getRequestId());
        dto.setRouteId(savedBid.getRouteId());
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
        bid.setStatus(status);
        Bid savedBid = bidRepository.save(bid);
        BidDto dto = new BidDto();
        dto.setId(savedBid.getId());
        dto.setRequestId(savedBid.getRequestId());
        dto.setRouteId(savedBid.getRouteId());
        dto.setStartIndex(savedBid.getStartIndex());
        dto.setEndIndex(savedBid.getEndIndex());
        dto.setOfferedPrice(savedBid.getOfferedPrice());
        dto.setStatus(savedBid.getStatus());
        dto.setCreatedAt(savedBid.getCreatedAt());
        dto.setUpdatedAt(savedBid.getUpdatedAt());
        return dto;
    }
}
