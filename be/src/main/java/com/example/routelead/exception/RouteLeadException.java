package com.example.routelead.exception;

/**
 * Base exception class for RouteLead application.
 * All custom exceptions should extend this class.
 */
public class RouteLeadException extends RuntimeException {
    
    private final String errorCode;
    
    public RouteLeadException(String message) {
        super(message);
        this.errorCode = "GENERAL_ERROR";
    }
    
    public RouteLeadException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public RouteLeadException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "GENERAL_ERROR";
    }
    
    public RouteLeadException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
} 