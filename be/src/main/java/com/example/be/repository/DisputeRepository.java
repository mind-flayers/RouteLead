package com.example.be.repository;

import com.example.be.model.Dispute;
import com.example.be.types.DisputeStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    
    // Find disputes by user
    List<Dispute> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    // Find disputes by status
    List<Dispute> findByStatusOrderByCreatedAtDesc(DisputeStatusEnum status);
    
    // Find disputes by user and status
    List<Dispute> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, DisputeStatusEnum status);
    
    // Find disputes related to a specific bid
    List<Dispute> findByRelatedBidIdOrderByCreatedAtDesc(UUID bidId);
    
    // Find disputes related to a specific route
    List<Dispute> findByRelatedRouteIdOrderByCreatedAtDesc(UUID routeId);
    
    // Find open disputes
    List<Dispute> findByStatusAndResolvedAtIsNullOrderByCreatedAtDesc(DisputeStatusEnum status);
    
    // Update dispute status
    @Modifying
    @Query("UPDATE Dispute d SET d.status = :status, d.resolvedAt = :resolvedAt WHERE d.id = :disputeId")
    void updateDisputeStatus(@Param("disputeId") UUID disputeId, @Param("status") DisputeStatusEnum status, @Param("resolvedAt") ZonedDateTime resolvedAt);
    
    // Count disputes by status
    long countByStatus(DisputeStatusEnum status);
    
    // Count disputes by user and status
    long countByUserIdAndStatus(UUID userId, DisputeStatusEnum status);
} 