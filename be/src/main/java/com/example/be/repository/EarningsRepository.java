package com.example.be.repository;

import com.example.be.model.Earnings;
import com.example.be.types.EarningsStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EarningsRepository extends JpaRepository<Earnings, UUID> {
    
    // Get all earnings for a specific driver
    List<Earnings> findByDriverIdOrderByEarnedAtDesc(UUID driverId);
    
    // Get earnings by driver and status
    List<Earnings> findByDriverIdAndStatusOrderByEarnedAtDesc(UUID driverId, EarningsStatusEnum status);
    
    // Get today's earnings for a driver
    @Query(value = "SELECT * FROM earnings WHERE driver_id = :driverId AND DATE(earned_at) = CURRENT_DATE ORDER BY earned_at DESC", nativeQuery = true)
    List<Earnings> findTodayEarningsByDriverId(@Param("driverId") UUID driverId);
    
    // Get earnings within date range
    @Query(value = "SELECT * FROM earnings WHERE driver_id = :driverId AND earned_at BETWEEN :startDate AND :endDate ORDER BY earned_at DESC", nativeQuery = true)
    List<Earnings> findEarningsInDateRange(@Param("driverId") UUID driverId, 
                                          @Param("startDate") ZonedDateTime startDate, 
                                          @Param("endDate") ZonedDateTime endDate);
    
    // Get total earnings by driver and status
    @Query(value = "SELECT COALESCE(SUM(net_amount), 0) FROM earnings WHERE driver_id = :driverId AND status = CAST(:status AS earnings_status_enum)", nativeQuery = true)
    BigDecimal getTotalEarningsByDriverAndStatus(@Param("driverId") UUID driverId, @Param("status" ) String status);
    
    // Get total today's earnings
    @Query(value = "SELECT COALESCE(SUM(net_amount), 0) FROM earnings WHERE driver_id = :driverId AND DATE(earned_at) = CURRENT_DATE", nativeQuery = true)
    BigDecimal getTodayTotalEarnings(@Param("driverId") UUID driverId);
    
    // Get weekly earnings (last 7 days)
    @Query(value = "SELECT COALESCE(SUM(net_amount), 0) FROM earnings WHERE driver_id = :driverId AND earned_at >= :weekAgo", nativeQuery = true)
    BigDecimal getWeeklyEarnings(@Param("driverId") UUID driverId, @Param("weekAgo") ZonedDateTime weekAgo);
    
    // Get monthly earnings count
    @Query(value = "SELECT COUNT(*) FROM earnings WHERE driver_id = :driverId AND earned_at >= :monthAgo", nativeQuery = true)
    Long getMonthlyEarningsCount(@Param("driverId") UUID driverId, @Param("monthAgo") ZonedDateTime monthAgo);
    
    // Get available balance (AVAILABLE status)
    @Query(value = "SELECT COALESCE(SUM(net_amount), 0) FROM earnings WHERE driver_id = :driverId AND status = 'AVAILABLE'", nativeQuery = true)
    BigDecimal getAvailableBalance(@Param("driverId") UUID driverId);
    
    // Get earnings with detailed information using native SQL
    @Query(value = "SELECT e.id, e.driver_id, e.bid_id, e.gross_amount, e.app_fee, e.net_amount, e.status, e.earned_at, " +
           "b.route_id, b.offered_price, " +
           "pr.description as parcel_description, " +
           "p.first_name, p.last_name, " +
           "pr.pickup_lat, pr.pickup_lng, pr.dropoff_lat, pr.dropoff_lng " +
           "FROM earnings e " +
           "LEFT JOIN bids b ON e.bid_id = b.id " +
           "LEFT JOIN parcel_requests pr ON b.request_id = pr.id " +
           "LEFT JOIN profiles p ON pr.customer_id = p.id " +
           "LEFT JOIN return_routes rr ON b.route_id = rr.id " +
           "WHERE e.driver_id = :driverId " +
           "ORDER BY e.earned_at DESC", nativeQuery = true)
    List<Object[]> findDetailedEarningsByDriverIdNative(@Param("driverId") UUID driverId);
    
    // Get earnings with detailed information filtered by status using native SQL
    @Query(value = "SELECT e.id, e.driver_id, e.bid_id, e.gross_amount, e.app_fee, e.net_amount, e.status, e.earned_at, " +
           "b.route_id, b.offered_price, " +
           "pr.description as parcel_description, " +
           "p.first_name, p.last_name, " +
           "pr.pickup_lat, pr.pickup_lng, pr.dropoff_lat, pr.dropoff_lng " +
           "FROM earnings e " +
           "LEFT JOIN bids b ON e.bid_id = b.id " +
           "LEFT JOIN parcel_requests pr ON b.request_id = pr.id " +
           "LEFT JOIN profiles p ON pr.customer_id = p.id " +
           "LEFT JOIN return_routes rr ON b.route_id = rr.id " +
           "WHERE e.driver_id = :driverId AND e.status = CAST(:status AS earnings_status_enum) " +
           "ORDER BY e.earned_at DESC", nativeQuery = true)
    List<Object[]> findDetailedEarningsByDriverIdAndStatus(@Param("driverId") UUID driverId, @Param("status") String status);
    
    // Get earnings by bid ID using native SQL
    @Query(value = "SELECT e.id, e.driver_id, e.bid_id, e.gross_amount, e.app_fee, e.net_amount, e.status, e.earned_at, " +
           "b.route_id, b.offered_price, " +
           "pr.description as parcel_description, " +
           "p.first_name, p.last_name, " +
           "pr.pickup_lat, pr.pickup_lng, pr.dropoff_lat, pr.dropoff_lng " +
           "FROM earnings e " +
           "LEFT JOIN bids b ON e.bid_id = b.id " +
           "LEFT JOIN parcel_requests pr ON b.request_id = pr.id " +
           "LEFT JOIN profiles p ON pr.customer_id = p.id " +
           "LEFT JOIN return_routes rr ON b.route_id = rr.id " +
           "WHERE e.bid_id = :bidId", nativeQuery = true)
    List<Object[]> findEarningsByBidIdNative(@Param("bidId") UUID bidId);
    
    // Insert earnings using native SQL to handle PostgreSQL enum properly
    @Modifying
    @Query(value = "INSERT INTO earnings (id, driver_id, bid_id, gross_amount, app_fee, net_amount, status, earned_at) " +
           "VALUES (:id, :driverId, :bidId, :grossAmount, :appFee, :netAmount, CAST(:status AS earnings_status_enum), :earnedAt)", nativeQuery = true)
    void insertEarnings(@Param("id") UUID id,
                       @Param("driverId") UUID driverId,
                       @Param("bidId") UUID bidId,
                       @Param("grossAmount") BigDecimal grossAmount,
                       @Param("appFee") BigDecimal appFee,
                       @Param("netAmount") BigDecimal netAmount,
                       @Param("status") String status,
                       @Param("earnedAt") ZonedDateTime earnedAt);
    
    // Native update for status to handle PostgreSQL enum properly
    @Modifying
    @Query(value = "UPDATE earnings SET status = CAST(:status AS earnings_status_enum) WHERE id = :id", nativeQuery = true)
    void updateEarningsStatus(@Param("id") UUID id, @Param("status") String status);
}
