package com.example.be.repository;

import com.example.be.model.DriverDocument;
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
    
    // Find document by driver ID and document type (using native SQL to handle enum comparison)
    @Query(value = "SELECT * FROM driver_documents WHERE driver_id = :driverId AND document_type = CAST(:documentType AS document_type_enum)", nativeQuery = true)
    DriverDocument findByDriverIdAndDocumentType(@Param("driverId") UUID driverId, @Param("documentType") String documentType);
    
    // Get document data as DTO to avoid circular references
    @Query(value = """
        SELECT 
            id,
            driver_id as driverId,
            document_type as documentType,
            document_url as documentUrl,
            verification_status as verificationStatus,
            verified_by as verifiedBy,
            verified_at as verifiedAt,
            expiry_date as expiryDate,
            created_at as createdAt
        FROM driver_documents 
        WHERE driver_id = :driverId AND document_type = CAST(:documentType AS document_type_enum)
        """, nativeQuery = true)
    Object[] findDocumentDataByDriverIdAndType(@Param("driverId") UUID driverId, @Param("documentType") String documentType);
    
    // Find documents by verification status (using native SQL to handle enum comparison)
    @Query(value = "SELECT * FROM driver_documents WHERE verification_status = CAST(:verificationStatus AS verification_status_enum)", nativeQuery = true)
    List<DriverDocument> findByVerificationStatus(@Param("verificationStatus") String verificationStatus);
    
    // Find documents by driver ID and verification status (using native SQL to handle enum comparison)
    @Query(value = "SELECT * FROM driver_documents WHERE driver_id = :driverId AND verification_status = CAST(:verificationStatus AS verification_status_enum)", nativeQuery = true)
    List<DriverDocument> findByDriverIdAndVerificationStatus(@Param("driverId") UUID driverId, @Param("verificationStatus") String verificationStatus);
    
    // Find documents by document type (using native SQL to handle enum comparison)
    @Query(value = "SELECT * FROM driver_documents WHERE document_type = CAST(:documentType AS document_type_enum)", nativeQuery = true)
    List<DriverDocument> findByDocumentType(@Param("documentType") String documentType);
    
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
    @Query(value = "SELECT EXISTS(SELECT 1 FROM driver_documents WHERE driver_id = :driverId AND document_type = CAST(:documentType AS document_type_enum))", nativeQuery = true)
    boolean existsByDriverIdAndDocumentType(@Param("driverId") UUID driverId, @Param("documentType") String documentType);
    
    // Insert new document using native SQL to handle enums properly
    @Modifying
    @Query(value = """
        INSERT INTO driver_documents (id, driver_id, document_type, document_url, verification_status, created_at)
        VALUES (:id, :driverId, CAST(:documentType AS document_type_enum), :documentUrl, CAST(:verificationStatus AS verification_status_enum), CURRENT_TIMESTAMP)
        """, nativeQuery = true)
    void insertDocument(@Param("id") UUID id, @Param("driverId") UUID driverId, 
                       @Param("documentType") String documentType, @Param("documentUrl") String documentUrl,
                       @Param("verificationStatus") String verificationStatus);
    
    // Update existing document using native SQL to handle enums properly
    @Modifying
    @Query(value = """
        UPDATE driver_documents 
        SET document_url = :documentUrl, 
            verification_status = CAST(:verificationStatus AS verification_status_enum),
            verified_by = NULL,
            verified_at = NULL,
            expiry_date = CAST(:expiryDate AS DATE)
        WHERE driver_id = :driverId AND document_type = CAST(:documentType AS document_type_enum)
        """, nativeQuery = true)
    void updateDocument(@Param("driverId") UUID driverId, @Param("documentType") String documentType,
                       @Param("documentUrl") String documentUrl, @Param("verificationStatus") String verificationStatus,
                       @Param("expiryDate") String expiryDate);
}
