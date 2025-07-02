package com.example.be.service;

import com.example.be.dto.NotificationDto;
import com.example.be.model.Notification;
import com.example.be.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public List<NotificationDto> getNotifications(UUID userId) {
        List<Notification> notifications;
        if (userId != null) {
            notifications = notificationRepository.findByUserId(userId);
        } else {
            notifications = notificationRepository.findAll();
        }
        return notifications.stream().map(this::toDto).collect(Collectors.toList());
    }

    private NotificationDto toDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setType(notification.getType());
        dto.setPayload(notification.getPayload());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
