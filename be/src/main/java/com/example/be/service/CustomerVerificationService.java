package com.example.be.service;

import com.example.be.model.Profile;
import com.example.be.repository.ProfileRepository;
import com.example.be.types.VerificationStatusEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing customer verification process
 * Handles photo uploads and verification status management for customers
 */
@Service
public class CustomerVerificationService {

    private static final Logger log = LoggerFactory.getLogger(CustomerVerificationService.class);

    private final ProfileRepository profileRepository;
    private final ProfileService profileService;
    private final FileUploadService fileUploadService;

    @Autowired
    public CustomerVerificationService(ProfileRepository profileRepository, 
                                     ProfileService profileService,
                                     FileUploadService fileUploadService) {
        this.profileRepository = profileRepository;
        this.profileService = profileService;
        this.fileUploadService = fileUploadService;
    }

    /**
     * Upload customer photo (NIC or Profile) to Supabase and update profile
     */
    @Transactional
    public Profile uploadCustomerPhoto(UUID customerId, String photoType, String photoUrl) {
        log.info("Uploading customer photo: customerId={}, photoType={}", customerId, photoType);

        Profile customer = profileRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        // Validate photo type
        if (!"nic".equalsIgnoreCase(photoType) && !"profile".equalsIgnoreCase(photoType)) {
            throw new IllegalArgumentException("Invalid photo type. Must be 'nic' or 'profile'");
        }

        // Update the appropriate field in profile
        if ("nic".equalsIgnoreCase(photoType)) {
            customer.setFacePhotoUrl(photoUrl);
            log.info("Updated NIC/face photo URL for customer: {}", customerId);
        } else if ("profile".equalsIgnoreCase(photoType)) {
            customer.setProfilePhotoUrl(photoUrl);
            log.info("Updated profile photo URL for customer: {}", customerId);
        }

        // Save updated profile
        Profile savedProfile = profileRepository.save(customer);
        log.info("Customer photo uploaded successfully: customerId={}, photoType={}", customerId, photoType);
        
        return savedProfile;
    }

    /**
     * Submit customer for verification
     * Sets verification status to PENDING if required photos are uploaded
     */
    @Transactional
    public Profile submitCustomerForVerification(UUID customerId) {
        log.info("Submitting customer for verification: {}", customerId);

        // Validate that required photos are uploaded
        if (!hasRequiredPhotos(customerId)) {
            throw new RuntimeException("Cannot submit for verification: Required photos are missing. Please upload both NIC photo and profile photo.");
        }

        // Use ProfileService to submit for verification (reuses existing logic)
        Profile updatedProfile = profileService.submitForVerification(customerId);
        
        log.info("Customer submitted for verification successfully: customerId={}, status={}", 
                customerId, updatedProfile.getVerificationStatus());
        
        return updatedProfile;
    }

    /**
     * Get customer verification status with photo information
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCustomerVerificationStatus(UUID customerId) {
        log.info("Getting customer verification status: {}", customerId);

        Profile customer = profileRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        Map<String, Object> statusData = new HashMap<>();
        statusData.put("customerId", customerId);
        statusData.put("verificationStatus", customer.getVerificationStatus() != null ? 
                customer.getVerificationStatus().name() : null);
        statusData.put("isVerified", customer.getIsVerified());
        statusData.put("hasProfilePhoto", customer.getProfilePhotoUrl() != null && !customer.getProfilePhotoUrl().trim().isEmpty());
        statusData.put("hasNicPhoto", customer.getFacePhotoUrl() != null && !customer.getFacePhotoUrl().trim().isEmpty());
        statusData.put("profilePhotoUrl", customer.getProfilePhotoUrl());
        statusData.put("nicPhotoUrl", customer.getFacePhotoUrl());
        statusData.put("hasRequiredPhotos", hasRequiredPhotos(customerId));

        // Add personal info completeness check
        boolean personalInfoComplete = profileService.checkPersonalInformationCompleteness(customerId);
        statusData.put("personalInfoComplete", personalInfoComplete);

        log.info("Customer verification status retrieved: customerId={}, status={}, hasRequiredPhotos={}", 
                customerId, customer.getVerificationStatus(), hasRequiredPhotos(customerId));

        return statusData;
    }

    /**
     * Check if customer has uploaded all required photos
     */
    @Transactional(readOnly = true)
    public boolean hasRequiredPhotos(UUID customerId) {
        Profile customer = profileRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        boolean hasProfilePhoto = customer.getProfilePhotoUrl() != null && !customer.getProfilePhotoUrl().trim().isEmpty();
        boolean hasNicPhoto = customer.getFacePhotoUrl() != null && !customer.getFacePhotoUrl().trim().isEmpty();

        log.debug("Customer photo status: customerId={}, hasProfilePhoto={}, hasNicPhoto={}", 
                customerId, hasProfilePhoto, hasNicPhoto);

        return hasProfilePhoto && hasNicPhoto;
    }

    /**
     * Get customer photo URLs
     */
    @Transactional(readOnly = true)
    public Map<String, String> getCustomerPhotos(UUID customerId) {
        Profile customer = profileRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        Map<String, String> photos = new HashMap<>();
        photos.put("profilePhotoUrl", customer.getProfilePhotoUrl());
        photos.put("nicPhotoUrl", customer.getFacePhotoUrl());

        return photos;
    }

    /**
     * Update verification status (for admin use)
     */
    @Transactional
    public Profile updateCustomerVerificationStatus(UUID customerId, VerificationStatusEnum status) {
        log.info("Updating customer verification status: customerId={}, status={}", customerId, status);

        Profile updatedProfile = profileService.updateVerificationStatus(customerId, status);
        
        log.info("Customer verification status updated successfully: customerId={}, newStatus={}", 
                customerId, status);
        
        return updatedProfile;
    }

    /**
     * Get verification requirements for customer
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getVerificationRequirements(UUID customerId) {
        Map<String, Object> requirements = new HashMap<>();
        
        // Get current status
        Map<String, Object> currentStatus = getCustomerVerificationStatus(customerId);
        
        // Determine what's missing
        boolean hasProfilePhoto = (Boolean) currentStatus.get("hasProfilePhoto");
        boolean hasNicPhoto = (Boolean) currentStatus.get("hasNicPhoto");
        boolean personalInfoComplete = (Boolean) currentStatus.get("personalInfoComplete");
        
        requirements.put("personalInfoComplete", personalInfoComplete);
        requirements.put("profilePhotoRequired", !hasProfilePhoto);
        requirements.put("nicPhotoRequired", !hasNicPhoto);
        requirements.put("canSubmit", hasProfilePhoto && hasNicPhoto && personalInfoComplete);
        
        // Get missing personal info fields if needed
        if (!personalInfoComplete) {
            requirements.put("missingPersonalInfoFields", profileService.getMissingPersonalInfoFields(customerId));
        }
        
        return requirements;
    }

    /**
     * Delete customer photo (for re-upload)
     */
    @Transactional
    public Profile deleteCustomerPhoto(UUID customerId, String photoType) {
        log.info("Deleting customer photo: customerId={}, photoType={}", customerId, photoType);

        Profile customer = profileRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        String oldPhotoUrl = null;
        
        if ("nic".equalsIgnoreCase(photoType)) {
            oldPhotoUrl = customer.getFacePhotoUrl();
            customer.setFacePhotoUrl(null);
        } else if ("profile".equalsIgnoreCase(photoType)) {
            oldPhotoUrl = customer.getProfilePhotoUrl();
            customer.setProfilePhotoUrl(null);
        } else {
            throw new IllegalArgumentException("Invalid photo type. Must be 'nic' or 'profile'");
        }

        // TODO: Delete file from Supabase Storage if needed
        // This would require extracting the file path from the URL
        
        Profile savedProfile = profileRepository.save(customer);
        log.info("Customer photo deleted successfully: customerId={}, photoType={}", customerId, photoType);
        
        return savedProfile;
    }
}