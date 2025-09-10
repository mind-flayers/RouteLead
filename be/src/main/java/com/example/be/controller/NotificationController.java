
package com.example.be.controller;

import com.example.be.dto.NotificationDto;
import com.example.be.dto.NotificationReadDto;
import com.example.be.dto.NotificationCreateDto;
import com.example.be.types.NotificationType;
import com.example.be.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
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
    
    /**
     * DEBUG: Test JSONB payload creation
     */
    @PostMapping("/test-jsonb")
    public ResponseEntity<?> testJsonb(@RequestBody Map<String, Object> request) {
        try {
            Object testPayload = request.get("testPayload");
            
            // Use a real driver user ID from the error logs
            NotificationCreateDto createDto = new NotificationCreateDto();
            createDto.setUserId(UUID.fromString("cdceaa3e-ab91-45d3-a971-efef43624682")); // Real driver user
            createDto.setType(NotificationType.DELIVERY_STATUS);
            createDto.setPayload(testPayload);
            
            NotificationDto result = notificationService.createNotification(createDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notification", result);
            response.put("message", "JSONB test successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            error.put("exception", e.getClass().getName());
            return ResponseEntity.status(500).body(error);
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("exception", ex.getClass().getName());
        return ResponseEntity.status(500).body(error);
    }
}
