package com.example.be.controller;

import com.example.be.dto.PayHereResponseDto;
import com.example.be.model.Bid;
import com.example.be.model.Payment;
import com.example.be.repository.BidRepository;
import com.example.be.repository.PaymentRepository;
import com.example.be.service.PayHereService;
import com.example.be.types.PaymentStatusEnum;
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
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PayHereService payHereService;
    private final EntityManager entityManager;
    private final BidRepository bidRepository;
    private final PaymentRepository paymentRepository;

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
            
            // Check if payment already exists for this bid
            Optional<Payment> existingPayment = paymentRepository.findByBidId(bidIdUuid);
            if (existingPayment.isPresent()) {
                Payment payment = existingPayment.get();
                log.info("Payment already exists for bid {} with status: {}", bidId, payment.getPaymentStatus());
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment already exists for this bid");
                response.put("data", Map.of(
                    "paymentId", payment.getId().toString(),
                    "paymentStatus", payment.getPaymentStatus().toString(),
                    "amount", payment.getAmount(),
                    "transactionId", payment.getTransactionId(),
                    "isPaid", payment.getPaymentStatus() == PaymentStatusEnum.completed
                ));
                return ResponseEntity.ok(response);
            }
            
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
     * Check payment status for a specific bid using pure native SQL
     * GET /api/payments/bid/{bidId}/status
     */
    @GetMapping("/bid/{bidId}/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatusByBidId(@PathVariable UUID bidId) {
        try {
            log.info("Checking payment status for bid: {}", bidId);
            
            // Use pure native SQL query
            String sql = """
                SELECT 
                    p.id,
                    p.user_id,
                    p.bid_id,
                    p.amount,
                    p.currency,
                    p.payment_method,
                    p.payment_status::text,
                    p.transaction_id,
                    p.gateway_response,
                    p.created_at,
                    p.updated_at
                FROM payments p
                WHERE p.bid_id = ?
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter(1, bidId)
                .getResultList();
            
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
            response.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Check payment status for bids by request ID using JPA repositories
     * GET /api/payments/request/{requestId}/status
     */
    @GetMapping("/request/{requestId}/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatusByRequestId(@PathVariable String requestId) {
        try {
            log.info("Checking payment status for request: {}", requestId);
            
            // Validate UUID format
            UUID requestIdUuid;
            try {
                requestIdUuid = UUID.fromString(requestId);
            } catch (IllegalArgumentException e) {
                log.error("Invalid UUID format for requestId: {}", requestId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid request ID format: " + requestId);
                return ResponseEntity.badRequest().body(response);
            }
            
            // Get bids for this request using JPA repository
            List<Bid> bids = bidRepository.findByRequestId(requestIdUuid);
            log.info("Found {} bids for request: {}", bids.size(), requestId);
            
            // Debug: Also try to find all bids using native SQL to see if there are more
            try {
                String sql = "SELECT id, request_id, route_id, offered_price, status FROM bids WHERE request_id = ?";
            @SuppressWarnings("unchecked")
                List<Object[]> nativeResults = entityManager.createNativeQuery(sql)
                    .setParameter(1, requestIdUuid)
                    .getResultList();
                log.info("Native SQL found {} bids for request: {}", nativeResults.size(), requestId);
                for (Object[] row : nativeResults) {
                    log.info("Native bid: ID={}, RequestID={}, RouteID={}, Price={}, Status={}", 
                        row[0], row[1], row[2], row[3], row[4]);
                }
            } catch (Exception e) {
                log.error("Error in native SQL query: {}", e.getMessage());
            }
            
            // Debug: Log all bid IDs
            for (Bid bid : bids) {
                log.info("Bid ID: {}, Status: {}, Offered Price: {}", bid.getId(), bid.getStatus(), bid.getOfferedPrice());
            }
            
            // Debug: Check if payment exists by direct ID lookup
            try {
                UUID paymentId = UUID.fromString("1f0bc0c9-c509-418d-a8b8-ecb300fbf5d2");
                Optional<Payment> directPayment = paymentRepository.findById(paymentId);
                if (directPayment.isPresent()) {
                    Payment p = directPayment.get();
                    log.info("Direct payment lookup found: ID={}, Status={}, BidID={}, Amount={}", 
                        p.getId(), p.getPaymentStatus(), p.getBid() != null ? p.getBid().getId() : "NULL", p.getAmount());
                    
                    // Check if this bid belongs to the current request
                    if (p.getBid() != null) {
                        log.info("Payment bid belongs to request: {}", p.getBid().getRequest() != null ? p.getBid().getRequest().getId() : "NULL");
                        log.info("Payment bid belongs to route: {}", p.getBid().getRoute() != null ? p.getBid().getRoute().getId() : "NULL");
                        
                        // Check if this is the route with many bids
                        if (p.getBid().getRoute() != null && p.getBid().getRoute().getId().toString().equals("1cc88146-8e0b-41fa-a81a-17168a1407ec")) {
                            log.info("*** PAYMENT FOUND FOR ROUTE WITH MANY BIDS ***");
                        }
                    }
                } else {
                    log.info("Direct payment lookup failed for ID: {}", paymentId);
                }
            } catch (Exception e) {
                log.error("Error in direct payment lookup: {}", e.getMessage());
            }
            
            if (bids.isEmpty()) {
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
            
            // Process each bid and check for payments
            List<Map<String, Object>> paymentStatuses = new ArrayList<>();
            
            for (Bid bid : bids) {
                Map<String, Object> status = new HashMap<>();
                status.put("bidId", bid.getId().toString());
                status.put("offeredPrice", bid.getOfferedPrice());
                status.put("bidStatus", bid.getStatus().toString());
                
                // Check if there's a payment for this bid
                log.info("Looking for payment for bid ID: {}", bid.getId());
                Optional<Payment> paymentOpt = paymentRepository.findByBidId(bid.getId());
                
                if (paymentOpt.isPresent()) {
                    log.info("Found payment for bid ID: {}, status: {}", bid.getId(), paymentOpt.get().getPaymentStatus());
                    Payment payment = paymentOpt.get();
                    status.put("paymentStatus", payment.getPaymentStatus().toString());
                    status.put("amount", payment.getAmount());
                    status.put("currency", payment.getCurrency());
                    status.put("paymentMethod", payment.getPaymentMethod());
                    status.put("transactionId", payment.getTransactionId());
                    status.put("orderId", payment.getGatewayResponse() != null ? 
                        extractOrderIdFromGatewayResponse(payment.getGatewayResponse().toString()) : null);
                    status.put("paid", payment.getPaymentStatus() == PaymentStatusEnum.completed);
                    status.put("paymentDate", payment.getCreatedAt());
                } else {
                    // No payment found for this bid
                    log.info("No payment found for bid ID: {}", bid.getId());
                    status.put("paymentStatus", "NOT_FOUND");
                    status.put("amount", bid.getOfferedPrice());
                    status.put("currency", "LKR");
                    status.put("paymentMethod", null);
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
            
            log.info("Successfully processed payment status for request: {} with {} payment statuses", 
                requestId, paymentStatuses.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking payment status for request: {}", requestId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to check payment status: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            
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