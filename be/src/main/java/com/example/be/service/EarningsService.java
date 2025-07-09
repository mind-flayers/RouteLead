package com.example.be.service;

import com.example.be.dto.CreateEarningsRequestDto;
import com.example.be.dto.EarningsDto;
import com.example.be.dto.EarningsSummaryDto;
import com.example.be.model.*;
import com.example.be.repository.*;
import com.example.be.types.EarningsStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EarningsService {

    private final EarningsRepository earningsRepository;
    private final ProfileRepository profileRepository;
    private final BidRepository bidRepository;
    
    @Transactional
    public EarningsDto createEarnings(CreateEarningsRequestDto request) {
        log.info("Creating earnings record for driver: {}, bid: {}", request.getDriverId(), request.getBidId());
        
        // Validate driver exists
        if (!profileRepository.existsById(request.getDriverId())) {
            throw new RuntimeException("Driver not found with ID: " + request.getDriverId());
        }
        
        // Validate bid exists if provided
        if (request.getBidId() != null && !bidRepository.existsById(request.getBidId())) {
            throw new RuntimeException("Bid not found with ID: " + request.getBidId());
        }
        
        BigDecimal netAmount = request.getGrossAmount().subtract(request.getAppFee());
        UUID earningsId = UUID.randomUUID();
        ZonedDateTime earnedAt = ZonedDateTime.now();
        
        // Use native SQL insert to handle PostgreSQL enum properly
        earningsRepository.insertEarnings(
            earningsId,
            request.getDriverId(),
            request.getBidId(),
            request.getGrossAmount(),
            request.getAppFee(),
            netAmount,
            EarningsStatusEnum.PENDING.toString(),
            earnedAt
        );
        
        log.info("Created earnings record with ID: {}", earningsId);
        
        // Retrieve the saved earnings to return as DTO
        Earnings savedEarnings = earningsRepository.findById(earningsId)
                .orElseThrow(() -> new RuntimeException("Failed to retrieve created earnings record"));
        
        return convertToDto(savedEarnings);
    }
    
    public EarningsSummaryDto getEarningsSummary(UUID driverId) {
        log.info("Fetching earnings summary for driver: {}", driverId);
        
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime weekAgo = now.minusWeeks(1);
        ZonedDateTime monthAgo = now.minusMonths(1);
        
        BigDecimal todayEarnings = earningsRepository.getTodayTotalEarnings(driverId);
        BigDecimal weeklyEarnings = earningsRepository.getWeeklyEarnings(driverId, weekAgo);
        BigDecimal availableBalance = earningsRepository.getAvailableBalance(driverId);
        Long monthlyDeliveries = earningsRepository.getMonthlyEarningsCount(driverId, monthAgo);
        
        int pendingBidsCount = getPendingBidsCount(driverId);
        
        return EarningsSummaryDto.builder()
                .todayEarnings(todayEarnings != null ? todayEarnings : BigDecimal.ZERO)
                .weeklyEarnings(weeklyEarnings != null ? weeklyEarnings : BigDecimal.ZERO)
                .availableBalance(availableBalance != null ? availableBalance : BigDecimal.ZERO)
                .monthlyCompletedDeliveries(monthlyDeliveries != null ? monthlyDeliveries : 0L)
                .pendingBidsCount(pendingBidsCount)
                .todayGrowthPercentage(12.5)
                .weeklyGrowthPercentage(8.1)
                .build();
    }
    
    public List<EarningsDto> getEarningsHistory(UUID driverId, Optional<EarningsStatusEnum> status) {
        log.info("Fetching earnings history for driver: {}, status: {}", driverId, status);
        
        List<Object[]> results;
        if (status.isPresent()) {
            results = earningsRepository.findDetailedEarningsByDriverIdAndStatus(driverId, status.get().toString());
        } else {
            results = earningsRepository.findDetailedEarningsByDriverIdNative(driverId);
        }
        
        return results.stream()
                .map(this::convertNativeResultToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public EarningsDto updateEarningsStatus(UUID earningsId, EarningsStatusEnum newStatus) {
        log.info("Updating earnings status for ID: {} to status: {}", earningsId, newStatus);
        
        Earnings earnings = earningsRepository.findById(earningsId)
                .orElseThrow(() -> new RuntimeException("Earnings not found with ID: " + earningsId));
        
        // Use native SQL update to handle PostgreSQL enum properly
        earningsRepository.updateEarningsStatus(earningsId, newStatus.toString());
        
        // Retrieve the updated earnings to return as DTO
        Earnings updatedEarnings = earningsRepository.findById(earningsId)
                .orElseThrow(() -> new RuntimeException("Failed to retrieve updated earnings record"));
        
        log.info("Updated earnings status successfully");
        return convertToDto(updatedEarnings);
    }
    
    public Optional<EarningsDto> getEarningsByBidId(UUID bidId) {
        log.info("Fetching earnings for bid: {}", bidId);
        
        List<Object[]> results = earningsRepository.findEarningsByBidIdNative(bidId);
        
        if (!results.isEmpty()) {
            return Optional.of(convertNativeResultToDto(results.get(0)));
        }
        
        return Optional.empty();
    }
    
    private EarningsDto convertToDto(Earnings earnings) {
        return EarningsDto.builder()
                .id(earnings.getId())
                .driverId(earnings.getDriver().getId())
                .bidId(earnings.getBid() != null ? earnings.getBid().getId() : null)
                .grossAmount(earnings.getGrossAmount())
                .appFee(earnings.getAppFee())
                .netAmount(earnings.getNetAmount())
                .status(earnings.getStatus())
                .earnedAt(earnings.getEarnedAt())
                .updatedAt(earnings.getUpdatedAt())
                .updatedAt(earnings.getUpdatedAt())
                .build();
    }
    
    private EarningsDto convertNativeResultToDto(Object[] result) {
        try {
            ZonedDateTime earnedAt;
            // Handle both Timestamp and Instant types
            if (result[7] instanceof java.sql.Timestamp) {
                earnedAt = ((java.sql.Timestamp) result[7]).toInstant().atZone(java.time.ZoneId.systemDefault());
            } else if (result[7] instanceof java.time.Instant) {
                earnedAt = ((java.time.Instant) result[7]).atZone(java.time.ZoneId.systemDefault());
            } else {
                // Fallback for other timestamp types
                earnedAt = java.time.ZonedDateTime.now();
            }
            
            return EarningsDto.builder()
                    .id(UUID.fromString(result[0].toString()))
                    .driverId(UUID.fromString(result[1].toString()))
                    .bidId(result[2] != null ? UUID.fromString(result[2].toString()) : null)
                    .grossAmount((BigDecimal) result[3])
                    .appFee((BigDecimal) result[4])
                    .netAmount((BigDecimal) result[5])
                    .status(EarningsStatusEnum.valueOf(result[6].toString()))
                    .earnedAt(earnedAt)
                    .routeId(result[8] != null ? UUID.fromString(result[8].toString()) : null)
                    .offeredPrice(result[9] != null ? (BigDecimal) result[9] : null)
                    .parcelDescription(result[10] != null ? result[10].toString() : null)
                    .customerName(result[11] != null && result[12] != null ? 
                            result[11].toString() + " " + result[12].toString() : null)
                    .originLocation(result[13] != null && result[14] != null ? 
                            String.format("%.4f, %.4f", result[13], result[14]) : null)
                    .destinationLocation(result[15] != null && result[16] != null ? 
                            String.format("%.4f, %.4f", result[15], result[16]) : null)
                    .build();
        } catch (Exception e) {
            log.error("Error converting native result to DTO: {}", e.getMessage());
            
            ZonedDateTime earnedAt;
            try {
                if (result[7] instanceof java.sql.Timestamp) {
                    earnedAt = ((java.sql.Timestamp) result[7]).toInstant().atZone(java.time.ZoneId.systemDefault());
                } else if (result[7] instanceof java.time.Instant) {
                    earnedAt = ((java.time.Instant) result[7]).atZone(java.time.ZoneId.systemDefault());
                } else {
                    earnedAt = java.time.ZonedDateTime.now();
                }
            } catch (Exception timeException) {
                earnedAt = java.time.ZonedDateTime.now();
            }
            
            return EarningsDto.builder()
                    .id(UUID.fromString(result[0].toString()))
                    .driverId(UUID.fromString(result[1].toString()))
                    .bidId(result[2] != null ? UUID.fromString(result[2].toString()) : null)
                    .grossAmount((BigDecimal) result[3])
                    .appFee((BigDecimal) result[4])
                    .netAmount((BigDecimal) result[5])
                    .status(EarningsStatusEnum.valueOf(result[6].toString()))
                    .earnedAt(earnedAt)
                    .build();
        }
    }
    
    private int getPendingBidsCount(UUID driverId) {
        return bidRepository.countByRouteDriverIdAndStatus(driverId, "PENDING");
    }
}
