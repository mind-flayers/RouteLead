package com.example.be.service;

import com.example.be.dto.DeliveryDetailsDto;
import com.example.be.dto.DeliveryStatusUpdateDto;
import com.example.be.dto.DeliverySummaryDto;
import com.example.be.dto.NotificationCreateDto;
import com.example.be.exception.BidNotFoundException;
import com.example.be.exception.DeliveryNotFoundException;
import com.example.be.model.*;
import com.example.be.repository.BidRepository;
import com.example.be.repository.DeliveryTrackingRepository;
import com.example.be.types.DeliveryStatusEnum;
import com.example.be.types.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DeliveryManagementService {
    
    private final DeliveryTrackingRepository deliveryTrackingRepository;
    private final BidRepository bidRepository;
    private final DriverLocationUpdateService locationUpdateService;
    private final GeocodingService geocodingService;
    private final NotificationService notificationService;
    
    /**
     * Get comprehensive delivery details for a specific bid
     */
    public DeliveryDetailsDto getDeliveryDetails(UUID bidId) {
        log.info("Getting delivery details for bid: {}", bidId);
        
        // Get bid with all related data
        Bid bid = bidRepository.findById(bidId)
            .orElseThrow(() -> new BidNotFoundException(bidId.toString()));
            
        // Get or create delivery tracking
        DeliveryTracking tracking = deliveryTrackingRepository.findByBidId(bidId)
            .orElseGet(() -> createDeliveryTracking(bid));
        
        // Get latest location update
        Optional<DriverLocationUpdate> latestLocation = 
            locationUpdateService.getLatestLocationUpdate(tracking.getId());
        
        // Build response DTO with geocoded addresses
        return buildDeliveryDetailsDto(bid, tracking, latestLocation);
    }
    
    /**
     * Update delivery status and record location
     */
    public DeliveryDetailsDto updateDeliveryStatus(UUID bidId, DeliveryStatusUpdateDto updateDto) {
        log.info("Updating delivery status for bid {} to {}", bidId, updateDto.getStatus());
        
        DeliveryTracking tracking = getDeliveryTrackingByBidId(bidId);
        
        // Update status and timestamps
        DeliveryStatusEnum previousStatus = tracking.getStatus();
        tracking.setStatus(updateDto.getStatus());
        updateTimestampForStatus(tracking, updateDto.getStatus());
        
        deliveryTrackingRepository.save(tracking);
        
        // Record location update if provided
        if (updateDto.getCurrentLat() != null && updateDto.getCurrentLng() != null) {
            locationUpdateService.createLocationUpdate(
                tracking.getId(), 
                updateDto.getCurrentLat(), 
                updateDto.getCurrentLng()
            );
        }
        
        // Send notifications to customer
        try {
            sendStatusChangeNotification(tracking, previousStatus, updateDto.getStatus());
        } catch (Exception e) {
            log.error("Failed to send notification for delivery status change: ", e);
            // Don't fail the whole operation if notification fails
        }
        
        log.info("Successfully updated delivery status for bid {} from {} to {}", 
                bidId, previousStatus, updateDto.getStatus());
        
        return getDeliveryDetails(bidId);
    }
    
    /**
     * Complete delivery and generate summary
     */
    public DeliverySummaryDto completeDelivery(UUID bidId, DeliveryStatusUpdateDto updateDto) {
        log.info("Completing delivery for bid: {}", bidId);
        
        // Update to DELIVERED status
        updateDto.setStatus(DeliveryStatusEnum.DELIVERED);
        updateDeliveryStatus(bidId, updateDto);
        
        // Generate delivery summary
        DeliverySummaryDto summary = generateDeliverySummary(bidId);
        
        log.info("Successfully completed delivery for bid: {}", bidId);
        return summary;
    }
    
    /**
     * Create a new delivery tracking record for a bid
     */
    private DeliveryTracking createDeliveryTracking(Bid bid) {
        log.info("Creating new delivery tracking for bid: {}", bid.getId());
        
        DeliveryTracking tracking = new DeliveryTracking();
        tracking.setBid(bid);
        tracking.setStatus(DeliveryStatusEnum.ACCEPTED);
        tracking.setEstimatedArrival(bid.getPickupTime());
        
        return deliveryTrackingRepository.save(tracking);
    }
    
    /**
     * Get delivery tracking by bid ID or throw exception
     */
    private DeliveryTracking getDeliveryTrackingByBidId(UUID bidId) {
        return deliveryTrackingRepository.findByBidId(bidId)
            .orElseThrow(() -> new BidNotFoundException("Delivery tracking not found for bid: " + bidId));
    }
    
    /**
     * Update appropriate timestamp based on delivery status
     */
    private void updateTimestampForStatus(DeliveryTracking tracking, DeliveryStatusEnum status) {
        ZonedDateTime now = ZonedDateTime.now();
        
        switch (status) {
            case PICKED_UP:
                if (tracking.getActualPickupTime() == null) {
                    tracking.setActualPickupTime(now);
                }
                break;
            case DELIVERED:
                if (tracking.getActualDeliveryTime() == null) {
                    tracking.setActualDeliveryTime(now);
                }
                break;
            default:
                // No specific timestamp update needed for other statuses
                break;
        }
    }
    
    /**
     * Build delivery details DTO from bid, tracking, and location data
     */
    private DeliveryDetailsDto buildDeliveryDetailsDto(Bid bid, DeliveryTracking tracking, 
                                                      Optional<DriverLocationUpdate> latestLocation) {
        
        DeliveryDetailsDto dto = new DeliveryDetailsDto();
        
        // Basic IDs and tracking info
        dto.setDeliveryTrackingId(tracking.getId());
        dto.setBidId(bid.getId());
        dto.setCustomerId(bid.getRequest().getCustomerId());
        dto.setDriverId(bid.getRoute().getDriver().getId());
        
        // Customer details
        // Note: You may need to fetch profile data separately if not available through relationships
        dto.setCustomerName(getCustomerName(bid.getRequest().getCustomerId()));
        dto.setCustomerPhone(bid.getRequest().getPickupContactPhone());
        
        // Bid and delivery details
        dto.setBidAmount(bid.getOfferedPrice());
        dto.setStatus(tracking.getStatus());
        dto.setEstimatedArrival(tracking.getEstimatedArrival());
        dto.setActualPickupTime(tracking.getActualPickupTime());
        dto.setActualDeliveryTime(tracking.getActualDeliveryTime());
        
        // Parcel details
        ParcelRequest request = bid.getRequest();
        dto.setDescription(request.getDescription());
        dto.setWeightKg(request.getWeightKg());
        dto.setVolumeM3(request.getVolumeM3());
        dto.setPickupContactName(request.getPickupContactName());
        dto.setPickupContactPhone(request.getPickupContactPhone());
        dto.setDeliveryContactName(request.getDeliveryContactName());
        dto.setDeliveryContactPhone(request.getDeliveryContactPhone());
        dto.setSpecialInstructions(bid.getSpecialInstructions());
        
        // Location details with geocoding
        dto.setPickupLat(request.getPickupLat());
        dto.setPickupLng(request.getPickupLng());
        dto.setPickupAddress(geocodingService.getLocationName(request.getPickupLat(), request.getPickupLng()));
        
        dto.setDropoffLat(request.getDropoffLat());
        dto.setDropoffLng(request.getDropoffLng());
        dto.setDropoffAddress(geocodingService.getLocationName(request.getDropoffLat(), request.getDropoffLng()));
        
        // Current location from latest update
        if (latestLocation.isPresent()) {
            DriverLocationUpdate location = latestLocation.get();
            dto.setCurrentLat(location.getLatitude());
            dto.setCurrentLng(location.getLongitude());
            dto.setLastLocationUpdate(location.getRecordedAt());
        }
        
        // Additional metadata
        dto.setPaymentCompleted(true); // Assuming payment is completed for accepted bids
        
        return dto;
    }
    
    /**
     * Generate comprehensive delivery summary
     */
    private DeliverySummaryDto generateDeliverySummary(UUID bidId) {
        DeliveryTracking tracking = getDeliveryTrackingByBidId(bidId);
        Bid bid = tracking.getBid();
        ParcelRequest request = bid.getRequest();
        
        DeliverySummaryDto summary = new DeliverySummaryDto();
        
        // Basic information
        summary.setDeliveryTrackingId(tracking.getId());
        summary.setBidId(bidId);
        summary.setCustomerName(getCustomerName(request.getCustomerId()));
        summary.setBidAmount(bid.getOfferedPrice());
        summary.setDriverName(getDriverName(bid.getRoute().getDriver().getId()));
        
        // Timing information
        summary.setDeliveryStartedAt(tracking.getActualPickupTime());
        summary.setDeliveryCompletedAt(tracking.getActualDeliveryTime());
        
        // Calculate delivery time
        if (tracking.getActualPickupTime() != null && tracking.getActualDeliveryTime() != null) {
            Duration deliveryDuration = Duration.between(
                tracking.getActualPickupTime(), 
                tracking.getActualDeliveryTime()
            );
            summary.setTotalDeliveryTimeMinutes(deliveryDuration.toMinutes());
        }
        
        // Location information with geocoding
        summary.setPickupAddress(geocodingService.reverseGeocode(request.getPickupLat(), request.getPickupLng()));
        summary.setDropoffAddress(geocodingService.reverseGeocode(request.getDropoffLat(), request.getDropoffLng()));
        
        // Parcel information
        summary.setParcelDescription(request.getDescription());
        summary.setWeightKg(request.getWeightKg());
        summary.setVolumeM3(request.getVolumeM3());
        
        // Calculate statistics
        summary.setTotalLocationUpdates(
            locationUpdateService.getLocationUpdatesByDeliveryTracking(tracking.getId()).size()
        );
        
        return summary;
    }
    
    /**
     * Send notification for delivery status change
     */
    private void sendStatusChangeNotification(DeliveryTracking tracking, 
                                            DeliveryStatusEnum previousStatus, 
                                            DeliveryStatusEnum newStatus) {
        try {
            // Create notification using generic notification service
            NotificationCreateDto notificationDto = new NotificationCreateDto();
            notificationDto.setUserId(tracking.getBid().getRequest().getCustomerId());
            notificationDto.setType(NotificationType.DELIVERY_STATUS);
            notificationDto.setPayload("Your delivery status has been updated to: " + newStatus.toString());
            
            notificationService.createNotification(notificationDto);
        } catch (Exception e) {
            log.error("Failed to send delivery status notification: ", e);
        }
    }
    
    /**
     * Helper method to get customer name - you may need to implement based on your profile service
     */
    private String getCustomerName(UUID customerId) {
        // TODO: Implement proper customer name fetching from profiles
        return "Customer"; // Placeholder
    }
    
    /**
     * Helper method to get driver name - you may need to implement based on your profile service
     */
    private String getDriverName(UUID driverId) {
        // TODO: Implement proper driver name fetching from profiles
        return "Driver"; // Placeholder
    }
}
