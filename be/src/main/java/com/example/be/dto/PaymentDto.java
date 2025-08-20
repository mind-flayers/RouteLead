package com.example.be.dto;

import com.example.be.types.PaymentStatusEnum;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDto {
    
    private UUID id;
    private UUID userId;
    private UUID bidId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private PaymentStatusEnum paymentStatus;
    private String transactionId;
    private Map<String, Object> gatewayResponse;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Additional fields for better API responses
    private String userEmail;
    private String userName;
    private String orderId;
    private String paymentGateway;
}
