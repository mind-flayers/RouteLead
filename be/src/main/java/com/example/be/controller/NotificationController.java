
package com.example.be.controller;

import com.example.be.dto.NotificationDto;
import com.example.be.dto.NotificationReadDto;
import com.example.be.dto.NotificationCreateDto;
import com.example.be.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    @PostMapping
    public NotificationDto createNotification(@RequestBody NotificationCreateDto createDto) {
        return notificationService.createNotification(createDto);
    }
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> getNotificationsByUserId(@RequestParam("userId") UUID userId) {
        return notificationService.getNotificationsByUserId(userId);
    }

    @PatchMapping("/{id}/read")
    public NotificationDto updateNotificationRead(@PathVariable("id") UUID id, @RequestBody NotificationReadDto readDto) {
        return notificationService.updateNotificationRead(id, readDto.getIsRead());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("exception", ex.getClass().getName());
        return ResponseEntity.status(500).body(error);
    }
}
