package com.example.be.exception;

/**
 * Exception thrown when a delivery or bid is not found
 */
public class DeliveryNotFoundException extends RuntimeException {
    public DeliveryNotFoundException(String message) {
        super(message);
    }
    
    public DeliveryNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
