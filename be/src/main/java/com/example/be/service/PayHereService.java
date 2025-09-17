package com.example.be.service;

import com.example.be.config.PayHereConfig;
import com.example.be.dto.PayHereRequestDto;
import com.example.be.dto.PayHereResponseDto;
import com.example.be.dto.NotificationCreateDto;
import com.example.be.model.Payment;
import com.example.be.model.Profile;
import com.example.be.model.Bid;
import com.example.be.model.Conversation;
import com.example.be.repository.PaymentRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.repository.BidRepository;
import com.example.be.repository.ConversationRepository;
import com.example.be.types.PaymentStatusEnum;
import com.example.be.types.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayHereService {

    private final PayHereConfig payHereConfig;
    private final PaymentRepository paymentRepository;
    private final ProfileRepository profileRepository;
    private final BidRepository bidRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get OAuth token for PayHere Authorize API
     */
    public String getOAuthToken() {
        try {
            log.info("Getting OAuth token from PayHere...");
            log.info("App ID: {}", payHereConfig.getAppId());
            log.info("App Secret: {}", payHereConfig.getAppSecret().substring(0, 10) + "...");
            log.info("OAuth URL: {}", payHereConfig.getAuthorizeSandboxUrl());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(payHereConfig.getAppId(), payHereConfig.getAppSecret());
            
            // Try different grant types - PayHere expects SANDBOX scope for sandbox environment
            String requestBody = "grant_type=client_credentials&scope=SANDBOX";
            
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            
            log.info("Sending OAuth request to: {}", payHereConfig.getAuthorizeSandboxUrl());
            log.info("Request body: {}", requestBody);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                payHereConfig.getAuthorizeSandboxUrl(),
                request,
                Map.class
            );
            
            log.info("OAuth response status: {}", response.getStatusCode());
            log.info("OAuth response body: {}", response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String accessToken = (String) response.getBody().get("access_token");
                if (accessToken != null) {
                    log.info("OAuth token obtained successfully: {}", accessToken.substring(0, 20) + "...");
                    return accessToken;
                } else {
                    throw new RuntimeException("No access_token in response: " + response.getBody());
                }
            } else {
                throw new RuntimeException("Failed to get OAuth token: " + response.getStatusCode() + " - " + response.getBody());
            }
            
        } catch (Exception e) {
            log.error("Error getting OAuth token", e);
            throw new RuntimeException("Failed to get OAuth token: " + e.getMessage());
        }
    }

        /**
     * Process payment using PayHere Checkout API (for one-time payments)
     * This method returns the payment data that should be submitted via HTML form to PayHere
     */
    public PayHereRequestDto processPaymentWithCheckoutAPI(PayHereRequestDto requestDto) {
        try {
            log.info("Preparing PayHere Checkout API payment for order: {}", requestDto.getOrderId());
            
            // For Checkout API, we don't need to make an API call
            // Instead, we return the payment data that should be submitted via HTML form
            // The frontend will handle the form submission to PayHere's checkout URL
            
            log.info("Payment data prepared for Checkout API. Order ID: {}", requestDto.getOrderId());
            log.info("Checkout URL: {}", payHereConfig.getCheckoutSandboxUrl());
            
            return requestDto;
            
        } catch (Exception e) {
            log.error("Error preparing payment for Checkout API", e);
            throw new RuntimeException("Failed to prepare payment: " + e.getMessage());
        }
    }

    /**
     * Generate hash for PayHere Authorize API
     */
    private String generateAuthorizeAPIHash(PayHereRequestDto request) {
        try {
            // Authorize API hash formula: merchant_id + order_id + amount + currency + merchant_secret
            String hashString = payHereConfig.getMerchantId() +
                request.getOrderId() +
                request.getAmount().toString() +
                request.getCurrency() +
                payHereConfig.getMerchantSecret();
            
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(hashString.getBytes("UTF-8"));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            
            String hash = sb.toString().toUpperCase();
            log.info("Generated Authorize API hash: {} for order: {}", hash, request.getOrderId());
            
            return hash;
            
        } catch (Exception e) {
            log.error("Error generating Authorize API hash", e);
            throw new RuntimeException("Failed to generate payment hash");
        }
    }

    public PayHereRequestDto initializePayment(UUID bidId, UUID requestId, UUID userId, 
                                              BigDecimal amount, String paymentMethod) {
        try {
            log.info("Initializing PayHere payment for bid: {}, amount: {}", bidId, amount);
            
            Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
            
            String orderId = "RL_" + System.currentTimeMillis() + "_" + bidId.toString().substring(0, 8);
            
            // Create payment using native SQL to handle enum properly
            UUID paymentId = UUID.randomUUID();
            java.time.ZonedDateTime now = java.time.ZonedDateTime.now();
            
            UUID createdPaymentId = paymentRepository.createPaymentNative(
                paymentId,
                userId,
                bidId,
                amount,
                payHereConfig.getCurrency(),
                paymentMethod,
                PaymentStatusEnum.pending.name(),
                now,
                now
            );
            
            // Create Payment entity manually for response
            Payment payment = new Payment();
            payment.setId(createdPaymentId);
            payment.setUser(user);
            payment.setBid(bid);
            payment.setAmount(amount);
            payment.setCurrency(payHereConfig.getCurrency());
            payment.setPaymentMethod(paymentMethod);
            payment.setPaymentStatus(PaymentStatusEnum.pending);
            payment.setCreatedAt(now);
            payment.setUpdatedAt(now);
            
            PayHereRequestDto request = PayHereRequestDto.builder()
                .merchantId(payHereConfig.getMerchantId())
                .returnUrl(payHereConfig.getReturnUrl())
                .cancelUrl(payHereConfig.getCancelUrl())
                .notifyUrl(payHereConfig.getNotifyUrl())
                .firstName(user.getFirstName() != null ? user.getFirstName() : "Customer")
                .lastName(user.getLastName() != null ? user.getLastName() : "User")
                .email(user.getEmail())
                .phone(user.getPhoneNumber() != null ? user.getPhoneNumber() : "+94123456789")
                .address("RouteLead Delivery")
                .city("Colombo")
                .country("Sri Lanka")
                .orderId(orderId)
                .items("RouteLead Parcel Delivery Service")
                .currency(payHereConfig.getCurrency())
                .amount(amount)
                .custom1(bidId.toString())
                .custom2(requestId.toString())
                .custom3(userId.toString())
                .custom4(paymentMethod)
                .bidId(bidId)
                .requestId(requestId)
                .userId(userId)
                .paymentMethod(paymentMethod)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
            
            String hash = generateHash(request);
            request.setHash(hash);
            
            log.info("PayHere payment initialized successfully. Order ID: {}", orderId);
            return request;
            
        } catch (Exception e) {
            log.error("Error initializing PayHere payment", e);
            throw new RuntimeException("Failed to initialize payment: " + e.getMessage());
        }
    }

    private String generateHash(PayHereRequestDto request) {
        try {
            // PayHere Checkout API hash formula according to official documentation
            // merchant_id + order_id + amount + currency + first_name + last_name + email + phone + address + city + country + items + merchant_secret
            String hashString = payHereConfig.getMerchantId() +
                request.getOrderId() +
                request.getAmount().toString() +
                request.getCurrency() +
                request.getFirstName() +
                request.getLastName() +
                request.getEmail() +
                request.getPhone() +
                request.getAddress() +
                request.getCity() +
                request.getCountry() +
                request.getItems() +
                payHereConfig.getMerchantSecret();
            
            log.info("Using PayHere Checkout API hash formula: merchant_id + order_id + amount + currency + first_name + last_name + email + phone + address + city + country + items + merchant_secret");
            log.info("Hash string (without secret): {} + [SECRET_HIDDEN]", 
                payHereConfig.getMerchantId() + request.getOrderId() + request.getAmount().toString() + request.getCurrency() + 
                request.getFirstName() + request.getLastName() + request.getEmail() + request.getPhone() + 
                request.getAddress() + request.getCity() + request.getCountry() + request.getItems());
            
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(hashString.getBytes("UTF-8"));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            
            String hash = sb.toString().toUpperCase();
            log.info("Generated hash: {} for order: {}", hash, request.getOrderId());
            
            return hash;
            
        } catch (Exception e) {
            log.error("Error generating PayHere hash", e);
            throw new RuntimeException("Failed to generate payment hash");
        }
    }

    public PayHereResponseDto processWebhook(Map<String, String> webhookData) {
        try {
            log.info("Processing PayHere webhook: {}", webhookData);
            
            PayHereResponseDto response = PayHereResponseDto.builder()
                .paymentId(webhookData.get("payment_id"))
                .orderId(webhookData.get("order_id"))
                .payHereAmount(webhookData.get("payhere_amount"))
                .payHereCurrency(webhookData.get("payhere_currency"))
                .statusCode(webhookData.get("status_code"))
                .md5sig(webhookData.get("md5sig"))
                .custom1(webhookData.get("custom_1"))
                .custom2(webhookData.get("custom_2"))
                .custom3(webhookData.get("custom_3"))
                .custom4(webhookData.get("custom_4"))
                .method(webhookData.get("method"))
                .statusMessage(webhookData.get("status_message"))
                .cardMask(webhookData.get("card_mask"))
                .cardHolderName(webhookData.get("card_holder_name"))
                .timestamp(webhookData.get("timestamp"))
                .build();
            
            response.setTransactionId(response.getPaymentId());
            response.setAmount(new BigDecimal(response.getPayHereAmount()));
            response.setCurrency(response.getPayHereCurrency());
            
            switch (response.getStatusCode()) {
                case "2":
                    response.setPaymentStatus("completed");
                    break;
                case "-1":
                    response.setPaymentStatus("failed");
                    break;
                case "-2":
                    response.setPaymentStatus("failed");
                    break;
                case "-3":
                    response.setPaymentStatus("pending");
                    break;
                default:
                    response.setPaymentStatus("failed");
            }
            
            updatePaymentRecord(response);
            
            log.info("PayHere webhook processed successfully. Status: {}", response.getPaymentStatus());
            return response;
            
        } catch (Exception e) {
            log.error("Error processing PayHere webhook", e);
            throw new RuntimeException("Failed to process webhook: " + e.getMessage());
        }
    }

    private void updatePaymentRecord(PayHereResponseDto response) {
        try {
            UUID bidId = UUID.fromString(response.getCustom1());
            Optional<Payment> paymentOpt = paymentRepository.findByBidId(bidId);
            
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                payment.setTransactionId(response.getTransactionId());
                PaymentStatusEnum newStatus = PaymentStatusEnum.valueOf(response.getPaymentStatus());
                payment.setPaymentStatus(newStatus);
                
                Map<String, Object> gatewayResponse = new HashMap<>();
                gatewayResponse.put("paymentId", response.getPaymentId());
                gatewayResponse.put("statusCode", response.getStatusCode());
                gatewayResponse.put("statusMessage", response.getStatusMessage());
                gatewayResponse.put("method", response.getMethod());
                gatewayResponse.put("cardMask", response.getCardMask());
                gatewayResponse.put("cardHolderName", response.getCardHolderName());
                payment.setGatewayResponse(gatewayResponse);
                
                paymentRepository.save(payment);
                log.info("Payment record updated successfully. Payment ID: {}", payment.getId());
                
                // NEW: After successful payment, create notification for driver and auto-create conversation
                if (newStatus == PaymentStatusEnum.completed) {
                    notifyDriverOfPaymentCompletion(payment);
                }
                
            } else {
                log.warn("Payment record not found for bid ID: {}", bidId);
            }
            
        } catch (Exception e) {
            log.error("Error updating payment record", e);
        }
    }

    /**
     * Notify driver of payment completion and create conversation if needed
     */
    private void notifyDriverOfPaymentCompletion(Payment payment) {
        try {
            log.info("Processing payment completion notification for payment: {}", payment.getId());
            
            Bid bid = payment.getBid();
            if (bid == null) {
                log.warn("No bid found for payment: {}", payment.getId());
                return;
            }
            
            UUID customerId = payment.getUser().getId();
            UUID driverId = bid.getRoute().getDriver().getId();
            String customerName = payment.getUser().getFirstName() + " " + payment.getUser().getLastName();
            
            // Create conversation if it doesn't exist
            createConversationAfterPayment(bid, customerId, driverId);
            
            // Create notification for driver
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("type", "PAYMENT_COMPLETED");
            notificationPayload.put("bidId", bid.getId().toString());
            notificationPayload.put("customerId", customerId.toString());
            notificationPayload.put("customerName", customerName);
            notificationPayload.put("amount", payment.getAmount().toString());
            notificationPayload.put("message", "Payment completed by " + customerName + ". You can now start chatting!");
            
            NotificationCreateDto notification = new NotificationCreateDto();
            notification.setUserId(driverId);
            notification.setType(NotificationType.PAYMENT_COMPLETED); // Using new type
            notification.setPayload(notificationPayload);
            
            notificationService.createNotification(notification);
            
            log.info("Driver notification created for payment completion. Driver ID: {}, Customer: {}", 
                    driverId, customerName);
            
        } catch (Exception e) {
            log.error("Error creating driver notification for payment completion", e);
        }
    }

    /**
     * Create conversation after payment if it doesn't already exist
     */
    private void createConversationAfterPayment(Bid bid, UUID customerId, UUID driverId) {
        try {
            // Check if conversation already exists
            Conversation existingConversation = conversationRepository.findByBidId(bid.getId());
            
            if (existingConversation == null) {
                // Create new conversation
                Conversation conversation = new Conversation();
                conversation.setBid(bid);
                
                // Get customer and driver profiles
                Profile customer = profileRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
                Profile driver = profileRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));
                
                conversation.setCustomer(customer);
                conversation.setDriver(driver);
                conversation.setLastMessageAt(java.time.ZonedDateTime.now());
                
                conversationRepository.save(conversation);
                
                log.info("Conversation created after payment. Bid ID: {}, Customer: {}, Driver: {}", 
                        bid.getId(), customerId, driverId);
            } else {
                log.info("Conversation already exists for bid: {}", bid.getId());
            }
            
        } catch (Exception e) {
            log.error("Error creating conversation after payment for bid: {}", bid.getId(), e);
        }
    }

    public boolean verifyHash(PayHereResponseDto response, String receivedHash) {
        try {
            // PayHere Sri Lanka response hash verification formula
            // For response verification, we use a different format
            String hashString = payHereConfig.getMerchantId() +
                response.getOrderId() +
                response.getPayHereAmount() +
                response.getPayHereCurrency() +
                response.getStatusCode() +
                payHereConfig.getMerchantSecret();
            
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(hashString.getBytes("UTF-8"));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            
            String calculatedHash = sb.toString().toUpperCase();
            boolean isValid = calculatedHash.equals(receivedHash);
            
            log.info("Hash verification: calculated={}, received={}, valid={}", 
                    calculatedHash, receivedHash, isValid);
            
            return isValid;
            
        } catch (Exception e) {
            log.error("Error verifying PayHere hash", e);
            return false;
        }
    }

    /**
     * Generate hash for PayHere payment (full formula according to PayHere documentation)
     */
    public String generateHash(String orderId, String amount, String currency, String firstName, String lastName, 
                              String email, String phone, String address, String city, String country, String items) {
        try {
            // Full PayHere hash formula: merchant_id + order_id + amount + currency + first_name + last_name + email + phone + address + city + country + items + merchant_secret
            // Use provided values or defaults if null
            firstName = (firstName != null) ? firstName : "Customer";
            lastName = (lastName != null) ? lastName : "User";
            email = (email != null) ? email : "customer@routelead.com";
            phone = (phone != null) ? phone : "+94123456789";
            address = (address != null) ? address : "RouteLead Delivery";
            city = (city != null) ? city : "Colombo";
            country = (country != null) ? country : "Sri Lanka";
            items = (items != null) ? items : "RouteLead Parcel Delivery Service";
            
            String hashString = payHereConfig.getMerchantId() +
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
                items +
                payHereConfig.getMerchantSecret();
            
            log.info("Using PayHere full hash formula: merchant_id + order_id + amount + currency + first_name + last_name + email + phone + address + city + country + items + merchant_secret");
            log.info("Hash string (without secret): {} + [SECRET_HIDDEN]", 
                payHereConfig.getMerchantId() + orderId + amount + currency + firstName + lastName + email + phone + address + city + country + items);
            
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(hashString.getBytes("UTF-8"));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            
            String hash = sb.toString().toUpperCase();
            log.info("Generated hash: {} for order: {}", hash, orderId);
            
            return hash;
            
        } catch (Exception e) {
            log.error("Error generating hash", e);
            throw new RuntimeException("Failed to generate hash: " + e.getMessage());
        }
    }

    /**
     * Generate a test hash for integration testing
     */
    public String generateTestHash() {
        try {
            String testOrderId = "TEST_" + System.currentTimeMillis();
            String testAmount = "100.00";
            String testCurrency = "LKR";
            String testFirstName = "Test";
            String testLastName = "User";
            String testEmail = "test@example.com";
            String testPhone = "+94123456789";
            String testAddress = "Test Address";
            String testCity = "Colombo";
            String testCountry = "Sri Lanka";
            String testItems = "Test Item";
            
            // Use PayHere Checkout API hash formula for testing (same as production)
            String hashString = payHereConfig.getMerchantId() +
                testOrderId +
                testAmount +
                testCurrency +
                testFirstName +
                testLastName +
                testEmail +
                testPhone +
                testAddress +
                testCity +
                testCountry +
                testItems +
                payHereConfig.getMerchantSecret();
            
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(hashString.getBytes("UTF-8"));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            
            String testHash = sb.toString().toUpperCase();
            log.info("Generated test hash: {} for order: {}", testHash, testOrderId);
            
            return testHash;
            
        } catch (Exception e) {
            log.error("Error generating test hash", e);
            throw new RuntimeException("Failed to generate test hash: " + e.getMessage());
        }
    }
}
