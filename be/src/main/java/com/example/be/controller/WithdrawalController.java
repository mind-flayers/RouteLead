package com.example.be.controller;

import com.example.be.dto.CreateWithdrawalRequestDto;
import com.example.be.dto.WithdrawalDto;
import com.example.be.service.WithdrawalService;
import com.example.be.types.WithdrawalStatusEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/withdrawals")
@CrossOrigin(origins = "*")
public class WithdrawalController {

    private static final Logger log = LoggerFactory.getLogger(WithdrawalController.class);

    @Autowired
    private WithdrawalService withdrawalService;

    /**
     * Create a new withdrawal request
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createWithdrawal(@Valid @RequestBody CreateWithdrawalRequestDto request) {
        try {
            log.info("Creating withdrawal for driver: {}, amount: {}", request.getDriverId(), request.getAmount());
            
            WithdrawalDto withdrawal = withdrawalService.createWithdrawal(
                request.getDriverId(),
                request.getAmount(),
                request.getBankDetails()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", withdrawal);
            response.put("message", "Withdrawal request created successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error creating withdrawal for driver: {}", request.getDriverId(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get withdrawal history for a driver
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<Map<String, Object>> getWithdrawalHistory(@PathVariable UUID driverId) {
        try {
            log.info("Getting withdrawal history for driver: {}", driverId);
            
            List<WithdrawalDto> withdrawals = withdrawalService.getWithdrawalHistory(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", withdrawals);
            response.put("message", "Withdrawal history retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving withdrawal history for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all withdrawal requests (for admin)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Map<String, Object>> getAllWithdrawals() {
        try {
            log.info("Getting all withdrawal requests for admin");
            
            List<WithdrawalDto> withdrawals = withdrawalService.getAllWithdrawals();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", withdrawals);
            response.put("message", "All withdrawal requests retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving all withdrawal requests", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update withdrawal status (for admin)
     */
    @PatchMapping("/{withdrawalId}/status")
    public ResponseEntity<Map<String, Object>> updateWithdrawalStatus(
            @PathVariable UUID withdrawalId,
            @RequestParam String status,
            @RequestParam(required = false) String transactionId) {
        try {
            log.info("Updating withdrawal status: {}, new status: {}", withdrawalId, status);
            
            WithdrawalStatusEnum statusEnum = WithdrawalStatusEnum.valueOf(status.toUpperCase());
            
            WithdrawalDto withdrawal = withdrawalService.updateWithdrawalStatus(withdrawalId, statusEnum, transactionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", withdrawal);
            response.put("message", "Withdrawal status updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid withdrawal status: {}", status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Invalid withdrawal status: " + status);
            
            return ResponseEntity.badRequest().body(response);
            
        } catch (RuntimeException e) {
            log.error("Error updating withdrawal status: {}", withdrawalId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get withdrawal by ID
     */
    @GetMapping("/{withdrawalId}")
    public ResponseEntity<Map<String, Object>> getWithdrawal(@PathVariable UUID withdrawalId) {
        try {
            log.info("Getting withdrawal: {}", withdrawalId);
            
            WithdrawalDto withdrawal = withdrawalService.getWithdrawalById(withdrawalId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", withdrawal);
            response.put("message", "Withdrawal retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving withdrawal: {}", withdrawalId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get available balance for a driver
     */
    @GetMapping("/driver/{driverId}/balance")
    public ResponseEntity<Map<String, Object>> getAvailableBalance(@PathVariable UUID driverId) {
        try {
            log.info("Getting available balance for driver: {}", driverId);
            
            java.math.BigDecimal balance = withdrawalService.getAvailableBalance(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", Map.of("availableBalance", balance));
            response.put("message", "Available balance retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving available balance for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
