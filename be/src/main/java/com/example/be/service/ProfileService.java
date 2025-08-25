package com.example.be.service;

import com.example.be.model.Profile;
import com.example.be.types.UserRole;
import com.example.be.types.VerificationStatusEnum;
import com.example.be.repository.ProfileRepository;
import com.example.be.dto.ProfileDto;
import com.example.be.dto.ProfileUpdateDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;

    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional
    public Profile createProfile(UUID userId, String email, UserRole role) {
        Profile profile = new Profile();
        profile.setEmail(email);
        profile.setRole(role);
        return profileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public Profile getProfile(UUID userId) {
        return profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public Profile updateProfile(UUID userId, Profile updatedProfile) {
        Profile existingProfile = getProfile(userId);
        
        existingProfile.setFirstName(updatedProfile.getFirstName());
        existingProfile.setLastName(updatedProfile.getLastName());
        existingProfile.setPhoneNumber(updatedProfile.getPhoneNumber());
        
        return profileRepository.save(existingProfile);
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Profile profile) {
        return profile.getRole() == UserRole.ADMIN;
    }

    @Transactional(readOnly = true)
    public boolean isDriver(Profile profile) {
        return profile.getRole() == UserRole.DRIVER;
    }

    @Transactional(readOnly = true)
    public boolean isCustomer(Profile profile) {
        return profile.getRole() == UserRole.CUSTOMER;
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfileById(UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        ProfileDto dto = new ProfileDto();
        dto.setId(profile.getId());
        dto.setEmail(profile.getEmail());
        dto.setRole(profile.getRole());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setNicNumber(profile.getNicNumber());
        dto.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        dto.setIsVerified(profile.getIsVerified());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ProfileDto> getAllProfiles() {
        List<Profile> profiles = profileRepository.findAll();
        return profiles.stream()
                .map(profile -> {
                    ProfileDto dto = new ProfileDto();
                    dto.setId(profile.getId());
                    dto.setEmail(profile.getEmail());
                    dto.setRole(profile.getRole());
                    dto.setFirstName(profile.getFirstName());
                    dto.setLastName(profile.getLastName());
                    dto.setPhoneNumber(profile.getPhoneNumber());
                    dto.setNicNumber(profile.getNicNumber());
                    dto.setProfilePhotoUrl(profile.getProfilePhotoUrl());
                    dto.setIsVerified(profile.getIsVerified());
                    dto.setCreatedAt(profile.getCreatedAt());
                    dto.setUpdatedAt(profile.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // New methods for additional database fetching

    @Transactional(readOnly = true)
    public List<ProfileDto> getProfilesByRole(UserRole role) {
        List<Profile> profiles = profileRepository.findByRole(role);
        return profiles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfileDto> getVerifiedProfiles() {
        List<Profile> profiles = profileRepository.findByIsVerifiedTrue();
        return profiles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfileDto> getProfilesByCity(String city) {
        List<Profile> profiles = profileRepository.findByCity(city);
        return profiles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfileDto> getProfilesByRoleAndVerification(UserRole role, Boolean isVerified) {
        List<Profile> profiles = profileRepository.findByRoleAndIsVerified(role, isVerified);
        return profiles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfileDto> searchProfilesByName(String name) {
        List<Profile> profiles = profileRepository.findByNameContainingIgnoreCase(name);
        return profiles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getProfileCountByRole(UserRole role) {
        return profileRepository.countByRole(role);
    }

    /**
     * Update verification status of a profile
     */
    @Transactional
    public Profile updateVerificationStatus(UUID userId, VerificationStatusEnum status) {
        Profile profile = getProfile(userId);
        profile.setVerificationStatus(status);
        
        // If approved, set isVerified to true
        if (status == VerificationStatusEnum.APPROVED) {
            profile.setIsVerified(true);
        } else {
            profile.setIsVerified(false);
        }
        
        return profileRepository.save(profile);
    }

    /**
     * Get verification status for a driver
     */
    @Transactional(readOnly = true)
    public VerificationStatusEnum getDriverVerificationStatus(UUID userId) {
        Profile profile = getProfile(userId);
        return profile.getVerificationStatus();
    }

    /**
     * Check if personal information is complete
     */
    @Transactional(readOnly = true)
    public boolean checkPersonalInformationCompleteness(UUID userId) {
        Profile profile = getProfile(userId);
        
        // Required fields for verification
        return profile.getFirstName() != null && !profile.getFirstName().trim().isEmpty() &&
               profile.getLastName() != null && !profile.getLastName().trim().isEmpty() &&
               profile.getPhoneNumber() != null && !profile.getPhoneNumber().trim().isEmpty() &&
               profile.getNicNumber() != null && !profile.getNicNumber().trim().isEmpty() &&
               profile.getDateOfBirth() != null &&
               profile.getAddressLine1() != null && !profile.getAddressLine1().trim().isEmpty() &&
               profile.getCity() != null && !profile.getCity().trim().isEmpty();
    }

    /**
     * Update personal information for verification
     */
    @Transactional
    public Profile updatePersonalInformation(UUID userId, ProfileUpdateDto updateDto) {
        Profile profile = getProfile(userId);
        
        if (updateDto.getFirstName() != null) {
            profile.setFirstName(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null) {
            profile.setLastName(updateDto.getLastName());
        }
        if (updateDto.getPhoneNumber() != null) {
            profile.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getNicNumber() != null) {
            profile.setNicNumber(updateDto.getNicNumber());
        }
        if (updateDto.getDateOfBirth() != null) {
            profile.setDateOfBirth(updateDto.getDateOfBirth());
        }
        if (updateDto.getGender() != null) {
            profile.setGender(updateDto.getGender());
        }
        if (updateDto.getAddressLine1() != null) {
            profile.setAddressLine1(updateDto.getAddressLine1());
        }
        if (updateDto.getAddressLine2() != null) {
            profile.setAddressLine2(updateDto.getAddressLine2());
        }
        if (updateDto.getCity() != null) {
            profile.setCity(updateDto.getCity());
        }
        if (updateDto.getDriverLicenseNumber() != null) {
            profile.setDriverLicenseNumber(updateDto.getDriverLicenseNumber());
        }
        if (updateDto.getLicenseExpiryDate() != null) {
            profile.setLicenseExpiryDate(updateDto.getLicenseExpiryDate());
        }
        
        return profileRepository.save(profile);
    }

    /**
     * Submit profile for verification
     */
    @Transactional
    public Profile submitForVerification(UUID userId) {
        Profile profile = getProfile(userId);
        
        // Check if personal information is complete
        if (!checkPersonalInformationCompleteness(userId)) {
            throw new RuntimeException("Personal information must be complete before submitting for verification");
        }
        
        profile.setVerificationStatus(VerificationStatusEnum.PENDING);
        profile.setIsVerified(false);
        
        return profileRepository.save(profile);
    }

    /**
     * Get list of missing personal information fields
     */
    @Transactional(readOnly = true)
    public List<String> getMissingPersonalInfoFields(UUID userId) {
        Profile profile = getProfile(userId);
        List<String> missingFields = new ArrayList<>();
        
        if (profile.getFirstName() == null || profile.getFirstName().trim().isEmpty()) {
            missingFields.add("firstName");
        }
        if (profile.getLastName() == null || profile.getLastName().trim().isEmpty()) {
            missingFields.add("lastName");
        }
        if (profile.getPhoneNumber() == null || profile.getPhoneNumber().trim().isEmpty()) {
            missingFields.add("phoneNumber");
        }
        if (profile.getNicNumber() == null || profile.getNicNumber().trim().isEmpty()) {
            missingFields.add("nicNumber");
        }
        if (profile.getDateOfBirth() == null) {
            missingFields.add("dateOfBirth");
        }
        if (profile.getAddressLine1() == null || profile.getAddressLine1().trim().isEmpty()) {
            missingFields.add("addressLine1");
        }
        if (profile.getCity() == null || profile.getCity().trim().isEmpty()) {
            missingFields.add("city");
        }
        
        return missingFields;
    }

    // Helper method to convert Profile to ProfileDto
    public ProfileDto convertToDto(Profile profile) {
        ProfileDto dto = new ProfileDto();
        dto.setId(profile.getId());
        dto.setEmail(profile.getEmail());
        dto.setRole(profile.getRole());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setNicNumber(profile.getNicNumber());
        dto.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        dto.setIsVerified(profile.getIsVerified());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }
}