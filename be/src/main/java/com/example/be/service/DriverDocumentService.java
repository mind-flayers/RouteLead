package com.example.be.service;

import com.example.be.dto.DriverDocumentDTO;
import com.example.be.model.DriverDocument;
import com.example.be.model.Profile;
import com.example.be.repository.DriverDocumentRepository;
import com.example.be.repository.ProfileRepository;
import com.example.be.types.DocumentTypeEnum;
import com.example.be.types.VerificationStatusEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
public class DriverDocumentService {

    private static final Logger log = LoggerFactory.getLogger(DriverDocumentService.class);

    private final DriverDocumentRepository driverDocumentRepository;
    private final ProfileRepository profileRepository;

    @Autowired
    public DriverDocumentService(DriverDocumentRepository driverDocumentRepository, 
                                ProfileRepository profileRepository) {
        this.driverDocumentRepository = driverDocumentRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Upload a new document for a driver
     */
    @Transactional
    public DriverDocument uploadDocument(UUID driverId, DocumentTypeEnum documentType, 
                                       String documentUrl, LocalDate expiryDate) {
        log.info("Uploading document for driver: {}, type: {}", driverId, documentType);

        Profile driver = profileRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + driverId));

        // Check if document already exists for this type
        DriverDocument existingDoc = driverDocumentRepository
                .findByDriverIdAndDocumentType(driverId, documentType.name());

        DriverDocument document;
        if (existingDoc != null) {
            // Update existing document
            log.info("Updating existing document: {}", existingDoc.getId());
            existingDoc.setDocumentUrl(documentUrl);
            existingDoc.setExpiryDate(expiryDate);
            existingDoc.setVerificationStatus(VerificationStatusEnum.PENDING);
            existingDoc.setVerifiedBy(null);
            existingDoc.setVerifiedAt(null);
            document = driverDocumentRepository.save(existingDoc);
        } else {
            // Create new document
            document = new DriverDocument();
            document.setDriver(driver);
            document.setDocumentType(documentType);
            document.setDocumentUrl(documentUrl);
            document.setExpiryDate(expiryDate);
            document.setVerificationStatus(VerificationStatusEnum.PENDING);
            document = driverDocumentRepository.save(document);
        }

        log.info("Document uploaded successfully with ID: {}", document.getId());
        return document;
    }

    /**
     * Get all documents for a specific driver
     */
    @Transactional(readOnly = true)
    public List<DriverDocument> getDriverDocuments(UUID driverId) {
        log.info("Fetching documents for driver: {}", driverId);
        return driverDocumentRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    /**
     * Get documents by driver ID and document type
     */
    @Transactional(readOnly = true)
    public DriverDocument getDriverDocument(UUID driverId, DocumentTypeEnum documentType) {
        return driverDocumentRepository.findByDriverIdAndDocumentType(driverId, documentType.name());
    }

    /**
     * Update verification status of a document (Admin action)
     */
    @Transactional
    public DriverDocument updateVerificationStatus(UUID documentId, VerificationStatusEnum status, 
                                                  UUID verifiedBy, String rejectionReason) {
        log.info("Updating verification status for document: {} to status: {}", documentId, status);

        DriverDocument document = driverDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        Profile verifier = null;
        if (verifiedBy != null) {
            verifier = profileRepository.findById(verifiedBy)
                    .orElseThrow(() -> new RuntimeException("Verifier not found with ID: " + verifiedBy));
        }

        document.setVerificationStatus(status);
        document.setVerifiedBy(verifier);
        document.setVerifiedAt(ZonedDateTime.now());

        DriverDocument savedDocument = driverDocumentRepository.save(document);

        // Check if all documents are verified and update driver verification status
        updateDriverVerificationStatus(document.getDriver().getId());

        log.info("Document verification status updated successfully");
        return savedDocument;
    }

    /**
     * Delete a document
     */
    @Transactional
    public void deleteDocument(UUID documentId, UUID driverId) {
        log.info("Deleting document: {} for driver: {}", documentId, driverId);

        DriverDocument document = driverDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        // Verify the document belongs to the driver
        if (!document.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Document does not belong to the specified driver");
        }

        driverDocumentRepository.delete(document);
        log.info("Document deleted successfully");
    }

    /**
     * Check if driver has completed all required document uploads
     */
    @Transactional(readOnly = true)
    public boolean isDocumentUploadComplete(UUID driverId) {
        log.info("Checking document upload completeness for driver: {}", driverId);

        List<DriverDocument> documents = getDriverDocuments(driverId);
        
        // Required document types for verification
        List<DocumentTypeEnum> requiredTypes = List.of(
                DocumentTypeEnum.FACE_PHOTO,
                DocumentTypeEnum.DRIVERS_LICENSE,
                DocumentTypeEnum.NATIONAL_ID,
                DocumentTypeEnum.VEHICLE_REGISTRATION,
                DocumentTypeEnum.INSURANCE
        );

        Map<DocumentTypeEnum, DriverDocument> documentMap = documents.stream()
                .collect(Collectors.toMap(
                        doc -> doc.getDocumentType(),
                        doc -> doc,
                        (existing, replacement) -> existing // Keep first one if duplicates
                ));

        // Check if all required documents are uploaded
        for (DocumentTypeEnum requiredType : requiredTypes) {
            if (!documentMap.containsKey(requiredType)) {
                log.info("Missing required document type: {}", requiredType);
                return false;
            }
        }

        log.info("All required documents are uploaded for driver: {}", driverId);
        return true;
    }

    /**
     * Check if all driver documents are verified
     */
    @Transactional(readOnly = true)
    public boolean areAllDocumentsVerified(UUID driverId) {
        log.info("Checking if all documents are verified for driver: {}", driverId);

        List<DriverDocument> documents = getDriverDocuments(driverId);
        
        if (documents.isEmpty()) {
            return false;
        }

        boolean allVerified = documents.stream()
                .allMatch(doc -> doc.getVerificationStatus() == VerificationStatusEnum.APPROVED);

        log.info("All documents verified status for driver {}: {}", driverId, allVerified);
        return allVerified;
    }

    /**
     * Get document verification status summary for a driver
     */
    @Transactional(readOnly = true)
    public Map<DocumentTypeEnum, VerificationStatusEnum> getDocumentVerificationSummary(UUID driverId) {
        log.info("Getting document verification summary for driver: {}", driverId);

        List<DriverDocument> documents = getDriverDocuments(driverId);
        
        return documents.stream()
                .collect(Collectors.toMap(
                        doc -> doc.getDocumentType(),
                        doc -> doc.getVerificationStatus(),
                        (existing, replacement) -> existing // Keep first one if duplicates
                ));
    }

    /**
     * Update driver's overall verification status based on document status
     */
    @Transactional
    public void updateDriverVerificationStatus(UUID driverId) {
        log.info("Updating driver verification status for: {}", driverId);

        Profile driver = profileRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + driverId));

        if (areAllDocumentsVerified(driverId)) {
            driver.setIsVerified(true);
            driver.setVerificationStatus(VerificationStatusEnum.APPROVED);
            log.info("Driver {} is now fully verified", driverId);
        } else if (isDocumentUploadComplete(driverId)) {
            driver.setIsVerified(false);
            driver.setVerificationStatus(VerificationStatusEnum.PENDING);
            log.info("Driver {} verification is pending", driverId);
        } else {
            driver.setIsVerified(false);
            driver.setVerificationStatus(null);
            log.info("Driver {} verification is incomplete", driverId);
        }

        profileRepository.save(driver);
    }

    /**
     * Get list of missing required documents for a driver
     */
    @Transactional(readOnly = true)
    public List<DocumentTypeEnum> getMissingRequiredDocuments(UUID driverId) {
        log.info("Getting missing required documents for driver: {}", driverId);

        List<DriverDocument> documents = getDriverDocuments(driverId);
        
        List<DocumentTypeEnum> requiredTypes = List.of(
                DocumentTypeEnum.FACE_PHOTO,
                DocumentTypeEnum.DRIVERS_LICENSE,
                DocumentTypeEnum.NATIONAL_ID,
                DocumentTypeEnum.VEHICLE_REGISTRATION,
                DocumentTypeEnum.INSURANCE
        );

        Map<DocumentTypeEnum, DriverDocument> documentMap = documents.stream()
                .collect(Collectors.toMap(
                        doc -> doc.getDocumentType(),
                        doc -> doc,
                        (existing, replacement) -> existing
                ));

        return requiredTypes.stream()
                .filter(type -> !documentMap.containsKey(type))
                .collect(Collectors.toList());
    }

    /**
     * Save document from Supabase Storage and return DTO to avoid circular references
     */
    @Transactional
    public DriverDocumentDTO saveDocumentFromSupabaseAsDTO(UUID driverId, DocumentTypeEnum documentType, 
                                                          String documentUrl, String filePath, String expiryDate) {
        log.info("Saving document from Supabase for driver: {}, type: {}", driverId, documentType);

        // Verify driver exists
        if (!profileRepository.existsById(driverId)) {
            throw new RuntimeException("Driver not found with ID: " + driverId);
        }

        String documentTypeStr = documentType.name();
        String verificationStatusStr = VerificationStatusEnum.PENDING.name();
        
        // Check if document already exists for this type and update it
        DriverDocument existingDoc = driverDocumentRepository
                .findByDriverIdAndDocumentType(driverId, documentTypeStr);

        if (existingDoc != null) {
            // Update existing document using native SQL
            log.info("Updating existing document for driver: {}, type: {}", driverId, documentTypeStr);
            driverDocumentRepository.updateDocument(
                driverId, 
                documentTypeStr, 
                documentUrl, 
                verificationStatusStr,
                expiryDate
            );
            
            log.info("Document updated successfully");
            
        } else {
            // Create new document using native SQL
            UUID newDocumentId = UUID.randomUUID();
            log.info("Creating new document for driver: {}, type: {}", driverId, documentTypeStr);
            
            driverDocumentRepository.insertDocument(
                newDocumentId,
                driverId,
                documentTypeStr,
                documentUrl,
                verificationStatusStr
            );
            
            // If expiry date provided, update it separately
            if (expiryDate != null && !expiryDate.trim().isEmpty()) {
                try {
                    driverDocumentRepository.updateDocument(
                        driverId, 
                        documentTypeStr, 
                        documentUrl, 
                        verificationStatusStr,
                        expiryDate
                    );
                } catch (Exception e) {
                    log.warn("Invalid expiry date format: {}", expiryDate);
                }
            }
            
            log.info("Document created successfully");
        }
        
        // Create and return DTO directly to avoid circular reference issues
        DriverDocumentDTO dto = new DriverDocumentDTO();
        dto.setDriverId(driverId);
        dto.setDocumentType(documentTypeStr);
        dto.setDocumentUrl(documentUrl);
        dto.setVerificationStatus(verificationStatusStr);
        // Note: We're not setting createdAt as it requires fetching from DB
        
        return dto;
    }
}
