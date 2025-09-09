package com.example.be.controller;

import com.example.be.dto.DriverDocumentDTO;
import com.example.be.model.DriverDocument;
import com.example.be.service.DriverDocumentService;
import com.example.be.service.FileUploadService;
import com.example.be.types.DocumentTypeEnum;
import com.example.be.types.VerificationStatusEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);

    @Autowired
    private DriverDocumentService driverDocumentService;

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload a document for driver verification
     */
    @PostMapping("/{driverId}/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable UUID driverId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {
        
        try {
            // Validate document type
            DocumentTypeEnum docType;
            try {
                docType = DocumentTypeEnum.valueOf(documentType.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid document type. Valid types: DRIVERS_LICENSE, NATIONAL_ID, VEHICLE_REGISTRATION, INSURANCE, FACE_PHOTO");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file
            fileUploadService.validateFile(file);
            
            // Save file to Supabase Storage
            String filePath = fileUploadService.saveFileToSupabase(file, driverId, documentType);
            
            // Create document record (for most documents, expiry date is null)
            DriverDocument document = driverDocumentService.uploadDocument(
                driverId, docType, filePath, null
            );
            
            // Create upload response
            FileUploadService.FileUploadResponse uploadResponse = fileUploadService.createUploadResponse(
                filePath, file.getOriginalFilename(), file.getSize()
            );
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("document", document);
            responseData.put("upload", uploadResponse);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", responseData);
            response.put("message", "Document uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error uploading document for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all documents for a driver
     */
    @GetMapping("/{driverId}")
    public ResponseEntity<Map<String, Object>> getDriverDocuments(@PathVariable UUID driverId) {
        try {
            List<DriverDocument> documents = driverDocumentService.getDriverDocuments(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", documents);
            response.put("message", "Documents retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving documents for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get document by document type
     */
    @GetMapping("/{driverId}/{documentType}")
    public ResponseEntity<Map<String, Object>> getDocumentByType(
            @PathVariable UUID driverId,
            @PathVariable String documentType) {
        
        try {
            DocumentTypeEnum docType;
            try {
                docType = DocumentTypeEnum.valueOf(documentType.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid document type");
                return ResponseEntity.badRequest().body(response);
            }
            
            DriverDocument document = driverDocumentService.getDriverDocument(driverId, docType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", document);
            response.put("message", "Document retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving document for driver: {} type: {}", driverId, documentType, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Check document upload completeness
     */
    @GetMapping("/{driverId}/completeness")
    public ResponseEntity<Map<String, Object>> checkDocumentCompleteness(@PathVariable UUID driverId) {
        try {
            boolean isComplete = driverDocumentService.isDocumentUploadComplete(driverId);
            
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("isComplete", isComplete);
            statusData.put("requiredDocuments", List.of(
                "DRIVERS_LICENSE", "NATIONAL_ID", "VEHICLE_REGISTRATION", "INSURANCE", "FACE_PHOTO"
            ));
            
            if (!isComplete) {
                List<DocumentTypeEnum> missingTypes = driverDocumentService.getMissingRequiredDocuments(driverId);
                statusData.put("missingDocuments", missingTypes);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", statusData);
            response.put("message", "Document completeness checked successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error checking document completeness for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update document verification status (Admin only)
     */
    @PatchMapping("/{documentId}/verification")
    public ResponseEntity<Map<String, Object>> updateDocumentVerification(
            @PathVariable UUID documentId,
            @RequestParam String status,
            @RequestParam(required = false) UUID verifiedBy,
            @RequestParam(required = false) String rejectionReason) {
        
        try {
            VerificationStatusEnum verificationStatus;
            try {
                verificationStatus = VerificationStatusEnum.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid verification status. Valid values: PENDING, APPROVED, REJECTED");
                return ResponseEntity.badRequest().body(response);
            }
            
            DriverDocument updatedDocument = driverDocumentService.updateVerificationStatus(
                documentId, verificationStatus, verifiedBy, rejectionReason
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", updatedDocument);
            response.put("message", "Document verification status updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error updating document verification status: {}", documentId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete a document
     */
    @DeleteMapping("/{driverId}/documents/{documentId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(
            @PathVariable UUID driverId,
            @PathVariable UUID documentId) {
        try {
            driverDocumentService.deleteDocument(documentId, driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Document deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error deleting document: {}", documentId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get verification status overview for all documents
     */
    @GetMapping("/{driverId}/verification/overview")
    public ResponseEntity<Map<String, Object>> getVerificationOverview(@PathVariable UUID driverId) {
        try {
            boolean allVerified = driverDocumentService.areAllDocumentsVerified(driverId);
            boolean uploadComplete = driverDocumentService.isDocumentUploadComplete(driverId);
            List<DriverDocument> documents = driverDocumentService.getDriverDocuments(driverId);
            
            Map<String, Object> overview = new HashMap<>();
            overview.put("allDocumentsVerified", allVerified);
            overview.put("uploadComplete", uploadComplete);
            overview.put("totalDocuments", documents.size());
            overview.put("verifiedCount", documents.stream().mapToInt(doc -> 
                VerificationStatusEnum.APPROVED.equals(doc.getVerificationStatus()) ? 1 : 0).sum());
            overview.put("pendingCount", documents.stream().mapToInt(doc -> 
                VerificationStatusEnum.PENDING.equals(doc.getVerificationStatus()) ? 1 : 0).sum());
            overview.put("rejectedCount", documents.stream().mapToInt(doc -> 
                VerificationStatusEnum.REJECTED.equals(doc.getVerificationStatus()) ? 1 : 0).sum());
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", overview);
            response.put("message", "Verification overview retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error getting verification overview for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Save document URL from Supabase Storage (new method for Supabase integration)
     */
    @PostMapping("/{driverId}/save-url")
    public ResponseEntity<Map<String, Object>> saveDocumentUrl(
            @PathVariable UUID driverId,
            @RequestBody Map<String, Object> requestData) {
        
        try {
            String documentType = (String) requestData.get("documentType");
            String documentUrl = (String) requestData.get("documentUrl");
            String filePath = (String) requestData.get("filePath");
            String expiryDate = (String) requestData.get("expiryDate");
            
            // Validate document type
            DocumentTypeEnum docType;
            try {
                docType = DocumentTypeEnum.valueOf(documentType.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid document type");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Save document record with Supabase URL and get DTO directly
            DriverDocumentDTO documentDTO = driverDocumentService.saveDocumentFromSupabaseAsDTO(
                driverId, docType, documentUrl, filePath, expiryDate
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", documentDTO);
            response.put("message", "Document URL saved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error saving document URL for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all documents for a driver with additional metadata
     */
    @GetMapping("/{driverId}/all")
    public ResponseEntity<Map<String, Object>> getAllDriverDocuments(@PathVariable UUID driverId) {
        try {
            List<DriverDocument> documents = driverDocumentService.getDriverDocuments(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", documents);
            response.put("message", "All documents retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving all documents for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Convert DriverDocument entity to DTO to avoid circular reference issues
     */
    private DriverDocumentDTO convertToDTO(DriverDocument document) {
        DriverDocumentDTO dto = new DriverDocumentDTO();
        dto.setId(document.getId());
        dto.setDriverId(document.getDriver() != null ? document.getDriver().getId() : null);
        dto.setDocumentType(document.getDocumentType() != null ? document.getDocumentType().name() : null);
        dto.setDocumentUrl(document.getDocumentUrl());
        dto.setVerificationStatus(document.getVerificationStatus() != null ? document.getVerificationStatus().name() : null);
        dto.setVerifiedBy(document.getVerifiedBy() != null ? document.getVerifiedBy().getId() : null);
        dto.setVerifiedAt(document.getVerifiedAt());
        dto.setExpiryDate(document.getExpiryDate());
        dto.setCreatedAt(document.getCreatedAt());
        return dto;
    }
}
