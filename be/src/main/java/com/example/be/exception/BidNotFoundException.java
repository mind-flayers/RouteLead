package com.example.be.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class BidNotFoundException extends RuntimeException {
    
    public BidNotFoundException(String bidId) {
        super("Bid not found with ID: " + bidId);
    }
    
    public BidNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
