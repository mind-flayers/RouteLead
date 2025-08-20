package com.example.be.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PayHereRequestDto {
    
    // Required fields
    private String merchantId;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String orderId;
    private String items;
    private String currency;
    private BigDecimal amount;
    private String hash;
    
    // Optional fields
    private String custom1; // bidId
    private String custom2; // requestId
    private String custom3; // userId
    private String custom4; // payment method
    
    // Internal tracking
    private UUID bidId;
    private UUID requestId;
    private UUID userId;
    private String paymentMethod;
    
    // Timestamp for order
    private String timestamp;
}
