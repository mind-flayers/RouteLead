package com.example.be.controller;

import com.example.be.service.DisputeService;
import com.example.be.types.DisputeStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDispute(@RequestBody Map<String, Object> request) {
        try {
            log.info("Creating dispute: {}", request);
            
            String userId = (String) request.get("userId");
            String parcelRequestId = (String) request.get("parcelRequestId");
            String description = (String) request.get("description");

            if (userId == null || parcelRequestId == null || description == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required fields: userId, parcelRequestId, description");
                return ResponseEntity.badRequest().body(response);
            }

            UUID userIdUuid = UUID.fromString(userId);
            UUID parcelRequestIdUuid = UUID.fromString(parcelRequestId);

            var dispute = disputeService.createDispute(userIdUuid, parcelRequestIdUuid, description);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Dispute created successfully");
            response.put("disputeId", dispute.get("id").toString());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format in dispute creation: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid ID format: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error creating dispute: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create dispute: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDisputes(@PathVariable String userId) {
        try {
            log.info("Getting disputes for user: {}", userId);
            UUID userIdUuid = UUID.fromString(userId);
            var disputes = disputeService.getUserDisputes(userIdUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("disputes", disputes);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for userId: {}", userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid user ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error getting user disputes: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get disputes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/parcel-request/{parcelRequestId}")
    public ResponseEntity<Map<String, Object>> getParcelRequestDisputes(@PathVariable String parcelRequestId) {
        try {
            log.info("Getting disputes for parcel request: {}", parcelRequestId);
            UUID parcelRequestIdUuid = UUID.fromString(parcelRequestId);
            var disputes = disputeService.getParcelRequestDisputes(parcelRequestIdUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("disputes", disputes);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for parcelRequestId: {}", parcelRequestId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid parcel request ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error getting parcel request disputes: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get disputes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{disputeId}/status")
    public ResponseEntity<Map<String, Object>> updateDisputeStatus(
            @PathVariable String disputeId,
            @RequestBody Map<String, Object> request) {
        try {
            log.info("Updating dispute status: disputeId={}, request={}", disputeId, request);
            
            String statusStr = (String) request.get("status");
            if (statusStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required field: status");
                return ResponseEntity.badRequest().body(response);
            }

            UUID disputeIdUuid = UUID.fromString(disputeId);
            DisputeStatusEnum status = DisputeStatusEnum.valueOf(statusStr);

            var result = disputeService.updateDisputeStatus(disputeIdUuid, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Dispute status updated successfully");
            response.put("dispute", result);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid format in dispute status update: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid format: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error updating dispute status: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update dispute status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 