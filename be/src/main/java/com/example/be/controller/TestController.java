package com.example.be.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {

    private final EntityManager entityManager;

    /**
     * Test endpoint to update bid status for testing purposes
     */
    @PostMapping("/update-bid-status")
    public ResponseEntity<Map<String, Object>> updateBidStatus(@RequestBody Map<String, String> request) {
        try {
            String bidId = request.get("bidId");
            String status = request.get("status");
            
            log.info("TEST: Updating bid {} to status {}", bidId, status);
            
            String sql = "UPDATE bids SET status = ?::bid_status, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, status);
            query.setParameter(2, UUID.fromString(bidId));
            
            int rowsUpdated = query.executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bid status updated successfully");
            response.put("bidId", bidId);
            response.put("newStatus", status);
            response.put("rowsUpdated", rowsUpdated);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating bid status: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update bid status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test endpoint to update parcel request status
     */
    @PostMapping("/update-parcel-status")
    public ResponseEntity<Map<String, Object>> updateParcelStatus(@RequestBody Map<String, String> request) {
        try {
            String parcelId = request.get("parcelId");
            String status = request.get("status");
            
            log.info("TEST: Updating parcel request {} to status {}", parcelId, status);
            
            String sql = "UPDATE parcel_requests SET status = ?::parcel_status, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, status);
            query.setParameter(2, UUID.fromString(parcelId));
            
            int rowsUpdated = query.executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Parcel request status updated successfully");
            response.put("parcelId", parcelId);
            response.put("newStatus", status);
            response.put("rowsUpdated", rowsUpdated);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating parcel request status: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update parcel request status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test endpoint to create payment
     */
    @PostMapping("/create-payment")
    @Transactional
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String bidId = (String) request.get("bidId");
            String amount = request.get("amount").toString();
            String paymentStatus = (String) request.get("paymentStatus");
            
            log.info("TEST: Creating payment for user {} bid {} amount {} status {}", userId, bidId, amount, paymentStatus);
            
            String sql = """
                INSERT INTO payments (id, user_id, bid_id, amount, currency, payment_method, payment_status, transaction_id, created_at, updated_at)
                VALUES (gen_random_uuid(), ?, ?, ?, 'LKR', 'TEST', ?, 'TEST_TXN_' || extract(epoch from now()), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, UUID.fromString(userId));
            query.setParameter(2, UUID.fromString(bidId));
            query.setParameter(3, Double.parseDouble(amount));
            query.setParameter(4, paymentStatus.toLowerCase()); // Convert to lowercase for enum compatibility
            
            int rowsInserted = query.executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment created successfully");
            response.put("userId", userId);
            response.put("bidId", bidId);
            response.put("amount", amount);
            response.put("paymentStatus", paymentStatus);
            response.put("rowsInserted", rowsInserted);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating payment: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create payment: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
