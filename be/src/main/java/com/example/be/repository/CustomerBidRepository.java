package com.example.be.repository;

import com.example.be.model.Bid;
import com.example.be.types.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerBidRepository extends JpaRepository<Bid, UUID> {
    // Find by parcel_requestid (request_id)
    @Query(value = "SELECT * FROM bids WHERE request_id = :parcelRequestId" +
            " AND (:status IS NULL OR status = CAST(:status AS bid_status)) ORDER BY created_at DESC", nativeQuery = true)
    List<Bid> findByParcelRequestIdAndStatus(
            @Param("parcelRequestId") UUID parcelRequestId,
            @Param("status") String status
    );

    // Find by customerId (join parcel_requests)
    @Query(value = "SELECT b.* FROM bids b JOIN parcel_requests p ON b.request_id = p.id WHERE p.customer_id = :customerId" +
            " AND (:status IS NULL OR b.status = CAST(:status AS bid_status)) ORDER BY b.created_at DESC", nativeQuery = true)
    List<Bid> findByCustomerIdAndStatus(
            @Param("customerId") UUID customerId,
            @Param("status") String status
    );
}
