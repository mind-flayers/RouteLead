package com.example.be.repository;

import com.example.be.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    // Find messages by conversation ID
    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
    
    // Find unread messages by conversation ID
    List<Message> findByConversationIdAndIsReadFalseOrderByCreatedAtAsc(UUID conversationId);
    
    // Find unread messages by conversation ID and sender ID (to exclude own messages)
    List<Message> findByConversationIdAndSenderIdNotAndIsReadFalseOrderByCreatedAtAsc(UUID conversationId, UUID senderId);
    
    // Count unread messages by conversation ID and sender ID
    long countByConversationIdAndSenderIdNotAndIsReadFalse(UUID conversationId, UUID senderId);
    
    // Find last message by conversation ID
    @Query(value = "SELECT * FROM messages WHERE conversation_id = :conversationId ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Message findLastMessageByConversationId(@Param("conversationId") UUID conversationId);
    
    // Mark messages as read
    @Modifying
    @Query(value = "UPDATE messages SET is_read = true WHERE conversation_id = :conversationId AND sender_id != :userId", nativeQuery = true)
    void markMessagesAsRead(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);
}
