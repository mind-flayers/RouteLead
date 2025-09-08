package com.example.be.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
public class DriverDocumentDTO {
    private UUID id;
    private UUID driverId;
    private String documentType;
    private String documentUrl;
    private String verificationStatus;
    private UUID verifiedBy;
    private ZonedDateTime verifiedAt;
    private LocalDate expiryDate;
    private ZonedDateTime createdAt;
}
