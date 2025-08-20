package com.example.be.repository;

import com.example.be.model.ParcelRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface ParcelRequestRepository extends JpaRepository<ParcelRequest, UUID> {
    // Find parcel requests by customer ID using custom query
    @Query("SELECT pr FROM ParcelRequest pr WHERE pr.customer.id = :customerId")
    List<ParcelRequest> findByCustomerId(@org.springframework.data.repository.query.Param("customerId") UUID customerId);

    @Query(value = "INSERT INTO parcel_requests (customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, weight_kg, volume_m3, description, max_budget, deadline, status, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, created_at, updated_at) " +
            "VALUES (:customerId, :pickupLat, :pickupLng, :dropoffLat, :dropoffLng, :weightKg, :volumeM3, :description, :maxBudget, :deadline, CAST(:status AS parcel_status), :pickupContactName, :pickupContactPhone, :deliveryContactName, :deliveryContactPhone, :createdAt, :updatedAt) " +
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
            String pickupContactName,
            String pickupContactPhone,
            String deliveryContactName,
            String deliveryContactPhone,
            java.time.ZonedDateTime createdAt,
            java.time.ZonedDateTime updatedAt
    );
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO parcel_requests (customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, weight_kg, volume_m3, description, max_budget, deadline, status, pickup_contact_name, pickup_contact_phone, delivery_contact_name, delivery_contact_phone, created_at, updated_at) " +
            "VALUES (:customerId, :pickupLat, :pickupLng, :dropoffLat, :dropoffLng, :weightKg, :volumeM3, :description, :maxBudget, :deadline, CAST(:status AS parcel_status), :pickupContactName, :pickupContactPhone, :deliveryContactName, :deliveryContactPhone, :createdAt, :updatedAt)", nativeQuery = true)
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
            String pickupContactName,
            String pickupContactPhone,
            String deliveryContactName,
            String deliveryContactPhone,
            java.time.ZonedDateTime createdAt,
            java.time.ZonedDateTime updatedAt
    );

    // Find parcel requests by route ID (through bids table)
    @Query(value = "SELECT DISTINCT pr.* FROM parcel_requests pr " +
            "INNER JOIN bids b ON pr.id = b.request_id " +
            "WHERE b.route_id = :routeId ORDER BY pr.created_at DESC", nativeQuery = true)
    List<ParcelRequest> findByRouteId(@org.springframework.data.repository.query.Param("routeId") UUID routeId);

    // Find parcel requests by route ID using JPA query to handle enum properly
    @Query("SELECT DISTINCT pr FROM ParcelRequest pr " +
            "INNER JOIN Bid b ON pr.id = b.request.id " +
            "WHERE b.route.id = :routeId ORDER BY pr.createdAt DESC")
    List<ParcelRequest> findByRouteIdJpa(@org.springframework.data.repository.query.Param("routeId") UUID routeId);

    // Find parcel requests by route ID using native SQL with proper enum casting
    @Query(value = "SELECT DISTINCT pr.* FROM parcel_requests pr " +
            "INNER JOIN bids b ON pr.id = b.request_id " +
            "WHERE b.route_id = :routeId ORDER BY pr.created_at DESC", nativeQuery = true)
    List<ParcelRequest> findByRouteIdNative(@org.springframework.data.repository.query.Param("routeId") UUID routeId);

    // Delete related payments for parcel request
    @Modifying
    @Query(value = "DELETE FROM payments WHERE bid_id IN (SELECT id FROM bids WHERE request_id = :requestId)", nativeQuery = true)
    void deleteRelatedPayments(@org.springframework.data.repository.query.Param("requestId") UUID requestId);

    // Delete related earnings for parcel request
    @Modifying
    @Query(value = "DELETE FROM earnings WHERE bid_id IN (SELECT id FROM bids WHERE request_id = :requestId)", nativeQuery = true)
    void deleteRelatedEarnings(@org.springframework.data.repository.query.Param("requestId") UUID requestId);

    // Delete related conversations for parcel request
    @Modifying
    @Query(value = "DELETE FROM conversations WHERE bid_id IN (SELECT id FROM bids WHERE request_id = :requestId)", nativeQuery = true)
    void deleteRelatedConversations(@org.springframework.data.repository.query.Param("requestId") UUID requestId);

    // Delete related delivery tracking for parcel request
    @Modifying
    @Query(value = "DELETE FROM delivery_tracking WHERE bid_id IN (SELECT id FROM bids WHERE request_id = :requestId)", nativeQuery = true)
    void deleteRelatedDeliveryTracking(@org.springframework.data.repository.query.Param("requestId") UUID requestId);

    // Delete related disputes for parcel request
    @Modifying
    @Query(value = "DELETE FROM disputes WHERE related_bid_id IN (SELECT id FROM bids WHERE request_id = :requestId)", nativeQuery = true)
    void deleteRelatedDisputes(@org.springframework.data.repository.query.Param("requestId") UUID requestId);

    // Delete related bids for parcel request
    @Modifying
    @Query(value = "DELETE FROM bids WHERE request_id = :requestId", nativeQuery = true)
    void deleteRelatedBids(@org.springframework.data.repository.query.Param("requestId") UUID requestId);
}
