package com.example.be.controller;

import com.example.be.model.Conversation;
import com.example.be.model.Message;
import com.example.be.model.Profile;
import com.example.be.repository.ConversationRepository;
import com.example.be.repository.MessageRepository;
import com.example.be.repository.ProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.example.be.model.Bid;
import com.example.be.repository.BidRepository;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private EntityManager entityManager;

    /**
     * Get active conversations for a customer (matched and paid requests only)
     * GET /api/chat/customer/{customerId}/conversations
     */
    @GetMapping("/customer/{customerId}/conversations")
    public ResponseEntity<Map<String, Object>> getCustomerConversations(@PathVariable String customerId) {
        try {
            log.info("Fetching conversations for customer: {}", customerId);
            
            UUID customerIdUuid = UUID.fromString(customerId);
            
            // Find active conversations (matched and paid requests)
            List<Conversation> conversations = conversationRepository.findActiveConversationsForCustomer(customerIdUuid);
            
            // Build response with conversation details
            List<Map<String, Object>> conversationList = conversations.stream().map(conv -> {
                Map<String, Object> convData = new HashMap<>();
                convData.put("id", conv.getId().toString());
                convData.put("bidId", conv.getBid() != null ? conv.getBid().getId().toString() : null);
                convData.put("requestId", conv.getBid() != null && conv.getBid().getRequest() != null ? 
                    conv.getBid().getRequest().getId().toString() : null);
                convData.put("driverId", conv.getDriver().getId().toString());
                convData.put("driverName", conv.getDriver().getFirstName() + " " + conv.getDriver().getLastName());
                convData.put("driverPhoto", conv.getDriver().getProfilePhotoUrl());
                convData.put("lastMessageAt", conv.getLastMessageAt());
                convData.put("createdAt", conv.getCreatedAt());
                
                // Get last message
                Message lastMessage = messageRepository.findLastMessageByConversationId(conv.getId());
                if (lastMessage != null) {
                    convData.put("lastMessage", lastMessage.getMessageText());
                    convData.put("lastMessageTime", lastMessage.getCreatedAt());
                }
                
                // Count unread messages
                long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(
                    conv.getId(), customerIdUuid);
                convData.put("unreadCount", unreadCount);
                
                return convData;
            }).toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("conversations", conversationList);
            response.put("totalConversations", conversationList.size());
            
            log.info("Found {} conversations for customer {}", conversationList.size(), customerId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for customerId: {}", customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid customer ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error fetching conversations for customer: {}", customerId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch conversations: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get messages for a conversation
     * GET /api/chat/conversation/{conversationId}/messages
     */
    @GetMapping("/conversation/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getConversationMessages(@PathVariable String conversationId) {
        try {
            log.info("Fetching messages for conversation: {}", conversationId);
            
            UUID conversationIdUuid = UUID.fromString(conversationId);
            
            // Use native SQL to get messages
            String getMessagesSql = """
                SELECT m.id, m.message_text, m.sender_id, m.receiver_id, m.is_read, m.created_at,
                       p.first_name, p.last_name
                FROM messages m
                JOIN profiles p ON m.sender_id = p.id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at ASC
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(getMessagesSql)
                .setParameter(1, conversationIdUuid)
                .getResultList();
            
            List<Map<String, Object>> messageList = results.stream().map(row -> {
                Map<String, Object> msgData = new HashMap<>();
                msgData.put("id", row[0].toString());
                msgData.put("text", row[1]);
                msgData.put("senderId", row[2].toString());
                msgData.put("receiverId", row[3] != null ? row[3].toString() : null);
                msgData.put("isRead", row[4]);
                msgData.put("createdAt", row[5]);
                msgData.put("senderName", (row[6] != null ? row[6] : "") + " " + (row[7] != null ? row[7] : ""));
                return msgData;
            }).toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messages", messageList);
            response.put("totalMessages", messageList.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching messages for conversation: {}", conversationId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch messages: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Send a message
     * POST /api/chat/conversation/{conversationId}/messages
     */
    @PostMapping("/conversation/{conversationId}/messages")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> request) {
        try {
            log.info("Sending message to conversation: {}", conversationId);
            
            UUID conversationIdUuid = UUID.fromString(conversationId);
            String senderId = (String) request.get("senderId");
            String receiverId = (String) request.get("receiverId");
            String messageText = (String) request.get("messageText");
            
            if (senderId == null || receiverId == null || messageText == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required fields: senderId, receiverId, messageText");
                return ResponseEntity.badRequest().body(response);
            }
            
            UUID senderIdUuid = UUID.fromString(senderId);
            UUID receiverIdUuid = UUID.fromString(receiverId);
            
            // Check if conversation, sender, and receiver exist using native SQL
            String checkConversationSql = "SELECT id FROM conversations WHERE id = ?";
            String checkSenderSql = "SELECT id FROM profiles WHERE id = ?";
            String checkReceiverSql = "SELECT id FROM profiles WHERE id = ?";
            
            @SuppressWarnings("unchecked")
            List<Object[]> conversationResult = entityManager.createNativeQuery(checkConversationSql)
                .setParameter(1, conversationIdUuid)
                .getResultList();
            
            if (conversationResult.isEmpty()) {
                throw new RuntimeException("Conversation not found");
            }
            
            @SuppressWarnings("unchecked")
            List<Object[]> senderResult = entityManager.createNativeQuery(checkSenderSql)
                .setParameter(1, senderIdUuid)
                .getResultList();
            
            if (senderResult.isEmpty()) {
                throw new RuntimeException("Sender not found");
            }
            
            @SuppressWarnings("unchecked")
            List<Object[]> receiverResult = entityManager.createNativeQuery(checkReceiverSql)
                .setParameter(1, receiverIdUuid)
                .getResultList();
            
            if (receiverResult.isEmpty()) {
                throw new RuntimeException("Receiver not found");
            }
            
            // Create and save message using native SQL with explicit enum casting
            String insertMessageSql = """
                INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text, message_type, is_read, created_at)
                VALUES (?, ?, ?, ?, CAST('TEXT' AS public.message_type_enum), ?, ?)
                RETURNING id, created_at
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> result = entityManager.createNativeQuery(insertMessageSql)
                .setParameter(1, conversationIdUuid)
                .setParameter(2, senderIdUuid)
                .setParameter(3, receiverIdUuid)
                .setParameter(4, messageText)
                .setParameter(5, false)
                .setParameter(6, ZonedDateTime.now())
                .getResultList();
            
            if (result.isEmpty()) {
                throw new RuntimeException("Failed to create message");
            }
            
            Object[] row = result.get(0);
            UUID messageId = (UUID) row[0];
            Instant createdAt = (Instant) row[1];
            
            // Update conversation's last message time using native SQL
            String updateConversationSql = """
                UPDATE conversations 
                SET last_message_at = ? 
                WHERE id = ?
                """;
            
            entityManager.createNativeQuery(updateConversationSql)
                .setParameter(1, ZonedDateTime.now())
                .setParameter(2, conversationIdUuid)
                .executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messageId", messageId.toString());
            response.put("createdAt", createdAt != null ? createdAt.toString() : null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error sending message to conversation: {}", conversationId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send message: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get conversation by bid ID with conditional access validation
     * GET /api/chat/conversation/by-bid/{bidId}
     * 
     * Chat access is only allowed when:
     * 1. Bid status is 'ACCEPTED'
     * 2. Parcel request status is 'MATCHED'
     * 3. Payment status is 'COMPLETED'
     */
    @GetMapping("/conversation/by-bid/{bidId}")
    public ResponseEntity<Map<String, Object>> getConversationByBidId(@PathVariable String bidId) {
        try {
            log.info("Fetching conversation by bid ID with access validation: {}", bidId);
            
            UUID bidIdUuid = UUID.fromString(bidId);
            
            // First, check if conversation exists and validate access conditions
            String validationSql = """
                SELECT 
                    c.id, c.bid_id, c.customer_id, c.driver_id, c.last_message_at, c.created_at,
                    cu.first_name as customer_first_name, cu.last_name as customer_last_name,
                    cu.profile_photo_url as customer_photo,
                    dr.first_name as driver_first_name, dr.last_name as driver_last_name,
                    dr.profile_photo_url as driver_photo,
                    b.status as bid_status,
                    pr.status as parcel_status,
                    p.payment_status
                FROM conversations c
                JOIN profiles cu ON c.customer_id = cu.id
                JOIN profiles dr ON c.driver_id = dr.id
                JOIN bids b ON c.bid_id = b.id
                JOIN parcel_requests pr ON b.request_id = pr.id
                LEFT JOIN payments p ON p.bid_id = b.id
                WHERE c.bid_id = ?
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(validationSql)
                .setParameter(1, bidIdUuid)
                .getResultList();
            
            if (results.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No conversation found for bid ID: " + bidId);
                response.put("accessDenied", false);
                return ResponseEntity.ok(response);
            }
            
            Object[] row = results.get(0);
            String bidStatus = (String) row[12];
            String parcelStatus = (String) row[13];
            String paymentStatus = (String) row[14];
            
            log.info("Access validation for bid {}: bidStatus={}, parcelStatus={}, paymentStatus={}", 
                     bidId, bidStatus, parcelStatus, paymentStatus);
            
            // Validate access conditions
            if (!"ACCEPTED".equals(bidStatus)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Chat access denied: Bid must be accepted. Current status: " + bidStatus);
                response.put("accessDenied", true);
                response.put("reason", "BID_NOT_ACCEPTED");
                response.put("bidStatus", bidStatus);
                return ResponseEntity.ok(response);
            }
            
            if (!"MATCHED".equals(parcelStatus)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Chat access denied: Parcel request must be matched. Current status: " + parcelStatus);
                response.put("accessDenied", true);
                response.put("reason", "PARCEL_NOT_MATCHED");
                response.put("parcelStatus", parcelStatus);
                return ResponseEntity.ok(response);
            }
            
            if (!"completed".equals(paymentStatus)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Chat access denied: Payment must be completed. Current status: " + 
                           (paymentStatus != null ? paymentStatus : "NO_PAYMENT"));
                response.put("accessDenied", true);
                response.put("reason", "PAYMENT_NOT_COMPLETED");
                response.put("paymentStatus", paymentStatus);
                return ResponseEntity.ok(response);
            }
            
            // All conditions met - return conversation data
            Map<String, Object> conversationData = new HashMap<>();
            conversationData.put("id", row[0].toString());
            conversationData.put("bidId", row[1].toString());
            conversationData.put("customerId", row[2].toString());
            conversationData.put("driverId", row[3].toString());
            conversationData.put("lastMessageAt", row[4]);
            conversationData.put("createdAt", row[5]);
            conversationData.put("customerName", (row[6] != null ? row[6] : "") + " " + (row[7] != null ? row[7] : ""));
            conversationData.put("customerPhoto", row[8]);
            conversationData.put("driverName", (row[9] != null ? row[9] : "") + " " + (row[10] != null ? row[10] : ""));
            conversationData.put("driverPhoto", row[11]);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("conversation", conversationData);
            response.put("accessDenied", false);
            response.put("validationDetails", Map.of(
                "bidStatus", bidStatus,
                "parcelStatus", parcelStatus,
                "paymentStatus", paymentStatus
            ));
            
            log.info("Chat access granted for bid ID: {} - all conditions met", bidId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for bidId: {}", bidId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid bid ID format");
            response.put("accessDenied", false);
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error fetching conversation by bid ID: {}", bidId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch conversation: " + e.getMessage());
            response.put("accessDenied", false);
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Mark messages as read
     * PUT /api/chat/conversation/{conversationId}/read
     */
    @PutMapping("/conversation/{conversationId}/read")
    @Transactional
    public ResponseEntity<Map<String, Object>> markMessagesAsRead(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> request) {
        try {
            log.info("Marking messages as read for conversation: {}", conversationId);
            
            UUID conversationIdUuid = UUID.fromString(conversationId);
            String userId = (String) request.get("userId");
            
            if (userId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required field: userId");
                return ResponseEntity.badRequest().body(response);
            }
            
            UUID userIdUuid = UUID.fromString(userId);
            
            // Mark messages as read
            messageRepository.markMessagesAsRead(conversationIdUuid, userIdUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Messages marked as read");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error marking messages as read for conversation: {}", conversationId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to mark messages as read: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get available drivers for paid requests (even if no conversation exists)
     * GET /api/chat/customer/{customerId}/available-drivers
     */
    @GetMapping("/customer/{customerId}/available-drivers")
    public ResponseEntity<Map<String, Object>> getAvailableDrivers(@PathVariable String customerId) {
        try {
            log.info("Fetching available drivers for customer: {}", customerId);
            
            UUID customerIdUuid = UUID.fromString(customerId);
            
            // Find paid and matched requests with driver information
            List<Map<String, Object>> driverList = new ArrayList<>();
            
            // Query to get unique drivers with their latest bid info
            String sql = """
                SELECT 
                    d.id as driver_id,
                    d.first_name as driver_first_name,
                    d.last_name as driver_last_name,
                    d.profile_photo_url as driver_photo,
                    d.phone_number as driver_phone,
                    COUNT(b.id) as total_parcels,
                    MAX(b.created_at) as latest_bid_created_at,
                    (SELECT b2.id FROM bids b2 
                     JOIN parcel_requests pr2 ON b2.request_id = pr2.id 
                     JOIN return_routes rr2 ON b2.route_id = rr2.id 
                     WHERE rr2.driver_id = d.id 
                     AND pr2.customer_id = :customerId
                     AND pr2.status = 'MATCHED'
                     AND b2.status = 'ACCEPTED'
                     AND EXISTS (SELECT 1 FROM payments p WHERE p.bid_id = b2.id AND p.payment_status = 'completed')
                     ORDER BY b2.created_at DESC LIMIT 1) as sample_bid_id
                FROM bids b
                JOIN parcel_requests pr ON b.request_id = pr.id
                JOIN return_routes rr ON b.route_id = rr.id
                JOIN profiles d ON rr.driver_id = d.id
                WHERE pr.customer_id = :customerId
                AND pr.status = 'MATCHED'
                AND b.status = 'ACCEPTED'
                AND EXISTS (
                    SELECT 1 FROM payments p 
                    WHERE p.bid_id = b.id 
                    AND p.payment_status = 'completed'
                )
                GROUP BY d.id, d.first_name, d.last_name, d.profile_photo_url, d.phone_number
                ORDER BY MAX(b.created_at) DESC
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter("customerId", customerIdUuid)
                .getResultList();
            
            for (Object[] row : results) {
                UUID driverId = (UUID) row[0];
                
                Map<String, Object> driverData = new HashMap<>();
                driverData.put("driverId", driverId.toString());
                driverData.put("driverName", (row[1] != null ? row[1] : "") + " " + (row[2] != null ? row[2] : ""));
                driverData.put("driverPhoto", row[3]);
                driverData.put("driverPhone", row[4]);
                driverData.put("totalParcels", row[5]); // Number of parcels this driver is handling
                driverData.put("latestBidCreatedAt", row[6]);
                driverData.put("sampleBidId", row[7] != null ? row[7].toString() : null); // Sample bid ID for conversation creation
                
                // Get vehicle details for this driver
                String vehicleSql = """
                    SELECT make, model, plate_number
                    FROM vehicle_details
                    WHERE driver_id = :driverId
                    LIMIT 1
                    """;
                
                @SuppressWarnings("unchecked")
                List<Object[]> vehicleResults = entityManager.createNativeQuery(vehicleSql)
                    .setParameter("driverId", driverId)
                    .getResultList();
                
                if (!vehicleResults.isEmpty()) {
                    Object[] vehicleRow = vehicleResults.get(0);
                    driverData.put("vehicleMake", vehicleRow[0]);
                    driverData.put("vehicleModel", vehicleRow[1]);
                    driverData.put("vehiclePlate", vehicleRow[2]);
                } else {
                    driverData.put("vehicleMake", null);
                    driverData.put("vehicleModel", null);
                    driverData.put("vehiclePlate", null);
                }
                
                // Find conversation for this driver and customer
                String findConversationSql = """
                    SELECT c.id, c.last_message_at
                    FROM conversations c
                    JOIN bids b ON c.bid_id = b.id
                    JOIN return_routes rr ON b.route_id = rr.id
                    WHERE rr.driver_id = :driverId
                    AND c.customer_id = :customerId
                    LIMIT 1
                    """;
                
                @SuppressWarnings("unchecked")
                List<Object[]> conversationResults = entityManager.createNativeQuery(findConversationSql)
                    .setParameter("driverId", driverId)
                    .setParameter("customerId", customerIdUuid)
                    .getResultList();
                
                if (!conversationResults.isEmpty()) {
                    Object[] convRow = conversationResults.get(0);
                    UUID conversationId = (UUID) convRow[0];
                    driverData.put("conversationId", conversationId.toString());
                    driverData.put("hasConversation", true);
                    
                    // Get last message
                    Message lastMessage = messageRepository.findLastMessageByConversationId(conversationId);
                    if (lastMessage != null) {
                        driverData.put("lastMessage", lastMessage.getMessageText());
                        driverData.put("lastMessageTime", lastMessage.getCreatedAt());
                    }
                    
                    // Count unread messages for this customer
                    long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(
                        conversationId, customerIdUuid);
                    driverData.put("unreadCount", unreadCount);
                } else {
                    driverData.put("conversationId", null);
                    driverData.put("hasConversation", false);
                    driverData.put("unreadCount", 0);
                }
                
                driverList.add(driverData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("drivers", driverList);
            response.put("totalDrivers", driverList.size());
            
            log.info("Found {} available drivers for customer {}", driverList.size(), customerId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for customerId: {}", customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid customer ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error fetching available drivers for customer: {}", customerId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch available drivers: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Create a new conversation for a bid
     * POST /api/chat/conversation/create
     */
    @PostMapping("/conversation/create")
    @Transactional
    public ResponseEntity<Map<String, Object>> createConversation(@RequestBody Map<String, Object> request) {
        try {
            log.info("Creating new conversation: {}", request);
            
            String bidId = (String) request.get("bidId");
            String customerId = (String) request.get("customerId");
            String driverId = (String) request.get("driverId");
            
            if (bidId == null || customerId == null || driverId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required fields: bidId, customerId, driverId");
                return ResponseEntity.badRequest().body(response);
            }
            
            UUID bidIdUuid = UUID.fromString(bidId);
            UUID customerIdUuid = UUID.fromString(customerId);
            UUID driverIdUuid = UUID.fromString(driverId);
            
            // Check if conversation already exists
            List<Conversation> existingConversations = conversationRepository.findByBidId(bidIdUuid);
            if (!existingConversations.isEmpty()) {
                Conversation existingConversation = existingConversations.get(0); // Get the latest
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("conversationId", existingConversation.getId().toString());
                response.put("message", "Conversation already exists");
                return ResponseEntity.ok(response);
            }
            
            // Get bid, customer, and driver
            Bid bid = bidRepository.findById(bidIdUuid)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
            
            Profile customer = profileRepository.findById(customerIdUuid)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
            
            Profile driver = profileRepository.findById(driverIdUuid)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
            
            // Create new conversation
            Conversation conversation = new Conversation();
            conversation.setBid(bid);
            conversation.setCustomer(customer);
            conversation.setDriver(driver);
            conversation.setLastMessageAt(ZonedDateTime.now());
            
            Conversation savedConversation = conversationRepository.save(conversation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("conversationId", savedConversation.getId().toString());
            response.put("message", "Conversation created successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating conversation", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create conversation: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get active conversations for a driver (matched and paid requests only)
     * GET /api/chat/driver/{driverId}/conversations
     */
    @GetMapping("/driver/{driverId}/conversations")
    public ResponseEntity<Map<String, Object>> getDriverConversations(@PathVariable String driverId) {
        try {
            log.info("Fetching conversations for driver: {}", driverId);
            
            UUID driverIdUuid = UUID.fromString(driverId);
            
            // Find active conversations for this driver (matched and paid requests)
            String sql = """
                SELECT DISTINCT 
                    c.id as conversation_id,
                    c.bid_id,
                    c.last_message_at,
                    c.created_at,
                    pr.id as request_id,
                    pr.description as request_description,
                    pr.weight_kg,
                    pr.volume_m3,
                    cu.id as customer_id,
                    cu.first_name as customer_first_name,
                    cu.last_name as customer_last_name,
                    cu.profile_photo_url as customer_photo,
                    cu.phone_number as customer_phone,
                    b.offered_price
                FROM conversations c
                JOIN bids b ON c.bid_id = b.id
                JOIN parcel_requests pr ON b.request_id = pr.id
                JOIN return_routes rr ON b.route_id = rr.id
                JOIN profiles cu ON c.customer_id = cu.id
                WHERE rr.driver_id = :driverId
                AND pr.status = 'MATCHED'
                AND b.status = 'ACCEPTED'
                AND EXISTS (
                    SELECT 1 FROM payments p 
                    WHERE p.bid_id = b.id 
                    AND p.payment_status = 'completed'
                )
                ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter("driverId", driverIdUuid)
                .getResultList();
            
            List<Map<String, Object>> conversationList = results.stream().map(row -> {
                Map<String, Object> convData = new HashMap<>();
                convData.put("id", row[0] != null ? row[0].toString() : null);
                convData.put("bidId", row[1] != null ? row[1].toString() : null);
                convData.put("lastMessageAt", row[2]);
                convData.put("createdAt", row[3]);
                convData.put("requestId", row[4] != null ? row[4].toString() : null);
                convData.put("requestDescription", row[5]);
                convData.put("weightKg", row[6]);
                convData.put("volumeM3", row[7]);
                convData.put("customerId", row[8] != null ? row[8].toString() : null);
                convData.put("customerName", (row[9] != null ? row[9] : "") + " " + (row[10] != null ? row[10] : ""));
                convData.put("customerPhoto", row[11]);
                convData.put("customerPhone", row[12]);
                convData.put("offeredPrice", row[13]);
                
                // Get last message
                if (row[0] != null) {
                    UUID conversationId = UUID.fromString(row[0].toString());
                    Message lastMessage = messageRepository.findLastMessageByConversationId(conversationId);
                    if (lastMessage != null) {
                        convData.put("lastMessage", lastMessage.getMessageText());
                        convData.put("lastMessageTime", lastMessage.getCreatedAt());
                    }
                    
                    // Count unread messages
                    long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(
                        conversationId, driverIdUuid);
                    convData.put("unreadCount", unreadCount);
                }
                
                return convData;
            }).toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("conversations", conversationList);
            response.put("totalConversations", conversationList.size());
            
            log.info("Found {} conversations for driver {}", conversationList.size(), driverId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for driverId: {}", driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid driver ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error fetching conversations for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch conversations: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get available customers for a driver (from accepted & paid bids)
     * GET /api/chat/driver/{driverId}/available-customers
     */
    @GetMapping("/driver/{driverId}/available-customers")
    public ResponseEntity<Map<String, Object>> getAvailableCustomers(@PathVariable String driverId) {
        try {
            log.info("Fetching available customers for driver: {}", driverId);
            
            UUID driverIdUuid = UUID.fromString(driverId);
            
            // Find paid and matched requests with customer information
            String sql = """
                SELECT DISTINCT 
                    b.id as bid_id,
                    pr.id as request_id,
                    pr.description as request_description,
                    pr.weight_kg,
                    pr.volume_m3,
                    cu.id as customer_id,
                    cu.first_name as customer_first_name,
                    cu.last_name as customer_last_name,
                    cu.profile_photo_url as customer_photo,
                    cu.phone_number as customer_phone,
                    b.offered_price,
                    b.created_at as bid_created_at,
                    c.id as conversation_id
                FROM bids b
                JOIN parcel_requests pr ON b.request_id = pr.id
                JOIN return_routes rr ON b.route_id = rr.id
                JOIN profiles cu ON pr.customer_id = cu.id
                LEFT JOIN conversations c ON c.bid_id = b.id
                WHERE rr.driver_id = :driverId
                AND pr.status = 'MATCHED'
                AND b.status = 'ACCEPTED'
                AND EXISTS (
                    SELECT 1 FROM payments p 
                    WHERE p.bid_id = b.id 
                    AND p.payment_status = 'completed'
                )
                ORDER BY b.created_at DESC
                """;
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter("driverId", driverIdUuid)
                .getResultList();
            
            List<Map<String, Object>> customerList = new ArrayList<>();
            
            for (Object[] row : results) {
                Map<String, Object> customerData = new HashMap<>();
                customerData.put("bidId", row[0] != null ? row[0].toString() : null);
                customerData.put("requestId", row[1] != null ? row[1].toString() : null);
                customerData.put("requestDescription", row[2]);
                customerData.put("weightKg", row[3]);
                customerData.put("volumeM3", row[4]);
                customerData.put("customerId", row[5] != null ? row[5].toString() : null);
                customerData.put("customerName", (row[6] != null ? row[6] : "") + " " + (row[7] != null ? row[7] : ""));
                customerData.put("customerPhoto", row[8]);
                customerData.put("customerPhone", row[9]);
                customerData.put("offeredPrice", row[10]);
                customerData.put("bidCreatedAt", row[11]);
                customerData.put("conversationId", row[12] != null ? row[12].toString() : null);
                
                // Check if conversation exists
                boolean hasConversation = row[12] != null;
                customerData.put("hasConversation", hasConversation);
                
                // If conversation exists, get last message and unread count
                if (hasConversation) {
                    UUID conversationId = UUID.fromString(row[12].toString());
                    
                    // Get last message
                    Message lastMessage = messageRepository.findLastMessageByConversationId(conversationId);
                    if (lastMessage != null) {
                        customerData.put("lastMessage", lastMessage.getMessageText());
                        customerData.put("lastMessageTime", lastMessage.getCreatedAt());
                    }
                    
                    // Count unread messages
                    long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(
                        conversationId, driverIdUuid);
                    customerData.put("unreadCount", unreadCount);
                }
                
                customerList.add(customerData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("customers", customerList);
            response.put("totalCustomers", customerList.size());
            
            log.info("Found {} available customers for driver {}", customerList.size(), driverId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for driverId: {}", driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid driver ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error fetching available customers for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch available customers: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Mark chat session as ended
     * PUT /api/chat/conversation/{conversationId}/end
     */
    @PutMapping("/conversation/{conversationId}/end")
    @Transactional
    public ResponseEntity<Map<String, Object>> endChatSession(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> request) {
        try {
            log.info("Ending chat session for conversation: {}", conversationId);
            
            UUID conversationIdUuid = UUID.fromString(conversationId);
            String userId = (String) request.get("userId");
            
            if (userId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required field: userId");
                return ResponseEntity.badRequest().body(response);
            }
            
            UUID userIdUuid = UUID.fromString(userId);
            
            // Check if conversation exists
            String checkConversationSql = "SELECT id FROM conversations WHERE id = ?";
            @SuppressWarnings("unchecked")
            List<Object[]> conversationResult = entityManager.createNativeQuery(checkConversationSql)
                .setParameter(1, conversationIdUuid)
                .getResultList();
            
            if (conversationResult.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Conversation not found");
                return ResponseEntity.notFound().build();
            }
            
            // Add a system message indicating the session has ended
            String insertSystemMessageSql = """
                INSERT INTO messages (conversation_id, sender_id, message_text, message_type, is_read, created_at)
                VALUES (?, ?, ?, CAST('TEXT' AS public.message_type_enum), ?, ?)
                """;
            
            entityManager.createNativeQuery(insertSystemMessageSql)
                .setParameter(1, conversationIdUuid)
                .setParameter(2, userIdUuid)
                .setParameter(3, "Chat session ended by user")
                .setParameter(4, true)
                .setParameter(5, ZonedDateTime.now())
                .executeUpdate();
            
            // Update conversation's last message time
            String updateConversationSql = """
                UPDATE conversations 
                SET last_message_at = ? 
                WHERE id = ?
                """;
            
            entityManager.createNativeQuery(updateConversationSql)
                .setParameter(1, ZonedDateTime.now())
                .setParameter(2, conversationIdUuid)
                .executeUpdate();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Chat session ended successfully");
            
            log.info("Chat session ended for conversation: {}", conversationId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error ending chat session for conversation: {}", conversationId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to end chat session: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Mark messages as read in a conversation
     * POST /api/chat/conversation/{conversationId}/mark-read
     */
    @PostMapping("/conversation/{conversationId}/mark-read")
    @Transactional
    public ResponseEntity<Map<String, Object>> markMessagesAsReadPost(
            @PathVariable String conversationId, 
            @RequestBody Map<String, String> requestBody) {
        try {
            log.info("Marking messages as read for conversation: {}", conversationId);
            
            UUID conversationIdUuid = UUID.fromString(conversationId);
            String userId = requestBody.get("userId");
            UUID userIdUuid = UUID.fromString(userId);
            
            // Mark all messages in this conversation as read (except the user's own messages)
            messageRepository.markMessagesAsRead(conversationIdUuid, userIdUuid);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Messages marked as read");
            
            log.info("Successfully marked messages as read for conversation: {} by user: {}", conversationId, userId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid ID format");
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error marking messages as read for conversation: {}", conversationId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to mark messages as read: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Mark conversation as read (alias for mark-read)
     * POST /api/chat/conversation/{conversationId}/mark-conversation-read
     */
    @PostMapping("/conversation/{conversationId}/mark-conversation-read")
    @Transactional
    public ResponseEntity<Map<String, Object>> markConversationAsRead(
            @PathVariable String conversationId, 
            @RequestBody Map<String, String> requestBody) {
        // This is just an alias for the mark-read functionality
        return markMessagesAsReadPost(conversationId, requestBody);
    }
}
