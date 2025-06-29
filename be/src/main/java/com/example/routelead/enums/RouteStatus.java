package com.example.routelead.enums;

/**
 * Enum representing the different statuses a route can have in the RouteLead system.
 */
public enum RouteStatus {
    /**
     * Route is open for booking
     */
    OPEN,
    
    /**
     * Route has been booked
     */
    BOOKED,
    
    /**
     * Route has been completed
     */
    COMPLETED,
    
    /**
     * Route has been cancelled
     */
    CANCELLED
} 