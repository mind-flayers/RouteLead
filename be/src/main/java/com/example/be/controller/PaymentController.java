package com.example.be.controller;

import com.example.be.dto.PayHereRequestDto;
import com.example.be.dto.PayHereResponseDto;
import com.example.be.dto.PaymentDto;
import com.example.be.service.PayHereService;
import com.example.be.service.PaymentService;
import com.example.be.config.PayHereConfig;
import com.example.be.model.Payment;
import com.example.be.repository.PaymentRepository;
import com.example.be.types.PaymentStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PayHereService payHereService;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final PayHereConfig payHereConfig;

    /**
     * Initialize a new PayHere payment
     * POST /api/payments/initialize
     */
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializePayment(
            @RequestParam String bidId,
            @RequestParam String requestId,
            @RequestParam String userId,
            @RequestParam BigDecimal amount,
            @RequestParam String paymentMethod) {
        
        try {
            log.info("Received payment initialization request - bidId: '{}', requestId: '{}', userId: '{}', amount: {}, paymentMethod: '{}'", 
                    bidId, requestId, userId, amount, paymentMethod);
            
            // Validate parameters
            if (bidId == null || bidId.trim().isEmpty()) {
                throw new IllegalArgumentException("bidId cannot be null or empty");
            }
            if (requestId == null || requestId.trim().isEmpty()) {
                throw new IllegalArgumentException("requestId cannot be null or empty");
            }
            if (userId == null || userId.trim().isEmpty()) {
                throw new IllegalArgumentException("userId cannot be null or empty");
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("amount must be greater than 0");
            }
            if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
                throw new IllegalArgumentException("paymentMethod cannot be null or empty");
            }
            
            // Convert string parameters to UUIDs
            UUID bidIdUuid = UUID.fromString(bidId);
            UUID requestIdUuid = UUID.fromString(requestId);
            UUID userIdUuid = UUID.fromString(userId);
            
            PayHereRequestDto request = payHereService.initializePayment(bidIdUuid, requestIdUuid, userIdUuid, amount, paymentMethod);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment initialized successfully");
            response.put("data", request);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format in payment initialization: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid parameter format: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            log.error("Error initializing payment", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to initialize payment: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * PayHere webhook endpoint (NOT USED IN SANDBOX)
     * POST /api/payments/webhook
     * Note: PayHere sandbox doesn't send webhooks. Use return/cancel URLs instead.
     * This endpoint is kept for production use only.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestParam Map<String, String> webhookData) {
        try {
            log.info("Received PayHere webhook: {}", webhookData);
            
            PayHereResponseDto response = payHereService.processWebhook(webhookData);
            
            // Verify hash for security
            String receivedHash = webhookData.get("md5sig");
            if (!payHereService.verifyHash(response, receivedHash)) {
                log.warn("Invalid hash received in webhook");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid hash");
            }
            
            log.info("Webhook processed successfully. Status: {}", response.getPaymentStatus());
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
    public ResponseEntity<Map<String, Object>> handleReturn(
            @RequestParam Map<String, String> returnData) {
        
        try {
            log.info("Payment return with data: {}", returnData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment completed successfully");
            response.put("data", returnData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error handling payment return", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing payment return");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Payment cancel URL
     * GET /api/payments/cancel
     */
    @GetMapping("/cancel")
    public ResponseEntity<Map<String, Object>> handleCancel(
            @RequestParam Map<String, String> cancelData) {
        
        try {
            log.info("Payment cancelled with data: {}", cancelData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Payment was cancelled");
            response.put("data", cancelData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error handling payment cancellation", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing payment cancellation");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get payment by ID
     * GET /api/payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPayment(@PathVariable UUID id) {
        try {
            Payment payment = paymentService.getPaymentById(id);
            PaymentDto paymentDto = paymentService.convertToDto(payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentDto);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching payment", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get payments by user ID
     * GET /api/payments/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserPayments(@PathVariable UUID userId) {
        try {
            List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments);
            response.put("count", payments.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching user payments", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch user payments: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get payments by status
     * GET /api/payments/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getPaymentsByStatus(@PathVariable PaymentStatusEnum status) {
        try {
            List<Payment> payments = paymentRepository.findByPaymentStatusOrderByCreatedAtDesc(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments);
            response.put("count", payments.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching payments by status", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payments by status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update payment status
     * PATCH /api/payments/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestParam PaymentStatusEnum status) {
        
        try {
            Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            payment.setPaymentStatus(status);
            paymentRepository.save(payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment status updated successfully");
            response.put("data", payment);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating payment status", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update payment status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get payment statistics
     * GET /api/payments/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        try {
            Map<String, Object> statistics = paymentService.getPaymentStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching payment statistics", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment statistics: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get user payment statistics
     * GET /api/payments/user/{userId}/statistics
     */
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<Map<String, Object>> getUserPaymentStatistics(@PathVariable UUID userId) {
        try {
            Map<String, Object> statistics = paymentService.getUserPaymentStatistics(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching user payment statistics", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch user payment statistics: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get PayHere configuration for frontend
     * GET /api/payments/payhere/config
     */
    @GetMapping("/payhere/config")
    public ResponseEntity<Map<String, Object>> getPayHereConfig() {
        try {
            Map<String, Object> config = new HashMap<>();
            config.put("merchantId", payHereConfig.getMerchantId());
            // Remove merchantSecret from frontend config for security
            config.put("currency", payHereConfig.getCurrency());
            config.put("sandboxUrl", payHereConfig.getSandboxUrl());
            config.put("testCardNumber", payHereConfig.getTestCardNumber());
            config.put("testCardExpiry", payHereConfig.getTestCardExpiry());
            config.put("testCardCvv", payHereConfig.getTestCardCvv());
            config.put("returnUrl", payHereConfig.getReturnUrl());
            config.put("cancelUrl", payHereConfig.getCancelUrl());
            config.put("notifyUrl", payHereConfig.getNotifyUrl());
            // Removed liveUrl - using sandbox only
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", config);
            response.put("message", "PayHere sandbox configuration loaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching PayHere config", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch PayHere config: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Generate PayHere hash on backend (secure)
     * POST /api/payments/payhere/generate-hash
     */
    @PostMapping("/payhere/generate-hash")
    public ResponseEntity<Map<String, Object>> generatePayHereHash(@RequestBody Map<String, Object> request) {
        try {
            String orderId = (String) request.get("order_id");
            String amount = (String) request.get("amount");
            String currency = (String) request.get("currency");
            String firstName = (String) request.get("first_name");
            String lastName = (String) request.get("last_name");
            String email = (String) request.get("email");
            String phone = (String) request.get("phone");
            String address = (String) request.get("address");
            String city = (String) request.get("city");
            String country = (String) request.get("country");
            String items = (String) request.get("items");
            
            if (orderId == null || amount == null || currency == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required parameters: order_id, amount, currency");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Generate hash using backend secret with all fields
            String hash = payHereService.generateHash(orderId, amount, currency, firstName, lastName, email, phone, address, city, country, items);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hash", hash);
            response.put("message", "Hash generated successfully");
            
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
     * Process payment using PayHere Checkout API (for one-time payments)
     * POST /api/payments/payhere/checkout
     */
    @PostMapping("/payhere/checkout")
    public ResponseEntity<Map<String, Object>> processPaymentWithCheckoutAPI(@RequestBody Map<String, Object> request) {
        try {
            log.info("Processing payment with PayHere Checkout API");
            
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
            UUID requestIdUuid = UUID.fromString(requestId);
            UUID userIdUuid = UUID.fromString(userId);
            
            // Initialize payment request
            PayHereRequestDto requestDto = payHereService.initializePayment(bidIdUuid, requestIdUuid, userIdUuid, amount, paymentMethod);
            
            // Process payment with Checkout API
            PayHereRequestDto checkoutData = payHereService.processPaymentWithCheckoutAPI(requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment data prepared for Checkout API");
            response.put("data", checkoutData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing payment with Checkout API", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to process payment: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Test PayHere Authorize API integration
     * GET /api/payments/payhere/test-authorize
     */
    @GetMapping("/payhere/test-authorize")
    public ResponseEntity<Map<String, Object>> testPayHereAuthorizeAPI() {
        try {
            log.info("Testing PayHere Authorize API with credentials:");
            log.info("App ID: {}", payHereConfig.getAppId());
            log.info("App Secret: {}", payHereConfig.getAppSecret().substring(0, 10) + "...");
            log.info("OAuth URL: {}", payHereConfig.getAuthorizeSandboxUrl());
            
            // Test OAuth token generation
            String oauthToken = payHereService.getOAuthToken();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PayHere Authorize API test successful");
            response.put("oauthToken", oauthToken.substring(0, 20) + "...");
            response.put("appId", payHereConfig.getAppId());
            response.put("authorizeUrl", payHereConfig.getAuthorizeSandboxUrl());
            response.put("checkoutUrl", payHereConfig.getCheckoutSandboxUrl());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error testing PayHere Authorize API", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "PayHere Authorize API test failed: " + e.getMessage());
            response.put("error", e.getMessage());
            response.put("appId", payHereConfig.getAppId());
            response.put("authorizeUrl", payHereConfig.getAuthorizeSandboxUrl());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Test PayHere integration
     * GET /api/payments/payhere/test
     */
    @GetMapping("/payhere/test")
    public ResponseEntity<Map<String, Object>> testPayHereIntegration() {
        try {
            // Test hash generation
            String testHash = payHereService.generateTestHash();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PayHere integration test successful");
            response.put("testHash", testHash);
            response.put("merchantId", payHereConfig.getMerchantId());
            response.put("sandboxUrl", payHereConfig.getSandboxUrl());
            response.put("baseUrl", payHereConfig.getBaseUrl());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error testing PayHere integration", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "PayHere integration test failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Debug endpoint to test hash generation with specific data
     * POST /api/payments/payhere/debug-hash
     */
    @PostMapping("/payhere/debug-hash")
    public ResponseEntity<Map<String, Object>> debugHashGeneration(@RequestBody Map<String, Object> request) {
        try {
            log.info("Debug hash generation request: {}", request);
            
            String orderId = (String) request.get("order_id");
            String amount = (String) request.get("amount");
            String currency = (String) request.get("currency");
            String firstName = (String) request.get("first_name");
            String lastName = (String) request.get("last_name");
            String email = (String) request.get("email");
            String phone = (String) request.get("phone");
            String address = (String) request.get("address");
            String city = (String) request.get("city");
            String country = (String) request.get("country");
            String items = (String) request.get("items");
            
            // Generate hash
            String hash = payHereService.generateHash(orderId, amount, currency, firstName, lastName, email, phone, address, city, country, items);
            
            // Build hash string for verification (without secret)
            String hashStringWithoutSecret = payHereConfig.getMerchantId() +
                orderId +
                amount +
                currency +
                firstName +
                lastName +
                email +
                phone +
                address +
                city +
                country +
                items;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hash", hash);
            response.put("hashStringWithoutSecret", hashStringWithoutSecret);
            response.put("merchantId", payHereConfig.getMerchantId());
            response.put("merchantSecretLength", payHereConfig.getMerchantSecret().length());
            response.put("message", "Hash generated successfully for debugging");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in debug hash generation", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Debug hash generation failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
