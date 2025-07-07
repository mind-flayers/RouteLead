package com.example.be.service;

import com.example.be.model.ParcelRequest;
import com.example.be.repository.ParcelRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParcelRequestService {
    private final ParcelRequestRepository repo;

    public List<ParcelRequest> getAll() { return repo.findAll(); }
    public ParcelRequest getById(UUID id) { return repo.findById(id).orElse(null); }
    public List<ParcelRequest> getByCustomerId(UUID customerId) { return repo.findByCustomerId(customerId); }
    public ParcelRequest create(ParcelRequest pr) { return repo.save(pr); }

    @Transactional
    public void createNative(ParcelRequest pr) {
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
            pr.getCreatedAt() != null ? pr.getCreatedAt() : java.time.ZonedDateTime.now(),
            pr.getUpdatedAt() != null ? pr.getUpdatedAt() : java.time.ZonedDateTime.now()
        );
    }
    public void delete(UUID id) { repo.deleteById(id); }
}
