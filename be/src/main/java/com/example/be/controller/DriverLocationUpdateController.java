package com.example.be.controller;

import com.example.be.dto.DriverLocationUpdateDto;
import com.example.be.dto.LocationUpdateCreateDto;
import com.example.be.model.DriverLocationUpdate;
import com.example.be.service.DriverLocationUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/driver-location-updates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverLocationUpdateController {

    private final DriverLocationUpdateService driverLocationUpdateService;

    @PostMapping
    public ResponseEntity<?> createLocationUpdate(@RequestBody LocationUpdateCreateDto createDto) {
        log.info("POST /driver-location-updates - Creating new location update");
        try {
            DriverLocationUpdate locationUpdate = driverLocationUpdateService.createLocationUpdate(
                createDto.getDeliveryTrackingId(),
                createDto.getLatitude(),
                createDto.getLongitude()
            );
            
            DriverLocationUpdateDto dto = convertToDto(locationUpdate);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error creating location update: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/driver-location-updates"));
        }
    }

    @GetMapping("/delivery-tracking/{deliveryTrackingId}")
    public ResponseEntity<?> getLocationUpdatesByDeliveryTracking(@PathVariable UUID deliveryTrackingId) {
        log.info("GET /driver-location-updates/delivery-tracking/{} - Fetching location updates", deliveryTrackingId);
        try {
            List<DriverLocationUpdate> locationUpdates = driverLocationUpdateService.getLocationUpdatesByDeliveryTracking(deliveryTrackingId);
            List<DriverLocationUpdateDto> dtos = locationUpdates.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching location updates: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/driver-location-updates/delivery-tracking/" + deliveryTrackingId));
        }
    }

    @GetMapping("/delivery-tracking/{deliveryTrackingId}/latest")
    public ResponseEntity<?> getLatestLocationUpdate(@PathVariable UUID deliveryTrackingId) {
        log.info("GET /driver-location-updates/delivery-tracking/{}/latest - Fetching latest location update", deliveryTrackingId);
        try {
            return driverLocationUpdateService.getLatestLocationUpdate(deliveryTrackingId)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching latest location update: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/driver-location-updates/delivery-tracking/" + deliveryTrackingId + "/latest"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLocationUpdateById(@PathVariable UUID id) {
        log.info("GET /driver-location-updates/{} - Fetching location update by ID", id);
        try {
            DriverLocationUpdate locationUpdate = driverLocationUpdateService.getLocationUpdateById(id);
            DriverLocationUpdateDto dto = convertToDto(locationUpdate);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error fetching location update: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/driver-location-updates/" + id));
        }
    }

    private DriverLocationUpdateDto convertToDto(DriverLocationUpdate locationUpdate) {
        DriverLocationUpdateDto dto = new DriverLocationUpdateDto();
        dto.setId(locationUpdate.getId());
        dto.setDeliveryTrackingId(locationUpdate.getDeliveryTracking().getId());
        dto.setLatitude(locationUpdate.getLatitude());
        dto.setLongitude(locationUpdate.getLongitude());
        dto.setRecordedAt(locationUpdate.getRecordedAt());
        return dto;
    }

    private java.util.Map<String, Object> createErrorResponse(Exception e, String path) {
        java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
        errorResponse.put("timestamp", ZonedDateTime.now());
        errorResponse.put("status", 500);
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("details", e.getClass().getSimpleName());
        errorResponse.put("path", path);
        return errorResponse;
    }
} 