package com.example.routelead.util;

import com.example.routelead.exception.ValidationException;

import java.util.UUID;

/**
 * Utility class for common validation operations.
 */
public class ValidationUtils {

    /**
     * Validates that a string is not null or empty
     */
    public static void validateNotNullOrEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName, "cannot be null or empty");
        }
    }

    /**
     * Validates that an object is not null
     */
    public static void validateNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName, "cannot be null");
        }
    }

    /**
     * Validates that a UUID is not null
     */
    public static void validateUuidNotNull(UUID value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName, "cannot be null");
        }
    }

    /**
     * Validates that a number is positive
     */
    public static void validatePositive(Number value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName, "cannot be null");
        }
        if (value.doubleValue() <= 0) {
            throw new ValidationException(fieldName, "must be positive");
        }
    }

    /**
     * Validates that a number is non-negative
     */
    public static void validateNonNegative(Number value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName, "cannot be null");
        }
        if (value.doubleValue() < 0) {
            throw new ValidationException(fieldName, "must be non-negative");
        }
    }

    /**
     * Validates email format
     */
    public static void validateEmail(String email, String fieldName) {
        validateNotNullOrEmpty(email, fieldName);
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ValidationException(fieldName, "must be a valid email address");
        }
    }

    /**
     * Validates phone number format (basic validation)
     */
    public static void validatePhoneNumber(String phoneNumber, String fieldName) {
        validateNotNullOrEmpty(phoneNumber, fieldName);
        if (!phoneNumber.matches("^\\+?[1-9]\\d{1,14}$")) {
            throw new ValidationException(fieldName, "must be a valid phone number");
        }
    }

    /**
     * Validates that a string length is within specified bounds
     */
    public static void validateStringLength(String value, String fieldName, int minLength, int maxLength) {
        validateNotNullOrEmpty(value, fieldName);
        if (value.length() < minLength || value.length() > maxLength) {
            throw new ValidationException(fieldName, 
                String.format("length must be between %d and %d characters", minLength, maxLength));
        }
    }
} 