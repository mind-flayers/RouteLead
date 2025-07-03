package com.example.be.dto;

import com.example.be.types.NotificationType;
import java.util.UUID;

public class NotificationCreateDto {
    private UUID userId;
    private NotificationType type;
    private Object payload;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public Object getPayload() { return payload; }
    public void setPayload(Object payload) { this.payload = payload; }
}
