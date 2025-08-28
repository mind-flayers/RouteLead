package com.example.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankDetailsDto {
    private String bankName;
    private String accountName;
    private String accountNumber;
    private String branchCode;
    private String swiftCode;
}
