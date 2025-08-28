package com.example.be.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for delivery management APIs
 */
@RestControllerAdvice
public class DeliveryExceptionHandler {

    @ExceptionHandler(DeliveryNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleDeliveryNotFoundException(DeliveryNotFoundException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", ZonedDateTime.now());
        error.put("status", 404);
        error.put("error", "Not Found");
        error.put("message", ex.getMessage());
        error.put("path", "/api/delivery");
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BidNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBidNotFoundException(BidNotFoundException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", ZonedDateTime.now());
        error.put("status", 404);
        error.put("error", "Not Found");
        error.put("message", "Bid not found: " + ex.getMessage());
        error.put("path", "/api/delivery");
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
