package com.example.be.repository;

import com.example.be.model.DriverDocument;
import com.example.be.types.DocumentTypeEnum;
import com.example.be.types.VerificationStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DriverDocumentRepository extends JpaRepository<DriverDocument, UUID> {
    
    // Find documents by driver ID
    List<DriverDocument> findByDriverIdOrderByCreatedAtDesc(UUID driverId);
    
    // Find document by driver ID and document type
    DriverDocument findByDriverIdAndDocumentType(UUID driverId, DocumentTypeEnum documentType);
    
    // Find documents by verification status
    List<DriverDocument> findByVerificationStatus(VerificationStatusEnum verificationStatus);
    
    // Find documents by driver ID and verification status
    List<DriverDocument> findByDriverIdAndVerificationStatus(UUID driverId, VerificationStatusEnum verificationStatus);
    
    // Find documents by document type
    List<DriverDocument> findByDocumentType(DocumentTypeEnum documentType);
    
    // Count documents by driver ID
    @Query(value = "SELECT COUNT(*) FROM driver_documents WHERE driver_id = :driverId", nativeQuery = true)
    long countByDriverId(@Param("driverId") UUID driverId);
    
    // Count verified documents by driver ID
    @Query(value = "SELECT COUNT(*) FROM driver_documents WHERE driver_id = :driverId AND verification_status = 'APPROVED'", nativeQuery = true)
    long countVerifiedDocumentsByDriverId(@Param("driverId") UUID driverId);
    
    // Check if driver has all required documents
    @Query(value = """
        SELECT COUNT(DISTINCT document_type) 
        FROM driver_documents 
        WHERE driver_id = :driverId 
        AND document_type IN ('FACE_PHOTO', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'VEHICLE_REGISTRATION', 'INSURANCE')
        """, nativeQuery = true)
    long countRequiredDocumentsByDriverId(@Param("driverId") UUID driverId);
    
    // Find documents that need verification (pending status)
    @Query(value = "SELECT * FROM driver_documents WHERE verification_status = 'PENDING' ORDER BY created_at ASC", nativeQuery = true)
    List<DriverDocument> findPendingVerificationDocuments();
    
    // Find documents expiring soon (using PostgreSQL interval syntax)
    @Query(value = """
        SELECT * FROM driver_documents 
        WHERE expiry_date IS NOT NULL 
        AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        ORDER BY expiry_date ASC
        """, nativeQuery = true)
    List<DriverDocument> findDocumentsExpiringSoon();
    
    // Delete documents by driver ID (for cleanup)
    @Modifying
    @Query(value = "DELETE FROM driver_documents WHERE driver_id = :driverId", nativeQuery = true)
    void deleteByDriverId(@Param("driverId") UUID driverId);
    
    // Check if document exists for driver and type
    @Query(value = "SELECT EXISTS(SELECT 1 FROM driver_documents WHERE driver_id = :driverId AND document_type = :documentType)", nativeQuery = true)
    boolean existsByDriverIdAndDocumentType(@Param("driverId") UUID driverId, @Param("documentType") String documentType);
}
