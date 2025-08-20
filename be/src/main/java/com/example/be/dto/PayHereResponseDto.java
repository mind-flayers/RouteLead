package com.example.be.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PayHereResponseDto {
    
    // Payment status
    private String paymentId;
    private String orderId;
    private String payHereAmount;
    private String payHereCurrency;
    private String statusCode;
    private String md5sig;
    
    // Custom fields
    private String custom1; // bidId
    private String custom2; // requestId
    private String custom3; // userId
    private String custom4; // payment method
    
    // Method
    private String method;
    
    // Status messages
    private String statusMessage;
    private String cardMask;
    private String cardHolderName;
    
    // Timestamp
    private String timestamp;
    
    // Internal mapping
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private String paymentStatus;
}
