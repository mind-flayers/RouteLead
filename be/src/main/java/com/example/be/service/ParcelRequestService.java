package com.example.be.service;

import com.example.be.model.ParcelRequest;
import com.example.be.repository.ParcelRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParcelRequestService {
    private final ParcelRequestRepository repo;

    public List<ParcelRequest> getAll() { return repo.findAll(); }
    public ParcelRequest getById(UUID id) { return repo.findById(id).orElse(null); }
    public List<ParcelRequest> getByCustomerId(UUID customerId) { return repo.findByCustomerId(customerId); }
    public ParcelRequest create(ParcelRequest pr) { return repo.save(pr); }

    @Transactional
    public void createNative(ParcelRequest pr) {
        log.info("Service: Creating parcel request with volume: {} m³", pr.getVolumeM3());
        log.info("Service: Weight: {} kg, Description: {}", pr.getWeightKg(), pr.getDescription());
        
        repo.insertParcelRequestWithEnum(
            pr.getCustomer() != null ? pr.getCustomer().getId() : null,
            pr.getPickupLat(),
            pr.getPickupLng(),
            pr.getDropoffLat(),
            pr.getDropoffLng(),
            pr.getWeightKg(),
            pr.getVolumeM3(),
            pr.getDescription(),
            pr.getMaxBudget(),
            pr.getDeadline(),
            pr.getStatus().name(),
            pr.getPickupContactName(),
            pr.getPickupContactPhone(),
            pr.getDeliveryContactName(),
            pr.getDeliveryContactPhone(),
            pr.getCreatedAt() != null ? pr.getCreatedAt() : java.time.ZonedDateTime.now(),
            pr.getUpdatedAt() != null ? pr.getUpdatedAt() : java.time.ZonedDateTime.now()
        );
    }
    
    @Transactional
    public UUID createNativeAndReturnId(ParcelRequest pr) {
        return repo.insertParcelRequestWithEnumAndReturnId(
            pr.getCustomer() != null ? pr.getCustomer().getId() : null,
            pr.getPickupLat(),
            pr.getPickupLng(),
            pr.getDropoffLat(),
            pr.getDropoffLng(),
            pr.getWeightKg(),
            pr.getVolumeM3(),
            pr.getDescription(),
            pr.getMaxBudget(),
            pr.getDeadline(),
            pr.getStatus().name(),
            pr.getPickupContactName(),
            pr.getPickupContactPhone(),
            pr.getDeliveryContactName(),
            pr.getDeliveryContactPhone(),
            pr.getCreatedAt() != null ? pr.getCreatedAt() : java.time.ZonedDateTime.now(),
            pr.getUpdatedAt() != null ? pr.getUpdatedAt() : java.time.ZonedDateTime.now()
        );
    }
    

    @Transactional
    public void delete(UUID id) { 
        log.info("Deleting parcel request {} with cascade - removing all related entities", id);
        
        // Check if parcel request exists
        if (!repo.existsById(id)) {
            throw new RuntimeException("Parcel request not found with ID: " + id);
        }
        
        // Delete all related entities in the correct order (child entities first)
        log.info("Deleting related payments for parcel request {}", id);
        repo.deleteRelatedPayments(id);
        
        log.info("Deleting related earnings for parcel request {}", id);
        repo.deleteRelatedEarnings(id);
        
        log.info("Deleting related conversations for parcel request {}", id);
        repo.deleteRelatedConversations(id);
        
        log.info("Deleting related delivery tracking for parcel request {}", id);
        repo.deleteRelatedDeliveryTracking(id);
        
        log.info("Deleting related disputes for parcel request {}", id);
        repo.deleteRelatedDisputes(id);
        
        log.info("Deleting related bids for parcel request {}", id);
        repo.deleteRelatedBids(id);
        
        // Finally delete the parcel request itself
        log.info("Deleting parcel request {} itself", id);
        repo.deleteById(id);
        
        log.info("Successfully deleted parcel request {} with all related data (bids, payments, earnings, conversations, delivery tracking, disputes)", id);
    }
}
