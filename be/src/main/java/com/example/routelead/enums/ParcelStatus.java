package com.example.routelead.enums;

/**
 * Enum representing the different statuses a parcel request can have in the RouteLead system.
 */
public enum ParcelStatus {
    /**
     * Parcel request is open for bidding
     */
    OPEN,
    
    /**
     * Parcel request has been matched with a driver
     */
    MATCHED,
    
    /**
     * Parcel request has expired
     */
    EXPIRED,
    
    /**
     * Parcel request has been cancelled
     */
    CANCELLED
} 