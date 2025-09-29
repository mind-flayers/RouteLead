package com.example.be.controller;

import com.example.be.model.Profile;
import com.example.be.service.CustomerVerificationService;
import com.example.be.service.FileUploadService;
import com.example.be.types.VerificationStatusEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for customer verification functionality
 * Handles photo uploads and verification status management for customers
 */
@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerVerificationController {

    private static final Logger log = LoggerFactory.getLogger(CustomerVerificationController.class);

    @Autowired
    private CustomerVerificationService customerVerificationService;

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload customer photo (NIC or Profile)
     */
    @PostMapping("/{customerId}/verification/upload")
    public ResponseEntity<Map<String, Object>> uploadPhoto(
            @PathVariable UUID customerId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("photoType") String photoType) {
        
        try {
            log.info("Upload photo request: customerId={}, photoType={}, fileSize={}", 
                    customerId, photoType, file.getSize());

            // Validate photo type
            if (!"nic".equalsIgnoreCase(photoType) && !"profile".equalsIgnoreCase(photoType)) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid photo type. Must be 'nic' or 'profile'");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file
            fileUploadService.validateFile(file);
            
            // Save file to Supabase Storage
            String filePath = fileUploadService.saveFileToSupabase(file, customerId, "customer_verification_" + photoType);
            
            // Update profile with photo URL
            Profile updatedProfile = customerVerificationService.uploadCustomerPhoto(customerId, photoType, filePath);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", photoType.substring(0, 1).toUpperCase() + photoType.substring(1) + " photo uploaded successfully");
            response.put("photoUrl", filePath);
            response.put("photoType", photoType);
            
            // Add verification status info
            Map<String, Object> verificationInfo = customerVerificationService.getCustomerVerificationStatus(customerId);
            response.put("verificationInfo", verificationInfo);
            
            log.info("Photo uploaded successfully: customerId={}, photoType={}, filePath={}", 
                    customerId, photoType, filePath);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request for photo upload: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("Error uploading customer photo: customerId={}, photoType={}", customerId, photoType, e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to upload photo. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Submit customer for verification
     */
    @PostMapping("/{customerId}/verification/submit")
    public ResponseEntity<Map<String, Object>> submitForVerification(@PathVariable UUID customerId) {
        
        try {
            log.info("Submit verification request: customerId={}", customerId);

            // Submit customer for verification
            Profile updatedProfile = customerVerificationService.submitCustomerForVerification(customerId);
            
            // Get updated verification status
            Map<String, Object> verificationStatus = customerVerificationService.getCustomerVerificationStatus(customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Verification submitted successfully! We will review your documents shortly.");
            response.put("verificationStatus", updatedProfile.getVerificationStatus().name());
            response.put("isVerified", updatedProfile.getIsVerified());
            response.put("verificationInfo", verificationStatus);
            
            log.info("Customer verification submitted successfully: customerId={}, status={}", 
                    customerId, updatedProfile.getVerificationStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error submitting customer for verification: customerId={}, error={}", customerId, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("Unexpected error submitting customer for verification: customerId={}", customerId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to submit for verification. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get customer verification status
     */
    @GetMapping("/{customerId}/verification/status")
    public ResponseEntity<Map<String, Object>> getVerificationStatus(@PathVariable UUID customerId) {
        
        try {
            log.info("Get verification status request: customerId={}", customerId);

            Map<String, Object> verificationStatus = customerVerificationService.getCustomerVerificationStatus(customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", verificationStatus);
            response.put("message", "Verification status retrieved successfully");
            
            log.info("Customer verification status retrieved: customerId={}, verificationStatus={}", 
                    customerId, verificationStatus.get("verificationStatus"));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error getting customer verification status: customerId={}, error={}", customerId, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("Unexpected error getting customer verification status: customerId={}", customerId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to get verification status. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get verification requirements for customer
     */
    @GetMapping("/{customerId}/verification/requirements")
    public ResponseEntity<Map<String, Object>> getVerificationRequirements(@PathVariable UUID customerId) {
        
        try {
            log.info("Get verification requirements request: customerId={}", customerId);

            Map<String, Object> requirements = customerVerificationService.getVerificationRequirements(customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", requirements);
            response.put("message", "Verification requirements retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting customer verification requirements: customerId={}", customerId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to get verification requirements. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Delete customer photo (for re-upload)
     */
    @DeleteMapping("/{customerId}/verification/photo/{photoType}")
    public ResponseEntity<Map<String, Object>> deletePhoto(
            @PathVariable UUID customerId,
            @PathVariable String photoType) {
        
        try {
            log.info("Delete photo request: customerId={}, photoType={}", customerId, photoType);

            Profile updatedProfile = customerVerificationService.deleteCustomerPhoto(customerId, photoType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", photoType.substring(0, 1).toUpperCase() + photoType.substring(1) + " photo deleted successfully");
            
            // Add updated verification status
            Map<String, Object> verificationInfo = customerVerificationService.getCustomerVerificationStatus(customerId);
            response.put("verificationInfo", verificationInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request for photo deletion: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("Error deleting customer photo: customerId={}, photoType={}", customerId, photoType, e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete photo. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update customer verification status (Admin only)
     */
    @PatchMapping("/{customerId}/verification/status")
    public ResponseEntity<Map<String, Object>> updateVerificationStatus(
            @PathVariable UUID customerId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        
        try {
            log.info("Update verification status request: customerId={}, status={}", customerId, status);

            // Validate status
            VerificationStatusEnum verificationStatus;
            try {
                verificationStatus = VerificationStatusEnum.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Invalid verification status. Valid values: PENDING, APPROVED, REJECTED");
                return ResponseEntity.badRequest().body(response);
            }

            Profile updatedProfile = customerVerificationService.updateCustomerVerificationStatus(customerId, verificationStatus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Customer verification status updated successfully");
            response.put("verificationStatus", updatedProfile.getVerificationStatus().name());
            response.put("isVerified", updatedProfile.getIsVerified());
            
            log.info("Customer verification status updated: customerId={}, newStatus={}", 
                    customerId, verificationStatus);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating customer verification status: customerId={}, status={}", customerId, status, e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to update verification status. Please try again.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}