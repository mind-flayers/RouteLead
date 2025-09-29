package com.example.be.repository;

import com.example.be.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    
    // Find conversations by customer ID
    List<Conversation> findByCustomerIdOrderByLastMessageAtDesc(UUID customerId);
    
    // Find conversations by driver ID
    List<Conversation> findByDriverIdOrderByLastMessageAtDesc(UUID driverId);
    
    // Find conversation by bid ID - returns latest if multiple exist
    @Query("SELECT c FROM Conversation c WHERE c.bid.id = :bidId ORDER BY c.createdAt DESC")
    List<Conversation> findByBidId(@Param("bidId") UUID bidId);
    
    // Find latest conversation by bid ID
    @Query("SELECT c FROM Conversation c WHERE c.bid.id = :bidId ORDER BY c.createdAt DESC LIMIT 1")
    Optional<Conversation> findLatestByBidId(@Param("bidId") UUID bidId);
    
    // Find conversations by customer and driver
    List<Conversation> findByCustomerIdAndDriverIdOrderByLastMessageAtDesc(UUID customerId, UUID driverId);
    
    // Find conversations for customer with paid and matched requests
    @Query("SELECT c FROM Conversation c " +
           "JOIN c.bid b " +
           "JOIN b.request pr " +
           "JOIN b.route rr " +
           "WHERE c.customer.id = :customerId " +
           "AND pr.status = 'MATCHED' " +
           "AND EXISTS (SELECT p FROM Payment p WHERE p.bid.id = b.id AND p.paymentStatus = 'completed') " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findActiveConversationsForCustomer(@Param("customerId") UUID customerId);
    
    // Find conversations for customer with driver info
    @Query("SELECT c FROM Conversation c " +
           "JOIN c.bid b " +
           "JOIN b.request pr " +
           "JOIN b.route rr " +
           "JOIN rr.driver d " +
           "WHERE c.customer.id = :customerId " +
           "AND pr.status = 'MATCHED' " +
           "AND EXISTS (SELECT p FROM Payment p WHERE p.bid.id = b.id AND p.paymentStatus = 'completed') " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findActiveConversationsWithDriverInfo(@Param("customerId") UUID customerId);
}
