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
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public ProfileService(ProfileRepository profileRepository, JdbcTemplate jdbcTemplate) {
        this.profileRepository = profileRepository;
        this.jdbcTemplate = jdbcTemplate;
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
     * Update personal information for verification using native SQL
     */
    @Transactional
    public Profile updatePersonalInformation(UUID userId, ProfileUpdateDto updateDto) {
        // Build dynamic SQL query based on provided fields
        List<String> setClause = new ArrayList<>();
        List<Object> params = new ArrayList<>();
        
        if (updateDto.getFirstName() != null) {
            setClause.add("first_name = ?");
            params.add(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null) {
            setClause.add("last_name = ?");
            params.add(updateDto.getLastName());
        }
        if (updateDto.getPhoneNumber() != null) {
            setClause.add("phone_number = ?");
            params.add(updateDto.getPhoneNumber());
        }
        if (updateDto.getNicNumber() != null) {
            setClause.add("nic_number = ?");
            params.add(updateDto.getNicNumber());
        }
        if (updateDto.getDateOfBirth() != null) {
            setClause.add("date_of_birth = ?");
            params.add(updateDto.getDateOfBirth());
        }
        if (updateDto.getGender() != null) {
            setClause.add("gender = ?::gender_enum");
            params.add(updateDto.getGender().name());
        }
        if (updateDto.getAddressLine1() != null) {
            setClause.add("address_line_1 = ?");
            params.add(updateDto.getAddressLine1());
        }
        if (updateDto.getAddressLine2() != null) {
            setClause.add("address_line_2 = ?");
            params.add(updateDto.getAddressLine2());
        }
        if (updateDto.getCity() != null) {
            setClause.add("city = ?");
            params.add(updateDto.getCity());
        }
        if (updateDto.getDriverLicenseNumber() != null) {
            setClause.add("driver_license_number = ?");
            params.add(updateDto.getDriverLicenseNumber());
        }
        if (updateDto.getLicenseExpiryDate() != null) {
            setClause.add("license_expiry_date = ?");
            params.add(updateDto.getLicenseExpiryDate());
        }
        if (updateDto.getEmail() != null) {
            setClause.add("email = ?");
            params.add(updateDto.getEmail());
        }
        
        // Always update the updated_at timestamp
        setClause.add("updated_at = CURRENT_TIMESTAMP");
        
        if (!setClause.isEmpty()) {
            String sql = "UPDATE profiles SET " + String.join(", ", setClause) + " WHERE id = ?";
            params.add(userId);
            
            jdbcTemplate.update(sql, params.toArray());
        }
        
        // Return the updated profile
        return getProfile(userId);
    }

    /**
     * Submit profile for verification
     */
    @Transactional
    public Profile submitForVerification(UUID userId) {
        // Check if personal information is complete
        if (!checkPersonalInformationCompleteness(userId)) {
            throw new RuntimeException("Personal information must be complete before submitting for verification");
        }
        
        // Use native SQL to avoid enum casting issues
        int updatedRows = profileRepository.updateVerificationStatus(
            userId, 
            VerificationStatusEnum.PENDING.name(), 
            false
        );
        
        if (updatedRows == 0) {
            throw new RuntimeException("Failed to update verification status for user: " + userId);
        }
        
        // Return the updated profile
        return getProfile(userId);
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

    /**
     * Get verification status data for API response
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getVerificationStatus(UUID userId) {
        Profile profile = getProfile(userId);
        boolean personalInfoComplete = checkPersonalInformationCompleteness(userId);
        
        Map<String, Object> statusData = new HashMap<>();
        statusData.put("isVerified", profile.getIsVerified());
        statusData.put("personalInfoComplete", personalInfoComplete);
        statusData.put("verificationStatus", profile.getVerificationStatus() != null ? 
            profile.getVerificationStatus().name() : null);
        
        return statusData;
    }

    /**
     * Set profile verified status
     */
    @Transactional
    public Profile setProfileVerified(UUID userId, boolean isVerified) {
        Profile profile = getProfile(userId);
        profile.setIsVerified(isVerified);
        return profileRepository.save(profile);
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
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setGender(profile.getGender());
        dto.setAddressLine1(profile.getAddressLine1());
        dto.setAddressLine2(profile.getAddressLine2());
        dto.setCity(profile.getCity());
        dto.setVerificationStatus(profile.getVerificationStatus());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }

    /**
     * Get bank details for a driver
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBankDetails(UUID driverId) {
        String sql = "SELECT bank_account_details FROM profiles WHERE id = ?";
        
        try {
            String bankDetailsJson = jdbcTemplate.queryForObject(sql, String.class, driverId);
            
            if (bankDetailsJson == null || bankDetailsJson.trim().isEmpty()) {
                return new HashMap<>();
            }
            
            // Parse JSON to Map
            ObjectMapper objectMapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> result = objectMapper.readValue(bankDetailsJson, Map.class);
            return result;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve bank details", e);
        }
    }

    /**
     * Update bank details for a driver
     */
    @Transactional
    public Map<String, Object> updateBankDetails(UUID driverId, com.example.be.dto.BankDetailsDto bankDetails) {
        try {
            // Convert DTO to JSON
            ObjectMapper objectMapper = new ObjectMapper();
            String bankDetailsJson = objectMapper.writeValueAsString(bankDetails);
            
            String sql = "UPDATE profiles SET bank_account_details = ?::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            
            int rowsUpdated = jdbcTemplate.update(sql, bankDetailsJson, driverId);
            
            if (rowsUpdated == 0) {
                throw new RuntimeException("Profile not found: " + driverId);
            }
            
            // Return the updated bank details
            return getBankDetails(driverId);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to update bank details", e);
        }
    }
}