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
import com.example.be.repository.PaymentRepository;
import com.example.be.repository.ParcelRequestRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.types.DeliveryStatusEnum;
import com.example.be.types.PaymentStatusEnum;
import com.example.be.types.ParcelStatus;
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
    private final PaymentRepository paymentRepository;
    private final ParcelRequestRepository parcelRequestRepository;
    private final DriverLocationUpdateService locationUpdateService;
    private final GeocodingService geocodingService;
    private final NotificationService notificationService;
    private final ProfileRepository profileRepository;
    
    /**
     * Get comprehensive delivery details for a specific bid
     */
    public DeliveryDetailsDto getDeliveryDetails(UUID bidId) {
        log.info("Getting delivery details for bid: {}", bidId);
        
        // Get bid with all related data
        Bid bid = bidRepository.findById(bidId)
            .orElseThrow(() -> new BidNotFoundException(bidId.toString()));
            
        // Get or create delivery tracking using native SQL that handles duplicates
        DeliveryTracking tracking = getDeliveryTrackingByBidIdSafe(bidId);
        if (tracking == null) {
            tracking = createDeliveryTracking(bid);
        }
        
        // Get latest location update
        Optional<DriverLocationUpdate> latestLocation = 
            locationUpdateService.getLatestLocationUpdate(tracking.getId());
        
        // Build response DTO with geocoded addresses
        return buildDeliveryDetailsDto(bid, tracking, latestLocation);
    }
    
    /**
     * Update delivery status and record location using native SQL
     * For non-completion status updates (picked_up, in_transit, etc.)
     */
    public DeliveryDetailsDto updateDeliveryStatus(UUID bidId, DeliveryStatusUpdateDto updateDto) {
        log.info("Updating delivery status for bid {} to {}", bidId, updateDto.getStatus());
        
        // Clean up any duplicate tracking records first
        try {
            deliveryTrackingRepository.cleanupDuplicatesByBidId(bidId);
            log.debug("Cleaned up duplicate tracking records for bid {}", bidId);
        } catch (Exception e) {
            log.warn("Failed to cleanup duplicates for bid {}: {}", bidId, e.getMessage());
        }
        
        DeliveryTracking tracking = getDeliveryTrackingByBidIdSafe(bidId);
        if (tracking == null) {
            throw new DeliveryNotFoundException("Delivery tracking not found for bid: " + bidId);
        }
        
        String previousStatus = tracking.getStatus();
        
        // Convert enum to string for native SQL, handling NULL case
        String statusString = updateDto.getStatus() != null ? updateDto.getStatus().name() : null;
        ZonedDateTime now = ZonedDateTime.now();
        
        // Use native SQL to update with proper enum casting
        deliveryTrackingRepository.updateDeliveryStatus(
            tracking.getId(),
            statusString,
            now
        );
        
        // Record location update if provided
        if (updateDto.getCurrentLat() != null && updateDto.getCurrentLng() != null) {
            locationUpdateService.createLocationUpdate(
                tracking.getId(), 
                updateDto.getCurrentLat(), 
                updateDto.getCurrentLng()
            );
        }
        
        // Update parcel request status based on delivery status for key transitions
        try {
            updateParcelRequestStatusBasedOnDelivery(bidId, updateDto.getStatus(), now);
        } catch (Exception e) {
            log.error("Failed to update parcel request status for delivery status change: ", e);
            // Don't fail the whole operation if parcel status update fails
        }
        
        // Send notifications to customer - TEMPORARILY DISABLED
        try {
            log.info("Notifications temporarily disabled for debugging");
            // DeliveryStatusEnum previousStatusEnum = previousStatus != null ? DeliveryStatusEnum.valueOf(previousStatus) : null;
            // sendStatusChangeNotification(tracking, previousStatusEnum, updateDto.getStatus());
        } catch (Exception e) {
            log.error("Failed to send notification for delivery status change: ", e);
            // Don't fail the whole operation if notification fails
        }
        
        log.info("Successfully updated delivery status for bid {} from {} to {}", 
                bidId, previousStatus, updateDto.getStatus());
        
        return getDeliveryDetails(bidId);
    }
    
    /**
     * Update parcel request status based on delivery status transitions
     */
    private void updateParcelRequestStatusBasedOnDelivery(UUID bidId, DeliveryStatusEnum deliveryStatus, ZonedDateTime updateTime) {
        if (deliveryStatus == null) {
            return;
        }
        
        try {
            Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new BidNotFoundException("Bid not found: " + bidId));
            
            UUID parcelRequestId = bid.getRequest().getId();
            ParcelStatus newParcelStatus = null;
            
            // Map delivery status to parcel status
            switch (deliveryStatus) {
                case picked_up:
                    // Keep parcel as MATCHED when picked up
                    log.debug("Delivery picked up for bid {}, keeping parcel status as MATCHED", bidId);
                    return; // No change needed
                case delivered:
                    newParcelStatus = ParcelStatus.DELIVERED;
                    break;
                case cancelled:
                    newParcelStatus = ParcelStatus.CANCELLED;
                    break;
                default:
                    // For open, in_transit - no parcel status change needed
                    return;
            }
            
            if (newParcelStatus != null) {
                log.info("Updating parcel request {} status to {} based on delivery status {}", 
                         parcelRequestId, newParcelStatus, deliveryStatus);
                
                parcelRequestRepository.updateParcelRequestStatus(
                    parcelRequestId, 
                    newParcelStatus.name(), 
                    updateTime
                );
            }
            
        } catch (Exception e) {
            log.error("Error updating parcel request status for bid {}: ", bidId, e);
            throw e; // Re-throw to be caught by caller
        }
    }
    
    /**
     * Complete delivery and generate summary
     * This method updates both delivery_tracking and parcel_requests tables atomically
     */
    public DeliverySummaryDto completeDelivery(UUID bidId, DeliveryStatusUpdateDto updateDto) {
        log.info("Completing delivery for bid: {}", bidId);
        
        try {
            // Update delivery status to delivered
            updateDto.setStatus(DeliveryStatusEnum.delivered);
            updateDeliveryStatus(bidId, updateDto);
            
            // Get the bid to access the parcel request
            Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new BidNotFoundException("Bid not found: " + bidId));
            
            // Update the parcel request status to DELIVERED
            UUID parcelRequestId = bid.getRequest().getId();
            ZonedDateTime now = ZonedDateTime.now();
            
            log.info("Updating parcel request {} status to DELIVERED for completed delivery {}", 
                     parcelRequestId, bidId);
            
            parcelRequestRepository.updateParcelRequestStatus(
                parcelRequestId, 
                ParcelStatus.DELIVERED.name(), 
                now
            );
            
            log.info("Successfully updated parcel request {} to DELIVERED status", parcelRequestId);
            
            // Generate delivery summary
            DeliverySummaryDto summary = generateDeliverySummary(bidId);
            
            log.info("Successfully completed delivery for bid: {} with parcel request: {}", 
                     bidId, parcelRequestId);
            return summary;
            
        } catch (Exception e) {
            log.error("Error completing delivery for bid {}: ", bidId, e);
            // Re-throw to ensure transaction rollback
            throw new RuntimeException("Failed to complete delivery: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create a new delivery tracking record for a bid using native SQL
     */
    private DeliveryTracking createDeliveryTracking(Bid bid) {
        log.info("Creating new delivery tracking for bid: {}", bid.getId());
        
        UUID trackingId = UUID.randomUUID();
        ZonedDateTime now = ZonedDateTime.now();
        
        // Use native SQL to insert with open status initially (parcel available for pickup)
        deliveryTrackingRepository.createDeliveryTrackingWithOpenStatus(
            trackingId,
            bid.getId(),
            bid.getPickupTime(),
            now
        );
        
        // Create and return the tracking object without database fetch
        DeliveryTracking tracking = new DeliveryTracking();
        tracking.setId(trackingId);
        tracking.setBid(bid); // Set the bid object, not bidId
        tracking.setStatus("open"); // Initial status is open (parcel available for pickup)
        tracking.setEstimatedArrival(bid.getPickupTime());
        tracking.setCreatedAt(now);
        
        return tracking;
    }
    
    /**
     * Get delivery tracking by bid ID or throw exception
     */
    private DeliveryTracking getDeliveryTrackingByBidId(UUID bidId) {
        return deliveryTrackingRepository.findByBidId(bidId)
            .orElseThrow(() -> new BidNotFoundException("Delivery tracking not found for bid: " + bidId));
    }
    
    /**
     * Get delivery tracking by bid ID safely (handles duplicates by getting latest)
     */
    private DeliveryTracking getDeliveryTrackingByBidIdSafe(UUID bidId) {
        try {
            // First try to get latest record (handles duplicates)
            Optional<DeliveryTracking> latest = deliveryTrackingRepository.findLatestByBidId(bidId);
            if (latest.isPresent()) {
                return latest.get();
            }
            
            // Fallback to original method
            return deliveryTrackingRepository.findByBidId(bidId).orElse(null);
        } catch (Exception e) {
            log.error("Error getting delivery tracking for bid {}: {}", bidId, e.getMessage());
            return null;
        }
    }
    
    /**
     * Update appropriate timestamp based on delivery status
     */
    private void updateTimestampForStatus(DeliveryTracking tracking, DeliveryStatusEnum status) {
        ZonedDateTime now = ZonedDateTime.now();
        
        switch (status) {
            case picked_up:
                if (tracking.getActualPickupTime() == null) {
                    tracking.setActualPickupTime(now);
                }
                break;
            case delivered:
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
        dto.setStatus(tracking.getStatus()); // Return string status directly
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
        try {
            if (request.getPickupLat() != null && request.getPickupLng() != null) {
                dto.setPickupAddress(geocodingService.getLocationName(request.getPickupLat(), request.getPickupLng()));
            } else {
                dto.setPickupAddress("Pickup location not specified");
                log.warn("Pickup coordinates are null for bid: {}", bid.getId());
            }
        } catch (Exception e) {
            log.error("Error geocoding pickup location for bid {}: ", bid.getId(), e);
            dto.setPickupAddress("Pickup location unavailable");
        }
        
        dto.setDropoffLat(request.getDropoffLat());
        dto.setDropoffLng(request.getDropoffLng());
        try {
            if (request.getDropoffLat() != null && request.getDropoffLng() != null) {
                dto.setDropoffAddress(geocodingService.getLocationName(request.getDropoffLat(), request.getDropoffLng()));
            } else {
                dto.setDropoffAddress("Dropoff location not specified");
                log.warn("Dropoff coordinates are null for bid: {}", bid.getId());
            }
        } catch (Exception e) {
            log.error("Error geocoding dropoff location for bid {}: ", bid.getId(), e);
            dto.setDropoffAddress("Dropoff location unavailable");
        }
        
        // Current location from latest update
        if (latestLocation.isPresent()) {
            DriverLocationUpdate location = latestLocation.get();
            dto.setCurrentLat(location.getLatitude());
            dto.setCurrentLng(location.getLongitude());
            dto.setLastLocationUpdate(location.getRecordedAt());
        }
        
        // Check payment completion status
        dto.setPaymentCompleted(isPaymentCompleted(bid.getId()));
        
        return dto;
    }
    
    /**
     * Check if payment is completed for a given bid
     */
    private boolean isPaymentCompleted(UUID bidId) {
        try {
            log.debug("Checking payment completion status for bid: {}", bidId);
            
            // Use findLatestByBidId to get the most recent payment
            Optional<Payment> payment = paymentRepository.findLatestByBidId(bidId);
            
            if (payment.isPresent()) {
                PaymentStatusEnum status = payment.get().getPaymentStatus();
                boolean isCompleted = PaymentStatusEnum.completed.equals(status);
                
                log.debug("Latest payment found for bid {}: status = {}, completed = {}", 
                         bidId, status, isCompleted);
                
                return isCompleted;
            } else {
                log.debug("No payment found for bid: {}", bidId);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error checking payment completion for bid {}: ", bidId, e);
            // Return false in case of error to be safe
            return false;
        }
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
            
            String statusMessage = newStatus != null ? newStatus.toString() : "pending pickup";
            
            // Create a proper JSON object for the payload instead of a plain string
            java.util.Map<String, Object> payloadData = new java.util.HashMap<>();
            payloadData.put("message", "Your delivery status has been updated to: " + statusMessage);
            payloadData.put("previousStatus", previousStatus != null ? previousStatus.toString() : null);
            payloadData.put("newStatus", statusMessage);
            payloadData.put("deliveryId", tracking.getBid().getId().toString());
            payloadData.put("timestamp", java.time.ZonedDateTime.now().toString());
            
            notificationDto.setPayload(payloadData);
            
            notificationService.createNotification(notificationDto);
        } catch (Exception e) {
            log.error("Failed to send delivery status notification: ", e);
        }
    }
    
    /**
     * Helper method to get customer name from profiles
     */
    private String getCustomerName(UUID customerId) {
        try {
            return profileRepository.findById(customerId)
                .map(profile -> profile.getFirstName() + " " + profile.getLastName())
                .orElse("Customer");
        } catch (Exception e) {
            log.error("Error fetching customer name for ID {}: ", customerId, e);
            return "Customer";
        }
    }
    
    /**
     * Helper method to get driver name from profiles
     */
    private String getDriverName(UUID driverId) {
        try {
            return profileRepository.findById(driverId)
                .map(profile -> profile.getFirstName() + " " + profile.getLastName())
                .orElse("Driver");
        } catch (Exception e) {
            log.error("Error fetching driver name for ID {}: ", driverId, e);
            return "Driver";
        }
    }
}
