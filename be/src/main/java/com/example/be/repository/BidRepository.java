package com.example.be.repository;

import com.example.be.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, UUID> {
    @Modifying
    @Query(value = "UPDATE bids SET status = CAST(:status AS bid_status), updated_at = NOW() WHERE id = :bidId", nativeQuery = true)
    void updateBidStatus(@Param("bidId") UUID bidId, @Param("status") String status);

    @Modifying
    @Query(value = "UPDATE parcel_requests SET status = CAST(:status AS parcel_request_status), updated_at = NOW() WHERE id = (SELECT request_id FROM bids WHERE id = :bidId)", nativeQuery = true)
    void updateParcelRequestStatusForBid(@Param("bidId") UUID bidId, @Param("status") String status);

    @Modifying
    @Query(value = "INSERT INTO bids (request_id, route_id, start_index, end_index, offered_price, status, created_at, updated_at) " +
            "VALUES (:requestId, :routeId, :startIndex, :endIndex, :offeredPrice, CAST(:status AS bid_status), NOW(), NOW())", nativeQuery = true)
    void insertBid(
            @Param("requestId") UUID requestId,
            @Param("routeId") UUID routeId,
            @Param("startIndex") Integer startIndex,
            @Param("endIndex") Integer endIndex,
            @Param("offeredPrice") java.math.BigDecimal offeredPrice,
            @Param("status") String status
    );

    // Find the latest bid matching all fields (for use after insert) using native query with explicit cast for status
    @Query(value = "SELECT * FROM bids WHERE request_id = :requestId AND route_id = :routeId AND start_index = :startIndex AND end_index = :endIndex AND offered_price = :offeredPrice AND status = CAST(:status AS bid_status) ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    java.util.Optional<Bid> findLatestBidByAllFields(
            @Param("requestId") UUID requestId,
            @Param("routeId") UUID routeId,
            @Param("startIndex") Integer startIndex,
            @Param("endIndex") Integer endIndex,
            @Param("offeredPrice") java.math.BigDecimal offeredPrice,
            @Param("status") String status
    );

    // Get bid history for a specific driver with parcel request details
    @Query(value = "SELECT b.id, b.request_id, b.route_id, b.start_index, b.end_index, " +
            "b.offered_price, b.status, b.created_at, b.updated_at, " +
            "pr.pickup_lat, pr.pickup_lng, pr.dropoff_lat, pr.dropoff_lng, " +
            "pr.weight_kg, pr.volume_m3, pr.description, pr.max_budget, pr.deadline, " +
            "p.first_name as customer_first_name, p.last_name as customer_last_name " +
            "FROM bids b " +
            "INNER JOIN return_routes rr ON b.route_id = rr.id " +
            "INNER JOIN parcel_requests pr ON b.request_id = pr.id " +
            "INNER JOIN profiles p ON pr.customer_id = p.id " +
            "WHERE rr.driver_id = :driverId " +
            "ORDER BY b.created_at DESC", nativeQuery = true)
    List<Object[]> findBidHistoryByDriverId(@Param("driverId") UUID driverId);

    // Get bid history for a specific driver filtered by status
    @Query(value = "SELECT b.id, b.request_id, b.route_id, b.start_index, b.end_index, " +
            "b.offered_price, b.status, b.created_at, b.updated_at, " +
            "pr.pickup_lat, pr.pickup_lng, pr.dropoff_lat, pr.dropoff_lng, " +
            "pr.weight_kg, pr.volume_m3, pr.description, pr.max_budget, pr.deadline, " +
            "p.first_name as customer_first_name, p.last_name as customer_last_name " +
            "FROM bids b " +
            "INNER JOIN return_routes rr ON b.route_id = rr.id " +
            "INNER JOIN parcel_requests pr ON b.request_id = pr.id " +
            "INNER JOIN profiles p ON pr.customer_id = p.id " +
            "WHERE rr.driver_id = :driverId AND b.status = CAST(:status AS bid_status) " +
            "ORDER BY b.created_at DESC", nativeQuery = true)
    List<Object[]> findBidHistoryByDriverIdAndStatus(@Param("driverId") UUID driverId, @Param("status") String status);

    // Count pending bids for a specific driver
    @Query(value = "SELECT COUNT(*) FROM bids b " +
            "INNER JOIN return_routes rr ON b.route_id = rr.id " +
            "WHERE rr.driver_id = :driverId AND b.status = CAST(:status AS bid_status)", nativeQuery = true)
    int countByRouteDriverIdAndStatus(@Param("driverId") UUID driverId, @Param("status") String status);

    // Find bids by route ID with optional status filtering
    @Query(value = "SELECT * FROM bids WHERE route_id = :routeId" +
            " AND (:status IS NULL OR status = CAST(:status AS bid_status)) ORDER BY created_at DESC", nativeQuery = true)
    List<Bid> findByRouteIdAndStatus(@Param("routeId") UUID routeId, @Param("status") String status);

    // Find bids by route ID using JPA query to handle enum properly
    @Query("SELECT b FROM Bid b WHERE b.route.id = :routeId " +
            "AND (:status IS NULL OR b.status = :status) ORDER BY b.createdAt DESC")
    List<Bid> findByRouteIdAndStatusJpa(@Param("routeId") UUID routeId, @Param("status") com.example.be.types.BidStatus status);

    // Find bids by route ID using native SQL with proper enum casting
    @Query(value = "SELECT * FROM bids WHERE route_id = :routeId " +
            "AND (:status IS NULL OR status = CAST(:status AS bid_status)) ORDER BY created_at DESC", nativeQuery = true)
    List<Bid> findByRouteIdAndStatusNative(@Param("routeId") UUID routeId, @Param("status") String status);

    // Delete bid with cascade - deletes all related entities in one query
    @Modifying
    @Query(value = "DELETE FROM payments WHERE bid_id = :bidId; " +
            "DELETE FROM earnings WHERE bid_id = :bidId; " +
            "DELETE FROM conversations WHERE bid_id = :bidId; " +
            "DELETE FROM delivery_tracking WHERE bid_id = :bidId; " +
            "DELETE FROM disputes WHERE parcel_request_id = (SELECT request_id FROM bids WHERE id = :bidId); " +
            "DELETE FROM bids WHERE id = :bidId;", nativeQuery = true)
    void deleteBidWithCascade(@Param("bidId") UUID bidId);
    
    /**
     * Find bids by route ID and status for bid closing service
     */
    List<Bid> findByRouteIdAndStatus(UUID routeId, com.example.be.types.BidStatus status);
    
    /**
     * Find bids by request ID
     */
    List<Bid> findByRequestId(UUID requestId);
}
