package com.example.be.controller;

import com.example.be.dto.NotificationDto;
import com.example.be.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> getNotificationsByUserId(@RequestParam("userId") UUID userId) {
        return notificationService.getNotificationsByUserId(userId);
    }
}
