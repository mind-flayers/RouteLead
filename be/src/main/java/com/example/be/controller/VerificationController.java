package com.example.be.controller;

import com.example.be.model.DriverDocument;
import com.example.be.service.DriverDocumentService;
import com.example.be.service.ProfileService;
import com.example.be.types.VerificationStatusEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class VerificationController {

    private static final Logger log = LoggerFactory.getLogger(VerificationController.class);

    @Autowired
    private DriverDocumentService driverDocumentService;

    @Autowired
    private ProfileService profileService;

    /**
     * Submit verification documents for review
     */
    @PostMapping("/{driverId}/submit")
    public ResponseEntity<Map<String, Object>> submitForReview(@PathVariable UUID driverId) {
        try {
            // Check if all required documents are uploaded
            boolean isComplete = driverDocumentService.isDocumentUploadComplete(driverId);
            
            if (!isComplete) {
                List<String> missingTypes = driverDocumentService.getMissingRequiredDocuments(driverId)
                    .stream()
                    .map(Enum::name)
                    .toList();
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Please upload all required documents: " + String.join(", ", missingTypes));
                response.put("missingDocuments", missingTypes);
                
                return ResponseEntity.badRequest().body(response);
            }
            
            // Update profile verification status to PENDING
            profileService.updateVerificationStatus(driverId, VerificationStatusEnum.PENDING);
            
            // Update all document statuses to PENDING if they're not already set
            List<DriverDocument> documents = driverDocumentService.getDriverDocuments(driverId);
            for (DriverDocument doc : documents) {
                if (doc.getVerificationStatus() == null) {
                    driverDocumentService.updateVerificationStatus(
                        doc.getId(), 
                        VerificationStatusEnum.PENDING, 
                        null, 
                        null
                    );
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Documents submitted for review successfully!");
            response.put("verificationStatus", "PENDING");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error submitting verification for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to submit for review: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get verification status with documents
     */
    @GetMapping("/{driverId}/status-with-docs")
    public ResponseEntity<Map<String, Object>> getVerificationStatusWithDocs(@PathVariable UUID driverId) {
        try {
            // Get profile verification status
            Map<String, Object> profileData = profileService.getVerificationStatus(driverId);
            
            // Get all documents
            List<DriverDocument> documents = driverDocumentService.getDriverDocuments(driverId);
            
            // Determine if user can edit (can edit if PENDING or not verified)
            String verificationStatus = (String) profileData.get("verificationStatus");
            boolean canEdit = verificationStatus == null || 
                            "PENDING".equals(verificationStatus) || 
                            "REJECTED".equals(verificationStatus);
            
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("verificationStatus", verificationStatus);
            statusData.put("isVerified", profileData.get("isVerified"));
            statusData.put("personalInfoComplete", profileData.get("personalInfoComplete"));
            statusData.put("documents", documents);
            statusData.put("canEdit", canEdit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", statusData);
            response.put("message", "Verification status retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting verification status for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update verification status (Admin only)
     */
    @PutMapping("/{driverId}/update-status")
    public ResponseEntity<Map<String, Object>> updateVerificationStatus(
            @PathVariable UUID driverId,
            @RequestBody Map<String, Object> requestData) {
        
        try {
            String status = (String) requestData.get("status");
            String adminNotes = (String) requestData.get("adminNotes");
            
            // Validate status
            VerificationStatusEnum verificationStatus;
            try {
                verificationStatus = VerificationStatusEnum.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid verification status");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Update profile verification status
            profileService.updateVerificationStatus(driverId, verificationStatus);
            
            // If approved, mark profile as verified
            if (VerificationStatusEnum.APPROVED.equals(verificationStatus)) {
                profileService.setProfileVerified(driverId, true);
            } else if (VerificationStatusEnum.REJECTED.equals(verificationStatus)) {
                profileService.setProfileVerified(driverId, false);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Verification status updated successfully");
            response.put("verificationStatus", status);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating verification status for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get verification requirements and status
     */
    @GetMapping("/{driverId}/requirements")
    public ResponseEntity<Map<String, Object>> getVerificationRequirements(@PathVariable UUID driverId) {
        try {
            boolean isComplete = driverDocumentService.isDocumentUploadComplete(driverId);
            Map<String, Object> profileData = profileService.getVerificationStatus(driverId);
            
            Map<String, Object> requirements = new HashMap<>();
            requirements.put("personalInfoComplete", profileData.get("personalInfoComplete"));
            requirements.put("canStartVerification", profileData.get("personalInfoComplete"));
            requirements.put("isVerified", profileData.get("isVerified"));
            requirements.put("documentsComplete", isComplete);
            
            if (!isComplete) {
                List<String> missingTypes = driverDocumentService.getMissingRequiredDocuments(driverId)
                    .stream()
                    .map(Enum::name)
                    .toList();
                requirements.put("missingFields", missingTypes);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", requirements);
            response.put("message", "Verification requirements retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting verification requirements for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
