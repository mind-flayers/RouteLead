package com.example.be.repository;

import com.example.be.model.DeliveryTracking;
import com.example.be.types.DeliveryStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, UUID> {
    
    /**
     * Find delivery tracking by bid ID
     */
    Optional<DeliveryTracking> findByBidId(UUID bidId);
    
    /**
     * Find all deliveries with status not in the given list
     */
    List<DeliveryTracking> findByStatusNotIn(List<DeliveryStatusEnum> statuses);
    
    /**
     * Find deliveries by status
     */
    List<DeliveryTracking> findByStatus(DeliveryStatusEnum status);
    
    /**
     * Find active deliveries for a specific driver
     */
    @Query("SELECT dt FROM DeliveryTracking dt " +
           "JOIN dt.bid b " +
           "JOIN b.route r " +
           "WHERE r.driver.id = :driverId " +
           "AND dt.status NOT IN ('DELIVERED') " +
           "ORDER BY dt.createdAt DESC")
    List<DeliveryTracking> findActiveDeliveriesByDriverId(@Param("driverId") UUID driverId);
    
    /**
     * Find completed deliveries for a specific driver
     */
    @Query("SELECT dt FROM DeliveryTracking dt " +
           "JOIN dt.bid b " +
           "JOIN b.route r " +
           "WHERE r.driver.id = :driverId " +
           "AND dt.status = 'DELIVERED' " +
           "ORDER BY dt.actualDeliveryTime DESC")
    List<DeliveryTracking> findCompletedDeliveriesByDriverId(@Param("driverId") UUID driverId);
}
