package com.example.be.repository;

import com.example.be.model.ParcelRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface ParcelRequestRepository extends JpaRepository<ParcelRequest, UUID> {
    List<ParcelRequest> findByCustomerId(UUID customerId);

    @Query(value = "INSERT INTO parcel_requests (customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, weight_kg, volume_m3, description, max_budget, deadline, status, created_at, updated_at) " +
            "VALUES (:customerId, :pickupLat, :pickupLng, :dropoffLat, :dropoffLng, :weightKg, :volumeM3, :description, :maxBudget, :deadline, CAST(:status AS parcel_status), :createdAt, :updatedAt) " +
            "RETURNING id", nativeQuery = true)
    UUID insertParcelRequestWithEnumAndReturnId(
            UUID customerId,
            java.math.BigDecimal pickupLat,
            java.math.BigDecimal pickupLng,
            java.math.BigDecimal dropoffLat,
            java.math.BigDecimal dropoffLng,
            java.math.BigDecimal weightKg,
            java.math.BigDecimal volumeM3,
            String description,
            java.math.BigDecimal maxBudget,
            java.time.ZonedDateTime deadline,
            String status,
            java.time.ZonedDateTime createdAt,
            java.time.ZonedDateTime updatedAt
    );
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO parcel_requests (customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, weight_kg, volume_m3, description, max_budget, deadline, status, created_at, updated_at) " +
            "VALUES (:customerId, :pickupLat, :pickupLng, :dropoffLat, :dropoffLng, :weightKg, :volumeM3, :description, :maxBudget, :deadline, CAST(:status AS parcel_status), :createdAt, :updatedAt)", nativeQuery = true)
    void insertParcelRequestWithEnum(
            UUID customerId,
            java.math.BigDecimal pickupLat,
            java.math.BigDecimal pickupLng,
            java.math.BigDecimal dropoffLat,
            java.math.BigDecimal dropoffLng,
            java.math.BigDecimal weightKg,
            java.math.BigDecimal volumeM3,
            String description,
            java.math.BigDecimal maxBudget,
            java.time.ZonedDateTime deadline,
            String status,
            java.time.ZonedDateTime createdAt,
            java.time.ZonedDateTime updatedAt
    );
}
