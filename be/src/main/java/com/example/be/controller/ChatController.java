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
                msgData.put("senderName", (row[5] != null ? row[5] : "") + " " + (row[6] != null ? row[6] : ""));
                msgData.put("isRead", row[4]);
                msgData.put("createdAt", row[5]);
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
            
            // Query to get all paid and matched requests with driver info
            String sql = """
                SELECT DISTINCT 
                    b.id as bid_id,
                    pr.id as request_id,
                    pr.description as request_description,
                    pr.weight_kg,
                    pr.volume_m3,
                    d.id as driver_id,
                    d.first_name as driver_first_name,
                    d.last_name as driver_last_name,
                    d.profile_photo_url as driver_photo,
                    vd.make as vehicle_make,
                    vd.model as vehicle_model,
                    vd.plate_number as vehicle_plate,
                    b.offered_price,
                    b.created_at as bid_created_at,
                    c.id as conversation_id
                FROM bids b
                JOIN parcel_requests pr ON b.request_id = pr.id
                JOIN return_routes rr ON b.route_id = rr.id
                JOIN profiles d ON rr.driver_id = d.id
                LEFT JOIN vehicle_details vd ON vd.driver_id = d.id
                LEFT JOIN conversations c ON c.bid_id = b.id
                WHERE pr.customer_id = :customerId
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
                .setParameter("customerId", customerIdUuid)
                .getResultList();
            
            for (Object[] row : results) {
                Map<String, Object> driverData = new HashMap<>();
                driverData.put("bidId", row[0] != null ? row[0].toString() : null);
                driverData.put("requestId", row[1] != null ? row[1].toString() : null);
                driverData.put("requestDescription", row[2]);
                driverData.put("weightKg", row[3]);
                driverData.put("volumeM3", row[4]);
                driverData.put("driverId", row[5] != null ? row[5].toString() : null);
                driverData.put("driverName", (row[6] != null ? row[6] : "") + " " + (row[7] != null ? row[7] : ""));
                driverData.put("driverPhoto", row[8]);
                driverData.put("vehicleMake", row[9]);
                driverData.put("vehicleModel", row[10]);
                driverData.put("vehiclePlate", row[11]);
                driverData.put("offeredPrice", row[12]);
                driverData.put("bidCreatedAt", row[13]);
                driverData.put("conversationId", row[14] != null ? row[14].toString() : null);
                
                // Check if conversation exists
                boolean hasConversation = row[14] != null;
                driverData.put("hasConversation", hasConversation);
                
                // If conversation exists, get last message and unread count
                if (hasConversation) {
                    UUID conversationId = UUID.fromString(row[14].toString());
                    
                    // Get last message
                    Message lastMessage = messageRepository.findLastMessageByConversationId(conversationId);
                    if (lastMessage != null) {
                        driverData.put("lastMessage", lastMessage.getMessageText());
                        driverData.put("lastMessageTime", lastMessage.getCreatedAt());
                    }
                    
                    // Count unread messages
                    long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(
                        conversationId, customerIdUuid);
                    driverData.put("unreadCount", unreadCount);
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
            Conversation existingConversation = conversationRepository.findByBidId(bidIdUuid);
            if (existingConversation != null) {
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
}
