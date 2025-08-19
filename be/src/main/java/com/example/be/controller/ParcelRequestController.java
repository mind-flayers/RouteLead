package com.example.be.controller;

import com.example.be.model.ParcelRequest;
import com.example.be.model.Profile;
import com.example.be.service.ParcelRequestService;
import com.example.be.service.BidService;
import com.example.be.dto.RequestBidCreateDto;
import com.example.be.dto.BidCreateDto;
import com.example.be.dto.BidDto;
import com.example.be.repository.ProfileRepository;
import com.example.be.dto.ParcelRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parcel-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ParcelRequestController {
    private final ParcelRequestService service;
    private final ProfileRepository profileRepository;
    private final BidService bidService;

    @GetMapping
    public List<ParcelRequest> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        ParcelRequest pr = service.getById(id);
        return pr != null ? ResponseEntity.ok(pr) : ResponseEntity.notFound().build();
    }

    @GetMapping("/by-customer")
    public List<ParcelRequestDto> getByCustomerId(@RequestParam UUID customerId) {
        List<ParcelRequest> entities = service.getByCustomerId(customerId);
        return entities.stream().map(pr -> {
            ParcelRequestDto dto = new ParcelRequestDto();
            dto.setId(pr.getId());
            dto.setCustomerId(pr.getCustomer() != null ? pr.getCustomer().getId() : null);
            dto.setPickupLat(pr.getPickupLat());
            dto.setPickupLng(pr.getPickupLng());
            dto.setDropoffLat(pr.getDropoffLat());
            dto.setDropoffLng(pr.getDropoffLng());
            dto.setWeightKg(pr.getWeightKg());
            dto.setVolumeM3(pr.getVolumeM3());
            dto.setDescription(pr.getDescription());
            dto.setMaxBudget(pr.getMaxBudget());
            dto.setDeadline(pr.getDeadline());
            dto.setStatus(pr.getStatus());
            dto.setPickupContactName(pr.getPickupContactName());
            dto.setPickupContactPhone(pr.getPickupContactPhone());
            dto.setDeliveryContactName(pr.getDeliveryContactName());
            dto.setDeliveryContactPhone(pr.getDeliveryContactPhone());
            dto.setCreatedAt(pr.getCreatedAt());
            dto.setUpdatedAt(pr.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ParcelRequest pr) {
        try {
            log.info("Controller: Received parcel request - Weight: {}kg, Volume: {}m³, Description: {}", 
                    pr.getWeightKg(), pr.getVolumeM3(), pr.getDescription());
            log.info("Controller: Volume details - Type: {}, Value: {}, Scale: {}", 
                    pr.getVolumeM3() != null ? pr.getVolumeM3().getClass().getName() : "NULL",
                    pr.getVolumeM3(),
                    pr.getVolumeM3() != null ? pr.getVolumeM3().scale() : "N/A");
            log.info("Controller: Contact info - Pickup: {} ({}) | Delivery: {} ({})", 
                    pr.getPickupContactName(), pr.getPickupContactPhone(),
                    pr.getDeliveryContactName(), pr.getDeliveryContactPhone());
            
            // Check if volume is null or zero
            if (pr.getVolumeM3() == null) {
                log.error("Controller: Volume is NULL!");
            } else if (pr.getVolumeM3().compareTo(java.math.BigDecimal.ZERO) == 0) {
                log.error("Controller: Volume is ZERO!");
            }
            
            // Set up customer relationship
            if (pr.getCustomerId() != null) {
                Profile customer = profileRepository.findById(pr.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + pr.getCustomerId()));
                pr.setCustomer(customer);
            }
            
            // Use native SQL (returning ID) to avoid enum casting issues and give FE the ID
            java.util.UUID createdId = service.createNativeAndReturnId(pr);
            log.info("Controller: Saved parcel request using native SQL. ID: {}", createdId);
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("id", createdId);
            return ResponseEntity.status(201).body(body);
        } catch (Exception e) {
            log.error("Error creating parcel request: ", e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<?> createBidForRequest(@PathVariable("id") UUID requestId,
                                                 @RequestBody RequestBidCreateDto req) {
        try {
            if (req.getRouteId() == null || req.getOfferedPrice() == null) {
                return ResponseEntity.badRequest().body("routeId and offeredPrice are required");
            }
            BidCreateDto dto = new BidCreateDto();
            dto.setRequestId(requestId);
            dto.setRouteId(req.getRouteId());
            dto.setStartIndex(req.getStartIndex() != null ? req.getStartIndex() : 0);
            dto.setEndIndex(req.getEndIndex() != null ? req.getEndIndex() : 0);
            dto.setOfferedPrice(req.getOfferedPrice());
            BidDto created = bidService.createBid(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Error creating bid for request {}: ", requestId, e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
