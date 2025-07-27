package com.example.be.controller;

import com.example.be.dto.DisputeDto;
import com.example.be.dto.DisputeCreateDto;
import com.example.be.model.Dispute;
import com.example.be.service.DisputeService;
import com.example.be.types.DisputeStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/disputes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ResponseEntity<?> createDispute(@RequestBody DisputeCreateDto createDto) {
        log.info("POST /disputes - Creating new dispute");
        try {
            Dispute dispute = disputeService.createDispute(
                createDto.getUserId(),
                createDto.getDescription(),
                createDto.getRelatedBidId(),
                createDto.getRelatedRouteId()
            );
            
            DisputeDto dto = convertToDto(dispute);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error creating dispute: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes"));
        }
    }

    @PatchMapping("/{disputeId}/status")
    public ResponseEntity<?> updateDisputeStatus(@PathVariable UUID disputeId, @RequestBody DisputeStatusEnum status) {
        log.info("PATCH /disputes/{}/status - Updating dispute status to {}", disputeId, status);
        try {
            Dispute dispute = disputeService.updateDisputeStatus(disputeId, status);
            DisputeDto dto = convertToDto(dispute);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error updating dispute status: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/" + disputeId + "/status"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getDisputesByUser(@PathVariable UUID userId) {
        log.info("GET /disputes/user/{} - Fetching disputes by user", userId);
        try {
            List<Dispute> disputes = disputeService.getDisputesByUser(userId);
            List<DisputeDto> dtos = disputes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching disputes by user: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/user/" + userId));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getDisputesByStatus(@PathVariable DisputeStatusEnum status) {
        log.info("GET /disputes/status/{} - Fetching disputes by status", status);
        try {
            List<Dispute> disputes = disputeService.getDisputesByStatus(status);
            List<DisputeDto> dtos = disputes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching disputes by status: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/status/" + status));
        }
    }

    @GetMapping("/bid/{bidId}")
    public ResponseEntity<?> getDisputesByBid(@PathVariable UUID bidId) {
        log.info("GET /disputes/bid/{} - Fetching disputes by bid", bidId);
        try {
            List<Dispute> disputes = disputeService.getDisputesByBid(bidId);
            List<DisputeDto> dtos = disputes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching disputes by bid: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/bid/" + bidId));
        }
    }

    @GetMapping("/route/{routeId}")
    public ResponseEntity<?> getDisputesByRoute(@PathVariable UUID routeId) {
        log.info("GET /disputes/route/{} - Fetching disputes by route", routeId);
        try {
            List<Dispute> disputes = disputeService.getDisputesByRoute(routeId);
            List<DisputeDto> dtos = disputes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching disputes by route: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/route/" + routeId));
        }
    }

    @GetMapping("/open")
    public ResponseEntity<?> getOpenDisputes() {
        log.info("GET /disputes/open - Fetching open disputes");
        try {
            List<Dispute> disputes = disputeService.getOpenDisputes();
            List<DisputeDto> dtos = disputes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching open disputes: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/open"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDisputeById(@PathVariable UUID id) {
        log.info("GET /disputes/{} - Fetching dispute by ID", id);
        try {
            Dispute dispute = disputeService.getDisputeById(id);
            DisputeDto dto = convertToDto(dispute);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error fetching dispute: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/" + id));
        }
    }

    @GetMapping("/stats/status/{status}")
    public ResponseEntity<?> getDisputeCountByStatus(@PathVariable DisputeStatusEnum status) {
        log.info("GET /disputes/stats/status/{} - Fetching dispute count by status", status);
        try {
            long count = disputeService.getDisputeCountByStatus(status);
            return ResponseEntity.ok(java.util.Map.of("count", count, "status", status));
        } catch (Exception e) {
            log.error("Error fetching dispute count by status: ", e);
            return ResponseEntity.status(500).body(createErrorResponse(e, "/disputes/stats/status/" + status));
        }
    }

    private DisputeDto convertToDto(Dispute dispute) {
        DisputeDto dto = new DisputeDto();
        dto.setId(dispute.getId());
        dto.setUserId(dispute.getUser().getId());
        dto.setDescription(dispute.getDescription());
        dto.setStatus(dispute.getStatus());
        dto.setCreatedAt(dispute.getCreatedAt());
        dto.setResolvedAt(dispute.getResolvedAt());
        
        if (dispute.getRelatedBid() != null) {
            dto.setRelatedBidId(dispute.getRelatedBid().getId());
        }
        
        if (dispute.getRelatedRoute() != null) {
            dto.setRelatedRouteId(dispute.getRelatedRoute().getId());
        }
        
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