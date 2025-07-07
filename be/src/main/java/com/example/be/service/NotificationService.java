package com.example.be.service;

import com.example.be.dto.NotificationDto;
import com.example.be.dto.NotificationCreateDto;
import com.example.be.model.Notification;
import com.example.be.model.Profile;
import com.example.be.repository.NotificationRepository;
import com.example.be.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service

public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProfileRepository profileRepository;

    public NotificationDto createNotification(NotificationCreateDto createDto) {
        Notification notification = new Notification();
        Profile user = profileRepository.findById(createDto.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found with id: " + createDto.getUserId()));
        notification.setUser(user);
        notification.setType(createDto.getType());
        notification.setPayload(createDto.getPayload());
        notification.setIsRead(false);
        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }


    // ObjectMapper no longer needed for payload conversion

    public List<NotificationDto> getNotificationsByUserId(UUID userId) {
        Profile user = profileRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        List<Notification> notifications = notificationRepository.findByUser(user);
        return notifications.stream().map(this::toDto).collect(Collectors.toList());
    }

    private NotificationDto toDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser() != null ? notification.getUser().getId() : null);
        dto.setType(notification.getType());
        dto.setPayload(notification.getPayload());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }

    @Transactional
    public NotificationDto updateNotificationRead(UUID notificationId, Boolean isRead) {
        // Use custom update query to only update isRead
        notificationRepository.updateIsRead(notificationId, isRead);
        // Fetch the updated notification to return
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Notification not found"));
        return toDto(notification);
    }
}
