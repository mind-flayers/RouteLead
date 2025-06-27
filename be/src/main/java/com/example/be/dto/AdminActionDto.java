package com.example.be.dto;

import com.example.be.types.AdminEntityType;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AdminActionDto {
    private UUID id;
    private UUID adminId;
    private AdminEntityType entityType;
    private UUID entityId;
    private String action;
    private String notes;
    private ZonedDateTime performedAt;
}

@Data
class AdminActionCreateDto {
    private UUID adminId;
    private AdminEntityType entityType;
    private UUID entityId;
    private String action;
    private String notes;
}

@Data
class AdminActionResponseDto {
    private UUID id;
    private UUID adminId;
    private AdminEntityType entityType;
    private UUID entityId;
    private String action;
    private String notes;
    private ZonedDateTime performedAt;
    // Additional fields for response
    private String adminName;
    private String entityName;
    private String formattedAction;
} 