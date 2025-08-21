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
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;

@RestController
@RequestMapping("/api/parcel-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ParcelRequestController {
    private final ParcelRequestService service;
    private final ProfileRepository profileRepository;
    private final BidService bidService;
    private final EntityManager entityManager;

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
        try {
            log.info("DELETE /parcel-requests/{} - Deleting parcel request with cascade", id);
            service.delete(id);
            
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("timestamp", java.time.LocalDateTime.now());
            successResponse.put("status", 200);
            successResponse.put("message", "Parcel request deleted successfully with all related data");
            successResponse.put("requestId", id);
            successResponse.put("path", "/parcel-requests/" + id);
            
            return ResponseEntity.ok(successResponse);
            
        } catch (RuntimeException e) {
            log.error("Error deleting parcel request with ID {}: {}", id, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            errorResponse.put("status", e.getMessage().contains("not found") ? 404 : 400);
            errorResponse.put("error", e.getMessage().contains("not found") ? "Not Found" : "Bad Request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("path", "/parcel-requests/" + id);
            
            org.springframework.http.HttpStatus status = e.getMessage().contains("not found") ? 
                org.springframework.http.HttpStatus.NOT_FOUND : org.springframework.http.HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Unexpected error deleting parcel request with ID {}: {}", id, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "Failed to delete parcel request: " + e.getMessage());
            errorResponse.put("path", "/parcel-requests/" + id);
            
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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

    /**
     * Get driver information for a delivered parcel request
     * GET /api/parcel-requests/{requestId}/driver
     */
    @GetMapping("/{requestId}/driver")
    public ResponseEntity<Map<String, Object>> getDriverForRequest(@PathVariable UUID requestId) {
        try {
            log.info("Fetching driver information for request: {}", requestId);
            
            // Query to get driver information for a delivered parcel request
            String sql = """
                SELECT DISTINCT 
                    d.id as driver_id,
                    d.first_name as driver_first_name,
                    d.last_name as driver_last_name,
                    d.profile_photo_url as driver_photo,
                    vd.make as vehicle_make,
                    vd.model as vehicle_model,
                    vd.plate_number as vehicle_plate,
                    b.offered_price,
                    b.id as bid_id,
                    rr.id as trip_id
                FROM bids b
                JOIN parcel_requests pr ON b.request_id = pr.id
                JOIN return_routes rr ON b.route_id = rr.id
                JOIN profiles d ON rr.driver_id = d.id
                LEFT JOIN vehicle_details vd ON vd.driver_id = d.id
                WHERE pr.id = ?
                AND pr.status = 'DELIVERED'
                AND b.status = 'ACCEPTED'
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter(1, requestId)
                .getResultList();
            
            if (results.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No driver found for this delivered request");
                return ResponseEntity.status(404).body(response);
            }
            
            Object[] row = results.get(0);
            Map<String, Object> driverData = new HashMap<>();
            driverData.put("driverId", row[0] != null ? row[0].toString() : null);
            driverData.put("driverName", (row[1] != null ? row[1] : "") + " " + (row[2] != null ? row[2] : ""));
            driverData.put("driverPhoto", row[3]);
            driverData.put("vehicleMake", row[4]);
            driverData.put("vehicleModel", row[5]);
            driverData.put("vehiclePlate", row[6]);
            driverData.put("offeredPrice", row[7]);
            driverData.put("bidId", row[8] != null ? row[8].toString() : null);
            driverData.put("tripId", row[9] != null ? row[9].toString() : null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("driver", driverData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching driver for request: {}", requestId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch driver information: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
