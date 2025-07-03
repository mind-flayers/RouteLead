package com.example.be.dto;

import com.example.be.types.NotificationType;
import lombok.Data;

import java.util.UUID;

@Data
public class NotificationCreateDto {
    private UUID userId;
    private NotificationType type;
    private Object payload;
}
