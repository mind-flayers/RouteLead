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
}
