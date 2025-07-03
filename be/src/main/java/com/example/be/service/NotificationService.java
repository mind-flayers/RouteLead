
package com.example.be.service;

import com.example.be.dto.NotificationDto;
import com.example.be.model.Notification;
import com.example.be.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    public NotificationDto createNotification(com.example.be.dto.NotificationCreateDto createDto) {
        Notification notification = new Notification();
        notification.setUserId(createDto.getUserId());
        notification.setType(createDto.getType());
        notification.setPayload(createDto.getPayload());
        notification.setIsRead(false);
        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }
    @Autowired
    private NotificationRepository notificationRepository;

    // ObjectMapper no longer needed for payload conversion

    public List<NotificationDto> getNotificationsByUserId(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
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

    @Transactional
    public NotificationDto updateNotificationRead(UUID notificationId, Boolean isRead) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setIsRead(isRead);
        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }
}
