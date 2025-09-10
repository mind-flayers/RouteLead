package com.example.be.repository;

import com.example.be.model.DeliveryTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, UUID> {
    
    /**
     * Find delivery tracking by bid ID using native SQL
     */
    @Query(value = "SELECT * FROM delivery_tracking WHERE bid_id = :bidId", nativeQuery = true)
    Optional<DeliveryTracking> findByBidId(@Param("bidId") UUID bidId);
    
    /**
     * Count delivery tracking records by bid ID
     */
    @Query(value = "SELECT COUNT(*) FROM delivery_tracking WHERE bid_id = :bidId", nativeQuery = true)
    long countByBidId(@Param("bidId") UUID bidId);
    
    /**
     * Find deliveries by status using native SQL
     */
    @Query(value = "SELECT * FROM delivery_tracking WHERE status = CAST(:status AS delivery_status_enum)", nativeQuery = true)
    List<DeliveryTracking> findByStatus(@Param("status") String status);
    
    /**
     * Find active deliveries for a specific driver using native SQL
     */
    @Query(value = """
        SELECT dt.* FROM delivery_tracking dt 
        JOIN bids b ON dt.bid_id = b.id 
        JOIN return_routes r ON b.route_id = r.id 
        WHERE r.driver_id = :driverId 
        AND dt.status != CAST('delivered' AS delivery_status_enum)
        ORDER BY dt.created_at DESC
        """, nativeQuery = true)
    List<DeliveryTracking> findActiveDeliveriesByDriverId(@Param("driverId") UUID driverId);
    
    /**
     * Find completed deliveries for a specific driver using native SQL
     */
    @Query(value = """
        SELECT dt.* FROM delivery_tracking dt 
        JOIN bids b ON dt.bid_id = b.id 
        JOIN return_routes r ON b.route_id = r.id 
        WHERE r.driver_id = :driverId 
        AND dt.status = CAST('delivered' AS delivery_status_enum)
        ORDER BY dt.actual_delivery_time DESC
        """, nativeQuery = true)
    List<DeliveryTracking> findCompletedDeliveriesByDriverId(@Param("driverId") UUID driverId);
    
    /**
     * Create delivery tracking with open status using native SQL
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO delivery_tracking (id, bid_id, status, estimated_arrival, created_at) 
        VALUES (:id, :bidId, CAST('open' AS delivery_status_enum), :estimatedArrival, :createdAt)
        """, nativeQuery = true)
    void createDeliveryTrackingWithOpenStatus(
        @Param("id") UUID id,
        @Param("bidId") UUID bidId,
        @Param("estimatedArrival") ZonedDateTime estimatedArrival,
        @Param("createdAt") ZonedDateTime createdAt
    );
    
    /**
     * Update delivery status using native SQL
     */
    @Modifying
    @Transactional
    @Query(value = """
        UPDATE delivery_tracking 
        SET status = CAST(:status AS delivery_status_enum),
            actual_pickup_time = CASE WHEN :status = 'picked_up' AND actual_pickup_time IS NULL 
                                     THEN :currentTime ELSE actual_pickup_time END,
            actual_delivery_time = CASE WHEN :status = 'delivered' AND actual_delivery_time IS NULL 
                                       THEN :currentTime ELSE actual_delivery_time END
        WHERE id = :id
        """, nativeQuery = true)
    void updateDeliveryStatus(
        @Param("id") UUID id,
        @Param("status") String status,
        @Param("currentTime") ZonedDateTime currentTime
    );
}
