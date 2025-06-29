package com.example.routelead.exception;

/**
 * Exception thrown when validation fails for input data.
 */
public class ValidationException extends RouteLeadException {
    
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
    }
    
    public ValidationException(String field, String reason) {
        super(String.format("Validation failed for field '%s': %s", field, reason), "VALIDATION_ERROR");
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, "VALIDATION_ERROR", cause);
    }
} 