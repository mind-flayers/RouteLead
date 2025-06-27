package com.example.be.dto;

import com.example.be.types.NotificationType;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class NotificationDto {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String payload;
    private Boolean isRead;
    private ZonedDateTime createdAt;
}

@Data
class NotificationCreateDto {
    private UUID userId;
    private NotificationType type;
    private String payload;
}

@Data
class NotificationUpdateDto {
    private Boolean isRead;
}

@Data
class NotificationResponseDto {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String payload;
    private Boolean isRead;
    private ZonedDateTime createdAt;
    // Additional fields for response
    private String userEmail;
    private String formattedMessage;
} 