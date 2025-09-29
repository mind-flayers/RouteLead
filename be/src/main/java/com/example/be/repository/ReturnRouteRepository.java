package com.example.be.repository;

import com.example.be.model.ReturnRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReturnRouteRepository extends JpaRepository<ReturnRoute, UUID> {
    
    /**
     * Find all routes by driver ID
     */
    List<ReturnRoute> findByDriverId(UUID driverId);
    
    /**
     * Find routes by status
     */
    List<ReturnRoute> findByStatus(com.example.be.types.RouteStatus status);
    
    /**
     * Find routes by driver ID and status
     */
    List<ReturnRoute> findByDriverIdAndStatus(UUID driverId, com.example.be.types.RouteStatus status);

    /**
     * Find routes by driver ID and status using native query
     */
    @Query(value = "SELECT * FROM return_routes WHERE driver_id = :driverId AND status = CAST(:status AS route_status)", nativeQuery = true)
    List<ReturnRoute> findByDriverIdAndStatusNative(@Param("driverId") UUID driverId, @Param("status") String status);

    @Modifying
    @Query(value = """
        INSERT INTO return_routes (
            driver_id, origin_lat, origin_lng, destination_lat, destination_lng,
            departure_time, detour_tolerance_km, suggested_price_min, suggested_price_max,
            status, created_at, updated_at
        ) VALUES (
            :driverId, :originLat, :originLng, :destinationLat, :destinationLng,
            :departureTime, :detourToleranceKm, :suggestedPriceMin, :suggestedPriceMax,
            CAST(:status AS route_status), :createdAt, :updatedAt
        )
        """, nativeQuery = true)
    void insertRouteWithEnum(
        @Param("driverId") UUID driverId,
        @Param("originLat") java.math.BigDecimal originLat,
        @Param("originLng") java.math.BigDecimal originLng,
        @Param("destinationLat") java.math.BigDecimal destinationLat,
        @Param("destinationLng") java.math.BigDecimal destinationLng,
        @Param("departureTime") java.time.ZonedDateTime departureTime,
        @Param("detourToleranceKm") java.math.BigDecimal detourToleranceKm,
        @Param("suggestedPriceMin") java.math.BigDecimal suggestedPriceMin,
        @Param("suggestedPriceMax") java.math.BigDecimal suggestedPriceMax,
        @Param("status") String status,
        @Param("createdAt") java.time.ZonedDateTime createdAt,
        @Param("updatedAt") java.time.ZonedDateTime updatedAt
    );

    @Modifying
    @Query(value = """
        INSERT INTO return_routes (
            id, driver_id, origin_lat, origin_lng, destination_lat, destination_lng,
            departure_time, detour_tolerance_km, suggested_price_min, suggested_price_max,
            status, created_at, updated_at, bidding_start, estimated_duration_minutes,
            route_polyline, total_distance_km
        ) VALUES (
            :id, :driverId, :originLat, :originLng, :destinationLat, :destinationLng,
            :departureTime, :detourToleranceKm, :suggestedPriceMin, :suggestedPriceMax,
            CAST(:status AS route_status), :createdAt, :updatedAt, :biddingStart,
            :estimatedDurationMinutes, :routePolyline, :totalDistanceKm
        )
        """, nativeQuery = true)
    void insertRouteWithAllFields(
        @Param("id") UUID id,
        @Param("driverId") UUID driverId,
        @Param("originLat") java.math.BigDecimal originLat,
        @Param("originLng") java.math.BigDecimal originLng,
        @Param("destinationLat") java.math.BigDecimal destinationLat,
        @Param("destinationLng") java.math.BigDecimal destinationLng,
        @Param("departureTime") java.time.ZonedDateTime departureTime,
        @Param("detourToleranceKm") java.math.BigDecimal detourToleranceKm,
        @Param("suggestedPriceMin") java.math.BigDecimal suggestedPriceMin,
        @Param("suggestedPriceMax") java.math.BigDecimal suggestedPriceMax,
        @Param("status") String status,
        @Param("createdAt") java.time.ZonedDateTime createdAt,
        @Param("updatedAt") java.time.ZonedDateTime updatedAt,
        @Param("biddingStart") java.time.ZonedDateTime biddingStart,
        @Param("estimatedDurationMinutes") Integer estimatedDurationMinutes,
        @Param("routePolyline") String routePolyline,
        @Param("totalDistanceKm") java.math.BigDecimal totalDistanceKm
    );

    @Modifying
    @Query(value = """
        UPDATE return_routes SET
            origin_lat = COALESCE(:originLat, origin_lat),
            origin_lng = COALESCE(:originLng, origin_lng),
            destination_lat = COALESCE(:destinationLat, destination_lat),
            destination_lng = COALESCE(:destinationLng, destination_lng),
            departure_time = COALESCE(:departureTime, departure_time),
            detour_tolerance_km = COALESCE(:detourToleranceKm, detour_tolerance_km),
            suggested_price_min = COALESCE(:suggestedPriceMin, suggested_price_min),
            suggested_price_max = COALESCE(:suggestedPriceMax, suggested_price_max),
            status = COALESCE(CAST(:status AS route_status), status),
            updated_at = :updatedAt
        WHERE id = :routeId AND driver_id = :driverId
        """, nativeQuery = true)
    int updateRoutePartially(
        @Param("routeId") UUID routeId,
        @Param("driverId") UUID driverId,
        @Param("originLat") java.math.BigDecimal originLat,
        @Param("originLng") java.math.BigDecimal originLng,
        @Param("destinationLat") java.math.BigDecimal destinationLat,
        @Param("destinationLng") java.math.BigDecimal destinationLng,
        @Param("departureTime") java.time.ZonedDateTime departureTime,
        @Param("detourToleranceKm") java.math.BigDecimal detourToleranceKm,
        @Param("suggestedPriceMin") java.math.BigDecimal suggestedPriceMin,
        @Param("suggestedPriceMax") java.math.BigDecimal suggestedPriceMax,
        @Param("status") String status,
        @Param("updatedAt") java.time.ZonedDateTime updatedAt
    );

    @Query(value = "SELECT * FROM return_routes WHERE id = :routeId AND driver_id = :driverId", nativeQuery = true)
    java.util.Optional<ReturnRoute> findByIdAndDriverId(@Param("routeId") UUID routeId, @Param("driverId") UUID driverId);


    /**
     * Find routes where bidding should end automatically (departure_time - 2 hours <= cutoff time)
     * and status is still OPEN (not yet processed)
     */
    @Query(value = """
        SELECT * FROM return_routes 
        WHERE status = 'OPEN' 
        AND departure_time <= :biddingCutoffTime 
        AND bidding_start <= NOW()
        ORDER BY departure_time ASC
        """, nativeQuery = true)
    List<ReturnRoute> findRoutesForAutomaticBidding(@Param("biddingCutoffTime") java.time.LocalDateTime biddingCutoffTime);

    
    /**
     * Find routes where bidding should be closed (departure time is within 3 hours)
     */
    @Query(value = "SELECT * FROM return_routes WHERE departure_time <= :closingTime AND status = 'INITIATED'", nativeQuery = true)
    List<ReturnRoute> findRoutesForBidClosing(@Param("closingTime") ZonedDateTime closingTime);

}