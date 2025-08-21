package com.example.be.repository;

import com.example.be.model.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    
    // Find disputes by user
    List<Dispute> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    // Find disputes by parcel request
    List<Dispute> findByParcelRequestIdOrderByCreatedAtDesc(UUID parcelRequestId);
    
    // Find disputes by status
    List<Dispute> findByStatusOrderByCreatedAtDesc(com.example.be.types.DisputeStatusEnum status);
    
    // Check if user has already disputed this parcel request
    boolean existsByUserIdAndParcelRequestId(UUID userId, UUID parcelRequestId);
    
    // Count disputes by status
    @Query(value = "SELECT COUNT(*) FROM disputes WHERE status = :status", nativeQuery = true)
    Long countByStatus(@Param("status") String status);
} 