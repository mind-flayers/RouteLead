package com.example.be.service;

import com.example.be.dto.PaymentDto;
import com.example.be.model.Payment;
import com.example.be.model.Profile;
import com.example.be.model.Bid;
import com.example.be.repository.PaymentRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.repository.BidRepository;
import com.example.be.types.PaymentStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProfileRepository profileRepository;
    private final BidRepository bidRepository;

    /**
     * Create a new payment record
     */
    @Transactional
    public Payment createPayment(UUID userId, UUID bidId, BigDecimal amount, 
                               String currency, String paymentMethod) {
        try {
            log.info("Creating payment for user: {}, bid: {}, amount: {}", userId, bidId, amount);
            
            Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
            
            Payment payment = new Payment();
            payment.setUser(user);
            payment.setBid(bid);
            payment.setAmount(amount);
            payment.setCurrency(currency != null ? currency : "LKR");
            payment.setPaymentMethod(paymentMethod);
            payment.setPaymentStatus(PaymentStatusEnum.pending);
            
            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment created successfully with ID: {}", savedPayment.getId());
            
            return savedPayment;
            
        } catch (Exception e) {
            log.error("Error creating payment", e);
            throw new RuntimeException("Failed to create payment: " + e.getMessage());
        }
    }

    /**
     * Get payment by ID
     */
    @Transactional(readOnly = true)
    public Payment getPaymentById(UUID paymentId) {
        return paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    /**
     * Get payment by bid ID
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentByBidId(UUID bidId) {
        return paymentRepository.findByBidId(bidId);
    }

    /**
     * Get payments by user ID
     */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByUserId(UUID userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get payments by status
     */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByStatus(PaymentStatusEnum status) {
        return paymentRepository.findByPaymentStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Update payment status
     */
    @Transactional
    public Payment updatePaymentStatus(UUID paymentId, PaymentStatusEnum status) {
        try {
            Payment payment = getPaymentById(paymentId);
            payment.setPaymentStatus(status);
            
            Payment updatedPayment = paymentRepository.save(payment);
            log.info("Payment status updated to {} for payment ID: {}", status, paymentId);
            
            return updatedPayment;
            
        } catch (Exception e) {
            log.error("Error updating payment status", e);
            throw new RuntimeException("Failed to update payment status: " + e.getMessage());
        }
    }

    /**
     * Update payment with transaction details
     */
    @Transactional
    public Payment updatePaymentWithTransaction(UUID paymentId, String transactionId, 
                                               PaymentStatusEnum status, Map<String, Object> gatewayResponse) {
        try {
            Payment payment = getPaymentById(paymentId);
            payment.setTransactionId(transactionId);
            payment.setPaymentStatus(status);
            payment.setGatewayResponse(gatewayResponse);
            
            Payment updatedPayment = paymentRepository.save(payment);
            log.info("Payment updated with transaction ID: {} for payment ID: {}", transactionId, paymentId);
            
            return updatedPayment;
            
        } catch (Exception e) {
            log.error("Error updating payment with transaction details", e);
            throw new RuntimeException("Failed to update payment: " + e.getMessage());
        }
    }

    /**
     * Convert Payment entity to PaymentDto
     */
    public PaymentDto convertToDto(Payment payment) {
        return PaymentDto.builder()
            .id(payment.getId())
            .userId(payment.getUser().getId())
            .bidId(payment.getBid() != null ? payment.getBid().getId() : null)
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .paymentMethod(payment.getPaymentMethod())
            .paymentStatus(payment.getPaymentStatus())
            .transactionId(payment.getTransactionId())
            .gatewayResponse(payment.getGatewayResponse())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .userEmail(payment.getUser().getEmail())
            .userName(payment.getUser().getFirstName() + " " + payment.getUser().getLastName())
            .orderId(payment.getGatewayResponse() != null ? 
                (String) payment.getGatewayResponse().get("orderId") : null)
            .paymentGateway("PayHere")
            .build();
    }

    /**
     * Convert list of Payment entities to PaymentDto list
     */
    public List<PaymentDto> convertToDtoList(List<Payment> payments) {
        return payments.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get payment statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentStatistics() {
        Map<String, Object> stats = new java.util.HashMap<>();
        
        stats.put("totalPayments", paymentRepository.count());
        stats.put("pendingPayments", paymentRepository.countByPaymentStatus(PaymentStatusEnum.pending));
        stats.put("completedPayments", paymentRepository.countByPaymentStatus(PaymentStatusEnum.completed));
        stats.put("failedPayments", paymentRepository.countByPaymentStatus(PaymentStatusEnum.failed));
        stats.put("refundedPayments", paymentRepository.countByPaymentStatus(PaymentStatusEnum.refunded));
        
        return stats;
    }

    /**
     * Get payment statistics for a specific user
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserPaymentStatistics(UUID userId) {
        Map<String, Object> stats = new java.util.HashMap<>();
        
                stats.put("totalPayments", paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.pending) + 
                                   paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.completed) + 
                                   paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.failed) + 
                                   paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.refunded));
        stats.put("pendingPayments", paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.pending));
        stats.put("completedPayments", paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.completed));
        stats.put("failedPayments", paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.failed));
        stats.put("refundedPayments", paymentRepository.countByUserIdAndPaymentStatus(userId, PaymentStatusEnum.refunded));
        
        return stats;
    }
}
