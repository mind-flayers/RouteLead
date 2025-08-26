package com.example.be.controller;

import com.example.be.dto.ProfileDto;
import com.example.be.dto.ProfileUpdateDto;
import com.example.be.types.VerificationStatusEnum;
import com.example.be.service.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private ProfileService profileService;

    /**
     * Get driver profile by ID
     */
    @GetMapping("/{driverId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable UUID driverId) {
        try {
            ProfileDto profile = profileService.getProfileById(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", profile);
            response.put("message", "Profile retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving profile for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update driver profile
     */
    @PutMapping("/{driverId}")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @PathVariable UUID driverId,
            @Valid @RequestBody ProfileUpdateDto profileUpdateDto) {
        
        try {
            ProfileDto updatedProfile = profileService.convertToDto(
                profileService.updatePersonalInformation(driverId, profileUpdateDto)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", updatedProfile);
            response.put("message", "Profile updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error updating profile for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Check if personal information is complete
     */
    @GetMapping("/{driverId}/personal-info/completeness")
    public ResponseEntity<Map<String, Object>> checkPersonalInfoCompleteness(@PathVariable UUID driverId) {
        try {
            boolean isComplete = profileService.checkPersonalInformationCompleteness(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", Map.of("isComplete", isComplete));
            response.put("message", "Personal information completeness checked");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error checking personal info completeness for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get verification status
     */
    @GetMapping("/{driverId}/verification/status")
    public ResponseEntity<Map<String, Object>> getVerificationStatus(@PathVariable UUID driverId) {
        try {
            ProfileDto profile = profileService.getProfileById(driverId);
            
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("isVerified", profile.getIsVerified());
            statusData.put("personalInfoComplete", profileService.checkPersonalInformationCompleteness(driverId));
            statusData.put("verificationStatus", profile.getVerificationStatus());
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", statusData);
            response.put("message", "Verification status retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error getting verification status for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Submit profile for verification
     */
    @PostMapping("/{driverId}/verification/submit")
    public ResponseEntity<Map<String, Object>> submitForVerification(@PathVariable UUID driverId) {
        try {
            ProfileDto updatedProfile = profileService.convertToDto(
                profileService.submitForVerification(driverId)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", updatedProfile);
            response.put("message", "Profile submitted for verification successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error submitting verification for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update verification status (Admin only)
     */
    @PatchMapping("/{driverId}/verification/status")
    public ResponseEntity<Map<String, Object>> updateVerificationStatus(
            @PathVariable UUID driverId,
            @RequestParam String status,
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
            
            ProfileDto updatedProfile = profileService.convertToDto(
                profileService.updateVerificationStatus(driverId, verificationStatus)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", updatedProfile);
            response.put("message", "Verification status updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error updating verification status for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get verification requirements status
     */
    @GetMapping("/{driverId}/verification/requirements")
    public ResponseEntity<Map<String, Object>> getVerificationRequirements(@PathVariable UUID driverId) {
        try {
            ProfileDto profile = profileService.getProfileById(driverId);
            
            Map<String, Object> requirements = new HashMap<>();
            requirements.put("personalInfoComplete", profileService.checkPersonalInformationCompleteness(driverId));
            requirements.put("canStartVerification", profileService.checkPersonalInformationCompleteness(driverId));
            requirements.put("isVerified", profile.getIsVerified());
            
            // Add missing fields if personal info is incomplete
            if (!profileService.checkPersonalInformationCompleteness(driverId)) {
                requirements.put("missingFields", getMissingPersonalInfoFields(profile));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", requirements);
            response.put("message", "Verification requirements retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error getting verification requirements for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Helper method to get missing personal info fields
     */
    private java.util.List<String> getMissingPersonalInfoFields(ProfileDto profile) {
        java.util.List<String> missingFields = new java.util.ArrayList<>();
        
        if (profile.getFirstName() == null || profile.getFirstName().trim().isEmpty()) {
            missingFields.add("firstName");
        }
        if (profile.getLastName() == null || profile.getLastName().trim().isEmpty()) {
            missingFields.add("lastName");
        }
        if (profile.getNicNumber() == null || profile.getNicNumber().trim().isEmpty()) {
            missingFields.add("nicNumber");
        }
        if (profile.getPhoneNumber() == null || profile.getPhoneNumber().trim().isEmpty()) {
            missingFields.add("phoneNumber");
        }
        
        return missingFields;
    }

    /**
     * Get bank details for a driver
     */
    @GetMapping("/{driverId}/bank-details")
    public ResponseEntity<Map<String, Object>> getBankDetails(@PathVariable UUID driverId) {
        try {
            log.info("Getting bank details for driver: {}", driverId);
            
            Map<String, Object> bankDetails = profileService.getBankDetails(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", bankDetails);
            response.put("message", "Bank details retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error retrieving bank details for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update bank details for a driver
     */
    @PutMapping("/{driverId}/bank-details")
    public ResponseEntity<Map<String, Object>> updateBankDetails(
            @PathVariable UUID driverId,
            @Valid @RequestBody com.example.be.dto.BankDetailsDto bankDetails) {
        try {
            log.info("Updating bank details for driver: {}", driverId);
            
            Map<String, Object> updatedBankDetails = profileService.updateBankDetails(driverId, bankDetails);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", updatedBankDetails);
            response.put("message", "Bank details updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error updating bank details for driver: {}", driverId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
