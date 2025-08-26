package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWithdrawalRequestDto {
    private UUID driverId;
    private BigDecimal amount;
    private BankDetailsDto bankDetails;
}
