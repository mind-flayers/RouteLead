package com.example.be.repository;

import com.example.be.model.DriverLocationUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DriverLocationUpdateRepository extends JpaRepository<DriverLocationUpdate, UUID> {
    
    // Find all location updates for a specific delivery tracking
    List<DriverLocationUpdate> findByDeliveryTrackingIdOrderByRecordedAtDesc(UUID deliveryTrackingId);
    
    // Find location updates within a time range for a specific delivery tracking
    @Query("SELECT dlu FROM DriverLocationUpdate dlu WHERE dlu.deliveryTracking.id = :deliveryTrackingId AND dlu.recordedAt BETWEEN :startTime AND :endTime ORDER BY dlu.recordedAt DESC")
    List<DriverLocationUpdate> findByDeliveryTrackingIdAndTimeRange(
            @Param("deliveryTrackingId") UUID deliveryTrackingId,
            @Param("startTime") ZonedDateTime startTime,
            @Param("endTime") ZonedDateTime endTime
    );
    
    // Find the latest location update for a specific delivery tracking
    @Query("SELECT dlu FROM DriverLocationUpdate dlu WHERE dlu.deliveryTracking.id = :deliveryTrackingId ORDER BY dlu.recordedAt DESC")
    java.util.Optional<DriverLocationUpdate> findLatestByDeliveryTrackingId(@Param("deliveryTrackingId") UUID deliveryTrackingId);
    
    // Find all location updates recorded after a specific time
    List<DriverLocationUpdate> findByRecordedAtAfterOrderByRecordedAtDesc(ZonedDateTime recordedAt);
} 