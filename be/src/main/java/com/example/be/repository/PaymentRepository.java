package com.example.be.repository;

import com.example.be.model.Payment;
import com.example.be.types.PaymentStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    // Find payment by bid ID - using relationship navigation (gets latest if multiple exist)
    @Query("SELECT p FROM Payment p WHERE p.bid.id = :bidId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<Payment> findByBidId(@Param("bidId") UUID bidId);
    
    // Find latest payment by bid ID - handles multiple payments per bid
    @Query("SELECT p FROM Payment p WHERE p.bid.id = :bidId ORDER BY p.createdAt DESC")
    List<Payment> findByBidIdOrderByCreatedAtDesc(@Param("bidId") UUID bidId);
    
    // Find latest payment by bid ID - returns only the most recent one
    @Query("SELECT p FROM Payment p WHERE p.bid.id = :bidId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<Payment> findLatestByBidId(@Param("bidId") UUID bidId);
    
    // Find payments by request ID (through bid relationship)
    @Query("SELECT p FROM Payment p WHERE p.bid.request.id = :requestId ORDER BY p.createdAt DESC")
    List<Payment> findByRequestId(@Param("requestId") UUID requestId);
    
    // Find payments by user ID - using relationship navigation
    @Query("SELECT p FROM Payment p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
    
    // Find payments by status
    List<Payment> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatusEnum status);
    
    // Find payments by user and status - using relationship navigation
    @Query("SELECT p FROM Payment p WHERE p.user.id = :userId AND p.paymentStatus = :status ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdAndPaymentStatusOrderByCreatedAtDesc(@Param("userId") UUID userId, @Param("status") PaymentStatusEnum status);
    
    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Find payments by order ID (from PayHere) - using native query for JSON field
    @Query(value = "SELECT * FROM payments WHERE gateway_response->>'orderId' = :orderId", nativeQuery = true)
    Optional<Payment> findByOrderId(@Param("orderId") String orderId);
    
    // Count payments by status
    long countByPaymentStatus(PaymentStatusEnum status);
    
    // Count payments by user and status - using relationship navigation
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.user.id = :userId AND p.paymentStatus = :status")
    long countByUserIdAndPaymentStatus(@Param("userId") UUID userId, @Param("status") PaymentStatusEnum status);
    
    // Sum amount by payment status
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal sumAmountByPaymentStatus(@Param("status") PaymentStatusEnum status);
    
    // Sum amount by user and payment status
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user.id = :userId AND p.paymentStatus = :status")
    BigDecimal sumAmountByUserIdAndPaymentStatus(@Param("userId") UUID userId, @Param("status") PaymentStatusEnum status);
    
    // Create payment using native SQL to handle enum properly
    @Query(value = """
        INSERT INTO payments (id, user_id, bid_id, amount, currency, payment_method, payment_status, created_at, updated_at)
        VALUES (:id, :userId, :bidId, :amount, :currency, :paymentMethod, CAST(:paymentStatus AS payment_status_enum), :createdAt, :updatedAt)
        RETURNING id
        """, nativeQuery = true)
    UUID createPaymentNative(
        @Param("id") UUID id,
        @Param("userId") UUID userId,
        @Param("bidId") UUID bidId,
        @Param("amount") BigDecimal amount,
        @Param("currency") String currency,
        @Param("paymentMethod") String paymentMethod,
        @Param("paymentStatus") String paymentStatus,
        @Param("createdAt") java.time.ZonedDateTime createdAt,
        @Param("updatedAt") java.time.ZonedDateTime updatedAt
    );
}