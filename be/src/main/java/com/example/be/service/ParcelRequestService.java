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
    

    public void delete(UUID id) { repo.deleteById(id); }
}
