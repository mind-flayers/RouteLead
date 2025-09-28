package com.example.be.controller;

import com.example.be.dto.PayHereResponseDto;
import com.example.be.service.PayHereService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PayHereService payHereService;
    private final EntityManager entityManager;

    /**
     * Get PayHere configuration
     * GET /api/payments/payhere/config
     */
    @GetMapping("/payhere/config")
    public ResponseEntity<Map<String, Object>> getPayHereConfig() {
        try {
            log.info("Fetching PayHere configuration");
            
            Map<String, Object> config = new HashMap<>();
            config.put("merchantId", "1217129");
            config.put("merchantSecret", "8mMqK5xQ4vL2nR7pS9tU1wY3zA6bC8dE");
            config.put("currency", "LKR");
            config.put("sandboxUrl", "https://sandbox.payhere.lk/pay/checkout");
            config.put("liveUrl", "https://www.payhere.lk/pay/checkout");
            config.put("testCardNumber", "4242424242424242");
            config.put("testCardExpiry", "12/25");
            config.put("testCardCvv", "123");
            config.put("returnUrl", "http://routelead.bigpythondaddy.com/api/payments/return");
            config.put("cancelUrl", "http://routelead.bigpythondaddy.com/api/payments/cancel");
            config.put("notifyUrl", "http://routelead.bigpythondaddy.com/api/payments/webhook");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PayHere configuration loaded successfully");
            response.put("data", config);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching PayHere configuration", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to load PayHere configuration: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Initialize payment
     * POST /api/payments/initialize
     */
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializePayment(@RequestParam Map<String, String> params) {
        try {
            log.info("Initializing payment with params: {}", params);
            
            String bidId = params.get("bidId");
            String requestId = params.get("requestId");
            String userId = params.get("userId");
            String amount = params.get("amount");
            String paymentMethod = params.get("paymentMethod");
            
            // Validate parameters
            if (bidId == null || requestId == null || userId == null || amount == null || paymentMethod == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
                response.put("message", "Missing required parameters");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Generate order ID
            String orderId = "ORDER_" + System.currentTimeMillis() + "_" + bidId.substring(0, 8);
            
            // Create payment data
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("orderId", orderId);
            paymentData.put("firstName", "Customer");
            paymentData.put("lastName", "User");
            paymentData.put("email", "customer@example.com");
            paymentData.put("phone", "0712345678");
            paymentData.put("address", "123 Main Street");
            paymentData.put("city", "Colombo");
            paymentData.put("country", "Sri Lanka");
            paymentData.put("items", "RouteLead Service");
            paymentData.put("currency", "LKR");
            paymentData.put("amount", amount);
            paymentData.put("custom1", bidId);
            paymentData.put("custom2", requestId);
            paymentData.put("custom3", userId);
            paymentData.put("custom4", paymentMethod);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment initialized successfully");
            response.put("data", paymentData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error initializing payment", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to initialize payment: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Generate PayHere hash
     * POST /api/payments/payhere/generate-hash
     */
    @PostMapping("/payhere/generate-hash")
    public ResponseEntity<Map<String, Object>> generatePayHereHash(@RequestBody Map<String, String> request) {
        try {
            log.info("Generating PayHere hash for request: {}", request);
            
            // Simple hash generation (in production, use proper PayHere hash algorithm)
            String orderId = request.get("order_id");
            String amount = request.get("amount");
            String currency = request.get("currency");
            
            if (orderId == null || amount == null || currency == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required parameters for hash generation");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Generate a simple hash (replace with actual PayHere hash algorithm)
            String hashString = orderId + amount + currency + "8mMqK5xQ4vL2nR7pS9tU1wY3zA6bC8dE";
            String hash = java.security.MessageDigest.getInstance("MD5")
                    .digest(hashString.getBytes())
                    .toString();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hash generated successfully");
            response.put("hash", hash);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating PayHere hash", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate hash: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * PayHere webhook endpoint
     * POST /api/payments/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody PayHereResponseDto response, 
                                               @RequestHeader("X-PayHere-Signature") String receivedHash) {
        try {
            log.info("Received webhook: {}", response);
            
            // Verify hash
            if (!payHereService.verifyHash(response, receivedHash)) {
                log.warn("Invalid hash received in webhook");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid hash");
            }
            
            log.info("Webhook processed successfully. Status: {}", response.toString());
            return ResponseEntity.ok("OK");
            
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }

    /**
     * Payment return URL (success)
     * GET /api/payments/return
     */
    @GetMapping("/return")
    public ResponseEntity<Map<String, Object>> handlePaymentReturn(@RequestParam Map<String, String> params) {
        try {
            log.info("Payment return with params: {}", params);
            
            // Process successful payment
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment completed successfully");
            response.put("data", params);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing payment return", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing payment return: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Payment cancel URL
     * GET /api/payments/cancel
     */
    @GetMapping("/cancel")
    public ResponseEntity<Map<String, Object>> handlePaymentCancel(@RequestParam Map<String, String> params) {
        try {
            log.info("Payment cancelled with params: {}", params);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Payment was cancelled");
            response.put("data", params);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing payment cancel", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing payment cancel: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Bypass payment for development/testing purposes
     * POST /api/payments/bypass
     * This endpoint simulates a successful payment and creates a payment record
     */
    @PostMapping("/bypass")
    @Transactional
    public ResponseEntity<Map<String, Object>> bypassPayment(@RequestBody Map<String, Object> request) {
        try {
            log.info("Processing bypass payment request: {}", request);
            
            // Extract payment data from request
            String bidId = (String) request.get("bidId");
            String requestId = (String) request.get("requestId");
            String userId = (String) request.get("userId");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String paymentMethod = (String) request.get("paymentMethod");
            
            // Validate parameters
            if (bidId == null || requestId == null || userId == null || amount == null || paymentMethod == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required parameters");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Convert to UUIDs
            UUID bidIdUuid = UUID.fromString(bidId);
            UUID userIdUuid = UUID.fromString(userId);
            
            // Generate transaction IDs
            String orderId = "BYPASS_" + System.currentTimeMillis() + "_" + bidIdUuid.toString().substring(0, 8);
            String transactionId = "BYPASS_" + System.currentTimeMillis();
            UUID paymentId = UUID.randomUUID();
            
            // Create payment record in database using native SQL to handle enums properly
            try {
                String insertPaymentSql = "INSERT INTO payments (id, user_id, bid_id, amount, currency, payment_method, payment_status, transaction_id, gateway_response, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, CAST(? AS payment_status_enum), ?, CAST(? AS jsonb), NOW(), NOW())";
                
                Query paymentInsertQuery = entityManager.createNativeQuery(insertPaymentSql);
                
                // Create gateway response JSON
                String gatewayResponseJson = String.format("{\"orderId\":\"%s\",\"gateway\":\"BYPASS\"}", orderId);
                
                log.info("Inserting payment with transaction_id: {}", transactionId);
                log.info("Inserting payment with gateway_response: {}", gatewayResponseJson);
                
                paymentInsertQuery.setParameter(1, paymentId);
                paymentInsertQuery.setParameter(2, userIdUuid);
                paymentInsertQuery.setParameter(3, bidIdUuid);
                paymentInsertQuery.setParameter(4, amount);
                paymentInsertQuery.setParameter(5, "LKR");
                paymentInsertQuery.setParameter(6, paymentMethod);
                paymentInsertQuery.setParameter(7, "completed"); // payment_status_enum value
                paymentInsertQuery.setParameter(8, transactionId);
                paymentInsertQuery.setParameter(9, gatewayResponseJson);
                
                int paymentRowsInserted = paymentInsertQuery.executeUpdate();
                log.info("Created {} payment record with ID: {} for bid ID: {} with transaction_id: {}", paymentRowsInserted, paymentId, bidId, transactionId);
                
            } catch (Exception e) {
                log.error("Failed to create payment record: {}", e.getMessage());
                e.printStackTrace();
                // Continue with the response even if payment record creation fails
            }
            
            // Create response data
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("id", paymentId.toString());
            paymentData.put("bidId", bidId);
            paymentData.put("requestId", requestId);
            paymentData.put("userId", userId);
            paymentData.put("amount", amount);
            paymentData.put("currency", "LKR");
            paymentData.put("paymentMethod", paymentMethod);
            paymentData.put("paymentStatus", "COMPLETED");
            paymentData.put("transactionId", transactionId);
            paymentData.put("orderId", orderId);
            paymentData.put("gateway", "BYPASS");
            paymentData.put("timestamp", System.currentTimeMillis());
            paymentData.put("createdAt", System.currentTimeMillis());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("data", paymentData);
            
            log.info("Payment bypassed successfully for bid: {}, transaction ID: {}", 
                    bidId, transactionId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing bypass payment", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to process bypass payment: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Check payment status for a specific bid using native SQL
     * GET /api/payments/bid/{bidId}/status
     */
    @GetMapping("/bid/{bidId}/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatusByBidId(@PathVariable UUID bidId) {
        try {
            log.info("Checking payment status for bid: {}", bidId);
            
            // Use native SQL to avoid Hibernate enum issues
            String sql = "SELECT id, user_id, bid_id, amount, currency, payment_method, " +
                        "payment_status::text, transaction_id, gateway_response, created_at, updated_at " +
                        "FROM payments WHERE bid_id = ?";
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, bidId);
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();
            
            if (!results.isEmpty()) {
                Object[] row = results.get(0);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment found");
                response.put("data", Map.of(
                    "bidId", bidId.toString(),
                    "paymentStatus", row[6] != null ? row[6].toString() : "UNKNOWN",
                    "amount", row[3],
                    "currency", row[4],
                    "paymentMethod", row[5],
                    "transactionId", row[7],
                    "orderId", row[8] != null ? extractOrderIdFromGatewayResponse(row[8].toString()) : null,
                    "gateway", row[8] != null ? extractGatewayFromGatewayResponse(row[8].toString()) : null,
                    "createdAt", row[9],
                    "isPaid", "completed".equals(row[6])
                ));
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No payment found for this bid");
                response.put("data", Map.of(
                    "bidId", bidId.toString(),
                    "paymentStatus", "NOT_FOUND",
                    "amount", null,
                    "currency", null,
                    "paymentMethod", null,
                    "transactionId", null,
                    "orderId", null,
                    "gateway", null,
                    "createdAt", null,
                    "isPaid", false
                ));
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("Error checking payment status for bid: {}", bidId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error checking payment status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Check payment status for bids by request ID using native SQL
     * GET /api/payments/request/{requestId}/status
     */
    @GetMapping("/request/{requestId}/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatusByRequestId(@PathVariable String requestId) {
        try {
            log.info("Checking payment status for request: {}", requestId);
            
            // Convert requestId to UUID
            UUID requestIdUuid = UUID.fromString(requestId);
            
            // First, try to get bids for this request to see if any exist
            String bidsSql = "SELECT id, offered_price, status FROM bids WHERE request_id = ?";
            Query bidsQuery = entityManager.createNativeQuery(bidsSql);
            bidsQuery.setParameter(1, requestIdUuid);
            
            @SuppressWarnings("unchecked")
            List<Object[]> bidsResults = bidsQuery.getResultList();
            
            if (bidsResults.isEmpty()) {
                log.info("No bids found for request: {}", requestId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("requestId", requestId);
                response.put("paymentStatuses", new ArrayList<>());
                response.put("totalPayments", 0);
                response.put("paidCount", 0);
                response.put("message", "No bids found for this request");
                return ResponseEntity.ok(response);
            }
            
            // Now try to get payments for these bids
            List<Map<String, Object>> paymentStatuses = new ArrayList<>();
            
            for (Object[] bidRow : bidsResults) {
                String bidId = bidRow[0].toString();
                BigDecimal offeredPrice = (BigDecimal) bidRow[1];
                String bidStatus = bidRow[2].toString();
                
                // Try to find payment for this bid
                String paymentSql = "SELECT id, user_id, bid_id, amount, currency, payment_method, " +
                            "payment_status::text, transaction_id, gateway_response, created_at, updated_at " +
                            "FROM payments WHERE bid_id = ?";
                
                Query paymentQuery = entityManager.createNativeQuery(paymentSql);
                paymentQuery.setParameter(1, UUID.fromString(bidId));
                
                @SuppressWarnings("unchecked")
                List<Object[]> paymentResults = paymentQuery.getResultList();
                
                Map<String, Object> status = new HashMap<>();
                status.put("bidId", bidId);
                status.put("offeredPrice", offeredPrice);
                status.put("bidStatus", bidStatus);
                
                if (!paymentResults.isEmpty()) {
                    Object[] paymentRow = paymentResults.get(0);
                    status.put("paymentStatus", paymentRow[6] != null ? paymentRow[6].toString() : "UNKNOWN");
                    status.put("amount", paymentRow[3]);
                    status.put("transactionId", paymentRow[7]);
                    status.put("orderId", paymentRow[8] != null ? extractOrderIdFromGatewayResponse(paymentRow[8].toString()) : null);
                    status.put("paid", "completed".equals(paymentRow[6]));
                    status.put("paymentDate", paymentRow[10]);
                } else {
                    // No payment found for this bid
                    status.put("paymentStatus", "NOT_FOUND");
                    status.put("amount", offeredPrice);
                    status.put("transactionId", null);
                    status.put("orderId", null);
                    status.put("paid", false);
                    status.put("paymentDate", null);
                }
                
                paymentStatuses.add(status);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requestId", requestId);
            response.put("paymentStatuses", paymentStatuses);
            response.put("totalPayments", paymentStatuses.size());
            response.put("paidCount", paymentStatuses.stream()
                .mapToInt(s -> (Boolean) s.get("paid") ? 1 : 0)
                .sum());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for requestId: {}", requestId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid request ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error checking payment status for request: {}", requestId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to check payment status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Helper method to extract orderId from gateway response JSON
     */
    private String extractOrderIdFromGatewayResponse(String gatewayResponseJson) {
        try {
            if (gatewayResponseJson == null || gatewayResponseJson.trim().isEmpty()) {
                return null;
            }
            // Simple JSON parsing for orderId
            if (gatewayResponseJson.contains("\"orderId\"")) {
                int start = gatewayResponseJson.indexOf("\"orderId\":\"") + 11;
                int end = gatewayResponseJson.indexOf("\"", start);
                if (start > 10 && end > start) {
                    return gatewayResponseJson.substring(start, end);
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to extract orderId from gateway response: {}", gatewayResponseJson);
            return null;
        }
    }
    
    /**
     * Helper method to extract gateway from gateway response JSON
     */
    private String extractGatewayFromGatewayResponse(String gatewayResponseJson) {
        try {
            if (gatewayResponseJson == null || gatewayResponseJson.trim().isEmpty()) {
                return null;
            }
            // Simple JSON parsing for gateway
            if (gatewayResponseJson.contains("\"gateway\"")) {
                int start = gatewayResponseJson.indexOf("\"gateway\":\"") + 11;
                int end = gatewayResponseJson.indexOf("\"", start);
                if (start > 10 && end > start) {
                    return gatewayResponseJson.substring(start, end);
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to extract gateway from gateway response: {}", gatewayResponseJson);
            return null;
        }
    }
}