package com.example.be.service;

import com.example.be.model.Profile;
import com.example.be.model.UserRole;
import com.example.be.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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
        profile.setId(userId);
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
} 