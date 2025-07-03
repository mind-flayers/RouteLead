package com.example.be.repository;

import com.example.be.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BidRepository extends JpaRepository<Bid, UUID> {
    @Modifying
    @Query(value = "UPDATE bids SET status = CAST(:status AS bid_status), updated_at = NOW() WHERE id = :bidId", nativeQuery = true)
    void updateBidStatus(@Param("bidId") UUID bidId, @Param("status") String status);

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
}
