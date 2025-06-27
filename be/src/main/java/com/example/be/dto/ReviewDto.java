package com.example.be.dto;

import com.example.be.types.ReviewRole;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class ReviewDto {
    private UUID id;
    private UUID tripId;
    private UUID reviewerId;
    private UUID revieweeId;
    private ReviewRole role;
    private Short rating;
    private String comment;
    private ZonedDateTime createdAt;
}

@Data
class ReviewCreateDto {
    private UUID tripId;
    private UUID revieweeId;
    private ReviewRole role;
    private Short rating;
    private String comment;
}

@Data
class ReviewUpdateDto {
    private Short rating;
    private String comment;
}

@Data
class ReviewResponseDto {
    private UUID id;
    private UUID tripId;
    private UUID reviewerId;
    private UUID revieweeId;
    private ReviewRole role;
    private Short rating;
    private String comment;
    private ZonedDateTime createdAt;
    // Additional fields for response
    private String reviewerName;
    private String revieweeName;
    private String tripInfo;
} 